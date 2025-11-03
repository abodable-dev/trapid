import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatCurrency, formatPercentage } from '../utils/formatters'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

export default function ActiveJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    loadJobs()
  }, [currentPage])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `/api/v1/constructions?status=Active&page=${currentPage}&per_page=50`
      )
      setJobs(response.constructions || [])
      setTotalPages(response.pagination?.total_pages || 1)
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

  const handleAddJob = async () => {
    try {
      await api.post('/api/v1/constructions', {
        construction: {
          title: 'New Construction Job',
          status: 'Active',
          stage: 'Planning'
        }
      })
      await loadJobs()
    } catch (err) {
      console.error('Failed to add job:', err)
      alert('Failed to add job')
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Active Jobs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Construction projects currently in progress
            </p>
          </div>
          <button
            onClick={handleAddJob}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Job
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contract Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Live Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profit %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No active jobs found. Click "Add Job" to create one.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCell?.jobId === job.id && editingCell?.field === 'title' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={() => handleCellClick(job.id, 'title', job.title)}
                            className="text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 px-2 py-1 rounded"
                          >
                            {job.title || '-'}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCell?.jobId === job.id && editingCell?.field === 'contract_value' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={() => handleCellClick(job.id, 'contract_value', job.contract_value)}
                            className="text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 px-2 py-1 rounded"
                          >
                            {job.contract_value ? formatCurrency(job.contract_value) : '-'}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCell?.jobId === job.id && editingCell?.field === 'live_profit' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={() => handleCellClick(job.id, 'live_profit', job.live_profit)}
                            className={`text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 px-2 py-1 rounded ${
                              job.live_profit >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {job.live_profit ? formatCurrency(job.live_profit) : '-'}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCell?.jobId === job.id && editingCell?.field === 'profit_percentage' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={() => handleCellClick(job.id, 'profit_percentage', job.profit_percentage)}
                            className={`text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 px-2 py-1 rounded ${
                              job.profit_percentage >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {job.profit_percentage ? formatPercentage(job.profit_percentage, 2) : '-'}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCell?.jobId === job.id && editingCell?.field === 'stage' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <div
                            onClick={() => handleCellClick(job.id, 'stage', job.stage)}
                            className="text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 px-2 py-1 rounded"
                          >
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {job.stage || 'Not Set'}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
