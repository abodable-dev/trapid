# TRAPID LEXICON - Bug History & Knowledge Base

**Version:** 1.0.0
**Last Updated:** 2025-11-16 21:31 AEST
**Authority Level:** Reference (supplements Bible)
**Audience:** Claude Code + Human Developers

---

## 🔴 CRITICAL: Read This First

### This Document is "The Lexicon"

This file is the **knowledge base** for all Trapid development.

**This Lexicon Contains KNOWLEDGE ONLY:**
- 🐛 Bug history (what went wrong, how we fixed it)
- 🏛️ Architecture decisions (why we chose X over Y)
- 📊 Test catalog (what tests exist, what's missing)
- 🔍 Known gaps (what needs to be built)

**For RULES (MUST/NEVER/ALWAYS):**
- 📖 See [TRAPID_BIBLE.md](TRAPID_BIBLE.md)

**For USER GUIDES (how to use features):**
- 📘 See [TRAPID_USER_MANUAL.md](TRAPID_USER_MANUAL.md)

---

## 💾 Database-Driven Lexicon

**IMPORTANT:** This file is auto-generated from the `documented_bugs` database table.

**To edit entries:**
1. Go to Documentation page in Trapid
2. Click "📕 TRAPID Lexicon"
3. Use the UI to add/edit/delete entries
4. Run `rake trapid:export_lexicon` to update this file

**Single Source of Truth:** Database (not this file)

---

## Table of Contents

- [Chapter 0: System-Wide Knowledge](#chapter-0-system-wide-knowledge)
- [Chapter 1: Authentication & Users](#chapter-1-authentication-users)
- [Chapter 2: System Administration](#chapter-2-system-administration)
- [Chapter 3: Contacts & Relationships](#chapter-3-contacts-relationships)
- [Chapter 4: Price Books & Suppliers](#chapter-4-price-books-suppliers)
- [Chapter 5: Jobs & Construction Management](#chapter-5-jobs-construction-management)
- [Chapter 6: Estimates & Quoting](#chapter-6-estimates-quoting)
- [Chapter 7: AI Plan Review](#chapter-7-ai-plan-review)
- [Chapter 8: Purchase Orders](#chapter-8-purchase-orders)
- [Chapter 9: Gantt & Schedule Master](#chapter-9-gantt-schedule-master)
- [Chapter 10: Project Tasks & Checklists](#chapter-10-project-tasks-checklists)
- [Chapter 11: Weather & Public Holidays](#chapter-11-weather-public-holidays)
- [Chapter 12: OneDrive Integration](#chapter-12-onedrive-integration)
- [Chapter 13: Outlook/Email Integration](#chapter-13-outlook-email-integration)
- [Chapter 14: Chat & Communications](#chapter-14-chat-communications)
- [Chapter 15: Xero Accounting Integration](#chapter-15-xero-accounting-integration)
- [Chapter 16: Payments & Financials](#chapter-16-payments-financials)
- [Chapter 17: Workflows & Automation](#chapter-17-workflows-automation)
- [Chapter 18: Custom Tables & Formulas](#chapter-18-custom-tables-formulas)
- [Chapter 19: UI/UX Standards & Patterns](#chapter-19-ui-ux-standards-patterns)
- [Chapter 20: Agent System & Automation](#chapter-20-agent-system-automation)

---


# Chapter 0: System-Wide Knowledge

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  0               │
│ 📘 USER MANUAL (HOW): Chapter  0               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚡ Unmigrated Schema Changes (working_days column)

**Status:** ⚡ FIXED
**First Reported:** Unknown
**Severity:** Medium

#### Summary
The `working_days` column was added manually to `company_settings` table without creating a migration file. When the test tried to use `working_days`, it failed with "undefined method" despite the column existing in the database.

#### Scenario
The `working_days` column was added manually to `company_settings` table without creating a migration file. When the test tried to use `working_days`, it failed with "undefined method" despite the column existing in the database.

#### Root Cause
1. Column was added directly to staging database (via console or manual SQL)
2. No migration file created to track this schema change
3. ActiveRecord's schema cache didn't recognize the column
4. Test failed: `undefined method 'working_days' for an instance of CompanySetting`

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 1: Authentication & Users

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  1               │
│ 📘 USER MANUAL (HOW): Chapter  1               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚡ Nil User in Authorization Check

**Status:** ⚡ FIXED
**First Reported:** Unknown
**Severity:** Critical

#### Summary
User attempts to update schedule template rows via Gantt drag-and-drop. API returns error:

#### Scenario
User attempts to update schedule template rows via Gantt drag-and-drop. API returns error:

#### Root Cause
1. `ApplicationController#authorize_request` decoded JWT token but didn't validate that `@current_user` was set
2. If JWT was missing/invalid, `decoded` would be `nil` → `@current_user` remained `nil`
3. No error was raised - request continued
4. When `check_can_edit_templates` called `@current_user.can_create_templates?`, it failed with NoMethodError

#### Prevention
- ALWAYS use safe navigation (`&.`) when calling methods on `@current_user`
- Ensure `authorize_request` validates `@current_user` is not nil
- Return proper 401 Unauthorized instead of allowing nil to propagate

**Component:** ScheduleTemplateRows

---

### ⚡ JWT Token Expiration Not Handled in Frontend

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
User logs in, leaves tab open for 25 hours, makes request → 401 Unauthorized error.

#### Scenario
User logs in, leaves tab open for 25 hours, makes request → 401 Unauthorized error.

#### Root Cause
JWT tokens expire after 24 hours with NO automatic refresh mechanism.

---

### ⚡ No Account Lockout for Admin Users

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
Attacker brute forces admin user password with unlimited attempts.

#### Scenario
Attacker brute forces admin user password with unlimited attempts.

#### Root Cause
Account lockout only implemented for `PortalUser`, not `User` model.

---

### ⚡ Password Reset Email Disabled

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
User requests password reset → token generated but NO email sent.

#### Scenario
User requests password reset → token generated but NO email sent.

**Component:** Users

---

### ⚡ OAuth Token Expiration Not Monitored

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Low

#### Summary
User logs in via Microsoft OAuth → token expires after 1 hour → OneDrive API calls fail silently.

#### Scenario
User logs in via Microsoft OAuth → token expires after 1 hour → OneDrive API calls fail silently.

#### Root Cause
`oauth_expires_at` field is stored but not checked before API calls.

#### Solution
Check token expiration before OneDrive API calls:

**Component:** OmniauthCallbacks

---

## 🏛️ Architecture

### Design Decisions & Rationale

### 1. JWT vs Session-Based Auth (Design Decision)

**Decision:** Stateless authentication using JWT tokens instead of session cookies for API-friendly architecture

**Details:**
**Why JWT?**
- Stateless: No server-side session storage
- API-friendly: Works well with React SPA
- Mobile-ready

**Trade-offs:**
- Cannot revoke tokens
- Larger size than session ID

---

### 2. Role System Architecture

**Decision:** Hardcoded enum roles in User model for security and performance

**Details:**
Roles are hardcoded rather than database-driven to prevent privilege escalation via API exploits.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 2: System Administration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  2               │
│ 📘 USER MANUAL (HOW): Chapter  2               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 3: Contacts & Relationships

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  3               │
│ 📘 USER MANUAL (HOW): Chapter  3               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚠️ Xero Sync Creates Duplicate Contacts for Name Variations

**Status:** ⚠️ BY_DESIGN
**First Reported:** 2025-09-20
**Last Occurred:** 2025-11-10
**Severity:** Medium

#### Summary
Xero contact "ABC Plumbing Pty Ltd" and existing local contact "ABC Plumbing" are treated as different contacts during sync, creating duplicates.

#### Scenario
Xero contact "ABC Plumbing Pty Ltd" and existing local contact "ABC Plumbing" are treated as different contacts during sync, creating duplicates.

#### Root Cause
Fuzzy match threshold set at 85% similarity doesn't catch common business suffix variations like "Pty Ltd" vs no suffix, "Trading As" vs legal name, ampersand vs "and".

#### Solution
1. Manual Merge: Use POST /api/v1/contacts/merge. 2. Preventive: Set tax_number (ABN/ACN) - Priority 2 matching catches these. 3. Workaround: Manually link via POST /api/v1/contacts/:id/link_xero_contact

#### Prevention
Always set ABN for Australian businesses to enable Priority 2 matching

**Component:** XeroContactSync

---

### ⚡ Contact Merge Fails When Supplier Has Active Purchase Orders

**Status:** ⚡ FIXED
**First Reported:** 2025-11-04
**Last Occurred:** 2025-11-04
**Fixed Date:** 2025-11-05
**Severity:** High

#### Summary
Attempting to merge two supplier contacts fails with foreign key constraint error when source supplier has purchase orders.

#### Scenario
Attempting to merge two supplier contacts fails with foreign key constraint error when source supplier has purchase orders.

#### Root Cause
Merge controller was updating PricebookItem and PriceHistory foreign keys, but forgot to update PurchaseOrder.supplier_id.

#### Solution
Added missing PurchaseOrder update: PurchaseOrder.where(supplier_id: source.id).update_all(supplier_id: target.id)

#### Prevention
Always check ALL foreign key relationships when implementing merge features

**Component:** ContactMerge

---

### ⚡ Primary Contact Person Not Enforced on Xero Sync

**Status:** ⚡ FIXED
**First Reported:** 2025-10-12
**Last Occurred:** 2025-10-12
**Fixed Date:** 2025-10-15
**Severity:** Low

#### Summary
After Xero contact sync, contacts end up with multiple is_primary = true contact persons.

#### Scenario
After Xero contact sync, contacts end up with multiple is_primary = true contact persons.

#### Root Cause
XeroContactSyncService was creating ContactPerson records directly without triggering callbacks

#### Solution
Changed to use single record creation which triggers callbacks

#### Prevention
Added validation test in contact_person_spec.rb

**Component:** XeroContactSync

---

### ⚡ Portal Password Reset Loop for Locked Accounts

**Status:** ⚡ FIXED
**First Reported:** 2025-10-28
**Last Occurred:** 2025-10-28
**Fixed Date:** 2025-11-01
**Severity:** Medium

#### Summary
Portal users locked out after 5 failed attempts cannot reset password because password reset endpoint also checks locked? status.

#### Scenario
Portal users locked out after 5 failed attempts cannot reset password because password reset endpoint also checks locked? status.

#### Root Cause
Password reset endpoint was checking lockout status, preventing locked users from resetting passwords

#### Solution
Modified password reset endpoint to skip lockout check and clear locked_until and failed_login_attempts on successful reset

#### Prevention
Only check lockout on login attempts, not password resets

**Component:** PortalAuth

---

### ⚠️ Bidirectional Relationship Cascade Causes Infinite Loop

**Status:** ⚠️ BY_DESIGN
**First Reported:** 2025-09-15
**Severity:** Critical

#### Summary
Creating a relationship triggers after_create which creates the reverse, which triggers another after_create, leading to infinite recursion.

#### Scenario
Creating a relationship triggers after_create which creates the reverse, which triggers another after_create, leading to infinite recursion.

#### Root Cause
Bidirectional relationships need to create reverse relationships automatically without protection

#### Solution
Use Thread-local flag to prevent recursion: Thread.current[:creating_reverse_relationship]

#### Prevention
This pattern MUST be used for all bidirectional associations. See BIBLE RULE #3.2

**Component:** ContactRelationship

---

### 🔄 Contact Activity Log Growing Too Large (>10k Records)

**Status:** 🔄 MONITORING
**First Reported:** 2025-10-20
**Severity:** Low

#### Summary
Contacts with high Xero sync frequency accumulate thousands of ContactActivity records, slowing down activities endpoint

#### Scenario
Contacts with high Xero sync frequency accumulate thousands of ContactActivity records, slowing down activities endpoint

#### Root Cause
No archival or pagination for activity logs

#### Solution
Activities endpoint limits to 50 most recent records

#### Prevention
Consider adding archival for activities older than 6 months, implement pagination

**Component:** ContactActivity

---

### ⚡ Portal User Email Validation Too Strict

**Status:** ⚡ FIXED
**First Reported:** 2025-10-22
**Fixed Date:** 2025-10-25
**Severity:** Low

#### Summary
Portal user creation fails for valid email addresses with plus addressing or subdomains

#### Scenario
Portal user creation fails for valid email addresses with plus addressing or subdomains

#### Root Cause
Email validation regex was overly restrictive

#### Solution
Changed to use Ruby's built-in URI::MailTo::EMAIL_REGEXP

#### Prevention
Use standard email validation libraries instead of custom regex

**Component:** PortalUser

---

### ⚡ Contact Type Filter Returns Wrong Results for "Both"

**Status:** ⚡ FIXED
**First Reported:** 2025-10-15
**Fixed Date:** 2025-10-18
**Severity:** Medium

#### Summary
Filtering contacts with ?type=both returns contacts that are customer OR supplier instead of customer AND supplier

#### Scenario
Filtering contacts with ?type=both returns contacts that are customer OR supplier instead of customer AND supplier

#### Root Cause
Controller was using array overlap check (&&) instead of array containment (@>)

#### Solution
Changed to array containment operator: contact_types @> ARRAY['customer', 'supplier']::varchar[]

#### Prevention
Use @> for AND logic on PostgreSQL arrays, && for OR logic

**Component:** ContactsController

---

### ⚡ Deleting Contact Doesn't Clear Related Supplier References

**Status:** ⚡ FIXED
**First Reported:** 2025-09-25
**Fixed Date:** 2025-09-28
**Severity:** High

#### Summary
Deleting a contact that has linked suppliers leaves orphaned SupplierContact records

#### Scenario
Deleting a contact that has linked suppliers leaves orphaned SupplierContact records

#### Root Cause
Missing dependent: :destroy on has_many :supplier_contacts association

#### Solution
Added cascade delete: has_many :supplier_contacts, dependent: :destroy

#### Prevention
Added model test to verify cascade deletion

**Component:** Contact

---

### ⚠️ Xero Sync Rate Limiting Causes Timeout on Large Contact Lists

**Status:** ⚠️ BY_DESIGN
**First Reported:** 2025-11-08
**Severity:** Low

#### Summary
Syncing 500+ contacts from Xero takes over 10 minutes due to 1.2-second delay, causing Heroku timeout

#### Scenario
Syncing 500+ contacts from Xero takes over 10 minutes due to 1.2-second delay, causing Heroku timeout

#### Root Cause
Xero API has 60 requests/minute limit. With 500 contacts sync takes 600 seconds

#### Solution
Run Xero sync as background job: XeroContactSyncJob.perform_later

#### Prevention
Large syncs must use background jobs

**Component:** XeroContactSync

---

## 🏛️ Architecture

### Design Decisions & Rationale

### 1. Contact Type System

**Decision:** PostgreSQL array column for contact_types to support hybrid entities

**Details:**
Uses varchar[] to allow contacts to be both customers and suppliers simultaneously. GIN indexes provide fast querying.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 4: Price Books & Suppliers

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  4               │
│ 📘 USER MANUAL (HOW): Chapter  4               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚡ Duplicate Price History Entries on Rapid Updates

**Status:** ⚡ FIXED
**First Reported:** Unknown
**Fixed Date:** 2024-10-12
**Severity:** Medium

#### Summary
When a user rapidly updates the same pricebook item's price multiple times in quick succession (e.g., correcting a typo), duplicate price history entries were created with identical timestamps, causing confusion in price tracking and bloating the database.

#### Scenario
When a user rapidly updates the same pricebook item's price multiple times in quick succession (e.g., correcting a typo), duplicate price history entries were created with identical timestamps, causing confusion in price tracking and bloating the database.

#### Root Cause
- `after_update` callback triggers immediately on each save
- Two saves within the same second create records with identical `created_at` timestamps
- No database constraint prevented duplicate (item_id, supplier_id, price, timestamp) combinations

#### Solution
1. **Database Constraint:** Added unique index on `[:pricebook_item_id, :supplier_id, :new_price, :created_at]` (see Bible RULE #4.2)
2. **5-Second Time Window:** `track_price_change` callback checks if identical price exists within 5 seconds before creating new history
3. **Race Condition Safe:** `rescue ActiveRecord::RecordNotUnique` handles concurrent saves gracefully

**Component:** PricebookItem

---

### ⚠️ SmartPoLookupService Missing Items Despite Fuzzy Match

**Status:** ⚠️ BY_DESIGN
**First Reported:** Unknown
**Severity:** Low

#### Summary
User creates estimate with item "2x4 Framing Lumber" but SmartPoLookupService doesn't match it to pricebook item "2x4 Douglas Fir Framing" even though Levenshtein distance is 72 (above 70 threshold).

#### Scenario
User creates estimate with item "2x4 Framing Lumber" but SmartPoLookupService doesn't match it to pricebook item "2x4 Douglas Fir Framing" even though Levenshtein distance is 72 (above 70 threshold).

#### Root Cause
- 6-strategy cascade prioritizes **exact match with supplier** and **fuzzy match with supplier** first
- If estimate line item has `preferred_supplier_id` set, strategies 4-6 (without supplier) never run
- User expects all fuzzy matches regardless of supplier constraint

#### Solution
**THIS IS BY DESIGN** - The cascade strategy intentionally respects supplier constraints to ensure:
1. Supplier relationships are honored (e.g., preferred vendors per job)
2. Pricing accuracy (different suppliers have different prices)
3. PO grouping efficiency (minimizes split orders)

**Component:** SmartPoLookupService

---

### ⚡ Price Volatility False Positives on New Items

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Low

#### Summary
New pricebook items with only 2-3 price history entries show "High Volatility" warnings even when prices are stable, because Coefficient of Variation (CV) is mathematically unreliable with small sample sizes.

#### Scenario
New pricebook items with only 2-3 price history entries show "High Volatility" warnings even when prices are stable, because Coefficient of Variation (CV) is mathematically unreliable with small sample sizes.

#### Root Cause
- CV = (Standard Deviation / Mean) × 100
- Small sample sizes (n < 5) exaggerate CV due to limited data
- First few price updates naturally have higher variance

#### Solution
1. **Minimum Sample Requirement:** `calculate_price_volatility` requires at least 5 price history entries before calculating CV
2. **Return nil for insufficient data:** UI shows "Insufficient Data" instead of misleading volatility score
3. **6-Month Rolling Window:** Only recent prices count, ensuring CV reflects current volatility

**Component:** PricebookItem

---

### ⚡ Supplier Name Normalization Overly Aggressive

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Low

#### Summary
Two distinct suppliers "ABC Supply LLC" and "ABC Supply Co." both normalize to "ABC SUPPLY", causing incorrect fuzzy matches in SmartPoLookupService.

#### Scenario
Two distinct suppliers "ABC Supply LLC" and "ABC Supply Co." both normalize to "ABC SUPPLY", causing incorrect fuzzy matches in SmartPoLookupService.

#### Root Cause
- Normalization removes common business suffixes: LLC, Inc, Corp, Ltd, Co., Company, Supply Co
- Edge case: "ABC Supply Co." has "Supply Co" suffix removed even though "Supply" is part of business name
- Levenshtein distance calculated on normalized names

#### Solution
**KNOWN LIMITATION** - Current normalization is intentionally broad to catch variations like:
- "Home Depot" vs "Home Depot Inc."
- "Lowes" vs "Lowe's Companies LLC"

**Component:** PricebookItem

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 5: Jobs & Construction Management

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  5               │
│ 📘 USER MANUAL (HOW): Chapter  5               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚡ Task Cascade Infinite Loop Risk

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** High

#### Summary
When task dates change, `ScheduleCascadeService` recursively cascades to dependent tasks. Without proper safeguards, this could create infinite loops in cyclic schedules or repeatedly cascade to manually positioned tasks.

#### Scenario
When task dates change, `ScheduleCascadeService` recursively cascades to dependent tasks. Without proper safeguards, this could create infinite loops in cyclic schedules or repeatedly cascade to manually positioned tasks.

#### Root Cause
- Recursive cascade could revisit the same task multiple times
- Manually positioned tasks (user-set dates) should not be auto-updated
- Circular dependencies could cause infinite recursion

#### Solution
1. **Circular Dependency Prevention:** `TaskDependency` validates `no_circular_dependencies` using BFS graph traversal (see Bible RULE #5.3)
2. **Manual Position Respect:** Skip tasks with `manually_positioned?` flag in cascade
3. **Single Pass Per Task:** Each cascade operation processes downstream once only

**Component:** ScheduleCascadeService

---

### ⚠️ Profit Calculation Performance at Scale

**Status:** ⚠️ BY_DESIGN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
Construction profit is calculated dynamically via `calculate_live_profit` which sums all PO totals. For jobs with 100+ purchase orders, this can cause N+1 query issues or slow API responses.

#### Scenario
Construction profit is calculated dynamically via `calculate_live_profit` which sums all PO totals. For jobs with 100+ purchase orders, this can cause N+1 query issues or slow API responses.

#### Root Cause
- No caching of profit values (intentional per Bible RULE #5.2)
- Each API request recalculates: `purchase_orders.sum(:total)`
- Construction detail page requests profit multiple times

**Component:** Constructions

---

### ⚡ OneDrive Folder Creation Failures

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
**Status:** 🟢 HANDLED WITH RETRIES
**Severity:** Medium
**Common Failure Modes:** Token expiration, network timeout, duplicate folder names

**Common Errors:**

---

### ⚡ Task Spawning Duplicates (Photo/Cert Tasks)

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
If parent task status is updated multiple times (e.g., `complete` → `in_progress` → `complete`), photo and certificate tasks could be spawned multiple times.

#### Scenario
If parent task status is updated multiple times (e.g., `complete` → `in_progress` → `complete`), photo and certificate tasks could be spawned multiple times.

#### Root Cause
- `after_save :spawn_child_tasks_on_status_change` fires on every save
- No check for existing spawned tasks before creating

#### Solution
```ruby
# Check which predecessors are blocking
task.blocked_by  # Returns array of incomplete predecessor tasks

# Complete predecessors first, then mark task in_progress

**Component:** ProjectTask

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 6: Estimates & Quoting

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  6               │
│ 📘 USER MANUAL (HOW): Chapter  6               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚠️ Fuzzy Matching False Positives at 70-75% Threshold

**Status:** ⚠️ BY_DESIGN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
Job names like "Smith Residence" might auto-match to "Smith Commercial Building" at 72% confidence when they're completely different projects.

#### Scenario
Job names like "Smith Residence" might auto-match to "Smith Commercial Building" at 72% confidence when they're completely different projects.

#### Root Cause
- 70% auto-match threshold is aggressive
- Word-matching bonus (+15 per word) inflates scores
- "Smith" as common name boosts unrelated jobs

#### Solution
1. **Current:** Users can reject auto-match and manually select correct job
2. **Mitigation:** Threshold tuning based on production data
3. **Future:** Add address-based validation (if addresses available in estimate)

---

### ⚡ Levenshtein Performance with Very Long Job Names

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Low

#### Summary
Job names exceeding 150 characters (rare but possible) cause Levenshtein calculation to take 50-100ms.

#### Scenario
Job names exceeding 150 characters (rare but possible) cause Levenshtein calculation to take 50-100ms.

#### Root Cause
- O(m*n) complexity where m,n = string lengths
- Matrix allocation for long strings
- Pure Ruby implementation (no C extension)

---

### ⚡ Estimate Import Fails Silently on Malformed JSON

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** High

#### Summary
If Unreal Engine sends malformed JSON (e.g., trailing commas, unquoted keys), Rails parses it incorrectly and estimate import fails without clear error to user.

#### Scenario
If Unreal Engine sends malformed JSON (e.g., trailing commas, unquoted keys), Rails parses it incorrectly and estimate import fails without clear error to user.

#### Prevention
Validate JSON format before processing in Unreal Engine.

---

---

### ⚡ AI Review Timeout on Large PDFs

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
PDFs exceeding 50 pages cause Claude API calls to timeout (>5 minutes) even with pagination.

#### Scenario
PDFs exceeding 50 pages cause Claude API calls to timeout (>5 minutes) even with pagination.

#### Root Cause
- Claude has per-request token limits
- 50-page PDFs = 100k+ tokens
- Processing exceeds 5-minute timeout

#### Solution
1. Regenerate key: `integration.generate_api_key`
2. Copy new key to Unreal Engine config
3. Test with curl:
   ```bash
   curl -X POST https://trapid-backend.herokuapp.com/api/v1/external/unreal_estimates \
     -H "X-API-Key: YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"job_name": "Test", "materials": [{"item": "Test", "quantity": 1}]}'
   ```

---

### "Estimate Auto-Matched to Wrong Job"

#### Prevention
If this happens frequently:
1. Increase auto-match threshold to 75%
2. Add address validation (if available)
3. Require manual confirmation for 70-75% matches

---

### "AI Review Stuck in 'Processing' Status"

**Component:** EstimateToPurchaseOrderService

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 7: AI Plan Review

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  7               │
│ 📘 USER MANUAL (HOW): Chapter  7               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 8: Purchase Orders

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  8               │
│ 📘 USER MANUAL (HOW): Chapter  8               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚡ Race Condition in PO Number Generation

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
Two users create POs simultaneously → potential for duplicate PO numbers.

#### Scenario
Two users create POs simultaneously → potential for duplicate PO numbers.

---

### ⚡ Payment Status Calculation Confusion

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
User sets `amount_paid = $990` on PO with `total = $1000`.
Payment status shows "Part Payment" instead of "Complete".

#### Scenario
User sets `amount_paid = $990` on PO with `total = $1000`.
Payment status shows "Part Payment" instead of "Complete".

---

### ⚡ Smart Lookup Returns Wrong Supplier

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
User expects "ABC Supplier" but system selects "XYZ Supplier" for item.

#### Scenario
User expects "ABC Supplier" but system selects "XYZ Supplier" for item.

#### Solution
1. Check category default: Settings → Price Books → Categories
2. Update default supplier if needed
3. Or manually override after smart lookup

---

### ⚡ Price Drift Warning on First-Time Items

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Low

#### Summary
New item has no pricebook entry → shows "N/A" drift → confusing to users.

#### Scenario
New item has no pricebook entry → shows "N/A" drift → confusing to users.

#### Solution
```ruby
ActiveRecord::Base.transaction do
  # Step 1: Unlink old task
  if old_task = purchase_order.schedule_task
    old_task.update!(purchase_order_id: nil)
  end

  # Step 2: Link new task
  if new_task_id.present?
    new_task = ScheduleTask.find(new_task_id)
    new_task.update!(purchase_order_id: purchase_order.id)
  end
end

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 9: Gantt & Schedule Master

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  9               │
│ 📘 USER MANUAL (HOW): Chapter  9               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚡ Gantt Shaking During Cascade Operations

**Status:** ⚡ FIXED
**First Reported:** 2025-11-16
**Fixed Date:** 2025-11-16
**Severity:** Medium

#### Summary
Visual flickering caused by excessive Gantt reloads during cascade operations

#### Scenario
Gantt chart displayed visual shaking or slow flickering during cascade operations. Console logs showed 5+ Gantt reloads within 2-3 seconds during a single drag operation.

#### Root Cause
The signature-based reload fix (implemented to show cascade updates visually) was triggering a reload for EVERY cascade batch update. Each cascade wave created multiple signature changes, and there was no throttling mechanism during multi-wave cascade operations.

#### Solution
Three-part fix using cascade depth tracking: 1) Pass cascadeDepthRef to DHtmlxGanttView, 2) Throttle signature-based reloads when cascade depth > 0, 3) Trigger one final reload when cascade depth returns to 0

#### Prevention
Always check cascade depth before allowing signature-based reloads. Batch all cascade updates into one final reload after operations complete.

**Component:** DHtmlxGanttView + ScheduleTemplateEditor

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 10: Project Tasks & Checklists

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 10               │
│ 📘 USER MANUAL (HOW): Chapter 10               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 11: Weather & Public Holidays

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 11               │
│ 📘 USER MANUAL (HOW): Chapter 11               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 12: OneDrive Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 12               │
│ 📘 USER MANUAL (HOW): Chapter 12               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 13: Outlook/Email Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 13               │
│ 📘 USER MANUAL (HOW): Chapter 13               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 14: Chat & Communications

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 14               │
│ 📘 USER MANUAL (HOW): Chapter 14               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 15: Xero Accounting Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 15               │
│ 📘 USER MANUAL (HOW): Chapter 15               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 16: Payments & Financials

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 16               │
│ 📘 USER MANUAL (HOW): Chapter 16               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 17: Workflows & Automation

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 17               │
│ 📘 USER MANUAL (HOW): Chapter 17               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 18: Custom Tables & Formulas

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 18               │
│ 📘 USER MANUAL (HOW): Chapter 18               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 19: UI/UX Standards & Patterns

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 19               │
│ 📘 USER MANUAL (HOW): Chapter 19               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚡ Search Boxes Missing Clear Buttons (73 components)

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** High

#### Summary
**Impact:** 73 search boxes across codebase
**Severity:** HIGH - UX regression
**Rule Violation:** RULE #19.20 (Search Functionality Standards)

**Problem:** Search inputs lack clear button (X icon) to quickly reset search

**Automation:** YES - Script can add clear button to all search boxes (30-40 min)

**Affected Pages:** ContactsPage, PriceBooksPage, SuppliersPage, PurchaseOrdersPage, +40 more


---

### ⚡ Modals Missing Close Buttons (58 components)

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** High

#### Summary
**Impact:** 58 modals across codebase
**Severity:** HIGH - Accessibility issue
**Rule Violation:** RULE #19.22 (Modal Rules)
**Current State:** 78 modals have close button, 58 do not

**Problem:** Modals lack visible close button in top-right corner

**Automation:** YES - Template can be applied to all modals (20-30 min)

**Affected Modals:** NewJobModal, EditJobModal, PurchaseOrderModal, +50 more


---

### ⚡ Empty States Missing Action Buttons (66 components)

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** High

#### Summary
**Impact:** 66 empty states
**Severity:** HIGH - UX conversion issue
**Rule Violation:** RULE #19.27 (Empty State Rules)
**Current State:** 14 with action buttons, 66 without

**Problem:** Empty states show message but no call-to-action button

**Automation:** PARTIAL - Manual work required (1-2 hours total)


---

### ⚡ Table Headers Not Sticky (36 tables)

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** High

#### Summary
**Impact:** 36 tables
**Severity:** HIGH - Scrolling UX
**Rule Violation:** RULE #19.2 (Sticky Headers)
**Current State:** 18 with sticky headers, 36 without

**Problem:** Headers scroll out of view in large tables

**Automation:** YES - Add `sticky top-0 z-10` to thead (15-20 min)


---

### ⚡ Inline Column Filters Missing (44 tables)

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
**Impact:** 44 tables
**Severity:** MEDIUM - Feature completeness
**Rule Violation:** RULE #19.3 (Table Standards)

**Problem:** No filter inputs in column headers for power users

**Automation:** NO - Manual work (3-5 hours)

**Affected Pages:** PriceBooksPage (2 tables), SuppliersPage, JobDetailPage (3 tables), ContactDetailPage (3 tables)


---

### ⚡ Icon Buttons Missing aria-label (50 components)

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
**Impact:** ~50 icon buttons
**Severity:** MEDIUM - Screen reader support
**Rule Violation:** RULE #19.12 (Accessibility)

**Problem:** Icon-only buttons have no label for screen readers

**Automation:** PARTIAL - Requires semantic label for each button (1-2 hours)


---

### ⚡ Search Results Count Not Displayed (53 components)

**Status:** ⚡ OPEN
**First Reported:** Unknown
**Severity:** Medium

#### Summary
**Impact:** 53 search boxes
**Severity:** MEDIUM - User feedback/clarity
**Rule Violation:** RULE #19.20 (Search Standards)

**Problem:** No count of results shown when user searches

**Automation:** YES - Template addition (30 min)


---

## 🏛️ Architecture

### Design Decisions & Rationale

### 1. HeadlessUI + Heroicons Architecture Decision

**Decision:** **Decision:** Use HeadlessUI for component composition + Heroicons for consistent icons

**Rationale:**
- Composability: HeadlessUI provides unstyled, accessible components styled with TailwindCSS
- Accessibility Built-in: ARIA attributes handled automatically
- Icon Consistency: Heroicons (24-outline style) across all 200+ icon usages
- Package Integration: Both officially maintained by Tailwind Labs

**Evidence:**
- 20+ component files import HeadlessUI (Tab, Dialog, Menu, etc.)
- All icons from `@heroicons/react/24/outline`
- Packages: `@headlessui/react: ^2.2.9`, `@heroicons/react: ^2.2.0`

**Protected Pattern:** HeadlessUI patterns must be preserved in all modals/dropdowns


---

### 2. TailwindCSS Styling Strategy (No CSS-in-JS)

**Decision:** **Decision:** Pure TailwindCSS with dark mode via `dark:` prefix (no CSS-in-JS)

**Rationale:**
- Performance: No runtime style generation (compiled at build time)
- Type Safety: ClassName strings catch typos at development time
- Dark Mode Built-In: Tailwind's `dark:` prefix requires no additional libraries
- Predictable Output: CSS generated once, not recalculated per component

**Evidence:**
- 5,920+ `dark:` prefixed classes throughout codebase
- Zero CSS-in-JS libraries (no styled-components, emotion)
- Minimal tailwind.config.js (no custom plugins)

**Protected Pattern:** No CSS-in-JS conversions planned


---

### 3. ContactsPage as Gold Standard Reference

**Decision:** **Decision:** ContactsPage.jsx designated as primary reference implementation

**Rationale - Feature Complete:**
- Sticky headers ✅
- Column resize with drag handles ✅
- Column reorder (drag-drop) ✅
- Inline column filters ✅
- Search with clear button ✅
- Multi-level sort ✅
- localStorage persistence ✅
- Dark mode support ✅
- Row actions ✅
- Empty states with action buttons ✅

**File:** `frontend/src/pages/ContactsPage.jsx` (372 lines)

**Use As Reference For:**
- Column state management patterns
- URL-based tab sync
- Table feature implementation


---

### 4. Dark Mode Implementation Strategy

**Decision:** **Decision:** CSS-first dark mode using `prefers-color-scheme` media query

**Rationale:**
- No JavaScript Overhead: Applied via CSS, not JS state
- Respects User Preferences: Automatically responds to OS dark mode
- Manual Toggle Possible: Can be enhanced later if needed
- Accessibility Compliant: Respects `prefers-color-scheme` WCAG requirement

**Evidence:**
- Tailwind config uses default dark mode strategy (media query)
- 5,920+ dark mode class usages
- Consistent pattern: `bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`
- COLOR_SYSTEM.md documents standardized dark colors

**Protected Pattern:** All dark mode classes must be preserved


---

### 5. HeadlessUI + Heroicons Architecture Decision

**Decision:** **Decision:** Use HeadlessUI for component composition + Heroicons for consistent icons

**Rationale:**
- Composability: HeadlessUI provides unstyled, accessible components styled with TailwindCSS
- Accessibility Built-in: ARIA attributes handled automatically
- Icon Consistency: Heroicons (24-outline style) across all 200+ icon usages
- Package Integration: Both officially maintained by Tailwind Labs

**Evidence:**
- 20+ component files import HeadlessUI (Tab, Dialog, Menu, etc.)
- All icons from `@heroicons/react/24/outline`
- Packages: `@headlessui/react: ^2.2.9`, `@heroicons/react: ^2.2.0`

**Protected Pattern:** HeadlessUI patterns must be preserved in all modals/dropdowns


---

### 6. TailwindCSS Styling Strategy (No CSS-in-JS)

**Decision:** **Decision:** Pure TailwindCSS with dark mode via `dark:` prefix (no CSS-in-JS)

**Rationale:**
- Performance: No runtime style generation (compiled at build time)
- Type Safety: ClassName strings catch typos at development time
- Dark Mode Built-In: Tailwind's `dark:` prefix requires no additional libraries
- Predictable Output: CSS generated once, not recalculated per component

**Evidence:**
- 5,920+ `dark:` prefixed classes throughout codebase
- Zero CSS-in-JS libraries (no styled-components, emotion)
- Minimal tailwind.config.js (no custom plugins)

**Protected Pattern:** No CSS-in-JS conversions planned


---

### 7. ContactsPage as Gold Standard Reference

**Decision:** **Decision:** ContactsPage.jsx designated as primary reference implementation

**Rationale - Feature Complete:**
- Sticky headers ✅
- Column resize with drag handles ✅
- Column reorder (drag-drop) ✅
- Inline column filters ✅
- Search with clear button ✅
- Multi-level sort ✅
- localStorage persistence ✅
- Dark mode support ✅
- Row actions ✅
- Empty states with action buttons ✅

**File:** `frontend/src/pages/ContactsPage.jsx` (372 lines)

**Use As Reference For:**
- Column state management patterns
- URL-based tab sync
- Table feature implementation


---

### 8. Dark Mode Implementation Strategy

**Decision:** **Decision:** CSS-first dark mode using `prefers-color-scheme` media query

**Rationale:**
- No JavaScript Overhead: Applied via CSS, not JS state
- Respects User Preferences: Automatically responds to OS dark mode
- Manual Toggle Possible: Can be enhanced later if needed
- Accessibility Compliant: Respects `prefers-color-scheme` WCAG requirement

**Evidence:**
- Tailwind config uses default dark mode strategy (media query)
- 5,920+ dark mode class usages
- Consistent pattern: `bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`
- COLOR_SYSTEM.md documents standardized dark colors

**Protected Pattern:** All dark mode classes must be preserved


---

## 📊 Test Catalog

### UI Testing Infrastructure State

**Current State:**

✅ **E2E Tests:**
- Framework: Playwright v1.56.1
- Tests: 1 Gantt cascade test with bug-hunter diagnostics
- Location: `frontend/tests/e2e/gantt-cascade.spec.js`
- Features: API monitoring, state tracking, console log monitoring, screenshots

✅ **Unit Test Setup:**
- Framework: Vitest v4.0.8
- Configuration: Exists but no tests written

**Missing Tests:**
❌ Visual regression tests (Percy, BackstopJS)
❌ Accessibility tests (axe-core, jest-axe)
❌ UI component unit tests (Vitest unused)
❌ Browser compatibility (only Chromium)
❌ Responsive/mobile tests
❌ Dark mode screenshot tests
❌ Performance tests (Lighthouse)

**High Value Quick Wins:**
1. Dark mode rendering (screenshot tests)
2. Accessibility scan (axe-core automated)
3. Responsive layouts (viewport testing)
4. Color contrast (automated a11y check)
5. Search clear button functionality
6. Modal close button functionality


---

## 🎓 Developer Notes

### Chapter Documentation Pending

This chapter requires comprehensive documentation. Bug fixes and architecture decisions should be added as they are discovered.

---

### UI/UX Enhancement Roadmap

**Priority Matrix:**

**Quick Wins (1-2 hours total):**
- ✅ Fix deprecated color classes: amber→yellow, emerald→green (COMPLETED 2025-11-16)
- [ ] Add clear buttons to 73 search boxes (30-40 min, automatable)
- [ ] Add close buttons to 58 modals (20-30 min, automatable)
- [ ] Add sticky headers to 36 tables (15-20 min, automatable)

**High Impact (3-5 hours):**
- [ ] Add action buttons to 66 empty states (1-2 hours, manual)
- [ ] Add inline filters to 44 tables (3-5 hours, manual)
- [ ] Add aria-labels to 50 icon buttons (1-2 hours, manual)
- [ ] Add search result counts to 53 search boxes (30 min, automatable)

**Medium Impact (5-10 hours):**
- [ ] Badge icon enhancement (95 badges, 2-3 hours)
- [ ] URL state sync for 20 tab components (2 hours)
- [ ] Loading spinners for 12 pages (1 hour)
- [ ] Button hierarchy audit (100 buttons, 3 hours)

**Future Enhancements:**
- [ ] Storybook integration (component showcase)
- [ ] Accessibility scanning (axe-core in CI/CD)
- [ ] Performance optimization (memoization audit)
- [ ] Responsive design system documentation
- [ ] Design tokens export (Figma integration)


---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


# Chapter 20: Agent System & Automation

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 20               │
│ 📘 USER MANUAL (HOW): Chapter 20               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Bug history, architecture decisions, and test catalog
**Last Updated:** 2025-11-16

---

## 🐛 Bug Hunter

### ⚡ Agent Shortcuts Not Case-Insensitive

**Status:** ⚡ OPEN
**First Reported:** 2025-11-16
**Severity:** Low

#### Scenario
User types 'Backend Dev' (capital B) but system expects 'backend dev'.

#### Root Cause
Shortcut parsing is case-sensitive in CLAUDE.md

#### Solution
Update shortcut parser to normalize input: .toLowerCase().trim()

#### Prevention
Add test cases for case variations

**Component:** CLAUDE.md agent recognition

---

## 🏛️ Architecture

### Design Decisions & Rationale

### 1. Database-Primary Agent Configuration

**Decision:** Agent configurations are stored in database, not markdown files.

**Rationale:**
Needed structured data for run tracking, filtering, and real-time updates. Markdown files are read-only snapshots.

**Implementation:**
Created agent_definitions table with JSONB fields for metadata and run details. API endpoints for CRUD operations.

**Trade-offs:**
Trade-off: Requires database migration when adding new agents. Benefit: Live run tracking, success rates, recently_run? checks.

---

### 2. Run History Tracking with JSONB

**Decision:** Agent run history stored in JSONB fields for flexibility.

**Rationale:**
Run details vary by agent type (files_created, tests_passed, duration_seconds, etc.). Fixed schema would be too rigid.

**Implementation:**
Used JSONB columns: last_run_details and metadata for flexible storage.

**Trade-offs:**
Trade-off: No strict validation on JSONB structure. Benefit: Each agent can track custom metrics.

---

### 3. Agent Type Taxonomy (4 Types)

**Decision:** Agents categorized into 4 types: development, diagnostic, deployment, planning.

**Details:**
development: backend-developer, frontend-developer | diagnostic: production-bug-hunter, gantt-bug-hunter | deployment: deploy-manager | planning: planning-collaborator

**Rationale:**
Needed clear separation of concerns. Backend work vs frontend work vs bug hunting vs planning.

**Implementation:**
Created agent_type enum with 4 values. Each agent assigned single type.

**Trade-offs:**
Trade-off: Agents can only have one type. Benefit: Clear responsibility boundaries.

---

### 4. recently_run? Smart Test Skipping

**Decision:** Diagnostic agents check if tests ran recently to avoid redundant runs.

**Details:**
Logic: Returns false if never run | Returns false if last run failed (always re-test failures) | Returns true if last_run_at > 60 minutes ago AND last_status == 'success'

**Rationale:**
Gantt Bug Hunter runs 12 automated tests (30-60 seconds). Wasteful to re-run if nothing changed.

**Implementation:**
AgentDefinition#recently_run?(minutes = 60) returns true if last successful run was within threshold.

**Trade-offs:**
Trade-off: Stale results if threshold too high. Benefit: Faster iteration during development.

---

## 📊 Test Catalog

### Agent System Test Coverage

Testing status for Agent System components.

**Tests:**
Unit Tests Needed: AgentDefinition#record_success, AgentDefinition#record_failure, AgentDefinition#success_rate, AgentDefinition#recently_run? | Integration Tests Needed: POST /api/v1/agent_definitions/:id/record_run, GET /api/v1/agent_definitions (priority sorting), Agent invocation protocol (end-to-end) | Current Coverage: 0% (no tests written yet)

---

## 🎓 Developer Notes

### Syncing .claude/agents/*.md with Database

Two sources of agent config: .claude/agents/*.md files and agent_definitions table.

---

## 📚 Related Chapters

_Links to related chapters will be added as cross-references are identified._

---


**Last Generated:** 2025-11-16 21:31 AEST
**Generated By:** `rake trapid:export_lexicon`
**Maintained By:** Development Team via Database UI
**Review Schedule:** After each bug fix or knowledge entry