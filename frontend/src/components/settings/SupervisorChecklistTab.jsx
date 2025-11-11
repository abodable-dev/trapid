import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function SupervisorChecklistTab() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  })

  const categories = ['Safety', 'Quality', 'Pre-Start', 'Completion', 'Documentation']

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/supervisor_checklist_templates')
      setTemplates(response)
    } catch (error) {
      console.error('Failed to fetch supervisor checklist templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/v1/supervisor_checklist_templates', {
        supervisor_checklist_template: formData
      })
      setFormData({ name: '', description: '', category: '' })
      setShowNewForm(false)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to create template:', error)
      alert('Failed to create checklist item: ' + (error.response?.data?.errors?.join(', ') || error.message))
    }
  }

  const handleUpdate = async (id) => {
    const template = templates.find(t => t.id === id)
    try {
      await api.put(`/api/v1/supervisor_checklist_templates/${id}`, {
        supervisor_checklist_template: template
      })
      setEditingId(null)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to update template:', error)
      alert('Failed to update checklist item: ' + (error.response?.data?.errors?.join(', ') || error.message))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) return

    try {
      await api.delete(`/api/v1/supervisor_checklist_templates/${id}`)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert('Failed to delete checklist item')
    }
  }

  const updateTemplate = (id, field, value) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Supervisor Checklist Templates
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Create reusable checklist items for supervisor checks. Assign these to tasks in Schedule Master templates.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <div className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Checklist Item
            </div>
          </button>
        </div>
      </div>

      {/* New Template Form */}
      {showNewForm && (
        <form onSubmit={handleCreate} className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Checklist Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Safety barriers installed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">No category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Optional details"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewForm(false)
                setFormData({ name: '', description: '', category: '' })
              }}
              className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Templates List */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                      Checklist Item
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Category
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Description
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        No checklist items yet. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    templates.map((template) => (
                      <tr key={template.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          {editingId === template.id ? (
                            <input
                              type="text"
                              value={template.name}
                              onChange={(e) => updateTemplate(template.id, 'name', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          ) : (
                            <div className="font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {editingId === template.id ? (
                            <select
                              value={template.category || ''}
                              onChange={(e) => updateTemplate(template.id, 'category', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="">No category</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          ) : (
                            template.category && (
                              <span className="inline-flex rounded-full bg-indigo-100 dark:bg-indigo-900 px-2 text-xs font-semibold leading-5 text-indigo-800 dark:text-indigo-200">
                                {template.category}
                              </span>
                            )
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {editingId === template.id ? (
                            <input
                              type="text"
                              value={template.description || ''}
                              onChange={(e) => updateTemplate(template.id, 'description', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          ) : (
                            template.description || '-'
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {editingId === template.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdate(template.id)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null)
                                  fetchTemplates()
                                }}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-4">
                              <button
                                onClick={() => setEditingId(template.id)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(template.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">How it works</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc space-y-1 pl-5">
                <li>Create checklist items here (e.g., "Safety barriers installed", "Site induction completed")</li>
                <li>In Schedule Master, assign these items to tasks that require supervisor checks</li>
                <li>When a job is created, checklist items are automatically added to assigned tasks</li>
                <li>Site supervisors check off items as they complete them</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
