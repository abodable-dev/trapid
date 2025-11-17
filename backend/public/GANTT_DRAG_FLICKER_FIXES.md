# Gantt Chart - Architecture & Best Practices Guide

**Last Updated:** 2025-11-14 13:02 AEDT
**Component:** DHtmlx Gantt Chart (Schedule Master)
**Purpose:** High-level guide for Claude to read before working on Gantt code

---

## Overview

This document provides architectural guidance and best practices for working with the DHtmlx Gantt chart implementation in the Schedule Master feature. Read this before making changes to ensure you understand the critical patterns and safeguards in place.

**Primary Files:**
- `frontend/src/components/schedule-master/DHtmlxGanttView.jsx` - Main Gantt component
- `frontend/src/pages/MasterSchedulePage.jsx` - Parent container
- `frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx` - Table view with cascade logic

---

## Critical Concepts

### Lock State Flags

The Gantt implementation uses ref-based locks to prevent race conditions and infinite loops. **ALWAYS check these locks before making API calls or triggering state updates.**

| Flag | Purpose | Set When | Cleared When | Location |
|------|---------|----------|--------------|----------|
| `isDragging.current` | Prevents API calls during active drag | onBeforeTaskDrag | onAfterTaskDrag (deferred) | DHtmlxGanttView.jsx:125 |
| `isLoadingData.current` | Prevents cascade API calls after drag | onAfterTaskDrag (IMMEDIATELY) | After 1000ms timeout | DHtmlxGanttView.jsx:126 |
| `suppressRender.current` | Prevents visual flicker during drag end | onAfterTaskDrag | After drag processing | DHtmlxGanttView.jsx:127 |
| `isSaving.current` | Prevents infinite loops from data reloads | Before API call | After 2000ms cooldown | DHtmlxGanttView.jsx:128 |

**Lock Check Pattern (CRITICAL):**
```javascript
// ALWAYS check locks before API calls
if (isDragging.current || isLoadingData.current || isSaving.current) {
  console.log('⏸️ Operation blocked by lock')
  return
}
```

### Auto-Scheduling Plugin

DHtmlx's `auto_scheduling` plugin provides real-time visual feedback when dragging tasks with dependencies:
- Dependent tasks move visually during drag (better UX)
- Each visual update fires `onAfterTaskUpdate` event
- **Lock flags prevent these events from triggering API calls**
- Result: Smooth visuals without API spam

**Configuration:**
```javascript
// Plugin enabled for visual feedback
gantt.plugins({
  auto_scheduling: true,  // Keep enabled
  critical_path: true,
  drag_timeline: true,
  tooltip: true,
  undo: true
})
```

---

## Event Flow

### Successful Drag Operation (With Dependencies)

```
User drags task
    ↓
onBeforeTaskDrag fires
    ↓
isDragging.current = true
    ↓
Visual drag (DHtmlx handles, auto-scheduling shows cascade)
    ↓
User releases
    ↓
onAfterTaskDrag fires
    ↓
isLoadingData.current = true (IMMEDIATE - prevents cascade API calls)
    ↓
Auto-scheduling finalizes dependent positions
    ↓
Each dependent fires onAfterTaskUpdate
    ↓
handleTaskUpdate checks isLoadingData → SKIP (cascade blocked)
    ↓
Single API call for dragged task only (200ms delay)
    ↓
Backend response received
    ↓
1000ms timeout expires
    ↓
isLoadingData.current = false
    ↓
Next full reload gets all changes
```

### Cascade Update Flow (Backend-Triggered)

```
Task A moved via API
    ↓
Backend calculates cascade (dependency service)
    ↓
Backend returns: { task: A, cascaded_tasks: [B, C, D] }
    ↓
Frontend receives cascade data
    ↓
ScheduleTemplateEditor.handleUpdateRow processes cascade
    ↓
Pending tracker prevents duplicate API calls
    ↓
Batch state update applied
    ↓
Single Gantt reload with all changes
```

---

## Architecture Patterns

### Ref vs State

