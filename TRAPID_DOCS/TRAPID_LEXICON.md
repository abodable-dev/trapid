# TRAPID LEXICON - Bug History & Knowledge Base

**Last Updated:** 2025-11-16
**Purpose:** Centralized knowledge of bugs, fixes, and lessons learned
**Audience:** Claude Code + Human Developers

---

## 🔍 What is the Lexicon?

This document contains **KNOWLEDGE**, not rules:
- ✅ Bug history and fixes
- ✅ Why we made certain decisions
- ✅ How systems work (architecture)
- ✅ Edge cases and gotchas
- ✅ Performance analysis

**For RULES (MUST/NEVER/ALWAYS):**
- 📖 See [TRAPID_BIBLE.md](TRAPID_BIBLE.md)

**For USER GUIDES:**
- 📘 See [TRAPID_USER_MANUAL.md](TRAPID_USER_MANUAL.md)

---

## Table of Contents

**Cross-Reference:**
- 📖 [Bible](TRAPID_BIBLE.md) - Rules & directives
- 📘 [User Manual](TRAPID_USER_MANUAL.md) - User guides

**Chapters:**
- [Chapter 0: System-Wide Knowledge](#chapter-0-system-wide-knowledge)
- [Chapter 1: Authentication & Users](#chapter-1-authentication--users)
- [Chapter 2: System Administration](#chapter-2-system-administration)
- [Chapter 3: Contacts & Relationships](#chapter-3-contacts--relationships)
- [Chapter 4: Price Books & Suppliers](#chapter-4-price-books--suppliers)
- [Chapter 5: Jobs & Construction Management](#chapter-5-jobs--construction-management)
- [Chapter 6: Estimates & Quoting](#chapter-6-estimates--quoting)
- [Chapter 7: AI Plan Review](#chapter-7-ai-plan-review)
- [Chapter 8: Purchase Orders](#chapter-8-purchase-orders)
- [Chapter 9: Gantt & Schedule Master](#chapter-9-gantt--schedule-master)
- [Chapter 10: Project Tasks & Checklists](#chapter-10-project-tasks--checklists)
- [Chapter 11: Weather & Public Holidays](#chapter-11-weather--public-holidays)
- [Chapter 12: OneDrive Integration](#chapter-12-onedrive-integration)
- [Chapter 13: Outlook/Email Integration](#chapter-13-outlookenail-integration)
- [Chapter 14: Chat & Communications](#chapter-14-chat--communications)
- [Chapter 15: Xero Accounting Integration](#chapter-15-xero-accounting-integration)
- [Chapter 16: Payments & Financials](#chapter-16-payments--financials)
- [Chapter 17: Workflows & Automation](#chapter-17-workflows--automation)
- [Chapter 18: Custom Tables & Formulas](#chapter-18-custom-tables--formulas)

---

# Chapter 0: System-Wide Knowledge

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 0                │
│ 📘 USER MANUAL (HOW): Chapter 0                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Architecture: Rails + React Stack

**Backend:** Ruby on Rails 8.0.4
- **Database:** PostgreSQL
- **Job Queue:** Solid Queue
- **API Format:** JSON REST
- **Authentication:** JWT tokens

**Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **State:** React hooks + context
- **HTTP:** Axios

## Common Patterns

### API Call Pattern
All API calls use centralized `api.js` helper with JWT authentication in headers.

### Error Handling
Backend returns consistent `{success: boolean, error: string}` format.

**Content TBD** - To be populated as system-wide bugs are discovered

---

# Chapter 1: Authentication & Users

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 1                │
│ 📘 USER MANUAL (HOW): Chapter 1                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

**Content TBD** - To be populated when working on Auth features

---

# Chapter 2: System Administration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 2                │
│ 📘 USER MANUAL (HOW): Chapter 2                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

**Content TBD** - To be populated when working on Admin features

---

# Chapter 3: Contacts & Relationships

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 3                │
│ 📘 USER MANUAL (HOW): Chapter 3                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

**Content TBD** - To be populated when working on Contacts

---

# Chapter 4: Price Books & Suppliers

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 4                │
│ 📘 USER MANUAL (HOW): Chapter 4                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

**Content TBD** - To be populated when working on Price Books

---

# Chapter 5: Jobs & Construction Management

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 5                │
│ 📘 USER MANUAL (HOW): Chapter 5                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

**Content TBD** - To be populated when working on Jobs

---

# Chapter 6: Estimates & Quoting

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 6                │
│ 📘 USER MANUAL (HOW): Chapter 6                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

**Content TBD** - To be populated when working on Estimates

---

# Chapter 7: AI Plan Review

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 7                │
│ 📘 USER MANUAL (HOW): Chapter 7                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

**Content TBD** - To be populated when working on AI features

---

# Chapter 8: Purchase Orders

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 8                │
│ 📘 USER MANUAL (HOW): Chapter 8                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

**Content TBD** - To be populated when working on POs

---

# Chapter 9: Gantt & Schedule Master

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 9                │
│ 📘 USER MANUAL (HOW): Chapter 9                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 (Migrated from GANTT_BUG_HUNTER_LEXICON.md)

---

## Bug Hunter Tool

### What is Bug Hunter?

Bug Hunter is an automated testing system with two components:

1. **Browser Console Diagnostics** - Real-time monitoring in browser console
2. **Automated Test Suite** - 12 tests accessible at Settings → Schedule Master → Bug Hunter Tests

**URL:** `http://localhost:5173/settings?tab=schedule-master&subtab=bug-hunter`

### Bug Hunter Updates Log

| Date | Version | Changes | Reason |
|------|---------|---------|--------|
| 2025-11-14 | 1.0 | Initial Bug Hunter with diagnostic reporting | Detect duplicate API calls after BUG-001 fix |
| 2025-11-14 | 1.1 | Added threshold-based warnings | Make reports actionable |
| 2025-11-14 | 1.2 | Integrated with E2E tests | Catch regressions in CI/CD |
| 2025-11-16 | 2.0 | Added UI-based test suite (12 tests) | Enable non-technical users to run tests |

### Complete Test Catalog (12 Tests)

#### Performance Tests (6 tests)

**1. Duplicate API Call Detection**
- **ID:** `duplicate-api-calls`
- **Visual:** ✅ Yes
- **Detects:** Infinite loops, race conditions
- **Threshold:** > 2 calls to same task within 5 seconds

**2. Excessive Gantt Reload Detection**
- **ID:** `excessive-reloads`
- **Visual:** ✅ Yes
- **Detects:** Screen flickering, missing lock flags
- **Threshold:** > 5 reloads per drag

**3. Slow Drag Operation Detection**
- **ID:** `slow-drag-operations`
- **Visual:** ✅ Yes
- **Detects:** Performance issues
- **Threshold:** > 5000ms (5 seconds)

**4. State Update Batching**
- **ID:** `state-update-batching`
- **Visual:** ❌ No
- **Detects:** Unnecessary re-renders
- **Threshold:** > 3 state updates per drag

**5. Performance Timing Analysis**
- **ID:** `performance-timing`
- **Visual:** ❌ No
- **Analyzes:** Overall performance timing

**6. Lock State Monitoring**
- **ID:** `lock-state-monitoring`
- **Visual:** ❌ No
- **Detects:** Deadlocks, race conditions

#### Cascade Tests (1 test)

**7. Cascade Event Tracking**
- **ID:** `cascade-event-tracking`
- **Visual:** ✅ Yes
- **Tracks:** Cascade propagation

#### Analysis Tests (3 tests)

**8. API Call Pattern Analysis**
- **ID:** `api-call-patterns`
- **Analyzes:** API call efficiency

**9. Health Status Assessment**
- **ID:** `health-status`
- **Provides:** Overall system health

**10. Actionable Recommendations**
- **ID:** `actionable-recommendations`
- **Generates:** Fix suggestions

#### E2E & Backend Tests (2 tests)

**11. Gantt Cascade E2E Test**
- **ID:** `gantt-cascade-e2e`
- **Type:** Playwright E2E test

**12. Working Days Enforcement**
- **ID:** `working-days-enforcement`
- **Type:** Backend validation

---

## Resolved Issues

### ✅ BUG-003: Predecessor IDs Cleared on Drag (RESOLVED)

**Status:** ✅ RESOLVED
**Date Discovered:** 2025-11-16
**Date Resolved:** 2025-11-16
**Severity:** Critical (Data loss)

#### Summary
Predecessor relationships were being deleted permanently due to hardcoded empty arrays in drag handler.

#### Root Cause
Code was setting `predecessor_ids: []` instead of preserving existing predecessors.

**Two paths affected:**
1. Task has successors (triggers cascade) - Line 2078
2. Task has no dependencies (manually positioned) - Line 2096

#### Solution
Fixed by preserving existing predecessor_ids:

```javascript
// FIXED
const updateData = {
  duration: task.duration,
  start_date: dayOffset,
  manually_positioned: false,
  predecessor_ids: task.predecessor_ids || []  // ✅ PRESERVE
}
```

**Files Changed:**
- `frontend/src/components/schedule-master/DHtmlxGanttView.jsx:2078`
- `frontend/src/components/schedule-master/DHtmlxGanttView.jsx:2096`

**Related Rule:** Bible Chapter 9, RULE #9.9

---

### ✅ BUG-001: Drag Flickering / Screen Shake (RESOLVED)

**Status:** ✅ RESOLVED
**Date Discovered:** 2025-11-14
**Date Resolved:** 2025-11-14
**Severity:** High (UX-breaking)
**Resolution Time:** ~6 hours

#### Summary
Screen shake and flickering occurred when dragging tasks with dependencies. Multiple cascading Gantt reloads caused severe performance issues.

#### Root Cause
**The lock was being set TOO LATE!**

1. User drags Task 299 (has successors: 300, 301, 302, 304)
2. DHtmlx `auto_scheduling` plugin recalculates dependent tasks
3. Each recalculated task fires `onAfterTaskUpdate` event
4. Each event triggers: `handleTaskUpdate` → API call → state update → Gantt reload
5. **Problem:** `isLoadingData` lock was set in useEffect AFTER state updates had already queued
6. All cascade updates bypassed the lock
7. **Result:** 8 separate Gantt reloads within ~1 second = visible screen shake

#### Investigation Timeline

**8 Iterative Fixes** attempted:

1. **Fix #1:** Added `skipReload` option - Reduced but didn't eliminate
2. **Fix #2:** Batched multi-field updates - Reduced API calls but shake persisted
3. **Fix #3:** Enhanced body scroll lock - Fixed background shake, drag shake remained
4. **Fix #4:** Added GPU acceleration - Improved rendering but didn't fix core issue
5. **Fix #5:** Added render suppression flag - Reduced flickering
6. **Fix #6:** Deferred `isDragging` flag reset - Smoother but still had cascade issue
7. **Fix #7:** Modified timeout logic - Slowed reloads but didn't prevent them
8. **✅ Fix #8: FINAL SOLUTION** - Early lock + cascade API block

#### Solution Details

**Two-Part Fix:**

**Part A: Set Lock Immediately**
```javascript
gantt.attachEvent('onAfterTaskDrag', (id, mode, event) => {
  isLoadingData.current = true  // CRITICAL: Set IMMEDIATELY

  loadingDataTimeout.current = setTimeout(() => {
    isLoadingData.current = false
  }, 5000)  // Extended for cascade
})
```

**Part B: Block Cascade API Calls**
```javascript
const handleTaskUpdate = (task) => {
  if (isSaving.current) return
  if (isDragging.current) return
  if (isLoadingData.current) {
    console.log('⏸️ Skipping cascade update - drag lock active')
    return
  }
  // ... proceed with API call
}
```

#### Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API calls per drag | 8-12 | 1 | 87.5% reduction |
| Gantt reloads | 8-12 | 1 | 87.5% reduction |
| Visible shake | YES (severe) | NO | Eliminated ✅ |

#### Key Learnings

1. **Timing is Everything** - Locks must be set BEFORE events that trigger state updates
2. **Auto-Scheduling is Powerful** - DHtmlx auto-scheduling provides great UX but triggers many internal events
3. **Diagnostic Logging is Essential** - Without timestamped logs, impossible to identify 8 cascade reloads
4. **State vs Refs** - Using `useRef` for control flags prevents unnecessary re-renders
5. **React State Queue** - Multiple `setState` calls can queue before first one executes

**Related Rule:** Bible Chapter 9, RULE #9.2

---

### ✅ BUG-002: Infinite Cascade Loop After Drag (RESOLVED)

**Status:** ✅ RESOLVED
**Date Discovered:** 2025-11-14
**Date Resolved:** 2025-11-14
**Severity:** Critical

#### Summary
After fixing BUG-001, cascaded tasks triggered infinite API loops with 20+ duplicate calls within seconds.

#### Root Cause
**Pending tracker was cleared too early - before Gantt reload completed!**

Race condition timeline:
1. User drags Task 1 → triggers cascade to Task 2 and Task 3
2. Backend returns cascade data
3. Frontend calls `handleUpdateRow(300, {start_date: 8})`
4. **`finally` block immediately clears pending tracker** ⚠️
5. `applyBatchedCascadeUpdates()` applies state update
6. Gantt reloads with new data
7. **Gantt reload fires events** → `handleUpdateRow(300, {start_date: 8})` called AGAIN
8. **Pending tracker is empty** → duplicate passes through!
9. Loop continues

#### Solution

**Three-part atomic deduplication fix:**

**1. Atomic Check-and-Set**
```javascript
for (const field of Object.keys(updates)) {
  const pendingKey = `${rowId}:${field}`

  if (pendingUpdatesRef.current.has(pendingKey)) {
    const pendingValue = pendingUpdatesRef.current.get(pendingKey)
    if (pendingValue === newValue) continue
  }

  if (currentValue === newValue) continue

  // IMMEDIATELY set pending value (atomic operation)
  pendingUpdatesRef.current.set(pendingKey, newValue)
  fieldsToUpdate[field] = newValue
}
```

**2. Delayed Pending Cleanup**
```javascript
// Clear AFTER 2 seconds (not immediately)
setTimeout(() => {
  Object.keys(updates).forEach(field => {
    const pendingKey = `${rowId}:${field}`
    pendingUpdatesRef.current.delete(pendingKey)
  })
}, 2000)  // Changed from immediate to 2 second delay
```

#### Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API calls per cascade | 20+ (infinite) | 2 | 90% reduction |
| Duplicate call warnings | Many | 0 | Eliminated ✅ |

#### Key Learnings

1. **Timing matters** - Cleanup operations must account for async state updates
2. **Refs persist across renders** - Perfect for tracking in-flight operations
3. **State updates are async** - React batches updates, causing delays
4. **Atomic operations prevent race conditions** - Check-and-set must be one operation

**Related Rule:** Bible Chapter 9, RULE #9.7

---

## Architecture: How Systems Work

### Cascade Service

**Backend:** `schedule_cascade_service.rb`
- Calculates new dates for dependent tasks
- Respects lock hierarchy (5 types)
- Uses `update_column` to avoid callbacks
- Skips non-working days

**Frontend:** Receives cascade response
- Single API call returns all affected tasks
- Applies updates in batch
- Suppresses reload during drag

### Lock System

**5 Lock Types (priority order):**
1. `supplier_confirm` - Supplier committed
2. `confirm` - Internally confirmed
3. `start` - Work begun
4. `complete` - Work done
5. `manually_positioned` - User dragged

Locked tasks are NOT cascaded.

### Predecessor ID System

**0-based vs 1-based:**
- `sequence_order` is 0-based (0, 1, 2...)
- `predecessor_id` is 1-based (1, 2, 3...)
- **MUST convert:** `predecessor_id = sequence_order + 1`

---

## Performance Benchmarks

### Target Metrics (Healthy System)

| Metric | Target | Threshold | Current |
|--------|--------|-----------|---------|
| API calls per drag | 1 | ≤ 2 | ✅ 1 |
| Gantt reloads per drag | 1 | ≤ 1 | ✅ 1 |
| Drag operation duration | < 200ms | < 5000ms | ✅ ~150ms |
| Cascade calculation time | < 100ms | < 500ms | ✅ ~80ms |

**Status:** ✅ All metrics within healthy targets (as of 2025-11-14)

---

**For Gantt rules, see:** Bible Chapter 9
**For user guide, see:** User Manual Chapter 9

---

# Chapter 10: Project Tasks & Checklists

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 10               │
│ 📘 USER MANUAL (HOW): Chapter 10               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 11: Weather & Public Holidays

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 11               │
│ 📘 USER MANUAL (HOW): Chapter 11               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 12: OneDrive Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 12               │
│ 📘 USER MANUAL (HOW): Chapter 12               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 13: Outlook/Email Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 13               │
│ 📘 USER MANUAL (HOW): Chapter 13               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 14: Chat & Communications

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 14               │
│ 📘 USER MANUAL (HOW): Chapter 14               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 15: Xero Accounting Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 15               │
│ 📘 USER MANUAL (HOW): Chapter 15               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 16: Payments & Financials

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 16               │
│ 📘 USER MANUAL (HOW): Chapter 16               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 17: Workflows & Automation

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 17               │
│ 📘 USER MANUAL (HOW): Chapter 17               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 18: Custom Tables & Formulas

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 18               │
│ 📘 USER MANUAL (HOW): Chapter 18               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

**Last Updated:** 2025-11-16
**Maintained By:** Development Team
**Review Schedule:** After each bug fix
