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

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2406-2416
- Rendering: Checkbox input in first column (order: -1), 40px width, center-aligned
- Event handlers:
  - Row checkbox: \`onSelectRow(row.id)\` toggles individual row selection
  - Header checkbox: \`handleSelectAll()\` toggles all filtered rows (lines 1115-1121)
  - State managed in \`selectedRows\` Set

**Backend:**
- Field: N/A (frontend-only state management)
- Type: Client-side Set of row IDs

**How It Works:**
The select column enables multi-row selection for bulk operations. When rows are selected, a bulk operations toolbar appears (lines 1950-1991) offering options like "Set PO Required", "Enable Auto PO", and "Delete Selected". The select-all checkbox in the header selects/deselects all currently filtered rows.

**Current Limitations:**
- Selection state is lost when filters change
- No "select range" (shift-click) functionality
- Selection state not persisted across page reloads`,
    sequence: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2418-2423
- Rendering: Read-only text display showing \`index + 1\`, 40px width, center-aligned
- Event handlers: None (read-only display)

**Backend:**
- Field: schedule_template_rows.sequence_order
- Type: integer (NOT NULL, >= 0)
- Validation: Presence required, numericality validated (model line 15)

**How It Works:**
Auto-generated task sequence number representing position in the template. Stored as 0-based index in database (\`sequence_order\`) but displayed as 1-based number to users. Critical for predecessor dependencies which reference tasks by their sequence number. Updated automatically when rows are reordered via drag-drop or move up/down actions (lines 1046-1081).

**CRITICAL - Dependency System Integration:**
The sequence number is used for task dependencies with an important conversion:
- **Storage**: sequence_order is 0-based (0, 1, 2, 3, ...)
- **Dependencies**: predecessor_ids reference 1-based IDs (1, 2, 3, 4, ...)
- **Conversion** happens in ScheduleCascadeService.rb:96 and ScheduleTemplateRow.rb:99-116

**When Sequence Changes:**
- **Drag and Drop**: User drags task to new position
- **Insert/Delete Row**: All subsequent tasks renumber
- **Cascade Impact**: Does NOT auto-trigger, but affects dependency lookups

**Current Limitations:**
- Reordering tasks requires manual verification that dependencies remain valid
- No automatic dependency renumbering when tasks are moved
- No built-in "resequence" utility if order gets corrupted
- Frontend displays index+1, backend uses sequence_order field (potential confusion)`,
    taskName: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2425-2436
- Rendering: Text input field, 200px width, debounced updates (500ms delay)
- Event handlers: \`handleTextChange('name', value)\` for input changes (lines 2352-2375), auto-select on focus

**Backend:**
- Field: schedule_template_rows.name
- Type: string (NOT NULL)
- Validation: Presence required (model line 14)

**How It Works:**
Primary identifier for each task. User types task name which appears in schedule displays and Gantt charts. Implements debounced updates to avoid excessive API calls while typing. Local state (\`localName\`) tracks user input, syncs to server after delay.

**Current Limitations:**
- No duplicate name detection or warning
- No character limit enforced in UI
- No autocomplete or task name suggestions
- Special characters not validated`,
    supplierGroup: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2438-2465
- Rendering: Conditional dropdown - suppliers (if PO required) OR user roles (Admin/Sales/Site/Supervisor/Builder/Estimator)
- Event handlers: handleSupplierChange (lines 2377-2394), auto-clears if PO Required unchecked

**Backend:**
- Field: schedule_template_rows.supplier_id (foreign key) OR assigned_user_id
- Type: integer (nullable)
- Validation: Optional belongs_to :supplier

**How It Works:**
Assignment toggle based on task type - external suppliers for PO tasks, internal roles for company work. Enables smart PO generation and task routing.

