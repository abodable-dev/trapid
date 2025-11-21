import { useState, useEffect } from 'react'
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import api from '../../api'

export default function CompanyDocumentsTab({ company, onUpdate }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [company.id])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/companies/${company.id}/documents`)
      setDocuments(response.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      await api.delete(`/api/v1/company_documents/${documentId}`)
      await loadDocuments()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('Failed to delete document')
    }
  }

  const handleSaveDocument = async (formData) => {
    try {
      const data = new FormData()
      data.append('company_document[document_type]', formData.document_type)
      data.append('company_document[title]', formData.title)
      data.append('company_document[description]', formData.description)
      data.append('company_document[document_date]', formData.document_date)
      data.append('company_document[company_id]', company.id)

      if (formData.file) {
        data.append('company_document[file]', formData.file)
      }

      await api.post('/api/v1/company_documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setShowForm(false)
      await loadDocuments()
      if (onUpdate) onUpdate()
    } catch (error) {
      throw error
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '-'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading documents...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Documents</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Upload Document
          </button>
        )}
      </div>

      {showForm ? (
        <DocumentForm
          onSave={handleSaveDocument}
          onCancel={() => setShowForm(false)}
        />
      ) : documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
                    {doc.description && (
                      <p className="mt-1 text-sm text-gray-500">{doc.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {doc.document_type?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      {doc.document_date && (
                        <span>Date: {new Date(doc.document_date).toLocaleDateString()}</span>
                      )}
                      {doc.file_size && (
                        <span>Size: {formatFileSize(doc.file_size)}</span>
                      )}
                      {doc.uploaded_at && (
                        <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
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

function DocumentForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'constitution',
    document_date: '',
    file: null
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const documentTypes = [
    'constitution',
    'agm_minutes',
    'director_resolution',
    'share_certificate',
    'tax_return',
    'financial_statements',
    'asic_extract',
    'other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({ ...prev, file }))
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.file) {
      newErrors.file = 'File is required'
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
      setErrors({ submit: error.message || 'Failed to upload document' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Upload Document</h4>

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
          <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">
            Document Type
          </label>
          <select
            name="document_type"
            id="document_type"
            value={formData.document_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="document_date" className="block text-sm font-medium text-gray-700">
            Document Date
          </label>
          <input
            type="date"
            name="document_date"
            id="document_date"
            value={formData.document_date}
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
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            File *
          </label>
          <input
            type="file"
            name="file"
            id="file"
            required
            onChange={handleFileChange}
            className={`mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none ${
              errors.file ? 'border-red-300' : ''
            }`}
          />
          {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
          {formData.file && (
            <p className="mt-1 text-xs text-gray-500">
              Selected: {formData.file.name}
            </p>
          )}
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
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </form>
  )
}
