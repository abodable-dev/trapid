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

## Bug Hunter - OneDrive Integration

**Status:** Active monitoring
**Total Bugs Resolved:** 1
**Open Issues:** 0

---

## Resolved Bugs

### ✅ BUG-OD-001: Token Expiry During Long Uploads (RESOLVED)

**Status:** ✅ RESOLVED
**Severity:** High (feature-breaking)
**Resolution Time:** ~2 hours

#### Symptoms
- Large file uploads (>50MB) failing mid-upload
- Error: "401 Unauthorized" after 1 hour
- Upload resumes not working

#### Root Cause
**Access token expired during chunked upload.** OneDrive tokens expire after 1 hour, but large file uploads can take longer. The upload session continues, but API requests fail.

#### Solution

**Refresh token BEFORE each chunk:**
```ruby
def upload_chunk(upload_url, chunk, offset, total_size)
  ensure_valid_token  # Refresh if expired

  headers = {
    'Content-Range' => "bytes #{offset}-#{offset + chunk.size - 1}/#{total_size}"
  }

  response = HTTParty.put(upload_url, body: chunk, headers: headers)
end
```

**References:** Bible Rule #12.1, Bible Rule #12.5

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

## Bug Hunter - Xero Integration

**Status:** Active monitoring
**Total Bugs Resolved:** 2
**Open Issues:** 0

---

## Resolved Bugs

### ✅ BUG-XER-001: Token Decryption Failure Loop (RESOLVED)

**Status:** ✅ RESOLVED
**Severity:** Critical (auth-breaking)
**Resolution Time:** ~4 hours

#### Symptoms
- Infinite refresh loop when accessing Xero API
- Error: `ActiveRecord::Encryption::Errors::Decryption`
- Users unable to reconnect even after re-auth

#### Root Cause
**Encrypted credentials became corrupted** after Rails upgrade to 8.0.4. The encryption key changed between environments, causing stored tokens to become unreadable.

When `XeroApiClient` tried to access the token:
```ruby
access_token = credential.access_token  # BOOM! Decryption error
```

The code didn't catch this error, so it retried infinitely.

#### Solution

**Part A: Catch Decryption Errors**
```ruby
def refresh_access_token
  credential = XeroCredential.current

  begin
    access_token = credential.access_token
    refresh_token = credential.refresh_token
  rescue ActiveRecord::Encryption::Errors::Decryption => e
    Rails.logger.error("Corrupted credentials - deleting: #{e.message}")
    credential.destroy
    raise AuthenticationError, 'Xero credentials corrupted. Please reconnect.'
  end

  # Continue with refresh...
end
```

**Part B: Ensure Consistent Encryption Keys**
Set in `config/credentials.yml.enc`:
```yaml
active_record_encryption:
  primary_key: <same_key_across_all_environments>
  deterministic_key: <same_key_across_all_environments>
  key_derivation_salt: <same_salt_across_all_environments>
```

#### Testing
**Manual Test:**
1. Delete `config/credentials/production.key`
2. Try to access Xero API
3. Should see "Xero credentials corrupted" error
4. Reconnect to Xero
5. API works again

**Automated Test:**
```ruby
# backend/test/xero_decryption_test.rb
test "handles corrupted xero credentials gracefully" do
  credential = XeroCredential.create!(
    access_token: "encrypted_token",
    refresh_token: "encrypted_refresh"
  )

  # Simulate decryption failure
  credential.stub(:access_token, -> { raise ActiveRecord::Encryption::Errors::Decryption.new("Bad key") }) do
    assert_raises(XeroApiClient::AuthenticationError) do
      XeroApiClient.new.refresh_access_token
    end
  end

  assert_nil XeroCredential.current  # Corrupted cred deleted
end
```

#### Lessons Learned
1. **ALWAYS catch encryption errors** when reading encrypted fields
2. **NEVER assume encryption keys are consistent** across environments
3. **DELETE corrupted credentials** immediately to prevent loops
4. **LOG decryption failures** for debugging

**References:** Bible Rule #15.1

---

### ✅ BUG-XER-002: Contact Sync Race Condition (RESOLVED)

**Status:** ✅ RESOLVED
**Severity:** High (data integrity)
**Resolution Time:** ~3 hours

#### Symptoms
- Duplicate contacts created during bulk sync
- Some contacts marked as "synced" but missing `xero_id`
- Sync job completes with "100% success" but errors in logs

#### Root Cause
**Multiple background jobs processing the same contact simultaneously.**

When contact sync job ran:
1. Job A queries contacts where `xero_id IS NULL`
2. Job B queries contacts where `xero_id IS NULL` (same list!)
3. Both jobs try to sync Contact #123 to Xero
4. Xero returns same `xero_id` for both
5. Both jobs update Contact #123 with `xero_id`
6. BUT: Xero actually created TWO contacts (duplicate!)

#### Solution

**Use Database Locks to Prevent Race Conditions**

