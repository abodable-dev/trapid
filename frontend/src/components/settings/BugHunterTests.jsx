import { useState, useEffect } from 'react'
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

  const getTestHistory = (testId) => {
    return testHistory.filter(h => h.test_id === testId).slice(0, 10)
  }

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
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
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
                          onClick={() => setShowHistory(showHistory === test.id ? null : test.id)}
                          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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

        {/* History Modal */}
        {showHistory && (
          <div className="mt-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Test Audit History: {tests.find(t => t.id === showHistory)?.name}
              </h3>
              <button
                onClick={() => setShowHistory(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {getTestHistory(showHistory).length > 0 ? (
                getTestHistory(showHistory).map((run, idx) => (
                  <div
                    key={run.id || idx}
                    className={`p-3 rounded-md ${
                      run.status === 'pass'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : run.status === 'fail'
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {run.status === 'pass' ? (
                          <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        ) : run.status === 'fail' ? (
                          <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                        ) : (
                          <span className="text-yellow-600 dark:text-yellow-400 font-bold">⚠</span>
                        )}
                        <span className="text-sm text-gray-900 dark:text-white truncate">
                          {run.message || run.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatDate(run.created_at || run.timestamp)}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {run.duration !== undefined && run.duration !== null && (
                        <div>
                          Duration: <span className="font-medium">{run.duration}s</span>
                        </div>
                      )}
                      {run.template_id && (
                        <div>
                          Template: <span className="font-medium">{scheduleTemplates.find(t => t.id === run.template_id)?.name || `ID ${run.template_id}`}</span>
                        </div>
                      )}
                      <div>
                        Status: <span className="font-medium uppercase">{run.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No test history found</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Run this test to see history</p>
                </div>
              )}
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
