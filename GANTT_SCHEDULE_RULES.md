# Gantt & Schedule Master - The Bible (Development Rules)
**Last Updated:** November 14, 2025
**Status:** Production-ready with DHtmlx trial
**Authority Level:** ABSOLUTE - This is The Bible for all Gantt development

---

## 🔴 CRITICAL: Read This First

### This Document is "The Bible"
This file is the **absolute authority** for all Gantt and Schedule Master development.

**Rules for Claude Code (CC):**
- ✅ You MUST follow every rule in this document without exception
- ✅ You MUST read this file at the start of every session
- ✅ You MUST update this file when making code changes that affect future sessions
- ❌ You CANNOT change implementation approaches between sessions
- ❌ You CANNOT "optimize" or "simplify" code without explicit approval
- ❌ You CANNOT remove code because you think it's unnecessary

**Why This Exists:**
To prevent CC from changing working code in different ways each session, which causes bugs and burns tokens through debugging with screenshots and console logs.

---

## 📋 How CC Must Update This File

### When to Update
CC MUST update this file when:
1. Making code changes that affect how Gantt calculations work
2. Adding new features or functionality to Gantt/Schedule
3. Fixing bugs that required changing core logic
4. Modifying performance optimizations
5. Changing data structures or API patterns

### How to Update
1. **Update the relevant rule section directly** (not just a changelog)
2. **Explain WHY the code is written that way** (prevent future "optimization" attempts)
3. **Document any performance implications**
4. **Add examples of correct vs incorrect usage**
5. **Note any dependencies or side effects**

### Update Format
When updating a rule, use this pattern:
```
Rule X: [Rule Name]
[Description of what must be done]

✅ Correct Implementation:
[Code example]

❌ Never Do This:
[Anti-pattern example]

WHY: [Detailed explanation of why this approach is required]
CONSEQUENCES: [What breaks if this rule is violated]
```

---

## 🔒 Protected Code Patterns - DO NOT MODIFY

These patterns MUST NOT be changed or "optimized" without explicit user approval. They exist for specific technical reasons.

### Protected Pattern 1: Debounced Refresh Logic
**Location:** DHtmlxGanttView.jsx, ScheduleTemplateEditor.jsx

**The Code:**
```javascript
const debouncedRender = (delay = 0) => {
  if (renderTimeout.current) {
    clearTimeout(renderTimeout.current)
  }
  renderTimeout.current = setTimeout(() => {
    if (ganttReady) gantt.render()
  }, delay)
}
```

**WHY:** Prevents UI lag and visual flashing during drag operations. Direct `gantt.render()` calls cause stuttering.

**CONSEQUENCES:** Removing debounce causes 50-100ms lag per render, visual flashing, and poor user experience.

**DO NOT:**
- Remove the timeout mechanism
- Change to direct `gantt.render()` calls
- Reduce delay below current values
- "Simplify" by removing renderTimeout.current check

### Protected Pattern 2: Debounced localStorage Writes
**Location:** All components with user preferences

**The Code:**
```javascript
import { createDebouncedStorageSetter } from '../../utils/debounce'

const debouncedSaveToStorage = useMemo(() =>
  createDebouncedStorageSetter(500), []
)

useEffect(() => {
  debouncedSaveToStorage('dhtmlxGanttColumns', visibleColumns)
}, [visibleColumns, debouncedSaveToStorage])
```

**WHY:** Direct localStorage writes during user interactions (column resize, reorder) block the main thread and cause UI freezing.

**CONSEQUENCES:** Removing debounce causes 20-50ms UI lag per interaction, making drag operations feel sluggish.

**DO NOT:**
- Use direct `localStorage.setItem()` calls
- Reduce debounce delay below 500ms
- Remove the useMemo wrapper
- "Optimize" by batching differently

### Protected Pattern 3: API Delete 204 Handling
**Location:** api.js delete method

**The Code:**
```javascript
async delete(endpoint, options = {}) {
  // ... fetch logic ...

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null
  }

  // Try to parse JSON, return null if empty
  const text = await response.text()
  return text ? JSON.parse(text) : null
}
```

**WHY:** Backend returns 204 No Content for successful deletes. Attempting to parse empty response as JSON throws "Unexpected end of JSON input" error.