**Current Limitations:**
- Cannot assign both supplier AND internal role simultaneously
- No supplier capabilities/trade filtering
- Role selection limited to predefined list`,
    predecessors: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2467-2478
- Rendering: Button showing count, opens PredecessorEditor modal
- Event handlers: Modal for adding/editing dependencies with type (FS/SS/FF/SF) and lag days

**Backend:**
- Field: schedule_template_rows.predecessor_ids
- Type: jsonb array
- Validation: Format [{id: 2, type: "FS", lag: 3}, ...]

**How It Works:**
Defines task dependencies using 4 relationship types - Finish-to-Start (most common), Start-to-Start, Finish-to-Finish, Start-to-Finish. Drives ScheduleCascadeService calculations for automated date updates.

**Current Limitations:**
- No circular dependency detection/warning
- No visual dependency graph in editor
- Cannot bulk-edit dependencies across multiple tasks`,
    duration: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2481-2502
- Rendering: Number input field, debounced updates (500ms delay)
- Event handlers: handleNumberChange('duration', value) with validation (lines 2395-2413)

**Backend:**
- Field: schedule_template_rows.duration
- Type: integer (default 0)
- Validation: Numericality >= 0

**How It Works:**
Task duration in working days. Used by ScheduleCascadeService to calculate end dates and dependent task start dates. Combined with start_date determines task completion timeline.

**Current Limitations:**
- No duration estimation based on historical data
- Cannot set duration in hours/weeks (days only)
- No resource-based duration adjustments`,
    startDate: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2504-2511
- Rendering: Read-only text field showing day offset (integer)
- Event handlers: None (calculated field, not user-editable)

**Backend:**
- Field: schedule_template_rows.start_date
- Type: integer (day offset from project start, nullable)
- Validation: None (automatically calculated by ScheduleCascadeService)

**How It Works:**
Automatically calculated based on predecessors, durations, lag times, and working day rules. ScheduleCascadeService recalculates when dependencies change, supporting FS/SS/FF/SF relationship types with customizable lag.

**Current Limitations:**
- No manual override capability in templates
- No critical path visualization
- Large dependency chains can slow cascade performance`,
    poRequired: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2513-2523
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('po_required', checked), affects supplier dropdown and Auto PO availability

**Backend:**
- Field: schedule_template_rows.po_required
- Type: boolean (default false)
- Validation: Triggers validation requiring supplier_id if create_po_on_job_start is true

**How It Works:**
Flags tasks requiring purchase orders. When enabled, switches supplier dropdown to show suppliers (vs internal roles). Gates the Auto PO checkbox which cannot be enabled without this flag.

**Current Limitations:**
- No PO requirement based on task type/category
- No workflow for non-PO procurement tasks
- Cannot track PO requirement separately from auto-generation`,
    autoPo: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2525-2537
- Rendering: Checkbox, disabled unless PO Required checked AND supplier selected
- Event handlers: handleCheckboxChange('create_po_on_job_start', checked), validates supplier presence, auto-unchecks if PO Required disabled

**Backend:**
- Field: schedule_template_rows.create_po_on_job_start
- Type: boolean (default false)
- Validation: Requires supplier_id present if enabled

**How It Works:**
Auto-creates draft PO when job instantiated from template. TemplateInstantiator service processes during job creation, populating PO with supplier, critical flag, price book items, and task linkage. POs created in draft status for review.

**Current Limitations:**
- POs not automatically sent to supplier (draft only)
- No quantity calculation from job specs
- Lead time fields (orderRequired/callUpRequired) tracked but unused`,
    priceItems: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2539-2557
- Rendering: Button showing count "(X items)", opens PriceBookItemsModal
- Event handlers: Modal for selecting/managing price book items

**Backend:**
- Field: schedule_template_rows.price_book_item_ids
- Type: jsonb array of integers
- Validation: Helper method price_book_items() fetches PricebookItem records

**How It Works:**
Links price book catalog items to tasks. When Auto PO enabled, these items automatically populate PO line items with pricing, descriptions, and supplier details. Enables standardized pricing across templates.

**Current Limitations:**
- No quantity specification per item (defaults to 1)
- No automatic price updates if catalog changes
- Cannot link items from multiple suppliers per task`,
    critical: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2563-2573
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('critical_po', checked)

**Backend:**
- Field: schedule_template_rows.critical_po
- Type: boolean (default false)
- Validation: None

**How It Works:**
Marks task's PO as critical priority. When Auto PO creates purchase order, critical flag transfers to PO record. Critical POs display with red badge for visual priority indication.

**Current Limitations:**
- No automatic escalation workflow for critical POs
- No due date enforcement based on critical status
- Cannot set criticality threshold rules (e.g., value-based)`,
    tags: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2575-2586
