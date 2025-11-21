import { useState, useEffect } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import api from '../../api'

export default function AssetInsuranceTab({ asset, onUpdate }) {
  const [insurancePolicies, setInsurancePolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)

  useEffect(() => {
    loadInsurance()
  }, [asset.id])

  const loadInsurance = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/assets/${asset.id}/insurance`)
      setInsurancePolicies(response.insurance_policies || [])
    } catch (error) {
      console.error('Failed to load insurance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPolicy = () => {
    setEditingPolicy(null)
    setShowForm(true)
  }

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy)
    setShowForm(true)
  }

  const handleDeletePolicy = async (policyId) => {
    if (!confirm('Are you sure you want to delete this insurance policy?')) {
      return
    }

    try {
      await api.delete(`/api/v1/asset_insurance/${policyId}`)
      await loadInsurance()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to delete insurance policy:', error)
      alert('Failed to delete insurance policy')
    }
  }

  const handleSavePolicy = async (formData) => {
    try {
      if (editingPolicy) {
        await api.put(`/api/v1/asset_insurance/${editingPolicy.id}`, {
          insurance: formData
        })
      } else {
        await api.post(`/api/v1/asset_insurance`, {
          insurance: { ...formData, asset_id: asset.id }
        })
      }
      setShowForm(false)
      setEditingPolicy(null)
      await loadInsurance()
      if (onUpdate) onUpdate()
    } catch (error) {
      throw error
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading insurance...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Insurance Policies</h3>
        {!showForm && (
          <button
            onClick={handleAddPolicy}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Policy
          </button>
        )}
      </div>

      {showForm ? (
        <InsurancePolicyForm
          policy={editingPolicy}
          onSave={handleSavePolicy}
          onCancel={() => {
            setShowForm(false)
            setEditingPolicy(null)
          }}
        />
      ) : insurancePolicies.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No insurance policies</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding an insurance policy.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insurancePolicies.map((policy) => {
            const expiringSoon = isExpiringSoon(policy.expiry_date)
            const expired = isExpired(policy.expiry_date)

            return (
              <div
                key={policy.id}
                className={`bg-white border rounded-lg p-4 hover:border-indigo-300 transition-colors ${
                  expired ? 'border-red-300' : expiringSoon ? 'border-orange-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">
                        {policy.insurance_company}
                      </h4>
                      {expired && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Expired
                        </span>
                      )}
                      {!expired && expiringSoon && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Policy Number:</span> {policy.policy_number}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {policy.insurance_type}
                      </div>
                      <div>
                        <span className="font-medium">Premium:</span> {formatCurrency(policy.premium_amount)}
                        {policy.premium_frequency && ` (${policy.premium_frequency})`}
                      </div>
                      <div>
                        <span className="font-medium">Coverage:</span> {formatCurrency(policy.coverage_amount)}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span>{' '}
                        {new Date(policy.start_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Expiry Date:</span>{' '}
                        {new Date(policy.expiry_date).toLocaleDateString()}
                      </div>
                    </div>
                    {policy.notes && (
                      <p className="mt-2 text-sm text-gray-500">{policy.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditPolicy(policy)}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InsurancePolicyForm({ policy, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    insurance_company: policy?.insurance_company || '',
    policy_number: policy?.policy_number || '',
    insurance_type: policy?.insurance_type || '',
    start_date: policy?.start_date || '',
    expiry_date: policy?.expiry_date || '',
    premium_amount: policy?.premium_amount || '',
    premium_frequency: policy?.premium_frequency || 'annual',
    coverage_amount: policy?.coverage_amount || '',
    notes: policy?.notes || ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const frequencies = ['monthly', 'quarterly', 'semi_annual', 'annual']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.insurance_company.trim()) {
      newErrors.insurance_company = 'Insurance company is required'
    }
    if (!formData.policy_number.trim()) {
      newErrors.policy_number = 'Policy number is required'
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }
    if (!formData.expiry_date) {
      newErrors.expiry_date = 'Expiry date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ submit: error.message || 'Failed to save insurance policy' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">
        {policy ? 'Edit Insurance Policy' : 'Add Insurance Policy'}
      </h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="insurance_company" className="block text-sm font-medium text-gray-700">
            Insurance Company *
          </label>
          <input
            type="text"
            name="insurance_company"
            id="insurance_company"
            required
            value={formData.insurance_company}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.insurance_company ? 'border-red-300' : ''
            }`}
          />
          {errors.insurance_company && <p className="mt-1 text-sm text-red-600">{errors.insurance_company}</p>}
        </div>

        <div>
          <label htmlFor="policy_number" className="block text-sm font-medium text-gray-700">
            Policy Number *
          </label>
          <input
            type="text"
            name="policy_number"
            id="policy_number"
            required
            value={formData.policy_number}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.policy_number ? 'border-red-300' : ''
            }`}
          />
          {errors.policy_number && <p className="mt-1 text-sm text-red-600">{errors.policy_number}</p>}
        </div>

        <div>
          <label htmlFor="insurance_type" className="block text-sm font-medium text-gray-700">
            Insurance Type
          </label>
          <input
            type="text"
            name="insurance_type"
            id="insurance_type"
            placeholder="e.g., Comprehensive, Third Party"
            value={formData.insurance_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="premium_frequency" className="block text-sm font-medium text-gray-700">
            Premium Frequency
          </label>
          <select
            name="premium_frequency"
            id="premium_frequency"
            value={formData.premium_frequency}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {frequencies.map((freq) => (
              <option key={freq} value={freq}>
                {freq.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Start Date *
          </label>
          <input
            type="date"
            name="start_date"
            id="start_date"
            required
            value={formData.start_date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.start_date ? 'border-red-300' : ''
            }`}
          />
          {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
        </div>

        <div>
          <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
            Expiry Date *
          </label>
          <input
            type="date"
            name="expiry_date"
            id="expiry_date"
            required
            value={formData.expiry_date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.expiry_date ? 'border-red-300' : ''
            }`}
          />
          {errors.expiry_date && <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>}
        </div>

        <div>
          <label htmlFor="premium_amount" className="block text-sm font-medium text-gray-700">
            Premium Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="premium_amount"
              id="premium_amount"
              step="0.01"
              value={formData.premium_amount}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="coverage_amount" className="block text-sm font-medium text-gray-700">
            Coverage Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="coverage_amount"
              id="coverage_amount"
              step="0.01"
              value={formData.coverage_amount}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {errors.submit && (
        <p className="mt-4 text-sm text-red-600">{errors.submit}</p>
      )}

      <div className="mt-4 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : policy ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  )
}
