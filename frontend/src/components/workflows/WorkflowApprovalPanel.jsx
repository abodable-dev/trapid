import { useState } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function WorkflowApprovalPanel({ workflowInstance, currentStep, onActionComplete }) {
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [error, setError] = useState(null)

  const handleApprove = async () => {
    if (!currentStep) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post(`/api/v1/workflow_steps/${currentStep.id}/approve`, {
        comment: comment || null
      })

      if (response.success) {
        setComment('')
        setShowCommentBox(false)
        onActionComplete?.()
      } else {
        setError(response.error || 'Failed to approve')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve workflow step')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!currentStep || !comment) {
      setError('Please provide a reason for rejection')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post(`/api/v1/workflow_steps/${currentStep.id}/reject`, {
        comment
      })

      if (response.success) {
        setComment('')
        setShowCommentBox(false)
        onActionComplete?.()
      } else {
        setError(response.error || 'Failed to reject')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject workflow step')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!currentStep || !comment) {
      setError('Please provide details for requested changes')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post(`/api/v1/workflow_steps/${currentStep.id}/request_changes`, {
        comment
      })

      if (response.success) {
        setComment('')
        setShowCommentBox(false)
        onActionComplete?.()
      } else {
        setError(response.error || 'Failed to request changes')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request changes')
    } finally {
      setIsLoading(false)
    }
  }

  if (!workflowInstance) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'rejected':
        return 'text-red-600 dark:text-red-400'
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400'
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'in_progress':
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Workflow Approval
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {workflowInstance.workflow_definition?.name}
        </p>
      </div>

      {/* Workflow Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <span className={`text-sm font-semibold ${getStatusColor(workflowInstance.status)}`}>
            {workflowInstance.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Current Step */}
      {currentStep && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            {getStatusIcon(currentStep.status)}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {currentStep.step_name.replace('_', ' ').toUpperCase()}
              </h4>
              {currentStep.data?.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {currentStep.data.description}
                </p>
              )}
              {currentStep.assigned_to && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Assigned to: {currentStep.assigned_to.name}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-3">
            {showCommentBox && (
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your comments here..."
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Approve
              </button>

              <button
                onClick={() => setShowCommentBox(!showCommentBox)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                Add Comment
              </button>

              {showCommentBox && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={isLoading || !comment}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Reject
                  </button>

                  <button
                    onClick={handleRequestChanges}
                    disabled={isLoading || !comment}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workflow History */}
      {workflowInstance.workflow_steps && workflowInstance.workflow_steps.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Approval History
          </h4>
          <div className="space-y-2">
            {workflowInstance.workflow_steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {step.step_name.replace('_', ' ').toUpperCase()}
                    </p>
                    {step.comment && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {step.comment}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(step.status)}`}>
                  {step.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
