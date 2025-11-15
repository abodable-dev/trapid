# Gantt Debugger Integration Guide

This guide shows you how to integrate the ganttDebugger and bugHunter into DHtmlxGanttView component.

## Quick Start

### 1. Import the debugger

Add to the top of `DHtmlxGanttView.jsx`:

```javascript
import { ganttDebug, bugHunter, setDebugMode, setDebugCategories } from '../../utils/ganttDebugger'

// Optionally enable debug mode on component mount
// setDebugMode(true)
// setDebugCategories(['drag', 'api', 'cascade', 'lock'])
```

### 2. Add debug calls to critical functions

#### Drag Operations

```javascript
// In onBeforeTaskDrag
gantt.attachEvent('onBeforeTaskDrag', (id, mode, event) => {
  if (mode === 'move') {
    ganttDebug.dragStart(id, { mode, originalStart: task.$originalStart })
    bugHunter.trackDragStart(id)

    // ... existing code ...
  }
})

// In onAfterTaskDrag
gantt.attachEvent('onAfterTaskDrag', (id, mode, event) => {
  ganttDebug.dragEnd(id, { mode, duration: dragDuration })
  bugHunter.trackDragEnd(id)

  // Lock tracking
  ganttDebug.lockEnable('isLoadingData', id)
  bugHunter.trackStateUpdate('Drag lock enabled', [id])

  // ... existing code ...
})
```

#### API Calls

```javascript
const handleTaskUpdate = async (task) => {
  // ... validation checks ...

  // Track API call
  const taskId = task.id
  const url = `/api/v1/schedule_templates/${templateId}/rows/${taskId}`
  ganttDebug.apiStart('PATCH', url, updateData)
  bugHunter.trackApiCall('PATCH', url, taskId, updateData)

  try {
    const response = await api.patch(url, { schedule_template_row: updateData })

    ganttDebug.apiSuccess('PATCH', url, response)

    // Track cascade if present
    if (response.cascaded_tasks?.length > 0) {
      ganttDebug.cascade(`Backend cascaded to ${response.cascaded_tasks.length} tasks`, response.cascaded_tasks)
      bugHunter.trackCascade(taskId, response.cascaded_tasks)
    }
  } catch (error) {
    ganttDebug.apiError('PATCH', url, error)
    bugHunter.trackError(error, { operation: 'handleTaskUpdate', taskId })
  }
}
```

#### Gantt Reloads

```javascript
const reloadGanttData = (reason = 'unknown') => {
  ganttDebug.renderStart(reason)
  bugHunter.trackGanttReload(reason)

  // ... reload logic ...

  const duration = performance.now() - startTime
  ganttDebug.renderComplete(duration)
}
```

#### Lock State Changes

```javascript
// When setting locks
isLoadingData.current = true
ganttDebug.lockEnable('isLoadingData', taskId)

// When releasing locks
isLoadingData.current = false
ganttDebug.lockDisable('isLoadingData', taskId)
```

### 3. Add conflict detection

```javascript
if (earliestStart && newStart < earliestStart) {
  ganttDebug.conflictDetected(task.id, {
    attemptedStart: newStart,
    earliestAllowed: earliestStart,
    predecessors: blockingPredecessors
  })

  // ... revert logic ...

  ganttDebug.conflictResolved(task.id, 'reverted to earliest allowed position')
}
```

### 4. Add performance tracking

```javascript
const performExpensiveOperation = () => {
  const perfMark = ganttDebug.perfStart('expensiveOperation')

  // ... operation code ...

  ganttDebug.perfEnd('expensiveOperation', perfMark)
}
```

## Complete Example

Here's a complete example of an instrumented function:

```javascript
const handleDragAndDrop = async (taskId, newPosition) => {
  // Start tracking
  const perfMark = ganttDebug.perfStart('handleDragAndDrop')
  ganttDebug.dragStart(taskId, { newPosition })
  bugHunter.trackDragStart(taskId)

  // Validate locks
  if (isDragging.current || isLoadingData.current) {
    ganttDebug.lock('Operation blocked - lock active', {
      isDragging: isDragging.current,
      isLoadingData: isLoadingData.current
    })
    return
  }

  // Set lock
  isDragging.current = true
  ganttDebug.lockEnable('isDragging', taskId)

  try {
    // Make API call
    const url = `/api/v1/tasks/${taskId}`
    const payload = { start_date: newPosition }

    ganttDebug.apiStart('PATCH', url, payload)
    bugHunter.trackApiCall('PATCH', url, taskId, payload)

    const response = await api.patch(url, payload)

    ganttDebug.apiSuccess('PATCH', url, response)

    // Check for cascade
    if (response.cascaded_tasks?.length > 0) {
      ganttDebug.cascade(`${response.cascaded_tasks.length} tasks cascaded`, response.cascaded_tasks)
      bugHunter.trackCascade(taskId, response.cascaded_tasks)
    }

    // Update state
    ganttDebug.state('Task position updated', { taskId, newPosition })
    bugHunter.trackStateUpdate('Task position updated', [taskId, ...response.cascaded_tasks.map(t => t.id)])

  } catch (error) {
    ganttDebug.error('Drag and drop failed', error)
    bugHunter.trackError(error, { operation: 'handleDragAndDrop', taskId, newPosition })
  } finally {
    // Release lock
    isDragging.current = false
    ganttDebug.lockDisable('isDragging', taskId)
    bugHunter.trackDragEnd(taskId)

    // End performance tracking
    ganttDebug.perfEnd('handleDragAndDrop', perfMark)
  }
}
```

