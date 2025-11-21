import { useState, useEffect } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import api from '../../api'

export default function AssetServiceHistoryTab({ asset, onUpdate }) {
  const [serviceRecords, setServiceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  useEffect(() => {
    loadServiceHistory()
  }, [asset.id])

  const loadServiceHistory = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/assets/${asset.id}/service_history`)
      setServiceRecords(response.service_records || [])
    } catch (error) {
      console.error('Failed to load service history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecord = () => {
    setEditingRecord(null)
    setShowForm(true)
  }

  const handleEditRecord = (record) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this service record?')) {
      return
    }

    try {
      await api.delete(`/api/v1/asset_service_history/${recordId}`)
      await loadServiceHistory()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to delete service record:', error)
      alert('Failed to delete service record')
    }
  }

  const handleSaveRecord = async (formData) => {
    try {
      if (editingRecord) {
        await api.put(`/api/v1/asset_service_history/${editingRecord.id}`, {
          service_record: formData
        })
      } else {
        await api.post(`/api/v1/asset_service_history`, {
          service_record: { ...formData, asset_id: asset.id }
        })
      }
      setShowForm(false)
      setEditingRecord(null)
      await loadServiceHistory()
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
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading service history...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Service History</h3>
        {!showForm && (
          <button
            onClick={handleAddRecord}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Service Record
          </button>
        )}
      </div>

      {showForm ? (
        <ServiceRecordForm
          record={editingRecord}
          onSave={handleSaveRecord}
          onCancel={() => {
            setShowForm(false)
            setEditingRecord(null)
          }}
        />
      ) : serviceRecords.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No service records</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a service record.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serviceRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">
                      {record.service_type}
                    </h4>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(record.service_date).toLocaleDateString()}
                    </span>
                  </div>
                  {record.description && (
                    <p className="mt-1 text-sm text-gray-500">{record.description}</p>
                  )}
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    {record.service_provider && (
                      <div>
                        <span className="font-medium">Provider:</span> {record.service_provider}
                      </div>
                    )}
                    {record.cost && (
                      <div>
                        <span className="font-medium">Cost:</span> {formatCurrency(record.cost)}
                      </div>
                    )}
                    {record.odometer_reading && (
                      <div>
                        <span className="font-medium">Odometer:</span> {record.odometer_reading.toLocaleString()} km
                      </div>
                    )}
                    {record.next_service_date && (
                      <div>
                        <span className="font-medium">Next Service:</span>{' '}
                        {new Date(record.next_service_date).toLocaleDateString()}
                      </div>
                    )}
                    {record.next_service_odometer && (
                      <div>
                        <span className="font-medium">Next Service Odometer:</span>{' '}
                        {record.next_service_odometer.toLocaleString()} km
                      </div>
                    )}
                  </div>
                  {record.notes && (
                    <p className="mt-2 text-sm text-gray-500 italic">{record.notes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditRecord(record)}
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
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

function ServiceRecordForm({ record, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    service_type: record?.service_type || '',
    service_date: record?.service_date || '',
    service_provider: record?.service_provider || '',
    description: record?.description || '',
    cost: record?.cost || '',
    odometer_reading: record?.odometer_reading || '',
    next_service_date: record?.next_service_date || '',
    next_service_odometer: record?.next_service_odometer || '',
    notes: record?.notes || ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const serviceTypes = [
    'Regular Service',
    'Oil Change',
    'Tire Rotation',
    'Brake Service',
    'Transmission Service',
    'Inspection',
    'Repair',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.service_type.trim()) {
      newErrors.service_type = 'Service type is required'
    }
    if (!formData.service_date) {
      newErrors.service_date = 'Service date is required'
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
      setErrors({ submit: error.message || 'Failed to save service record' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">
        {record ? 'Edit Service Record' : 'Add Service Record'}
      </h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="service_type" className="block text-sm font-medium text-gray-700">
            Service Type *
          </label>
          <select
            name="service_type"
            id="service_type"
            required
            value={formData.service_type}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.service_type ? 'border-red-300' : ''
            }`}
          >
            <option value="">Select type...</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.service_type && <p className="mt-1 text-sm text-red-600">{errors.service_type}</p>}
        </div>

        <div>
          <label htmlFor="service_date" className="block text-sm font-medium text-gray-700">
            Service Date *
          </label>
          <input
            type="date"
            name="service_date"
            id="service_date"
            required
            value={formData.service_date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.service_date ? 'border-red-300' : ''
            }`}
          />
          {errors.service_date && <p className="mt-1 text-sm text-red-600">{errors.service_date}</p>}
        </div>

        <div>
          <label htmlFor="service_provider" className="block text-sm font-medium text-gray-700">
            Service Provider
          </label>
          <input
            type="text"
            name="service_provider"
            id="service_provider"
            value={formData.service_provider}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
            Cost
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="cost"
              id="cost"
              step="0.01"
              value={formData.cost}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="odometer_reading" className="block text-sm font-medium text-gray-700">
            Odometer Reading (km)
          </label>
          <input
            type="number"
            name="odometer_reading"
            id="odometer_reading"
            value={formData.odometer_reading}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="next_service_odometer" className="block text-sm font-medium text-gray-700">
            Next Service Odometer (km)
          </label>
          <input
            type="number"
            name="next_service_odometer"
            id="next_service_odometer"
            value={formData.next_service_odometer}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="next_service_date" className="block text-sm font-medium text-gray-700">
            Next Service Date
          </label>
          <input
            type="date"
            name="next_service_date"
            id="next_service_date"
            value={formData.next_service_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
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
          {loading ? 'Saving...' : record ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  )
}
