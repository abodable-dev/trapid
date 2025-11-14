# Gantt & Schedule Master - The Bible (Development Rules)
**Version:** 1.0.3
**Last Updated:** November 14, 2025 at 12:27 PM (Fixed render loop returning after second drag)
**Status:** Production-ready with DHtmlx trial
**Authority Level:** ABSOLUTE - This is The Bible for all Gantt development
**File Locations:**
- Source: `/Users/rob/Projects/trapid/GANTT_SCHEDULE_RULES.md`
- Public: `/Users/rob/Projects/trapid/frontend/public/GANTT_SCHEDULE_RULES.md`

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
6. **Answering questions posed in The Bible** (see rule below)

### Rule: Answering Questions in The Bible
When The Bible contains questions for CC to answer (marked with sections like "CC: ANSWER THESE QUESTIONS"):

1. **CC MUST answer all questions completely**
2. **CC MUST update The Bible with the answers in the appropriate sections**
3. **CC MUST remove the question prompt after answering** (replace with "Note: Questions answered - this is now a reference")
4. **CC MUST mark the section as complete** to prevent The Bible from growing too long

**Why:** Unanswered questions make The Bible grow too large, causing "Prompt is too long" errors. Once questions are answered and documented, the prompts must be removed.

### How to Update
1. **Update the relevant rule section directly** (not just a changelog)
2. **Explain WHY the code is written that way** (prevent future "optimization" attempts)
3. **Document any performance implications**
4. **Add examples of correct vs incorrect usage**
5. **Note any dependencies or side effects**
6. **Ensure UI buttons read the updated file** (see rule below)

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

### Critical: Gantt Rules UI Buttons & File Sync
When CC updates this Bible file, CC MUST ensure the UI buttons in Settings > Schedule Master tab work correctly:

**File Sync Process (MANDATORY):**
Every time CC modifies the source file at `/Users/rob/Projects/trapid/GANTT_SCHEDULE_RULES.md`, CC MUST:
1. **Update the version number** (increment patch: 1.0.0 → 1.0.1, minor for new features: 1.0.0 → 1.1.0, major for breaking changes: 1.0.0 → 2.0.0)
2. **Update the timestamp** to current date and time
3. **Run the sync script:** `./scripts/sync-gantt-rules.sh` OR manually copy:
   ```bash
   cp /Users/rob/Projects/trapid/GANTT_SCHEDULE_RULES.md /Users/rob/Projects/trapid/frontend/public/GANTT_SCHEDULE_RULES.md
   ```
4. **Verify sync:** Check that both files have the same version number and timestamp

**"Gantt Rules" Button:**
- Opens modal to VIEW the latest Bible content
- Must read from the updated file in project

**"Copy Gantt Rules" Button:**
- Copies the latest Bible content to clipboard
- Must read from the updated file in project

**Implementation Check:**
Both buttons dynamically read the Bible file from `/frontend/public/GANTT_SCHEDULE_RULES.md`. If CC updates the source Bible, both buttons must immediately reflect the changes after sync (no page refresh needed).

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

### Protected Pattern 1a: Render Loop Prevention
**Location:** DHtmlxGanttView.jsx (lines 3143-3168, 3398-3404)
**Added:** November 14, 2025

**The Problem:**
Dragging a task triggers a cascade: drag → save → state update → useEffect → gantt.parse() → spurious drag events → repeat. This causes 16+ consecutive drag events and severe UI glitching/flickering.

**The Code:**
```javascript
// In useEffect that loads tasks:
useEffect(() => {
  // ... validation ...

  // CRITICAL: Prevent data reload while actively dragging
  if (isDragging.current) {
    console.log('⏸️ Skipping data reload - drag operation in progress')
    return
  }

  // CRITICAL: Prevent cascading reloads if already loading data
  if (isLoadingData.current) {
    console.log('⏸️ Skipping data reload - already loading data')
    return
  }

  // Load data...
  isLoadingData.current = true
  gantt.clearAll()
  gantt.parse({ data: ganttTasks, links: ganttLinks })

  // CRITICAL: Reset flag with sufficient delay for all state updates to settle
  setTimeout(() => {
    isLoadingData.current = false
    console.log('✅ Data loading complete - drag events re-enabled')
  }, 500) // Must be 500ms minimum, not less
}, [ganttReady, tasks, ...])
```

**WHY:**
- `gantt.parse()` internally triggers `onAfterTaskDrag` events even when no real drag occurred
- State updates from backend responses trigger useEffect which calls gantt.parse()
- Without protection, each drag creates a render loop: drag → update → reload → spurious drag → repeat
- The 500ms timeout ensures all queued React state updates complete before re-enabling drag events

**CONSEQUENCES:**
- Reducing timeout below 500ms: Render loops resume, causing flickering
- Removing `isDragging.current` check: Reloads during active drag, breaking drag UX
- Removing `isLoadingData.current` check: Cascading reloads cause infinite loops

**DO NOT:**
- Reduce the 500ms timeout (tested value - shorter causes issues)
- Remove the isDragging.current check
- Remove the isLoadingData.current check
- "Optimize" by batching differently without testing thoroughly

### Protected Pattern 1b: isDragging Flag Management
**Location:** DHtmlxGanttView.jsx (lines 1346, 1448, 1640, 1873-1876)
**Added:** November 14, 2025
**Updated:** November 14, 2025 at 12:30 PM (testing fix for rapid consecutive drags)

**The Problem:**
The `isDragging.current` flag was only reset in specific code branches. This caused blank screens. Additionally, rapid consecutive drags would fail because `isLoadingData.current` stayed true from the first drag's 500ms timeout, blocking the second drag's reload.

**The Fix:**
```javascript
gantt.attachEvent('onAfterTaskDrag', (id, mode, event) => {
  // ... drag handling logic ...

  // Early return cases MUST reset both flags:
  if (conflictDetected) {
    isDragging.current = false
    isLoadingData.current = false // Allow immediate next operation
    return false
  }

  if (openingCascadeModal) {
    isDragging.current = false
    isLoadingData.current = false // Allow immediate next operation
    return false
  }

  // ... save logic ...

  // CRITICAL: Distinguish between real drags and spurious drags
  const task = gantt.getTask(id)
  const wasRealDrag = task && task.$originalStart

  isDragging.current = false
  if (wasRealDrag) {
    isLoadingData.current = false // Real drag completed, allow next reload
  }
  // Spurious drags (from gantt.parse) don't reset isLoadingData

  return true
})
```

**WHY:**
- `isDragging.current = true` is set in `onBeforeTaskDrag`
- Real user drags have `$originalStart` set; spurious drags from `gantt.parse()` do not
- `useEffect` checks both flags and skips data reload if either is true
- If flags are never reset, all future reloads are blocked → blank screen

**CRITICAL - v1.0.4 Refinement:**
- **Differentiate between real drags and spurious drags** using `task.$originalStart`
- **Real drags** (have `$originalStart`): Reset BOTH flags to allow next reload
- **Spurious drags** (no `$originalStart` from gantt.parse): Only reset `isDragging`
- This prevents spurious drags from resetting `isLoadingData` during ongoing reload (fixes render loop)
- But allows rapid consecutive real drags by clearing `isLoadingData` after each real drag completes

