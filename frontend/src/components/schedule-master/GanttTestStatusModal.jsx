import { XMarkIcon, PlayIcon, ArrowPathIcon, BeakerIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { api } from '../../api'

/**
 * GanttTestStatusModal - Shows the 10 Bug Hunter tests in a table with live test execution
 * With tabs for manual and automated test results
 */
export default function GanttTestStatusModal({ isOpen, onClose, onOpenGantt, templateId }) {
  const [isRunningAutomatedTest, setIsRunningAutomatedTest] = useState(false)
  const [automatedTestResult, setAutomatedTestResult] = useState(null)

  // Auto-switch to automated tab when modal opens
  useEffect(() => {
    if (isOpen) {
      // Clear any previous test result when opening
      setAutomatedTestResult(null)
    }
  }, [isOpen])

  // Expose automated test API globally
  useEffect(() => {
    if (isOpen) {
      window.runGanttAutomatedTest = async (options) => {
        console.log('🧪 Running Gantt Automated Test via API...', options || {})
        const result = await runAutomatedDragTest(options)
        console.log('🧪 Test Result:', result)
        return result
      }
      console.log('✅ Gantt Automated Test API is ready! Use: window.runGanttAutomatedTest()')
      console.log('   Options: { silent: true/false, visual: true/false, customTaskId: <task_id> }')
    }
    return () => {
      if (window.runGanttAutomatedTest) {
        delete window.runGanttAutomatedTest
      }
    }
  }, [isOpen])

  const runAutomatedDragTest = async (options = {}) => {
    const { silent = false, visual = false, customTaskId = null } = options

    setIsRunningAutomatedTest(true)
    setAutomatedTestResult(null)

    const testSteps = []
    const testStartTime = Date.now()

    // Helper to update visual progress in real-time
    const updateProgress = async (step, delayMs = visual ? 800 : 0) => {
      testSteps.push(step)
      if (visual) {
        setAutomatedTestResult({
          status: 'info',
          message: 'Running visual test...',
          details: {
            steps: [...testSteps]
          }
        })
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      }
    }

    try {
      // Check if Gantt instance is available
      if (!window.gantt) {
        // If Gantt is not loaded and we have the onOpenGantt callback, open it automatically
        if (onOpenGantt) {
          console.log('🧪 Gantt not loaded - opening Gantt view automatically...')
          await updateProgress('📍 Opening Gantt view (Gantt not currently loaded)...')

          // Open the Gantt view
          onOpenGantt()

          // Wait for Gantt to load
          let attempts = 0
          const maxAttempts = 20 // 10 seconds max wait

          while (!window.gantt && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500))
            attempts++
          }

          if (!window.gantt) {
            const errorResult = {
              status: 'error',
              passed: false,
              message: 'Gantt chart failed to load after 10 seconds',
              details: {
                steps: testSteps.concat([
                  '📍 Opened Gantt view',
                  '❌ Gantt failed to load within 10 seconds'
                ])
              }
            }
            setAutomatedTestResult(errorResult)
            setIsRunningAutomatedTest(false)
            return errorResult
          }

          await updateProgress('✅ Gantt view opened successfully')

          // Wait for tasks to actually load in Gantt
          let tasksLoaded = false
          let waitAttempts = 0
          const maxWaitAttempts = 20 // 10 seconds max

          while (!tasksLoaded && waitAttempts < maxWaitAttempts) {
            // Calculate remaining seconds
            const remainingSeconds = Math.ceil((maxWaitAttempts - waitAttempts) * 0.5)

            setAutomatedTestResult({
              status: 'info',
              message: `Waiting for tasks to load... ${remainingSeconds}s`,
              details: {
                steps: testSteps.concat([`⏳ Waiting for tasks to load into Gantt chart... (${remainingSeconds}s remaining)`])
              }
            })

            await new Promise(resolve => setTimeout(resolve, 500))

            // Check if tasks are loaded
            const taskCount = window.gantt.getTaskByTime ? window.gantt.getTaskByTime().length : 0
            if (taskCount > 0) {
              tasksLoaded = true
              await updateProgress(`✅ Tasks loaded successfully (${taskCount} tasks found)`)
            }
            waitAttempts++
          }

          if (!tasksLoaded) {
            const errorResult = {
              status: 'error',
              passed: false,
              message: 'Tasks failed to load in Gantt chart after 10 seconds',
              details: {
                steps: testSteps.concat([
                  '⏳ Waited for tasks to load...',
                  '❌ No tasks loaded after 10 seconds'
                ])
              }
            }
            setAutomatedTestResult(errorResult)
            setIsRunningAutomatedTest(false)
            return errorResult
          }

          // Wait a bit more for UI to stabilize
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          const errorResult = {
            status: 'error',
            passed: false,
            message: 'Gantt chart not available. Please open the Gantt view first.',
            details: null
          }
          setAutomatedTestResult(errorResult)
          setIsRunningAutomatedTest(false)
          return errorResult
        }
      }

      const gantt = window.gantt

      // Check if tasks are already loaded
      let initialTasks = []
      gantt.eachTask((task) => {
        initialTasks.push(task)
      })

      // If no tasks found and we have the callback, open the Gantt view
      if (initialTasks.length === 0 && onOpenGantt) {
        console.log('🧪 Gantt instance exists but no tasks loaded - opening Gantt view...')
        await updateProgress('📍 Gantt instance exists but no tasks found - opening Gantt view...')

        // Open the Gantt view
        onOpenGantt()

        // Wait a bit for the modal to open
        await new Promise(resolve => setTimeout(resolve, 1000))
        await updateProgress('✅ Gantt view opened - waiting for tasks...')
      } else if (initialTasks.length > 0) {
        await updateProgress(`✅ Gantt instance found with ${initialTasks.length} tasks loaded`)
      } else {
        await updateProgress('✅ Gantt instance found - checking for tasks...')
      }

      // Wait for tasks to load
      let tasksLoaded = false
      let waitAttempts = 0
      const maxWaitAttempts = 20 // 10 seconds max

      while (!tasksLoaded && waitAttempts < maxWaitAttempts) {
        // Calculate remaining seconds
        const remainingSeconds = Math.ceil((maxWaitAttempts - waitAttempts) * 0.5)

        setAutomatedTestResult({
          status: 'info',
          message: `Waiting for tasks to load... ${remainingSeconds}s`,
          details: {
            steps: testSteps.concat([`⏳ Waiting for tasks to load... (${remainingSeconds}s remaining)`])
          }
        })

        // Find all tasks
        const tasks = []
        gantt.eachTask((task) => {
          tasks.push(task)
        })

        if (tasks.length > 0) {
          tasksLoaded = true
          await updateProgress(`✅ Tasks loaded successfully (${tasks.length} tasks found)`)
        } else {
          await new Promise(resolve => setTimeout(resolve, 500))
          waitAttempts++
        }
      }

      if (!tasksLoaded) {
        setAutomatedTestResult({
          status: 'error',
          message: 'No tasks available in Gantt chart after 10 seconds',
          details: {
            steps: testSteps.concat([
              '⏳ Waited for tasks to load...',
              '❌ No tasks found in Gantt chart after 10 seconds',
              'ℹ️ This may indicate the template is empty or tasks failed to load'
            ])
          }
        })
        setIsRunningAutomatedTest(false)
        return
      }

      // Find all tasks again for the test
      const tasks = []
      gantt.eachTask((task) => {
        tasks.push(task)
      })

      // STEP 1: Select task (first task or custom task by ID)
      let testTask
      if (customTaskId) {
        testTask = tasks.find(t => t.id === customTaskId)
        if (!testTask) {
          setAutomatedTestResult({
            status: 'error',
            message: `Task with ID ${customTaskId} not found`,
            details: null
          })
          setIsRunningAutomatedTest(false)
          return { status: 'error', message: `Task with ID ${customTaskId} not found` }
        }
        await updateProgress(`✅ Step 1: Selected custom task - #${testTask.id} "${testTask.text}"`)
        console.log('🧪 Test Step 1: Selected custom task:', testTask.id, testTask.text)
      } else {
        testTask = tasks[0]
        await updateProgress(`✅ Step 1: Selected task one - #${testTask.id} "${testTask.text}"`)
        console.log('🧪 Test Step 1: Selected task one:', testTask.id, testTask.text)
      }

      // Get successor tasks (dependencies) before the move
      const successorLinks = gantt.getLinks().filter(link => link.source === testTask.id)
      const successorTasks = successorLinks.map(link => {
        const successorTask = gantt.getTask(link.target)
        return {
          id: successorTask.id,
          text: successorTask.text,
          originalStartDate: new Date(successorTask.start_date),
          linkType: link.type // 0=FS, 1=SS, 2=FF, 3=SF
        }
      })
      await updateProgress(`✅ Step 2: Found ${successorTasks.length} successor task(s) to monitor`)
      console.log('🧪 Test Step 2: Successor tasks:', successorTasks)

      // Reset Bug Hunter
      if (window.ganttBugHunter) {
        window.ganttBugHunter.reset()
        await updateProgress('✅ Step 3: Bug Hunter reset')
        console.log('🧪 Test Step 3: Bug Hunter reset')
      } else {
        setAutomatedTestResult({
          status: 'error',
          message: 'Bug Hunter not initialized',
          details: null
        })
        setIsRunningAutomatedTest(false)
        return
      }

      // Get original task state
      const originalStartDate = new Date(testTask.start_date)
      const originalHold = testTask.hold || false
      await updateProgress(`✅ Step 4: Captured original state - Start: ${originalStartDate.toLocaleDateString()}, Hold: ${originalHold}`)
      console.log('🧪 Test Step 4: Original state:', { originalStartDate, originalHold })

      // STEP 2: Move task forward by 5 days and trigger backend cascade
      const newStartDate = new Date(originalStartDate)
      newStartDate.setDate(newStartDate.getDate() + 5)
      await updateProgress(`✅ Step 5: Moving task 5 days forward (${originalStartDate.toLocaleDateString()} → ${newStartDate.toLocaleDateString()})`)
      console.log('🧪 Test Step 5: Moving task from', originalStartDate, 'to', newStartDate)

      // Calculate day offset from project start (today)
      const projectStartDate = new Date()
      projectStartDate.setHours(0, 0, 0, 0)
      const dayOffset = Math.floor((newStartDate - projectStartDate) / (1000 * 60 * 60 * 24))

      // Check template ID is available (passed as prop from parent)
      if (!templateId) {
        setAutomatedTestResult({
          status: 'error',
          message: 'Cannot find template ID - modal not initialized properly',
          details: {
            steps: testSteps.concat(['❌ Template ID not provided to modal'])
          }
        })
        setIsRunningAutomatedTest(false)
        return
      }

      // Call backend API to update task and trigger cascade
      try {
        const data = await api.patch(`/api/v1/schedule_templates/${templateId}/rows/${testTask.id}`, {
          schedule_template_row: {
            start_date: dayOffset,
            duration: testTask.duration,
            manually_positioned: true // Set to true to lock the position
          }
        })
        console.log('🧪 Backend cascade response:', data)

        // Apply backend updates to Gantt (main task + cascaded tasks)
        const tasksToUpdate = [data.task || data]
        if (data.cascaded_tasks) {
          tasksToUpdate.push(...data.cascaded_tasks)
        }

        // Update all tasks in Gantt
        tasksToUpdate.forEach(task => {
          const ganttTask = gantt.getTask(task.id)
          if (ganttTask) {
            const date = new Date(projectStartDate)
            date.setDate(date.getDate() + task.start_date)
            ganttTask.start_date = date
            ganttTask.duration = task.duration
            gantt.updateTask(ganttTask.id)
          }
        })

        await updateProgress(`✅ Backend cascade triggered - updated ${tasksToUpdate.length} task(s)`)
        console.log('🧪 Applied', tasksToUpdate.length, 'task updates from backend')

      } catch (error) {
        console.error('🧪 Backend API call failed:', error)
        setAutomatedTestResult({
          status: 'error',
          message: `Failed to call backend API: ${error.message}`,
          details: {
            steps: testSteps.concat([`❌ Backend API error: ${error.message}`])
          }
        })
        setIsRunningAutomatedTest(false)
        return
      }

      // Wait for operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000))

      // STEP 3: Check for screen flashes (Gantt reloads)
      const reportAfterMove = window.ganttBugHunter.generateReport()
      const ganttReloads = reportAfterMove.summary.ganttReloads
      const noFlash = ganttReloads <= 1
      await updateProgress(
        noFlash
          ? `✅ Step 6: No screen flashes detected (${ganttReloads} reload${ganttReloads === 1 ? '' : 's'})`
          : `❌ Step 6: Screen flashes detected! (${ganttReloads} reloads, expected ≤1)`
      )
      console.log('🧪 Test Step 6: Screen flash check:', ganttReloads, 'reloads')

      // STEP 4: Check that all dependencies worked correctly
      let dependenciesWorked = true
      const dependencyChecks = []

      for (const successor of successorTasks) {
        try {
          const currentSuccessor = gantt.getTask(successor.id)
          const currentStartDate = new Date(currentSuccessor.start_date)

          // For Finish-to-Start (type 0), successor should move by 5 days
          if (successor.linkType === 0) {
            const expectedDate = new Date(successor.originalStartDate)
            expectedDate.setDate(expectedDate.getDate() + 5)
            const datesMatch = currentStartDate.toDateString() === expectedDate.toDateString()

            if (datesMatch) {
              dependencyChecks.push(`✅ Task #${successor.id} "${successor.text}" moved correctly (+5 days)`)
            } else {
              const daysDiff = Math.round((currentStartDate - successor.originalStartDate) / (1000 * 60 * 60 * 24))
              dependencyChecks.push(`❌ Task #${successor.id} "${successor.text}" moved ${daysDiff} days instead of 5 days (expected ${expectedDate.toLocaleDateString()}, got ${currentStartDate.toLocaleDateString()})`)
              dependenciesWorked = false
            }
          } else if (successor.linkType === 1) {
            // Start-to-Start: successor should also move by 5 days
            const expectedDate = new Date(successor.originalStartDate)
            expectedDate.setDate(expectedDate.getDate() + 5)
            const datesMatch = currentStartDate.toDateString() === expectedDate.toDateString()

            if (datesMatch) {
              dependencyChecks.push(`✅ Task #${successor.id} "${successor.text}" (SS link) moved correctly (+5 days)`)
            } else {
              const daysDiff = Math.round((currentStartDate - successor.originalStartDate) / (1000 * 60 * 60 * 24))
              dependencyChecks.push(`❌ Task #${successor.id} "${successor.text}" (SS link) moved ${daysDiff} days instead of 5`)
              dependenciesWorked = false
            }
          } else if (successor.linkType === 2) {
            // Finish-to-Finish: successor should move if predecessor finish date moved
            dependencyChecks.push(`ℹ️ Task #${successor.id} "${successor.text}" has FF link (finish-to-finish) - manual verification needed`)
          } else if (successor.linkType === 3) {
            // Start-to-Finish: rare case
            dependencyChecks.push(`ℹ️ Task #${successor.id} "${successor.text}" has SF link (start-to-finish) - manual verification needed`)
          }
        } catch (error) {
          dependencyChecks.push(`❌ Error checking task #${successor.id}: ${error.message}`)
          dependenciesWorked = false
        }
      }

      if (successorTasks.length === 0) {
        await updateProgress('⚠️ Step 7: No dependencies to check (task has no successors)')
        // Don't fail the test if there are no dependencies, just note it
      } else {
        await updateProgress(
          dependenciesWorked
            ? `✅ Step 7: All ${successorTasks.length} dependent task(s) cascaded correctly`
            : `❌ Step 7: Some dependencies failed verification (${successorTasks.length} checked)`
        )
        for (const check of dependencyChecks) {
          await updateProgress(`    ${check}`, visual ? 400 : 0)
        }
      }
      console.log('🧪 Test Step 7: Dependency checks:', dependencyChecks)

      // STEP 5: Check if task has predecessors to test "return to original"
      // Only tasks with predecessors can return to original when manually_positioned is unset
      const hasPredecessors = testTask.predecessor_ids && testTask.predecessor_ids.length > 0
      let returnedToOriginal = true // Default to true (meaning "not applicable" for tasks without predecessors)

      if (hasPredecessors) {
        await updateProgress('✅ Step 8: Unticking manual position to allow cascade recalculation...')
        console.log('🧪 Test Step 8: Unticking manual position')

        // Call backend API to unset manually_positioned
        try {
          await api.patch(`/api/v1/schedule_templates/${templateId}/rows/${testTask.id}`, {
            schedule_template_row: {
              manually_positioned: false
            }
          })

          await new Promise(resolve => setTimeout(resolve, 1000))

          // Reload task from Gantt
          const currentTask = gantt.getTask(testTask.id)
          const currentStartDate = new Date(currentTask.start_date)
          returnedToOriginal = currentStartDate.toDateString() === originalStartDate.toDateString()

          if (returnedToOriginal) {
            await updateProgress(`✅ Step 9: Task returned to original position (${originalStartDate.toLocaleDateString()})`)
          } else {
            await updateProgress(`ℹ️ Step 9: Task position recalculated to ${currentStartDate.toLocaleDateString()} (original: ${originalStartDate.toLocaleDateString()})`)
          }
          console.log('🧪 Test Step 9: Return check:', returnedToOriginal, currentStartDate, 'vs', originalStartDate)
        } catch (error) {
          await updateProgress(`❌ Step 8: Failed to unset manual position: ${error.message}`)
          console.error('🧪 Failed to unset manual position:', error)
          returnedToOriginal = false
        }
      } else {
        await updateProgress('ℹ️ Step 8: Skipping "return to original" test - task has no predecessors')
        console.log('🧪 Test Step 8: Task has no predecessors, cannot test return to original')
      }

      // Get final Bug Hunter report
      const finalReport = window.ganttBugHunter.generateReport()
      const apiCalls = finalReport.summary.apiCalls
      const warnings = finalReport.summary.warnings
      const criticalWarnings = finalReport.summary.criticalWarnings

      // Calculate test duration
      const testDuration = Date.now() - testStartTime
      const testDurationSeconds = (testDuration / 1000).toFixed(1)

      // Determine overall pass/fail
      // If there are no dependencies, don't fail the test for dependency checks
      const dependencyCheckPassed = successorTasks.length === 0 || dependenciesWorked
      const allChecksPassed = noFlash && dependencyCheckPassed && returnedToOriginal && criticalWarnings === 0
      const passed = allChecksPassed

      setAutomatedTestResult({
        status: passed ? 'pass' : 'fail',
        message: passed
          ? `✅ PASS - Comprehensive test completed successfully in ${testDurationSeconds}s!`
          : `❌ FAIL - Some test steps failed. Test ran for ${testDurationSeconds}s.`,
        details: {
          taskId: testTask.id,
          taskName: testTask.text,
          steps: testSteps,
          testDuration: testDurationSeconds,
          metrics: {
            apiCalls,
            ganttReloads,
            warnings,
            criticalWarnings,
            noFlash,
            dependenciesWorked: dependencyCheckPassed,
            returnedToOriginal,
            successorCount: successorTasks.length,
            hasDependencies: successorTasks.length > 0
          },
          thresholds: {
            ganttReloads: 'Expected: ≤ 1',
            criticalWarnings: 'Expected: 0',
            dependenciesWorked: 'Expected: true',
            returnedToOriginal: 'Expected: true'
          },
          report: finalReport
        }
      })

      await updateProgress(passed ? '✅ TEST PASSED' : '❌ TEST FAILED', visual ? 1000 : 0)
      console.log('🧪 Automated Test: Complete -', passed ? 'PASS' : 'FAIL')

      // Return result for programmatic access
      return {
        status: passed ? 'pass' : 'fail',
        passed,
        testDuration: testDurationSeconds,
        taskId: testTask.id,
        taskName: testTask.text,
        metrics: {
          apiCalls,
          ganttReloads,
          warnings,
          criticalWarnings,
          noFlash,
          dependenciesWorked: dependencyCheckPassed,
          returnedToOriginal,
          successorCount: successorTasks.length
        },
        steps: testSteps,
        report: finalReport
      }

    } catch (error) {
      console.error('🧪 Automated Test: Error', error)
      await updateProgress(`❌ ERROR: ${error.message}`)
      const errorResult = {
        status: 'error',
        message: `Error during automated test: ${error.message}`,
        details: {
          error: error.toString(),
          steps: testSteps
        }
      }
      setAutomatedTestResult(errorResult)
      return errorResult
    } finally {
      setIsRunningAutomatedTest(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <PlayIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Visual Test Progress
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bug Hunter Automated Test - Real-time Progress
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-160px)]">
            {/* Visual Test Content */}
                {/* Running Test Overlay - Shows during test execution */}
                {isRunningAutomatedTest && (
                  <div className="mb-4 p-8 rounded-lg border-2 border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 relative overflow-hidden">
                    {/* Animated background pulse */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/50 dark:via-blue-700/30 to-transparent animate-pulse"></div>

                    <div className="relative z-10 flex flex-col items-center gap-4">
                      {/* Large spinning icon */}
                      <div className="relative">
                        <ArrowPathIcon className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-spin" />
                        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-200 dark:border-blue-700 animate-ping opacity-75"></div>
                      </div>

                      {/* Status message */}
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                          {automatedTestResult?.message || 'Running Automated Test...'}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Please wait while the test executes
                        </p>
                      </div>

                      {/* Progress steps if available */}
                      {automatedTestResult?.details?.steps && (
                        <div className="w-full max-w-md mt-4">
                          <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Test Progress:</h4>
                            <div className="space-y-2">
                              {automatedTestResult.details.steps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="text-lg flex-shrink-0">
                                    {step.startsWith('✅') ? '✅' :
                                     step.startsWith('❌') ? '❌' :
                                     step.startsWith('📍') ? '📍' :
                                     step.startsWith('⚠️') ? '⚠️' : '▶️'}
                                  </span>
                                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                    {step.replace(/^[✅❌📍⚠️▶️]\s*/, '')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {automatedTestResult && !isRunningAutomatedTest ? (
                  <div className="space-y-4">
                    {/* BIG TEST COMPLETE BANNER */}
                    <div className={`border-4 rounded-xl p-8 text-center relative overflow-hidden ${
                      automatedTestResult.status === 'pass'
                        ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-green-400 dark:border-green-600'
                        : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 border-red-400 dark:border-red-600'
                    }`}>
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>

                      <div className="relative z-10">
                        {/* HUGE icon */}
                        <div className="text-9xl mb-4 animate-bounce">
                          {automatedTestResult.status === 'pass' ? '✅' : '❌'}
                        </div>

                        {/* Large status text */}
                        <h2 className={`text-4xl font-bold mb-3 ${
                          automatedTestResult.status === 'pass'
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                        }`}>
                          TEST {automatedTestResult.status === 'pass' ? 'PASSED' : 'FAILED'}!
                        </h2>

                        <p className={`text-xl font-medium ${
                          automatedTestResult.status === 'pass'
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          {automatedTestResult.message}
                        </p>
                      </div>
                    </div>

                    {/* Test Result Header */}
                    <div className={`border rounded-lg p-4 ${
                      automatedTestResult.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                      automatedTestResult.status === 'fail' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      automatedTestResult.status === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-2 ${
                          automatedTestResult.status === 'pass' ? 'text-green-900 dark:text-green-100' :
                          automatedTestResult.status === 'fail' ? 'text-red-900 dark:text-red-100' :
                          'text-yellow-900 dark:text-yellow-100'
                        }`}>
                          Test Summary
                        </h3>

                          {automatedTestResult.details?.taskName && (
                            <div className="space-y-2">
                              <div className={`p-2 rounded text-sm ${
                                automatedTestResult.status === 'pass' ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100' :
                                automatedTestResult.status === 'fail' ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100' :
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100'
                              }`}>
                                <span className="font-medium">Task Tested:</span> #{automatedTestResult.details.taskId} - {automatedTestResult.details.taskName}
                              </div>
                              {automatedTestResult.details.testDuration && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  ⏱️ Test Duration: {automatedTestResult.details.testDuration}s
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Test Steps */}
                    {automatedTestResult.details?.steps && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Test Execution Steps</h4>
                        <div className="space-y-1 text-sm font-mono">
                          {automatedTestResult.details.steps.map((step, idx) => (
                            <div
                              key={idx}
                              className={`py-1 ${
                                step.startsWith('✅') ? 'text-green-700 dark:text-green-300' :
                                step.startsWith('❌') ? 'text-red-700 dark:text-red-300' :
                                step.startsWith('⚠️') ? 'text-yellow-700 dark:text-yellow-300' :
                                step.startsWith('ℹ️') ? 'text-blue-700 dark:text-blue-300' :
                                'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Test Metrics */}
                    {automatedTestResult.details?.metrics && (
                      <div className="grid grid-cols-4 gap-3">
                        <div className={`p-3 rounded-lg ${
                          automatedTestResult.details.metrics.noFlash
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Screen Flashes</div>
                          <div className="text-lg font-bold">
                            {automatedTestResult.details.metrics.noFlash ? '✅ None' : '❌ ' + automatedTestResult.details.metrics.ganttReloads}
                          </div>
                          <div className="text-xs opacity-70">{automatedTestResult.details.thresholds.ganttReloads}</div>
                        </div>

                        <div className={`p-3 rounded-lg ${
                          automatedTestResult.details.metrics.dependenciesWorked
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Dependencies</div>
                          <div className="text-lg font-bold">
                            {automatedTestResult.details.metrics.dependenciesWorked ? '✅ Pass' : '❌ Fail'}
                          </div>
                          <div className="text-xs opacity-70">
                            {automatedTestResult.details.metrics.hasDependencies
                              ? `${automatedTestResult.details.metrics.successorCount} successor(s) checked`
                              : 'No successors to verify'}
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg ${
                          automatedTestResult.details.metrics.returnedToOriginal
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Return to Original</div>
                          <div className="text-lg font-bold">
                            {automatedTestResult.details.metrics.returnedToOriginal ? '✅ Yes' : '❌ No'}
                          </div>
                          <div className="text-xs opacity-70">After untick hold</div>
                        </div>

                        <div className={`p-3 rounded-lg ${
                          automatedTestResult.details.metrics.criticalWarnings === 0
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Critical Warnings</div>
                          <div className="text-lg font-bold">
                            {automatedTestResult.details.metrics.criticalWarnings === 0 ? '✅ 0' : '❌ ' + automatedTestResult.details.metrics.criticalWarnings}
                          </div>
                          <div className="text-xs opacity-70">{automatedTestResult.details.thresholds.criticalWarnings}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <BeakerIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No Automated Test Results</p>
                    <p className="text-sm">Click "Run Automated Test" to start the comprehensive test</p>
                    <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 max-w-md mx-auto">
                      Test will: Select task one → Move 5 days → Check no flashing → Verify dependencies → Untick hold → Verify return to original
                    </div>
                  </div>
                )}
              {/* </>
            )} */}

            {/* Console Commands - Outside tabs but shared */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Console API Commands
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 font-mono">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900 dark:text-white">Automated Test API:</div>
                  <div><code className="text-blue-600 dark:text-blue-400">await window.runGanttAutomatedTest()</code> - Run automated test</div>
                  <div className="pl-4 text-xs">
                    Options: <code className="text-gray-600 dark:text-gray-400">{'{silent: true, customTaskId: 123}'}</code>
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <div className="font-semibold text-gray-900 dark:text-white">Bug Hunter APIs:</div>
                  <div><code className="text-pink-600 dark:text-pink-400">window.printBugHunterReport()</code> - Print detailed report</div>
                  <div><code className="text-pink-600 dark:text-pink-400">window.exportBugHunterReport()</code> - Export report to JSON</div>
                  <div><code className="text-pink-600 dark:text-pink-400">window.resetBugHunter()</code> - Reset Bug Hunter data</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
