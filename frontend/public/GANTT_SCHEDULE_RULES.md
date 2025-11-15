# Gantt & Schedule Master - The Bible (Development Rules)
**Version:** 2.2.1
**Last Updated:** November 15, 2025 at 5:22 PM AEST (Added reminder to ask if user forgets Bible reading)
**Status:** Production-ready with DHtmlx trial
**Authority Level:** ABSOLUTE - This is The Bible for all Gantt development
**File Locations:**
- Source: `/Users/rob/Projects/trapid/GANTT_SCHEDULE_RULES.md`
- Public: `/Users/rob/Projects/trapid/frontend/public/GANTT_SCHEDULE_RULES.md`

---

## 🔴 CRITICAL: Read This First

### This Document is "The Bible"
This file is the **absolute authority** for all Gantt and Schedule Master development.

**This Bible Contains RULES ONLY:**
- ✅ MUST do this
- ❌ NEVER do that
- ✅ ALWAYS check X before Y
- Configuration values that must match
- Protected code patterns

**For KNOWLEDGE (how things work, bug history, why we chose X):**
- 📕 See GANTT_BUGS_AND_FIXES.md (Bug Hunter Lexicon)

**Rules for Claude Code (CC):**
- ✅ You MUST follow every rule in this document without exception
- ✅ You MUST read this file at the start of every session
- ✅ **After reading this file, respond with 👍 and WAIT for user confirmation before proceeding**
- ✅ **If user starts Gantt work without you reading the Bible first, politely ask: "Should I read the Gantt Bible first?"**
- ✅ You MUST update this file when discovering new rules
- ✅ You MUST add bug knowledge to Lexicon (GANTT_BUGS_AND_FIXES.md), NOT here
- ❌ You CANNOT change implementation approaches between sessions
- ❌ You CANNOT "optimize" or "simplify" code without explicit approval
- ❌ You CANNOT add explanations/knowledge to Bible (goes in Lexicon)

---

## RULE #0: Documentation Maintenance (READ THIS FIRST)

### The Two-Document System

This project uses exactly TWO documentation files:

1. **📖 GANTT_SCHEDULE_RULES.md** - "The Bible" (RULES ONLY)
2. **📕 GANTT_BUGS_AND_FIXES.md** - "Bug Hunter Lexicon" (KNOWLEDGE ONLY)

### RULE #0.1: Sorting Information - Bible vs Lexicon

✅ **When writing documentation, ask: "Is this a RULE or KNOWLEDGE?"**

**If it's a RULE (directive) → Goes in Bible:**
- ✅ "You MUST do X"
- ✅ "NEVER do Y"
- ✅ "ALWAYS check Z before W"
- ✅ Configuration values that must match
- ✅ Code patterns that must be followed
- ✅ Protected code that cannot be changed

**If it's KNOWLEDGE (explanation) → Goes in Lexicon:**
- ✅ "This is how X works"
- ✅ "We discovered Y after investigation"
- ✅ "Here's why we chose Z"
- ✅ Bug history and root causes
- ✅ Investigation timelines
- ✅ Architecture explanations
- ✅ Performance analysis

**Example:**
- ❌ WRONG: "The cascade service works by finding dependent tasks..." → This is KNOWLEDGE, goes in Lexicon
- ✅ RIGHT: "ALWAYS use cascade service for dependency calculations, NEVER implement in frontend" → This is a RULE, stays in Bible

### RULE #0.2: When to Update Bible

✅ **MUST update Bible when:**
1. Adding a new coding rule (MUST/NEVER/ALWAYS pattern)
2. Discovering a protected code pattern that must not be changed
3. Adding a new critical configuration value
4. Changing how Company Settings should be used
5. Adding a new "gotcha" that causes bugs if violated

❌ **DO NOT update Bible for:**
- Bug discoveries (goes in Lexicon)
- Investigation results (goes in Lexicon)
- Performance optimizations (goes in Lexicon unless it creates a new RULE)
- Architecture explanations (goes in Lexicon)

### RULE #0.3: When to Update Lexicon

