# TRAPID BIBLE - Development Rules

**Version:** 1.0.0
**Last Updated:** 2025-11-16
**Authority Level:** ABSOLUTE
**Audience:** Claude Code + Human Developers

---

## 🔴 CRITICAL: Read This First

### This Document is "The Bible"

This file is the **absolute authority** for all Trapid development where chapters exist.

**This Bible Contains RULES ONLY:**
- ✅ MUST do this
- ❌ NEVER do that
- ✅ ALWAYS check X before Y
- Configuration values that must match
- Protected code patterns

**For KNOWLEDGE (how things work, bug history, why we chose X):**
- 📕 See [TRAPID_LEXICON.md](TRAPID_LEXICON.md)

**For USER GUIDES (how to use features):**
- 📘 See [TRAPID_USER_MANUAL.md](TRAPID_USER_MANUAL.md)

---

## Rules for Claude Code (CC):

- ✅ You MUST follow every rule in this document without exception
- ✅ You MUST read relevant chapters before working on that feature
- ✅ You MUST update this Bible when discovering new rules
- ✅ You MUST add bug knowledge to Lexicon, NOT here
- ❌ You CANNOT change implementation approaches between sessions
- ❌ You CANNOT "optimize" or "simplify" code without explicit approval
- ❌ You CANNOT add explanations/knowledge to Bible (goes in Lexicon)

---

## Table of Contents

**Cross-Reference:**
- 📕 [Lexicon](TRAPID_LEXICON.md) - Bug history & knowledge
- 📘 [User Manual](TRAPID_USER_MANUAL.md) - User guides