## Debug Commands Reference

### Browser Console Commands

```javascript
// Enable all debug logging
window.enableGanttDebug(['all'])

// Enable specific categories
window.enableGanttDebug(['drag', 'api', 'cascade'])

// Disable debug logging
window.disableGanttDebug()

// Print summary
window.printGanttDebugSummary()

// Export debug history
window.exportGanttDebugHistory()

// Clear history
window.clearGanttDebugHistory()

// Bug Hunter commands
window.printBugHunterReport()
window.exportBugHunterReport()
window.resetBugHunter()

// Direct access
window.ganttBugHunter.thresholds.maxApiCallsPerTask = 3
```

## Available Debug Categories

- `drag` - Drag operations (start, end, move)
- `cascade` - Cascade update events
- `api` - API calls and responses
- `render` - Render operations
- `lock` - Lock/unlock state changes
- `conflict` - Conflict detection
- `data` - Data loading operations
- `event` - Event handlers
- `performance` - Performance metrics
- `state` - State changes
- `validation` - Validation checks
- `error` - Error messages
- `all` - All categories

## Critical Points to Instrument

### High Priority (Must Have)

1. **onBeforeTaskDrag / onAfterTaskDrag** - Track all drag operations
2. **handleTaskUpdate** - Track all API calls
3. **Lock state changes** - Track isDragging, isLoadingData, isSaving
4. **Cascade events** - Track when cascades are triggered and received
5. **Error handlers** - Track all errors

### Medium Priority (Recommended)

1. **Gantt reload triggers** - Track why reloads happen
2. **State updates** - Track React state changes
3. **Conflict detection** - Track validation failures
4. **Performance bottlenecks** - Track slow operations

### Low Priority (Optional)

1. **Event listeners** - Track which events fire
2. **Minor validations** - Track validation checks
3. **Data transformations** - Track data format changes

## Testing Your Integration

### Manual Test

1. Enable debug mode in browser console:
   ```javascript
   window.enableGanttDebug(['all'])
   ```

2. Perform a drag operation

3. Check the console - you should see:
   ```
   🎯 [123.45ms] 🎯 Drag Operations DRAG START - Task 299
   📡 [234.56ms] 📡 API Calls PATCH /api/v1/...
   🌊 [345.67ms] 🌊 Cascade Updates Backend cascaded to 3 tasks
   📡 [456.78ms] 📡 API Calls PATCH SUCCESS
   🎯 [567.89ms] 🎯 Drag Operations DRAG END - Task 299
   ```

4. Generate report:
   ```javascript
   window.printBugHunterReport()
   ```

5. Verify:
   - ✅ Status: healthy
   - ✅ API calls: 1
   - ✅ Gantt reloads: ≤ 1
   - ✅ No warnings

## Troubleshooting

### Debug messages not appearing

**Problem:** Console is empty even with debug enabled

**Solution:**
```javascript
// Check if debug mode is enabled
console.log(window.enableGanttDebug) // Should exist

// Enable it
window.enableGanttDebug(['all'])

// Verify
// Perform an action and check console
```

### Bug Hunter not tracking

**Problem:** Bug Hunter report shows no data

**Solution:**
```javascript
// Reset bug hunter
window.resetBugHunter()

// Verify it exists
console.log(window.ganttBugHunter) // Should show BugHunter instance

// Check if methods are being called
// Add console.log in your code to verify bugHunter.trackXXX() is being called
```

### Performance impact

**Problem:** Debug logging slowing down the app

**Solution:**
- Only enable debug mode during development
- Use specific categories instead of 'all'
- Disable in production builds

```javascript
// In component
if (process.env.NODE_ENV === 'development') {
  setDebugMode(true)
}
```

## Best Practices

1. **Always check locks before operations** - Use ganttDebug.lock() to log blocked operations
2. **Track API calls with payloads** - Makes debugging much easier
3. **Use performance tracking for slow operations** - Helps identify bottlenecks
4. **Track errors with context** - Include operation details
5. **Export reports when filing bugs** - Attach to bug reports
6. **Reset bug hunter between test sessions** - Get clean metrics

## Next Steps

1. Integrate debugger into DHtmlxGanttView.jsx
2. Test with debug mode enabled
3. Run E2E tests to verify instrumentation
4. Update documentation with any findings
5. Add custom debug categories if needed

## Resources

- **Debugger Source:** [ganttDebugger.js](../../utils/ganttDebugger.js)
- **Bug Template:** [BUG_REPORT_TEMPLATE.md](../../../docs/BUG_REPORT_TEMPLATE.md)
- **Knowledge Base:** [GANTT_BUGS_AND_FIXES.md](../../../docs/GANTT_BUGS_AND_FIXES.md)