- Rendering: Text input field, comma-separated values
- Event handlers: handleTextChange('tags', value) parses CSV to array

**Backend:**
- Field: schedule_template_rows.tags
- Type: jsonb array
- Validation: Helper method tag_list() returns array of strings

**How It Works:**
User enters comma-separated tags for categorization (e.g., 'electrical, foundation, inspection'). Enables filtering and grouping tasks by trade, phase, or category in schedule views.

**Current Limitations:**
- No tag autocomplete or suggestions
- No tag standardization or validation
- Cannot create tag taxonomies or hierarchies`,
    photo: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2588-2598
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('require_photo', checked)

**Backend:**
- Field: schedule_template_rows.require_photo
- Type: boolean (default false)
- Validation: Callback sync_photos_category manages documentation categories

**How It Works:**
Triggers automatic photo task creation when parent task completed. Used for quality control, compliance documentation, and progress tracking. Photo task inherits context from parent task.

**Current Limitations:**
- No photo count specification (how many required)
- No photo type/angle requirements
- Cannot customize photo task template per task type`,
    cert: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2600-2610
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('require_certificate', checked), enables certLag field

**Backend:**
- Field: schedule_template_rows.require_certificate
- Type: boolean (default false)
- Validation: None

**How It Works:**
Spawns certificate task automatically when parent task completes. Used for regulatory compliance, inspections, and certifications. Due date calculated using cert_lag_days offset (default 10 days).

**Current Limitations:**
- No certificate type specification
- No issuing authority tracking
- Cannot link to specific regulatory requirements`,
    certLag: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2612-2623
- Rendering: Number input, disabled unless require_certificate enabled
- Event handlers: handleNumberChange('cert_lag_days', value) with range validation

**Backend:**
- Field: schedule_template_rows.cert_lag_days
- Type: integer (default 10, range 0-999)
- Validation: Numericality >= 0, <= 999

**How It Works:**
Specifies days after task completion when certificate task becomes due. Allows flexibility for different certification timelines (immediate inspection vs extended review periods).

**Current Limitations:**
- Fixed to days only (no hours/weeks)
- No automatic reminders as deadline approaches
- Cannot vary lag by certificate type`,
    supCheck: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2625-2646
- Rendering: Checkbox + button "(X checklists)" opens SupervisorChecklistModal
- Event handlers: handleCheckboxChange('require_supervisor_check', checked), modal manages checklist template selection

**Backend:**
- Field: schedule_template_rows.require_supervisor_check (boolean) + supervisor_checklist_template_ids (jsonb array)
- Type: boolean + array of integers
- Validation: Scope supervisor_checks for filtering

**How It Works:**
Requires supervisor site visit with standardized checklist before task completion. Links specific checklist templates defining inspection points. Ensures quality control at critical construction phases.

**Current Limitations:**
- No supervisor assignment/scheduling
- Cannot require multiple supervisor types
- No automatic notification to supervisors`,
    autoComplete: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2648-2659
- Rendering: Button "(X tasks)" opens AutoCompleteTasksModal
- Event handlers: Modal manages task selection for auto-completion

**Backend:**
- Field: schedule_template_rows.auto_complete_task_ids
- Type: jsonb array of integers
- Validation: None

**How It Works:**
When this task completes, automatically marks specified tasks as complete. Useful for milestone tasks that signal completion of preparatory work or grouped activities (e.g., "Foundation Complete" auto-completes all foundation subtasks).

**Current Limitations:**
- No conditional auto-completion logic
- Cannot auto-complete based on percentage/partial completion
- No cascade notification to affected task assignees`,
    subtasks: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2661-2672
- Rendering: Button "(X subtasks)" opens SubtasksModal
- Event handlers: Modal manages subtask names/templates with count validation

**Backend:**
- Field: schedule_template_rows.has_subtasks (boolean) + subtask_count (integer) + subtask_names (jsonb array) + subtask_template_ids (jsonb array)
- Type: boolean + integer + arrays
- Validation: subtask_names.count must equal subtask_count

