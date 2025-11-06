# Trapid Task Management - Quick Reference Guide

## Two Task Systems

### 1. ProjectTask - Master Schedule (Detailed Planning)
- **Used For:** Internal project planning with dependencies and critical path
- **Main Fields:** status, progress_percentage, planned/actual dates, assigned_to_id
- **Key Feature:** Task dependencies with 4 relationship types
- **User Assignment:** Yes, to individual User objects
- **Database:** `project_tasks` table

### 2. ScheduleTask - Supplier Schedule (Delivery Tracking)
- **Used For:** Tracking supplier deliveries and matching to purchase orders
- **Main Fields:** title, status, start_date, complete_date, supplier_name
- **Key Feature:** Link to purchase orders for delivery timing
- **User Assignment:** No (tracks supplier info instead)
- **Database:** `schedule_tasks` table

---

## Key Models & Files

```
Models:
  ProjectTask          → /backend/app/models/project_task.rb
  ScheduleTask         → /backend/app/models/schedule_task.rb
  TaskTemplate         → /backend/app/models/task_template.rb
  TaskDependency       → /backend/app/models/task_dependency.rb
  TaskUpdate           → /backend/app/models/task_update.rb
  Project              → /backend/app/models/project.rb
  Construction         → /backend/app/models/construction.rb
  User                 → /backend/app/models/user.rb

Controllers:
  ProjectTasksController   → /backend/app/controllers/api/v1/project_tasks_controller.rb
  ScheduleTasksController  → /backend/app/controllers/api/v1/schedule_tasks_controller.rb
  ProjectsController       → /backend/app/controllers/api/v1/projects_controller.rb

Services:
  Schedule::GeneratorService → /backend/app/services/schedule/generator_service.rb

Frontend Pages:
  MasterSchedulePage       → /frontend/src/pages/MasterSchedulePage.jsx
  JobDetailPage            → /frontend/src/pages/JobDetailPage.jsx

Frontend Components:
  GanttChart               → /frontend/src/components/gantt/GanttChart.jsx
  TaskTable                → /frontend/src/components/gantt/TaskTable.jsx
  ScheduleMasterTab        → /frontend/src/components/schedule-master/ScheduleMasterTab.jsx
```

---

## API Endpoints

### Task Management
```
GET    /api/v1/projects/:project_id/tasks                 - List all tasks
POST   /api/v1/projects/:project_id/tasks                 - Create task
GET    /api/v1/projects/:project_id/tasks/:id             - Get task
PATCH  /api/v1/projects/:project_id/tasks/:id             - Update task
DELETE /api/v1/projects/:project_id/tasks/:id             - Delete task
GET    /api/v1/projects/:id/gantt                         - Get Gantt data
```

### Schedule Tasks
```
GET    /api/v1/constructions/:id/schedule_tasks           - List schedule tasks
POST   /api/v1/constructions/:id/schedule_tasks/import    - Import from Excel
GET    /api/v1/constructions/:id/schedule_tasks/gantt_data - Get Gantt view
PATCH  /api/v1/schedule_tasks/:id/match_po                - Link to PO
DELETE /api/v1/schedule_tasks/:id/unmatch_po              - Unlink from PO
```

---

## Task Status States

```
not_started  → Initial state (default)
in_progress  → Task has started
complete     → Task finished
on_hold      → Paused/blocked
```

---

## Task Properties

| Property | Type | Usage |
|----------|------|-------|
| name | string | Task title |
| status | enum | Current state |
| progress_percentage | 0-100 | Completion % |
| planned_start_date | date | Scheduled start |
| planned_end_date | date | Scheduled end |
| actual_start_date | date | When work started |
| actual_end_date | date | When work completed |
| duration_days | integer | Task length in days |
| is_milestone | boolean | Mark important milestone |
| is_critical_path | boolean | On longest path |
| assigned_to_id | foreign key | User assignment |
| supplier_name | string | External supplier |
| purchase_order_id | foreign key | Linked PO |

---

