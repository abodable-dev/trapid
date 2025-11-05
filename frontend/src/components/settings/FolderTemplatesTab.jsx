import { useState, useEffect } from 'react'
import { FolderIcon, PlusIcon, DocumentDuplicateIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function FolderTemplatesTab() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/api/v1/folder_templates')

      // Handle both array and object responses
      if (Array.isArray(response)) {
        setTemplates(response)
      } else if (response?.folder_templates) {
        setTemplates(response.folder_templates)
      } else {
        setTemplates([])
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load folder templates. Please ensure you are logged in.')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async (templateId, templateName) => {
    const newName = prompt(`Enter name for duplicated template:`, `${templateName} (Copy)`)
    if (!newName) return

    try {
      const response = await api.post(`/api/v1/folder_templates/${templateId}/duplicate`, { name: newName })
      setTemplates([...templates, response.folder_template])
      alert('Template duplicated successfully!')
    } catch (err) {
      console.error('Failed to duplicate template:', err)
      alert('Failed to duplicate template')
    }
  }

  const handleDelete = async (templateId, templateName) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"?`)) return

    try {
      await api.delete(`/api/v1/folder_templates/${templateId}`)
      setTemplates(templates.filter(t => t.id !== templateId))
      alert('Template deleted successfully!')
    } catch (err) {
      console.error('Failed to delete template:', err)
      alert('Failed to delete template. System templates cannot be deleted.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
    )
  }

  const systemTemplates = templates.filter(t => t.is_system_default)
  const userTemplates = templates.filter(t => !t.is_system_default)

  return (
    <div className="space-y-8">
      {/* System Templates Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Default Templates</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pre-configured folder structures for common project types. Duplicate to customize.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Folders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {systemTemplates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No default templates available
                  </td>
                </tr>
              ) : (
                systemTemplates.map(template => (
                  <TemplateRow
                    key={template.id}
                    template={template}
                    isSystem={true}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Templates Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Custom Templates</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your customized folder structures. Edit or delete as needed.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5" />
            Create New Template
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Folders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {userTemplates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No custom templates</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by duplicating a default template.
                    </p>
                  </td>
                </tr>
              ) : (
                userTemplates.map(template => (
                  <TemplateRow
                    key={template.id}
                    template={template}
                    isSystem={false}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TemplateRow({ template, isSystem, onDuplicate, onDelete }) {
  const folderCount = template.folder_template_items?.length || 0

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FolderIcon className="h-5 w-5 text-yellow-500 mr-3" />
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {template.name}
            {isSystem && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                Default
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900 dark:text-white capitalize">
          {template.template_type || 'Custom'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {folderCount} folders
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {template.is_active ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            Inactive
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onDuplicate(template.id, template.name)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Duplicate template"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            Duplicate
          </button>
          {!isSystem && (
            <>
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                title="Edit template"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(template.id, template.name)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                title="Delete template"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