**Use `useRef` for:**
- Lock flags that shouldn't trigger re-renders
- Timeouts that need to persist across renders
- Performance-critical values checked in event handlers

**Use `useState` for:**
- UI state that should trigger re-renders
- Data displayed to users
- Modal visibility, loading states

### Deduplication Strategy

**Pending Tracker Pattern:**
```javascript
// Track in-flight updates to prevent duplicates
const pendingUpdatesRef = useRef(new Map())

// Check before API call
const pendingKey = `${taskId}:${field}`
if (pendingUpdatesRef.current.has(pendingKey)) {
  const pendingValue = pendingUpdatesRef.current.get(pendingKey)
  if (pendingValue === newValue) {
    console.log('⏭️ Skipping - same value already pending')
    return
  }
}

// Set immediately (atomic check-and-set)
pendingUpdatesRef.current.set(pendingKey, newValue)

// Clear after delay (allows state updates to complete)
setTimeout(() => {
  pendingUpdatesRef.current.delete(pendingKey)
}, 2000)
```

### Skip Reload Option

When making API calls during drag operations, use `{ skipReload: true }`:
```javascript
// During drag - no reload
onUpdateTask(taskId, updates, { skipReload: true })

// After drag completes - full reload
onUpdateTask(taskId, updates, { skipReload: false })
```

---

## Best Practices

### 1. Always Check Locks First

```javascript
// ✅ GOOD
const handleTaskUpdate = (task) => {
  if (isDragging.current || isLoadingData.current || isSaving.current) {
    return
  }
  // ... proceed with update
}

// ❌ BAD
const handleTaskUpdate = (task) => {
  await api.patch(url, data)  // No lock checks!
}
```

### 2. Set Locks BEFORE Events Fire

```javascript
// ✅ GOOD - Lock set immediately
gantt.attachEvent('onAfterTaskDrag', (id) => {
  isLoadingData.current = true  // Set FIRST
  // ... rest of handler
})

// ❌ BAD - Lock set too late
gantt.attachEvent('onAfterTaskDrag', (id) => {
  await processTask(id)
  isLoadingData.current = true  // Too late!
})
```

### 3. Use Timeouts for Lock Release

```javascript
// ✅ GOOD - Clear existing timeout first
if (loadingDataTimeout.current) {
  clearTimeout(loadingDataTimeout.current)
}
loadingDataTimeout.current = setTimeout(() => {
  isLoadingData.current = false
  loadingDataTimeout.current = null
}, 1000)

// ❌ BAD - Multiple timeouts can overlap
setTimeout(() => {
  isLoadingData.current = false
}, 1000)
```

### 4. Defer State Changes During Drag

```javascript
// ✅ GOOD - Deferred with RAF
requestAnimationFrame(() => {
  isDragging.current = false
})

// ❌ BAD - Synchronous reset
isDragging.current = false  // Can cause immediate re-renders
```

### 5. Batch API Calls

```javascript
// ✅ GOOD - Single API call with all fields
const updates = {
  start_date: newDate,
  duration: newDuration,
  predecessor_ids: predecessors
}
await api.patch(url, updates)

// ❌ BAD - Multiple API calls
await api.patch(url, { start_date: newDate })
await api.patch(url, { duration: newDuration })
await api.patch(url, { predecessor_ids: predecessors })
```

---

## Key Functions Reference

### DHtmlxGanttView.jsx

**onBeforeTaskDrag (line ~1302)**
- Initializes drag operation
- Sets `isDragging.current = true`
- Stores original position

**onAfterTaskDrag (line ~1338)**
- **CRITICAL: Sets `isLoadingData.current = true` FIRST**
- Handles conflict checking
- Makes single API call with 200ms delay
- Sets timeout to release lock after 1000ms

**handleTaskUpdate (line ~3230)**
- Checks all lock flags before proceeding
- Skips if `isDragging`, `isLoadingData`, or `isSaving` is true
- Makes API call if all checks pass
- Sets `isSaving` lock with 2000ms cooldown

**useEffect (tasks dependency) (line ~3324)**
- Reloads Gantt when tasks data changes
- Respects lock flags to prevent reload during drag