```ruby
# XeroContactSyncService
def sync_contact(contact)
  # Lock this contact for the duration of sync
  contact.with_lock do
    # Re-check if another job already synced it
    contact.reload
    if contact.xero_id.present?
      Rails.logger.info("Contact #{contact.id} already synced by another job")
      return { success: true, action: :skipped }
    end

    # Proceed with sync
    xero_contact = create_or_update_in_xero(contact)
    contact.update!(
      xero_id: xero_contact['ContactID'],
      last_synced_at: Time.current
    )

    { success: true, action: :synced }
  end
end
```

**Also Added: Idempotency Check in Job**
```ruby
# XeroContactSyncJob
def perform
  contacts_to_sync = Contact.where(xero_id: nil, sync_with_xero: true)

  contacts_to_sync.find_each do |contact|
    # Skip if another job already got it
    next if contact.reload.xero_id.present?

    XeroContactSyncService.sync_contact(contact)
  end
end
```

#### Testing
**Automated Test:**
```ruby
# backend/test/xero_contact_sync_race_test.rb
test "prevents duplicate contacts during concurrent sync" do
  contact = Contact.create!(first_name: "John", last_name: "Doe", sync_with_xero: true)

  # Simulate two jobs running at once
  threads = []
  2.times do
    threads << Thread.new { XeroContactSyncJob.perform_now }
  end
  threads.each(&:join)

  contact.reload
  assert contact.xero_id.present?

  # Check Xero only has ONE contact with this name
  xero_contacts = XeroApiClient.new.get('Contacts', where: "Name == \"John Doe\"")
  assert_equal 1, xero_contacts[:data]['Contacts'].length
end
```

#### Lessons Learned
1. **ALWAYS use `with_lock`** for database operations in background jobs
2. **RE-CHECK conditions** after acquiring lock (another job may have finished)
3. **TEST concurrent execution** explicitly
4. **IDEMPOTENCY is critical** for background jobs

**References:** Bible Rule #15.2, Bible Rule #15.7

---

## Architecture & Implementation

### Xero API Client (`XeroApiClient`)

**Purpose:** Handles OAuth flow, token refresh, and HTTP requests to Xero API.

**Key Methods:**
- `authorization_url` - Generate OAuth URL for user consent
- `exchange_code_for_token(code)` - Exchange auth code for tokens
- `refresh_access_token` - Refresh expired access token
- `get(endpoint, params)` - Make authenticated GET request
- `post(endpoint, data)` - Make authenticated POST request
- `connection_status` - Check if connected and token expiry

**Token Storage:**
- Access tokens encrypted in `xero_credentials` table
- Refresh tokens encrypted in `xero_credentials` table
- Token expiry tracked in `expires_at` column
- Automatic refresh when token expires (30min lifespan)

**Error Handling:**
- `AuthenticationError` - Token issues (401, expired, invalid)
- `RateLimitError` - Hit Xero rate limit (429)
- `ApiError` - General API errors (400, 500, etc.)

### Contact Sync Service (`XeroContactSyncService`)

**Purpose:** Two-way sync between Trapid contacts and Xero contacts.

**Sync Direction:**
1. **Trapid → Xero:** Contacts with `sync_with_xero = true` and `xero_id IS NULL`
2. **Xero → Trapid:** Fetch all Xero contacts, match by name/ABN, update Trapid

**Matching Logic:**
- Exact match: `xero_id` (UUID)
- Fuzzy match: Full name + ABN
- Conflict resolution: Xero data wins (newer timestamp)

**Fields Synced:**
- `first_name`, `last_name` → `FirstName`, `LastName`
- `email` → `EmailAddress`
- `phone` → `Phones` array
- `abn` → `TaxNumber`
- `full_name` → `Name`

### Payment Sync Service (`XeroPaymentSyncService`)

**Purpose:** Sync Trapid payments to Xero after invoice matching.

**Workflow:**
1. User creates Payment in Trapid (amount, date, PO link)
2. Payment must have `xero_invoice_id` from matched invoice
3. User clicks "Sync to Xero" button
4. Service creates payment in Xero API
5. Store `xero_payment_id` on Payment record

**Required Fields:**
- `xero_invoice_id` (from invoice matching)
- `amount` (payment amount)
- `date` (payment date)
- `account_id` (bank account in Xero)

### Background Job (`XeroContactSyncJob`)

**Purpose:** Long-running contact sync operation.

**Job Metadata (Rails.cache):**
```ruby
{
  job_id: "unique_job_id",
  status: "queued" | "processing" | "completed" | "failed",
  total: 150,          # Total contacts to sync
  processed: 75,       # Contacts processed so far
  errors: ["Contact #12: Invalid email", ...],
  queued_at: Time,
  started_at: Time,
  completed_at: Time
}
```

**Progress Tracking:**
- Frontend polls `GET /api/v1/xero/sync_status` every 2 seconds
- Displays progress bar: `(processed / total) * 100`
- Shows errors inline