**Chapters:**
- [Chapter 0: Overview & System-Wide Rules](#chapter-0-overview--system-wide-rules)
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

# Chapter 0: Overview & System-Wide Rules

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 0                │
│ 📘 USER MANUAL (HOW): Chapter 0                │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Authority:** ABSOLUTE
**Last Updated:** 2025-11-16

## RULE #0: Documentation Maintenance

### When to Update Bible
✅ **MUST update Bible when:**
1. Adding a new coding rule (MUST/NEVER/ALWAYS pattern)
2. Discovering a protected code pattern
3. Adding a critical configuration value
4. Finding a bug-causing violation

❌ **DO NOT update Bible for:**
- Bug discoveries (goes in Lexicon)
- Architecture explanations (goes in Lexicon)
- Performance optimizations (goes in Lexicon unless it creates a new RULE)

### When to Update Lexicon
✅ **MUST update Lexicon when:**
1. Discovering a new bug
2. Resolving an existing bug
3. Adding architecture/background knowledge
4. Explaining WHY a rule exists

## RULE #1: Code Quality Standards

❌ **NEVER commit code with:**
- Console.log statements (use proper logging)
- Commented-out code (delete it)
- TODO comments without GitHub issues
- Hardcoded credentials or API keys

✅ **ALWAYS:**
- Use environment variables for secrets
- Write descriptive commit messages
- Run linter before committing
- Test locally before pushing

## RULE #2: API Response Format

✅ **ALWAYS return consistent JSON:**
```ruby
# Success response
{
  success: true,
  data: { ... },
  message: "Optional success message"
}

# Error response
{
  success: false,
  error: "Error message",
  details: { ... } # Optional
}
```

## RULE #3: Database Migrations

❌ **NEVER:**
- Modify existing migrations after they've been deployed
- Delete migrations that have run in production
- Use `change` when `up`/`down` is safer

✅ **ALWAYS:**
- Create new migration to fix issues
- Test migrations with `db:rollback`
- Add indexes for foreign keys
- Use `add_column` with default values carefully

**For system-wide patterns, see:** Lexicon Chapter 0

---

# Chapter 1: Authentication & Users

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 1                │
│ 📘 USER MANUAL (HOW): Chapter 1                │
└─────────────────────────────────────────────────┘

**User Context:** Login, profiles, permissions
**Technical Rules:** JWT, authentication flow, user model

## RULE #1.1: JWT Token Handling

❌ **NEVER store JWT in localStorage** (XSS vulnerable)
✅ **ALWAYS store JWT in httpOnly cookies**

**Code location:** `backend/app/services/json_web_token.rb`

## RULE #1.2: Password Security

✅ **MUST use bcrypt** with minimum cost factor of 12
❌ **NEVER log passwords** or tokens

**Implementation:**
```ruby
has_secure_password
validates :password, length: { minimum: 8 }
```

---

# Chapter 2: System Administration

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 2                │
│ 📘 USER MANUAL (HOW): Chapter 2                │
└─────────────────────────────────────────────────┘

**User Context:** Company settings, configuration
**Technical Rules:** Settings model, configuration management

## RULE #2.1: Company Settings Pattern

✅ **ALWAYS read from company_settings table**
❌ **NEVER hardcode configuration values**

**Example:**
```ruby
# ❌ WRONG
working_days = { monday: true, tuesday: true }

# ✅ CORRECT
working_days = @company_settings.working_days
```

---

# Chapter 3: Contacts & Relationships

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 3                │
│ 📘 USER MANUAL (HOW): Chapter 3                │
└─────────────────────────────────────────────────┘

**User Context:** Managing customers, suppliers
**Technical Rules:** Contact model, relationships, type handling

## RULE #3.1: Contact Type Handling

✅ **Contact types:** `:customer`, `:supplier`, or `:both`
❌ **NEVER use string values** (use symbols)

## RULE #3.2: Relationship Validation

✅ **MUST validate relationship types** before creating
❌ **NEVER create circular relationships**

**Content TBD** - To be populated when working on Contacts feature

---

# Chapter 4: Price Books & Suppliers

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 4                │
│ 📘 USER MANUAL (HOW): Chapter 4                │
└─────────────────────────────────────────────────┘

**User Context:** Setting up pricing, supplier info
**Technical Rules:** Price book model, supplier ratings

**Content TBD** - To be populated when working on Price Books feature

---

# Chapter 5: Jobs & Construction Management

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 5                │
│ 📘 USER MANUAL (HOW): Chapter 5                │
└─────────────────────────────────────────────────┘

**User Context:** Creating jobs
**Technical Rules:** Job model, construction tracking

**Content TBD** - To be populated when working on Jobs feature

---

# Chapter 6: Estimates & Quoting

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 6                │
│ 📘 USER MANUAL (HOW): Chapter 6                │
└─────────────────────────────────────────────────┘

**User Context:** Importing estimates
**Technical Rules:** Estimate import, Unreal Engine integration

**Content TBD** - To be populated when working on Estimates feature

---

# Chapter 7: AI Plan Review

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 7                │
│ 📘 USER MANUAL (HOW): Chapter 7                │
└─────────────────────────────────────────────────┘

**User Context:** AI plan analysis
**Technical Rules:** Claude API, Grok integration, plan review service

**Content TBD** - To be populated when working on AI features

---

# Chapter 8: Purchase Orders

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 8                │
│ 📘 USER MANUAL (HOW): Chapter 8                │
└─────────────────────────────────────────────────┘

**User Context:** Generating POs
**Technical Rules:** PO generation, supplier matching

**Content TBD** - To be populated when working on PO feature

---

# Chapter 9: Gantt & Schedule Master

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 9                │
│ 📘 USER MANUAL (HOW): Chapter 9                │
└─────────────────────────────────────────────────┘

**User Context:** Building construction schedules
**Technical Rules:** Gantt chart, dependencies, cascade logic
**Authority:** ABSOLUTE - These rules prevent critical bugs
**Last Updated:** 2025-11-16 (Migrated from GANTT_BIBLE.md v3.0.0)

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
| **Lock** | Lock | Prevents a task from being auto-cascaded (5 types) |
| **CC** | Claude Code | AI assistant |

---

## RULE #9.1: Predecessor ID Conversion

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

---

## RULE #9.2: isLoadingData Lock Timing

❌ **NEVER reset isLoadingData in drag handler**
✅ **ALWAYS reset in useEffect with 1000ms timeout**

**Code location:** `DHtmlxGanttView.jsx:1414-1438` (drag handler), `DHtmlxGanttView.jsx:4041-4046` (useEffect)

**Required implementation:**
```javascript
// In onAfterTaskDrag:
gantt.attachEvent('onAfterTaskDrag', (id, mode, event) => {
  isDragging.current = true
  isLoadingData.current = true  // Set immediately

  // Set timeout to release lock after 5000ms
  loadingDataTimeout.current = setTimeout(() => {
    isLoadingData.current = false
    loadingDataTimeout.current = null
  }, 5000)

  isDragging.current = false
  // DO NOT reset isLoadingData synchronously!
})
```

**For bug history, see:** Lexicon Chapter 9 → BUG-001

---

## RULE #9.3: Company Settings - Working Days

❌ **NEVER hardcode working days**
✅ **ALWAYS read from:** `company_settings.working_days`

**Code location:** `backend/app/services/schedule_cascade_service.rb:175-192`

**Required implementation:**
```ruby
def working_day?(date)
  working_days = @company_settings.working_days || default_config
  day_name = date.strftime('%A').downcase
  working_days[day_name] == true
end
```

---

## RULE #9.4: Lock Hierarchy

❌ **NEVER cascade to locked tasks**
✅ **ALWAYS check all 5 locks before cascade**

**Lock priority (highest to lowest):**
1. `supplier_confirm` - Supplier committed to date
2. `confirm` - Internally confirmed
3. `start` - Work has begun
4. `complete` - Work is done
5. `manually_positioned` - User manually dragged task

**Code location:** `backend/app/services/schedule_cascade_service.rb:153-160`

---

## RULE #9.5: Task Heights Configuration

❌ **NEVER have mismatched height values**
✅ **MUST set all three to same value:**

**Code location:** `DHtmlxGanttView.jsx:421-423`

```javascript
gantt.config.row_height = 40
gantt.config.task_height = 40  // MUST match row_height
gantt.config.bar_height = 40   // MUST also match
```

---

## RULE #9.6: Auto-Scheduling

❌ **NEVER enable:** `gantt.config.auto_scheduling = true`
✅ **ALWAYS set:** `gantt.config.auto_scheduling = false`

**Why:** Backend cascade service handles ALL dependency calculations

---

## RULE #9.7: API Pattern - Single Update + Cascade Response

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

---

## RULE #9.8: useRef Anti-Loop Flags

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

---

## RULE #9.9: Predecessor Format

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

**Consequence:** Omitting predecessor_ids causes them to be cleared from database

---

## RULE #9.10: Cascade Triggers

✅ **Only these fields trigger cascade:**
- `start_date` - Changes when task moved
- `duration` - Changes task end date

❌ **All other fields update WITHOUT cascade**

---

## RULE #9.11: Debounced Render Pattern

❌ **NEVER call gantt.render() directly**
✅ **ALWAYS use debounced render:**

**Code location:** `DHtmlxGanttView.jsx:353-362`

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

---

## RULE #9.12: Column Documentation - CC_UPDATE Table

❌ **NEVER change Schedule Master columns without updating CC_UPDATE table**
✅ **ALWAYS update NewFeaturesTab.jsx when column implementation changes**

**Documentation location:** `frontend/src/components/schedule-master/NewFeaturesTab.jsx`

---

## 🔒 Protected Code Patterns - DO NOT MODIFY

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

**For bug history, see:** Lexicon Chapter 9 → BUG-001 (8 iterations to fix)

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

---

**For complete Gantt rules, bug history, and architecture:**
- 📕 See Lexicon Chapter 9
- 📘 See User Manual Chapter 9

---

# Chapter 10: Project Tasks & Checklists

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 10               │
│ 📘 USER MANUAL (HOW): Chapter 10               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 11: Weather & Public Holidays

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 11               │
│ 📘 USER MANUAL (HOW): Chapter 11               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 12: OneDrive Integration

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 12               │
│ 📘 USER MANUAL (HOW): Chapter 12               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 13: Outlook/Email Integration

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 13               │
│ 📘 USER MANUAL (HOW): Chapter 13               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 14: Chat & Communications

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 14               │
│ 📘 USER MANUAL (HOW): Chapter 14               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 15: Xero Accounting Integration

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 15               │
│ 📘 USER MANUAL (HOW): Chapter 15               │
└─────────────────────────────────────────────────┘

## Overview

Xero integration enables two-way sync between Trapid and Xero accounting software. This includes contact synchronization, invoice matching, payment tracking, and financial data exchange.

**Key Files:**
- Controller: `backend/app/controllers/api/v1/xero_controller.rb`
- API Client: `backend/app/services/xero_api_client.rb`
- Sync Service: `backend/app/services/xero_contact_sync_service.rb`
- Payment Sync: `backend/app/services/xero_payment_sync_service.rb`
- Background Job: `backend/app/jobs/xero_contact_sync_job.rb`
- Models: `backend/app/models/xero_credential.rb`, `xero_tax_rate.rb`, `xero_account.rb`

---

## RULE #15.1: OAuth Token Management

**ALWAYS use OAuth 2.0 with refresh tokens for Xero authentication.**

❌ **NEVER store API keys in plaintext**
✅ **ALWAYS encrypt tokens using ActiveRecord Encryption**

**Code location:** `XeroCredential` model

**Required implementation:**
```ruby
class XeroCredential < ApplicationRecord
  encrypts :access_token
  encrypts :refresh_token

  def self.current
    order(created_at: :desc).first
  end
end
```

**Token refresh logic:**
- Tokens expire after 30 minutes
- Refresh tokens are valid for 60 days
- ALWAYS check expiry before API calls
- ALWAYS refresh automatically when expired

---

## RULE #15.2: Two-Way Contact Sync

**Contact sync is BIDIRECTIONAL: Trapid ↔ Xero**

❌ **NEVER assume single-direction sync**
✅ **ALWAYS check `sync_with_xero` flag before syncing**
✅ **ALWAYS update `last_synced_at` timestamp**

**Code location:** `XeroContactSyncService`

**Sync Rules:**
1. **Trapid → Xero**: Only if `sync_with_xero = true`
2. **Xero → Trapid**: Match by `xero_id` OR fuzzy match by name/ABN
3. **Conflict resolution**: Xero data wins (newer timestamp)
4. **Error handling**: Store error in `xero_sync_error` field, continue sync

**Required fields for Contact model:**
```ruby
add_column :contacts, :xero_id, :string
add_column :contacts, :xero_contact_id, :string  # UUID
add_column :contacts, :sync_with_xero, :boolean, default: true
add_column :contacts, :last_synced_at, :datetime
add_column :contacts, :xero_sync_error, :text
```

---

## RULE #15.3: Invoice Matching

**Invoices MUST be matched to Purchase Orders before payment sync.**

❌ **NEVER sync payments without invoice match**
✅ **ALWAYS validate invoice total vs PO total**
✅ **ALWAYS store `xero_invoice_id` on PurchaseOrder**

**Code location:** `InvoiceMatchingService`

**Matching Logic:**
1. Search Xero by supplier contact + date range
2. Match by invoice number OR amount
3. Create Payment record linked to PO
4. Update PO status based on payment percentage

**Invoice discrepancy threshold:** ±5% tolerance

---

## RULE #15.4: Webhook Signature Verification

**ALWAYS verify Xero webhook signatures using HMAC-SHA256.**

❌ **NEVER process webhooks without signature verification**
✅ **ALWAYS use `XERO_WEBHOOK_KEY` from environment**

**Code location:** `xero_controller.rb:689-720`

**Required implementation:**
```ruby
def verify_xero_webhook_signature
  signature = request.headers['X-Xero-Signature']
  body = request.body.read

  expected = Base64.strict_encode64(
    OpenSSL::HMAC.digest('SHA256', ENV['XERO_WEBHOOK_KEY'], body)
  )

  ActiveSupport::SecurityUtils.secure_compare(signature, expected)
end
```

---

## RULE #15.5: Rate Limiting & Error Handling

**Xero API has rate limits: 60 calls/minute, 5000 calls/day.**

❌ **NEVER retry immediately on 429 errors**
✅ **ALWAYS implement exponential backoff**
✅ **ALWAYS log failed requests for debugging**

**Code location:** `XeroApiClient`

**Error Classes:**
- `XeroApiClient::AuthenticationError` - Token expired/invalid
- `XeroApiClient::RateLimitError` - Hit rate limit
- `XeroApiClient::ApiError` - General API error

**Retry Strategy:**
- 429 (Rate Limit): Wait 60 seconds, retry once
- 401 (Unauthorized): Refresh token, retry once
- 500 (Server Error): Wait 5 seconds, retry twice
- Other errors: Log and fail

---

## RULE #15.6: Tax Rates & Chart of Accounts

**ALWAYS sync tax rates and accounts BEFORE creating invoices.**

❌ **NEVER hardcode tax codes**
✅ **ALWAYS fetch from Xero and cache locally**

**Code location:** `GET /api/v1/xero/tax_rates`, `GET /api/v1/xero/accounts`

**Sync Frequency:**
- Tax rates: Daily (or on-demand)
- Accounts: Daily (or on-demand)
- Store in `xero_tax_rates` and `xero_accounts` tables

**Required for Purchase Orders:**
- Tax rate (e.g., "INPUT2" for 10% GST)
- Account code (e.g., "400" for Cost of Sales)

---

## RULE #15.7: Background Job Processing

**Contact sync MUST run as background job (long-running operation).**

❌ **NEVER sync contacts in HTTP request**
✅ **ALWAYS use `XeroContactSyncJob` via Solid Queue**
✅ **ALWAYS provide job progress tracking**

**Code location:** `XeroContactSyncJob`

**Job Metadata (stored in Rails.cache):**
```ruby
{
  job_id: "unique_job_id",
  status: "queued" | "processing" | "completed" | "failed",
  queued_at: Time,
  started_at: Time,
  completed_at: Time,
  total: Integer,
  processed: Integer,
  errors: Array
}
```

**Status Endpoints:**
- `POST /api/v1/xero/sync_contacts` - Queue job
- `GET /api/v1/xero/sync_status` - Current sync stats
- `GET /api/v1/xero/sync_history` - Recent sync activity

---

## RULE #15.8: Payment Sync Workflow

**Payments sync in this order: PO → Invoice → Payment → Xero.**

❌ **NEVER create Xero payment before local Payment record**
✅ **ALWAYS link Payment to PurchaseOrder**

**Code location:** `XeroPaymentSyncService`

**Workflow:**
1. User creates Payment in Trapid (linked to PO)
2. Payment record includes `xero_invoice_id` from matched invoice
3. Click "Sync to Xero" button
4. `XeroPaymentSyncService` creates payment in Xero
5. Store `xero_payment_id` on Payment record

**Required fields for Payment model:**
```ruby
add_column :payments, :xero_payment_id, :string
add_column :payments, :synced_to_xero_at, :datetime
```

---

## Protected Code Patterns

### Pattern #1: Secure Token Refresh
**Location:** `XeroApiClient#make_request`

**DO NOT MODIFY:**
```ruby
def make_request(method, endpoint, data = {})
  credential = ensure_valid_token  # MUST refresh if expired

  # Try request with current token
  response = execute_request(method, endpoint, data, credential)

  # If 401, refresh token and retry ONCE
  if response.code == 401
    credential = refresh_access_token
    response = execute_request(method, endpoint, data, credential)
  end

  response
end
```

**Why:** Prevents infinite retry loops, ensures token freshness.

### Pattern #2: OData Query Sanitization
**Location:** `xero_controller.rb:600-606`

**DO NOT MODIFY:**
```ruby
sanitized_query = query.gsub('\\', '\\\\\\\\').gsub('"', '\\"')
where_clause = "Name.Contains(\"#{sanitized_query}\")"
```

**Why:** Prevents OData injection attacks. Escaping is critical.

### Pattern #3: Webhook Signature Timing-Safe Comparison
**Location:** `xero_controller.rb:716`

**DO NOT MODIFY:**
```ruby
ActiveSupport::SecurityUtils.secure_compare(signature, expected_signature)
```

**Why:** Prevents timing attacks. Standard string comparison is vulnerable.

---

## Glossary

**Terms:**
- **Tenant**: Xero organization (company account)
- **OAuth 2.0**: Authentication protocol used by Xero
- **Refresh Token**: Long-lived token to get new access tokens
- **Access Token**: Short-lived token (30min) for API requests
- **OData**: Query language used by Xero API
- **HMAC-SHA256**: Cryptographic signature for webhooks
- **Chart of Accounts**: List of financial accounts in Xero
- **Tax Rate**: GST/VAT rates configured in Xero

---

## Environment Variables

**Required:**
```bash
XERO_CLIENT_ID=your_oauth_client_id
XERO_CLIENT_SECRET=your_oauth_client_secret
XERO_REDIRECT_URI=https://yourdomain.com/api/v1/xero/callback
XERO_WEBHOOK_KEY=your_webhook_signing_key
```

---

## API Endpoints

**Authentication:**
- `GET /api/v1/xero/auth_url` - Get OAuth URL
- `POST /api/v1/xero/callback` - Handle OAuth callback
- `GET /api/v1/xero/status` - Connection status
- `DELETE /api/v1/xero/disconnect` - Disconnect

**Data Sync:**
- `POST /api/v1/xero/sync_contacts` - Queue contact sync job
- `GET /api/v1/xero/sync_status` - Sync statistics
- `GET /api/v1/xero/sync_history` - Recent sync activity

**Invoices & Payments:**
- `GET /api/v1/xero/invoices` - Fetch invoices
- `POST /api/v1/xero/match_invoice` - Match to PO
- `POST /api/v1/payments/:id/sync_to_xero` - Sync payment

**Reference Data:**
- `GET /api/v1/xero/tax_rates` - Fetch tax rates
- `GET /api/v1/xero/accounts` - Fetch chart of accounts
- `GET /api/v1/xero/search_contacts?query=...` - Search contacts

**Webhooks:**
- `POST /api/v1/xero/webhook` - Receive Xero events

---

# Chapter 16: Payments & Financials

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 16               │
│ 📘 USER MANUAL (HOW): Chapter 16               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 17: Workflows & Automation

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 17               │
│ 📘 USER MANUAL (HOW): Chapter 17               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 18: Custom Tables & Formulas

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 18               │
│ 📘 USER MANUAL (HOW): Chapter 18               │
└─────────────────────────────────────────────────┘

**Content TBD**

---

## 📋 Quick Checklist Before Committing

- [ ] Followed all RULES in relevant chapters
- [ ] Did NOT modify Protected Code Patterns
- [ ] Updated Bible if new RULE discovered
- [ ] Updated Lexicon if bug fixed
- [ ] Tested changes locally

---

**Last Updated:** 2025-11-16
**Maintained By:** Development Team
**Authority Level:** ABSOLUTE