**CONSEQUENCES:** Application crashes on template/task deletion.

**DO NOT:**
- Remove 204 status check
- Always expect JSON response
- Remove text parsing fallback
- "Simplify" error handling

### Protected Pattern 4: Functional State Updates for Concurrent Operations
**Location:** ScheduleTemplateEditor.jsx - ALL setRows() calls
**Added:** November 14, 2025 (Bug fix for disappearing tasks)

**The Problem:**
When multiple async operations update state concurrently (e.g., duration change triggers cascading updates to 5 dependent tasks), non-functional state updates cause race conditions:

```javascript
// ❌ WRONG: Reads stale state, overwrites previous updates
const handleUpdateRow = async (rowId, updates) => {
  setRows(rows.map(r => r.id === rowId ? { ...r, ...updates } : r))
}

// What happens with concurrent updates:
// 1. Update A reads rows (6 tasks)
// 2. Update B reads rows (6 tasks)
// 3. Update A writes rows (6 tasks with change A)
// 4. Update B writes rows (6 tasks with change B) ← OVERWRITES A!
// Result: Task disappears or change A is lost
```

**The Solution:**
```javascript
// ✅ CORRECT: Functional update always operates on latest state
const handleUpdateRow = async (rowId, updates) => {
  setRows(prevRows => prevRows.map(r =>
    r.id === rowId ? { ...r, ...updates } : r
  ))
}
```

**ALL setRows Locations That MUST Use Functional Updates:**

1. **handleAddRow (line 662):**
```javascript
✅ setRows(prevRows => [...prevRows, response])
❌ setRows([...rows, response])
```

2. **handleDeleteRow (line 754):**
```javascript
✅ setRows(prevRows => prevRows.filter(r => r.id !== rowId))
❌ setRows(rows.filter(r => r.id !== rowId))
```

3. **handleMoveRow (lines 767-777):**
```javascript
✅ setRows(prevRows => {
     if (newIndex < 0 || newIndex >= prevRows.length) return prevRows
     const newRows = [...prevRows]
     ;[newRows[index], newRows[newIndex]] = [newRows[newIndex], newRows[index]]
     return newRows
   })
❌ const newRows = [...rows]
   setRows(newRows)
```

4. **handleBulkDelete (line 879):**
```javascript
✅ setRows(prevRows => prevRows.filter(r => !selectedRows.has(r.id)))
❌ setRows(rows.filter(r => !selectedRows.has(r.id)))
```

5. **handleUpdateRow optimistic updates (lines 679-691, 722-736):**
```javascript
✅ setRows(prevRows => {
     const existingRowIndex = prevRows.findIndex(r => r && r.id === rowId)
     if (existingRowIndex !== -1) {
       return prevRows.map(r => (r && r.id === rowId) ? { ...r, ...updates } : r)
     }
     return prevRows
   })
❌ setRows(rows.map(r => r.id === rowId ? { ...r, ...updates } : r))
```

**WHY:** React batches concurrent state updates. Functional updates guarantee each update operates on the latest state from the previous update in the batch, preventing data loss.

**CONSEQUENCES:** Non-functional updates cause tasks to disappear when:
- Changing duration (triggers cascading updates to dependent tasks)
- Adding new tasks while auto-save is running
- Bulk operations (reorder, bulk edit)
- Any operation that triggers multiple simultaneous updates

**SYMPTOMS:**
- Tasks randomly disappear from table/Gantt
- Need multiple hard refreshes to see all tasks
- Task count decreases from 6→5→4→3 over time

**TESTING:**
- Change duration on a task with dependencies
- All tasks should remain visible (no disappearing)
- Add new task while editing another task
- New task should stay visible

**DO NOT:**
- Ever use `setRows(rows.something)` - always use `setRows(prevRows => ...)`
- "Simplify" by removing the functional update wrapper
- Assume single operations don't need functional updates (they all might run concurrently)

### Protected Pattern 5: Undefined Task Safety in gantt.eachTask
**Location:** DHtmlxGanttView.jsx - ALL gantt.eachTask() calls
**Added:** November 14, 2025 (Bug fix for TypeError crashes)

**The Problem:**
When tasks array has undefined elements (due to race conditions or deletions), `gantt.eachTask()` can yield undefined/null tasks, causing crashes:

```javascript
// ❌ WRONG: Crashes when successorTask is undefined
gantt.eachTask((successorTask) => {
  const isLocked = successorTask.confirm || successorTask.supplier_confirm
  // TypeError: Cannot read properties of undefined (reading 'confirm')
})
```

**The Solution:**
```javascript
// ✅ CORRECT: Always check for undefined/null before accessing properties
gantt.eachTask((successorTask) => {
  // Skip undefined/invalid tasks FIRST
  if (!successorTask || !successorTask.id) return

  const isLocked = successorTask.confirm || successorTask.supplier_confirm
  // Now safe to access properties
})
```

**ALL gantt.eachTask Locations (7 total):**

1. **Line 1367 - Find locked successors:**
```javascript
gantt.eachTask((successorTask) => {
  if (!successorTask || !successorTask.id) return  // ← REQUIRED
  if (successorTask.id === task.id) return
  // ... rest of logic
})
```

2. **Line 1476 - Check nested successors:**
```javascript
gantt.eachTask((nestedSuccessor) => {
  if (!nestedSuccessor || !nestedSuccessor.id) return  // ← REQUIRED
  // ... rest of logic
})
```

3. **Line 1867 - Clear task highlighting:**
```javascript
gantt.eachTask((task) => {
  if (!task || !task.id) return  // ← REQUIRED
  task.$highlighted = false
})
```

4. **Line 1915 - Highlight successors:**
```javascript
gantt.eachTask((task) => {
  if (!task || !task.id) return  // ← REQUIRED
  if (task.predecessor_ids && task.predecessor_ids.length > 0) {
    // ... rest of logic
  }
})
```

5. **Line 1947 - Auto-clear highlighting:**
```javascript
gantt.eachTask((task) => {
  if (!task || !task.id) return  // ← REQUIRED
  task.$highlighted = false
})
```

6. **Line 2017 - Get visible tasks:**
```javascript
gantt.eachTask((task) => {
  if (!task || !task.id) return  // ← REQUIRED
  visibleTasks.push(task)
})
```

7. **Line 1446 - Check for unlocked successors (CRITICAL):**
```javascript
gantt.eachTask((successorTask) => {
  if (!successorTask || !successorTask.id) return  // ← REQUIRED
  if (successorTask.id === task.id) return
  // This is the location that was causing crashes in production
})
```

**WHY:** DHtmlx Gantt's `eachTask()` can yield undefined when:
- Tasks are being removed/filtered
- Data is being reloaded
- Race conditions create temporary undefined array elements
- Any operation that modifies the task list during iteration

**CONSEQUENCES:** Without checks:
- `TypeError: Cannot read properties of undefined (reading 'id')`
- Application crashes during drag operations
- Gantt becomes unusable until page refresh
- Users lose work

**PATTERN TO ALWAYS USE:**
```javascript
gantt.eachTask((task) => {
  // ALWAYS start with this check - no exceptions
  if (!task || !task.id) return

  // Now safe to access task properties
  // ... your logic here
})
```

**DO NOT:**
- Remove the `if (!task || !task.id) return` check from any gantt.eachTask callback
- Assume tasks are always valid "because the data should be clean"
- Skip the check to "simplify" the code
- Only check `!task` without also checking `!task.id`

