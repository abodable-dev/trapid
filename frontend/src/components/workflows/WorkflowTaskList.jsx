import { useState, useEffect } from 'react'
import { ClockIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'
import { useNavigate } from 'react-router-dom'

export default function WorkflowTaskList() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get('/api/v1/workflow_steps')

      if (response.success) {
        setTasks(response.workflow_steps || [])
      } else {
        setError('Failed to load workflow tasks')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load workflow tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskClick = (task) => {
    // Navigate to the appropriate page based on subject type
    const subjectType = task.workflow_instance?.subject_type
    const subjectId = task.workflow_instance?.subject_id

    if (subjectType === 'PurchaseOrder') {
      navigate(`/jobs/${task.workflow_instance.subject.construction_id}/purchase-orders/${subjectId}`)
    } else if (subjectType === 'Construction') {
      navigate(`/jobs/${subjectId}`)
    } else if (subjectType === 'Estimate') {
      navigate(`/jobs/${task.workflow_instance.subject.construction_id}/estimates/${subjectId}`)
    }
  }

  const getStepLabel = (stepName) => {
    return stepName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getWorkflowTypeBadge = (workflowType) => {
    const colors = {
      purchase_order_approval: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      job_approval: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      estimate_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      quote_approval: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      contract_approval: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      document_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      change_order_approval: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      invoice_approval: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    }

    return colors[workflowType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
            Pending Approvals
          </h3>
          {tasks.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No pending approvals
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWorkflowTypeBadge(task.workflow_instance?.workflow_definition?.workflow_type)}`}>
                      {task.workflow_instance?.workflow_definition?.name}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getStepLabel(task.step_name)}
                  </p>

                  {task.data?.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {task.data.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      {task.workflow_instance?.subject_type}
                    </span>
                    <span>
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
