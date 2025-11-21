import { useState, useEffect } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import api from '../../api'

export default function CompanyFinancialTab({ company, onUpdate }) {
  const [bankAccounts, setBankAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)

  useEffect(() => {
    loadBankAccounts()
  }, [company.id])

  const loadBankAccounts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/companies/${company.id}/bank_accounts`)
      setBankAccounts(response.bank_accounts || [])
    } catch (error) {
      console.error('Failed to load bank accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = () => {
    setEditingAccount(null)
    setShowForm(true)
  }

  const handleEditAccount = (account) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return
    }

    try {
      await api.delete(`/api/v1/bank_accounts/${accountId}`)
      await loadBankAccounts()
    } catch (error) {
      console.error('Failed to delete bank account:', error)
      alert('Failed to delete bank account')
    }
  }

  const handleSaveAccount = async (formData) => {
    try {
      if (editingAccount) {
        await api.put(`/api/v1/bank_accounts/${editingAccount.id}`, {
          bank_account: formData
        })
      } else {
        await api.post(`/api/v1/bank_accounts`, {
          bank_account: { ...formData, company_id: company.id }
        })
      }
      setShowForm(false)
      setEditingAccount(null)
      await loadBankAccounts()
      if (onUpdate) onUpdate()
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading financial information...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Bank Accounts</h3>
        {!showForm && (
          <button
            onClick={handleAddAccount}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Bank Account
          </button>
        )}
      </div>

      {showForm ? (
        <BankAccountForm
          account={editingAccount}
          onSave={handleSaveAccount}
          onCancel={() => {
            setShowForm(false)
            setEditingAccount(null)
          }}
        />
      ) : bankAccounts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No bank accounts</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a bank account.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">
                      {account.account_name}
                    </h4>
                    {account.is_primary && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Bank:</span> {account.bank_name}
                    </div>
                    <div>
                      <span className="font-medium">BSB:</span> {account.bsb}
                    </div>
                    <div>
                      <span className="font-medium">Account:</span> {account.account_number}
                    </div>
                    {account.account_type && (
                      <div>
                        <span className="font-medium">Type:</span> {account.account_type}
                      </div>
                    )}
                  </div>
                  {account.notes && (
                    <p className="mt-2 text-sm text-gray-500">{account.notes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BankAccountForm({ account, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    account_name: account?.account_name || '',
    bank_name: account?.bank_name || '',
    bsb: account?.bsb || '',
    account_number: account?.account_number || '',
    account_type: account?.account_type || '',
    is_primary: account?.is_primary || false,
    notes: account?.notes || ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.account_name.trim()) {
      newErrors.account_name = 'Account name is required'
    }
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required'
    }
    if (!formData.bsb.trim()) {
      newErrors.bsb = 'BSB is required'
    } else if (!/^\d{3}-?\d{3}$/.test(formData.bsb)) {
      newErrors.bsb = 'BSB must be in format XXX-XXX'
    }
    if (!formData.account_number.trim()) {
      newErrors.account_number = 'Account number is required'
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
      setErrors({ submit: error.message || 'Failed to save bank account' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">
        {account ? 'Edit Bank Account' : 'Add Bank Account'}
      </h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="account_name" className="block text-sm font-medium text-gray-700">
            Account Name *
          </label>
          <input
            type="text"
            name="account_name"
            id="account_name"
            required
            value={formData.account_name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.account_name ? 'border-red-300' : ''
            }`}
          />
          {errors.account_name && <p className="mt-1 text-sm text-red-600">{errors.account_name}</p>}
        </div>

        <div>
          <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
            Bank Name *
          </label>
          <input
            type="text"
            name="bank_name"
            id="bank_name"
            required
            value={formData.bank_name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.bank_name ? 'border-red-300' : ''
            }`}
          />
          {errors.bank_name && <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>}
        </div>

        <div>
          <label htmlFor="account_type" className="block text-sm font-medium text-gray-700">
            Account Type
          </label>
          <input
            type="text"
            name="account_type"
            id="account_type"
            placeholder="e.g., Business, Savings"
            value={formData.account_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="bsb" className="block text-sm font-medium text-gray-700">
            BSB *
          </label>
          <input
            type="text"
            name="bsb"
            id="bsb"
            required
            placeholder="123-456"
            value={formData.bsb}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.bsb ? 'border-red-300' : ''
            }`}
          />
          {errors.bsb && <p className="mt-1 text-sm text-red-600">{errors.bsb}</p>}
        </div>

        <div>
          <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
            Account Number *
          </label>
          <input
            type="text"
            name="account_number"
            id="account_number"
            required
            value={formData.account_number}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.account_number ? 'border-red-300' : ''
            }`}
          />
          {errors.account_number && <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>}
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_primary"
              id="is_primary"
              checked={formData.is_primary}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-900">
              Primary account
            </label>
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
          {loading ? 'Saving...' : account ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  )
}
