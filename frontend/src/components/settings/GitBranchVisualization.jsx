import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function GitBranchVisualization() {
  const [branchData, setBranchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBranchData()
  }, [])

  const fetchBranchData = async () => {
    try {
      setLoading(true)
      console.log('Fetching branch data from /api/v1/git/branch_status')
      const response = await api.get('/api/v1/git/branch_status')
      console.log('Branch data received:', response)
      setBranchData(response)
      setError(null)
    } catch (err) {
      console.error('Error fetching branch data:', err)
      setError('Failed to load branch information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
    )
  }

  if (!branchData) {
    return null
  }

  const { current_branch, branches, commit_stats } = branchData

  // Determine branch status colors
  const getBranchColor = (branch) => {
    if (branch.name === 'main') return 'text-blue-600 dark:text-blue-400'
    if (branch.name === 'rob') return 'text-green-600 dark:text-green-400'
    if (branch.name === 'jake') return 'text-purple-600 dark:text-purple-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getBranchBgColor = (branch) => {
    if (branch.name === 'main') return 'bg-blue-100 dark:bg-blue-900/30'
    if (branch.name === 'rob') return 'bg-green-100 dark:bg-green-900/30'
    if (branch.name === 'jake') return 'bg-purple-100 dark:bg-purple-900/30'
    return 'bg-gray-100 dark:bg-gray-800'
  }

  const getStatusBadge = (branch) => {
    if (branch.is_current) {
      return <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">Current</span>
    }
    if (branch.deployed_to_heroku) {
      return <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">Deployed</span>
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Git Branch Status</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Current branch: <span className="font-medium text-gray-900 dark:text-white">{current_branch}</span>
          </p>
        </div>
        <button
          onClick={fetchBranchData}
          className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Branch Tree Visualization */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-6">
        <div className="space-y-4">
          {branches.map((branch, index) => (
            <div key={branch.name} className="relative">
              {/* Connection lines */}
              {index > 0 && (
                <div className="absolute left-6 -top-4 h-4 w-px bg-gray-300 dark:bg-gray-700" />
              )}

              {/* Branch node */}
              <div className={`flex items-start space-x-4 rounded-lg p-4 ${getBranchBgColor(branch)}`}>
                {/* Branch indicator */}
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${branch.is_current ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}>
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Branch info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h4 className={`text-lg font-semibold ${getBranchColor(branch)}`}>
                        {branch.name}
                      </h4>
                      {getStatusBadge(branch)}
                    </div>

                    {/* Commits ahead/behind */}
                    {branch.commits_comparison && (
                      <div className="flex items-center space-x-4 text-sm">
                        {branch.commits_comparison.ahead > 0 && (
                          <span className="inline-flex items-center text-green-700 dark:text-green-300">
                            <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                            </svg>
                            {branch.commits_comparison.ahead} ahead
                          </span>
                        )}
                        {branch.commits_comparison.behind > 0 && (
                          <span className="inline-flex items-center text-red-700 dark:text-red-300">
                            <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            </svg>
                            {branch.commits_comparison.behind} behind
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Last commit */}
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-mono text-xs">{branch.last_commit.hash}</p>
                    <p className="mt-1">{branch.last_commit.message}</p>
                    <p className="mt-1 text-xs">
                      by {branch.last_commit.author} • {branch.last_commit.date}
                    </p>
                  </div>

                  {/* Remote info */}
                  {branch.remote_info && (
                    <div className="mt-2 flex items-center space-x-4 text-xs">
                      {branch.remote_info.origin && (
                        <span className="inline-flex items-center text-gray-600 dark:text-gray-400">
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          origin
                        </span>
                      )}
                      {branch.remote_info.heroku && (
                        <span className="inline-flex items-center text-purple-600 dark:text-purple-400">
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          heroku
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {commit_stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Branches</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{commit_stats.total_branches}</dd>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Local Branches</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{commit_stats.local_branches}</dd>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Remote Branches</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{commit_stats.remote_branches}</dd>
          </div>
        </div>
      )}
    </div>
  )
}