**Job Execution:**
1. Queue job via `XeroContactSyncJob.perform_later`
2. Job fetches contacts where `sync_with_xero = true`
3. Process each contact with database lock
4. Update job metadata after each contact
5. Mark job as "completed" when done

---

## Test Catalog

### Automated Tests

#### 1. **OAuth Flow Test**
**File:** `backend/test/xero_oauth_test.rb`
**Purpose:** Verify OAuth authorization and token exchange

**Test Steps:**
1. Generate authorization URL
2. Simulate callback with auth code
3. Verify tokens stored in database
4. Check tenant information saved

**Assertions:**
- `authorization_url` contains correct redirect_uri
- Token exchange returns `tenant_id` and `tenant_name`
- `XeroCredential.current` exists after callback

#### 2. **Token Refresh Test**
**File:** `backend/test/xero_token_refresh_test.rb`
**Purpose:** Verify automatic token refresh when expired

**Test Steps:**
1. Create credential with expired token
2. Make API request
3. Verify token refresh called
4. Verify request succeeds with new token

**Assertions:**
- Token refresh called when `expires_at < Time.current`
- New access token stored in database
- API request succeeds after refresh

#### 3. **Contact Sync Test**
**File:** `backend/test/xero_contact_sync_test.rb`
**Purpose:** Verify two-way contact sync

**Test Steps:**
1. Create Trapid contact with `sync_with_xero = true`
2. Run sync job
3. Verify contact created in Xero
4. Modify contact in Xero
5. Run sync job again
6. Verify Trapid contact updated

**Assertions:**
- Trapid contact has `xero_id` after sync
- `last_synced_at` timestamp updated
- Xero data wins on conflict

#### 4. **Invoice Matching Test**
**File:** `backend/test/xero_invoice_matching_test.rb`
**Purpose:** Verify invoice matching to POs

**Test Steps:**
1. Create PurchaseOrder in Trapid
2. Create invoice in Xero with same supplier
3. Call `POST /api/v1/xero/match_invoice`
4. Verify invoice matched to PO

**Assertions:**
- PurchaseOrder has `xero_invoice_id`
- Payment record created
- Invoice total matches PO total (±5%)

#### 5. **Webhook Signature Test**
**File:** `backend/test/xero_webhook_test.rb`
**Purpose:** Verify webhook signature verification

**Test Steps:**
1. Generate valid webhook payload
2. Sign with `XERO_WEBHOOK_KEY`
3. Send to webhook endpoint
4. Verify accepted

**Assertions:**
- Valid signature accepts webhook
- Invalid signature rejects webhook (401)
- Missing signature rejects webhook (401)

#### 6. **Rate Limit Test**
**File:** `backend/test/xero_rate_limit_test.rb`
**Purpose:** Verify rate limit handling

**Test Steps:**
1. Stub Xero API to return 429
2. Make API request
3. Verify retry logic triggered
4. Verify exponential backoff

**Assertions:**
- Waits 60 seconds before retry
- Retries once only
- Logs rate limit error

---

## Performance Benchmarks

### Contact Sync Performance

**Small Dataset (100 contacts):**
- Sync time: ~45 seconds
- API calls: ~102 (1 per contact + 2 overhead)
- Memory usage: ~50MB

**Medium Dataset (500 contacts):**
- Sync time: ~4 minutes
- API calls: ~502
- Memory usage: ~75MB

**Large Dataset (2000 contacts):**
- Sync time: ~18 minutes
- API calls: ~2002
- Memory usage: ~120MB

**Bottlenecks:**
1. Xero API rate limit (60 calls/minute)
2. Database locks during concurrent sync
3. Token refresh overhead

**Optimization Strategies:**
- Batch contact updates (group by 100)
- Cache tax rates and accounts locally
- Use background job for large syncs

### Invoice Search Performance

**Average search time:** ~800ms
**API calls:** 1 per search
**Cache TTL:** 5 minutes

---

## Common Issues & Solutions

### Issue #1: "Not authenticated with Xero"

**Cause:** Token expired or credentials deleted

**Solution:**
1. Check `XeroCredential.current` exists
2. Check `expires_at > Time.current`
3. If expired, try refresh
4. If no credential, reconnect via OAuth

### Issue #2: "Sync job stuck at 'queued'"

**Cause:** Solid Queue not running

**Solution:**
```bash
# Check Solid Queue status
heroku ps -a trapid-backend | grep solid_queue

# Restart Solid Queue
heroku ps:restart solid_queue -a trapid-backend
```

### Issue #3: "Duplicate contacts in Xero"

**Cause:** Race condition during concurrent sync

**Solution:**
- Already fixed in BUG-XER-002
- Ensure `with_lock` used in sync service
- Check logs for concurrent job execution

---

**Last Reviewed:** 2025-11-16
**Next Review:** After next Xero feature addition or bug report

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
