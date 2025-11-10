import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { FolderIcon, ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function OneDriveFolderPicker({ isOpen, onClose, onSelect, title = "Select OneDrive Folder" }) {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Drive' }])
  const [selectedFolder, setSelectedFolder] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadFolders(null)
    }
  }, [isOpen])

  const loadFolders = async (folderId) => {
    setLoading(true)
    setError(null)

    try {
      const params = folderId ? { folder_id: folderId } : {}
      const response = await api.get('/api/v1/organization_onedrive/browse_folders', params)

      setFolders(response.folders || [])
      setCurrentFolderId(folderId)
    } catch (err) {
      setError(err.message || 'Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const handleFolderClick = (folder) => {
    // Navigate into this folder
    loadFolders(folder.id)
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }])
    setSelectedFolder(folder)
  }

  const handleBreadcrumbClick = (index) => {
    const clickedBreadcrumb = breadcrumbs[index]

    // Navigate to the clicked breadcrumb level
    loadFolders(clickedBreadcrumb.id)

    // Update breadcrumbs to only include up to the clicked level
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))

    if (index === 0) {
      setSelectedFolder(null)
    } else {
      setSelectedFolder(clickedBreadcrumb)
    }
  }

  const handleSelectCurrentFolder = () => {
    if (currentFolderId) {
      const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1]
      onSelect({
        id: currentFolderId,
        name: currentBreadcrumb.name,
        path: breadcrumbs.slice(1).map(b => b.name).join('/')
      })
    } else {
      // Root folder selected
      onSelect({
        id: null,
        name: 'My Drive',
        path: ''
      })
    }
    onClose()
  }

  const handleSelectSpecificFolder = (folder) => {
    onSelect({
      id: folder.id,
      name: folder.name,
      path: [...breadcrumbs.slice(1).map(b => b.name), folder.name].join('/')
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-2xl w-full rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <div className="p-6">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {title}
            </DialogTitle>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-x-2 mb-4 overflow-x-auto">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-x-2">
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="flex items-center gap-x-1 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {index === 0 ? (
                      <HomeIcon className="h-4 w-4" />
                    ) : null}
                    <span>{crumb.name}</span>
                  </button>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>

            {/* Current folder info and select button */}
            {breadcrumbs.length > 1 && (
              <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <FolderIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Current: {breadcrumbs[breadcrumbs.length - 1].name}
                  </span>
                </div>
                <button
                  onClick={handleSelectCurrentFolder}
                  className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  Select This Folder
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Folder list */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-md max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-500"></div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading folders...</span>
                </div>
              ) : folders.length === 0 ? (
                <div className="py-12 text-center">
                  <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No subfolders in this location
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {folders.map((folder) => (
                    <li key={folder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between px-4 py-3">
                        <button
                          onClick={() => handleFolderClick(folder)}
                          className="flex items-center gap-x-3 flex-1 text-left"
                        >
                          <FolderIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {folder.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {folder.child_count} {folder.child_count === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        </button>
                        <button
                          onClick={() => handleSelectSpecificFolder(folder)}
                          className="ml-3 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Select
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer buttons */}
            <div className="mt-6 flex justify-end gap-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              {breadcrumbs.length === 1 && (
                <button
                  onClick={handleSelectCurrentFolder}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  Select Root
                </button>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
