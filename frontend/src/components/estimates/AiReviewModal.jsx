import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import {
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlusCircleIcon,
  BeakerIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { api } from '../../api'
import SeverityBadge from './SeverityBadge'

export default function AiReviewModal({ isOpen, onClose, estimateId, estimateName }) {
  const [status, setStatus] = useState('idle') // idle, processing, completed, failed
  const [reviewData, setReviewData] = useState(null)
  const [error, setError] = useState(null)
  const [pollInterval, setPollInterval] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(60)

  useEffect(() => {
    if (isOpen && estimateId) {
      startReview()
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [isOpen, estimateId])

  useEffect(() => {
    if (status === 'processing') {
      const countdown = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1))
      }, 1000)

      return () => clearInterval(countdown)
    }
  }, [status])

  const startReview = async () => {
    try {
      setStatus('processing')
      setError(null)
      setTimeRemaining(60)

      // Start AI review
      const response = await api.post(`/api/v1/estimates/${estimateId}/ai_review`)
      const reviewId = response.review_id

      // Poll for results every 5 seconds
      const interval = setInterval(async () => {
        try {
          const result = await api.get(`/api/v1/estimate_reviews/${reviewId}`)

          if (result.status === 'completed') {
            clearInterval(interval)
            setPollInterval(null)
            setStatus('completed')
            setReviewData(result)
          } else if (result.status === 'failed') {
            clearInterval(interval)
            setPollInterval(null)
            setStatus('failed')
            setError(result.error_message || 'AI review failed. Please try again.')
          }
        } catch (err) {
          console.error('Polling error:', err)
          clearInterval(interval)
          setPollInterval(null)
          setStatus('failed')
          setError('Failed to check review status. Please try again.')
        }
      }, 5000)

      setPollInterval(interval)
    } catch (err) {
      console.error('Error starting AI review:', err)
      setStatus('failed')

      // Handle specific error cases
      const errorMessage = err.response?.data?.error || err.message
      if (errorMessage?.includes('OneDrive')) {
        setError('OneDrive not connected. Please connect OneDrive in Settings to upload plan documents.')
      } else if (errorMessage?.includes('plan documents')) {
        setError('No plan documents found in OneDrive. Please upload PDF construction plans to analyze.')
      } else if (errorMessage?.includes('matched')) {
        setError('Estimate must be matched to a job before running AI review.')
      } else {
        setError('Failed to start AI review. Please try again.')
      }
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setError(null)
    setReviewData(null)
    startReview()
  }

  const handleClose = () => {
    if (pollInterval) {
      clearInterval(pollInterval)
      setPollInterval(null)
    }
    setStatus('idle')
    setError(null)
    setReviewData(null)
    setTimeRemaining(60)
    onClose()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const summary = reviewData?.summary || {}
  const discrepancies = reviewData?.discrepancies || []

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30 dark:bg-black/50" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Plan Review
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {estimateName || `Estimate #${estimateId}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Processing State */}
            {status === 'processing' && (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                  <SparklesIcon className="absolute inset-0 m-auto h-8 w-8 text-indigo-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Analyzing construction plans with AI...
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This may take 30-60 seconds
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Time remaining: ~{formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
            )}

            {/* Failed State */}
            {status === 'failed' && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex">
                  <XCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                      AI Review Failed
                    </h3>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                    <button
                      onClick={handleRetry}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Completed State */}
            {status === 'completed' && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div className="text-xs font-medium text-green-900 dark:text-green-400">
                        Matched
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-green-900 dark:text-green-400">
                      {summary.items_matched || 0}
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                      <div className="text-xs font-medium text-yellow-900 dark:text-yellow-500">
                        Mismatches
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-yellow-900 dark:text-yellow-500">
                      {summary.mismatches || 0}
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div className="text-xs font-medium text-red-900 dark:text-red-400">
                        Missing
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-red-900 dark:text-red-400">
                      {summary.missing || 0}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <PlusCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div className="text-xs font-medium text-blue-900 dark:text-blue-400">
                        Extra
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-400">
                      {summary.extra || 0}
                    </div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BeakerIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-900 dark:text-indigo-400">
                        Confidence Score
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">
                      {summary.confidence_score || 0}%
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${summary.confidence_score || 0}%` }}
                    />
                  </div>
                </div>

                {/* No Discrepancies - Success State */}
                {discrepancies.length === 0 && (
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-green-900 dark:text-green-400 mb-2">
                      All quantities match!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      No discrepancies found between construction plans and estimate.
                    </p>
                  </div>
                )}

                {/* Discrepancies Table */}
                {discrepancies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Discrepancies Found ({discrepancies.length})
                    </h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Severity
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Plans
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Estimate
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Difference
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Recommendation
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {discrepancies.map((discrepancy, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <SeverityBadge severity={discrepancy.severity} />
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                  {discrepancy.item_name}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                                  {discrepancy.plan_quantity !== null ? discrepancy.plan_quantity : '-'}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                                  {discrepancy.estimate_quantity !== null ? discrepancy.estimate_quantity : '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {discrepancy.difference_percent !== null ? (
                                    <span className={`
                                      text-sm font-medium
                                      ${Math.abs(discrepancy.difference_percent) > 20 ? 'text-red-600 dark:text-red-400' :
                                        Math.abs(discrepancy.difference_percent) > 10 ? 'text-yellow-600 dark:text-yellow-500' :
                                        'text-green-600 dark:text-green-400'}
                                    `}>
                                      {discrepancy.difference_percent > 0 ? '+' : ''}{discrepancy.difference_percent}%
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                  {discrepancy.recommendation || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {status === 'completed' && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Run Again
              </button>

              <div className="flex items-center space-x-3">
                {/* Future: Export PDF button */}
                {/* <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export PDF
                </button> */}

                {/* Future: Update Estimate button */}
                {/* <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Update Estimate
                </button> */}

                <button
                  onClick={handleClose}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
