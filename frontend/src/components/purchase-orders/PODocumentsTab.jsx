import { useState, useEffect } from 'react'
import {
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import { api } from '../../api'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function PODocumentsTab({ purchaseOrderId, constructionId, scheduleTaskId, onDocumentsChange }) {
  const [documents, setDocuments] = useState([])
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [groupedDocuments, setGroupedDocuments] = useState({})
  const [activeCategory, setActiveCategory] = useState('site-plan')
  const [scheduleTask, setScheduleTask] = useState(null)

  const categories = [
    { id: 'site-plan', label: 'Site' },
    { id: 'sales', label: 'Sales' },
    { id: 'final-certificate', label: 'Final Certificate' },
    { id: 'certification', label: 'Precon' },
    { id: 'client', label: 'Client' },
    { id: 'client-photo', label: 'Photo' },
    { id: 'client-photo', label: 'Client Photo' },
    { id: 'uncategorized', label: 'Plan' },
  ]

  useEffect(() => {
    loadAvailableDocuments()
    if (scheduleTaskId) {
      loadScheduleTask()
    }
  }, [purchaseOrderId, scheduleTaskId])

  const loadScheduleTask = async () => {
    try {
      const response = await api.get(`/api/v1/schedule_tasks/${scheduleTaskId}`)
      setScheduleTask(response)
    } catch (err) {
      console.error('Failed to load schedule task:', err)
    }
  }

  const loadAvailableDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/api/v1/purchase_orders/${purchaseOrderId}/available_documents`)

      setDocuments(response.documents || [])

      // Set initially selected documents (those already attached)
      const attachedIds = (response.documents || [])
        .filter(doc => doc.is_attached)
        .map(doc => doc.id)
      setSelectedDocumentIds(attachedIds)

      // Group documents by category
      const grouped = (response.documents || []).reduce((acc, doc) => {
        const category = doc.category || 'uncategorized'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(doc)
        return acc
      }, {})
      setGroupedDocuments(grouped)

      // Set first category with documents as active
      const firstCategoryWithDocs = Object.keys(grouped)[0]
      if (firstCategoryWithDocs) {
        setActiveCategory(firstCategoryWithDocs)
      }

    } catch (err) {
      console.error('Failed to load available documents:', err)
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDocument = (documentId) => {
    setSelectedDocumentIds(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      await api.post(`/api/v1/purchase_orders/${purchaseOrderId}/attach_documents`, {
        document_task_ids: selectedDocumentIds
      })

      setSuccessMessage(`Successfully updated document attachments`)

      // Notify parent component of changes
      if (onDocumentsChange) {
        onDocumentsChange(selectedDocumentIds)
      }

      // Reload to update is_attached status
      await loadAvailableDocuments()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Failed to save document attachments:', err)
      setError(err.message || 'Failed to save document attachments')
    } finally {
      setSaving(false)
    }
  }

  const handleViewDocument = (doc) => {
    if (doc.document_url) {
      window.open(doc.document_url, '_blank', 'noopener,noreferrer')
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      'site-plan': 'Site',
      'sales': 'Sales',
      'certification': 'Precon',
      'client': 'Client',
      'client-photo': 'Client Photo',
      'final-certificate': 'Final Certificate',
      'photo': 'Photo',
      'uncategorized': 'Plan'
    }
    return labels[category] || category
  }

  // Calculate stats
  const totalDocuments = documents.length
  const attachedDocuments = selectedDocumentIds.length
  const validatedDocuments = documents.filter(doc => doc.is_validated && selectedDocumentIds.includes(doc.id)).length
  const requiredMissing = 0 // This would need backend logic to determine required docs

  const activeCategoryDocs = groupedDocuments[activeCategory] || []
  const getCategoryCount = (categoryId) => {
    const categoryDocs = groupedDocuments[categoryId] || []
    return categoryDocs.filter(doc => selectedDocumentIds.includes(doc.id)).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading documents...</span>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No document tasks</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No documents are required for this category yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-100 dark:bg-red-400/10 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-100 dark:bg-green-400/10 p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-700 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Attachments'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {Object.keys(groupedDocuments).map((categoryId) => {
            const count = getCategoryCount(categoryId)
            return (
              <button
                key={categoryId}
                onClick={() => setActiveCategory(categoryId)}
                className={classNames(
                  categoryId === activeCategory
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300',
                  'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors'
                )}
              >
                {getCategoryLabel(categoryId)} ({count})
              </button>
            )
          })}
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {attachedDocuments}/{totalDocuments}
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Documents Attached</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {validatedDocuments}/{totalDocuments}
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Validated</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {requiredMissing}
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Required Missing</div>
        </div>
      </div>

      {/* Documents Table */}
      {activeCategoryDocs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No document tasks</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No documents are required for this category yet.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={activeCategoryDocs.every(doc => selectedDocumentIds.includes(doc.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const categoryDocIds = activeCategoryDocs.map(doc => doc.id)
                        setSelectedDocumentIds(prev => [...new Set([...prev, ...categoryDocIds])])
                      } else {
                        const categoryDocIds = activeCategoryDocs.map(doc => doc.id)
                        setSelectedDocumentIds(prev => prev.filter(id => !categoryDocIds.includes(id)))
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  DOCUMENT
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  STATUS
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  UPLOADED
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeCategoryDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className={classNames(
                    selectedDocumentIds.includes(doc.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : '',
                    'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDocumentIds.includes(doc.id)}
                      onChange={() => handleToggleDocument(doc.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.name}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doc.is_validated ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Validated
                      </span>
                    ) : doc.has_document ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        <DocumentIcon className="h-3.5 w-3.5" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                        <XCircleIcon className="h-3.5 w-3.5" />
                        No Document
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {doc.has_document && (
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
