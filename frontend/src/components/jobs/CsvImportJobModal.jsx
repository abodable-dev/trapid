import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function CsvImportJobModal({ isOpen, onClose, onSuccess }) {
  const [csvFile, setCsvFile] = useState(null)
  const [formData, setFormData] = useState({
    siteSupervisorName: 'Andrew Clement',
    siteSupervisorEmail: '',
    siteSupervisorPhone: '',
    contractValue: '',
    status: 'Active',
    createOneDriveFolders: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [importResult, setImportResult] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        setCsvFile(null)
        return
      }
      setCsvFile(file)
      setError(null)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!csvFile) {
      setError('Please select a CSV file')
      return
    }

    if (!formData.siteSupervisorName) {
      setError('Site supervisor name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('csv_file', csvFile)
      formDataToSend.append('site_supervisor_name', formData.siteSupervisorName)

      if (formData.siteSupervisorEmail) {
        formDataToSend.append('site_supervisor_email', formData.siteSupervisorEmail)
      }
      if (formData.siteSupervisorPhone) {
        formDataToSend.append('site_supervisor_phone', formData.siteSupervisorPhone)
      }
      if (formData.contractValue) {
        formDataToSend.append('contract_value', formData.contractValue)
      }
      formDataToSend.append('status', formData.status)
      formDataToSend.append('create_onedrive_folders', formData.createOneDriveFolders)

      const response = await api.post('/api/v1/csv_imports/job_with_pos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setImportResult(response)

      // Wait 2 seconds to show success, then close
      setTimeout(() => {
        onSuccess && onSuccess(response.construction)
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to import CSV')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCsvFile(null)
    setFormData({
      siteSupervisorName: 'Andrew Clement',
      siteSupervisorEmail: '',
      siteSupervisorPhone: '',
      contractValue: '',
      status: 'Active',
      createOneDriveFolders: true,
    })
    setError(null)
    setImportResult(null)
    setIsSubmitting(false)
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
          <div className="fixed inset-0 bg-black/30 dark:bg-black/60" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-x-3">
                    <DocumentArrowUpIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-500" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      Import Job from CSV
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Success Message */}
                {importResult && (
                  <div className="mb-6 rounded-md bg-green-100 dark:bg-green-400/10 p-4">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-green-700 dark:text-green-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                          Import Successful!
                        </h3>
                        <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                          <p>
                            Created <strong>{importResult.construction.title}</strong>
                          </p>
                          <p className="mt-1">
                            Imported {importResult.import_summary.pos_created} purchase orders
                            (${importResult.import_summary.total_amount.toLocaleString()})
                          </p>
                          {importResult.onedrive_folders_queued && (
                            <p className="mt-1 flex items-center gap-x-1">
                              <FolderIcon className="h-4 w-4" />
                              OneDrive folders are being created...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-md bg-red-100 dark:bg-red-400/10 p-4">
                    <div className="flex">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-700 dark:text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                          Import Failed
                        </h3>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!importResult && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CSV File <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 px-6 py-10">
                        <div className="text-center">
                          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 flex text-sm text-gray-600 dark:text-gray-400">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-semibold text-indigo-600 dark:text-indigo-500 hover:text-indigo-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".csv"
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            CSV file from EasyBuild
                          </p>
                          {csvFile && (
                            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                              ✓ {csvFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Site Supervisor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Supervisor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.siteSupervisorName}
                        onChange={(e) => handleChange('siteSupervisorName', e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    {/* Site Supervisor Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Supervisor Email
                      </label>
                      <input
                        type="email"
                        value={formData.siteSupervisorEmail}
                        onChange={(e) => handleChange('siteSupervisorEmail', e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Site Supervisor Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Supervisor Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.siteSupervisorPhone}
                        onChange={(e) => handleChange('siteSupervisorPhone', e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Contract Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contract Value (optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.contractValue}
                        onChange={(e) => handleChange('contractValue', e.target.value)}
                        placeholder="Leave blank to use sum of POs"
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        If left blank, will be calculated from purchase orders
                      </p>
                    </div>

                    {/* Create OneDrive Folders */}
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="create-folders"
                          type="checkbox"
                          checked={formData.createOneDriveFolders}
                          onChange={(e) =>
                            handleChange('createOneDriveFolders', e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="create-folders"
                          className="font-medium text-gray-700 dark:text-gray-300"
                        >
                          Create OneDrive folders automatically
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Creates the Tekna Standard folder structure in OneDrive for this job
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-x-3 justify-end">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !csvFile}
                        className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-x-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Importing...
                          </span>
                        ) : (
                          'Import Job'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