**How It Works:**
Auto-creates child tasks when parent task starts. Breaks complex activities into manageable steps with individual tracking. Subtask completion can be tracked independently while rolling up to parent progress.

**Current Limitations:**
- No percentage-based parent completion from subtasks
- Cannot dynamically add/remove subtasks after instantiation
- No subtask dependency management`,
    linkedTasks: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2674-2685
- Rendering: Button "(X linked)" opens LinkedTasksModal
- Event handlers: Modal manages task linkage selection

**Backend:**
- Field: schedule_template_rows.linked_task_ids
- Type: text (JSON serialized)
- Validation: serialize :linked_task_ids, coder: JSON

**How It Works:**
Creates relationships between tasks for grouping or cross-template dependencies. Enables task coordination across different schedule templates or job phases without formal predecessor relationships.

**Current Limitations:**
- No visualization of linked task relationships
- Cannot specify link type/purpose
- No automatic notifications when linked tasks update`,
    manualTask: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2687-2697
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('manual_task', checked)

**Backend:**
- Field: schedule_template_rows.manual_task
- Type: boolean (default false)
- Validation: None

**How It Works:**
Excludes task from automatic schedule instantiation. Template defines task structure but user must manually create/activate when needed. Useful for optional or conditional work items.

**Current Limitations:**
- No conditional activation rules (e.g., "add if budget > X")
- Cannot suggest manual task creation based on job attributes
- No tracking of manual task usage frequency`,
    multipleItems: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2699-2709
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('allow_multiple_instances', checked)

**Backend:**
- Field: schedule_template_rows.allow_multiple_instances
- Type: boolean (default false)
- Validation: None

**How It Works:**
Upon task completion, prompts user to create additional instances with auto-incrementing names (e.g., "Frame Inspection", "Frame Inspection 2"). Handles recurring work items without manual template duplication.

**Current Limitations:**
- No automatic instance creation based on quantity
- Cannot pre-define instance count
- No bulk instance management`,
    orderRequired: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2711-2721
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('order_required', checked)

**Backend:**
- Field: schedule_template_rows.order_required
- Type: boolean (default false)
- Validation: None

**How It Works:**
Flags tasks with material order lead time requirements. Tracked for planning but not currently enforced in scheduling logic. Intended for future lead time automation.

**Current Limitations:**
- No automatic schedule adjustment for lead times
- Lead time duration not specified (boolean only)
- No integration with Auto PO timing`,
    callUpRequired: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2723-2733
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('call_up_required', checked)

**Backend:**
- Field: schedule_template_rows.call_up_required
- Type: boolean (default false)
- Validation: None

**How It Works:**
Flags tasks requiring supplier call-up/booking advance notice. Tracked for planning but not currently enforced. Intended for future supplier coordination automation.

**Current Limitations:**
- No automatic supplier notification
- Call-up duration not specified (boolean only)
- No integration with schedule cascade`,
    planType: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2735-2745
- Rendering: Checkbox input
- Event handlers: handleCheckboxChange('plan_required', checked)

**Backend:**
- Field: schedule_template_rows.plan_required
- Type: boolean (default false)
- Validation: None

**How It Works:**
Conditionally activates documentation tasks based on job plan type selection (PERSPECTIVE, SITE PLAN, ELEVATIONS, etc.). Task only instantiated if corresponding plan tab selected during job setup.

**Current Limitations:**
- No plan type specification (which plan types trigger)
- Boolean only (no multi-plan-type support)
- No plan availability validation`,
    actions: `**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2747-2766
- Rendering: Three buttons - Move Up (↑), Move Down (↓), Delete (trash icon)
- Event handlers: handleMoveRow(direction), handleDeleteRow(rowId) with confirmation

**Backend:**
- Field: N/A (frontend operations trigger row updates)
- Type: UI controls only
- Validation: Move operations update sequence_order, delete operations cascade

**How It Works:**
Move Up/Down reorders tasks by swapping sequence_order values and updating display. Delete removes row with confirmation dialog. All operations trigger immediate save and rerender.

**Current Limitations:**
- No drag-and-drop reordering
- Cannot move multiple selected rows simultaneously
- No undo/redo for delete operations`
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
