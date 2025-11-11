import { useState, useEffect } from 'react'
import {
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function PODocumentsTab({ purchaseOrderId, constructionId, onDocumentsChange }) {
  const [documents, setDocuments] = useState([])
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [groupedDocuments, setGroupedDocuments] = useState({})

  useEffect(() => {
    loadAvailableDocuments()
  }, [purchaseOrderId])

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

  const handleSelectAll = () => {
    const allDocIds = documents.map(doc => doc.id)
    setSelectedDocumentIds(allDocIds)
  }

  const handleDeselectAll = () => {
    setSelectedDocumentIds([])
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      await api.post(`/api/v1/purchase_orders/${purchaseOrderId}/attach_documents`, {
        document_task_ids: selectedDocumentIds
      })

      setSuccessMessage(`Successfully updated document attachments (${selectedDocumentIds.length} documents)`)

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
      'site-plan': 'Site Plan',
      'sales': 'Sales',
      'certification': 'Certification',
      'client': 'Client',
      'client-photo': 'Client Photos',
      'final-certificate': 'Final Certificate',
      'uncategorized': 'Other'
    }
    return labels[category] || category
  }

  const getStatusBadge = (doc) => {
    if (doc.is_validated) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Validated
        </span>
      )
    }
    if (doc.has_document) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <DocumentIcon className="h-3.5 w-3.5" />
          Uploaded
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
        <XCircleIcon className="h-3.5 w-3.5" />
        No Document
      </span>
    )
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
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Documents Available</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No documents have been created for this job yet. Go to the job's Documents tab to create document tasks.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Header with actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Attach Documents to Purchase Order
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select documents from this job to attach to this purchase order. Selected: {selectedDocumentIds.length} / {documents.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              type="button"
              className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              type="button"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Deselect All
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Attachments'}
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Documents */}
      {Object.entries(groupedDocuments).map(([category, categoryDocs]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-gray-400" />
              {getCategoryLabel(category)}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({categoryDocs.filter(doc => selectedDocumentIds.includes(doc.id)).length} / {categoryDocs.length} selected)
              </span>
            </h4>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categoryDocs.map((doc) => (
              <div
                key={doc.id}
                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                  selectedDocumentIds.includes(doc.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
                onClick={() => handleToggleDocument(doc.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedDocumentIds.includes(doc.id)}
                    onChange={() => handleToggleDocument(doc.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Document Icon */}
                  <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.name}
                      </p>
                      {getStatusBadge(doc)}
                    </div>
                    {doc.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {doc.description}
                      </p>
                    )}
                    {doc.uploaded_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* View Button */}
                  {doc.has_document && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDocument(doc)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
