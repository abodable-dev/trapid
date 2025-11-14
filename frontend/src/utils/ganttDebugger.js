/**
 * Gantt Debugger - Centralized debug logging system for Gantt chart operations
 *
 * Usage:
 * import { ganttDebug, setDebugMode, setDebugCategories } from './ganttDebugger'
 *
 * // Enable all debug logging
 * setDebugMode(true)
 *
 * // Enable specific categories only
 * setDebugCategories(['drag', 'api', 'cascade'])
 *
 * // Log a debug message
 * ganttDebug.drag('Task dragged from position A to B', { taskId: 123, from: date1, to: date2 })
 */

// Debug configuration
let DEBUG_ENABLED = false
let DEBUG_CATEGORIES = new Set(['all']) // Default: log everything
let DEBUG_START_TIME = performance.now()

// Debug categories
export const DEBUG_CATEGORIES_LIST = {
  drag: '🎯 Drag Operations',
  cascade: '🌊 Cascade Updates',
  api: '📡 API Calls',
  render: '🎨 Render Operations',
  lock: '🔒 Lock/Unlock Operations',
  conflict: '⚠️ Conflict Detection',
  data: '📊 Data Loading',
  event: '⚡ Event Handlers',
  performance: '⏱️ Performance Metrics',
  state: '🔄 State Changes',
  validation: '✅ Validation',
  error: '❌ Errors',
  all: '🌍 All Categories'
}

/**
 * Enable or disable debug mode
 */
export function setDebugMode(enabled) {
  DEBUG_ENABLED = enabled
  if (enabled) {
    DEBUG_START_TIME = performance.now()
    console.log('%c[Gantt Debugger] Debug mode ENABLED', 'color: #00ff00; font-weight: bold; font-size: 14px')
    console.log('Available categories:', Object.keys(DEBUG_CATEGORIES_LIST).join(', '))
  } else {
    console.log('%c[Gantt Debugger] Debug mode DISABLED', 'color: #ff0000; font-weight: bold; font-size: 14px')
  }
}

/**
 * Set which categories to log (pass array of category names)
 * Example: setDebugCategories(['drag', 'api', 'cascade'])
 */
export function setDebugCategories(categories) {
  DEBUG_CATEGORIES = new Set(categories)
  console.log('%c[Gantt Debugger] Active categories:', 'color: #00aaff; font-weight: bold', Array.from(DEBUG_CATEGORIES).join(', '))
}

/**
 * Check if a category should be logged
 */
function shouldLog(category) {
  if (!DEBUG_ENABLED) return false
  return DEBUG_CATEGORIES.has('all') || DEBUG_CATEGORIES.has(category)
}

/**
 * Get timestamp since debug session started
 */
function getTimestamp() {
  const elapsed = performance.now() - DEBUG_START_TIME
  return `[${elapsed.toFixed(2)}ms]`
}

/**
 * Format log message with emoji, category, timestamp, and optional data
 */
function formatLog(category, emoji, message, data = null) {
  const categoryName = DEBUG_CATEGORIES_LIST[category] || category
  const timestamp = getTimestamp()
  const prefix = `${emoji} ${timestamp} ${categoryName}`

  if (data) {
    return [`%c${prefix}%c ${message}`, 'color: #00aaff; font-weight: bold', 'color: inherit', data]
  } else {
    return [`%c${prefix}%c ${message}`, 'color: #00aaff; font-weight: bold', 'color: inherit']
  }
}

/**
 * Core logging function
 */
function log(category, emoji, message, data = null, level = 'log') {
  if (!shouldLog(category)) return

  const args = formatLog(category, emoji, message, data)
  console[level](...args)

  // Store in debug history for later analysis
  if (typeof window !== 'undefined') {
    if (!window.__ganttDebugHistory) {
      window.__ganttDebugHistory = []
    }
    window.__ganttDebugHistory.push({
      timestamp: performance.now(),
      category,
      message,
      data,
      level
    })
  }
}

