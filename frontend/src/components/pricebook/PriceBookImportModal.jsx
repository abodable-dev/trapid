import { useState, useRef, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function PriceBookImportModal({ isOpen, onClose, onImportSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file) => {
    setError(null)
    setResult(null)

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setError('Please upload a CSV or Excel file')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await api.postFormData('/api/v1/pricebook/import_price_history', formData)

      if (response.success) {
        setResult(response)

        // Refresh the pricebook data after successful import
        if (onImportSuccess) {
          onImportSuccess()
        }
      } else {
        setError(response.message || 'Import failed')
        setResult(response)
      }
    } catch (err) {
      setError('Failed to import file. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleClose = () => {
    setError(null)
    setResult(null)
    setUploading(false)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <DocumentArrowUpIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                      Import Price History
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                  {/* File Upload Area */}
                  {!result && (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-12 text-center transition ${
                        dragActive
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleChange}
                        disabled={uploading}
                      />

                      <div className="space-y-4">
                        <div className="text-gray-400">
                          <svg
                            className="mx-auto h-16 w-16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>

                        {uploading ? (
                          <div className="text-gray-600 dark:text-gray-300">
                            <div className="font-medium">Uploading and processing...</div>
                            <div className="text-sm mt-1">Please wait while we import your data</div>
                            <div className="flex items-center justify-center mt-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                              Drop your file here, or{' '}
                              <button
                                type="button"
                                onClick={handleClick}
                                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                browse
                              </button>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Supports CSV, XLS, and XLSX files up to 10MB
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && !result && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
                          <div className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Result */}
                  {result && result.success && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800 dark:text-green-400">Import Successful</h3>
                            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                              <div className="grid grid-cols-3 gap-4 mt-2">
                                <div>
                                  <div className="text-xs text-green-600 dark:text-green-400">Total Rows</div>
                                  <div className="text-lg font-semibold">{result.stats?.total || 0}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-green-600 dark:text-green-400">Created</div>
                                  <div className="text-lg font-semibold">{result.stats?.created || 0}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-green-600 dark:text-green-400">Updated</div>
                                  <div className="text-lg font-semibold">{result.stats?.updated || 0}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setResult(null)
                            setError(null)
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          Import Another File
                        </button>
                        <button
                          onClick={handleClose}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error Result with Details */}
                  {result && !result.success && result.errors && result.errors.length > 0 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Import Failed</h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                              {result.stats && (
                                <div className="mb-3">
                                  Processed {result.stats.total || 0} rows: {result.stats.created || 0} created, {result.stats.updated || 0} updated, {result.errors.length} errors
                                </div>
                              )}
                              <div className="max-h-48 overflow-y-auto">
                                <div className="text-xs font-medium mb-1">Errors:</div>
                                <ul className="list-disc list-inside space-y-1">
                                  {result.errors.slice(0, 20).map((err, idx) => (
                                    <li key={idx} className="text-xs">{err}</li>
                                  ))}
                                  {result.errors.length > 20 && (
                                    <li className="text-xs font-medium">...and {result.errors.length - 20} more errors</li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setResult(null)
                            setError(null)
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={handleClose}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Help Text */}
                  {!result && !uploading && (
                    <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2">File Format Requirements</h3>
                      <ul className="text-xs text-indigo-800 dark:text-indigo-400 space-y-1.5">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Required columns: Item Code, Item Name, Price, Supplier Name</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Optional columns: Category, Unit of Measure, Date Effective, LGA</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>The system will match existing items and suppliers or create new ones</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Prices will be added to price history for tracking</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
