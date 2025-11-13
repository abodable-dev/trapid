import { useState, useEffect } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, FolderIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function OutlookImportModal({ isOpen, onClose, constructionId, onImportComplete }) {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [folders, setFolders] = useState([])
  const [maxResults, setMaxResults] = useState(50)
  const [importStatus, setImportStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadFolders()
    }
  }, [isOpen])

  const loadFolders = async () => {
    try {
      const response = await api.get('/api/v1/outlook/folders')
      setFolders(response.folders || [])
    } catch (error) {
      console.error('Failed to load Outlook folders:', error)
      setError('Failed to load folders. Please check your Outlook configuration.')
    }
  }

  const handleImport = async () => {
    try {
      setLoading(true)
      setError(null)
      setImportStatus(null)

      const endpoint = constructionId
        ? '/api/v1/outlook/import_for_job'
        : '/api/v1/outlook/import'

      const payload = {
        search: searchTerm,
        folder: selectedFolder,
        top: maxResults
      }

      if (constructionId) {
        payload.construction_id = constructionId
      }

      const response = await api.post(endpoint, payload)

      setImportStatus({
        success: true,
        count: response.imported_count,
        message: response.message
      })

      // Wait a moment to show success message, then close
      setTimeout(() => {
        if (onImportComplete) {
          onImportComplete()
        }
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Failed to import emails:', error)
      setError(error.response?.data?.error || 'Failed to import emails from Outlook')
      setImportStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post('/api/v1/outlook/search', {
        search: searchTerm,
        folder: selectedFolder,
        top: maxResults
      })

      setImportStatus({
        success: false,
        count: response.count,
        message: `Found ${response.count} emails matching your search`
      })
    } catch (error) {
      console.error('Failed to search emails:', error)
      setError(error.response?.data?.error || 'Failed to search Outlook')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
              <CloudArrowDownIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Import from Outlook
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {constructionId
                  ? 'Search and import emails for this job from your Outlook inbox'
                  : 'Search and import emails from your Outlook inbox'}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Search input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Query
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter keywords or leave blank for all emails"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Folder selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Folder
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FolderIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="inbox">Inbox</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name} {folder.unread_count > 0 && `(${folder.unread_count})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Max results */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Results
              </label>
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 50)}
                min="1"
                max="999"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status messages */}
            {importStatus && (
              <div
                className={`rounded-md p-4 ${
                  importStatus.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}
              >
                <p
                  className={`text-sm ${
                    importStatus.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}
                >
                  {importStatus.message}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import'}
            </button>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Preview Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
