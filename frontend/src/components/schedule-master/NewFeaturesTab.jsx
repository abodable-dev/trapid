import { useState, useMemo, useRef, useEffect } from 'react'
import { DocumentArrowDownIcon, MagnifyingGlassIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function NewFeaturesTab() {
  // Load initial state from localStorage
  const loadFromLocalStorage = (key, defaultValue) => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  // Load state with localStorage persistence
  const [ccUpdates, setCcUpdates] = useState(() => loadFromLocalStorage('scheduleMaster_ccUpdates', {
    select: `**Status:** Fully functional ✅

**How It Works:**
The select checkbox allows users to select one or more rows in the Schedule Master table for bulk operations like deletion or batch updates.

**Implementation Details:**

*Frontend (UI):*
- Located in: frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx
- Column number: -1 (first column, before sequence)
- Renders as checkbox input in table header and each row
- Width: 40px, center-aligned
- Managed by React state for selected row tracking

*User Workflow:*
1. Click checkbox in header to select/deselect all rows
2. Click individual row checkboxes to select specific rows
3. Selected rows can be deleted via bulk delete button
4. Selected rows can have bulk operations applied (e.g., Enable/Disable Auto PO)

**Current Functionality:**
- Individual row selection ✅
- Select all/deselect all ✅
- Visual indication of selected rows ✅
- Bulk delete operation ✅
- Bulk field updates ✅`,
    sequence: `**Status:** Fully functional ✅

**How It Works:**
The sequence number is an auto-generated, read-only field that represents the task's position in the schedule template. It serves as both a visual reference and a critical internal identifier for dependency tracking.

**Implementation Details:**

*Frontend (UI):*
- Located in: frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx:786
- Rendered as read-only text in first data column (column #0)
- Display format: Simple numeric index (1, 2, 3, ...)
- Width: 40px, center-aligned
- Not directly editable by users (changes through drag/drop or insert/delete operations)

*Backend (Model):*
- Table: schedule_template_rows
- Column: sequence_order (integer, required, >= 0)
- Validation: backend/app/models/schedule_template_row.rb:15
  - Presence: true
  - Numericality: only_integer: true, greater_than_or_equal_to: 0
- Scope for ordering: \`.in_sequence\` -> order(sequence_order: :asc) (line 27)

*How It's Generated:*
When a new task is added:
1. Frontend: Sets sequence_order to current rows.length (ScheduleTemplateEditor.jsx:786)
2. This creates a 0-based index (0, 1, 2, 3, ...)
3. Display adds +1 to show users 1-based numbers (1, 2, 3, 4, ...)

*Dependency System Integration:*
**CRITICAL**: The sequence number is used for task dependencies, but there's an important conversion:
- **Storage**: sequence_order is 0-based (0, 1, 2, 3, ...)
- **Dependencies**: predecessor_ids reference 1-based IDs (1, 2, 3, 4, ...)

Example from ScheduleCascadeService.rb:96:
\`\`\`ruby
# Convert 0-based sequence_order to 1-based predecessor ID
predecessor_id = predecessor_task.sequence_order + 1
\`\`\`

This conversion happens in multiple places:
- Finding dependents: ScheduleCascadeService.rb:96-101
- Calculating start dates: ScheduleCascadeService.rb:108-111
- Formatting predecessors: ScheduleTemplateRow.rb:99-116

*When Sequence Changes:*
Sequence numbers automatically update when:
1. **Drag and Drop**: User drags task to new position in table
2. **Insert Row**: New task inserted, all subsequent tasks renumber
3. **Delete Row**: Task deleted, all subsequent tasks renumber
4. **Bulk Operations**: Multiple tasks deleted, remaining tasks renumber
5. **Import from Excel**: Tasks imported with sequential numbering

*Cascade Impact:*
When sequence_order changes, the cascade service:
- Does NOT automatically trigger (sequence changes don't cascade)
- DOES affect dependency lookups (references change)
- Users must manually verify dependencies remain correct after reordering

**Database Schema:**
\`\`\`ruby
t.integer "sequence_order", null: false
\`\`\`

**User Workflow:**
1. User creates tasks in Schedule Master
2. System auto-assigns sequence_order = 0, 1, 2, ... based on insertion order
3. UI displays as #1, #2, #3, ... for user-friendly viewing
4. User can reorder tasks via drag-drop (sequence_order updates automatically)
5. When setting up dependencies, user references tasks by their displayed number (#2, #5, etc.)
6. Backend converts displayed number (1-based) to sequence_order (0-based) for lookups

**Dependencies:**
- Used by: Predecessor dependency system (schedule_template_rows.predecessor_ids)
- Used by: ScheduleCascadeService for finding dependent tasks
- Used by: Template instantiation service (TemplateInstantiator.rb)
- Referenced in: Task sorting and display throughout the application

**Current Limitations:**
- No built-in "resequence" utility if order gets corrupted
- Changing task order may break existing dependency references
- No validation that predecessor IDs point to valid sequence numbers
- Excel import doesn't validate sequence continuity

**Enhancement Opportunities:**
1. Add validation: Ensure all predecessor_ids reference valid sequence numbers
2. Auto-fix dependencies when tasks are reordered
3. Add "Resequence All Tasks" utility to reset to 0, 1, 2, 3, ... based on current order
4. Implement dependency visualization showing sequence flow
5. Add warning when reordering tasks with dependencies: "This task has X dependents. Reordering may affect schedule."
6. Consider using database IDs instead of sequence_order for dependencies (more stable)

**Technical Notes:**
- The 0-based vs 1-based conversion is a common source of off-by-one errors
- Always verify which format (0-based or 1-based) is expected when working with sequences
- The model uses \`sequence_order\` while dependencies use logical sequence numbers (order + 1)`,
    taskName: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.name (string, NOT NULL)
**Frontend:** Text input field in ScheduleTemplateEditor
**Validation:** Presence required

User enters task name that will appear in schedule. This is the primary identifier for each task.`,
    supplierGroup: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.supplier_id (foreign key) + assigned_user_id
**Frontend:** Conditional dropdown - shows suppliers if PO required, or role selection (Admin/Sales/Site/Supervisor/Builder/Estimator) for internal work
**Model:** belongs_to :supplier (optional)

Used for task assignment and smart PO generation.`,
    predecessors: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.predecessor_ids (JSONB array)
**Frontend:** Modal editor (PredecessorEditor) with FS/SS/FF/SF dependency types and lag days
**Model:** Helper methods for display formatting
**Format:** [{id: 2, type: "FS", lag: 3}, ...]

Core dependency management for schedule cascade calculations. Supports all four dependency types: Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish.`,
    duration: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.duration (integer, default 0)
**Frontend:** Numeric input field

Specifies number of days task will take to complete. Used in schedule cascade calculations to determine task end dates.`,
    startDate: `**Status:** Fully functional ✅

**How It Works:**
The start date is a calculated, read-only field that shows when a task is scheduled to begin. It's automatically computed based on the task's predecessor dependencies, their durations, lag times, and working day rules.

**Implementation Details:**

*Frontend (UI):*
- Located in: frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx:93
- Column configuration: \`startDate: { visible: true, width: 110, label: 'Start Date', order: 5 }\`
- Display format: Shows as integer representing days offset from project start
- Read-only: Cannot be manually edited in the template view
- Updates automatically when dependencies change

*Backend (Model):*
- Table: schedule_template_rows
- Column: start_date (integer, represents day offset)
- Migration: backend/db/migrate/20251112013012_add_start_date_to_schedule_template_rows.rb
- No validations (can be null for templates without dependencies)

*Calculation Logic:*
The start_date is calculated by the **ScheduleCascadeService** whenever:
1. A task's own start_date changes
2. A task's duration changes
3. A predecessor task's start_date or duration changes

Cascade Service: backend/app/services/schedule_cascade_service.rb

Key calculation method: \`calculate_start_date\` (lines 105-151)

**Dependency Type Calculations:**
Different dependency types calculate start dates differently:

1. **FS (Finish-to-Start)** - Most common:
   - Task starts when predecessor finishes
   - Formula: \`predecessor_end + lag\`
   - Example: If "Foundation" ends day 5, "Framing" starts day 5 (or day 8 if lag = +3)

2. **SS (Start-to-Start)**:
   - Task starts when predecessor starts
   - Formula: \`predecessor_start + lag\`
   - Example: "Plumbing rough-in" starts same day as "Electrical rough-in"

3. **FF (Finish-to-Finish)**:
   - Task finishes when predecessor finishes
   - Formula: \`predecessor_end + lag - task_duration\`
   - Example: "Cleanup" finishes when "Final inspection" finishes

4. **SF (Start-to-Finish)** - Rare:
   - Task finishes when predecessor starts
   - Formula: \`predecessor_start + lag - task_duration\`

Code reference (ScheduleCascadeService.rb:126-142):
\`\`\`ruby
calculated_start = case dep_type
when 'FS'
  predecessor_end + lag
when 'SS'
  predecessor_start + lag
when 'FF'
  dependent_end = predecessor_end + lag
  dependent_end - (dependent_task.duration || 1)
when 'SF'
  dependent_end = predecessor_start + lag
  dependent_end - (dependent_task.duration || 1)
else
  predecessor_end + lag  # Default to FS
end
\`\`\`

**Working Day Rules:**
After calculating the raw start date, the system applies working day rules:
- **Configurable via Company Settings** (working_days hash)
- Method: \`skip_to_next_working_day\` (lines 162-173) and \`working_day?\` (lines 175-192)
- Default: Monday-Friday + Sunday (Saturday excluded)
- Exception: Tasks with lock status (confirmed, started, completed) keep their dates

Lock hierarchy (highest to lowest priority):
1. supplier_confirm
2. confirm
3. start
4. complete
5. manually_positioned

**Cascade Behavior:**
When a task's start_date changes, the system:
1. Finds all dependent tasks (tasks with this task as a predecessor)
2. Recalculates their start dates
3. Recursively cascades to their dependents
4. Skips manually positioned tasks (user override)
5. Returns list of all affected tasks

Callback trigger (ScheduleTemplateRow.rb:190-206):
\`\`\`ruby
after_update :cascade_to_dependents

def cascade_to_dependents
  return unless saved_change_to_start_date? || saved_change_to_duration?

  affected_tasks = ScheduleCascadeService.cascade_changes(self, changed_attrs)
  Thread.current[:cascade_affected_tasks] = affected_tasks
end
\`\`\`

**Day Offset System:**
- Templates use day offsets (0, 1, 2, 3, ...) not actual dates
- Day 0 = Project start date
- Day 5 = 5 days after project start
- When template is instantiated for a job:
  - Project start date is set (e.g., 2025-01-15)
  - Day 0 becomes 2025-01-15
  - Day 5 becomes 2025-01-20
  - Service: backend/app/services/schedule/template_instantiator.rb:152-167

**Database Schema:**
\`\`\`ruby
t.integer "start_date"  # Day offset from project start
\`\`\`

**User Workflow:**
1. User creates task in Schedule Master
2. User sets predecessors and durations for dependencies
3. System automatically calculates start_date via cascade service
4. User sees updated start date in table (read-only)
5. If user changes a predecessor's start or duration, cascade triggers
6. All dependent tasks update automatically
7. User reviews the calculated schedule timeline

**Dependencies:**
- Requires: Predecessor tasks with valid start_dates
- Requires: Task duration values
- Uses: ScheduleCascadeService for all calculations
- Uses: CompanySetting for timezone and working day rules
- Uses: PublicHoliday table for holiday exclusions

**Current Limitations:**
- No manual override of start_date in template (always calculated)
- No visualization of critical path or schedule conflicts
- Large templates with many dependencies can have slow cascade performance
- No "freeze schedule" option to prevent cascade updates

**Enhancement Opportunities:**
1. Add manual positioning flag to override cascade for specific tasks
2. Implement critical path calculation and visualization
3. Add schedule conflict detection (overlapping tasks for same resource)
4. Optimize cascade performance with smarter dependency graph traversal
5. Add "what-if" scenario planning (test schedule changes without saving)
6. Implement resource leveling (automatic task shifting to balance workload)
7. Add Gantt chart visualization directly in Schedule Master`,
    poRequired: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.po_required (boolean, default false)
**Frontend:** Checkbox
**Model:** Triggers validation that supplier_id must be present if create_po_on_job_start is true

Tracks whether a purchase order is needed for this task. Enables Auto PO checkbox when checked.`,
    autoPo: `**Status:** Fully functional ✅

**How It Works:**
When this checkbox is enabled, the system automatically creates a Purchase Order (PO) when a job is instantiated from the schedule template.

**Implementation Details:**

*Frontend (UI):*
- Located in: frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx:2528-2535
- Rendered as a checkbox input (create_po_on_job_start field)
- Disabled unless BOTH "PO Required" is checked AND a supplier is selected
- Validation: Shows alert if user tries to enable without selecting a supplier first
- Auto-unchecks when "PO Required" is unchecked (lines 2382-2383)
- Bulk operations available: Enable/Disable Auto PO for multiple selected rows (lines 1970-1979)

*Backend (Processing):*
- Service: backend/app/services/schedule/template_instantiator.rb
- Method: create_auto_purchase_orders (lines 200-211)
- Triggers during job instantiation (line 31 in call method)
- Selection criteria: row.create_po_on_job_start AND row.po_required AND row.supplier.present?
- Creates PO with:
  - Status: 'draft'
  - Required on site date: Set to task's planned_start_date
  - Critical flag: Inherited from row.critical_po
  - Notes: "Auto-generated for task: [task name]"
  - Line items: Auto-populated from linked price book items (if any)
  - Links PO back to the task

*Database:*
- Table: schedule_template_rows
- Column: create_po_on_job_start (boolean)
- Default: false

**User Workflow:**
1. User creates a task in Schedule Template Editor
2. User checks "PO Required" checkbox
3. User selects a Supplier from dropdown
4. User checks "Auto PO" checkbox
5. (Optional) User links Price Book items which will become PO line items
6. When a new job is created from this template, PO is automatically generated in draft status
7. PO appears in Purchase Orders list, ready for review and sending to supplier

**Dependencies:**
- Requires: PO Required checkbox enabled
- Requires: Supplier selected (from Contacts with type=Supplier)
- Optional: Price Book items linked (become PO line items automatically)
- Optional: Critical PO flag (affects PO display with red badge)

**Current Limitations:**
- POs are created in 'draft' status, not automatically sent
- Quantity for price book items defaults to 1
- No automated ordering based on orderRequired/callUpRequired lead times
- No validation of supplier capabilities or pricing before PO creation

**Enhancement Opportunities:**
1. Add option to auto-send PO to supplier email when job starts
2. Calculate quantities based on job specifications or estimate data
3. Implement lead time alerts (orderRequired/callUpRequired fields are tracked but not used)
4. Add PO approval workflow for critical or high-value POs
5. Integration with supplier quoting system for best pricing`,
    priceItems: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.price_book_item_ids (JSONB array)
**Frontend:** Modal (PriceBookItemsModal) showing count
**Model:** Helper method price_book_items() fetches PricebookItem records

Links price book items to task. These items automatically become line items in auto-generated POs.`,
    critical: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.critical_po (boolean, default false)
**Frontend:** Checkbox

Marks PO as critical priority. Critical POs are highlighted with red badge and require immediate attention.`,
    tags: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.tags (JSONB array)
**Frontend:** Text input with comma-separated parsing
**Model:** Helper method tag_list() returns array

Categorize and filter tasks by trade (e.g., 'electrical', 'foundation', 'inspection').`,
    photo: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.require_photo (boolean, default false)
**Frontend:** Checkbox
**Model:** Callback sync_photos_category manages documentation categories

Automatically spawns photo task when this task is completed. Used for tasks requiring photo documentation.`,
    cert: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.require_certificate (boolean, default false)
**Frontend:** Checkbox

Automatically spawns certificate task when this task is completed. Used for regulatory certifications and compliance documents.`,
    certLag: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.cert_lag_days (integer, default 10, range 0-999)
**Frontend:** Numeric input (disabled if require_certificate is false)
**Validation:** Numericality validated

Days after task completion when certificate is due.`,
    supCheck: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.require_supervisor_check (boolean) + supervisor_checklist_template_ids (JSONB array)
**Frontend:** Checkbox with modal (SupervisorChecklistModal) for checklist items
**Model:** Scope supervisor_checks

Requires supervisor site visit to verify quality. Links to supervisor checklist templates.`,
    autoComplete: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.auto_complete_predecessors (boolean) + auto_complete_task_ids (JSONB array)
**Frontend:** Modal (AutoCompleteTasksModal) showing count of tasks

Select specific tasks to auto-mark complete when this task completes. Useful for milestone tasks.`,
    subtasks: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.has_subtasks (boolean) + subtask_count (integer) + subtask_names (JSONB array) + subtask_template_ids (JSONB array)
**Frontend:** Modal (SubtasksModal) showing count
**Validation:** subtask_names count must match subtask_count

Automatically creates subtasks when this task starts. Breaks complex tasks into smaller steps.`,
    linkedTasks: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.linked_task_ids (text/JSON, serialized)
**Frontend:** Modal (LinkedTasksModal) showing count
**Model:** serialize :linked_task_ids, coder: JSON

Links task to other tasks for grouping and cross-template dependencies.`,
    manualTask: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.manual_task (boolean, default false)
**Frontend:** Checkbox

Manual task - never automatically loaded or activated in schedule. Must be manually created.`,
    multipleItems: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.allow_multiple_instances (boolean, default false)
**Frontend:** Checkbox

When completed, prompts user if they need another instance (e.g., 'Frame Inspection', 'Frame Inspection 2').`,
    orderRequired: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.order_required (boolean, default false)
**Frontend:** Checkbox

Order time required from pricebook items. Tracks order placement timeline requirements.`,
    callUpRequired: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.call_up_required (boolean, default false)
**Frontend:** Checkbox

Call up time required from pricebook items. Tracks call-up/booking timeline requirements.`,
    planType: `**Status:** Fully functional ✅

**Database:** schedule_template_rows.plan_required (boolean, default false)
**Frontend:** Checkbox

Task for documents activated only if plan tab is selected (PERSPECTIVE, SITE PLAN, ELEVATIONS, etc.).`,
    actions: `**Status:** Fully functional ✅

**Frontend:** Delete, Move Up, Move Down buttons
**Operations:** Row management actions

Provides inline action buttons for deleting, duplicating, and reordering template rows.`
  }))
  const [columnComplete, setColumnComplete] = useState(() => loadFromLocalStorage('scheduleMaster_columnComplete', {}))
  const [mdInstructions, setMdInstructions] = useState(() => loadFromLocalStorage('scheduleMaster_mdInstructions', {}))
  const [searchQuery, setSearchQuery] = useState('')
  const [editingMd, setEditingMd] = useState(null) // Which column's MD is being edited
  const [editingCcUpdate, setEditingCcUpdate] = useState(null) // Which column's CC Update is being edited
  const mdTextareaRef = useRef(null)
  const ccUpdateTextareaRef = useRef(null)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem('scheduleMaster_ccUpdates', JSON.stringify(ccUpdates))
    } catch (error) {
      console.error('Error saving ccUpdates to localStorage:', error)
    }
  }, [ccUpdates])

  useEffect(() => {
    try {
      window.localStorage.setItem('scheduleMaster_columnComplete', JSON.stringify(columnComplete))
    } catch (error) {
      console.error('Error saving columnComplete to localStorage:', error)
    }
  }, [columnComplete])

  useEffect(() => {
    try {
      window.localStorage.setItem('scheduleMaster_mdInstructions', JSON.stringify(mdInstructions))
    } catch (error) {
      console.error('Error saving mdInstructions to localStorage:', error)
    }
  }, [mdInstructions])

  // Complete column documentation from Schedule Template Editor
  const columnData = [
    {
      columnNumber: -1,
      name: 'select',
      label: '',
      type: 'Checkbox',
      description: 'Row selection checkbox for bulk operations. Allows users to select multiple rows for deletion or batch updates.',
      currentlyUsed: 'Yes - Enables multi-select for bulk operations on template rows',
      width: 40,
      align: 'center'
    },
    {
      columnNumber: 0,
      name: 'sequence',
      label: '#',
      type: 'Read-only Text',
      description: 'Auto-generated task sequence number showing the position/order in the schedule template.',
      currentlyUsed: 'Yes - Displays task index for reference and ordering',
      width: 40,
      align: 'center'
    },
    {
      columnNumber: 1,
      name: 'taskName',
      label: 'Task Name',
      type: 'Text Input',
      description: 'The name of the task that will appear in the schedule. Be descriptive so builders know exactly what needs to be done.',
      currentlyUsed: 'Yes - Primary identifier for tasks in the schedule',
      width: 200,
      align: 'left'
    },
    {
      columnNumber: 2,
      name: 'supplierGroup',
      label: 'Supplier / Group',
      type: 'Dropdown/Select',
      description: 'For PO tasks: select a supplier. For internal work: assign to a team (Admin, Sales, Site, Supervisor, Builder, Estimator).',
      currentlyUsed: 'Yes - Used for task assignment, supplier linkage, and smart PO generation',
      width: 150,
      align: 'left'
    },
    {
      columnNumber: 3,
      name: 'predecessors',
      label: 'Predecessors',
      type: 'Custom Component (Predecessor Editor)',
      description: 'Tasks that must be completed before this one starts. Supports FS (Finish-to-Start), SS (Start-to-Start), FF (Finish-to-Finish), and SF (Start-to-Finish) dependencies with lag days.',
      currentlyUsed: 'Yes - Core dependency management for schedule cascade calculations',
      width: 100,
      align: 'left'
    },
    {
      columnNumber: 4,
      name: 'duration',
      label: 'Duration',
      type: 'Number Input',
      description: 'Number of days this task will take to complete.',
      currentlyUsed: 'Yes - Determines task length in schedule calculations',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 5,
      name: 'startDate',
      label: 'Start Date',
      type: 'Read-only Date',
      description: 'Calculated start date based on predecessors and durations. Tasks with no predecessors start on Day 0 (project start).',
      currentlyUsed: 'Yes - Computed field showing when task will begin',
      width: 110,
      align: 'center'
    },
    {
      columnNumber: 6,
      name: 'poRequired',
      label: 'PO Req',
      type: 'Checkbox',
      description: 'Check if this task requires a purchase order. This tracks whether a PO is needed, but doesn\'t automatically create one.',
      currentlyUsed: 'Yes - Boolean flag for PO requirement tracking',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 7,
      name: 'autoPo',
      label: 'Auto PO',
      type: 'Checkbox',
      description: 'Automatically create and send a purchase order to the supplier when the job starts. Requires a supplier to be selected.',
      currentlyUsed: 'Yes - Enables automatic PO generation on job start',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 8,
      name: 'priceItems',
      label: 'Price Items',
      type: 'Custom Component (Price Book Modal)',
      description: 'Link price book items to this task. These items will be included in the auto-generated purchase order.',
      currentlyUsed: 'Yes - Links to price book for PO line items',
      width: 120,
      align: 'left'
    },
    {
      columnNumber: 9,
      name: 'critical',
      label: 'Critical',
      type: 'Checkbox',
      description: 'Mark this PO as critical priority. Critical POs will be highlighted and require immediate attention.',
      currentlyUsed: 'Yes - Boolean flag for priority marking',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 10,
      name: 'tags',
      label: 'Tags',
      type: 'Multi-select/Tags Input',
      description: 'Add tags to categorize and filter tasks (e.g., \'electrical\', \'foundation\', \'inspection\'). Useful for filtering views by trade.',
      currentlyUsed: 'Yes - Array of tags for categorization and filtering',
      width: 100,
      align: 'left'
    },
    {
      columnNumber: 11,
      name: 'photo',
      label: 'Photo',
      type: 'Checkbox',
      description: 'Automatically spawn a photo task when this task is completed. Use for tasks that need photo documentation.',
      currentlyUsed: 'Yes - Boolean trigger for photo task creation',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 12,
      name: 'cert',
      label: 'Cert',
      type: 'Checkbox',
      description: 'Automatically spawn a certificate task when this task is completed. Used for regulatory certifications and compliance documents.',
      currentlyUsed: 'Yes - Boolean trigger for certificate task creation',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 13,
      name: 'certLag',
      label: 'Cert Lag',
      type: 'Number Input',
      description: 'Number of days after task completion when the certificate is due. Default is 10 days.',
      currentlyUsed: 'Yes - Integer value for cert due date offset',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 14,
      name: 'supCheck',
      label: 'Sup Check',
      type: 'Custom Component (Supervisor Checklist Modal)',
      description: 'Require a supervisor to check in on this task. Supervisor will get a prompt to visit the site and verify quality.',
      currentlyUsed: 'Yes - Links to supervisor checklist templates',
      width: 120,
      align: 'left'
    },
    {
      columnNumber: 15,
      name: 'autoComplete',
      label: 'Auto Complete',
      type: 'Custom Component (Auto Complete Modal)',
      description: 'Select specific tasks that should be automatically marked as complete when this task is completed. Useful for milestone tasks that signal the completion of multiple other tasks.',
      currentlyUsed: 'Yes - Links to predecessor tasks for auto-completion',
      width: 120,
      align: 'left'
    },
    {
      columnNumber: 16,
      name: 'subtasks',
      label: 'Subtasks',
      type: 'Custom Component (Subtasks Modal)',
      description: 'Automatically create subtasks when this task starts. Useful for breaking down complex tasks into smaller steps.',
      currentlyUsed: 'Yes - Links to subtask templates for auto-creation',
      width: 120,
      align: 'left'
    },
    {
      columnNumber: 17,
      name: 'linkedTasks',
      label: 'Linked Tasks',
      type: 'Custom Component (Linked Tasks Modal)',
      description: 'Link this task to other tasks in the schedule. Useful for grouping related tasks or creating task dependencies across templates.',
      currentlyUsed: 'Yes - Links tasks for grouping and cross-template dependencies',
      width: 120,
      align: 'left'
    },
    {
      columnNumber: 18,
      name: 'manualTask',
      label: 'Manual',
      type: 'Checkbox',
      description: 'Manual task - never gets automatically loaded or activated in the schedule. Must be manually created.',
      currentlyUsed: 'Yes - Boolean flag to exclude from automatic schedule generation',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 19,
      name: 'multipleItems',
      label: 'Multi',
      type: 'Checkbox',
      description: 'When this task is completed, user will be prompted if they need another instance (e.g., \'Frame Inspection\', \'Frame Inspection 2\', etc.).',
      currentlyUsed: 'Yes - Boolean trigger for multi-instance task prompts',
      width: 80,
      align: 'center'
    },
    {
      columnNumber: 20,
      name: 'orderRequired',
      label: 'Order Time',
      type: 'Number Input',
      description: 'Order time required from pricebook items. Tracks order placement timeline requirements.',
      currentlyUsed: 'Yes - Integer days for order lead time',
      width: 100,
      align: 'center'
    },
    {
      columnNumber: 21,
      name: 'callUpRequired',
      label: 'Call Up',
      type: 'Number Input',
      description: 'Call up time required from pricebook items. Tracks call-up/booking timeline requirements.',
      currentlyUsed: 'Yes - Integer days for call-up lead time',
      width: 100,
      align: 'center'
    },
    {
      columnNumber: 22,
      name: 'planType',
      label: 'Plan',
      type: 'Dropdown/Select',
      description: 'This task is for documents that only get activated if a plan tab is selected. Select the plan/drawing type.',
      currentlyUsed: 'Yes - Links to documentation plan types (PERSPECTIVE, SITE PLAN, ELEVATIONS, etc.)',
      width: 80,
      align: 'left'
    },
    {
      columnNumber: 100,
      name: 'actions',
      label: 'Actions',
      type: 'Action Buttons',
      description: 'Action buttons for row operations: Edit, Duplicate, Delete, Move Up/Down.',
      currentlyUsed: 'Yes - Contains inline action buttons for row management',
      width: 80,
      align: 'center'
    }
  ]

  const handleCcUpdateChange = (columnName, value) => {
    setCcUpdates({
      ...ccUpdates,
      [columnName]: value
    })
  }

  const handleColumnCompleteChange = (columnName, checked) => {
    setColumnComplete({
      ...columnComplete,
      [columnName]: checked
    })
  }

  const insertMarkdown = (prefix, suffix = '', isForCcUpdate = false) => {
    const textarea = isForCcUpdate ? ccUpdateTextareaRef.current : mdTextareaRef.current
    const editing = isForCcUpdate ? editingCcUpdate : editingMd
    if (!textarea || !editing) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = isForCcUpdate ? (ccUpdates[editing] || '') : (mdInstructions[editing] || '')
    const selectedText = text.substring(start, end)

    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end)

    if (isForCcUpdate) {
      setCcUpdates({ ...ccUpdates, [editing]: newText })
    } else {
      setMdInstructions({ ...mdInstructions, [editing]: newText })
    }

    // Set cursor position after the prefix
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + prefix.length + selectedText.length
    }, 0)
  }

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all CC Updates, MD Instructions, and Complete checkboxes? This cannot be undone.')) {
      setCcUpdates({})
      setMdInstructions({})
      setColumnComplete({})
      // Also clear from localStorage
      try {
        window.localStorage.removeItem('scheduleMaster_ccUpdates')
        window.localStorage.removeItem('scheduleMaster_mdInstructions')
        window.localStorage.removeItem('scheduleMaster_columnComplete')
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
    }
  }

  // Filter columns based on search query
  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) {
      return columnData
    }

    const query = searchQuery.toLowerCase()
    return columnData.filter(column => {
      return (
        column.name.toLowerCase().includes(query) ||
        column.label.toLowerCase().includes(query) ||
        column.description.toLowerCase().includes(query) ||
        column.currentlyUsed.toLowerCase().includes(query) ||
        column.columnNumber.toString().includes(query)
      )
    })
  }, [searchQuery])

  const handleExport = () => {
    let exportText = '# Schedule Master Column Documentation\n\n'
    exportText += 'This document provides comprehensive information about all columns in the Trapid Schedule Master Gantt view.\n\n'
    exportText += '## Purpose\n'
    exportText += 'Use this document with Claude (AI assistant) to help develop new features for specific columns.\n\n'
    exportText += '---\n\n'

    columnData.forEach((column) => {
      exportText += `## Column ${column.columnNumber}: ${column.label}\n\n`
      exportText += `**Internal Name:** \`${column.name}\`\n\n`
      exportText += `**Column Number:** ${column.columnNumber}\n\n`
      exportText += `**Type:** ${column.type || 'Not specified'}\n\n`
      exportText += `**Width:** ${column.width}px\n\n`
      exportText += `**Alignment:** ${column.align}\n\n`
      if (column.conditional) {
        exportText += `**Conditional Display:** ${column.conditional}\n\n`
      }
      exportText += `**Description:**\n${column.description}\n\n`
      exportText += `**Currently Used in Trapid:**\n${column.currentlyUsed}\n\n`
      exportText += `**Column Complete:** ${columnComplete[column.name] ? 'Yes ✓' : 'No'}\n\n`

      if (ccUpdates[column.name]) {
        exportText += `**CC Update Required:**\n${ccUpdates[column.name]}\n\n`
      }

      if (mdInstructions[column.name]) {
        exportText += `**Development Instructions:**\n${mdInstructions[column.name]}\n\n`
      }

      exportText += '---\n\n'
    })

    exportText += '## Additional Context\n\n'
    exportText += '### Key Features\n'
    exportText += '- **Drag & Drop:** Tasks can be dragged to change dates, resized to change duration\n'
    exportText += '- **Link Creation:** Drag from task to task to create predecessor relationships\n'
    exportText += '- **Cascade Calculation:** Backend service recalculates all dependent task dates when a task changes\n'
    exportText += '- **Lock Position:** Prevents cascade from moving specific tasks (milestones)\n'
    exportText += '- **Public Holidays:** Automatically excluded from duration calculations\n'
    exportText += '- **Work Time:** Weekends (Saturday/Sunday) are non-working days\n\n'
    exportText += '### Gantt Configuration\n'
    exportText += '- **Auto-scheduling:** Disabled (backend cascade service handles all dependency updates)\n'
    exportText += '- **Duration Unit:** Days (working days only)\n'
    exportText += '- **Undo/Redo:** Enabled (PRO feature)\n'
    exportText += '- **Tooltip:** Enabled with 1 second delay\n\n'
    exportText += '### Integration Points\n'
    exportText += '- **Suppliers:** Linked to Contact records for smart PO generation\n'
    exportText += '- **Templates:** Tasks can be created from schedule templates\n'
    exportText += '- **Job Schedule:** Each job has its own schedule instance\n'
    exportText += '- **Bug Hunter:** Automated testing framework for schedule behavior\n\n'

    // Create download
    const blob = new Blob([exportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schedule-master-columns-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Schedule Master Column Documentation</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Complete reference for all columns in the Schedule Master Gantt view. Use this to document new feature requirements for Claude AI.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              Export to Text File
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
            placeholder="Search columns by name, label, description, or usage..."
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Clear search</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredColumns.length} of {columnData.length} columns
          </p>
        )}
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col">
        <div
          className="flex-1"
          style={{
            overflowX: 'scroll',
            overflowY: 'scroll',
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6" style={{ width: '50px' }}>
                      Col #
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: '120px' }}>
                      Column Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: '100px' }}>
                      Label
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: '140px' }}>
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: '200px' }}>
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: '200px' }}>
                      CC Update
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white" style={{ width: '80px' }}>
                      Complete
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white" style={{ width: '400px' }}>
                      MD
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {filteredColumns.map((column) => (
                    <tr key={column.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        {column.columnNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <code className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-mono">
                          {column.name}
                        </code>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {column.label || '(empty)'}
                        {column.conditional && (
                          <span className="ml-2 inline-flex items-centers rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                            Conditional
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {column.type || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                        {column.description}
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <button
                          onClick={() => setEditingCcUpdate(column.name)}
                          className="w-full text-left px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[60px] flex items-center overflow-hidden"
                        >
                          <span className={`text-sm line-clamp-2 ${ccUpdates[column.name] ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                            {ccUpdates[column.name] || 'Not coded yet'}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-4 text-sm text-center">
                        <input
                          type="checkbox"
                          checked={columnComplete[column.name] || false}
                          onChange={(e) => handleColumnCompleteChange(column.name, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <button
                          onClick={() => setEditingMd(column.name)}
                          className="w-full text-left px-3 py-2 rounded-md border border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors min-h-[60px] flex items-center relative overflow-hidden"
                        >
                          <span className={`text-sm line-clamp-2 ${mdInstructions[column.name] ? 'text-gray-900 dark:text-white pr-8' : 'text-gray-400 dark:text-gray-500'}`}>
                            {mdInstructions[column.name] || 'Click to add instructions...'}
                          </span>
                          {mdInstructions[column.name] && (
                            <PencilSquareIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 absolute top-2 right-2" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CC Update Modal (Read-only) */}
      {editingCcUpdate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={() => setEditingCcUpdate(null)}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-[90vw] sm:max-w-[90vw] sm:h-[90vh] sm:max-h-[90vh] sm:p-6 flex flex-col">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCcUpdate(null)}
                  className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="w-full mb-4">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                    CC Update Status: {columnData.find(c => c.name === editingCcUpdate)?.label || editingCcUpdate}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Read-only view of current implementation status
                  </p>
                </div>

                <div className="flex-1 overflow-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                    {ccUpdates[editingCcUpdate] ? (
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 dark:text-white">
                        {ccUpdates[editingCcUpdate]}
                      </pre>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 dark:text-gray-500 italic text-lg">Not coded yet</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">This column has no implementation code at this time</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingCcUpdate(null)}
                    className="inline-flex justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MD Instructions Modal */}
      {editingMd && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={() => setEditingMd(null)}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-[90vw] sm:max-w-[90vw] sm:h-[90vh] sm:max-h-[90vh] sm:p-6 flex flex-col">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMd(null)}
                  className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                    Development Instructions: {columnData.find(c => c.name === editingMd)?.label || editingMd}
                  </h3>

                  {/* Formatting Toolbar */}
                  <div className="mb-2 flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => insertMarkdown('**', '**')}
                      className="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Bold"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      onClick={() => insertMarkdown('*', '*')}
                      className="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Italic"
                    >
                      <em>I</em>
                    </button>
                    <button
                      onClick={() => insertMarkdown('`', '`')}
                      className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Code"
                    >
                      {'<>'}
                    </button>
                    <button
                      onClick={() => insertMarkdown('## ')}
                      className="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Heading"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => insertMarkdown('### ')}
                      className="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Heading"
                    >
                      H3
                    </button>
                    <button
                      onClick={() => insertMarkdown('- ')}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      onClick={() => insertMarkdown('1. ')}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Numbered List"
                    >
                      1. List
                    </button>
                    <button
                      onClick={() => insertMarkdown('[', '](url)')}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Link"
                    >
                      Link
                    </button>
                    <button
                      onClick={() => insertMarkdown('> ')}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Quote"
                    >
                      Quote
                    </button>
                  </div>
                </div>

                <div className="flex-1 mt-2 overflow-hidden">
                  <textarea
                    ref={mdTextareaRef}
                    value={mdInstructions[editingMd] || ''}
                    onChange={(e) => setMdInstructions({ ...mdInstructions, [editingMd]: e.target.value })}
                    placeholder="Add detailed development instructions in markdown format...&#10;&#10;Example:&#10;## Requirements&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Technical Notes&#10;- Implementation detail 1&#10;- Implementation detail 2"
                    className="block w-full h-full rounded-md border-0 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 font-mono resize-none"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingMd(null)}
                    className="inline-flex justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMd(null)}
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
