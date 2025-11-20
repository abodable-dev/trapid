# 🏗️ TRAPID GANTT CHART - COMPREHENSIVE ARCHITECTURE PLAN

**Version:** 1.0
**Date:** 2025-11-20
**Status:** Ready for Implementation
**Estimated Timeline:** 12 weeks

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Core Requirements](#1-core-requirements-summary)
3. [Database Schema](#2-database-schema)
4. [API Design](#3-api-design)
5. [Frontend Architecture](#4-frontend-architecture)
6. [Cascade & Dependency Engine](#5-cascade--dependency-engine)
7. [Rollover Automation System](#6-rollover-automation-system)
8. [Supplier Workflow Integration](#7-supplier-workflow-integration)
9. [Task Spawning System](#8-task-spawning-system)
10. [Working Drawings AI System](#9-working-drawings-ai-system)
11. [Implementation Roadmap](#10-implementation-roadmap)
12. [Technology Stack](#11-technology-stack-recommendations)
13. [Key Design Decisions](#12-key-design-decisions)

---

## EXECUTIVE SUMMARY

This architecture plan defines a construction-specific Gantt chart system for managing residential property development schedules. The system supports complex dependency management, supplier coordination workflows, automated rollover, and extensive task spawning capabilities.

### Key Capabilities

- **Unlimited task hierarchy** with 4 dependency types (FS, SS, FF, SF) + lag time
- **Supplier confirmation workflow** with cascade conflict resolution
- **Automated midnight rollover** preventing past-due tasks
- **Cross-job dependencies** and filtered multi-job views
- **Cost-based duration calculation** from PO → Price Book
- **Task spawning** (photos, scans, inspections, office tasks)
- **AI-powered working drawings** page separation
- **Trade-based PO batching** with auto-document attachment
- **Mobile-responsive** with touch drag and photo capture
- **Real-time collaboration** (one editor, others view-only)

### Project Goals

1. **Speed to Market:** 12-week phased implementation
2. **Flexibility:** Use DHTMLX initially, build custom later
3. **Construction-Specific:** Workflows tailored to residential building
4. **Scalability:** Handle 100-500 tasks per job, multiple jobs
5. **User Control:** Full customization, Tailwind consistency (future)

---

## 1. CORE REQUIREMENTS SUMMARY

### 1.1 Use Cases

**Primary Use Case:**
Manage actual job schedules (schedule_tasks) for residential properties with real dates.

**Secondary Use Case:**
Template management (schedule_template_rows) in separate view.

### 1.2 Task Hierarchy

- **Unlimited nesting:** Parent → Child → Grandchild → ...
- **Independent rollover:** Each task rolls independently based on own dates
- **Organizational only:** Hierarchy for display, not cascade constraints

### 1.3 Dependency Types

| Type | Name | Calculation | Example |
|------|------|-------------|---------|
| **FS** | Finish-to-Start | Task 2 starts when Task 1 finishes | Pour concrete → Remove formwork |
| **SS** | Start-to-Start | Task 2 starts when Task 1 starts | Electrical rough-in ‖ Plumbing rough-in |
| **FF** | Finish-to-Finish | Task 2 finishes when Task 1 finishes | Final cleanup ‖ Final inspection |
| **SF** | Start-to-Finish | Task 2 finishes when Task 1 starts | (Rare in construction) |

**Lag Time:**
- **Positive lag:** Task 2 starts X working days AFTER Task 1 (FS+3)
  - Example: Apply paint → wait 3 days → Apply second coat
- **Negative lag (lead):** Task 2 starts X working days BEFORE Task 1 (FS-3)
  - Example: Pour concrete → start cleanup 2 days before done
- **Always working days:** Respects company calendar (weekends, holidays)

### 1.4 Cross-Job Dependencies

- Tasks in Job A can depend on tasks in Job B
- Cascade propagates across job boundaries
- **Automated rollover:** Cascades across jobs automatically
- **Manual cascade:** User confirmation required before crossing jobs

### 1.5 Working Days & Calendar

**Company Settings:**
- Configurable working days (Monday-Sunday checkboxes)
- Company timezone for rollover timing
- Regional public holidays (3-year range)

**Duration Calculation:**
- Duration = X working days (skips weekends & holidays)
- Example: Duration 5 days, Mon start, Thu holiday → ends Tue (7 calendar days)

**Task Scheduling:**
- Tasks roll to next working day (never land on weekend/holiday)
- Manual positioning allowed (user can override)

### 1.6 Task Types

#### Schedule Master Tasks
- From template (schedule_template_rows)
- Start WITH dependencies
- Auto-cascade
- Rollover active

#### Manual / Requisition Tasks
- User creates ad-hoc
- Start WITHOUT dependencies
- CAN add dependencies later
- Rollover active
- Example: "Req Pay for damaged fence"

### 1.7 Task States

| State | Behavior | Visual | Cascade |
|-------|----------|--------|---------|
| **Not Started** | Scheduled, not begun | Normal color | Cascades normally |
| **Started** | Work in progress | Blue/active color | Drops predecessor deps, keeps successor deps |
| **Completed** | Finished | Green/complete (hidden by default) | Drops ALL dependencies |
| **Hold/Manual** | User positioned | Different color | Cascade clears hold status |
| **Confirm Requested** | Awaiting supplier | Orange | Cascade moves + marks checkered |
| **Supplier Confirmed** | Supplier committed | Green | Cascade BLOCKS (shows modal) |
| **Moved After Confirm** | Was confirmed but moved | Checkered pattern | N/A (visual indicator) |

### 1.8 Data Scale

- **Typical:** 100-500 tasks per job
- **Jobs:** Multiple jobs per project
- **Views:** Filtered multi-job views
- **Performance:** Virtualization/lazy loading required

---

## 2. DATABASE SCHEMA

### 2.1 schedule_tasks (Job Instances)

```sql
CREATE TABLE schedule_tasks (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Foreign Keys
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  template_row_id BIGINT REFERENCES schedule_template_rows(id) ON DELETE SET NULL,
  parent_task_id BIGINT REFERENCES schedule_tasks(id) ON DELETE SET NULL,

  -- Identification
  task_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Hierarchy & Ordering
  sequence_order DECIMAL(10,2) NOT NULL,

  -- Scheduling
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL,

  -- Dependencies (JSONB array)
  predecessor_ids JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"task_id": 123, "type": "FS", "lag": 3}, {"task_id": 124, "type": "SS", "lag": 0}]

  -- Status & Workflow
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  -- Enum: 'not_started', 'started', 'completed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  passed BOOLEAN,
  -- For pass/fail inspections (nullable)

  -- Supplier Workflow
  confirm_status VARCHAR(50),
  -- Enum: NULL, 'confirm_requested', 'supplier_confirmed', 'moved_after_confirm'
  confirm_requested_at TIMESTAMP,
  supplier_confirmed_at TIMESTAMP,
  supplier_confirmed_by BIGINT REFERENCES users(id),

  -- Manual Positioning
  manually_positioned BOOLEAN DEFAULT FALSE,
  manually_positioned_at TIMESTAMP,

  -- Hold Status
  on_hold BOOLEAN DEFAULT FALSE,
  hold_reason TEXT,

  -- Cost & Resources
  purchase_order_id BIGINT REFERENCES purchase_orders(id) ON DELETE SET NULL,
  assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  trade VARCHAR(100),
  -- Enum: 'carpenter', 'electrician', 'plumber', 'painter', 'roofer', etc.
  stage VARCHAR(100),
  -- Enum: 'frame', 'fix', 'install', etc.

  -- Linked Requirements
  linked_task_ids JSONB DEFAULT '[]'::jsonb,
  -- Array of task IDs that are related (e.g., materials, equipment)

  -- Task Spawning Configuration
  spawn_photo_task BOOLEAN DEFAULT FALSE,
  spawn_scan_task BOOLEAN DEFAULT FALSE,
  spawn_office_tasks JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"name": "Get Inspection", "assigned_role": "office_manager", "due_days_offset": 2}]
  pass_fail_enabled BOOLEAN DEFAULT FALSE,
  checklist_id BIGINT REFERENCES checklists(id) ON DELETE SET NULL,

  -- Reminders (from PO/Price Book)
  order_time_days INTEGER,
  call_time_days INTEGER,
  order_reminder_sent BOOLEAN DEFAULT FALSE,
  call_reminder_sent BOOLEAN DEFAULT FALSE,

  -- Documentation Tab
  show_in_docs_tab BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES users(id),
  updated_by BIGINT REFERENCES users(id),

  -- Indexes
  CONSTRAINT schedule_tasks_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_schedule_tasks_job_id ON schedule_tasks(job_id);
CREATE INDEX idx_schedule_tasks_status ON schedule_tasks(status);
CREATE INDEX idx_schedule_tasks_start_date ON schedule_tasks(start_date);
CREATE INDEX idx_schedule_tasks_parent_task ON schedule_tasks(parent_task_id);
CREATE INDEX idx_schedule_tasks_sequence_order ON schedule_tasks(sequence_order);
CREATE INDEX idx_schedule_tasks_trade ON schedule_tasks(trade);
CREATE INDEX idx_schedule_tasks_confirm_status ON schedule_tasks(confirm_status);
CREATE INDEX idx_schedule_tasks_po ON schedule_tasks(purchase_order_id);
```

### 2.2 task_dependencies (Separate Table)

```sql
CREATE TABLE task_dependencies (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Foreign Keys
  predecessor_task_id BIGINT NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  successor_task_id BIGINT NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,

  -- Dependency Configuration
  dependency_type VARCHAR(10) NOT NULL,
  -- Enum: 'FS', 'SS', 'FF', 'SF'
  lag_days INTEGER NOT NULL DEFAULT 0,
  -- Can be negative for lead time

  -- Lifecycle Tracking
  active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP,
  deleted_by_rollover BOOLEAN DEFAULT FALSE,
  deleted_reason VARCHAR(100),
  -- Enum: 'rollover', 'user_manual', 'cascade_conflict', 'task_started', 'task_completed'

  -- Audit
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES users(id),
  deleted_by BIGINT REFERENCES users(id),

  -- Constraints
  CONSTRAINT task_dependencies_pkey PRIMARY KEY (id),
  CONSTRAINT no_self_dependency CHECK (predecessor_task_id != successor_task_id)
  -- Note: Per requirements, circular dependencies ARE allowed (A→B→C→A)
);

CREATE INDEX idx_task_dependencies_predecessor ON task_dependencies(predecessor_task_id) WHERE active = TRUE;
CREATE INDEX idx_task_dependencies_successor ON task_dependencies(successor_task_id) WHERE active = TRUE;
CREATE INDEX idx_task_dependencies_active ON task_dependencies(active);
```

### 2.3 rollover_audit_log

```sql
CREATE TABLE rollover_audit_log (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Batch Identification
  rollover_batch_id UUID NOT NULL,
  -- Groups all changes from one rollover execution
  rollover_timestamp TIMESTAMP NOT NULL,

  -- Task Changes
  task_id BIGINT NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  old_start_date DATE,
  new_start_date DATE,
  old_end_date DATE,
  new_end_date DATE,

  -- Dependency Deletions
  deleted_dependencies JSONB DEFAULT '[]'::jsonb,
  -- Array of deleted dependency records

  -- Status Changes
  confirm_status_change VARCHAR(255),
  -- Example: "confirm_requested → moved_after_confirm"
  hold_cleared BOOLEAN DEFAULT FALSE,

  -- Metadata
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  cascade_depth INTEGER,
  -- How many levels deep the cascade went
  cross_job_cascade BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rollover_audit_batch ON rollover_audit_log(rollover_batch_id);
CREATE INDEX idx_rollover_audit_task ON rollover_audit_log(task_id);
CREATE INDEX idx_rollover_audit_job ON rollover_audit_log(job_id);
CREATE INDEX idx_rollover_audit_timestamp ON rollover_audit_log(rollover_timestamp);
```

### 2.4 task_spawn_log

```sql
CREATE TABLE task_spawn_log (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Foreign Keys
  parent_task_id BIGINT NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  spawned_task_id BIGINT NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,

  -- Spawn Configuration
  spawn_type VARCHAR(50) NOT NULL,
  -- Enum: 'photo', 'scan', 'office', 'inspection_retry'
  spawn_trigger VARCHAR(50) NOT NULL,
  -- Enum: 'parent_complete', 'inspection_fail'

  -- Audit
  spawned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  spawned_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_task_spawn_parent ON task_spawn_log(parent_task_id);
CREATE INDEX idx_task_spawn_spawned ON task_spawn_log(spawned_task_id);
CREATE INDEX idx_task_spawn_type ON task_spawn_log(spawn_type);
```

### 2.5 working_drawing_pages

```sql
CREATE TABLE working_drawing_pages (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Foreign Keys
  task_id BIGINT NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  -- Linked to "Req Working Drawings" task

  -- Page Information
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  -- Cloudinary or S3 URL

  -- AI Categorization
  category VARCHAR(100) NOT NULL,
  -- Examples: 'ground_floor_plan', 'elevation_north', 'electrical_plan'
  ai_confidence DECIMAL(5,4),
  -- 0.0000 to 1.0000

  -- Manual Override
  category_overridden BOOLEAN DEFAULT FALSE,
  manual_category VARCHAR(100),

  -- Audit
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_working_drawing_pages_task ON working_drawing_pages(task_id);
CREATE INDEX idx_working_drawing_pages_category ON working_drawing_pages(category);
```

---

## 3. API DESIGN

### 3.1 Core Task Endpoints

#### GET /api/v1/jobs/:job_id/schedule_tasks

**Description:** Fetch all tasks for a job

**Query Parameters:**
- `include_completed` (boolean, default: false) - Include completed tasks
- `trade` (string) - Filter by trade
- `status` (string) - Filter by status
- `view_mode` (string) - hierarchy | supplier | trade | flat

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "job_id": 45,
      "name": "Frame Walls",
      "start_date": "2025-06-15",
      "end_date": "2025-06-20",
      "duration_days": 5,
      "status": "not_started",
      "confirm_status": null,
      "trade": "carpenter",
      "supplier_name": "ABC Carpentry",
      "assigned_user": { "id": 10, "name": "John Smith" },
      "dependencies": [
        { "predecessor_id": 122, "type": "FS", "lag": 0 }
      ],
      "children": []
    }
  ]
}
```

---

#### POST /api/v1/schedule_tasks

**Description:** Create new task (manual or from template)

**Request Body:**
```json
{
  "job_id": 45,
  "name": "Req Pay for damaged fence",
  "start_date": "2025-06-15",
  "duration_days": 1,
  "trade": "office",
  "is_manual": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 124,
    "name": "Req Pay for damaged fence",
    "start_date": "2025-06-15",
    "end_date": "2025-06-15",
    "status": "not_started"
  }
}
```

---

#### PATCH /api/v1/schedule_tasks/:id

**Description:** Update task (dates, status, assignments, etc.)

**Request Body:**
```json
{
  "start_date": "2025-06-20",
  "trigger_cascade": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": { "id": 123, "start_date": "2025-06-20", ... },
    "cascade_preview": {
      "affected_tasks": 5,
      "conflicts": [
        {
          "task_id": 125,
          "task_name": "Install cladding",
          "blocker": "supplier_confirmed",
          "options": ["delete_dependency", "unsupplier_confirm"]
        }
      ]
    }
  }
}
```

---

#### POST /api/v1/schedule_tasks/:id/cascade

**Description:** Execute cascade with conflict resolutions

**Request Body:**
```json
{
  "delete_dependencies": [45, 67],
  "unsupplier_confirm": [125]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_tasks": [...],
    "deleted_dependencies": [...],
    "notifications_sent": 3
  }
}
```

---

### 3.2 Supplier Workflow Endpoints

#### POST /api/v1/schedule_tasks/:id/confirm

**Description:** Request supplier confirmation

**Response:**
```json
{
  "success": true,
  "data": {
    "task": { "id": 123, "confirm_status": "confirm_requested" },
    "notification_sent": true,
    "supplier_portal_url": "https://..."
  }
}
```

---

#### POST /api/v1/schedule_tasks/:id/supplier_confirm

**Description:** Supplier confirms task (from portal)

**Request Body:**
```json
{
  "new_start_date": "2025-06-18"
  // Optional - supplier can change date
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": { "id": 123, "confirm_status": "supplier_confirmed" },
    "date_changed": true
  }
}
```

---

### 3.3 Task Completion Endpoints

#### POST /api/v1/schedule_tasks/:id/complete

**Description:** Mark task complete (triggers spawning)

**Request Body:**
```json
{
  "passed": true,
  // For pass/fail inspections
  "photos": [
    { "url": "https://...", "caption": "..." }
  ],
  "checklist_data": {
    "items": [
      { "id": 1, "checked": true },
      { "id": 2, "checked": true, "notes": "..." }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": { "id": 123, "status": "completed" },
    "spawned_tasks": [
      { "id": 200, "name": "Get Electrical Inspection", "type": "office" }
    ],
    "checklist_report_url": "https://..."
  }
}
```

---

### 3.4 Rollover Endpoints

#### POST /api/v1/rollover/execute

**Description:** Manual rollover trigger (admin only)

**Request Body:**
```json
{
  "job_ids": [45, 46, 47],
  "dry_run": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preview": {
      "jobs_affected": 3,
      "tasks_to_move": 42,
      "dependencies_to_delete": 8
    },
    "changes": [...]
  }
}
```

---

#### GET /api/v1/rollover/audit

**Description:** Get rollover history

**Query Parameters:**
- `job_id` (integer)
- `start_date` (date)
- `end_date` (date)
- `include_dependencies` (boolean)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rollover_batch_id": "uuid",
      "rollover_timestamp": "2025-06-15T00:00:00Z",
      "job_name": "123 Main St",
      "tasks_moved": 15,
      "dependencies_deleted": 3,
      "changes": [...]
    }
  ]
}
```

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Component Structure

```
src/components/gantt/
├── GanttView.jsx                    # Main container
├── GanttToolbar.jsx                 # View toggles, filters, export
├── GanttGrid.jsx                    # Task list (left side)
│   ├── GanttRow.jsx                 # Single task row
│   ├── GanttCell.jsx                # Individual cells (inline edit)
│   └── GanttCheckbox.jsx            # Checkboxes for bulk actions
├── GanttTimeline.jsx                # Chart area (right side)
│   ├── GanttBar.jsx                 # Task bars
│   ├── DependencyLine.jsx           # Dependency arrows
│   └── GanttTooltip.jsx             # Hover tooltips
├── modals/
│   ├── CascadeConflictModal.jsx     # Supplier confirm cascade UI
│   ├── TaskEditModal.jsx            # Full task editor
│   ├── DependencyEditorModal.jsx    # Add/edit dependencies
│   ├── ConfirmRequestModal.jsx      # Request supplier confirmation
│   └── CompleteTaskModal.jsx        # Task completion (pass/fail, checklist)
├── panels/
│   ├── FilterPanel.jsx              # Search & filter UI
│   ├── ColumnConfigPanel.jsx        # Show/hide columns
│   └── ViewSelectorPanel.jsx        # Hierarchy / Supplier / Trade / Flat
└── hooks/
    ├── useGanttData.js              # Data fetching & caching
    ├── useCascade.js                # Cascade calculation logic
    ├── useRollover.js               # Rollover status & triggers
    └── useWorkingDays.js            # Calendar calculations
```

### 4.2 State Management (Zustand Recommended)

```javascript
// src/stores/ganttStore.js

import create from 'zustand'

export const useGanttStore = create((set, get) => ({
  // Data
  tasks: new Map(),
  dependencies: new Map(),

  // UI State
  viewMode: 'hierarchy', // 'hierarchy' | 'supplier' | 'trade' | 'flat'
  filters: {
    trade: null,
    status: null,
    search: ''
  },
  visibleColumns: {
    taskNumber: true,
    taskName: true,
    predecessors: true,
    supplier: true,
    duration: true,
    confirm: true,
    supplierConfirm: true,
    start: true,
    complete: true,
    lock: true
  },
  selection: new Set(),

  // Undo/Redo
  undoStack: [],
  redoStack: [],

  // Actions
  addTask: (task) => set(state => {
    const newTasks = new Map(state.tasks)
    newTasks.set(task.id, task)
    return { tasks: newTasks }
  }),

  updateTask: (taskId, updates) => set(state => {
    // Add to undo stack
    const oldTask = state.tasks.get(taskId)
    const newUndoStack = [...state.undoStack, { type: 'update', task: oldTask }]

    // Update task
    const newTasks = new Map(state.tasks)
    newTasks.set(taskId, { ...oldTask, ...updates })

    return {
      tasks: newTasks,
      undoStack: newUndoStack,
      redoStack: [] // Clear redo on new action
    }
  }),

  undo: () => set(state => {
    if (state.undoStack.length === 0) return state

    const action = state.undoStack[state.undoStack.length - 1]
    const newUndoStack = state.undoStack.slice(0, -1)
    const newRedoStack = [...state.redoStack, action]

    // Revert action
    const newTasks = new Map(state.tasks)
    if (action.type === 'update') {
      newTasks.set(action.task.id, action.task)
    }

    return {
      tasks: newTasks,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    }
  }),

  setViewMode: (mode) => set({ viewMode: mode }),
  setFilters: (filters) => set({ filters }),
  toggleColumn: (column) => set(state => ({
    visibleColumns: {
      ...state.visibleColumns,
      [column]: !state.visibleColumns[column]
    }
  }))
}))
```

### 4.3 View Modes Implementation

```javascript
// src/components/gantt/hooks/useViewMode.js

export function useViewMode(tasks, viewMode) {
  return useMemo(() => {
    switch (viewMode) {
      case 'hierarchy':
        return buildHierarchyTree(tasks)

      case 'supplier':
        return groupBySupplier(tasks)

      case 'trade':
        return groupByTrade(tasks)

      case 'flat':
        return sortBySequence(tasks)

      default:
        return tasks
    }
  }, [tasks, viewMode])
}

function buildHierarchyTree(tasks) {
  const taskMap = new Map(tasks.map(t => [t.id, { ...t, children: [] }]))
  const roots = []

  taskMap.forEach(task => {
    if (task.parent_task_id) {
      const parent = taskMap.get(task.parent_task_id)
      if (parent) parent.children.push(task)
    } else {
      roots.push(task)
    }
  })

  return roots
}

function groupBySupplier(tasks) {
  const groups = {}

  tasks.forEach(task => {
    const supplier = task.supplier_name || 'No Supplier'
    if (!groups[supplier]) {
      groups[supplier] = []
    }
    groups[supplier].push(task)
  })

  // Sort tasks within each group by start date
  Object.values(groups).forEach(group => {
    group.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
  })

  return groups
}

function groupByTrade(tasks) {
  const groups = {}

  tasks.forEach(task => {
    const trade = task.trade || 'No Trade'
    if (!groups[trade]) {
      groups[trade] = {}
    }

    const stage = task.stage || 'No Stage'
    if (!groups[trade][stage]) {
      groups[trade][stage] = []
    }
    groups[trade][stage].push(task)
  })

  return groups
}
```

### 4.4 Mobile Responsive Strategy

**Breakpoints:**
- Desktop: ≥ 1920px (Grid 40%, Timeline 60%, 3-4 weeks visible)
- Laptop: ≥ 1366px (Grid 35%, Timeline 65%, 2-3 weeks visible)
- Tablet: ≥ 768px (Grid 30%, Timeline 70%, 2 weeks visible)
- Mobile: < 768px (Tabs: [Grid] [Timeline], full width each)

**Mobile Interactions:**
- **Touch drag:** Move task bars
- **Long press:** Edit menu
- **Double tap:** Open task modal
- **Pinch zoom:** Zoom timeline
- **Swipe:** Navigate timeline left/right

```javascript
// src/components/gantt/GanttView.jsx

export function GanttView({ jobId }) {
  const [activeTab, setActiveTab] = useState('grid') // 'grid' | 'timeline'
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    return (
      <div className="gantt-mobile">
        <div className="tabs">
          <button onClick={() => setActiveTab('grid')}>Grid</button>
          <button onClick={() => setActiveTab('timeline')}>Timeline</button>
        </div>

        {activeTab === 'grid' ? (
          <GanttGrid />
        ) : (
          <GanttTimeline />
        )}
      </div>
    )
  }

  return (
    <div className="gantt-desktop">
      <GanttGrid />
      <GanttTimeline />
    </div>
  )
}
```

---

## 5. CASCADE & DEPENDENCY ENGINE

### 5.1 Cascade Algorithm (JavaScript Implementation)

```javascript
// src/services/cascadeService.js

export class CascadeService {
  constructor(tasks, dependencies, workingDaysCalendar) {
    this.tasks = tasks
    this.dependencies = dependencies
    this.calendar = workingDaysCalendar
  }

  /**
   * Execute cascade from a moved task
   * @param {number} taskId - Task being moved
   * @param {Date} newStartDate - New start date
   * @param {Date} newEndDate - New end date
   * @param {Object} options - Cascade options
   * @returns {Object} - Cascade results
   */
  async execute(taskId, newStartDate, newEndDate, options = {}) {
    const {
      autoDeleteDependencies = false,  // Rollover mode
      crossJobConfirm = true             // Show modal for cross-job
    } = options

    // 1. Get all successors (breadth-first traversal)
    const successors = this.getAllSuccessors(taskId)

    // 2. Initialize results
    const results = {
      updatedTasks: [],
      deletedDependencies: [],
      conflicts: []
    }

    // 3. Process each successor
    for (const successor of successors) {
      // Skip if started/completed (dependencies dropped)
      if (['started', 'completed'].includes(successor.status)) {
        continue
      }

      // Calculate new dates based on all dependencies
      const newDates = this.calculateDatesFromDependencies(successor)

      // Check for blockers
      const blocker = this.checkBlockers(successor, options)

      if (blocker) {
        if (autoDeleteDependencies && blocker.type === 'supplier_confirmed') {
          // Rollover: auto-delete dependency
          const dep = this.dependencies.find(d =>
            d.predecessor_id === taskId && d.successor_id === successor.id
          )
          results.deletedDependencies.push(dep)

          // Mark task as moved after confirm (checkered)
          successor.confirm_status = 'moved_after_confirm'
          results.updatedTasks.push(successor)

        } else {
          // Manual cascade: add to conflicts for modal
          results.conflicts.push({
            task: successor,
            blocker: blocker.type,
            options: blocker.options
          })
          continue  // Stop cascade at this branch
        }
      } else {
        // Apply cascade
        this.applyDatesToTask(successor, newDates)
        results.updatedTasks.push(successor)
      }
    }

    return results
  }


  /**
   * Get all successors recursively
   */
  getAllSuccessors(taskId, visited = new Set()) {
    if (visited.has(taskId)) return []
    visited.add(taskId)

    const successors = []
    const directSuccessors = this.dependencies
      .filter(d => d.predecessor_id === taskId && d.active)
      .map(d => this.tasks.get(d.successor_id))

    for (const successor of directSuccessors) {
      successors.push(successor)
      successors.push(...this.getAllSuccessors(successor.id, visited))
    }

    return successors
  }


  /**
   * Calculate new dates based on all dependencies (FS, SS, FF, SF)
   */
  calculateDatesFromDependencies(task) {
    const taskDeps = this.dependencies.filter(d =>
      d.successor_id === task.id && d.active
    )

    let earliestStart = null
    let latestFinish = null

    for (const dep of taskDeps) {
      const pred = this.tasks.get(dep.predecessor_id)

      if (dep.type === 'FS') {
        // Finish-to-Start: This task starts when predecessor finishes
        const candidateStart = this.calendar.addWorkingDays(
          pred.end_date,
          dep.lag_days + 1
        )
        if (!earliestStart || candidateStart > earliestStart) {
          earliestStart = candidateStart
        }

      } else if (dep.type === 'SS') {
        // Start-to-Start: This task starts when predecessor starts
        const candidateStart = this.calendar.addWorkingDays(
          pred.start_date,
          dep.lag_days
        )
        if (!earliestStart || candidateStart > earliestStart) {
          earliestStart = candidateStart
        }

      } else if (dep.type === 'FF') {
        // Finish-to-Finish: This task finishes when predecessor finishes
        const candidateFinish = this.calendar.addWorkingDays(
          pred.end_date,
          dep.lag_days
        )
        if (!latestFinish || candidateFinish > latestFinish) {
          latestFinish = candidateFinish
        }

      } else if (dep.type === 'SF') {
        // Start-to-Finish: This task finishes when predecessor starts
        const candidateFinish = this.calendar.addWorkingDays(
          pred.start_date,
          dep.lag_days
        )
        if (!latestFinish || candidateFinish > latestFinish) {
          latestFinish = candidateFinish
        }
      }
    }

    // Calculate final dates
    let startDate, endDate

    if (earliestStart) {
      startDate = earliestStart
      endDate = this.calendar.addWorkingDays(startDate, task.duration_days - 1)
    } else if (latestFinish) {
      endDate = latestFinish
      startDate = this.calendar.subtractWorkingDays(endDate, task.duration_days - 1)
    }

    return { startDate, endDate }
  }


  /**
   * Check for cascade blockers
   */
  checkBlockers(task, options) {
    // Supplier Confirmed - BLOCKS cascade
    if (task.confirm_status === 'supplier_confirmed') {
      return {
        type: 'supplier_confirmed',
        options: ['delete_dependency', 'unsupplier_confirm']
      }
    }

    // Confirm Requested - moves but marks checkered
    if (task.confirm_status === 'confirm_requested') {
      task.confirm_status = 'moved_after_confirm'
      return null  // Not a blocker, just modifies status
    }

    // Hold - clears hold status
    if (task.on_hold) {
      task.on_hold = false
      return null
    }

    // Manual position - overrides
    if (task.manually_positioned) {
      task.manually_positioned = false
      return null
    }

    // Cross-job cascade - requires confirmation
    if (options.crossJobConfirm && task.job_id !== this.currentJobId) {
      return {
        type: 'cross_job',
        job_name: task.job_name
      }
    }

    return null
  }


  /**
   * Apply calculated dates to task
   */
  applyDatesToTask(task, newDates) {
    task.start_date = newDates.startDate
    task.end_date = newDates.endDate
  }
}
```

### 5.2 Working Days Calendar

```javascript
// src/services/workingDaysCalendar.js

export class WorkingDaysCalendar {
  constructor(companySettings, publicHolidays) {
    this.workingDays = companySettings.working_days
    // { monday: true, tuesday: true, ..., sunday: false }

    this.holidays = new Set(
      publicHolidays.map(h => h.date.toISOString().split('T')[0])
    )
  }

  /**
   * Add X working days to a date
   */
  addWorkingDays(date, days) {
    let current = new Date(date)
    let remaining = days

    while (remaining > 0) {
      current.setDate(current.getDate() + 1)
      if (this.isWorkingDay(current)) {
        remaining--
      }
    }

    return current
  }

  /**
   * Subtract X working days from a date
   */
  subtractWorkingDays(date, days) {
    let current = new Date(date)
    let remaining = days

    while (remaining > 0) {
      current.setDate(current.getDate() - 1)
      if (this.isWorkingDay(current)) {
        remaining--
      }
    }

    return current
  }

  /**
   * Check if date is a working day
   */
  isWorkingDay(date) {
    // Check weekend
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    if (!this.workingDays[dayName]) {
      return false
    }

    // Check holiday
    const dateStr = date.toISOString().split('T')[0]
    if (this.holidays.has(dateStr)) {
      return false
    }

    return true
  }

  /**
   * Get next working day from date
   */
  nextWorkingDay(date) {
    let current = new Date(date)
    current.setDate(current.getDate() + 1)

    while (!this.isWorkingDay(current)) {
      current.setDate(current.getDate() + 1)
    }

    return current
  }
}
```

---

## 6. ROLLOVER AUTOMATION SYSTEM

### 6.1 Backend Rollover Job (Ruby)

```ruby
# backend/app/jobs/schedule_rollover_job.rb

class ScheduleRolloverJob < ApplicationJob
  queue_as :critical

  def perform(options = {})
    company = Company.first  # Or pass company_id
    rollover_time = Time.current.in_time_zone(company.timezone)
    batch_id = SecureRandom.uuid

    Rails.logger.info("=== Rollover Starting: #{rollover_time} ===")

    # Get all jobs with past tasks
    jobs_to_rollover = Job.with_past_tasks.ids

    Rails.logger.info("Jobs to rollover: #{jobs_to_rollover.size}")

    # Separate independent vs linked jobs
    independent_jobs, linked_jobs = partition_jobs_by_dependencies(jobs_to_rollover)

    Rails.logger.info("Independent jobs: #{independent_jobs.size}, Linked jobs: #{linked_jobs.size}")

    # Process independent jobs in parallel
    results_independent = Parallel.map(independent_jobs, in_threads: 5) do |job_id|
      rollover_single_job(job_id, batch_id, rollover_time)
    end

    # Process linked jobs sequentially (in dependency order)
    results_linked = process_linked_jobs_sequential(linked_jobs, batch_id, rollover_time)

    # Combine results
    all_results = results_independent + results_linked

    # Send notifications
    send_rollover_notifications(all_results)

    # Log summary
    total_tasks = all_results.sum { |r| r[:changes][:tasks_moved].size }
    total_deps = all_results.sum { |r| r[:changes][:dependencies_deleted].size }

    Rails.logger.info("=== Rollover Complete ===")
    Rails.logger.info("Jobs processed: #{all_results.size}")
    Rails.logger.info("Tasks moved: #{total_tasks}")
    Rails.logger.info("Dependencies deleted: #{total_deps}")
  end


  private

  def rollover_single_job(job_id, batch_id, rollover_time)
    job = Job.find(job_id)
    changes = {
      tasks_moved: [],
      dependencies_deleted: [],
      confirms_checkered: []
    }

    # Get tasks in past (sequence order)
    past_tasks = job.schedule_tasks
      .where("start_date < ?", Date.current)
      .where.not(status: 'completed')
      .order(:sequence_order)

    Rails.logger.info("Job #{job_id}: #{past_tasks.size} tasks to roll")

    past_tasks.each do |task|
      roll_result = roll_task_forward(task)
      changes[:tasks_moved] << roll_result[:task_change]
      changes[:dependencies_deleted] += roll_result[:deleted_dependencies]
      changes[:confirms_checkered] += roll_result[:checkered_tasks]
    end

    # Create audit log
    RolloverAuditLog.create!(
      rollover_batch_id: batch_id,
      rollover_timestamp: rollover_time,
      job_id: job_id,
      changes: changes.to_json
    )

    { job_id: job_id, job_name: job.name, changes: changes }
  end


  def roll_task_forward(task)
    result = {
      task_change: nil,
      deleted_dependencies: [],
      checkered_tasks: []
    }

    # Calculate new date (next working day)
    new_start = WorkingDaysService.next_working_day(Date.current, task.job.company)

    if task.status == 'started'
      # Started tasks: only roll end date if in past
      if task.end_date < Date.current
        old_end = task.end_date
        task.update!(end_date: WorkingDaysService.next_working_day(Date.current, task.job.company))

        result[:task_change] = {
          task_id: task.id,
          task_name: task.name,
          type: 'end_date_only',
          old_end: old_end,
          new_end: task.end_date
        }
      end
    else
      # Not started: roll entire task forward
      old_start = task.start_date
      old_end = task.end_date

      task.update!(
        start_date: new_start,
        end_date: WorkingDaysService.add_working_days(new_start, task.duration_days - 1, task.job.company)
      )

      result[:task_change] = {
        task_id: task.id,
        task_name: task.name,
        type: 'full_roll',
        old_start: old_start,
        new_start: new_start,
        old_end: old_end,
        new_end: task.end_date
      }

      # Cascade with auto-delete dependencies
      cascade_result = ScheduleCascadeService.new(task).execute(
        auto_delete_dependencies: true,
        rollover_mode: true
      )

      result[:deleted_dependencies] = cascade_result[:deleted_dependencies]
      result[:checkered_tasks] = cascade_result[:checkered_tasks]
    end

    result
  end


  def partition_jobs_by_dependencies(job_ids)
    # Find jobs with cross-job dependencies
    cross_job_deps = TaskDependency
      .joins("INNER JOIN schedule_tasks pred ON pred.id = task_dependencies.predecessor_task_id")
      .joins("INNER JOIN schedule_tasks succ ON succ.id = task_dependencies.successor_task_id")
      .where("pred.job_id != succ.job_id")
      .where("pred.job_id IN (?) OR succ.job_id IN (?)", job_ids, job_ids)
      .pluck("pred.job_id", "succ.job_id")
      .flatten
      .uniq

    independent = job_ids - cross_job_deps
    linked = cross_job_deps

    [independent, linked]
  end


  def process_linked_jobs_sequential(job_ids, batch_id, rollover_time)
    # Sort jobs by dependency order (topological sort)
    sorted_jobs = topological_sort_jobs(job_ids)

    sorted_jobs.map do |job_id|
      rollover_single_job(job_id, batch_id, rollover_time)
    end
  end


  def send_rollover_notifications(results)
    # Group by job manager
    manager_notifications = results.group_by { |r| Job.find(r[:job_id]).manager }

    manager_notifications.each do |manager, job_results|
      next unless manager

      total_tasks_moved = job_results.sum { |r| r[:changes][:tasks_moved].size }
      total_deps_deleted = job_results.sum { |r| r[:changes][:dependencies_deleted].size }

      Notification.create!(
        user: manager,
        notification_type: 'rollover_summary',
        title: 'Overnight Schedule Rollover',
        message: "#{total_tasks_moved} tasks moved, #{total_deps_deleted} dependencies deleted across #{job_results.size} jobs",
        data: { results: job_results }
      )
    end
  end
end
```

### 6.2 Rollover Scheduling (Cron)

```ruby
# config/schedule.rb (using whenever gem)

set :output, 'log/cron.log'

every 1.day, at: '12:00 am' do
  runner "ScheduleRolloverJob.perform_now"
end

# Or using sidekiq-cron
# config/initializers/sidekiq.rb

Sidekiq::Cron::Job.create(
  name: 'Schedule Rollover - midnight',
  cron: '0 0 * * *',  # Every day at midnight
  class: 'ScheduleRolloverJob'
)
```

### 6.3 Rollover Retry Logic

```ruby
# backend/app/jobs/rollover_retry_job.rb

class RolloverRetryJob < ApplicationJob
  queue_as :critical

  # Runs every hour
  def perform
    last_successful = RolloverAuditLog.maximum(:rollover_timestamp)

    if last_successful.nil? || last_successful < 24.hours.ago
      Rails.logger.warn("⚠️ Rollover hasn't run in 24 hours, executing catchup")
      ScheduleRolloverJob.perform_now
    else
      Rails.logger.info("✓ Rollover is up to date (last run: #{last_successful})")
    end
  end
end

# Schedule hourly retry check
Sidekiq::Cron::Job.create(
  name: 'Rollover Retry Check - hourly',
  cron: '0 * * * *',  # Every hour
  class: 'RolloverRetryJob'
)
```

### 6.4 Frontend Rollover Check

```javascript
// src/hooks/useRolloverCheck.js

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../api'

export function useRolloverCheck(jobId) {
  const { data: job } = useQuery(['job', jobId], () => api.get(`/api/v1/jobs/${jobId}`))

  // Check if any tasks are in the past
  const hasPastTasks = useMemo(() => {
    if (!job) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return job.schedule_tasks.some(task => {
      const taskDate = new Date(task.start_date)
      return taskDate < today && task.status !== 'completed'
    })
  }, [job])

  // Trigger rollover for this job
  const triggerRollover = useMutation(() =>
    api.post(`/api/v1/jobs/${jobId}/rollover`)
  )

  // Auto-trigger on mount if past tasks found
  useEffect(() => {
    if (hasPastTasks && !triggerRollover.isLoading) {
      console.log('🔄 Past tasks detected, triggering rollover...')
      triggerRollover.mutate()
    }
  }, [hasPastTasks])

  return {
    hasPastTasks,
    triggerRollover,
    isRolling: triggerRollover.isLoading
  }
}


// Usage in GanttView
export function GanttView({ jobId }) {
  const { hasPastTasks, isRolling } = useRolloverCheck(jobId)

  if (isRolling) {
    return <LoadingSpinner message="Rolling schedule forward..." />
  }

  return <Gantt jobId={jobId} />
}
```

---

## 7. SUPPLIER WORKFLOW INTEGRATION

### 7.1 Cascade Conflict Modal (React)

```javascript
// src/components/gantt/modals/CascadeConflictModal.jsx

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

export function CascadeConflictModal({ conflicts, onClose, onResolve }) {
  const [resolutions, setResolutions] = useState({})
  // { taskId: 'delete_dependency' | 'unsupplier_confirm' }

  const [previewMode, setPreviewMode] = useState(true)

  const applyCascade = useMutation((resolutions) =>
    api.post('/api/v1/schedule_tasks/cascade', resolutions)
  )

  const handleToggle = (taskId, option) => {
    setResolutions(prev => ({
      ...prev,
      [taskId]: prev[taskId] === option ? null : option
    }))
  }

  const handleApply = async () => {
    const deleteIds = Object.entries(resolutions)
      .filter(([_, action]) => action === 'delete_dependency')
      .map(([taskId]) => parseInt(taskId))

    const unsupplierConfirmIds = Object.entries(resolutions)
      .filter(([_, action]) => action === 'unsupplier_confirm')
      .map(([taskId]) => parseInt(taskId))

    await applyCascade.mutateAsync({
      delete_dependencies: deleteIds,
      unsupplier_confirm: unsupplierConfirmIds
    })

    onResolve()
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <h2 className="text-2xl font-bold mb-4">
        Cascade Conflicts Detected
      </h2>

      <p className="mb-6 text-gray-600">
        The following tasks are supplier confirmed and would be moved by cascade.
        Choose how to resolve each conflict:
      </p>

      <div className="space-y-4 mb-6">
        {conflicts.map(conflict => (
          <ConflictCard
            key={conflict.task.id}
            conflict={conflict}
            resolution={resolutions[conflict.task.id]}
            onToggle={(option) => handleToggle(conflict.task.id, option)}
            previewMode={previewMode}
          />
        ))}
      </div>

      {previewMode && (
        <CascadePreview
          conflicts={conflicts}
          resolutions={resolutions}
        />
      )}

      <div className="flex justify-between items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={previewMode}
            onChange={(e) => setPreviewMode(e.target.checked)}
          />
          <span className="ml-2">Show preview</span>
        </label>

        <div className="space-x-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="btn-primary"
            disabled={Object.keys(resolutions).length === 0}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </Modal>
  )
}


function ConflictCard({ conflict, resolution, onToggle, previewMode }) {
  const { task, blocker } = conflict

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{task.name}</h3>
          <p className="text-sm text-gray-600">
            Current: {task.start_date} → New: {task.new_start_date}
          </p>
          <p className="text-sm text-orange-600">
            {blocker === 'supplier_confirmed' &&
              `Supplier: ${task.supplier_name} (confirmed)`
            }
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={resolution === 'delete_dependency'}
            onChange={() => onToggle('delete_dependency')}
          />
          <div className="ml-3">
            <div className="font-medium">Delete Dependency</div>
            <div className="text-sm text-gray-600">
              Task stays at {task.start_date}, no longer depends on predecessor
            </div>
          </div>
        </label>

        <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={resolution === 'unsupplier_confirm'}
            onChange={() => onToggle('unsupplier_confirm')}
          />
          <div className="ml-3">
            <div className="font-medium">Remove Supplier Confirmation</div>
            <div className="text-sm text-gray-600">
              Task moves to {task.new_start_date}, supplier will be notified
            </div>
          </div>
        </label>
      </div>

      {previewMode && resolution && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
          <strong>Preview:</strong> {getPreviewText(task, resolution)}
        </div>
      )}
    </div>
  )
}


function CascadePreview({ conflicts, resolutions }) {
  // Visual timeline showing before/after
  // ... implementation
}
```

---

## 8. TASK SPAWNING SYSTEM

### 8.1 Task Completion Handler (Backend)

```ruby
# backend/app/services/task_completion_service.rb

class TaskCompletionService
  def initialize(task, params = {})
    @task = task
    @passed = params[:passed]
    @photos = params[:photos] || []
    @checklist_data = params[:checklist_data]
    @completed_by = params[:current_user]
  end

  def execute
    result = {
      task: nil,
      spawned_tasks: [],
      checklist_report_url: nil,
      dependencies_dropped: []
    }

    ActiveRecord::Base.transaction do
      # 1. Mark task complete
      @task.update!(
        status: 'completed',
        completed_at: Time.current,
        passed: @passed
      )
      result[:task] = @task

      # 2. Handle pass/fail inspections
      if @task.pass_fail_enabled? && @passed == false
        retry_task = spawn_inspection_retry
        result[:spawned_tasks] << retry_task
      end

      # 3. Spawn office tasks
      if @task.spawn_office_tasks.present?
        office_tasks = spawn_office_tasks
        result[:spawned_tasks] += office_tasks
      end

      # 4. Handle photos
      if @task.spawn_photo_task? && @photos.any?
        attach_photos(@photos)
      end

      # 5. Handle checklist
      if @task.checklist_id.present? && @checklist_data.present?
        complete_checklist(@checklist_data)
        result[:checklist_report_url] = generate_checklist_report
      end

      # 6. Drop all dependencies (completed tasks)
      dropped = drop_all_dependencies
      result[:dependencies_dropped] = dropped

      # 7. Log task spawning
      log_spawned_tasks(result[:spawned_tasks])
    end

    result
  end


  private

  def spawn_inspection_retry
    # Count existing retries
    retry_number = @task.job.schedule_tasks
      .where("name LIKE ?", "#{@task.name}%")
      .count

    # Create retry task
    retry_task = @task.dup
    retry_task.name = "#{@task.name} #{retry_number}"
    retry_task.status = 'not_started'
    retry_task.start_date = nil  # User sets manually
    retry_task.end_date = nil
    retry_task.completed_at = nil
    retry_task.passed = nil
    retry_task.save!

    # Log spawn
    TaskSpawnLog.create!(
      parent_task_id: @task.id,
      spawned_task_id: retry_task.id,
      spawn_type: 'inspection_retry',
      spawn_trigger: 'inspection_fail',
      spawned_by: @completed_by.id
    )

    retry_task
  end


  def spawn_office_tasks
    @task.spawn_office_tasks.map do |config|
      office_task = ScheduleTask.create!(
        job_id: @task.job_id,
        name: config['name'],
        assigned_user_id: User.find_by(role: config['assigned_role'])&.id,
        start_date: @task.completed_at.to_date + config['due_days_offset'].days,
        end_date: @task.completed_at.to_date + config['due_days_offset'].days,
        duration_days: 1,
        status: 'not_started',
        trade: 'office'
      )

      TaskSpawnLog.create!(
        parent_task_id: @task.id,
        spawned_task_id: office_task.id,
        spawn_type: 'office',
        spawn_trigger: 'parent_complete',
        spawned_by: @completed_by.id
      )

      office_task
    end
  end


  def attach_photos(photos)
    photos.each do |photo_data|
      @task.photos.attach(
        io: photo_data[:file],
        filename: photo_data[:filename],
        content_type: photo_data[:content_type]
      )
    end
  end


  def complete_checklist(checklist_data)
    checklist = @task.checklist

    checklist_data['items'].each do |item_data|
      item = checklist.items.find(item_data['id'])
      item.update!(
        checked: item_data['checked'],
        notes: item_data['notes'],
        completed_at: Time.current,
        completed_by_id: @completed_by.id
      )
    end
  end


  def generate_checklist_report
    # Generate PDF report
    report = ChecklistReportGenerator.new(@task.checklist).generate

    # Upload to storage
    uploaded = CloudinaryService.upload(report, folder: "checklists/#{@task.job_id}")

    uploaded.url
  end


  def drop_all_dependencies
    dropped = []

    # Drop as predecessor (successors no longer depend on this)
    pred_deps = TaskDependency.where(predecessor_task_id: @task.id, active: true)
    pred_deps.update_all(
      active: false,
      deleted_at: Time.current,
      deleted_reason: 'task_completed'
    )
    dropped += pred_deps.ids

    # Drop as successor (this no longer depends on predecessors)
    succ_deps = TaskDependency.where(successor_task_id: @task.id, active: true)
    succ_deps.update_all(
      active: false,
      deleted_at: Time.current,
      deleted_reason: 'task_completed'
    )
    dropped += succ_deps.ids

    dropped
  end


  def log_spawned_tasks(spawned_tasks)
    Rails.logger.info("Task #{@task.id} completed, spawned #{spawned_tasks.size} tasks")
    spawned_tasks.each do |spawned|
      Rails.logger.info("  - #{spawned.name} (#{spawned.id})")
    end
  end
end
```

---

## 9. WORKING DRAWINGS AI SYSTEM

### 9.1 PDF Upload & Page Separation

```ruby
# backend/app/services/working_drawings_processor_service.rb

class WorkingDrawingsProcessorService
  def initialize(task, pdf_file)
    @task = task
    @pdf_file = pdf_file
  end

  def execute
    result = {
      full_document_url: nil,
      pages: []
    }

    # 1. Upload full PDF
    full_doc = upload_full_document
    result[:full_document_url] = full_doc.url

    # 2. Split into pages
    pages = split_pdf_into_pages

    # 3. Process each page with AI
    result[:pages] = pages.map.with_index do |page_data, index|
      process_page(page_data, index + 1)
    end

    result
  end


  private

  def upload_full_document
    CloudinaryService.upload(
      @pdf_file,
      folder: "working_drawings/#{@task.job_id}",
      resource_type: 'auto'
    )
  end


  def split_pdf_into_pages
    require 'pdf-reader'
    require 'mini_magick'

    pdf = PDF::Reader.new(@pdf_file)
    pages = []

    pdf.pages.each_with_index do |page, index|
      # Convert PDF page to image
      image = MiniMagick::Image.open(@pdf_file) do |convert|
        convert.density(300)
        convert << "#{@pdf_file.path}[#{index}]"
        convert << "page_#{index}.png"
      end

      pages << {
        number: index + 1,
        image: image,
        base64: Base64.encode64(image.to_blob)
      }
    end

    pages
  end


  def process_page(page_data, page_number)
    # Upload page image
    page_upload = CloudinaryService.upload(
      page_data[:image].path,
      folder: "working_drawings/#{@task.job_id}/pages",
      public_id: "page_#{page_number}"
    )

    # AI categorization
    category_result = categorize_with_ai(page_data[:base64])

    # Create database record
    WorkingDrawingPage.create!(
      task_id: @task.id,
      page_number: page_number,
      image_url: page_upload.url,
      category: category_result[:category],
      ai_confidence: category_result[:confidence]
    )
  end


  def categorize_with_ai(base64_image)
    client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])

    prompt = <<~PROMPT
      Analyze this architectural plan page and categorize it.

      Return ONLY a JSON object with this exact format:
      {
        "category": "one_of_the_categories_below",
        "confidence": 0.95
      }

      Valid categories:
      - site_plan
      - ground_floor_plan
      - first_floor_plan
      - second_floor_plan
      - roof_plan
      - elevation_north
      - elevation_south
      - elevation_east
      - elevation_west
      - section_a
      - section_b
      - electrical_plan
      - plumbing_plan
      - hvac_plan
      - structural_plan
      - detail_window
      - detail_door
      - detail_stair
      - detail_other
      - unknown
    PROMPT

    response = client.chat(
      parameters: {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: "data:image/png;base64,#{base64_image}" }
              }
            ]
          }
        ],
        max_tokens: 100
      }
    )

    content = response.dig("choices", 0, "message", "content")
    JSON.parse(content).symbolize_keys

  rescue => e
    Rails.logger.error("AI categorization failed: #{e.message}")
    { category: 'unknown', confidence: 0.0 }
  end
end
```

### 9.2 Trade-Based Auto-Selection

```ruby
# backend/app/services/po_document_batch_service.rb

class PoDocumentBatchService
  TRADE_PLAN_REQUIREMENTS = {
    'carpenter' => [
      'ground_floor_plan',
      'first_floor_plan',
      'second_floor_plan',
      'roof_plan',
      'elevation_north',
      'elevation_south',
      'elevation_east',
      'elevation_west',
      'section_a',
      'section_b'
    ],
    'electrician' => [
      'electrical_plan',
      'ground_floor_plan',
      'first_floor_plan'
    ],
    'plumber' => [
      'plumbing_plan',
      'ground_floor_plan',
      'first_floor_plan'
    ],
    'hvac' => [
      'hvac_plan',
      'ground_floor_plan',
      'first_floor_plan',
      'roof_plan'
    ],
    'roofer' => [
      'roof_plan',
      'elevation_north',
      'elevation_south',
      'elevation_east',
      'elevation_west'
    ]
  }

  def initialize(job_id, trade, supplier_id)
    @job = Job.find(job_id)
    @trade = trade
    @supplier_id = supplier_id
  end

  def execute
    # 1. Find all POs for this trade + supplier
    pos = @job.purchase_orders
      .joins(:schedule_task)
      .where(schedule_tasks: { trade: @trade })
      .where(supplier_id: @supplier_id)

    # 2. Get required plan categories for this trade
    required_categories = TRADE_PLAN_REQUIREMENTS[@trade] || []

    # 3. Find matching working drawing pages
    drawing_pages = WorkingDrawingPage
      .joins(:task)
      .where(tasks: { job_id: @job.id })
      .where(category: required_categories)
      .order(:page_number)

    # 4. Create package
    package = {
      supplier_id: @supplier_id,
      supplier_name: Supplier.find(@supplier_id).name,
      trade: @trade,
      pos: pos.map { |po| serialize_po(po) },
      documents: drawing_pages.map { |page| serialize_page(page) },
      supplier_portal_link: generate_portal_link
    }

    # 5. Send to supplier
    send_package_to_supplier(package)

    package
  end


  private

  def generate_portal_link
    token = JWT.encode(
      {
        supplier_id: @supplier_id,
        job_id: @job.id,
        exp: 7.days.from_now.to_i
      },
      Rails.application.credentials.secret_key_base
    )

    "#{ENV['SUPPLIER_PORTAL_URL']}/packages/#{token}"
  end


  def send_package_to_supplier(package)
    SupplierMailer.document_package(package).deliver_later
  end


  def serialize_po(po)
    {
      id: po.id,
      po_number: po.po_number,
      task_name: po.schedule_task.name,
      amount: po.total_amount,
      due_date: po.schedule_task.start_date
    }
  end


  def serialize_page(page)
    {
      id: page.id,
      page_number: page.page_number,
      category: page.category,
      image_url: page.image_url
    }
  end
end
```

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Core infrastructure + Basic UI

**Tasks:**
- [ ] Database migrations (schedule_tasks, task_dependencies, rollover_audit_log, task_spawn_log)
- [ ] Core API endpoints (CRUD tasks, list, create, update, delete)
- [ ] Working days/holidays service
- [ ] Basic Gantt UI (DHTMLX wrapper or skeleton)
- [ ] Task list with columns
- [ ] Simple drag-to-move (no cascade)
- [ ] Column configuration (show/hide)

**Deliverable:** Can view schedule and manually move tasks

---

### Phase 2: Dependencies & Cascade (Weeks 3-4)
**Goal:** Full dependency engine

**Tasks:**
- [ ] Dependency CRUD API (all 4 types: FS, SS, FF, SF)
- [ ] Lag time support (positive & negative)
- [ ] Cascade algorithm implementation
- [ ] Working days calculation in cascade
- [ ] Cross-job dependency support
- [ ] Cascade preview endpoint
- [ ] Undo/redo stack implementation
- [ ] Dependency editor modal

**Deliverable:** Tasks auto-cascade when moved, respecting all dependency types

---

### Phase 3: Supplier Workflow (Week 5)
**Goal:** Complete supplier confirmation workflow

**Tasks:**
- [ ] Confirm request API + UI button
- [ ] Supplier portal integration
- [ ] Supplier confirm endpoint
- [ ] Cascade conflict detection
- [ ] Cascade conflict modal (checkboxes, preview)
- [ ] Checkered status visual (moved_after_confirm)
- [ ] In-app notifications

**Deliverable:** Full supplier confirmation with cascade resolution

---

### Phase 4: Rollover Automation (Week 6)
**Goal:** Automated midnight rollover

**Tasks:**
- [ ] Rollover job implementation (Ruby)
- [ ] Parallel/sequential job processing
- [ ] Auto-delete dependencies logic
- [ ] Rollover audit logging
- [ ] Cron scheduling (midnight in company timezone)
- [ ] Retry mechanism (hourly check)
- [ ] Frontend rollover check on page load
- [ ] Rollover audit report UI

**Deliverable:** Tasks automatically roll forward at midnight

---

### Phase 5: Task Spawning (Week 7)
**Goal:** Photo, scan, inspection, office task spawning

**Tasks:**
- [ ] Task completion service (backend)
- [ ] Photo/scan task spawning
- [ ] Pass/fail inspection retry
- [ ] Office task spawning
- [ ] Checklist integration
- [ ] Task spawn log
- [ ] Mobile photo capture
- [ ] Photo attachment storage (Cloudinary/S3)

**Deliverable:** Tasks spawn automatically based on completion triggers

---

### Phase 6: Advanced Features (Weeks 8-9)
**Goal:** Views, filters, exports, mobile

**Tasks:**
- [ ] View modes (hierarchy, supplier, trade, flat)
- [ ] View selector UI
- [ ] Search & filter panel
- [ ] Column resizing & persistence
- [ ] Export to PDF
- [ ] Export to Excel
- [ ] Export to PNG/JPG
- [ ] Mobile responsive layout
- [ ] Touch drag optimization
- [ ] Mobile modal/drawer patterns
- [ ] Order time / Call time reminders

**Deliverable:** Full-featured Gantt with mobile support

---

### Phase 7: AI & Integrations (Week 10)
**Goal:** Working drawings AI + PO batching

**Tasks:**
- [ ] PDF upload endpoint
- [ ] PDF page separation service
- [ ] OpenAI Vision API integration
- [ ] AI plan categorization
- [ ] Trade plan requirements config
- [ ] PO document batching service
- [ ] Supplier portal package generation
- [ ] Linked requirements column
- [ ] Working drawings viewer UI

**Deliverable:** AI-powered document management

---

### Phase 8: Polish & Performance (Weeks 11-12)
**Goal:** Production-ready system

**Tasks:**
- [ ] Virtualization/lazy loading (100-500 tasks)
- [ ] Real-time collaboration (WebSockets for view-only)
- [ ] Role-based permissions enforcement
- [ ] Performance testing & optimization
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] User acceptance testing
- [ ] Documentation (user manual, admin guide)
- [ ] Trinity documentation (Bible, Teacher, Lexicon)
- [ ] Deployment & monitoring setup

**Deliverable:** Production-ready Gantt chart system

---

## 11. TECHNOLOGY STACK RECOMMENDATIONS

### Backend
- **Framework:** Ruby on Rails 7.x
- **Database:** PostgreSQL 14+ (JSONB support)
- **Background Jobs:** Solid Queue (simpler) or Sidekiq (more features)
- **Caching:** Redis (for session, cache, job queue)
- **File Storage:** Cloudinary or AWS S3 (user-configurable)
- **AI Services:** OpenAI API (GPT-4 Vision)
- **PDF Processing:** pdf-reader gem + MiniMagick

### Frontend
- **Framework:** React 18.x
- **State Management:** Zustand (recommended) or React Context
- **Gantt Library (Phase 1-8):** DHTMLX Gantt
  - Evaluate free version first
  - Purchase PRO ($699) if needed
  - **Phase 9+:** Build custom with Tailwind (future)
- **Styling:** Tailwind CSS 3.x
- **Data Fetching:** TanStack Query (React Query)
- **Real-time:** Action Cable (Rails WebSockets)
- **Forms:** React Hook Form
- **Date Utilities:** date-fns (tree-shakeable)
- **File Upload:** React Dropzone
- **Drag & Drop:** @dnd-kit/core (custom Gantt later)

### Infrastructure
- **Hosting:** Heroku or AWS
- **Cron:** Heroku Scheduler or Sidekiq-Cron
- **Monitoring:** Sentry (user already has)
- **Logging:** Lograge + Papertrail
- **CI/CD:** GitHub Actions

---

## 12. KEY DESIGN DECISIONS

### 12.1 DHTMLX First, Custom Later
**Decision:** Use DHTMLX Gantt initially, build custom Tailwind version later

**Rationale:**
- **Speed:** 2 weeks vs 12 weeks to market
- **Risk:** Proven library vs custom unknowns
- **Focus:** Build unique features (rollover, supplier workflow) not Gantt basics
- **Flexibility:** Can replace later without changing data model or API
- **Cost:** $699 one-time vs $30K-$50K custom development

### 12.2 Separate task_dependencies Table
**Decision:** Dependencies in separate table, not JSONB in schedule_tasks

**Rationale:**
- **Query performance:** Indexed lookups for cascade algorithm
- **Soft delete:** Track when dependencies deleted (rollover audit)
- **Audit trail:** Who created, when, why deleted
- **Flexibility:** Easy to add fields (lag_days, type, etc.)

### 12.3 No Circular Dependency Validation
**Decision:** Allow circular dependencies (A→B→C→A)

**Rationale:**
- **User requirement:** Real construction has legitimate circular patterns
- **Performance:** Cascade algorithm detects cycles, stops after max depth
- **User responsibility:** Trust users to create sensible schedules

### 12.4 Auto-Delete Dependencies in Rollover
**Decision:** Rollover automatically deletes blocking dependencies

**Rationale:**
- **No user at midnight:** Can't show modal asking for decision
- **Always forward:** Rule #1 is "no tasks in the past"
- **Full audit:** All deletions logged with reason
- **Recoverable:** Users can manually recreate if needed

### 12.5 Completed Tasks Drop All Dependencies
**Decision:** When task completes, all dependencies (pred + succ) become inactive

**Rationale:**
- **Historical record:** Completed tasks are done, immutable
- **Performance:** Don't cascade through completed tasks
- **Clean cascade:** Successors don't wait for completed tasks

### 12.6 Started Tasks Drop Predecessor Dependencies Only
**Decision:** Started tasks drop predecessor deps, keep successor deps

**Rationale:**
- **Already begun:** Don't care what came before (work started)
- **Still matters:** Successors still depend on when this finishes
- **Flexibility:** Allow early starts without breaking downstream

---

## NEXT STEPS

1. **Review & Approval:** Get stakeholder sign-off on this plan
2. **Environment Setup:** Rails app, React setup, DB migrations
3. **Phase 1 Kickoff:** Begin foundation work (Weeks 1-2)
4. **Weekly Reviews:** Check progress, adjust timeline as needed
5. **Documentation:** Update Trinity (Bible, Teacher, Lexicon) as we build

---

**Questions? Changes? Let's discuss before starting Phase 1!**
