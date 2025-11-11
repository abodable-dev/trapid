import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import WorkflowDefinitionEditor from '../components/workflows/WorkflowDefinitionEditor'

export default function WorkflowAdminPage() {
  const [workflows, setWorkflows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get('/api/v1/workflow_definitions')

      if (response.success) {
        setWorkflows(response.workflow_definitions || [])
      } else {
        setError('Failed to load workflows')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load workflows')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (workflow) => {
    setSelectedWorkflow(workflow)
    setShowEditor(true)
  }

  const handleNew = () => {
    setSelectedWorkflow(null)
    setShowEditor(true)
  }

  const handleDelete = async (workflow) => {
    if (!confirm(`Are you sure you want to delete "${workflow.name}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await api.delete(`/api/v1/workflow_definitions/${workflow.id}`)

      if (response.success) {
        loadWorkflows()
      } else {
        alert('Failed to delete workflow')
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete workflow')
    }
  }

  const handleToggleActive = async (workflow) => {
    try {
      const response = await api.patch(`/api/v1/workflow_definitions/${workflow.id}`, {
        workflow_definition: {
          active: !workflow.active
        }
      })

      if (response.success) {
        loadWorkflows()
      } else {
        alert('Failed to update workflow')
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update workflow')
    }
  }

  const handleEditorClose = (saved) => {
    setShowEditor(false)
    setSelectedWorkflow(null)
    if (saved) {
      loadWorkflows()
    }
  }

  const getWorkflowTypeLabel = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (showEditor) {
    return (
      <WorkflowDefinitionEditor
        workflow={selectedWorkflow}
        onClose={handleEditorClose}
      />
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workflow Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage approval workflows for your organization
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Workflow
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {workflow.name}
                    </h3>
                    {workflow.active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {workflow.description}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {getWorkflowTypeLabel(workflow.workflow_type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Steps Preview */}
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Steps ({workflow.config?.steps?.length || 0})
                </p>
                <div className="mt-2 space-y-2">
                  {(workflow.config?.steps || []).slice(0, 3).map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium mr-2">
                        {index + 1}
                      </span>
                      <span>{step.label || step.name}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {step.assignee_value}
                      </span>
                    </div>
                  ))}
                  {(workflow.config?.steps?.length || 0) > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                      + {workflow.config.steps.length - 3} more steps
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center space-x-3">
                <button
                  onClick={() => handleEdit(workflow)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="h-4 w-4 mr-1.5" />
                  Edit
                </button>

                <button
                  onClick={() => handleToggleActive(workflow)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {workflow.active ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => handleDelete(workflow)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workflows.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No workflows defined yet. Click "New Workflow" to create one.
          </p>
        </div>
      )}
    </div>
  )
}