**CONSEQUENCES:**
- Forgetting to reset `isDragging` in ANY code path: Blank screen after that drag
- Resetting `isLoadingData` for spurious drags: Render loop returns (10+ events)
- NOT resetting `isLoadingData` for real drags: Blank screen on rapid consecutive drags
- User must refresh page to recover from blank screen

**DO NOT:**
- Remove any `isDragging.current = false` statements
- Reset `isLoadingData` for ALL drags without checking if real vs spurious
- Remove the `task.$originalStart` check at the end of handler
- Add early returns without resetting the flags first
- "Simplify" by consolidating these resets (defense in depth is intentional)

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

---

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Schedule Master Table - Column Definitions](#schedule-master-table---column-definitions)
- [Implementation Rules](#implementation-rules)
- [Performance Requirements](#performance-requirements)
- [Sorting & Display Logic](#sorting--display-logic)
- [Data Flow & State Management](#data-flow--state-management)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Validation Workflow with Claude.ai](#validation-workflow-with-claudeai)

---

## Schedule Master Table - Column Definitions

This section documents EXACTLY what each column in the Schedule Master table does, how it should behave, and the rules that govern it.

**Table Location:** `http://localhost:5173/settings?tab=schedule-master`
**Component:** `ScheduleTemplateEditor.jsx`
**Database Table:** `schedule_template_rows`

---

### Core Task Columns

#### Column: # (Sequence)
**UI Label:** `#`
**Column Key:** `sequence`
**Database Field:** `sequence_order` (Integer, NOT NULL)
**Display Value:** `index + 1` (1-based row number)
**Type:** Auto-generated display number

**Purpose:**
Shows the task number in the current display order. This is purely a UI element that shows row position in the table.

**Behavior:**
- **Read-only** - Cannot be edited by user
- Displays row position (1, 2, 3, etc.)
- Changes dynamically when rows are reordered with Move Up/Down buttons
- **NOT sortable** - This column doesn't have sort functionality

**Rules:**
- `sequence_order` in database determines physical row order
- Display number is calculated as `index + 1` where index is array position
- When rows are moved, `sequence_order` values are recalculated

**Affects:**
- Row display order in table
- Predecessor references (predecessors use task numbers from this column)
- Gantt chart task order

**Database Details:**
```ruby
t.integer "sequence_order", null: false
validates :sequence_order, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
```

---

#### Column: Task Name
**UI Label:** `Task Name`
**Column Key:** `taskName`
**Database Field:** `name` (String, NOT NULL)
**Display Value:** Text input showing `row.name`
**Type:** User-editable text field

**Purpose:**
The primary identifier and description of the task (e.g., "Site Preparation", "Foundation Pour", "Frame Erection").

**Behavior:**
- **Editable** - User can type directly in table cell
- Changes are **debounced** (500ms delay before saving to prevent excessive API calls)
- Input selects all text on focus for easy replacement
- Searchable/filterable column
- Sortable alphabetically

**Rules:**
- **Required** - Cannot be empty (validated on backend)
- Maximum length not explicitly limited
- Trimmed of whitespace before saving
- Changes trigger API PATCH to `/api/v1/schedule_template_rows/:id`

**Affects:**
- Task identification throughout the system
- Search and filter results
- Gantt chart task labels
- Predecessor display (when showing task names vs numbers)
- Export outputs

**Database Details:**
```ruby
t.string "name", null: false
validates :name, presence: true
```

**Implementation:**
```javascript
// Local state for debouncing
const [localName, setLocalName] = useState(row.name)

// Debounced update (500ms)
const handleTextChange = (field, value) => {
  setLocalName(value)
  clearTimeout(updateTimeoutRef.current)
  updateTimeoutRef.current = setTimeout(() => {
    if (value && value.trim()) {
      onUpdate({ [field]: value })
    }
  }, 500)
}
```

---

#### Column: Supplier / Group
**UI Label:** `Supplier / Group`
**Column Key:** `supplierGroup`
**Database Fields:**
- `supplier_id` (BigInt, Foreign Key to suppliers table, optional)
- `assigned_role` (String, optional)

**Display Value:**
- Dropdown showing **Supplier** names when `po_required` is checked
- Dropdown showing **Internal Roles** when `po_required` is NOT checked

**Type:** Conditional select dropdown

**Purpose:**
Assigns the task to either an external supplier (if PO required) or an internal role/group (if no PO needed).

**Behavior:**
- **Editable** - User selects from dropdown
- **Conditional display:**
  - When `po_required = true` → Shows suppliers dropdown
  - When `po_required = false` → Shows internal roles dropdown
- Changes are **immediate** (no debounce)
- Searchable/filterable column

**Options - Suppliers:**
Loaded from `/api/v1/suppliers` - all active supplier companies

**Options - Internal Roles:**
```javascript
const ASSIGNABLE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
  { value: 'site', label: 'Site' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'builder', label: 'Builder' },
  { value: 'estimator', label: 'Estimator' }
]
```

**Rules:**
- **Mutually exclusive:** A task can have EITHER `supplier_id` OR `assigned_role`, never both
- When `po_required` is checked, `assigned_role` is cleared and `supplier_id` can be set
- When `po_required` is unchecked, `supplier_id` is cleared and `assigned_role` can be set
- **Validation:** If `create_po_on_job_start` is true, `supplier_id` MUST be present

**Affects:**
- Task assignment and responsibility
- Auto PO creation (requires supplier)
- Price Items selection (requires supplier)
- Task filtering and reporting
- Gantt chart display

**Database Details:**
```ruby
t.bigint "supplier_id"
t.string "assigned_user_id"
belongs_to :supplier, optional: true

validate :supplier_required_if_po_required

private
def supplier_required_if_po_required
  if create_po_on_job_start? && supplier_id.blank?
    errors.add(:supplier_id, "must be present when Auto PO is enabled")
  end
end
```

**Implementation:**
```javascript
{row.po_required ? (
  <select
    value={row.supplier_id || ''}
    onChange={(e) => handleFieldChange('supplier_id', e.target.value ? parseInt(e.target.value) : null)}
  >
    <option value="">Select supplier...</option>
    {suppliers.map(s => (
      <option key={s.id} value={s.id}>{s.name}</option>
    ))}
  </select>
) : (
  <select
    value={row.assigned_role || ''}
    onChange={(e) => handleFieldChange('assigned_role', e.target.value || null)}
  >
    <option value="">Assign to group...</option>
    {ASSIGNABLE_ROLES.map(role => (
      <option key={role.value} value={role.value}>{role.label}</option>
    ))}
  </select>
)}
```

---

#### Column: Predecessors
**UI Label:** `Predecessors`
**Column Key:** `predecessors`
**Database Field:** `predecessor_ids` (JSONB Array, default: [])
**Display Value:** Formatted string like "2FS+3, 5SS" or "None"
**Type:** Modal-based editor (click to open PredecessorEditor modal)

**Purpose:**
Defines task dependencies - which tasks must complete (or start) before this task can begin.

**Behavior:**
- **Editable** - Click button to open PredecessorEditor modal
- Displays formatted predecessor string (e.g., "2FS+3, 5SS-1")
- Format: `[TaskNumber][LinkType][+/-Lag]`
- Backend calculates `predecessor_display` for consistent formatting
- Used by Gantt chart to draw dependency arrows
- Used to auto-calculate `start_date`

**Link Types:**
- **FS** (Finish-to-Start) - Most common. This task starts after predecessor finishes.
- **SS** (Start-to-Start) - This task starts when predecessor starts.
- **FF** (Finish-to-Finish) - This task finishes when predecessor finishes.
- **SF** (Start-to-Finish) - This task finishes when predecessor starts. (Rare)

**Lag (Days):**
- Positive lag (+3) = delay (wait 3 days after predecessor)
- Negative lag (-2) = lead (start 2 days before predecessor finishes)
- Zero lag (no suffix) = immediate (start same day predecessor ends)

**Data Structure:**
```javascript
predecessor_ids: [
  { id: 2, type: 'FS', lag: 3 },   // Task 2, Finish-to-Start, 3 day delay
  { id: 5, type: 'SS', lag: 0 },   // Task 5, Start-to-Start, no delay
  { id: 8, type: 'FF', lag: -2 }   // Task 8, Finish-to-Finish, 2 day lead
]
```

**Display Format:**
```
"2FS+3, 5SS, 8FF-2"
```

**Rules:**
- Can have multiple predecessors (array of objects)
- Task numbers refer to `sequence_order` position (1-based)
- Invalid predecessors (non-existent task IDs) are skipped in display
- Circular dependencies should be avoided (not enforced in template editor but causes issues in Gantt)
- Changing predecessors triggers `start_date` recalculation (unless task is manually positioned)

**Affects:**
- **Start Date** - Auto-calculated based on predecessor completion + lag
- **Gantt Chart** - Draws dependency arrows between tasks
- **Critical Path** - Used to determine critical path in Gantt view
- **Auto-scheduling** - DHtmlx Gantt uses this for auto-scheduling feature

**Backend Helper Methods:**
```ruby
def predecessor_display
  return "None" if predecessor_task_ids.empty?
  predecessor_task_ids.map { |pred| format_predecessor(pred) }.compact.join(", ")
end

def format_predecessor(pred_data)
  # pred_data: { id: 2, type: "FS", lag: 3 }
  task_id = pred_data['id'] || pred_data[:id]
  dep_type = pred_data['type'] || pred_data[:type] || 'FS'
  lag = (pred_data['lag'] || pred_data[:lag] || 0).to_i

  result = "#{task_id}#{dep_type}"
  result += lag >= 0 ? "+#{lag}" : lag.to_s if lag != 0
  result
end
```

**Implementation:**
```javascript
// Display button with formatted value
<button
  onClick={() => setShowPredecessorEditor(true)}
  className="w-full px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100 cursor-pointer"
>
  {row.predecessor_display || 'None'}
</button>

// Modal for editing
{showPredecessorEditor && (
  <PredecessorEditor
    isOpen={true}
    onClose={() => setShowPredecessorEditor(false)}
    currentPredecessors={row.predecessor_ids || []}
    allRows={allRows}
    currentRowIndex={index}
    onSave={(newPredecessors) => {
      onUpdate({ predecessor_ids: newPredecessors })
      setShowPredecessorEditor(false)
    }}
  />
)}
```

---

#### Column: Duration
**UI Label:** `Duration`
**Column Key:** `duration`
**Database Field:** `duration` (Integer, default: 0, NOT NULL)
**Display Value:** Number input showing business days
**Type:** User-editable number field

**Purpose:**
Specifies how many business days the task will take to complete.

**Behavior:**
- **Editable** - User types number directly
- **Debounced** - 500ms delay before saving (except on blur, which saves immediately)
- Minimum value: 0
- Input selects all on focus for easy replacement
- Auto-calculates dependent task start dates when changed

**Rules:**
- Must be non-negative integer
- 0 duration = milestone task (instant completion)
- Changing duration affects:
  - End date of this task (`start_date + duration`)
  - Start dates of dependent tasks (if they have this task as predecessor)
- Changes trigger backend recalculation cascade

**Affects:**
- Task end date calculation
- Successor task start dates (via predecessor relationships)
- Gantt chart bar length
- Project total duration
- Critical path calculation

**Database Details:**
```ruby
t.integer "duration", default: 0, null: false
```

**Implementation:**
```javascript
// Local state for smooth UX
const [localDuration, setLocalDuration] = useState(row.duration || 0)

// Debounced change
const handleTextChange = (field, value) => {
  const numValue = parseInt(value) || 0
  setLocalDuration(numValue)

  clearTimeout(updateTimeoutRef.current)
  updateTimeoutRef.current = setTimeout(() => {
    onUpdate({ duration: numValue })
  }, 500)
}

// Immediate save on blur
<input
  type="number"
  value={localDuration}
  onChange={(e) => handleTextChange('duration', e.target.value)}
  onBlur={(e) => {
    // Clear debounce and save immediately
    const numValue = parseInt(e.target.value) || 0
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    onUpdate({ duration: numValue })
  }}
  min="0"
/>
```

---

#### Column: Start Date
**UI Label:** `Start Date`
**Column Key:** `startDate`
**Database Field:** `start_date` (Integer, default: 0, NOT NULL)
**Display Value:** Integer representing business days from project start (Day 0)
**Type:** **Read-only** calculated field

**Purpose:**
Shows when the task should start, measured in business days from project start date (Day 0 = project start).

**Behavior:**
- **NOT editable** - Auto-calculated based on predecessors and duration
- Displays as integer: 0, 5, 12, etc.
- Recalculates automatically when:
  - Predecessors change
  - Predecessor durations change
  - Dependency lag values change
- Can be overridden by setting `manually_positioned = true` (via Gantt drag)

**Calculation Logic:**
```javascript
const calculateStartDate = () => {
  if (!row.predecessor_ids || row.predecessor_ids.length === 0) {
    return 0 // No predecessors = start at project start (Day 0)
  }

  // Find the latest end date of all predecessors
  let latestEnd = 0
  row.predecessor_ids.forEach(pred => {
    const predData = typeof pred === 'object' ? pred : { id: pred, type: 'FS', lag: 0 }
    const predTask = allRows[predData.id - 1] // Task numbers are 1-indexed

    if (predTask) {
      const predStart = predTask.start_date || 0
      const predDuration = predTask.duration || 0
      const predEnd = predStart + predDuration

      // For FS (Finish-to-Start), task starts after predecessor finishes
      if (predData.type === 'FS' || !predData.type) {
        const taskStart = predEnd + (predData.lag || 0)
        if (taskStart > latestEnd) {
          latestEnd = taskStart
        }
      }
    }
  })

  return latestEnd
}
```

**Rules:**
- Always non-negative integer
- 0 = starts on project start date
- **Auto-calculation is skipped** if `manually_positioned = true`
- Calculation uses **latest** predecessor end date (takes maximum of all predecessors)
- Updates are debounced (100ms) to prevent API spam during bulk changes

**Affects:**
- Task scheduling in project timeline
- Gantt chart horizontal position
- Successor task calculations
- Critical path determination
- Project completion date

**Database Details:**
```ruby
t.integer "start_date", default: 0, null: false
```

**Manual Positioning:**
When user drags task in Gantt chart:
```javascript
// User drags task in Gantt → sets manually_positioned = true
onUpdate({
  start_date: newStartDate,
  manually_positioned: true
})

// Task no longer auto-calculates start_date
// Remains at manually set position even if predecessors change
```

**Implementation:**
```javascript
// Auto-update start_date when calculation changes
useEffect(() => {
  if (row.manually_positioned) {
    // Skip auto-calculation for manually positioned tasks
    return
  }

  if (calculatedStartDate !== row.start_date) {
    // Debounce to avoid excessive API calls
    const timer = setTimeout(() => {
      onUpdate({ start_date: calculatedStartDate })
    }, 100)
    return () => clearTimeout(timer)
  }
}, [calculatedStartDate, row.start_date, row.manually_positioned, onUpdate])

// Display (read-only)
<div className="px-2 py-1 bg-gray-50 rounded border">
  {calculatedStartDate}
</div>
```

---

### Purchase Order Columns

#### Column: PO Req
**UI Label:** `PO Req`
**Column Key:** `poRequired`
**Database Field:** `po_required` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Indicates whether this task requires a Purchase Order to be created.

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- **Has cascading effects** on other fields when changed

**Rules:**
- **When checked (true):**
  - Enables `supplier_id` dropdown (must select supplier)
  - Clears `assigned_role` (can't be both supplier and internal)
  - Enables "Auto PO" checkbox
  - Enables "Price Items" selection

- **When unchecked (false):**
  - Clears `supplier_id` (set to null)
  - Forces `create_po_on_job_start` to false
  - Enables `assigned_role` dropdown (internal assignment)
  - Disables "Price Items" selection

**Affects:**
- Supplier/Group column behavior (switches between supplier/internal)
- Auto PO checkbox enabled state
- Price Items selection availability
- PO generation during project instantiation

**Database Details:**
```ruby
t.boolean "po_required", default: false, null: false
```

**Implementation:**
```javascript
const handleFieldChange = (field, value) => {
  if (field === 'po_required') {
    if (!value) {
      // If unchecking po_required, also uncheck create_po_on_job_start and clear supplier
      onUpdate({
        po_required: false,
        create_po_on_job_start: false,
        supplier_id: null
      })
    } else {
      // If checking po_required, clear assigned_role
      onUpdate({
        po_required: true,
        assigned_role: null
      })
    }
  }
}

<input
  type="checkbox"
  checked={row.po_required}
  onChange={(e) => handleFieldChange('po_required', e.target.checked)}
  className="h-4 w-4"
/>
```

---

#### Column: Auto PO
**UI Label:** `Auto PO`
**Column Key:** `autoPo`
**Database Field:** `create_po_on_job_start` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox (grayed out if disabled)
**Type:** Boolean checkbox (conditional enable)

**Purpose:**
When enabled, automatically creates a Purchase Order for this task when a new project/job is created from this template.

**Behavior:**
- **Editable** - User can check/uncheck (if enabled)
- **Conditionally enabled:**
  - **Enabled** only if BOTH `po_required = true` AND `supplier_id` is selected
  - **Disabled** otherwise (grayed out, shows tooltip)
- Changes are **immediate** (no debounce)
- Alert shown if user tries to enable without supplier selected

**Rules:**
- **Cannot be enabled unless:**
  1. `po_required = true` (PO Req is checked)
  2. `supplier_id` is not null (Supplier is selected)

- **Validation:** Backend validates `supplier_id` must exist if this is true
- If `po_required` is unchecked, this field is automatically set to false

**Affects:**
- Price Items selection (must have Auto PO enabled to select items)
- Automatic PO generation when project is instantiated from template
- Supplier requirement (forces supplier selection)

**Database Details:**
```ruby
t.boolean "create_po_on_job_start", default: false, null: false

validate :supplier_required_if_po_required

private
def supplier_required_if_po_required
  if create_po_on_job_start? && supplier_id.blank?
    errors.add(:supplier_id, "must be present when Auto PO is enabled")
  end
end
```

**Implementation:**
```javascript
const handleFieldChange = (field, value) => {
  if (field === 'create_po_on_job_start') {
    if (value && !row.supplier_id) {
      // Show error if trying to enable without supplier
      alert('Please select a supplier first before enabling Auto PO')
      return
    } else {
      onUpdate({ [field]: value })
    }
  }
}

<input
  type="checkbox"
  checked={row.create_po_on_job_start}
  onChange={(e) => handleFieldChange('create_po_on_job_start', e.target.checked)}
  disabled={!row.po_required || !row.supplier_id}
  className="h-4 w-4 disabled:opacity-30"
  title={
    !row.po_required ? "Enable 'PO Required' first" :
    !row.supplier_id ? "Select a supplier first" :
    "Automatically create PO when job starts"
  }
/>
```

---

#### Column: Price Items
**UI Label:** `Price Items`
**Column Key:** `priceItems`
**Database Field:** `price_book_item_ids` (JSONB Array, default: [])
**Display Value:** Clickable button showing "X items"
**Type:** Modal-based selector (click to open PriceBookItemsModal)

**Purpose:**
Specifies which items from the supplier's price book should be included in the auto-generated PO.

**Behavior:**
- **Editable** - Click to open modal selector (if enabled)
- **Conditionally enabled:**
  - Enabled only if `create_po_on_job_start = true` AND `po_required = true` AND `supplier_id` exists
  - Disabled otherwise (grayed text, not clickable)
- Displays count: "3 items", "0 items"
- Modal filters price book items by selected supplier

**Rules:**
- **Cannot select items unless:**
  1. `po_required = true`
  2. `supplier_id` is selected
  3. `create_po_on_job_start = true` (Auto PO enabled)

- Stores array of price_book_item IDs
- When PO is auto-created, these items are added to the PO

**Affects:**
- Auto-generated PO line items
- PO total cost estimation
- Supplier ordering

**Database Details:**
```ruby
t.jsonb "price_book_item_ids", default: [], null: false

def price_book_items
  return [] if price_book_item_ids.blank?
  PricebookItem.where(id: price_book_item_ids)
end
```

**Implementation:**
```javascript
const canSelectItems = row.create_po_on_job_start && row.po_required && row.supplier_id

<button
  onClick={() => canSelectItems && setShowPriceItemsModal(true)}
  disabled={!canSelectItems}
  className={`text-xs font-medium ${
    canSelectItems
      ? 'text-indigo-600 hover:underline cursor-pointer'
      : 'text-gray-400 cursor-not-allowed'
  }`}
  title={
    !row.po_required ? "Enable 'PO Required' first" :
    !row.supplier_id ? "Select a supplier first" :
    !row.create_po_on_job_start ? "Enable 'Auto PO' first" :
    "Click to select price book items"
  }
>
  {row.price_book_item_ids?.length || 0} items
</button>

{showPriceItemsModal && (
  <PriceBookItemsModal
    isOpen={true}
    onClose={() => setShowPriceItemsModal(false)}
    selectedItems={row.price_book_item_ids || []}
    supplierId={row.supplier_id}
    onSave={(itemIds) => {
      onUpdate({ price_book_item_ids: itemIds })
      setShowPriceItemsModal(false)
    }}
  />
)}
```

---

#### Column: Critical
**UI Label:** `Critical`
**Column Key:** `critical`
**Database Field:** `critical_po` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Marks this PO as critical/urgent, requiring expedited processing or special attention.

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- No dependencies on other fields (can be set independently)

**Rules:**
- Independent flag (doesn't affect other fields)
- Can be checked regardless of `po_required` status
- Typically used in conjunction with PO-required tasks but not enforced

**Affects:**
- PO priority/urgency indicators
- Reporting and filtering
- Visual highlighting in PO lists
- May trigger notifications/workflows

**Database Details:**
```ruby
t.boolean "critical_po", default: false, null: false
```

**Implementation:**
```javascript
<input
  type="checkbox"
  checked={row.critical_po}
  onChange={(e) => handleFieldChange('critical_po', e.target.checked)}
  className="h-4 w-4"
/>
```

---

#### Column: Order Time
**UI Label:** `Order Time`
**Column Key:** `orderRequired`
**Database Field:** `order_required` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Indicates that this task requires materials/items to be ordered at a specific time (requires manual order timing).

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- Independent flag

**Rules:**
- Used for tasks that need timed ordering (not automated)
- May be used alongside or instead of Auto PO
- No validation dependencies

**Affects:**
- Task workflow requirements
- Manual ordering reminders
- Project planning and lead time management

**Database Details:**
```ruby
t.boolean "order_required", default: false, null: false
```

**Implementation:**
```javascript
<input
  type="checkbox"
  checked={row.order_required || false}
  onChange={(e) => onUpdate({ order_required: e.target.checked })}
  className="h-4 w-4"
/>
```

---

#### Column: Call Up
**UI Label:** `Call Up`
**Column Key:** `callUpRequired`
**Database Field:** `call_up_required` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Indicates that supplier/subcontractor needs to be called to schedule or confirm before task can proceed.

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- Independent flag

**Rules:**
- Independent of other PO fields
- Used for tasks requiring phone call coordination
- No validation dependencies

**Affects:**
- Task workflow and prerequisites
- Scheduling coordination requirements
- Reminder/notification systems

**Database Details:**
```ruby
t.boolean "call_up_required", default: false, null: false
```

**Implementation:**
```javascript
<input
  type="checkbox"
  checked={row.call_up_required || false}
  onChange={(e) => onUpdate({ call_up_required: e.target.checked })}
  className="h-4 w-4"
/>
```

---

### Documentation & Compliance Columns

#### Column: Photo
**UI Label:** `Photo`
**Column Key:** `photo`
**Database Field:** `require_photo` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Requires photo documentation when this task is completed.

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- **Special:** When changed, automatically adds/removes "Photos" documentation category

**Rules:**
- When checked: Automatically adds "Photos" to `documentation_category_ids`
- When unchecked: Automatically removes "Photos" from `documentation_category_ids`
- This maintains consistency between photo flag and documentation categories

**Affects:**
- Documentation category association (auto-syncs with Photos category)
- Task completion requirements
- Compliance workflows

**Database Details:**
```ruby
t.boolean "require_photo", default: false, null: false

# Callback to sync Photos category
before_save :sync_photos_category

def sync_photos_category
  return unless require_photo_changed?

  photos_category = DocumentationCategory.find_or_create_by(name: 'Photos') do |category|
    category.color = '#10b981' # emerald green
    category.description = 'Photo documentation required'
  end

  self.documentation_category_ids ||= []

  if require_photo?
    self.documentation_category_ids |= [photos_category.id]
  else
    self.documentation_category_ids -= [photos_category.id]
  end
end
```

**Implementation:**
```javascript
<input
  type="checkbox"
  checked={row.require_photo}
  onChange={(e) => handleFieldChange('require_photo', e.target.checked)}
  className="h-4 w-4"
/>
```

---

#### Column: Cert
**UI Label:** `Cert`
**Column Key:** `cert`
**Database Field:** `require_certificate` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Requires certification/compliance certificate to be uploaded for this task.

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- **Affects Cert Lag:** When checked, enables the Cert Lag field

**Rules:**
- When checked: Enables Cert Lag field (default 10 days)
- When unchecked: Cert Lag field is disabled (grayed out)

**Affects:**
- Cert Lag field enabled state
- Task completion requirements
- Compliance documentation
- Certificate upload requirements

**Database Details:**
```ruby
t.boolean "require_certificate", default: false, null: false
```

**Implementation:**
```javascript
<input
  type="checkbox"
  checked={row.require_certificate}
  onChange={(e) => handleFieldChange('require_certificate', e.target.checked)}
  className="h-4 w-4"
/>
```

---

#### Column: Cert Lag
**UI Label:** `Cert Lag`
**Column Key:** `certLag`
**Database Field:** `cert_lag_days` (Integer, default: 10, NOT NULL)
**Display Value:** Number input (days)
**Type:** Number input (conditionally enabled)

**Purpose:**
Specifies how many days after task completion the certificate is expected/required.

**Behavior:**
- **Editable** - User can type number (if enabled)
- **Conditionally enabled:** Only enabled when `require_certificate = true`
- Changes are **immediate** (no debounce)
- When disabled, field is grayed out

**Rules:**
- Must be non-negative integer
- Default value is 10 days
- Minimum: 0, Maximum: 999 (enforced by validation)
- Only relevant when certificates are required

**Affects:**
- Certificate due date calculation
- Compliance deadline tracking
- Task completion timeline

**Database Details:**
```ruby
t.integer "cert_lag_days", default: 10, null: false
validates :cert_lag_days, numericality: {
  only_integer: true,
  greater_than_or_equal_to: 0,
  less_than_or_equal_to: 999
}
```

**Implementation:**
```javascript
<input
  type="number"
  value={row.cert_lag_days}
  onChange={(e) => handleFieldChange('cert_lag_days', parseInt(e.target.value))}
  disabled={!row.require_certificate}
  className="w-full px-2 py-1 border rounded disabled:opacity-50"
/>
```

---

#### Column: Sup Check
**UI Label:** `Sup Check`
**Column Key:** `supCheck`
**Database Field:** `require_supervisor_check` (Boolean, default: false, NOT NULL)
**Related Field:** `supervisor_checklist_template_ids` (Array of integers, default: [])
**Display Value:** Checkbox + clickable "X items" link (when checked)
**Type:** Boolean checkbox with conditional modal link

**Purpose:**
Requires supervisor inspection/checklist to be completed for this task.

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- **When checked:** Shows clickable link "X items" to open SupervisorChecklistModal
- **When unchecked:** Only shows checkbox

**Rules:**
- When checked: Shows checklist item selector
- Checklist items are templates that get instantiated on project creation

**Affects:**
- Supervisor checklist assignment
- Task completion requirements
- Inspection workflow

**Database Details:**
```ruby
t.boolean "require_supervisor_check", default: false, null: false
t.integer "supervisor_checklist_template_ids", default: [], array: true
```

**Implementation:**
```javascript
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={row.require_supervisor_check}
    onChange={(e) => handleFieldChange('require_supervisor_check', e.target.checked)}
    className="h-4 w-4"
  />
  {row.require_supervisor_check && (
    <button
      onClick={() => setShowChecklistModal(true)}
      className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
      title="Click to assign checklist items"
    >
      {row.supervisor_checklist_template_ids?.length || 0} items
    </button>
  )}
</div>

{showChecklistModal && (
  <SupervisorChecklistModal
    isOpen={true}
    onClose={() => setShowChecklistModal(false)}
    selectedTemplateIds={row.supervisor_checklist_template_ids || []}
    onSave={(templateIds) => {
      onUpdate({ supervisor_checklist_template_ids: templateIds })
      setShowChecklistModal(false)
    }}
  />
)}
```

---

#### Column: Plan
**UI Label:** `Plan`
**Column Key:** `planType`
**Database Field:** `plan_required` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Indicates that building plans/drawings are required for this task (e.g., site plan, floor plan, elevation).

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- Generic flag for plan requirement

**Note:** This is a boolean flag. Specific plan types are managed separately in the system (not in this column).

**Rules:**
- Independent flag
- Indicates any type of plan is required

**Affects:**
- Task completion requirements
- Plan documentation workflow
- Drawing availability checks

**Database Details:**
```ruby
t.boolean "plan_required", default: false, null: false
```

**Implementation:**
```javascript
<input
  type="checkbox"
  checked={row.plan_required || false}
  onChange={(e) => onUpdate({ plan_required: e.target.checked })}
  className="h-4 w-4"
/>
```

---

#### Column: Documentation Categories (Dynamic Columns)
**UI Label:** Category name (e.g., "Photos", "Certificates", "Inspections")
**Column Key:** `docTab_[categoryId]` (e.g., `docTab_5`, `docTab_12`)
**Database Field:** `documentation_category_ids` (Array of integers, default: [])
**Display Value:** Checkbox (with colored background)
**Type:** Dynamic boolean checkboxes (one column per category)

**Purpose:**
Allows tagging tasks with specific documentation categories that will be required/tracked.

**Behavior:**
- **Dynamically created:** One column per documentation category in the system
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- Background color tinted with category color
- Columns are created at runtime based on `/api/v1/documentation_categories`

**Column Creation:**
```javascript
// Columns are auto-generated from documentationCategories
documentationCategories.forEach((category, index) => {
  const key = `docTab_${category.id}`
  columnConfig[key] = {
    visible: true,
    width: 80,
    label: category.name,  // e.g., "Photos", "Certs"
    order: 50 + index,      // After planType, before actions
    categoryId: category.id,
    categoryColor: category.color,  // e.g., "#10b981"
    isDocTabColumn: true
  }
})
```

**Rules:**
- Each checkbox represents membership in that category
- Checking adds category ID to `documentation_category_ids` array
- Unchecking removes category ID from array
- Array can contain multiple category IDs (task can have multiple categories)
- **Special:** "Photos" category is auto-synced with `require_photo` field

**Affects:**
- Documentation requirements for task
- Folder/document organization in projects
- Compliance tracking

**Database Details:**
```ruby
t.integer "documentation_category_ids", default: [], array: true
index ["documentation_category_ids"], using: :gin
```

**Implementation:**
```javascript
// In renderCell switch default case:
if (key.startsWith('docTab_')) {
  const categoryId = config.categoryId
  const isChecked = row.documentation_category_ids?.includes(categoryId) || false

  return (
    <td
      key={key}
      style={{
        width: `${cellWidth}px`,
        minWidth: `${cellWidth}px`,
        backgroundColor: config.categoryColor ? `${config.categoryColor}10` : undefined
      }}
      className="px-3 py-3 border-r text-center"
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => {
          const currentIds = row.documentation_category_ids || []
          const newIds = e.target.checked
            ? [...currentIds, categoryId]
            : currentIds.filter(id => id !== categoryId)
          onUpdate({ documentation_category_ids: newIds })
        }}
        className="h-4 w-4"
        title={`Toggle ${config.label}`}
      />
    </td>
  )
}
```

---

### Task Management Columns

#### Column: Tags
**UI Label:** `Tags`
**Column Key:** `tags`
**Database Field:** `tags` (JSONB Array, default: [])
**Display Value:** Text input showing comma-separated tags
**Type:** Text input with array serialization

**Purpose:**
Allows adding custom tags to tasks for categorization, filtering, and organization.

**Behavior:**
- **Editable** - User types comma-separated values
- Changes are **immediate** (no debounce)
- Input format: `tag1, tag2, tag3`
- Automatically split on commas and trimmed
- Empty tags are filtered out
- Searchable/filterable column

**Rules:**
- Stored as JSON array: `["tag1", "tag2", "tag3"]`
- Displayed as comma-separated string: `"tag1, tag2, tag3"`
- Whitespace is trimmed from each tag
- Empty strings are removed

**Affects:**
- Task filtering and search
- Task categorization
- Reporting and analytics
- Bulk operations

**Database Details:**
```ruby
t.jsonb "tags", default: [], null: false

def tag_list
  tags || []
end
```

**Implementation:**
```javascript
<input
  type="text"
  value={row.tags?.join(', ') || ''}
  onChange={(e) => {
    // Split on commas, trim whitespace, filter empty strings
    const tagArray = e.target.value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    handleFieldChange('tags', tagArray)
  }}
  placeholder="tag1, tag2"
  className="w-full px-2 py-1 border rounded"
/>
```

---

#### Column: Auto Complete
**UI Label:** `Auto Complete`
**Column Key:** `autoComplete`
**Database Field:** `auto_complete_task_ids` (JSONB Array, default: [])
**Display Value:** Clickable button showing "X tasks"
**Type:** Modal-based selector

**Purpose:**
Specifies which other tasks should be automatically marked as complete when this task is completed.

**Behavior:**
- **Editable** - Click to open AutoCompleteTasksModal
- Displays count: "3 tasks", "0 tasks"
- Modal allows selecting other tasks in template

**Rules:**
- Stores array of task IDs to auto-complete
- Can select multiple tasks
- Used during project task completion workflow

**Affects:**
- Automated task completion cascade
- Workflow efficiency
- Dependent task completion

**Database Details:**
```ruby
t.jsonb "auto_complete_task_ids", default: [], null: false
```

**Implementation:**
```javascript
<button
  onClick={() => setShowAutoCompleteModal(true)}
  className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
  title="Click to select tasks to auto-complete"
>
  {row.auto_complete_task_ids?.length || 0} tasks
</button>

{showAutoCompleteModal && (
  <AutoCompleteTasksModal
    isOpen={true}
    onClose={() => setShowAutoCompleteModal(false)}
    selectedTaskIds={row.auto_complete_task_ids || []}
    allRows={allRows}
    currentRowId={row.id}
    onSave={(taskIds) => {
      onUpdate({ auto_complete_task_ids: taskIds })
      setShowAutoCompleteModal(false)
    }}
  />
)}
```

---

#### Column: Subtasks
**UI Label:** `Subtasks`
**Column Key:** `subtasks`
**Database Fields:**
- `has_subtasks` (Boolean, default: false)
- `subtask_count` (Integer, optional)
- `subtask_names` (JSONB Array, default: [])
- `subtask_template_ids` (JSONB Array, default: [])

**Display Value:** Clickable button showing "X subtasks"
**Type:** Modal-based editor

**Purpose:**
Allows defining subtasks that will be created under this task when project is instantiated.

**Behavior:**
- **Editable** - Click to open SubtasksModal
- Displays count of subtask templates
- Modal allows selecting subtask templates or defining custom subtasks

**Rules:**
- Can reference predefined subtask templates
- Subtasks are instantiated as child tasks when project is created
- `subtask_names` must match `subtask_count` (validated)

**Affects:**
- Task breakdown structure
- Project task creation
- Work organization

**Database Details:**
```ruby
t.boolean "has_subtasks", default: false, null: false
t.integer "subtask_count"
t.jsonb "subtask_names", default: [], null: false
t.jsonb "subtask_template_ids", default: [], null: false

validates :subtask_count, numericality: { only_integer: true, greater_than_or_equal_to: 1 }, if: :has_subtasks?

validate :subtask_names_match_count

def subtask_names_match_count
  return unless has_subtasks?
  if subtask_count.present? && subtask_names.present?
    if subtask_names.length != subtask_count
      errors.add(:subtask_names, "count must match subtask_count")
    end
  end
end
```

**Implementation:**
```javascript
<button
  onClick={() => setShowSubtasksModal(true)}
  className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
  title="Click to select subtasks"
>
  {row.subtask_template_ids?.length || 0} subtasks
</button>

{showSubtasksModal && (
  <SubtasksModal
    isOpen={true}
    onClose={() => setShowSubtasksModal(false)}
    currentSubtasks={row.subtask_template_ids || []}
    onSave={(subtaskData) => {
      onUpdate({
        subtask_template_ids: subtaskData.templateIds,
        has_subtasks: subtaskData.templateIds.length > 0,
        subtask_count: subtaskData.templateIds.length
      })
      setShowSubtasksModal(false)
    }}
  />
)}
```

---

#### Column: Linked Tasks
**UI Label:** `Linked Tasks`
**Column Key:** `linkedTasks`
**Database Field:** `linked_task_ids` (Text/JSON, default: "[]")
**Display Value:** Clickable button showing "X tasks"
**Type:** Modal-based selector

**Purpose:**
Links this task to other tasks in the template for relationship tracking (different from predecessors - this is informational linking).

**Behavior:**
- **Editable** - Click to open LinkedTasksModal
- Displays count of linked tasks
- Modal allows selecting other tasks in template

**Rules:**
- Stored as JSON array serialized to text
- Can link to multiple tasks
- Different from predecessors (no scheduling impact)

**Affects:**
- Task relationship visualization
- Related work tracking
- Information organization

**Database Details:**
```ruby
t.text "linked_task_ids", default: "[]"
serialize :linked_task_ids, coder: JSON

def linked_task_list
  linked_task_ids || []
end

def linked_tasks_display
  return "None" if linked_task_list.empty?
  linked_task_list.join(", ")
end
```

**Implementation:**
```javascript
<button
  onClick={() => setShowLinkedTasksModal(true)}
  className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
  title="Click to select linked tasks"
>
  {row.linked_task_ids?.length || 0} tasks
</button>

{showLinkedTasksModal && (
  <LinkedTasksModal
    isOpen={true}
    onClose={() => setShowLinkedTasksModal(false)}
    selectedTaskIds={row.linked_task_ids || []}
    allRows={allRows}
    currentRowId={row.id}
    onSave={(taskIds) => {
      onUpdate({ linked_task_ids: taskIds })
      setShowLinkedTasksModal(false)
    }}
  />
)}
```

---

#### Column: Manual
**UI Label:** `Manual`
**Column Key:** `manualTask`
**Database Field:** `manual_task` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Marks this task as manually managed (not auto-scheduled or auto-completed).

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- Independent flag

**Rules:**
- When checked: Task may require manual intervention
- May affect auto-scheduling behavior
- May skip certain automation workflows

**Affects:**
- Task automation behavior
- Scheduling rules
- Completion workflows

**Database Details:**
```ruby
t.boolean "manual_task", default: false, null: false
```

**Implementation:**
```javascript
<input
  type="checkbox"
  checked={row.manual_task || false}
  onChange={(e) => onUpdate({ manual_task: e.target.checked })}
  className="h-4 w-4"
/>
```

---

#### Column: Multi
**UI Label:** `Multi`
**Column Key:** `multipleItems`
**Database Field:** `allow_multiple_instances` (Boolean, default: false, NOT NULL)
**Display Value:** Checkbox
**Type:** Boolean checkbox

**Purpose:**
Allows multiple instances of this task to be created in a single project (e.g., multiple inspection tasks).

**Behavior:**
- **Editable** - User can check/uncheck
- Changes are **immediate** (no debounce)
- Independent flag

**Rules:**
- When checked: Multiple instances of this task can exist in project
- When unchecked: Only one instance allowed per project

**Affects:**
- Task instantiation logic
- Duplicate task creation
- Project task count

**Database Details:**
```ruby
t.boolean "allow_multiple_instances", default: false, null: false
```

**Implementation:**
```javascript
<input
  type="checkbox"
  checked={row.allow_multiple_instances || false}
  onChange={(e) => onUpdate({ allow_multiple_instances: e.target.checked })}
  className="h-4 w-4"
/>
```

---

### Status/Tracking Columns (Backend Only - Not in UI)

These fields exist in the database for project task instances but are NOT displayed in the template editor. They track actual project progress.

#### Field: Confirm
**Database Field:** `confirm` (Boolean, default: false, NOT NULL)
**Purpose:** Tracks whether task has been confirmed/acknowledged
**Audited:** Yes (creates audit log entry on change)

#### Field: Supplier Confirm
**Database Field:** `supplier_confirm` (Boolean, default: false, NOT NULL)
**Purpose:** Tracks whether supplier has confirmed the task
**Audited:** Yes (creates audit log entry on change)

#### Field: Start
**Database Field:** `start` (Boolean, default: false, NOT NULL)
**Purpose:** Tracks whether task has been started
**Audited:** Yes (creates audit log entry on change)

#### Field: Complete
**Database Field:** `complete` (Boolean, default: false, NOT NULL)
**Purpose:** Tracks whether task has been completed
**Audited:** Yes (creates audit log entry on change)

#### Field: Dependencies Broken
**Database Field:** `dependencies_broken` (Boolean, default: false, NOT NULL)
**Related Field:** `broken_predecessor_ids` (JSONB Array, default: [])
**Purpose:** Tracks when task dependencies are broken (predecessor skipped/completed out of order)

#### Field: Manually Positioned
**Database Field:** `manually_positioned` (Boolean, default: false, NOT NULL)
**Purpose:** When true, task `start_date` is manually set (not auto-calculated from predecessors)
**Set When:** User drags task in Gantt chart to new date

**Backend Audit Tracking:**
```ruby
after_update :create_audit_logs

def create_audit_logs
  audit_fields = %w[confirm supplier_confirm start complete]

  audit_fields.each do |field|
    if saved_change_to_attribute?(field)
      old_value, new_value = saved_change_to_attribute(field)
      user_id = Thread.current[:current_audit_user_id] || 1

      audits.create!(
        user_id: user_id,
        field_name: field,
        old_value: old_value,
        new_value: new_value,
        changed_at: Time.current
      )
    end
  end
end
```

---

### Relationship Fields (Backend - Not Direct Columns)

#### Field: Linked Template
**Database Field:** `linked_template_id` (Integer, Foreign Key)
**Purpose:** Links this task to another schedule template (for template chaining/nesting)
**Type:** References another ScheduleTemplate

```ruby
belongs_to :linked_template, class_name: 'ScheduleTemplate', optional: true

def linked_template_name
  linked_template&.name
end
```

#### Field: Auto Complete Predecessors
**Database Field:** `auto_complete_predecessors` (Boolean, default: false, NOT NULL)
**Purpose:** When true, automatically completes all predecessor tasks when this task completes
**Use Case:** Milestone tasks that trigger cascade completion

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
  onUpdateTask={async (taskId, updates) => {
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

### Performance Targets
| Operation | Target | Current |
|-----------|--------|---------|
| Task drag | < 20ms | ✅ 10-20ms |
| localStorage write | < 10ms | ✅ ~5ms (debounced) |
| Render 100+ tasks | < 100ms | ✅ 50-100ms |
| No visual flashing | 0 | ✅ 0 |

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
- **#** - Sequence number (original order) - NOT SORTABLE
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
  supplier_id?: number            // Foreign key to suppliers
  supplier_name?: string          // Loaded via join
  assigned_role?: string          // Internal role (admin, sales, etc.)
  predecessor_ids: Array<{
    id: number                    // Task number (1-based)
    type: 'FS' | 'SS' | 'FF' | 'SF'
    lag: number                   // Days offset
  }>
  predecessor_display?: string    // Formatted: "2FS+3, 5SS"
  manually_positioned?: boolean   // Locked position
  po_required?: boolean
  create_po_on_job_start?: boolean
  price_book_item_ids?: number[]
  critical_po?: boolean
  tags?: string[]
  require_photo?: boolean
  require_certificate?: boolean
  cert_lag_days?: number
  require_supervisor_check?: boolean
  supervisor_checklist_template_ids?: number[]
  auto_complete_task_ids?: any[]
  subtask_template_ids?: any[]
  linked_task_ids?: any[]
  manual_task?: boolean
  allow_multiple_instances?: boolean
  order_required?: boolean
  call_up_required?: boolean
  plan_required?: boolean
  documentation_category_ids?: number[]
  // Status fields (backend only, not in template editor)
  confirm?: boolean
  supplier_confirm?: boolean
  start?: boolean
  complete?: boolean
  dependencies_broken?: boolean
  broken_predecessor_ids?: any[]
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
Response → Update local state
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
    // Optimistic update
    setRows(prev => prev.map(r =>
      r.id === taskId ? { ...r, ...updates } : r
    ))

    // API call
    const response = await api.patch(
      `/api/v1/schedule_template_rows/${taskId}`,
      { schedule_template_row: updates }
    )

    // Sync with server response
    if (!options?.skipReload) {
      setRows(prev => prev.map(r =>
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
- [ ] Add confirmation dialogs for destructive actions
- [ ] Prevent deleting default templates
- [ ] Test with 100+ tasks for performance
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

**Version 1.0.3 - November 14, 2025 at 12:27 PM:**
- **CRITICAL FIX:** Corrected Protected Pattern 1b - Removed `isLoadingData.current` reset from end of drag handler
- Fixed render loop returning after second drag (10+ spurious drag events)
- Root cause: Resetting `isLoadingData.current = false` at line 1871 interfered with ongoing `gantt.parse()` operations
- When `gantt.parse()` fires spurious drag events, those events reached line 1871 and reset the flag
- This allowed subsequent spurious events to bypass the protection at line 1269
- Solution: Only reset `isDragging.current` at end of handler; `isLoadingData.current` managed by useEffect's 500ms timeout
- Only reset `isLoadingData.current` in early-exit code paths (conflict, cancel, cascade modal) to allow immediate next operation
- **Location:** DHtmlxGanttView.jsx line 1871 (removed `isLoadingData.current = false`)

**Version 1.0.2 - November 14, 2025 at 12:20 PM:**
- **CRITICAL FIX:** Added Protected Pattern 1b - isDragging Flag Management
- Fixed blank screen after dragging tasks
- Root cause: `isDragging.current` flag never reset in some code paths (conflict, cascade modal, early returns)
- When flag stays `true`, useEffect skips all future data reloads → blank screen
- Solution: Added `isDragging.current = false` in all early return cases + final safety net at handler end
- **Locations:** DHtmlxGanttView.jsx lines 1346, 1638, 1860

**Version 1.0.1 - November 14, 2025 at 11:53 AM:**
- **CRITICAL FIX:** Added Protected Pattern 1a - Render Loop Prevention
- Fixed severe UI glitching/flickering when dragging tasks in Gantt
- Root cause: `gantt.parse()` triggers spurious `onAfterTaskDrag` events causing render loops
- Solution: Added `isDragging.current` and `isLoadingData.current` checks in useEffect
- Increased `isLoadingData` timeout from 50ms to 500ms to allow state updates to settle
- Documented the fix as a Protected Pattern to prevent future "optimization" attempts
- **Location:** DHtmlxGanttView.jsx lines 3143-3168, 3398-3404

**Version 1.0.0 - November 14, 2025 at 11:07 AM:**
- **Added version control** (semantic versioning: MAJOR.MINOR.PATCH)
- **Created sync script** (`scripts/sync-gantt-rules.sh`) for foolproof file syncing
- **Added file location tracking** in document header
- **Updated sync process rules** with mandatory steps for CC to follow
- Added comprehensive column definitions section
- Documented all 25+ columns with database fields, behavior, rules
- Added dynamic documentation category columns
- Documented backend-only status fields
- Added detailed data structures and validation rules
- Expanded implementation examples
- Clarified relationship between UI columns and database fields
- Added rules for answering questions and removing prompts (prevents file bloat)
- Added rules for ensuring Gantt Rules UI buttons work correctly

**This document should be updated whenever:**
- Architectural decisions change
- Implementation patterns change
- New Protected Code Patterns are identified
- Performance requirements change
- Bug fixes require rule updates
- Database schema changes affecting columns

**Update Process:**
1. CC updates relevant sections when making code changes
2. User validates changes with Claude.ai
3. Validated version becomes new Bible
4. All future sessions follow updated rules