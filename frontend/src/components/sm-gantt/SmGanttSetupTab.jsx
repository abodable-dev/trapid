import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import {
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { api } from '../../api'

// Resources Sub-Tab
function ResourcesSubTab() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    resource_type: 'person',
    trade: '',
    hourly_rate: '',
    daily_rate: '',
    unit: '',
    unit_cost: '',
    availability_hours_per_day: '8',
    is_active: true
  })

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/sm_resources')
      setResources(response.resources || [])
    } catch (err) {
      console.error('Failed to load resources:', err)
      setError('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        sm_resource: {
          ...formData,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          availability_hours_per_day: formData.availability_hours_per_day ? parseFloat(formData.availability_hours_per_day) : 8
        }
      }

      if (editingResource) {
        await api.patch(`/api/v1/sm_resources/${editingResource.id}`, payload)
      } else {
        await api.post('/api/v1/sm_resources', payload)
      }

      await loadResources()
      resetForm()
    } catch (err) {
      console.error('Failed to save resource:', err)
      alert('Failed to save resource: ' + (err.message || 'Unknown error'))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    try {
      await api.delete(`/api/v1/sm_resources/${id}`)
      await loadResources()
    } catch (err) {
      console.error('Failed to delete resource:', err)
      alert('Failed to delete resource')
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      name: resource.name || '',
      code: resource.code || '',
      resource_type: resource.resource_type || 'person',
      trade: resource.trade || '',
      hourly_rate: resource.hourly_rate || '',
      daily_rate: resource.daily_rate || '',
      unit: resource.unit || '',
      unit_cost: resource.unit_cost || '',
      availability_hours_per_day: resource.availability_hours_per_day || '8',
      is_active: resource.is_active !== false
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingResource(null)
    setFormData({
      name: '',
      code: '',
      resource_type: 'person',
      trade: '',
      hourly_rate: '',
      daily_rate: '',
      unit: '',
      unit_cost: '',
      availability_hours_per_day: '8',
      is_active: true
    })
  }

  if (loading) {
    return <div className="p-4 text-gray-500">Loading resources...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Resources</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage people, equipment, and materials for schedule allocation
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add Resource
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            {editingResource ? 'Edit Resource' : 'New Resource'}
          </h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select
                value={formData.resource_type}
                onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="person">Person</option>
                <option value="equipment">Equipment</option>
                <option value="material">Material</option>
              </select>
            </div>
            {formData.resource_type === 'person' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Trade</label>
                  <input
                    type="text"
                    value={formData.trade}
                    onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                    placeholder="e.g., Carpenter, Electrician"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Availability (hrs/day)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.availability_hours_per_day}
                    onChange={(e) => setFormData({ ...formData, availability_hours_per_day: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}
            {formData.resource_type === 'equipment' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}
            {formData.resource_type === 'material' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., m3, kg, each"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                {editingResource ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {resources.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No resources found. Add your first resource to get started.
                </td>
              </tr>
            ) : (
              resources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{resource.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{resource.code || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      resource.resource_type === 'person' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      resource.resource_type === 'equipment' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {resource.resource_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{resource.trade || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {resource.hourly_rate ? `$${resource.hourly_rate}/hr` :
                     resource.daily_rate ? `$${resource.daily_rate}/day` :
                     resource.unit_cost ? `$${resource.unit_cost}/${resource.unit || 'unit'}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      resource.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {resource.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Hold Reasons Sub-Tab
function HoldReasonsSubTab() {
  const [holdReasons, setHoldReasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingReason, setEditingReason] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#ef4444',
    is_active: true
  })

  useEffect(() => {
    loadHoldReasons()
  }, [])

  const loadHoldReasons = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/sm_hold_reasons')
      setHoldReasons(response.hold_reasons || [])
    } catch (err) {
      console.error('Failed to load hold reasons:', err)
      setError('Failed to load hold reasons')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingReason) {
        await api.patch(`/api/v1/sm_hold_reasons/${editingReason.id}`, { sm_hold_reason: formData })
      } else {
        await api.post('/api/v1/sm_hold_reasons', { sm_hold_reason: formData })
      }
      await loadHoldReasons()
      resetForm()
    } catch (err) {
      console.error('Failed to save hold reason:', err)
      alert('Failed to save hold reason')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hold reason?')) return
    try {
      await api.delete(`/api/v1/sm_hold_reasons/${id}`)
      await loadHoldReasons()
    } catch (err) {
      console.error('Failed to delete hold reason:', err)
      alert('Failed to delete hold reason')
    }
  }

  const handleEdit = (reason) => {
    setEditingReason(reason)
    setFormData({
      name: reason.name || '',
      description: reason.description || '',
      color: reason.color || '#ef4444',
      is_active: reason.is_active !== false
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingReason(null)
    setFormData({
      name: '',
      description: '',
      color: '#ef4444',
      is_active: true
    })
  }

  if (loading) {
    return <div className="p-4 text-gray-500">Loading hold reasons...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Hold Reasons</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define reasons for putting tasks on hold
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add Hold Reason
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            {editingReason ? 'Edit Hold Reason' : 'New Hold Reason'}
          </h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Waiting for Materials"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-16 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hr_is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="hr_is_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                {editingReason ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hold Reasons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {holdReasons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hold reasons found. Add your first hold reason to get started.
                </td>
              </tr>
            ) : (
              holdReasons.map((reason) => (
                <tr key={reason.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div
                      className="h-6 w-6 rounded-full border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: reason.color || '#ef4444' }}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{reason.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{reason.description || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      reason.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {reason.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(reason)}
                      className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(reason.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Quick Links Sub-Tab
function QuickLinksSubTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Links</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Access SM Gantt views for your active jobs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example Job Card - this would be dynamically loaded */}
        <Link
          to="/jobs/20/sm-gantt"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50">
              <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Lot 160 Alperton Road</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">View SM Gantt Chart</p>
            </div>
          </div>
        </Link>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">SM Gantt v2</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Access from any job page via the SM Gantt button, or navigate directly to /jobs/:id/sm-gantt
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function SmGanttSetupTab() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">SM Gantt v2 Setup</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Configure resources, hold reasons, and other settings for the Schedule Master Gantt v2 system
        </p>

        <TabGroup>
          <TabList className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all whitespace-nowrap flex items-center justify-center gap-2
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <UserGroupIcon className="h-4 w-4" />
              Resources
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all whitespace-nowrap flex items-center justify-center gap-2
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              Hold Reasons
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all whitespace-nowrap flex items-center justify-center gap-2
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <ChartBarIcon className="h-4 w-4" />
              Quick Links
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <ResourcesSubTab />
            </TabPanel>
            <TabPanel>
              <HoldReasonsSubTab />
            </TabPanel>
            <TabPanel>
              <QuickLinksSubTab />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}
