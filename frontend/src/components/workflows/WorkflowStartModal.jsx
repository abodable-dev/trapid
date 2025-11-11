import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PaperClipIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function WorkflowStartModal({ isOpen, onClose, workflowType, subjectId, subjectType, onSuccess }) {
  const [formData, setFormData] = useState({
    // Client info
    client_name: '',
    client_address: '',
    client_email: '',
    client_phone: '',
    // Financial info
    amount: '',
    currency: 'AUD',
    payment_terms: '',
    // Project details
    project_name: '',
    project_reference: '',
    site_address: '',
    due_date: '',
    priority: 'normal',
    // Scope info
    scope_summary: '',
    special_requirements: '',
    // References
    external_reference: '',
    onedrive_folder_url: '',
  })
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [starting, setStarting] = useState(false)

  // Section collapse state
  const [expandedSections, setExpandedSections] = useState({
    client: true,
    financial: false,
    project: false,
    scope: false,
    references: false,
    attachments: false
  })

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
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
          ...formData,
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
      amount: '',
      currency: 'AUD',
      payment_terms: '',
      project_name: '',
      project_reference: '',
      site_address: '',
      due_date: '',
      priority: 'normal',
      scope_summary: '',
      special_requirements: '',
      external_reference: '',
      onedrive_folder_url: '',
    })
    setAttachments([])
    setExpandedSections({
      client: true,
      financial: false,
      project: false,
      scope: false,
      references: false,
      attachments: false
    })
    onClose()
  }

  const CollapsibleSection = ({ title, sectionKey, children }) => (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-600">
          {children}
        </div>
      )}
    </div>
  )

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
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
                  {/* Client Details Section */}
                  <CollapsibleSection title="Client/Recipient Details" sectionKey="client">
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
                  </CollapsibleSection>

                  {/* Financial Information Section */}
                  <CollapsibleSection title="Financial Information" sectionKey="financial">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => handleInputChange('amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="10000.00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Currency
                          </label>
                          <select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="AUD">AUD</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                            <option value="EUR">EUR</option>
                            <option value="NZD">NZD</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Payment Terms
                        </label>
                        <input
                          type="text"
                          value={formData.payment_terms}
                          onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Net 30, 50% deposit"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Project Details Section */}
                  <CollapsibleSection title="Project Details" sectionKey="project">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Name
                          </label>
                          <input
                            type="text"
                            value={formData.project_name}
                            onChange={(e) => handleInputChange('project_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Project name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Reference
                          </label>
                          <input
                            type="text"
                            value={formData.project_reference}
                            onChange={(e) => handleInputChange('project_reference', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Job #123"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Site Address
                        </label>
                        <textarea
                          value={formData.site_address}
                          onChange={(e) => handleInputChange('site_address', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Job site address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => handleInputChange('due_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Priority
                          </label>
                          <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Scope Information Section */}
                  <CollapsibleSection title="Scope & Requirements" sectionKey="scope">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Scope Summary
                        </label>
                        <textarea
                          value={formData.scope_summary}
                          onChange={(e) => handleInputChange('scope_summary', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Brief description of work to be performed..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Special Requirements
                        </label>
                        <textarea
                          value={formData.special_requirements}
                          onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Any special requirements, conditions, or notes..."
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* References Section */}
                  <CollapsibleSection title="References & Links" sectionKey="references">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          External Reference
                        </label>
                        <input
                          type="text"
                          value={formData.external_reference}
                          onChange={(e) => handleInputChange('external_reference', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Client PO number, external job code, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          OneDrive Folder URL
                        </label>
                        <input
                          type="url"
                          value={formData.onedrive_folder_url}
                          onChange={(e) => handleInputChange('onedrive_folder_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Attachments Section */}
                  <CollapsibleSection title="Attachments" sectionKey="attachments">
                    <div>
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
                  </CollapsibleSection>
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
