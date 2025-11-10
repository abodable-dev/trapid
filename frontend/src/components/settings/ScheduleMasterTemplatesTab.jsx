import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'
import Toast from '../Toast'

export default function ScheduleMasterTemplatesTab() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    task_type: 'DO',
    category: '',
    default_duration_days: 1,
    description: '',
    is_milestone: false,
    requires_photo: false,
    sequence_order: 0
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/task_templates')
      setTemplates(response.task_templates || [])
    } catch (err) {
      console.error('Failed to load templates:', err)
      showToast('Failed to load templates', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()

    try {
      if (editingTemplate) {
        await api.put(`/api/v1/task_templates/${editingTemplate.id}`, {
          task_template: formData
        })
        showToast('Template updated successfully', 'success')
      } else {
        await api.post('/api/v1/task_templates', {
          task_template: formData
        })
        showToast('Template created successfully', 'success')
      }

      resetForm()
      await loadTemplates()
    } catch (err) {
      console.error('Failed to save template:', err)
      showToast(`Failed to save template: ${err.message}`, 'error')
    }
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      task_type: template.task_type,
      category: template.category,
      default_duration_days: template.default_duration_days,
      description: template.description || '',
      is_milestone: template.is_milestone,
      requires_photo: template.requires_photo,
      sequence_order: template.sequence_order
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await api.delete(`/api/v1/task_templates/${id}`)
      showToast('Template deleted successfully', 'success')
      await loadTemplates()
    } catch (err) {
      console.error('Failed to delete template:', err)
      showToast(`Failed to delete template: ${err.message}`, 'error')
    }
  }

  const resetForm = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      task_type: 'DO',
      category: '',
      default_duration_days: 1,
      description: '',
      is_milestone: false,
      requires_photo: false,
      sequence_order: 0
    })
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const taskTypes = ['ORDER', 'DO', 'GET', 'CLAIM', 'CERTIFICATE', 'PHOTO', 'FIT']
  const categories = ['ADMIN', 'CARPENTER', 'ELECTRICAL', 'PLUMBER', 'CONCRETE', 'FRAMING', 'OTHER']

  return (
    <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
          Schedule Master Templates
        </h2>
        <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
          Create reusable task templates that can be copied to any job's schedule master.
        </p>
      </div>

      <div className="md:col-span-2 space-y-6">
        {/* Add/Edit Form */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingTemplate ? 'Edit Template' : 'Add New Template'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Frame Carpenter, Slab Concrete, BA Approval"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Type
                </label>
                <select
                  value={formData.task_type}
                  onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {taskTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.default_duration_days}
                  onChange={(e) => setFormData({ ...formData, default_duration_days: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Sequence Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sequence Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sequence_order}
                  onChange={(e) => setFormData({ ...formData, sequence_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  placeholder="Optional description of the task"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="md:col-span-2 flex gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_milestone}
                    onChange={(e) => setFormData({ ...formData, is_milestone: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Is Milestone</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requires_photo}
                    onChange={(e) => setFormData({ ...formData, requires_photo: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Requires Photo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              {editingTemplate && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {editingTemplate ? 'Update Template' : 'Add Template'}
              </button>
            </div>
          </form>
        </div>

        {/* Templates List */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Templates ({templates.length})
            </h3>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No templates yet. Add your first template above.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {templates.map((template) => (
                <div key={template.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400">
                          {template.task_type}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {template.category}
                        </span>
                        {template.is_milestone && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                            Milestone
                          </span>
                        )}
                        {template.requires_photo && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                            Photo Required
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      )}
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Duration: {template.default_duration_days} day{template.default_duration_days !== 1 ? 's' : ''} •
                        Order: {template.sequence_order}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