## User Assignment (Current Limitation)

Frontend uses hardcoded team members:
```javascript
[
  'Rob Harder',
  'Andrew Clement',
  'Sam Harder',
  'Sophie Harder',
  'Jake Baird'
]
```

**Problem:** Not dynamically fetched from database
**Solution Needed:** Create `/api/v1/users` endpoint

---

## Dependency Types

```
finish_to_start (FS)  → Task A finishes, Task B starts (default)
start_to_start (SS)   → Task A starts, Task B starts
finish_to_finish (FF) → Task A finishes, Task B finishes
start_to_finish (SF)  → Task A starts, Task B finishes (rare)
```

All support optional lag_days for overlap.

---

## Gantt Chart Features

**Zoom Levels:**
- Day view: 40px per day
- Week view: 6px per day
- Month view: 2px per day

**Color By:**
- Status (not_started=gray, in_progress=blue, complete=green)
- Category (CONCRETE, CARPENTER, ELECTRICAL, etc.)
- Type (DO, ORDER, GET, CLAIM, etc.)

**Navigation:**
- Previous/Next period buttons
- "Today" button
- Date range customizable

---

## Data Flow

```
User creates/imports tasks
        ↓
ProjectTask or ScheduleTask created
        ↓
Dependencies established
        ↓
Schedule::GeneratorService runs (for ProjectTasks)
        ↓
Timeline calculated (forward pass)
        ↓
Critical path identified
        ↓
Gantt chart displays tasks & bars
        ↓
User updates status/progress
        ↓
TaskUpdate record created (history)
```

---

## Common Operations

### Create a Task
```bash
POST /api/v1/projects/:project_id/tasks
{
  "project_task": {
    "name": "Pour Concrete",
    "task_type": "DO",
    "category": "CONCRETE",
    "duration_days": 5,
    "assigned_to_id": 1
  }
}
```

### Update Task Progress
```bash
PATCH /api/v1/projects/:project_id/tasks/:id
{
  "project_task": {
    "status": "in_progress",
    "progress_percentage": 50
  }
}
```

### Link Task to Purchase Order
```bash
PATCH /api/v1/projects/:project_id/tasks/:id
{
  "project_task": {
    "purchase_order_id": 42,
    "required_on_site_date": "2025-01-20"
  }
}
```

### Import Schedule from Excel
```bash
POST /api/v1/constructions/:id/schedule_tasks/import
Content-Type: multipart/form-data
file: <Excel file>
```

---

## What's Missing & Needs Work

### High Priority
- [ ] Dynamic user list (hardcoded → database)
- [ ] User roles/permissions
- [ ] Backward pass for accurate float calculation

### Medium Priority
- [ ] Task comments/discussions
- [ ] Change notifications
- [ ] Export to PDF/PNG
- [ ] Resource workload tracking

### Nice to Have
- [ ] Mobile support
- [ ] Real-time WebSocket sync
- [ ] Multi-project portfolios
- [ ] Risk management integration

---

## Performance Notes

- Project progress cached for 5 minutes
- Gantt data includes all task relationships
- ScheduleTask import processes row-by-row (can slow with 1000+ rows)
- No pagination on task lists (could be issue at scale)

---

## Testing Checklist

- [ ] Create task with all fields
- [ ] Update task status (all 4 states)
- [ ] Assign/unassign user
- [ ] Create dependency between tasks
- [ ] Verify circular dependency prevention
- [ ] Import Excel schedule
- [ ] Match schedule task to PO
- [ ] View Gantt chart at different zoom levels
- [ ] Edit task in table view
- [ ] Sort table columns
- [ ] Verify critical path calculation
- [ ] Check materials_status (on_time/delayed)

---

## Database Indexes

Task-related indexes for performance:
- project_id, status
- planned_start_date, planned_end_date
- is_critical_path
- construction_id, matched_to_po

---

## Related Documentation

See `/Users/jakebaird/trapid/TASK_MANAGEMENT_ARCHITECTURE.md` for detailed investigation.

