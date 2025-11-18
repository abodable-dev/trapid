import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { PlayIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline'
import toast, { Toaster } from 'react-hot-toast'
import { api } from '../../api'
import GanttTestStatusModal from '../schedule-master/GanttTestStatusModal'

export default function BugHunterTests() {
  const location = useLocation()
  const [tests, setTests] = useState([])
  const [selectedTests, setSelectedTests] = useState([])
  const [runningTests, setRunningTests] = useState(new Set())
  const [testResults, setTestResults] = useState({})
  const [testHistory, setTestHistory] = useState([])
  const [showHistory, setShowHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scheduleTemplates, setScheduleTemplates] = useState([])
  const [selectedTemplates, setSelectedTemplates] = useState({}) // testId -> templateId mapping
  const [searchQuery, setSearchQuery] = useState('')
  const [showTestStatusModal, setShowTestStatusModal] = useState(false)
  const [visualTestId, setVisualTestId] = useState(null)

  // Load tests and history on mount
  useEffect(() => {
    const loadAndShowResults = async () => {
      await loadTests()
      await loadTestHistory()
      await loadScheduleTemplates()

      // Check if we're returning from a visual test with results
      const params = new URLSearchParams(location.search)
      const testResult = params.get('testResult')
      const testId = params.get('testId')

      if (testResult && testId) {
        console.log('🧪 Visual test completed!')
        console.log('🧪 Result:', testResult, 'Test ID:', testId)

        // Show a success/failure alert
        const passed = testResult === 'pass'
        const icon = passed ? '✅' : '❌'
        const message = passed
          ? `Visual Test PASSED! Check the test history below for details.`
          : `Visual Test FAILED. Check the test history below for details.`

        if (passed) {
          toast.success(message, { duration: 5000, icon: icon })
        } else {
          toast.error(message, { duration: 5000, icon: icon })
        }

        // Reload test history to show the latest result
        await loadTestHistory()

        // Clean up URL parameters
        params.delete('testResult')
        params.delete('testId')
        const newSearch = params.toString()
        window.history.replaceState({}, '', `${location.pathname}${newSearch ? '?' + newSearch : ''}`)
      }
    }

    loadAndShowResults()
  }, [])

  const loadTests = async () => {
    try {
      console.log('BugHunter: Loading tests from API...')
      const response = await api.get('/api/v1/bug_hunter_tests')
      console.log('BugHunter: API response:', response)
      console.log('BugHunter: Setting tests:', response.data || response)
      setTests(response.data || response || [])
    } catch (error) {
      console.error('BugHunter: Failed to load tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTestHistory = async () => {
    try {
      const response = await api.get('/api/v1/bug_hunter_tests/history')
      const history = response.data || response || []
      setTestHistory(history)
      return history
    } catch (error) {
      console.error('Failed to load test history:', error)
      return []
    }
  }

  const loadScheduleTemplates = async () => {
    try {
      const response = await api.get('/api/v1/schedule_templates')
      const templates = response.data || response || []
      setScheduleTemplates(templates)
    } catch (error) {
      console.error('Failed to load schedule templates:', error)
    }
  }

  // Set default templates when both tests and templates are loaded
  useEffect(() => {
    if (tests.length > 0 && scheduleTemplates.length > 0 && Object.keys(selectedTemplates).length === 0) {
      const defaultTemplate = scheduleTemplates.find(t => t.is_default) || scheduleTemplates[0]
      if (defaultTemplate) {
        const defaults = {}
        tests.filter(t => t.can_run_visual || t.needs_template).forEach(test => {
          defaults[test.id] = defaultTemplate.id.toString()
        })
        setSelectedTemplates(defaults)
      }
    }
  }, [tests, scheduleTemplates, selectedTemplates])

  const cleanupOldData = async () => {
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      await api.delete('/api/v1/bug_hunter_tests/cleanup', {
        params: { before: weekAgo.toISOString() }
      })
    } catch (error) {
      console.error('Failed to cleanup old data:', error)
    }
  }

  const checkAndCleanup = async () => {
    const today = new Date().toDateString()
    const lastCleanup = localStorage.getItem('lastBugHunterCleanup')

    if (lastCleanup !== today) {
      await cleanupOldData()
      localStorage.setItem('lastBugHunterCleanup', today)
    }
  }

  const toggleTestSelection = (testId) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    )
  }

  const toggleAllTests = () => {
    if (selectedTests.length === tests.length) {
      setSelectedTests([])
    } else {
      setSelectedTests(tests.map(t => t.id))
    }
  }

  const runTest = async (testId, visual = false) => {
    await checkAndCleanup()

    if (visual) {
      // Check if template is selected
      const templateId = selectedTemplates[testId]
      if (!templateId) {
        toast.error('Please select a Schedule Template first before running the visual test.', {
          duration: 4000
        })
        return
      }

      // FIRST: Navigate to Schedule Master to show the Gantt chart
      console.log('🧪 Opening Schedule Master Gantt view for visual test...')
      window.location.href = `/settings?tab=schedule-master&subtab=setup&template=${templateId}&runVisualTest=${testId}`
      return
    }

    setRunningTests(prev => new Set([...prev, testId]))

    try {
      let result

      // Run test via API, passing template ID
      const templateId = selectedTemplates[testId]
      const response = await api.post(`/api/v1/bug_hunter_tests/${testId}/run`, {
        template_id: templateId
      })
      result = response.data || response

      // Update local test results
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          status: result.passed ? 'pass' : 'fail',
          message: result.message,
          timestamp: new Date().toISOString(),
          duration: result.testDuration || result.duration
        }
      }))

      // Reload test history to show in table
      await loadTestHistory()

      // Show toast notification with result
      const testName = tests.find(t => t.id === testId)?.name || testId
      if (result.passed) {
        toast.success(`✓ ${testName}: ${result.message}`, {
          duration: 4000
        })
      } else {
        toast.error(`✗ ${testName}: ${result.message}`, {
          duration: 6000
        })
      }

    } catch (error) {
      const testName = tests.find(t => t.id === testId)?.name || testId
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'

      setTestResults(prev => ({
        ...prev,
        [testId]: {
          status: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString()
        }
      }))

      // Still reload history even on error
      await loadTestHistory()

      toast.error(`Error running ${testName}: ${errorMessage}`, {
        duration: 6000
      })
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev)
        newSet.delete(testId)
        return newSet
      })
    }
  }

  const runSelectedTests = async () => {
    for (const testId of selectedTests) {
      await runTest(testId, false)
    }
  }

  const handleTestModalClose = async () => {
    setShowTestStatusModal(false)
    setVisualTestId(null)
    // Reload test history to show the latest results
    await loadTestHistory()
  }

  const handleTemplateChange = (testId, templateId) => {
    setSelectedTemplates(prev => ({
      ...prev,
      [testId]: templateId
    }))
  }

  const getLastRun = (testId) => {
    const history = testHistory.filter(h => h.test_id === testId)
    if (history.length === 0) return null
    return history[0]
  }

  const getTestHistory = useMemo(() => {
    return (testId) => {
      const history = testHistory.filter(h => h.test_id === testId).slice(0, 10)
      console.log('getTestHistory for', testId, '- Found', history.length, 'runs:', history)
      return history
    }
  }, [testHistory])

  const filteredTests = tests.filter(test => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      test.name.toLowerCase().includes(query) ||
      test.type.toLowerCase().includes(query) ||
      test.rules.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading tests...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          success: {
            duration: 5000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-full">
          <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Bug Hunter Tests</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Automated tests for Gantt schedule cascading, dependencies, and performance
              </p>
            </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-2">
            <button
              onClick={async () => {
                await loadTestHistory()
                toast.success('Test history refreshed', { duration: 2000 })
              }}
              className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
            >
              <ClockIcon className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={runSelectedTests}
              disabled={selectedTests.length === 0 || runningTests.size > 0}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="h-4 w-4" />
              Run Selected ({selectedTests.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tests by name, type, or rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="w-12 px-3 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTests.length === filteredTests.length && filteredTests.length > 0}
                    onChange={toggleAllTests}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Test Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Rules
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Schedule Template
                </th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Visual
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Last Run
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTests.map((test) => {
                const isRunning = runningTests.has(test.id)
                const result = testResults[test.id]
                const lastRun = getLastRun(test.id)
                const status = result?.status || lastRun?.status

                // Determine row background color
                let rowClass = ''
                if (status === 'pass') {
                  rowClass = 'bg-green-50 dark:bg-green-900/20'
                } else if (status === 'fail' || status === 'error') {
                  rowClass = 'bg-red-50 dark:bg-red-900/20'
                }

                return (
                  <tr key={test.id} className={rowClass}>
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => toggleTestSelection(test.id)}
                        disabled={isRunning}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {test.name}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                        {test.type}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-md">
                      {test.rules}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {(test.can_run_visual || test.needs_template) ? (
                        <select
                          value={selectedTemplates[test.id] || ''}
                          onChange={(e) => handleTemplateChange(test.id, e.target.value)}
                          disabled={isRunning}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm py-1.5 px-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        >
                          <option value="">Select template...</option>
                          {scheduleTemplates.map(template => (
                            <option key={template.id} value={template.id.toString()}>
                              {template.name} {template.is_default ? '(Default)' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-center">
                      {test.can_run_visual ? (
                        <button
                          onClick={() => runTest(test.id, true)}
                          disabled={isRunning}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Run with visual feedback (will open Gantt automatically)"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-between gap-2">
                        {result || lastRun ? (
                          <div className="flex items-center gap-2">
                            {status === 'pass' ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                            ) : status === 'fail' || status === 'error' ? (
                              <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                            ) : null}
                            <span className="text-xs">
                              {formatDate((result || lastRun).timestamp || (result || lastRun).created_at)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Never run</span>
                        )}
                        <button
                          onClick={() => {
                            console.log('Clock clicked for test:', test.id, 'Current showHistory:', showHistory)
                            // Toggle history display
                            setShowHistory(showHistory === test.id ? null : test.id)
                          }}
                          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                          title="View audit history"
                        >
                          <ClockIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right text-sm">
                      <button
                        onClick={() => runTest(test.id, false)}
                        disabled={isRunning}
                        className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRunning ? (
                          <>
                            <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                            Running...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-3 w-3" />
                            Run
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* History Modal Popup */}
        {showHistory && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={() => setShowHistory(null)}
              ></div>

              {/* Center modal */}
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

              {/* Modal panel */}
              <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    onClick={() => setShowHistory(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4" id="modal-title">
                      Test Audit History: {tests.find(t => t.id === showHistory)?.name}
                    </h3>

                    <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3">
                      {getTestHistory(showHistory).length > 0 ? (
                        getTestHistory(showHistory).map((run, idx) => (
                          <div
                            key={run.id || idx}
                            className={`p-4 rounded-lg ${
                              run.status === 'pass'
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : run.status === 'fail'
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              {run.status === 'pass' ? (
                                <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                              ) : run.status === 'fail' ? (
                                <span className="text-red-600 dark:text-red-400 font-bold text-xl">✗</span>
                              ) : (
                                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xl">⚠</span>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900 dark:text-white font-semibold mb-1">
                                  Run #{run.id} - {run.status === 'pass' ? 'PASSED' : run.status === 'fail' ? 'FAILED' : 'ERROR'}
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  {run.message || run.status.toUpperCase()}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                              <div>
                                <span className="text-gray-500 dark:text-gray-500">Run At:</span>{' '}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {new Date(run.created_at || run.timestamp).toLocaleString('en-AU', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-500">Run By:</span>{' '}
                                <span className="font-medium text-gray-900 dark:text-white">Claude Code (API)</span>
                              </div>
                              {run.duration !== undefined && run.duration !== null && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-500">Duration:</span>{' '}
                                  <span className="font-medium text-gray-900 dark:text-white">{run.duration}s</span>
                                </div>
                              )}
                              {run.template_id && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-500">Template:</span>{' '}
                                  <span className="font-medium text-gray-900 dark:text-white">{scheduleTemplates.find(t => t.id === run.template_id)?.name || `ID ${run.template_id}`}</span>
                                </div>
                              )}
                            </div>
                            {run.console_output && (
                              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Console Output</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(run.console_output)
                                      toast.success('Console output copied to clipboard', { duration: 2000 })
                                    }}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
                                  >
                                    Copy
                                  </button>
                                </div>
                                <pre className="text-xs bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto font-mono">
{run.console_output}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <ClockIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-base text-gray-500 dark:text-gray-400 font-medium">No test history found</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Run this test to see history</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gantt Test Status Modal */}
        <GanttTestStatusModal
          isOpen={showTestStatusModal}
          onClose={handleTestModalClose}
          onOpenGantt={() => {
            // Navigate to Schedule Master tab with the selected template
            const templateId = visualTestId ? selectedTemplates[visualTestId] : null
            if (templateId) {
              window.location.href = `/settings?tab=schedule-master&subtab=setup&template=${templateId}`
            }
          }}
          templateId={visualTestId ? selectedTemplates[visualTestId] : null}
        />
      </div>
    </div>
    </>
  )
}
