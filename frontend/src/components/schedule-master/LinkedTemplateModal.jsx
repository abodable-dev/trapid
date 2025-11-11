import { useState, useEffect } from 'react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

/**
 * LinkedTemplateModal - Modal for selecting a schedule template to link to the current task
 */
export default function LinkedTemplateModal({ isOpen, onClose, currentRow, onSave }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentRow.linked_template_id || null)
  const [templates, setTemplates] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedTemplateId(currentRow.linked_template_id || null)
  }, [currentRow.linked_template_id])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/schedule_templates')
      setTemplates(response || [])
    } catch (err) {
      console.error('Failed to load templates:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId === selectedTemplateId ? null : templateId)
  }

  const handleSave = () => {
    onSave(selectedTemplateId)
    onClose()
  }

  // Filter templates by search query
  const filteredTemplates = templates.filter(template => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return template.name.toLowerCase().includes(query) ||
             (template.description && template.description.toLowerCase().includes(query))
    }
    return true
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Select Linked Template
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              For: {currentRow.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {selectedTemplateId ? 'Template selected' : 'No template selected'}
          </p>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Loading templates...
            </p>
          ) : (
            <div className="space-y-2">
              {/* None option */}
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  !selectedTemplateId
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  checked={!selectedTemplateId}
                  onChange={() => handleSelectTemplate(null)}
                  className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    None
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Do not link a template
                  </p>
                </div>
              </label>

              {filteredTemplates.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {searchQuery ? 'No templates match your search.' : 'No templates available.'}
                </p>
              ) : (
                filteredTemplates.map((template) => {
                  const isSelected = selectedTemplateId === template.id
                  return (
                    <label
                      key={template.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => handleSelectTemplate(template.id)}
                        className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </span>
                          {template.is_default && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Default
                            </span>
                          )}
                        </div>
                        {template.description && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Save Selection
          </button>
        </div>
      </div>
    </div>
  )
}
