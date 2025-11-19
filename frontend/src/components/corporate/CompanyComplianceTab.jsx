import { useState, useEffect } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import api from '../../api'

export default function CompanyComplianceTab({ company, onUpdate }) {
  const [complianceItems, setComplianceItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    loadComplianceItems()
  }, [company.id])

  const loadComplianceItems = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/companies/${company.id}/compliance_items`)
      setComplianceItems(response.compliance_items || [])
    } catch (error) {
      console.error('Failed to load compliance items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this compliance item?')) {
      return
    }

    try {
      await api.delete(`/api/v1/company_compliance_items/${itemId}`)
      await loadComplianceItems()
    } catch (error) {
      console.error('Failed to delete compliance item:', error)
      alert('Failed to delete compliance item')
    }
  }

  const handleCompleteItem = async (itemId) => {
    try {
      await api.post(`/api/v1/company_compliance_items/${itemId}/mark_complete`)
      await loadComplianceItems()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to complete item:', error)
      alert('Failed to complete compliance item')
    }
  }

  const handleSaveItem = async (formData) => {
    try {
      if (editingItem) {
        await api.put(`/api/v1/company_compliance_items/${editingItem.id}`, {
          compliance_item: formData
        })
      } else {
        await api.post(`/api/v1/company_compliance_items`, {
          compliance_item: { ...formData, company_id: company.id }
        })
      }
      setShowForm(false)
      setEditingItem(null)
      await loadComplianceItems()
      if (onUpdate) onUpdate()
    } catch (error) {
      throw error
    }
  }

  const getStatusBadge = (item) => {
    if (item.completed) {
      return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completed' }
    }
    if (item.is_overdue) {
      return { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'Overdue' }
    }
    if (item.days_until_due <= 7) {
      return { color: 'bg-orange-100 text-orange-800', icon: ExclamationTriangleIcon, text: 'Due Soon' }
    }
    return { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, text: 'Upcoming' }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading compliance items...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Compliance Items</h3>
        {!showForm && (
          <button
            onClick={handleAddItem}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Item
          </button>
        )}
      </div>

      {showForm ? (
        <ComplianceItemForm
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
        />
      ) : complianceItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No compliance items</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a compliance item.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complianceItems.map((item) => {
            const badge = getStatusBadge(item)
            const BadgeIcon = badge.icon

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                      <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
                        <BadgeIcon className="h-3 w-3 mr-1" />
                        {badge.text}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Due Date:</span>{' '}
                        {new Date(item.due_date).toLocaleDateString()}
                      </div>
                      {!item.completed && item.days_until_due !== null && (
                        <div>
                          <span className="font-medium">Days Until Due:</span>{' '}
                          {item.days_until_due}
                        </div>
                      )}
                      {item.completed && item.completed_at && (
                        <div>
                          <span className="font-medium">Completed:</span>{' '}
                          {new Date(item.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!item.completed && (
                      <button
                        onClick={() => handleCompleteItem(item.id)}
                        className="inline-flex items-center rounded-md bg-green-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleEditItem(item)}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
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

function ComplianceItemForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    due_date: item?.due_date || '',
    item_type: item?.item_type || 'asic_review',
    reminder_days: item?.reminder_days || '30,60,90'
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const itemTypes = [
    'asic_review',
    'tax_return',
    'financial_statements',
    'agm',
    'other'
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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
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
      setErrors({ submit: error.message || 'Failed to save compliance item' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">
        {item ? 'Edit Compliance Item' : 'Add Compliance Item'}
      </h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.title ? 'border-red-300' : ''
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="item_type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            name="item_type"
            id="item_type"
            value={formData.item_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {itemTypes.map((type) => (
              <option key={type} value={type}>
                {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
            Due Date *
          </label>
          <input
            type="date"
            name="due_date"
            id="due_date"
            required
            value={formData.due_date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.due_date ? 'border-red-300' : ''
            }`}
          />
          {errors.due_date && <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="reminder_days" className="block text-sm font-medium text-gray-700">
            Reminder Days (comma-separated)
          </label>
          <input
            type="text"
            name="reminder_days"
            id="reminder_days"
            placeholder="7,30,60,90"
            value={formData.reminder_days}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Days before due date to send reminders
          </p>
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
          {loading ? 'Saving...' : item ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  )
}