/**
 * Main debug interface - provides category-specific logging methods
 */
export const ganttDebug = {
  // Drag operations
  drag: (message, data) => log('drag', '🎯', message, data),
  dragStart: (taskId, data) => log('drag', '🟢', `DRAG START - Task ${taskId}`, data),
  dragEnd: (taskId, data) => log('drag', '🔴', `DRAG END - Task ${taskId}`, data),
  dragMove: (taskId, data) => log('drag', '↔️', `DRAG MOVE - Task ${taskId}`, data),

  // Cascade operations
  cascade: (message, data) => log('cascade', '🌊', message, data),
  cascadeStart: (taskId, data) => log('cascade', '🌊▶️', `CASCADE START - Task ${taskId}`, data),
  cascadeEnd: (taskId, count) => log('cascade', '🌊✅', `CASCADE END - Task ${taskId} (${count} affected)`, {}),
  cascadeSkip: (reason, data) => log('cascade', '🌊⏸️', `CASCADE SKIPPED: ${reason}`, data),

  // API calls
  api: (message, data) => log('api', '📡', message, data),
  apiStart: (method, url, payload) => log('api', '📡▶️', `${method} ${url}`, payload),
  apiSuccess: (method, url, response) => log('api', '📡✅', `${method} ${url} SUCCESS`, response),
  apiError: (method, url, error) => log('api', '📡❌', `${method} ${url} ERROR`, error, 'error'),

  // Render operations
  render: (message, data) => log('render', '🎨', message, data),
  renderStart: (reason) => log('render', '🎨▶️', `RENDER START: ${reason}`, {}),
  renderSkip: (reason) => log('render', '🎨⏸️', `RENDER SKIPPED: ${reason}`, {}),
  renderComplete: (duration) => log('render', '🎨✅', `RENDER COMPLETE (${duration}ms)`, {}),

  // Lock operations
  lock: (message, data) => log('lock', '🔒', message, data),
  lockEnable: (lockType, taskId) => log('lock', '🔒', `${lockType} ENABLED${taskId ? ` - Task ${taskId}` : ''}`, {}),
  lockDisable: (lockType, taskId) => log('lock', '🔓', `${lockType} RELEASED${taskId ? ` - Task ${taskId}` : ''}`, {}),

  // Conflict detection
  conflict: (message, data) => log('conflict', '⚠️', message, data),
  conflictDetected: (taskId, data) => log('conflict', '🚫', `CONFLICT DETECTED - Task ${taskId}`, data),
  conflictResolved: (taskId, resolution) => log('conflict', '✅', `CONFLICT RESOLVED - Task ${taskId}: ${resolution}`, {}),

  // Data loading
  data: (message, data) => log('data', '📊', message, data),
  dataLoad: (source, count) => log('data', '📊▶️', `LOADING ${count} tasks from ${source}`, {}),
  dataLoaded: (count, duration) => log('data', '📊✅', `LOADED ${count} tasks (${duration}ms)`, {}),

  // Event handlers
  event: (message, data) => log('event', '⚡', message, data),
  eventFired: (eventName, data) => log('event', '⚡', `EVENT: ${eventName}`, data),

  // Performance metrics
  perf: (message, data) => log('performance', '⏱️', message, data),
  perfStart: (operation) => {
    const markName = `gantt_${operation}_start`
    performance.mark(markName)
    log('performance', '⏱️▶️', `PERF START: ${operation}`, {})
    return markName
  },
  perfEnd: (operation, startMark) => {
    const endMark = `gantt_${operation}_end`
    performance.mark(endMark)
    try {
      performance.measure(operation, startMark, endMark)
      const measure = performance.getEntriesByName(operation)[0]
      log('performance', '⏱️✅', `PERF END: ${operation}`, { duration: `${measure.duration.toFixed(2)}ms` })
      return measure.duration
    } catch (e) {
      log('performance', '⏱️❌', `PERF ERROR: ${operation}`, { error: e.message })
    }
  },

  // State changes
  state: (message, data) => log('state', '🔄', message, data),
  stateChange: (stateName, oldValue, newValue) => log('state', '🔄', `${stateName}: ${oldValue} → ${newValue}`, {}),

  // Validation
  validate: (message, data) => log('validation', '✅', message, data),
  validationPass: (validationType, data) => log('validation', '✅', `VALIDATION PASSED: ${validationType}`, data),
  validationFail: (validationType, data) => log('validation', '❌', `VALIDATION FAILED: ${validationType}`, data, 'warn'),

  // Errors
  error: (message, error) => log('error', '❌', message, error, 'error'),

  // Generic log with custom emoji
  custom: (emoji, message, data) => {
    if (!DEBUG_ENABLED) return
    const timestamp = getTimestamp()
    const args = [`%c${emoji} ${timestamp}%c ${message}`, 'color: #00aaff; font-weight: bold', 'color: inherit']
    if (data) args.push(data)
    console.log(...args)
  }
}

