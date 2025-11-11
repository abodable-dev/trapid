import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PaperClipIcon, TrashIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function WorkflowStartModal({ isOpen, onClose, workflowType, subjectId, subjectType, onSuccess }) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_address: '',
    client_email: '',
    client_phone: '',
  })
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [starting, setStarting] = useState(false)

  const workflowLabels = {
    purchase_order_approval: 'Purchase Order Approval',
    quote_approval: 'Quote Approval',
    contract_approval: 'Contract Approval',
    job_approval: 'Job Approval',
    estimate_review: 'Estimate Review',
    document_approval: 'Document Approval',
    change_order_approval: 'Change Order Approval',
    invoice_approval: 'Invoice Approval'
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post('/api/v1/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (response.success) {
          setAttachments(prev => [
            ...prev,
            {
              url: response.url,
              filename: file.name,
              content_type: file.type
            }
          ])
        }
      }
    } catch (err) {
      console.error('Failed to upload file:', err)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleStartWorkflow = async () => {
    setStarting(true)

    try {
      const response = await api.post('/api/v1/workflow_instances', {
        workflow_instance: {
          workflow_type: workflowType,
          subject_type: subjectType,
          subject_id: subjectId,
          client_name: formData.client_name,
          client_address: formData.client_address,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          attachments: attachments
        }
      })

      if (response.success) {
        onSuccess?.(response.workflow_instance)
        handleClose()
      } else {
        alert(response.error || 'Failed to start workflow')
      }
    } catch (err) {
      console.error('Failed to start workflow:', err)
      alert('Failed to start workflow. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      client_name: '',
      client_address: '',
      client_email: '',
      client_phone: '',
    })
    setAttachments([])
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
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Start {workflowLabels[workflowType] || 'Workflow'}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Client Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Client/Recipient Details (Optional)
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.client_name}
                          onChange={(e) => handleInputChange('client_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Client name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address
                        </label>
                        <textarea
                          value={formData.client_address}
                          onChange={(e) => handleInputChange('client_address', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Client address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.client_email}
                            onChange={(e) => handleInputChange('client_email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="client@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.client_phone}
                            onChange={(e) => handleInputChange('client_phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Attachments (Optional)
                    </label>

                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <PaperClipIcon className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, Word, Excel, Images (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>

                    {/* Attachment List */}
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                          >
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <PaperClipIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {attachment.filename}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveAttachment(index)}
                              className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploading && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Uploading...
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={starting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStartWorkflow}
                    disabled={starting || uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {starting ? 'Starting...' : 'Start Workflow'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