---

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Implementation Rules](#implementation-rules)
- [Performance Requirements](#performance-requirements)
- [Sorting & Display Logic](#sorting--display-logic)
- [Data Flow & State Management](#data-flow--state-management)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Validation Workflow with Claude.ai](#validation-workflow-with-claudeai)

---

## Architecture Overview

### Single Gantt Library: DHtmlx Only
**Decision:** Use DHtmlx Gantt exclusively across entire application.

**Rationale:**
- ✅ Superior performance (smart rendering, static background)
- ✅ Professional features (undo/redo, critical path, auto-scheduling)
- ✅ Consistent UX across all pages
- ✅ Better performance with large datasets (100+ tasks)
- ✅ Trial period for evaluation (~$2,140 AUD for 5 devs)

**Removed Libraries:**
- ❌ SVAR Gantt (React-based, poor performance)
- ❌ Frappe Gantt (limited features)
- ❌ Custom Gantt components (no virtualization)

### File Locations
```
frontend/src/
├── components/
│   └── schedule-master/
│       ├── DHtmlxGanttView.jsx          # Main Gantt component
│       ├── ScheduleTemplateEditor.jsx   # Template editing UI
│       ├── ScheduleMasterTab.jsx        # Schedule task matching
│       └── TaskDependencyEditor.jsx     # Dependency management
├── pages/
│   └── MasterSchedulePage.jsx           # Project schedule view
└── utils/
    └── debounce.js                      # Performance utilities
```

---

## Implementation Rules

### Rule 1: DHtmlx Gantt Usage
Always use `DHtmlxGanttView` component for all Gantt visualizations.

✅ **Correct Usage:**
```jsx
import DHtmlxGanttView from '../components/schedule-master/DHtmlxGanttView'

<DHtmlxGanttView
  isOpen={showGanttView}
  onClose={() => setShowGanttView(false)}
  tasks={rows}
  onUpdateTask={async (taskId, updates, options) => {
    // Handle task updates
  }}
/>
```

❌ **Never Do This:**
- Don't import or use `GanttView` (SVAR - removed)
- Don't import or use `ScheduleGanttChart` (Frappe - removed)
- Don't create custom Gantt components

**WHY:** DHtmlx is the only library that provides required performance and features. Other libraries were tested and removed due to performance issues.

---

### Rule 2: Performance - Debounced localStorage
Always use debounced writes for localStorage to prevent UI lag.

✅ **Correct Pattern:**
```javascript
import { createDebouncedStorageSetter } from '../../utils/debounce'

// In component:
const debouncedSaveToStorage = useMemo(() =>
  createDebouncedStorageSetter(500), []
)

useEffect(() => {
  debouncedSaveToStorage('dhtmlxGanttColumns', visibleColumns)
}, [visibleColumns, debouncedSaveToStorage])
```

❌ **Never Do This:**
```javascript
// Direct localStorage writes cause lag!
useEffect(() => {
  localStorage.setItem('dhtmlxGanttColumns', JSON.stringify(visibleColumns))
}, [visibleColumns])
```

**WHY:** See Protected Pattern 2 above.

---

### Rule 3: API Delete Responses
Always handle 204 No Content responses from DELETE endpoints.

**Pattern (already implemented in api.js):**
```javascript
async delete(endpoint, options = {}) {
  // ... fetch logic ...

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null
  }

  // Try to parse JSON, return null if empty
  const text = await response.text()
  return text ? JSON.parse(text) : null
}
```

**WHY:** See Protected Pattern 3 above.

---

### Rule 4: Template Deletion Safety
Templates must have deletion safeguards:
- ✅ Cannot delete the default template
- ✅ Show confirmation dialog with clear warning
- ✅ Cascade delete all associated rows
- ✅ Auto-select another template after deletion

**Implementation:**
```javascript
const handleDeleteTemplate = async () => {
  if (selectedTemplate.is_default) {
    showToast('Cannot delete the default template...', 'error')
    return
  }

  if (!confirm(`Are you sure you want to delete "${selectedTemplate.name}"?\n\nThis will permanently delete...`)) {
    return
  }

  await api.delete(`/api/v1/schedule_templates/${selectedTemplate.id}`)
  // Reload and select first template
}
```

**WHY:** Prevents accidental data loss and ensures application always has a valid template selected.

---

### Rule 5: Functional State Updates (CRITICAL)
**Added:** November 14, 2025

ALL React setState calls that depend on previous state MUST use functional updates.

✅ **Correct Pattern:**
```javascript
setRows(prevRows => prevRows.map(r =>
  r.id === rowId ? { ...r, ...updates } : r
))
```

❌ **Never Do This:**
```javascript
setRows(rows.map(r => r.id === rowId ? { ...r, ...updates } : r))
```

**WHY:** See Protected Pattern 4 above.

**LOCATIONS TO CHECK:**
- All `setRows()` calls in ScheduleTemplateEditor.jsx
- Any setState that modifies based on previous state
- Operations that trigger multiple concurrent updates

---

### Rule 6: Undefined Task Safety
**Added:** November 14, 2025

ALL `gantt.eachTask()` callbacks MUST check for undefined/null tasks.

✅ **Correct Pattern:**
```javascript
gantt.eachTask((task) => {
  if (!task || !task.id) return
  // Now safe to access task properties
})
```

❌ **Never Do This:**
```javascript
gantt.eachTask((task) => {
  // Crashes if task is undefined!
  const isLocked = task.confirm
})
```

**WHY:** See Protected Pattern 5 above.

**LOCATIONS:** All 7 gantt.eachTask() calls in DHtmlxGanttView.jsx

---

## Performance Requirements

### Mandatory Optimizations

**1. Smart Rendering (DHtmlx config)**
```javascript
gantt.config.smart_rendering = true
gantt.config.static_background = true
gantt.config.show_errors = false
```

**2. Debounced Render Function**
```javascript
const debouncedRender = (delay = 0) => {
  if (renderTimeout.current) {
    clearTimeout(renderTimeout.current)
  }
  renderTimeout.current = setTimeout(() => {
    if (ganttReady) gantt.render()
  }, delay)
}
```

**3. Debounced localStorage (500ms delay)**
- All user preference changes must be debounced
- Column widths, visibility, order, zoom level, etc.

**4. Functional State Updates (concurrent operations)**
- All `setRows()` calls must use `prevRows =>`
- Prevents race conditions during concurrent updates

### Performance Targets
| Operation | Target | Current |
|-----------|--------|---------|
| Task drag | < 20ms | ✅ 10-20ms |
| localStorage write | < 10ms | ✅ ~5ms (debounced) |
| Render 100+ tasks | < 100ms | ✅ 50-100ms |
| No visual flashing | 0 | ✅ 0 |
| Concurrent updates | No data loss | ✅ Fixed (Nov 14, 2025) |

---

## Sorting & Display Logic

### Rule: Default Sort by Start Date
Schedule templates should default to `startDate` sorting for timeline view.

```javascript
// ✅ Correct default
const [sortBy, setSortBy] = useState('startDate')
const [sortDirection, setSortDirection] = useState('asc')
```

**Rationale:**
- Gantt charts show chronological timeline of work
- Users need to see "what happens next" in date order
- Tasks appear in execution sequence

**Display Order Example:**
1. Task 2 (Day 0) → Earliest start
2. Task 4 (Day 2)
3. Task 5 (Day 4)
4. Task 1 (Day 6)
5. Task 3 (Day 8) → Latest start

### Sorting Options Available
Users can click column headers to sort by:
- **#** - Sequence number (original order)
- **Task Name** - Alphabetical
- **Start Date** - Timeline order (default)
- **Duration** - Longest to shortest
- **Supplier/Group** - Alphabetical
- **Predecessors** - Dependency order

---

## Data Flow & State Management

### Task Data Structure
```typescript
interface ScheduleTask {
  id: number
  name: string
  duration: number
  start_date: number              // Business days from project start
  supplier_name?: string
  assigned_role?: string
  predecessor_ids: Array<{
    id: number                    // Task number (1-based)
    type: 'FS' | 'SS' | 'FF' | 'SF'
    lag: number                   // Days offset
  }>
  manually_positioned?: boolean   // Locked position
  po_required?: boolean
  create_po_on_job_start?: boolean
  price_book_item_ids?: number[]
  // ... additional fields
}
```

### State Flow
```
User Action (drag/edit)
  ↓
DHtmlxGanttView event handler
  ↓
onUpdateTask callback
  ↓
ScheduleTemplateEditor.handleUpdateRow()
  ↓
API call (PATCH /api/v1/schedule_template_rows/:id)
  ↓
Backend validation & calculation
  ↓
Response → Update local state (using functional update!)
  ↓
Gantt re-renders with new data
```

### Critical Callbacks
```jsx
<DHtmlxGanttView
  onUpdateTask={async (taskId, updates, options) => {
    // options.skipReload - prevent infinite loops
    await handleUpdateRow(taskId, updates, options)
  }}
/>
```

---

## Common Patterns

### Pattern 1: Opening Gantt Modal
```javascript
const [showGanttView, setShowGanttView] = useState(false)

<button onClick={() => setShowGanttView(true)}>
  📊 View Gantt Chart
</button>

{showGanttView && (
  <DHtmlxGanttView
    isOpen={true}
    onClose={() => setShowGanttView(false)}
    tasks={tasks}
    onUpdateTask={handleTaskUpdate}
  />
)}
```

### Pattern 2: Task Update with Validation
```javascript
const handleUpdateTask = async (taskId, updates, options) => {
  // Find task
  const rowIndex = rows.findIndex(r => r.id === taskId)
  if (rowIndex === -1) return

  try {
    // Optimistic update (MUST use functional update!)
    setRows(prevRows => prevRows.map(r =>
      r.id === taskId ? { ...r, ...updates } : r
    ))

    // API call
    const response = await api.patch(
      `/api/v1/schedule_template_rows/${taskId}`,
      { schedule_template_row: updates }
    )

    // Sync with server response (MUST use functional update!)
    if (!options?.skipReload) {
      setRows(prevRows => prevRows.map(r =>
        r.id === taskId ? response : r
      ))
    }
  } catch (err) {
    // Rollback on error
    await loadTemplateRows(selectedTemplate.id)
    showToast(err.message, 'error')
  }
}
```

### Pattern 3: Conditional Toolbar Buttons
```jsx
{selectedTemplate && (
  <>
    {/* Always visible */}
    <button>
      📊 View Gantt
    </button>

    {/* Only for non-default templates */}
    {!selectedTemplate.is_default && (
      <>
        <button>
          ✏️ Rename
        </button>
        <button>
          🗑️ Delete
        </button>
      </>
    )}
  </>
)}
```

---

## Troubleshooting

### Issue: Tasks Not Showing in Gantt
**Symptoms:** Gantt opens but shows no tasks or blank timeline

**Causes & Fixes:**
- ✅ Check `tasks` prop is populated
- ✅ Verify tasks have `id`, `name`, `duration`, `start_date`
- ✅ Check console for DHtmlx errors
- ✅ Ensure `isOpen={true}` when modal should display

### Issue: Tasks Disappearing During Operations
**Symptoms:** Tasks randomly disappear, need hard refresh to see all tasks
**Added:** November 14, 2025

**Causes & Fixes:**
- ✅ **Check ALL setRows() calls use functional updates** (prevRows =>)
- ✅ Look for non-functional updates like `setRows(rows.map(...))`
- ✅ Test operations that trigger concurrent updates (duration change, reorder)
- ✅ Verify no race conditions in optimistic updates

**How to Test:**
1. Change duration on task with dependencies
2. All dependent tasks should remain visible
3. Add new task while editing another
4. New task should stay visible

### Issue: TypeError - Cannot read properties of undefined
**Symptoms:** App crashes with "Cannot read properties of undefined (reading 'id')" or similar
**Added:** November 14, 2025

**Causes & Fixes:**
- ✅ **Check ALL gantt.eachTask() callbacks have undefined checks**
- ✅ Look for missing `if (!task || !task.id) return` at start of callback
- ✅ Verify checks for both `!task` AND `!task.id`
- ✅ Test during drag operations, task deletion, reordering

**Pattern to Fix:**
```javascript
// Find the gantt.eachTask call that's crashing
gantt.eachTask((task) => {
  // Add this at the very beginning
  if (!task || !task.id) return

  // Rest of your code...
})
```

### Issue: Lag When Dragging Tasks
**Symptoms:** UI stutters or freezes during drag operations

**Causes & Fixes:**
- ✅ Check if localStorage writes are debounced (should be)
- ✅ Verify `smart_rendering` and `static_background` enabled
- ✅ Check for console errors during drag
- ✅ Ensure no unnecessary re-renders in parent component

### Issue: Visual Flashing
**Symptoms:** Gantt chart flickers or flashes during updates

**Causes & Fixes:**
- ✅ Use `debouncedRender()` instead of direct `gantt.render()`
- ✅ Check for multiple render calls in rapid succession
- ✅ Verify renderTimeout is being cleared properly

### Issue: API Delete Errors
**Symptoms:** "Unexpected end of JSON input" when deleting templates

**Fix:** Already handled in api.js - handle 204 No Content responses:
```javascript
if (response.status === 204) return null
const text = await response.text()
return text ? JSON.parse(text) : null
```

### Issue: Tasks Appear Out of Order
**Expected:** Tasks sorted by start date (timeline order)

**If Sorting Wrong:** Check `sortBy` default is `'startDate'`
```javascript
// Should be:
const [sortBy, setSortBy] = useState('startDate')
// NOT:
const [sortBy, setSortBy] = useState('sequence')
```

---

## Validation Workflow with Claude.ai

### How This File Gets Updated and Validated

**Step 1: CC Makes Code Changes**
- CC updates code that affects Gantt functionality
- CC updates this MD file in the relevant rule sections
- CC documents WHY the change was made

**Step 2: User Copies to Claude.ai**
- User clicks "Gantt Rules" button in app settings
- User clicks "Copy All" button
- User pastes entire MD file to Claude.ai

**Step 3: Claude.ai Reviews**
- Claude.ai reviews changes against retained knowledge
- Claude.ai identifies potential issues or breaking changes
- Claude.ai discusses concerns with user

**Step 4: Validation & Corrections**
- User and Claude.ai discuss any problems
- Claude.ai provides corrected/validated version
- Claude.ai explains what was changed and why

**Step 5: CC Receives Validated Version**
- User pastes validated MD back to CC
- CC automatically accepts it as the new Bible
- CC follows updated rules in all future sessions

### What CC Should Do When Receiving Updated File
```
1. Read entire file carefully
2. Note any new Protected Code Patterns
3. Check for conflicts with current code
4. If conflicts exist:
   - Ask user which version is correct
   - Explain the difference
   - Wait for approval before changing code
5. Update code to match new rules if needed
6. Confirm changes to user
```

---

## Development Checklist

When working on Gantt/Schedule features, always:

- [ ] Use `DHtmlxGanttView` component (never SVAR/Frappe/custom)
- [ ] Debounce all localStorage writes (500ms delay)
- [ ] Handle 204 No Content for DELETE requests
- [ ] Default sort to `startDate` for timeline view
- [ ] **Use functional state updates for ALL setRows() calls**
- [ ] **Add undefined checks to ALL gantt.eachTask() callbacks**
- [ ] Add confirmation dialogs for destructive actions
- [ ] Prevent deleting default templates
- [ ] Test with 100+ tasks for performance
- [ ] Test concurrent operations (duration change with dependencies)
- [ ] Check for console errors during drag operations
- [ ] Verify no visual flashing when updating
- [ ] Test undo/redo functionality
- [ ] Update this Bible file if making changes that affect future sessions
- [ ] Document WHY code is written a certain way

---

## Future Considerations

### DHtmlx Trial Decision
**Trial expires:** ~30 days from initial setup
**Cost:** ~$2,140 AUD for 5 developers

**Decision Criteria:**
- Does auto-scheduling save significant time?
- Is critical path visualization valuable?
- Does performance meet requirements with real data?
- Is export functionality (PDF/Excel) needed?

**Alternative:** Check Syncfusion Community License eligibility (free if revenue < $1M USD)

### Potential Enhancements
- [ ] Resource allocation view
- [ ] Baseline comparison (planned vs actual)
- [ ] Bulk task editing
- [ ] Template versioning
- [ ] Advanced filtering (by supplier, tags, status)
- [ ] Export to MS Project format

---

## Contact & Support

**DHtmlx Documentation:** https://docs.dhtmlx.com/gantt/
**DHtmlx Support:** support@dhtmlx.com
**Trial Info:** https://dhtmlx.com/docs/products/dhtmlxGantt/

**Internal Questions:**
1. Check this document first
2. Review `DHtmlxGanttView.jsx` implementation
3. Check console logs for DHtmlx messages
4. Test in isolation with minimal task data

---

## Document History

**November 14, 2025:**
- Added Protected Pattern 4: Functional State Updates
- Added Protected Pattern 5: Undefined Task Safety in gantt.eachTask
- Added Rule 5: Mandatory functional state updates
- Added Rule 6: Mandatory undefined task checks
- Updated troubleshooting with new error patterns
- Updated development checklist

**This document should be updated whenever:**
- Architectural decisions change
- Implementation patterns change
- New Protected Code Patterns are identified
- Performance requirements change
- Bug fixes require rule updates

**Update Process:**
1. CC updates relevant sections when making code changes
2. User validates changes with Claude.ai
3. Validated version becomes new Bible
4. All future sessions follow updated rules
