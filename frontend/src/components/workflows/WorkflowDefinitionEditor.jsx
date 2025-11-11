import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

const WORKFLOW_TYPES = [
  { value: 'purchase_order_approval', label: 'Purchase Order Approval' },
  { value: 'quote_approval', label: 'Quote Approval' },
  { value: 'contract_approval', label: 'Contract Approval' },
  { value: 'job_approval', label: 'Job Approval' },
  { value: 'estimate_review', label: 'Estimate Review' },
  { value: 'document_approval', label: 'Document Approval' },
  { value: 'change_order_approval', label: 'Change Order Approval' },
  { value: 'invoice_approval', label: 'Invoice Approval' },
  { value: 'custom', label: 'Custom Workflow' }
]

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'product_owner', label: 'Product Owner' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'estimator', label: 'Estimator' },
  { value: 'builder', label: 'Builder' },
  { value: 'user', label: 'User' }
]

export default function WorkflowDefinitionEditor({ workflow, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workflow_type: '',
    active: true,
    steps: []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name || '',
        description: workflow.description || '',
        workflow_type: workflow.workflow_type || '',
        active: workflow.active !== false,
        steps: workflow.config?.steps || []
      })
    } else {
      // New workflow with one default step
      setFormData({
        name: '',
        description: '',
        workflow_type: '',
        active: true,
        steps: [{
          name: '',
          label: '',
          description: '',
          assignee_type: 'role',
          assignee_value: 'admin'
        }]
      })
    }
  }, [workflow])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }

    // Auto-generate step name from label
    if (field === 'label' && value) {
      newSteps[index].name = value.toLowerCase().replace(/\s+/g, '_')
    }

    setFormData(prev => ({ ...prev, steps: newSteps }))
  }

  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          name: '',
          label: '',
          description: '',
          assignee_type: 'role',
          assignee_value: 'admin'
        }
      ]
    }))
  }

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const handleMoveStep = (index, direction) => {
    const newSteps = [...formData.steps]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < newSteps.length) {
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]]
      setFormData(prev => ({ ...prev, steps: newSteps }))
    }
  }

  const handleAddCondition = (stepIndex) => {
    const newSteps = [...formData.steps]
    newSteps[stepIndex].conditions = {
      amount_threshold: 0
    }
    setFormData(prev => ({ ...prev, steps: newSteps }))
  }

  const handleRemoveCondition = (stepIndex) => {
    const newSteps = [...formData.steps]
    delete newSteps[stepIndex].conditions
    setFormData(prev => ({ ...prev, steps: newSteps }))
  }

  const handleConditionChange = (stepIndex, value) => {
    const newSteps = [...formData.steps]
    newSteps[stepIndex].conditions = {
      amount_threshold: parseFloat(value) || 0
    }
    setFormData(prev => ({ ...prev, steps: newSteps }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Workflow name is required')
      return false
    }

    if (!formData.workflow_type) {
      setError('Workflow type is required')
      return false
    }

    if (formData.steps.length === 0) {
      setError('At least one step is required')
      return false
    }

    for (let i = 0; i < formData.steps.length; i++) {
      const step = formData.steps[i]
      if (!step.label || !step.name) {
        setError(`Step ${i + 1}: Label is required`)
        return false
      }
      if (!step.assignee_value) {
        setError(`Step ${i + 1}: Assignee is required`)
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setError(null)

    const payload = {
      workflow_definition: {
        name: formData.name,
        description: formData.description,
        workflow_type: formData.workflow_type,
        active: formData.active,
        config: {
          steps: formData.steps,
          notifications: {
            on_approval: true,
            on_rejection: true,
            on_completion: true
          }
        }
      }
    }

    try {
      let response
      if (workflow) {
        response = await api.patch(`/api/v1/workflow_definitions/${workflow.id}`, payload)
      } else {
        response = await api.post('/api/v1/workflow_definitions', payload)
      }

      if (response.success) {
        onClose(true)
      } else {
        setError(response.error || 'Failed to save workflow')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save workflow')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {workflow ? 'Edit Workflow' : 'Create New Workflow'}
            </h2>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Purchase Order Approval"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  placeholder="Describe the purpose of this workflow"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Workflow Type *
                  </label>
                  <select
                    value={formData.workflow_type}
                    onChange={(e) => handleChange('workflow_type', e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select type...</option>
                    {WORKFLOW_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <div className="flex items-center h-10">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => handleChange('active', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Approval Steps
                </h3>
                <button
                  onClick={handleAddStep}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Step
                </button>
              </div>

              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Step {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {index > 0 && (
                          <button
                            onClick={() => handleMoveStep(index, 'up')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <ArrowUpIcon className="h-4 w-4" />
                          </button>
                        )}
                        {index < formData.steps.length - 1 && (
                          <button
                            onClick={() => handleMoveStep(index, 'down')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <ArrowDownIcon className="h-4 w-4" />
                          </button>
                        )}
                        {formData.steps.length > 1 && (
                          <button
                            onClick={() => handleRemoveStep(index)}
                            className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Step Label *
                        </label>
                        <input
                          type="text"
                          value={step.label}
                          onChange={(e) => handleStepChange(index, 'label', e.target.value)}
                          placeholder="e.g., Supervisor Review"
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                          placeholder="Brief description of this step"
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Assigned To *
                        </label>
                        <select
                          value={step.assignee_value}
                          onChange={(e) => handleStepChange(index, 'assignee_value', e.target.value)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        >
                          <option value="">Select role...</option>
                          {ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Conditional Step */}
                      <div>
                        {step.conditions ? (
                          <div className="flex items-center space-x-2">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Only required if amount exceeds:
                            </label>
                            <input
                              type="number"
                              value={step.conditions.amount_threshold || 0}
                              onChange={(e) => handleConditionChange(index, e.target.value)}
                              className="w-32 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                            <button
                              onClick={() => handleRemoveCondition(index)}
                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddCondition(index)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          >
                            + Add amount threshold condition
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              onClick={() => onClose(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
