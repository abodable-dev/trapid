import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatCurrency, formatPercentage } from '../utils/formatters'
import {
  PlusIcon,
  BriefcaseIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import NewJobModal from '../components/jobs/NewJobModal'

export default function ActiveJobsPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [showNewJobModal, setShowNewJobModal] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `/api/v1/constructions?status=Active&per_page=1000`
      )
      setJobs(response.constructions || [])
    } catch (err) {
      setError('Failed to load active jobs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCellClick = (jobId, field, currentValue) => {
    setEditingCell({ jobId, field })
    setEditValue(currentValue || '')
  }

  const handleCellBlur = async () => {
    if (!editingCell) return

    const { jobId, field } = editingCell
    const originalJob = jobs.find(j => j.id === jobId)

    if (editValue !== originalJob[field]) {
      try {
        await api.put(`/api/v1/constructions/${jobId}`, {
          construction: {
            [field]: editValue
          }
        })
        await loadJobs()
      } catch (err) {
        console.error('Failed to update job:', err)
        alert('Failed to update job')
      }
    }

    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  const handleCreateJob = async (jobData) => {
    try {
      const response = await api.post('/api/v1/constructions', {
        construction: jobData
      })

      // Refresh the jobs list
      await loadJobs()

      // Navigate to the new job detail page if we have an ID
      if (response.construction && response.construction.id) {
        navigate(`/jobs/${response.construction.id}`)
      }
    } catch (err) {
      console.error('Failed to create job:', err)
      throw err
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600 dark:text-red-400">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Active Jobs
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewJobModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none shadow-lg shadow-indigo-500/30 transition-all"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Job
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-l border-r border-b border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contract Value
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Live Profit
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profit %
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stage
                </th>
                <th className="relative px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No active jobs found. Click "New Job" to create one.
                  </td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>

                      <td className="px-3 py-4">
                        {editingCell?.jobId === job.id && editingCell?.field === 'title' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 text-sm border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 truncate max-w-md"
                              title={job.title}
                            >
                              {job.title || 'Untitled Job'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCellClick(job.id, 'title', job.title)
                              }}
                              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Edit title"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                        {editingCell?.jobId === job.id && editingCell?.field === 'contract_value' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 text-sm text-right border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCellClick(job.id, 'contract_value', job.contract_value)
                            }}
                            className="text-gray-900 dark:text-white cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded-md"
                            title="Click to edit"
                          >
                            {job.contract_value ? formatCurrency(job.contract_value, false) : '-'}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                        {editingCell?.jobId === job.id && editingCell?.field === 'live_profit' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 text-sm text-right border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCellClick(job.id, 'live_profit', job.live_profit)
                            }}
                            className={`cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded-md font-medium ${
                              job.live_profit >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                            title="Click to edit"
                          >
                            {job.live_profit ? formatCurrency(job.live_profit, false) : '-'}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                        {editingCell?.jobId === job.id && editingCell?.field === 'profit_percentage' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 text-sm text-right border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCellClick(job.id, 'profit_percentage', job.profit_percentage)
                            }}
                            className={`cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded-md font-medium ${
                              job.profit_percentage >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                            title="Click to edit"
                          >
                            {job.profit_percentage ? formatPercentage(job.profit_percentage, 2) : '-'}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {editingCell?.jobId === job.id && editingCell?.field === 'stage' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 text-sm border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCellClick(job.id, 'stage', job.stage)
                            }}
                            className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded-md inline-block"
                            title="Click to edit"
                          >
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                              {job.stage || 'Not Set'}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          title="View job details"
                        >
                          View
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </button>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* New Job Modal */}
        <NewJobModal
          isOpen={showNewJobModal}
          onClose={() => setShowNewJobModal(false)}
          onSuccess={handleCreateJob}
        />
      </div>
    </div>
  )
}