/**
 * Get debug history (all logged messages)
 */
export function getDebugHistory() {
  return typeof window !== 'undefined' ? window.__ganttDebugHistory || [] : []
}

/**
 * Clear debug history
 */
export function clearDebugHistory() {
  if (typeof window !== 'undefined') {
    window.__ganttDebugHistory = []
  }
  console.log('%c[Gantt Debugger] History cleared', 'color: #ffaa00; font-weight: bold')
}

/**
 * Export debug history as JSON
 */
export function exportDebugHistory() {
  const history = getDebugHistory()
  const dataStr = JSON.stringify(history, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

  const exportFileDefaultName = `gantt-debug-${Date.now()}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()

  console.log(`%c[Gantt Debugger] Exported ${history.length} log entries`, 'color: #00ff00; font-weight: bold')
}

/**
 * Print debug summary
 */
export function printDebugSummary() {
  const history = getDebugHistory()
  const summary = {}

  history.forEach(entry => {
    if (!summary[entry.category]) {
      summary[entry.category] = 0
    }
    summary[entry.category]++
  })

  console.group('%c[Gantt Debugger] Debug Summary', 'color: #00aaff; font-weight: bold; font-size: 16px')
  console.log(`Total entries: ${history.length}`)
  console.log('By category:')
  console.table(summary)
  console.groupEnd()
}

// ============================================================================
// BUG HUNTER - Advanced diagnostics for detecting issues
// ============================================================================

/**
 * Bug Hunter - Monitors for common Gantt issues
 * Similar to the E2E test bug hunter but for live development
 */
class BugHunter {
  constructor() {
    this.reset()
    this.thresholds = {
      maxApiCallsPerTask: 2, // Warn if more than 2 API calls per task
      maxGanttReloads: 3, // Warn if more than 3 reloads in session
      maxDragDuration: 5000, // Warn if drag takes longer than 5 seconds
      duplicateCallWindow: 1000 // Detect duplicate calls within 1 second
    }
  }

  reset() {
    this.startTime = performance.now()
    this.apiCalls = []
    this.stateUpdates = []
    this.ganttReloads = []
    this.dragEvents = []
    this.cascadeEvents = []
    this.errors = []
    this.warnings = []
  }

  // Track an API call
  trackApiCall(method, url, taskId, payload = null) {
    const timestamp = performance.now() - this.startTime
    this.apiCalls.push({
      timestamp: timestamp.toFixed(2),
      method,
      url,
      taskId,
      payload
    })

    // Check for duplicate calls
    this.checkDuplicateApiCalls(taskId)
  }

  // Track a state update
  trackStateUpdate(description, affectedTasks = []) {
    const timestamp = performance.now() - this.startTime
    this.stateUpdates.push({
      timestamp: timestamp.toFixed(2),
      description,
      affectedTasks
    })
  }

  // Track a Gantt reload
  trackGanttReload(reason = 'unknown') {
    const timestamp = performance.now() - this.startTime
    this.ganttReloads.push({
      timestamp: timestamp.toFixed(2),
      reason
    })

    // Check if too many reloads
    if (this.ganttReloads.length > this.thresholds.maxGanttReloads) {
      this.warnings.push({
        type: 'excessive_reloads',
        message: `Excessive Gantt reloads detected: ${this.ganttReloads.length} reloads`,
        severity: 'high'
      })
    }
  }

  // Track drag events
  trackDragStart(taskId) {
    const timestamp = performance.now() - this.startTime
    this.dragEvents.push({
      type: 'start',
      timestamp: timestamp.toFixed(2),
      taskId
    })
  }

  trackDragEnd(taskId) {
    const timestamp = performance.now() - this.startTime
    this.dragEvents.push({
      type: 'end',
      timestamp: timestamp.toFixed(2),
      taskId
    })

    // Calculate drag duration
    const startEvent = [...this.dragEvents].reverse().find(e => e.type === 'start' && e.taskId === taskId)
    if (startEvent) {
      const duration = timestamp - parseFloat(startEvent.timestamp)
      if (duration > this.thresholds.maxDragDuration) {
        this.warnings.push({
          type: 'slow_drag',
          message: `Slow drag operation detected: ${duration.toFixed(2)}ms for task ${taskId}`,
          severity: 'medium'
        })
      }
    }
  }

  // Track cascade events
  trackCascade(triggeredBy, affectedTasks) {
    const timestamp = performance.now() - this.startTime
    this.cascadeEvents.push({
      timestamp: timestamp.toFixed(2),
      triggeredBy,
      affectedTasks,
      count: affectedTasks.length
    })
  }

  // Track errors
  trackError(error, context = {}) {
    const timestamp = performance.now() - this.startTime
    this.errors.push({
      timestamp: timestamp.toFixed(2),
      message: error.message || error,
      stack: error.stack,
      context
    })
  }

  // Check for duplicate API calls (potential infinite loop)
  checkDuplicateApiCalls(taskId) {
    const recentCalls = this.apiCalls.filter(call => call.taskId === taskId)

    if (recentCalls.length > this.thresholds.maxApiCallsPerTask) {
      // Check if they're within the duplicate call window
      const latestCall = recentCalls[recentCalls.length - 1]
      const previousCall = recentCalls[recentCalls.length - 2]

      const timeDiff = parseFloat(latestCall.timestamp) - parseFloat(previousCall.timestamp)

      if (timeDiff < this.thresholds.duplicateCallWindow) {
        this.warnings.push({
          type: 'duplicate_api_calls',
          message: `Duplicate API calls detected for task ${taskId}: ${recentCalls.length} calls, ${timeDiff.toFixed(2)}ms apart`,
          severity: 'critical',
          taskId
        })

        console.warn(
          `%c🚨 BUG HUNTER WARNING: Potential infinite loop detected!`,
          'color: #ff0000; font-weight: bold; font-size: 14px'
        )
        console.warn(`Task ${taskId} has ${recentCalls.length} API calls within ${timeDiff.toFixed(2)}ms`)
      }
    }
  }

  // Generate comprehensive report
  generateReport() {
    const totalDuration = performance.now() - this.startTime

    // Group API calls by task
    const callsByTask = {}
    this.apiCalls.forEach(call => {
      if (!callsByTask[call.taskId]) {
        callsByTask[call.taskId] = []
      }
      callsByTask[call.taskId].push(call)
    })

    // Detect issues
    const hasDuplicateCalls = Object.values(callsByTask).some(calls => calls.length > this.thresholds.maxApiCallsPerTask)
    const hasExcessiveReloads = this.ganttReloads.length > this.thresholds.maxGanttReloads
    const hasErrors = this.errors.length > 0

    const criticalWarnings = this.warnings.filter(w => w.severity === 'critical')
    const highWarnings = this.warnings.filter(w => w.severity === 'high')

    const report = {
      summary: {
        totalDuration: totalDuration.toFixed(2) + 'ms',
        apiCalls: this.apiCalls.length,
        stateUpdates: this.stateUpdates.length,
        ganttReloads: this.ganttReloads.length,
        dragOperations: this.dragEvents.filter(e => e.type === 'end').length,
        cascadeEvents: this.cascadeEvents.length,
        errors: this.errors.length,
        warnings: this.warnings.length,
        criticalWarnings: criticalWarnings.length,
        highWarnings: highWarnings.length
      },
      health: {
        status: hasErrors ? 'error' : (criticalWarnings.length > 0 ? 'critical' : (highWarnings.length > 0 ? 'warning' : 'healthy')),
        hasDuplicateCalls,
        hasExcessiveReloads,
        hasErrors
      },
      details: {
        apiCalls: this.apiCalls,
        callsByTask,
        stateUpdates: this.stateUpdates,
        ganttReloads: this.ganttReloads,
        dragEvents: this.dragEvents,
        cascadeEvents: this.cascadeEvents,
        errors: this.errors,
        warnings: this.warnings
      }
    }

    return report
  }

  // Print formatted report to console
  printReport() {
    const report = this.generateReport()

    console.log('\n' + '='.repeat(70))
    console.log('%c🔬 BUG HUNTER DIAGNOSTIC REPORT', 'color: #00aaff; font-weight: bold; font-size: 16px')
    console.log('='.repeat(70))

    // Health status
    const statusEmoji = {
      healthy: '✅',
      warning: '⚠️',
      critical: '🚨',
      error: '❌'
    }
    const statusColor = {
      healthy: '#00ff00',
      warning: '#ffaa00',
      critical: '#ff6600',
      error: '#ff0000'
    }

    console.log(`\n%c${statusEmoji[report.health.status]} Status: ${report.health.status.toUpperCase()}`,
      `color: ${statusColor[report.health.status]}; font-weight: bold; font-size: 14px`)

    // Summary
    console.log('\n📊 Summary:')
    console.log(`   Total Duration: ${report.summary.totalDuration}`)
    console.log(`   API Calls: ${report.summary.apiCalls}`)
    console.log(`   State Updates: ${report.summary.stateUpdates}`)
    console.log(`   Gantt Reloads: ${report.summary.ganttReloads}`)
    console.log(`   Drag Operations: ${report.summary.dragOperations}`)
    console.log(`   Cascade Events: ${report.summary.cascadeEvents}`)
    console.log(`   Errors: ${report.summary.errors}`)
    console.log(`   Warnings: ${report.summary.warnings} (${report.summary.criticalWarnings} critical, ${report.summary.highWarnings} high)`)

    // Warnings
    if (report.details.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      report.details.warnings.forEach((warning) => {
        const emoji = warning.severity === 'critical' ? '🚨' : warning.severity === 'high' ? '⚠️' : '💡'
        console.log(`   ${emoji} [${warning.severity.toUpperCase()}] ${warning.message}`)
      })
    }

    // Errors
    if (report.details.errors.length > 0) {
      console.log('\n❌ Errors:')
      report.details.errors.forEach((error, idx) => {
        console.log(`   #${idx + 1} at ${error.timestamp}ms: ${error.message}`)
      })
    }

    // API Calls by Task
    console.log('\n🌐 API Calls by Task:')
    Object.keys(report.details.callsByTask).forEach(taskId => {
      const calls = report.details.callsByTask[taskId]
      const isDuplicate = calls.length > this.thresholds.maxApiCallsPerTask
      const emoji = isDuplicate ? '🚨' : '✅'
      console.log(`   ${emoji} Task ${taskId}: ${calls.length} call${calls.length > 1 ? 's' : ''}`)

      if (isDuplicate) {
        calls.forEach((call, idx) => {
          console.log(`      #${idx + 1} ${call.method} at ${call.timestamp}ms`)
        })
      }
    })

    // Gantt Reloads
    if (report.details.ganttReloads.length > 0) {
      console.log('\n🔄 Gantt Reloads:')
      report.details.ganttReloads.forEach((reload, idx) => {
        console.log(`   #${idx + 1} at ${reload.timestamp}ms (${reload.reason})`)
      })
    }

    // Cascade Events
    if (report.details.cascadeEvents.length > 0) {
      console.log('\n🌊 Cascade Events:')
      report.details.cascadeEvents.forEach((cascade, idx) => {
        console.log(`   #${idx + 1} at ${cascade.timestamp}ms: Triggered by task ${cascade.triggeredBy}, affected ${cascade.count} tasks`)
      })
    }

    console.log('\n' + '='.repeat(70))

    // Recommendations
    if (report.health.status !== 'healthy') {
      console.log('\n💡 Recommendations:')

      if (report.health.hasDuplicateCalls) {
        console.log('   • Check for infinite loops in API call handlers')
        console.log('   • Verify isLoadingData/isSaving locks are working')
        console.log('   • Review cascade update logic')
      }

      if (report.health.hasExcessiveReloads) {
        console.log('   • Reduce number of Gantt reloads')
        console.log('   • Batch updates where possible')
        console.log('   • Check for unnecessary data fetches')
      }

      if (report.health.hasErrors) {
        console.log('   • Review error logs for root cause')
        console.log('   • Add error handling where needed')
      }

      console.log('\n' + '='.repeat(70))
    }

    return report
  }

  // Export report as JSON file
  exportReport() {
    const report = this.generateReport()
    const dataStr = JSON.stringify(report, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `bug-hunter-report-${Date.now()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    console.log(`%c[Bug Hunter] Report exported: ${exportFileDefaultName}`, 'color: #00ff00; font-weight: bold')
  }
}

// Create global bug hunter instance
export const bugHunter = new BugHunter()

/**
 * Enable debug mode from browser console
 * Usage: window.enableGanttDebug(['drag', 'api'])
 */
if (typeof window !== 'undefined') {
  window.enableGanttDebug = (categories = ['all']) => {
    setDebugMode(true)
    setDebugCategories(categories)
  }

  window.disableGanttDebug = () => {
    setDebugMode(false)
  }

  window.getGanttDebugHistory = getDebugHistory
  window.clearGanttDebugHistory = clearDebugHistory
  window.exportGanttDebugHistory = exportDebugHistory
  window.printGanttDebugSummary = printDebugSummary

  // Bug Hunter commands
  window.ganttBugHunter = bugHunter
  window.printBugHunterReport = () => bugHunter.printReport()
  window.exportBugHunterReport = () => bugHunter.exportReport()
  window.resetBugHunter = () => bugHunter.reset()

  console.log('%c[Gantt Debugger]', 'color: #00aaff; font-weight: bold', 'Available commands:')
  console.log('  window.enableGanttDebug(["drag", "api", "cascade"]) - Enable debug mode')
  console.log('  window.disableGanttDebug() - Disable debug mode')
  console.log('  window.getGanttDebugHistory() - Get debug history')
  console.log('  window.clearGanttDebugHistory() - Clear debug history')
  console.log('  window.exportGanttDebugHistory() - Export to JSON')
  console.log('  window.printGanttDebugSummary() - Print summary')
  console.log('')
  console.log('%c[Bug Hunter]', 'color: #ff6600; font-weight: bold', 'Available commands:')
  console.log('  window.printBugHunterReport() - Print bug hunter diagnostic report')
  console.log('  window.exportBugHunterReport() - Export bug hunter report to JSON')
  console.log('  window.resetBugHunter() - Reset bug hunter data')
  console.log('  window.ganttBugHunter - Direct access to bug hunter instance')
}

export default ganttDebug
