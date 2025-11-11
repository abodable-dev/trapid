import { useState, useEffect } from 'react'
import { api } from '../../api'
import SystemTemplatesSection from './folder-templates/SystemTemplatesSection'
import UserTemplatesSection from './folder-templates/UserTemplatesSection'

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
      <SystemTemplatesSection
        templates={systemTemplates}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      <UserTemplatesSection
        templates={userTemplates}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </div>
  )
}