### ScheduleTemplateEditor.jsx

**handleUpdateRow (line ~691)**
- Processes backend responses (including cascaded tasks)
- Uses pending tracker to prevent duplicates
- Recognizes cascade updates (start_date-only changes)
- Applies batch state updates

### MasterSchedulePage.jsx

**handleTaskUpdate (line ~45)**
- Parent handler for task updates
- Supports `skipReload` option
- Skips optimistic updates during drag
- Only fetches fresh data when needed

---

## Configuration Reference

### DHtmlx Gantt Config

```javascript
// Global config (DHtmlxGanttView.jsx:559-577)
gantt.config.auto_scheduling = false  // Global disabled
gantt.config.drag_move = true
gantt.config.drag_resize = true
gantt.config.drag_progress = false
gantt.config.drag_links = true

// Plugins (DHtmlxGanttView.jsx:573-579)
gantt.plugins({
  auto_scheduling: true,   // Plugin enabled (for visual feedback)
  critical_path: true,
  drag_timeline: true,
  tooltip: true,
  undo: true
})
```

---

## Debugging Guide

### When Things Go Wrong

1. **Check Lock States**
   - Enable diagnostic mode: Set `DIAGNOSTIC_MODE = true` (DHtmlxGanttView.jsx:24)
   - Watch console for lock timing: 🔒 ENABLED / 🔓 RELEASED

2. **Check API Calls**
   - Open Network tab
   - Drag a task with dependencies
   - Should see ONLY 1 API call (not 8+)

3. **Check Gantt Reloads**
   - Watch console for "🔄 Gantt reload" messages
   - Should see ONLY 1 reload after 1000ms lock expires

4. **Use Bug Hunter**
   - Browser console: `window.printBugHunterReport()`
   - Look for duplicate API calls, excessive reloads, slow drags
   - See [GANTT_BUGS_AND_FIXES.md](../../docs/GANTT_BUGS_AND_FIXES.md) for full diagnostic tools

### Common Issues

**Multiple API Calls**
- Missing lock check → Add `if (isLoadingData.current) return`
- Lock set too late → Move to beginning of event handler

**Screen Flickering**
- State update during drag → Use `skipReload: true`
- Missing render suppression → Set `suppressRender.current = true`

**Infinite Loops**
- Missing `isSaving` check → Add to handleTaskUpdate
- Pending tracker cleared too early → Increase delay to 2000ms

---

## Performance Targets

| Metric | Target | Threshold |
|--------|--------|-----------|
| API calls per drag | 1 | ≤ 2 |
| Gantt reloads per drag | 1 | ≤ 1 |
| Drag operation duration | < 200ms | < 5000ms |
| Cascade calculation time | < 100ms | < 500ms |

---

## Related Documentation

- **Bug Knowledge Base:** [GANTT_BUGS_AND_FIXES.md](../../docs/GANTT_BUGS_AND_FIXES.md) - Detailed bug history and fixes
- **Business Rules:** [GANTT_SCHEDULE_RULES.md](../../GANTT_SCHEDULE_RULES.md) - Scheduling logic
- **Bug Hunter Tool:** Available in browser console after loading Gantt view
- **Integration Guide:** [INTEGRATION_GUIDE.md](./src/components/schedule-master/INTEGRATION_GUIDE.md)

---

## Quick Checklist

Before making changes to Gantt code:

- [ ] Understand the lock flag system
- [ ] Know the event flow (drag → lock → API → unlock)
- [ ] Check all locks before API calls
- [ ] Set locks BEFORE events that trigger cascades
- [ ] Use `skipReload: true` during drag operations
- [ ] Clear timeouts before setting new ones
- [ ] Test with tasks that have dependencies
- [ ] Check console for diagnostic messages
- [ ] Run Bug Hunter report after testing
- [ ] Verify only 1 API call per drag operation

---

**Document Version:** 3.0
**Focus:** Architecture & Best Practices (bug history moved to Bug Hunter)
**Last Verified Working:** 2025-11-14
**Next Review:** When upgrading DHtmlx Gantt or React version