✅ **MUST update Lexicon when:**
1. Discovering a new bug (create BUG-XXX entry)
2. Resolving an existing bug (update status to RESOLVED)
3. Adding architecture/background knowledge
4. Explaining WHY a rule exists
5. Documenting investigation timelines
6. Adding performance metrics (before/after)
7. Explaining how a system works (cascade, locks, etc)

### RULE #0.4: File Synchronization (CRITICAL)

When you update either Bible or Lexicon, you MUST sync to frontend/public/:

```bash
# After updating source files, ALWAYS run:
cp /Users/rob/Projects/trapid/GANTT_SCHEDULE_RULES.md \
   /Users/rob/Projects/trapid/frontend/public/GANTT_SCHEDULE_RULES.md

cp /Users/rob/Projects/trapid/GANTT_BUGS_AND_FIXES.md \
   /Users/rob/Projects/trapid/frontend/public/GANTT_BUGS_AND_FIXES.md
```

✅ **MUST sync after EVERY edit**
❌ **NEVER edit files directly in frontend/public/** (they get overwritten)

**Why:** The UI buttons read from `/frontend/public/`, not from project root.

### RULE #0.5: Version Numbers & Timestamps

✅ **ALWAYS update when editing:**

**In Bible (top of file):**
```markdown
**Version:** 2.0.0
**Last Updated:** 2025-11-15 at 4:15 PM AEST
```

**In Lexicon (top of file):**
```markdown
**Last Updated:** 2025-11-15 at 4:15 PM AEST
```

**Versioning scheme (Bible only):**
- **Major (X.0.0):** Breaking changes to rules, major restructuring
- **Minor (1.X.0):** New rules added, significant updates
- **Patch (1.0.X):** Typo fixes, clarifications, minor updates

### RULE #0.6: UI Button Configuration

The Schedule Master tab MUST have exactly 2 buttons:

**Button #1: Gantt Bible**
- **Label:** "📖 Gantt Bible"
- **Loads:** `/GANTT_SCHEDULE_RULES.md`
- **Component:** `GanttRulesModal.jsx`
- **Code location:** `frontend/src/components/schedule-master/GanttRulesModal.jsx:21`

```javascript
// MUST use this exact path:
const response = await fetch('/GANTT_SCHEDULE_RULES.md')
```

**Button #2: Bug Hunter**
- **Label:** "📕 Bug Hunter"
- **Loads:** `/GANTT_BUGS_AND_FIXES.md`
- **Component:** `GanttBugHunterModal.jsx`

```javascript
// MUST use this exact path:
const response = await fetch('/GANTT_BUGS_AND_FIXES.md')
```

❌ **NEVER point these buttons to any other files**
❌ **NEVER add a third button** (only 2 documents allowed)

### RULE #0.7: Copy to Clipboard Buttons

The "Copy Docs" dropdown MUST have exactly 2 options:

**Option #1: Copy Gantt Bible**
```javascript
const response = await fetch('/GANTT_SCHEDULE_RULES.md')
const text = await response.text()
await navigator.clipboard.writeText(text)
```

**Option #2: Copy Bug Hunter**
```javascript
const response = await fetch('/GANTT_BUGS_AND_FIXES.md')
const text = await response.text()
await navigator.clipboard.writeText(text)
```

### RULE #0.8: Testing After Updates

After updating either document, MUST verify:

```bash
# 1. Check files are synced
ls -lh /Users/rob/Projects/trapid/frontend/public/GANTT*.md

# 2. Check timestamps match
head -3 /Users/rob/Projects/trapid/GANTT_SCHEDULE_RULES.md
head -3 /Users/rob/Projects/trapid/frontend/public/GANTT_SCHEDULE_RULES.md

# 3. Test UI buttons in browser
# - Navigate to Settings → Schedule Master
# - Click "📖 Gantt Bible" → Should show updated content
# - Click "📕 Bug Hunter" → Should show updated content
# - Test "Copy Docs" dropdown → Both options should work
```

### RULE #0.9: New Bug Discovery Workflow

When a new bug is discovered:

**Step 1:** Investigate and fix the bug

**Step 2:** Determine if bug creates a new RULE
- If YES → Add RULE to Bible
- If NO → Just document in Lexicon

**Step 3:** Document in Lexicon (create BUG-XXX entry)

**Step 4:** Update timestamps and sync both files

### RULE #0.10: Quick Reference Decision Tree

```
Question: Where does this information go?

Is it a directive (MUST/NEVER/ALWAYS)?
  YES → 📖 Bible
  NO  → Continue...

Is it explaining HOW something works?
  YES → 📕 Lexicon
  NO  → Continue...

Is it a bug report or fix?
  YES → 📕 Lexicon
  NO  → Re-read the question, one of the above must apply
```

---

## 📖 Glossary: Terminology & Slang

**CRITICAL: Use this exact terminology when discussing Schedule Master**

✅ **MUST use these terms consistently:**

| Term | Full Name | Definition |
|------|-----------|------------|
| **SM** | Schedule Master | The entire scheduling system (table + gantt + settings) |
| **SMT** | Schedule Master Table | The 24-column table view on the left |
| **Gantt** | Gantt Chart | The timeline chart view on the right |
| **Task** | Task | A single row in SMT + its corresponding bar in Gantt |
| **Deps** | Dependencies | The arrows connecting tasks (predecessor relationships) |
| **Pred** | Predecessor | A task that must complete before another can start |
| **FS** | Finish-to-Start | Dependency: Task B starts when Task A finishes (most common) |
| **SS** | Start-to-Start | Dependency: Task B starts when Task A starts |
| **FF** | Finish-to-Finish | Dependency: Task B finishes when Task A finishes |
| **SF** | Start-to-Finish | Dependency: Task B finishes when Task A starts (rare) |
| **Lag** | Lag Days | Days of delay added to a dependency (+3 = wait 3 days) |
| **Cascade** | Cascade | Backend process that updates dependent tasks when predecessor changes |
| **Lock** | Lock | Prevents a task from being auto-cascaded (5 types: supplier_confirm, confirm, start, complete, manually_positioned) |
| **CC** | Claude Code | AI assistant (you!) |

❌ **NEVER use ambiguous terms:**
- Don't say "grid" (use SMT or Gantt specifically)
- Don't say "dependency type" (use FS/SS/FF/SF)
- Don't say "link" (use dependency or dep)
- Don't say "arrow" alone (use "dependency arrow" or "dep")

**Why this matters:**
- Consistent terminology prevents confusion between SMT (table) and Gantt (timeline)
- Using slang matches what user sees in UI
- Makes communication faster and clearer

---

## RULE #1: Predecessor ID Conversion

❌ **NEVER use sequence_order directly in predecessor lookups**
✅ **ALWAYS convert:** `predecessor_id = sequence_order + 1`

**Why:** Predecessor IDs are 1-based (1, 2, 3...) but sequence_order is 0-based (0, 1, 2...)

**Code locations:**
- Backend: `schedule_cascade_service.rb:88, 100`
- Backend: `schedule_template_rows_controller.rb:116, 122`

**Required implementation:**
```ruby
# Backend: Finding dependents
predecessor_id = predecessor_task.sequence_order + 1  # 0-based → 1-based
```

```javascript
// Frontend: Display task number
const taskNumber = task.sequence_order + 1  // Show as #1, #2, #3
```

**For detailed explanation, see:** Lexicon → "Architecture: Predecessor ID System"

---

## RULE #2: isLoadingData Lock Timing

❌ **NEVER reset isLoadingData in drag handler**
✅ **ALWAYS reset in useEffect with 500ms timeout**

**Code location:** `DHtmlxGanttView.jsx:1414-1438`

**Required implementation:**
```javascript
// In onAfterTaskDrag:
gantt.attachEvent('onAfterTaskDrag', (id, mode, event) => {
  isDragging.current = true
  isLoadingData.current = true  // Set immediately

  // ... handle drag ...

  isDragging.current = false
  // DO NOT reset isLoadingData here!
})

// In useEffect:
useEffect(() => {
  if (isDragging.current) return
  if (isLoadingData.current) return

  isLoadingData.current = true
  gantt.parse({ data: tasks, links: links })

  setTimeout(() => {
    isLoadingData.current = false
  }, 500)  // MUST be 500ms minimum
}, [tasks, ...])
```

**For bug history, see:** Lexicon → "BUG-001: Drag Flickering"

---

## RULE #3: Company Settings - Working Days

❌ **NEVER hardcode working days**
✅ **ALWAYS read from:** `company_settings.working_days`
✅ **ALWAYS respect:** Settings → Company → Working Days configuration

**Code location:** `backend/app/services/schedule_cascade_service.rb:175-192`

**Required implementation:**
```ruby
def working_day?(date)
  # MUST read from company settings
  working_days = @company_settings.working_days || default_config
  day_name = date.strftime('%A').downcase
  working_days[day_name] == true
end
```

**User configuration:**
- Location: Settings → Company → Working Days
- Checkboxes for Mon-Sun
- Default: Mon-Fri + Sunday = working, Saturday = non-working
- Changes apply immediately to all cascade calculations

**For architecture details, see:** Lexicon → "Architecture: Company Settings Integration"

---

## RULE #4: Lock Hierarchy

❌ **NEVER cascade to locked tasks**
✅ **ALWAYS check all 5 locks before cascade**

**Lock priority (highest to lowest):**
1. `supplier_confirm` - Supplier committed to date
2. `confirm` - Internally confirmed
3. `start` - Work has begun
4. `complete` - Work is done
5. `manually_positioned` - User manually dragged task

**Code location:** `backend/app/services/schedule_cascade_service.rb:153-160`

**Required implementation:**
```ruby
def task_is_locked?(task)
  task.supplier_confirm? ||
    task.confirm? ||
    task.start? ||
    task.complete? ||
    task.manually_positioned?
end

# In cascade:
next if task_is_locked?(dependent_task)
```

**For detailed explanation, see:** Lexicon → "Architecture: Lock Hierarchy System"

---

## RULE #5: Task Heights Configuration

❌ **NEVER have mismatched height values**
✅ **MUST set all three to same value:**

**Code location:** `DHtmlxGanttView.jsx:421-423`

**Required configuration:**
```javascript
gantt.config.row_height = 40
gantt.config.task_height = 40  // MUST match row_height
gantt.config.bar_height = 40   // MUST also match
```

**Consequence of violation:** Task bars offset from grid rows, click detection issues, dependency lines misaligned

---

## RULE #6: Auto-Scheduling

❌ **NEVER enable:** `gantt.config.auto_scheduling = true`
✅ **ALWAYS set:** `gantt.config.auto_scheduling = false`

**Code location:** `DHtmlxGanttView.jsx:635`

**Required configuration:**
```javascript
gantt.config.auto_scheduling = false  // Backend handles ALL cascade
```

**Why:** Backend cascade service handles ALL dependency calculations. Frontend auto-scheduling would conflict.

**For backend service details, see:** Lexicon → "Architecture: Backend Cascade Service"

---

## RULE #7: API Pattern - Single Update + Cascade Response

❌ **NEVER make multiple API calls for cascade updates**
✅ **ALWAYS use:** Single update + cascade response pattern

**Pattern:**
```javascript
// Send ONE update:
PATCH /api/v1/schedule_templates/:id/rows/:row_id
{
  schedule_template_row: {
    start_date: 5,
    duration: 3
  }
}

// Backend returns updated task + ALL cascaded tasks:
{
  task: { id: 1, start_date: 5, duration: 3, ... },
  cascaded_tasks: [
    { id: 2, start_date: 8, ... },
    { id: 3, start_date: 10, ... }
  ]
}
```

**Code location:** `DHtmlxGanttView.jsx:3366-3450`

**Why:** Prevents race conditions, single source of truth for cascade calculations

**For implementation details, see:** Lexicon → "Architecture: API Cascade Pattern"

---

## RULE #8: useRef Anti-Loop Flags

✅ **MUST use all 7 useRef flags correctly:**

| Flag | Purpose | Set When | Reset When |
|------|---------|----------|------------|
| `isDragging` | Prevent data reload during drag | onBeforeTaskDrag | onAfterTaskDrag (immediate) |
| `isLoadingData` | Suppress spurious drag events | useEffect + drag | useEffect timeout (500ms) |
| `isSaving` | Prevent infinite save loops | Before API call | After API completes |
| `suppressRender` | Block renders during drag | Drag start | Drag end |
| `manuallyPositionedTasks` | Track manually positioned tasks | Lock checkbox | Unlock checkbox |
| `pendingUnlocks` | Prevent re-locking during reload | Unlock action | After reload |
| `lastTasksSignature` | Prevent unnecessary reloads | useEffect | On data change |

**Code location:** `DHtmlxGanttView.jsx:37-46`

**For detailed usage, see:** Lexicon → "Architecture: useRef Flags System"

---

## RULE #9: Predecessor Format

❌ **NEVER save without predecessor_ids**
✅ **ALWAYS include predecessor_ids in every update**

**Required format:**
```javascript
{
  schedule_template_row: {
    start_date: 5,
    duration: 3,
    predecessor_ids: [
      { id: 1, type: "FS", lag: 0 },
      { id: 2, type: "SS", lag: 3 }
    ]  // MUST include this field
  }
}
```

**Dependency types:**
- `FS` - Finish-to-Start (most common)
- `SS` - Start-to-Start
- `FF` - Finish-to-Finish
- `SF` - Start-to-Finish

**Consequence of violation:** Omitting predecessor_ids causes them to be cleared from database

---

## RULE #10: Cascade Triggers

✅ **Only these fields trigger cascade:**
- `start_date` - Changes when task moved
- `duration` - Changes task end date

❌ **All other fields update WITHOUT cascade**

**Code location:** `backend/app/services/schedule_cascade_service.rb:52-57`

**Required implementation:**
```ruby
def cascade_needed?
  @changed_attributes.include?(:start_date) ||
    @changed_attributes.include?(:duration)
end
```

---

## RULE #11: Debounced Render Pattern

❌ **NEVER call gantt.render() directly**
✅ **ALWAYS use debounced render:**

**Code location:** `DHtmlxGanttView.jsx:353-362`

**Required implementation:**
```javascript
const renderTimeout = useRef(null)

const debouncedRender = (delay = 0) => {
  if (renderTimeout.current) {
    clearTimeout(renderTimeout.current)
  }
  renderTimeout.current = setTimeout(() => {
    if (ganttReady) gantt.render()
  }, delay)
}
```

**Why:** Direct gantt.render() causes 50-100ms lag per render. Debounce batches updates.

---

## RULE #12: Column Documentation - CC_UPDATE Table

❌ **NEVER change Schedule Master columns without updating CC_UPDATE table**
✅ **ALWAYS update NewFeaturesTab.jsx when column implementation changes**

**Documentation location:** `frontend/src/components/schedule-master/NewFeaturesTab.jsx`

**What is CC_UPDATE?**
The CC_UPDATE table tracks the implementation status and technical details for every column in the Schedule Master table. It serves as the living documentation for product owners and developers.

**Required updates when:**
- Adding a new column to Schedule Master
- Changing how a column works (frontend or backend)
- Modifying database fields related to a column
- Adding/removing event handlers for a column
- Changing validation rules for a column

**How to update:**

1. Navigate to Settings → Schedule Master → New Features tab
2. Find the column in the table
3. Click the "CC Update" cell to edit
4. Update the implementation details with this format:

```markdown
**Status:** [Fully functional ✅ | Partially implemented ⚠️ | Not implemented ❌]

**Frontend Implementation:**
- Location: [File path and line numbers]
- Rendering: [How it's displayed]
- Event handlers: [What handlers are attached]

**Backend:**
- Field: [Database field name(s)]
- Type: [Data type]
- Validation: [What validations exist]

**How It Works:**
[Plain English explanation of what this column does]

**Current Limitations:**
- [Known limitation 1]
- [Known limitation 2]
```

**UI Access:**
- Table available at: http://localhost:5173/settings?tab=schedule-master&subtab=new-features
- Data persisted in localStorage: `scheduleMaster_ccUpdates`
- Export function generates complete documentation file

**Why this matters:**
This table is the single source of truth for column implementation status. It helps:
- Product owners understand what's coded vs what's planned
- Developers know exactly where code lives
- Bug hunters identify what's actually implemented
- Future AI sessions understand the current state

**For column specifications, see:** `/frontend/public/GANTT_BIBLE_COLUMNS.md`

---

## RULE #13: Common Gotchas

### Gotcha #1: Saving Without Predecessors
```javascript
// ❌ WRONG:
await api.patch(`/rows/${task.id}`, {
  schedule_template_row: {
    start_date: 5
  }
})  // predecessor_ids will be cleared!

// ✅ CORRECT:
await api.patch(`/rows/${task.id}`, {
  schedule_template_row: {
    start_date: 5,
    predecessor_ids: task.predecessor_ids  // MUST include
  }
})
```

### Gotcha #2: Resetting isLoadingData Too Early
```javascript
// ❌ WRONG:
gantt.attachEvent('onAfterTaskDrag', (id) => {
  isLoadingData.current = true
  // ... handle drag ...
  isLoadingData.current = false  // TOO EARLY!
})

// ✅ CORRECT:
gantt.attachEvent('onAfterTaskDrag', (id) => {
  isLoadingData.current = true
  // ... handle drag ...
  // Let useEffect reset it after 500ms
})
```

### Gotcha #3: Ignoring Lock Checks
```javascript
// ❌ WRONG:
cascade_to_dependents(task)  // Cascades to ALL tasks

// ✅ CORRECT:
dependent_tasks.each do |task|
  next if task_is_locked?(task)  // Skip locked tasks
  cascade_to_dependents(task)
end
```

---

## 🔒 Protected Code Patterns - DO NOT MODIFY

These code patterns have been carefully tested. **DO NOT modify without explicit approval.**

### Protected Pattern #1: isLoadingData Lock in Drag Handler

**Location:** `DHtmlxGanttView.jsx:1414-1438`

✅ **MUST keep this exact implementation:**
```javascript
gantt.attachEvent('onAfterTaskDrag', (id, mode, event) => {
  isLoadingData.current = true  // Set IMMEDIATELY

  if (loadingDataTimeout.current) {
    clearTimeout(loadingDataTimeout.current)
  }

  loadingDataTimeout.current = setTimeout(() => {
    isLoadingData.current = false
  }, 5000)  // Extended for cascade
})
```

❌ **DO NOT change timeout value**
❌ **DO NOT reset isLoadingData synchronously**
❌ **DO NOT remove timeout clearing**

**For bug history, see:** Lexicon → "BUG-001: Drag Flickering (8 iterations to fix)"

### Protected Pattern #2: Backend Cascade Service

**Location:** `backend/app/services/schedule_cascade_service.rb`

✅ **MUST use update_column, NOT update:**
```ruby
dependent_task.update_column(:start_date, new_start_date)
```

❌ **NEVER use:** `dependent_task.update(start_date: new_start_date)`

**Why:** update() would trigger callbacks → infinite recursion

### Protected Pattern #3: Predecessor ID Conversion

**Location:** `backend/app/services/schedule_cascade_service.rb:95-96, 107-108`

✅ **MUST always convert:**
```ruby
predecessor_id = predecessor_task.sequence_order + 1
```

❌ **NEVER use sequence_order directly**

**For detailed explanation, see:** Lexicon → "BUG-003: Predecessor ID Off-by-One"

---

## 📋 Quick Checklist Before Committing

Before committing Gantt code changes, verify:

- [ ] Followed all RULES #1-13
- [ ] Did NOT modify Protected Code Patterns
- [ ] Included predecessor_ids in all updates
- [ ] Used isLoadingData lock correctly
- [ ] Read working days from company_settings
- [ ] Checked lock hierarchy before cascade
- [ ] Used single API call + cascade response
- [ ] Updated CC_UPDATE table if columns changed (RULE #12)
- [ ] Updated Bible if new RULE discovered
- [ ] Updated Lexicon if bug fixed
- [ ] Synced both files to frontend/public/
- [ ] Tested UI buttons still work

---

## 📚 For More Information

**Architecture & How Things Work:**
- 📕 See Lexicon → "Architecture" sections

**Bug History & Investigation:**
- 📕 See Lexicon → "BUG-XXX" entries

**Column Specifications:**
- 📦 See `/frontend/public/GANTT_BIBLE_COLUMNS.md` (Bible)
- 📋 See CC_UPDATE Table at Settings → Schedule Master → New Features tab (Living documentation)

**Why We Made Certain Decisions:**
- 📕 See Lexicon → "Design Decisions" section

---

**Last Updated:** November 15, 2025 at 5:22 PM AEST
**Maintained By:** Development Team
**Authority Level:** ABSOLUTE
