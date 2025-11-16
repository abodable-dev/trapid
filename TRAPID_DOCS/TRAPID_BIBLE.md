# TRAPID BIBLE - Development Rules

**Version:** 1.0.0
**Last Updated:** 2025-11-16 09:01 AEST
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
- [Chapter 19: UI/UX Standards & Patterns](#chapter-19-uiux-standards--patterns)

---

# Chapter 0: Overview & System-Wide Rules

┌─────────────────────────────────────────────────┐
│ 📍 IMPLEMENTATION: Chapter 0                    │
│ 📕 LEXICON (BUGS):    Chapter 0                │
│ 📘 USER MANUAL (HOW): Chapter 0                │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Authority:** ABSOLUTE
**Last Updated:** 2025-11-17 10:45 AEST

## RULE #0: Documentation Maintenance

✅ **MUST update Bible when:**

✅ **MUST update Lexicon when:**

**📖 Implementation:** See [TRAPID_TEACHER.md §0](TRAPID_TEACHER.md#0-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 0](TRAPID_LEXICON.md)

---

---

## RULE #0.1: Mandatory Chapter Reading Before Component Creation

✅ **MUST complete all three documents:**

❌ **NEVER leave a chapter partially complete**
- Bible without Lexicon = Rules without context (BAD)
- Bible without User Manual = No user-facing guide (BAD)
- Only Bible completed = INCOMPLETE Trinity (BAD)

**📖 Implementation:** See [TRAPID_TEACHER.md §0.1](TRAPID_TEACHER.md#01-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 0](TRAPID_LEXICON.md)

---

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

**📖 Implementation:** See [TRAPID_TEACHER.md §1](TRAPID_TEACHER.md#1-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

## RULE #2: API Response Format

✅ **ALWAYS return consistent JSON:**

**📖 Implementation:** See [TRAPID_TEACHER.md §2](TRAPID_TEACHER.md#2-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

## RULE #3: Database Migrations

❌ **NEVER:**
- Modify existing migrations after they've been deployed
- Delete migrations that have run in production
- Use `change` when `up`/`down` is safer
- Add columns manually without creating migrations

✅ **ALWAYS:**
- Create new migration to fix issues
- Test migrations with `db:rollback`
- Add indexes for foreign keys
- Use `add_column` with default values carefully
- Create migrations for ALL schema changes (even if applied manually)

**📖 Implementation:** See [TRAPID_TEACHER.md §3](TRAPID_TEACHER.md#3-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

## RULE #4: Agent Maintenance & Learning

✅ **MUST update agent when:**

❌ **NEVER** let the same class of bug happen twice

✅ **ALWAYS ask:** "Could an agent have prevented this?"

✅ **ALWAYS update** agent definitions when the answer is yes

**📖 Implementation:** See [TRAPID_TEACHER.md §4](TRAPID_TEACHER.md#4-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

## RULE #5: Documentation Authority Hierarchy

✅ **MUST follow these rules when documents conflict:**

✅ **MUST:**

✅ **MUST:**

✅ **MUST include date AND time when updating any Trinity documentation:**

❌ **NEVER:**
- Ignore a Bible rule because Lexicon suggests otherwise
- Follow old GANTT_BIBLE.md instead of TRAPID_BIBLE.md Chapter 9
- Override Bible rules without team discussion

❌ **NEVER:**
- Use date-only format (e.g., `2025-11-16`)
- Omit timezone
- Use relative time (e.g., "yesterday")

**📖 Implementation:** See [TRAPID_TEACHER.md §5](TRAPID_TEACHER.md#5-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

### What if Bible Rule Seems Wrong?

❌ **NEVER ignore the rule**

✅ **MUST:**
1. Discuss with team
2. If rule needs changing, update Bible + version number
3. Document why rule changed in Lexicon

**For full authority documentation, see:** [00_INDEX/DOCUMENTATION_AUTHORITY.md](00_INDEX/DOCUMENTATION_AUTHORITY.md)

---

## Chapter Relationship Map

**Understanding Feature Dependencies:**

This map shows how chapters relate to each other. When working on a feature, consult related chapters for complete context.

### Core Infrastructure (Foundation for all features)
- **Chapter 1:** Authentication & Users → Used by ALL chapters (user references, permissions)
- **Chapter 2:** System Administration → Used by ALL chapters (timezone, company settings)

### Data & Content Management
- **Chapter 3:** Contacts & Relationships → Used by Ch 4 (suppliers), Ch 5 (clients), Ch 6 (quote contacts), Ch 8 (PO suppliers), Ch 14 (chat recipients), Ch 15 (Xero sync)
- **Chapter 4:** Price Books & Suppliers → Used by Ch 6 (estimate pricing), Ch 8 (PO pricing), Ch 17 (price automation)
- **Chapter 18:** Custom Tables & Formulas → Standalone dynamic data system

### Project Execution Flow
1. **Chapter 6:** Estimates & Quoting → Creates estimates for jobs
2. **Chapter 5:** Jobs & Construction → Central project management
3. **Chapter 8:** Purchase Orders → Generated from estimates (Ch 6)
4. **Chapter 9:** Gantt & Schedule Master → Visual timeline for jobs (Ch 5)
5. **Chapter 10:** Project Tasks & Checklists → Task management for jobs (Ch 5)
6. **Chapter 11:** Weather & Public Holidays → Affects schedule (Ch 9) and tasks (Ch 10)

### AI & Automation
- **Chapter 7:** AI Plan Review → Analyzes plans from Ch 12 (OneDrive files)
- **Chapter 17:** Workflows & Automation → Orchestrates approvals, price updates (Ch 4), folder creation (Ch 12)

### Integrations
- **Chapter 12:** OneDrive Integration → File storage for Ch 5 (jobs), Ch 7 (AI review), Ch 17 (folder automation)
- **Chapter 13:** Outlook/Email Integration → Email matching to Ch 5 (jobs)
- **Chapter 14:** Chat & Communications → Team communication for Ch 5 (jobs), Ch 10 (tasks)
- **Chapter 15:** Xero Accounting → Syncs Ch 3 (contacts), links to Ch 8 (PO invoices)
- **Chapter 16:** Payments & Financials → Tracks payments for Ch 8 (POs), reconciles Ch 15 (Xero invoices)

### UI/UX
- **Chapter 19:** UI/UX Standards & Patterns → Applies to ALL frontend features

### Feature Interaction Examples:

**Creating a Job (Chapter 5):**
- Requires: User (Ch 1), Client contact (Ch 3), Company timezone (Ch 2)
- May trigger: OneDrive folders (Ch 12), Gantt entry (Ch 9), Tasks (Ch 10), Chat channel (Ch 14)

**Generating Purchase Orders (Chapter 8):**
- Source: Estimate (Ch 6)
- Uses: Supplier contacts (Ch 3), Pricebook items (Ch 4)
- May create: Workflow approval (Ch 17), Xero bill (Ch 15), Payment tracking (Ch 16)

**AI Plan Review (Chapter 7):**
- Requires: OneDrive files (Ch 12), Estimate data (Ch 6), User auth (Ch 1)
- Uses: Company settings (Ch 2) for timezone, currency

**Gantt Scheduling (Chapter 9):**
- Requires: Job (Ch 5), Tasks (Ch 10), Weather (Ch 11), Public Holidays (Ch 11), Timezone (Ch 2)
- Affects: Task due dates (Ch 10), Workflow deadlines (Ch 17)

---

# Chapter 1: Authentication & Users

┌──────────────────────────────────��──────────────┐
│ 📕 LEXICON (BUGS):    Chapter 1                │
│ 📘 USER MANUAL (HOW): Chapter 1                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## Overview

Authentication & Users handles:
- User login/logout via JWT
- Role-based permissions (6 roles)
- OAuth integration (Microsoft 365)
- Password security and reset
- Rate limiting on auth endpoints
- Portal users (suppliers/customers)

---

## RULE #1.1: JWT Token Handling

✅ **MUST:**
- Use `JsonWebToken.encode` to create tokens
- Include `user_id` in payload
- Set expiration to 24 hours maximum
- Send token in `Authorization: Bearer <token>` header

❌ **NEVER:**
- Store sensitive data in JWT payload (it's base64, not encrypted)
- Create tokens without expiration
- Share SECRET_KEY across environments
- Store tokens in localStorage (XSS vulnerable) - use httpOnly cookies on frontend

**📖 Implementation:** See [TRAPID_TEACHER.md §1.1](TRAPID_TEACHER.md#11-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

---

## RULE #1.2: Password Security Requirements

✅ **MUST enforce:**
- Minimum 12 characters (NOT 8, NOT 10)
- At least 1 uppercase letter [A-Z]
- At least 1 lowercase letter [a-z]
- At least 1 digit [0-9]
- At least 1 special character [!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]

❌ **NEVER:**
- Log passwords (even hashed)
- Send passwords in API responses
- Store passwords in plain text
- Allow common passwords (implement dictionary check if needed)

**📖 Implementation:** See [TRAPID_TEACHER.md §1.2](TRAPID_TEACHER.md#12-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

---

## RULE #1.3: Role-Based Access Control

✅ **MUST:**
- Use predefined roles: `user`, `admin`, `product_owner`, `estimator`, `supervisor`, `builder`
- Check permissions via User model methods (`can_create_templates?`, `can_edit_schedule?`)
- Use `before_action :require_admin` for admin-only endpoints
- Set default role to `"user"` for new signups

❌ **NEVER:**
- Create roles dynamically via API
- Store roles outside the enum
- Bypass permission checks with hardcoded user IDs
- Grant admin role automatically (even for @tekna.com.au emails)

**📖 Implementation:** See [TRAPID_TEACHER.md §1.3](TRAPID_TEACHER.md#13-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

---

## RULE #1.4: Rate Limiting on Auth Endpoints

✅ **MUST configure:**
- Auth endpoints: 5 requests per 20 seconds per IP
- Password reset: 3 requests per hour per email
- General API: 300 requests per 5 minutes per IP

❌ **NEVER:**
- Disable rate limiting in production
- Use same limits for external vs internal APIs
- Skip rate limiting for "trusted" IPs (除非 explicitly whitelisted)

**📖 Implementation:** See [TRAPID_TEACHER.md §1.4](TRAPID_TEACHER.md#14-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

---

## RULE #1.5: OAuth Integration Pattern

✅ **MUST:**
- Use OmniAuth gem for all OAuth providers
- Store `provider`, `uid`, `oauth_token`, `oauth_expires_at` on User
- Generate random password for OAuth users (via `SecureRandom.hex`)
- Return JWT token after OAuth callback
- Validate OAuth tokens on every external API call

❌ **NEVER:**
- Store OAuth refresh tokens in database (security risk)
- Share OAuth tokens across users
- Skip token expiration checks
- Use OAuth for internal user creation (only for login)

**📖 Implementation:** See [TRAPID_TEACHER.md §1.5](TRAPID_TEACHER.md#15-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

---

## RULE #1.6: Password Reset Flow

✅ **MUST:**
- Generate token via `SecureRandom.urlsafe_base64(32)`
- Store hashed token in database (NOT plain text)
- Set `reset_password_sent_at` timestamp
- Expire tokens after 2 hours
- Clear token after successful reset
- Send reset email with token URL

❌ **NEVER:**
- Store tokens in plain text
- Reuse tokens across multiple resets
- Skip token expiration check
- Send token in API response (only via email)

**📖 Implementation:** See [TRAPID_TEACHER.md §1.6](TRAPID_TEACHER.md#16-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

---

## RULE #1.7: Portal User Separation

✅ **MUST:**
- Use separate `portal_users` table (NOT users table)
- Associate portal users with `Contact` record
- Implement account lockout for portal users (5 failed attempts = 30 min lockout)
- Log all portal user activities via `PortalAccessLog`
- Use `portal_type` enum: `'supplier'` or `'customer'`

❌ **NEVER:**
- Mix portal users and admin users in same table
- Grant admin access to portal users
- Skip activity logging for portal users
- Allow portal users to access internal APIs

**📖 Implementation:** See [TRAPID_TEACHER.md §1.7](TRAPID_TEACHER.md#17-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

---

## RULE #1.8: Login Activity Tracking

✅ **MUST:**
- Update `last_login_at` timestamp on successful login
- Store in UTC timezone
- Track for both User and PortalUser
- Use for account activity monitoring

❌ **NEVER:**
- Update on token refresh (only on actual login)
- Track in local timezone
- Skip updates (used for security monitoring)

**📖 Implementation:** See [TRAPID_TEACHER.md §1.8](TRAPID_TEACHER.md#18-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 1](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

**Authentication:**
- `POST /api/v1/auth/signup` - Create new user (default role: "user")
- `POST /api/v1/auth/login` - Login with email/password
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/microsoft_office365` - Initiate OAuth flow
- `GET /api/v1/auth/microsoft_office365/callback` - OAuth callback

**User Management:**
- `GET /api/v1/users` - List users (authenticated)
- `GET /api/v1/users/:id` - Get user details
- `PATCH /api/v1/users/:id` - Update user (name, email, mobile, role)
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/users/:id/reset_password` - Generate password reset token

**Roles & Groups:**
- `GET /api/v1/user_roles` - List available roles
- `GET /api/v1/user_groups` - List assignable groups

**Portal (Suppliers/Customers):**
- `POST /api/v1/portal/auth/login` - Portal user login
- `POST /api/v1/portal/auth/logout` - Portal user logout
- `POST /api/v1/portal/auth/reset_password` - Portal password reset

---

# Chapter 2: System Administration

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 2                │
│ 📘 USER MANUAL (HOW): Chapter 2                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

---

## Overview

This chapter defines rules for **System Administration**, including company settings, user management, timezone handling, working days configuration, and permission systems. These settings affect scheduling, pricing, integrations, and all time-based calculations across the application.

**Related Chapters:**
- Chapter 9: Gantt & Schedule Master (working days enforcement)
- Chapter 11: Weather & Public Holidays (business day calculations)
- Chapter 1: Authentication & Users (user roles and permissions)

---

## RULE #2.1: Company Settings Singleton Pattern

✅ **MUST implement as singleton:**

✅ **MUST access via instance method:**

❌ **NEVER:**
- Create multiple CompanySetting records (singleton = one record only)
- Hardcode configuration values instead of reading from settings
- Use `CompanySetting.first` (use `CompanySetting.instance`)
- Call `CompanySetting.create` manually (use `instance` method)

**📖 Implementation:** See [TRAPID_TEACHER.md §2.1](TRAPID_TEACHER.md#21-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## RULE #2.2: Timezone Handling - Backend Time Calculations

✅ **MUST use CompanySetting timezone methods:**

✅ **MUST use Time.use_zone context:**

❌ **NEVER:**
- Use `Date.today` or `Time.now` without timezone context
- Store dates/times in UTC without timezone conversion
- Assume server timezone matches company timezone
- Use JavaScript `new Date()` for date calculations (see RULE #2.3)

**📖 Implementation:** See [TRAPID_TEACHER.md §2.2](TRAPID_TEACHER.md#22-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## RULE #2.3: Timezone Handling - Frontend Time Display

✅ **MUST use Intl API with explicit timezone:**

✅ **MUST import and use timezone utilities:**

❌ **NEVER:**
- Use `Date.toLocaleDateString()` without timeZone parameter (uses browser timezone!)
- Use `Date.toLocaleString()` without explicit timezone
- Use date libraries without timezone configuration (moment.js, date-fns)
- Assume user's browser timezone matches company timezone

**📖 Implementation:** See [TRAPID_TEACHER.md §2.3](TRAPID_TEACHER.md#23-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## RULE #2.4: Working Days Configuration & Business Day Calculations

✅ **MUST implement working_day? and business_day? methods:**

✅ **MUST use in date calculations:**

❌ **NEVER:**
- Hardcode working days as Monday-Friday only (some industries work Sundays, skip Saturdays)
- Use Rails' `business_day?` method (doesn't respect company settings)
- Calculate task dates without checking working_days
- Allow cascade to schedule tasks on non-working days (exception: locked tasks)

**📖 Implementation:** See [TRAPID_TEACHER.md §2.4](TRAPID_TEACHER.md#24-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## RULE #2.5: User Roles & Permission System

✅ **MUST implement permission helper methods:**

✅ **MUST check permissions in controllers:**

❌ **NEVER:**
- Allow users to change their own role (admin-only operation)
- Grant permissions based on string matching role names
- Skip permission checks in controllers ("I'll handle it in the UI")
- Use role checking in frontend only (backend MUST validate)

**📖 Implementation:** See [TRAPID_TEACHER.md §2.5](TRAPID_TEACHER.md#25-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## RULE #2.6: Assignable Roles for Task Assignment

✅ **MUST use assignable_role for task filtering:**

❌ **NEVER:**
- Confuse system role (permissions) with assignable_role (task filtering)
- Use system role for task assignment
- Allow users with assignable_role: none to be assigned tasks
- Hardcode role names in task queries

**📖 Implementation:** See [TRAPID_TEACHER.md §2.6](TRAPID_TEACHER.md#26-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## RULE #2.7: Password Complexity Requirements

✅ **MUST validate password complexity:**

✅ **MUST generate random password for OAuth users:**

❌ **NEVER:**
- Allow passwords shorter than 12 characters
- Allow passwords without uppercase, lowercase, digit, and special character
- Require OAuth users to set passwords (they don't use them)
- Store passwords in plain text (use bcrypt via has_secure_password)

**📖 Implementation:** See [TRAPID_TEACHER.md §2.7](TRAPID_TEACHER.md#27-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## RULE #2.8: Timezone Options Limitation

✅ **MUST use this exact list:**

✅ **MUST use select with these options:**

❌ **NEVER:**
- Allow free-text timezone entry (validation nightmare)
- Show all 400+ IANA timezones (overwhelming, unnecessary)
- Use timezone abbreviations (AEST, AEDT - ambiguous)
- Default to UTC (construction companies operate in specific regions)

**📖 Implementation:** See [TRAPID_TEACHER.md §2.8](TRAPID_TEACHER.md#28-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## RULE #2.9: Working Days UI - Sunday Default True

✅ **MUST initialize with Sunday = true:**

✅ **MUST show checkboxes for all 7 days:**

❌ **NEVER:**
- Hardcode Monday-Friday as only working days
- Hide Sunday checkbox (some companies DO work Sundays)
- Default all days to true (Saturday rarely worked)
- Prevent users from customizing working days

**📖 Implementation:** See [TRAPID_TEACHER.md §2.9](TRAPID_TEACHER.md#29-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 2](TRAPID_LEXICON.md)

---

---

## Protected Code Patterns

### 1. CompanySetting Instance Method

**File:** `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb`

**DO NOT modify singleton pattern:**

**Reason:** Changing this breaks initialization across entire application. All services depend on `instance` method.

---

### 2. Timezone Context Manager

**File:** `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb`

**DO NOT remove Time.use_zone wrappers:**

**Reason:** These methods are called hundreds of times across services. Removing timezone context causes off-by-one day errors globally.

---

### 3. Password Complexity Validation

**File:** `/Users/rob/Projects/trapid/backend/app/models/user.rb`

**DO NOT weaken password requirements:**

**Reason:** Security requirement. Weakening password rules exposes application to brute force attacks.

---

## Summary

Chapter 2 establishes 9 rules covering:

1. **Singleton pattern** - One global CompanySetting record
2. **Backend timezone** - All calculations use company timezone
3. **Frontend timezone** - Intl API with explicit timezone, not browser timezone
4. **Working days** - JSONB configuration used in schedule calculations
5. **System roles** - Enum-based permissions with helper methods
6. **Assignable roles** - Separate enum for task categorization
7. **Password complexity** - 12 chars minimum, mixed case, digit, special char
8. **Timezone options** - 12 Australian/NZ timezones only
9. **Sunday default** - Working days include Sunday for construction industry

These rules ensure consistent configuration, secure user management, and timezone-aware calculations across the entire application.

---

# Chapter 3: Contacts & Relationships

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 3                │
│ 📘 USER MANUAL (HOW): Chapter 3                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## Overview

Contacts & Relationships manages the unified contact system for customers, suppliers, sales reps, and land agents. The system supports Xero bidirectional sync, bidirectional contact relationships, portal access, supplier ratings, and comprehensive activity tracking.

**Key Components:**
- **Contact:** Unified model supporting multiple contact types (customer, supplier, sales, land_agent)
- **ContactRelationship:** Bidirectional relationships between contacts (parent company, referral, etc.)
- **ContactPerson/ContactAddress:** Xero-synced persons and addresses per contact
- **XeroContactSyncService:** Bidirectional sync with priority-based fuzzy matching
- **PortalUser:** Customer/supplier portal access with secure authentication
- **ContactActivity:** Complete audit trail of all contact interactions

**Key Files:**
- Models: `app/models/contact.rb`, `app/models/contact_relationship.rb`, `app/models/contact_person.rb`, `app/models/contact_address.rb`, `app/models/portal_user.rb`
- Controllers: `app/controllers/api/v1/contacts_controller.rb` (1143 lines), `app/controllers/api/v1/contact_relationships_controller.rb`
- Services: `app/services/xero_contact_sync_service.rb` (424 lines)

---

## RULE #3.1: Contact Types are Multi-Select Arrays

✅ **MUST:**
- Use `contact_types` as PostgreSQL array column
- Allow multiple types: `['customer', 'supplier']` for hybrid contacts
- Set `primary_contact_type` automatically if blank (first type in array)
- Validate types against `CONTACT_TYPES = ['customer', 'supplier', 'sales', 'land_agent']`
- Use array operations for querying: `where("'supplier' = ANY(contact_types)")`

❌ **NEVER:**
- Use single contact_type field (legacy pattern)
- Store types as comma-separated strings
- Assume a contact has only one type
- Query with `contact_type =` (use array containment instead)

**📖 Implementation:** See [TRAPID_TEACHER.md §3.1](TRAPID_TEACHER.md#31-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

---

## RULE #3.2: Bidirectional Relationships Require Reverse Sync

✅ **MUST:**
- Create reverse relationship after creating forward relationship
- Update reverse relationship when forward is updated
- Delete reverse relationship when forward is deleted
- Use Thread-local flags to prevent infinite recursion: `Thread.current[:creating_reverse_relationship]`
- Validate unique relationship pairs: `[source_contact_id, related_contact_id]`
- Prevent self-relationships: `source_contact_id != related_contact_id`

❌ **NEVER:**
- Create one-way relationships without reverse
- Allow circular reference loops during cascade updates
- Delete reverse relationship without checking Thread flag
- Allow duplicate relationships (same source + related pair)

**📖 Implementation:** See [TRAPID_TEACHER.md §3.2](TRAPID_TEACHER.md#32-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

---

## RULE #3.3: Xero Sync Uses Priority-Based Fuzzy Matching

✅ **MUST:**
- **Priority 1:** Match by `xero_id` (exact match)
- **Priority 2:** Match by `tax_number` (normalized ABN/ACN, 11 digits)
- **Priority 3:** Match by `email` (case-insensitive exact match)
- **Priority 4:** Fuzzy match by `full_name` using FuzzyMatch gem (>85% similarity threshold)
- Rate limit: 1.2 second delay between Xero API calls (60 req/min limit)
- Log all sync activities with metadata to `ContactActivity`
- Set `last_synced_at` timestamp on successful sync
- Clear `xero_sync_error` on success, set on failure
- Respect `sync_with_xero` flag (skip if false)

❌ **NEVER:**
- Match only by name (too unreliable without fuzzy matching)
- Sync without rate limiting (will hit Xero API limits)
- Override manual `xero_id` links without confirmation
- Sync contacts with `sync_with_xero = false`
- Delete local contacts that don't exist in Xero

**📖 Implementation:** See [TRAPID_TEACHER.md §3.3](TRAPID_TEACHER.md#33-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

---

## RULE #3.4: Contact Deletion MUST Check Purchase Order Dependencies

✅ **MUST:**
- Check for linked suppliers via `contact.suppliers` association
- Check if suppliers have purchase orders: `suppliers.joins(:purchase_orders).distinct`
- Block deletion if ANY purchase orders exist
- Block deletion if ANY purchase orders have been paid or invoiced
- Return detailed error message listing suppliers and PO counts
- Allow deletion of contacts without supplier dependencies

❌ **NEVER:**
- Delete contacts with active supplier relationships that have POs
- Cascade delete purchase orders when deleting contact
- Allow deletion without checking payment/invoice status
- Delete last contact from a construction/job

**📖 Implementation:** See [TRAPID_TEACHER.md §3.4](TRAPID_TEACHER.md#34-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

---

## RULE #3.5: Contact Merge MUST Consolidate All Related Records

✅ **MUST:**
- Merge `contact_types` arrays (union, no duplicates)
- Fill missing info from source to target (email, phone, address, etc.)
- Keep best `rating` if both are suppliers (higher wins)
- Combine `notes` with merge trail: `"[Merged from Contact #123] original notes"`
- Update foreign keys for: `PricebookItem`, `PurchaseOrder`, `PriceHistory`
- Delete source contacts after successful merge
- Log activity with "contact_merged" type and metadata
- Return updated target contact

❌ **NEVER:**
- Overwrite target data with blank source data
- Merge without updating related records
- Delete source without logging activity
- Allow merge if validation fails on target

**📖 Implementation:** See [TRAPID_TEACHER.md §3.5](TRAPID_TEACHER.md#35-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

---

## RULE #3.6: Portal Users MUST Have Secure Password Requirements

✅ **MUST:**
- Minimum 12 characters
- At least one uppercase, lowercase, digit, and special character
- Lock account after 5 failed login attempts
- Lockout duration: 30 minutes
- Reset failed attempts counter on successful login
- Use `has_secure_password` with bcrypt
- Validate email uniqueness and `contact_id` uniqueness scoped to `portal_type`

❌ **NEVER:**
- Allow weak passwords (<12 chars or missing character types)
- Store passwords in plain text
- Allow unlimited login attempts
- Share portal accounts across contacts

**📖 Implementation:** See [TRAPID_TEACHER.md §3.6](TRAPID_TEACHER.md#36-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

---

## RULE #3.7: Primary Contact/Address/Person MUST Be Unique Per Contact

✅ **MUST:**
- Validate `is_primary` uniqueness scoped to `contact_id` in before_save callback
- Automatically unmark other primaries when setting new primary
- Use database index on `[contact_id, is_primary]` for performance
- Ensure at least one contact remains on construction (cannot delete last)

❌ **NEVER:**
- Allow multiple primary persons/addresses per contact
- Delete the only remaining contact from a construction
- Set `is_primary = true` without unmarking others

**📖 Implementation:** See [TRAPID_TEACHER.md §3.7](TRAPID_TEACHER.md#37-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

---

## RULE #3.8: Contact Activity Logging MUST Track All Significant Changes

✅ **MUST:**
- Log activity types: `created`, `updated`, `synced_from_xero`, `synced_to_xero`, `purchase_order_created`, `supplier_linked`, `contact_merged`
- Include `occurred_at` timestamp (required)
- Store structured metadata in JSONB column
- Use `ContactActivity.log_xero_sync` class method for Xero sync activities
- Combine with SMS messages in activity timeline endpoint

❌ **NEVER:**
- Skip logging for "minor" updates (all changes matter)
- Log without `occurred_at` timestamp
- Store sensitive data in metadata (passwords, tokens, etc.)
- Delete activity records (archive only for compliance)

**📖 Implementation:** See [TRAPID_TEACHER.md §3.8](TRAPID_TEACHER.md#38-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 3](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### Contacts (CRUD)
- `GET /api/v1/contacts` - List contacts with filtering (search, type, xero_sync, with_email, with_phone)
- `GET /api/v1/contacts/:id` - Show single contact with nested data
- `POST /api/v1/contacts` - Create new contact
- `PATCH /api/v1/contacts/:id` - Update contact
- `DELETE /api/v1/contacts/:id` - Delete contact (with PO dependency checks)

### Contact Management
- `PATCH /api/v1/contacts/bulk_update` - Update contact_types for multiple contacts
- `POST /api/v1/contacts/merge` - Merge contacts into one
- `POST /api/v1/contacts/match_supplier` - Link contact to existing supplier

### Supplier/Pricing
- `GET /api/v1/contacts/:id/categories` - Get pricebook categories for supplier
- `POST /api/v1/contacts/:id/copy_price_history` - Copy prices from another supplier
- `POST /api/v1/contacts/:id/bulk_update_prices` - Update multiple prices

### Activity & Tracking
- `GET /api/v1/contacts/:id/activities` - Get activity timeline (includes SMS)
- `POST /api/v1/contacts/:id/link_xero_contact` - Manually link to Xero contact

### Portal Access
- `POST /api/v1/contacts/:id/portal_user` - Create portal user
- `PATCH /api/v1/contacts/:id/portal_user` - Update portal user
- `DELETE /api/v1/contacts/:id/portal_user` - Delete portal user

### Relationships
- `GET /api/v1/contacts/:contact_id/relationships` - List relationships
- `POST /api/v1/contacts/:contact_id/relationships` - Create relationship
- `PATCH /api/v1/contacts/:contact_id/relationships/:id` - Update relationship
- `DELETE /api/v1/contacts/:contact_id/relationships/:id` - Delete relationship

### Contact Roles
- `GET /api/v1/contact_roles` - List all roles
- `POST /api/v1/contact_roles` - Create role

### Construction Contacts
- `GET /api/v1/constructions/:construction_id/construction_contacts` - List job contacts
- `POST /api/v1/constructions/:construction_id/construction_contacts` - Add contact to job

---

# Chapter 4: Price Books & Suppliers

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 4                │
│ 📘 USER MANUAL (HOW): Chapter 4                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## Overview

Price Books & Suppliers manages the complete product catalog, pricing history, supplier relationships, and intelligent sourcing for purchase orders. The system tracks price volatility, calculates risk scores, and provides smart supplier/price lookup for automated PO generation.

**Key Components:**
- **PricebookItem:** Product catalog with pricing, supplier links, and media attachments
- **PriceHistory:** Complete price change tracking with supplier-specific pricing
- **Supplier:** Vendor management with ratings, response metrics, and trade categories
- **SmartPoLookupService:** 6-strategy intelligent supplier and price matching
- **Risk Scoring:** Multi-factor analysis (freshness, volatility, reliability, missing data)
- **OneDrive Sync:** Automatic product image, spec, and QR code matching

**Key Files:**
- Models: `app/models/pricebook_item.rb`, `app/models/price_history.rb`, `app/models/supplier.rb`, `app/models/supplier_rating.rb`
- Controllers: `app/controllers/api/v1/pricebook_items_controller.rb`, `app/controllers/api/v1/suppliers_controller.rb`
- Services: `app/services/smart_po_lookup_service.rb`, `app/services/supplier_matcher.rb`, `app/services/pricebook_import_service.rb`, `app/services/onedrive_pricebook_sync_service.rb`

---

## RULE #4.1: Price Changes MUST Create Price History Automatically

✅ **MUST:**
- Use `after_update` callback to detect price changes
- Create PriceHistory with `old_price`, `new_price`, `change_reason`
- Set `price_last_updated_at` to current timestamp
- Track `changed_by_user_id` for audit trail
- Allow skipping via `skip_price_history_callback` flag when needed

❌ **NEVER:**
- Update `current_price` without creating history
- Skip price history for "small" price changes
- Delete price history records (archive only)
- Allow price updates without tracking who made the change

**📖 Implementation:** See [TRAPID_TEACHER.md §4.1](TRAPID_TEACHER.md#41-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

---

## RULE #4.2: Prevent Duplicate Price History - Unique Constraint + Time Window

✅ **MUST:**
- Use unique index: `(pricebook_item_id, supplier_id, new_price, created_at)`
- Add custom validation preventing entries within 5 seconds
- Handle race conditions gracefully (return existing record)
- Log duplicate attempts for monitoring

❌ **NEVER:**
- Rely only on application-level validation
- Allow duplicate price history from concurrent requests
- Fail hard on duplicate attempts (graceful degradation)

**📖 Implementation:** See [TRAPID_TEACHER.md §4.2](TRAPID_TEACHER.md#42-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

---

## RULE #4.3: SmartPoLookupService - 6-Strategy Cascading Fallback

✅ **MUST:**
- Execute strategies in priority order (most specific → most general)
- Stop immediately on first match (don't continue searching)
- Track which strategy succeeded for analytics
- Collect warnings for all failed strategies

❌ **NEVER:**
- Skip intermediate strategies
- Continue searching after finding a match
- Return multiple matches (return best only)
- Fail if early strategies miss (cascade to less specific)

**📖 Implementation:** See [TRAPID_TEACHER.md §4.3](TRAPID_TEACHER.md#43-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

---

## RULE #4.4: Supplier Matching - Normalized Name Comparison with Business Suffix Removal

✅ **MUST:**
- Remove business entity types: "Pty Ltd", "Limited", "Inc", "Corporation", "Co"
- Remove location identifiers: "Australia", "Australian", "Qld", "Queensland"
- Remove organizational terms: "Group", "Services", "& Associates"
- Lowercase and remove special characters
- Use Levenshtein distance for similarity scoring

❌ **NEVER:**
- Match on raw supplier names without normalization
- Include business suffixes in similarity calculation
- Skip normalization for "exact" match detection
- Use case-sensitive comparison

**📖 Implementation:** See [TRAPID_TEACHER.md §4.4](TRAPID_TEACHER.md#44-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

---

## RULE #4.5: Price Volatility Detection - Coefficient of Variation on 6-Month Window

✅ **MUST:**
- Use rolling 6-month window of prices
- Calculate CV = (Standard Deviation / Mean) × 100
- Classify: stable (<5%), moderate (5-15%), volatile (>15%)
- Require minimum 3 data points for valid calculation
- Return 'unknown' for insufficient data

❌ **NEVER:**
- Use fixed time windows (calendar months/quarters)
- Calculate volatility on fewer than 3 price points
- Include prices older than 6 months
- Use absolute price change instead of percentage

**📖 Implementation:** See [TRAPID_TEACHER.md §4.5](TRAPID_TEACHER.md#45-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

---

## RULE #4.6: Risk Scoring - Multi-Factor Weighted Calculation (0-100 Scale)

✅ **MUST:**
- Calculate all 4 components independently
- Apply fixed weights (freshness=40%, reliability=20%, volatility=20%, missing=20%)
- Return score 0-100 with level: low/medium/high/critical
- Use database-level scoping for efficient filtering
- Cache calculation results for 1 hour

❌ **NEVER:**
- Change weights without updating all documentation
- Skip any of the 4 components
- Return risk score without risk level
- Calculate risk client-side (compute server-side)

**📖 Implementation:** See [TRAPID_TEACHER.md §4.6](TRAPID_TEACHER.md#46-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

---

## RULE #4.7: Bulk Updates - Transaction Wrapper with Price History Batch Creation

✅ **MUST:**
- Wrap all updates in `ActiveRecord::Base.transaction`
- Batch create price histories in single insert
- Rollback entirely on any validation error
- Return detailed success/failure report per item
- Use `skip_price_history_callback` to prevent duplicate history

❌ **NEVER:**
- Update items one-by-one without transaction
- Create price history one record at a time (N+1 performance issue)
- Continue processing after first error
- Commit partial updates

**📖 Implementation:** See [TRAPID_TEACHER.md §4.7](TRAPID_TEACHER.md#47-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

---

## RULE #4.8: OneDrive Image Proxy - Cache Control with 1-Hour Expiry

✅ **MUST:**
- Set `Cache-Control: public, max-age=3600` (1 hour)
- Store OneDrive `file_id` permanently (not URL)
- Refresh URL on each request via Microsoft Graph API
- Handle expired credentials gracefully (503 Service Unavailable)
- Return appropriate Content-Type from OneDrive metadata

❌ **NEVER:**
- Store OneDrive direct URLs (expire after 1 hour)
- Cache beyond 1 hour (OneDrive credential lifespan)
- Proxy without Cache-Control header
- Return errors for missing images (return 404 gracefully)

**📖 Implementation:** See [TRAPID_TEACHER.md §4.8](TRAPID_TEACHER.md#48-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 4](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### Pricebook Items

### Suppliers

---

# Chapter 5: Jobs & Construction Management

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 5                │
│ 📘 USER MANUAL (HOW): Chapter 5                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## Overview

Jobs & Construction Management is the central feature of Trapid, managing construction projects from creation through completion. The system uses a dual model: **Construction** (physical job/project) and **Project** (scheduling/task management), with **ProjectTask** handling all task execution.

**Key Components:**
- **Construction:** Job master (contract value, contacts, site info, profit tracking)
- **Project:** Scheduling container (project manager, timeline, status)
- **ProjectTask:** Individual tasks with dependencies, status, assignments, materials
- **TaskDependency:** Task relationships (FS/SS/FF/SF with lag)
- **Schedule Templates:** Reusable job templates with auto-instantiation

**Key Files:**
- Models: `app/models/construction.rb`, `app/models/project.rb`, `app/models/project_task.rb`, `app/models/task_dependency.rb`
- Controllers: `app/controllers/api/v1/constructions_controller.rb`, `app/controllers/api/v1/projects_controller.rb`, `app/controllers/api/v1/project_tasks_controller.rb`
- Services: `app/services/schedule/template_instantiator.rb`, `app/services/schedule/task_spawner.rb`, `app/services/schedule_cascade_service.rb`
- Background Jobs: `app/jobs/create_job_folders_job.rb`

---

## RULE #5.1: Construction MUST Have At Least One Contact

✅ **MUST:**
- Validate `must_have_at_least_one_contact` on update
- Allow creation without contacts (initial save)
- Require at least one contact before job can be used
- Show validation error if all contacts removed

❌ **NEVER:**
- Allow Construction to exist without contacts after initial creation
- Skip contact validation on updates
- Delete all contacts without replacement

**📖 Implementation:** See [TRAPID_TEACHER.md §5.1](TRAPID_TEACHER.md#51-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

## RULE #5.2: Live Profit Calculation - Dynamic Not Cached

✅ **MUST:**
- Calculate `live_profit = contract_value - sum(all_purchase_orders.total)`
- Recalculate `profit_percentage = (live_profit / contract_value) * 100`
- Use `calculate_live_profit` and `calculate_profit_percentage` methods
- Return calculated values in API responses

❌ **NEVER:**
- Store live_profit or profit_percentage in database
- Cache profit values (they change with every PO update)
- Use stale profit calculations

**📖 Implementation:** See [TRAPID_TEACHER.md §5.2](TRAPID_TEACHER.md#52-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

## RULE #5.3: Task Dependencies - No Circular References

✅ **MUST:**
- Validate `no_circular_dependencies` before saving TaskDependency
- Use graph traversal (BFS) to detect cycles
- Check entire predecessor chain for successor_task
- Reject dependency if circular reference detected

❌ **NEVER:**
- Allow Task A → B → C → A chains
- Skip circular dependency validation
- Allow self-dependencies (task depending on itself)

**📖 Implementation:** See [TRAPID_TEACHER.md §5.3](TRAPID_TEACHER.md#53-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

## RULE #5.4: Task Status Transitions - Automatic Date Setting

✅ **MUST:**
- Set `actual_start_date = Date.current` when status → `in_progress` (if nil)
- Set `actual_end_date = Date.current` when status → `complete`
- Set `progress_percentage = 100` when status → `complete`
- Use `before_save :update_actual_dates` callback

❌ **NEVER:**
- Allow `complete` status without actual_end_date
- Allow `in_progress` without actual_start_date
- Manually set these dates in controller

**📖 Implementation:** See [TRAPID_TEACHER.md §5.4](TRAPID_TEACHER.md#54-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

## RULE #5.5: Task Spawning - Status-Based Child Task Creation

✅ **MUST:**
- Spawn **subtasks** when parent status → `in_progress`
- Spawn **photo task** when parent status → `complete`
- Spawn **certificate task** when parent status → `complete` (with cert_lag_days)
- Use `Schedule::TaskSpawner` service
- Set `spawned_type` field to identify task type
- Link via `parent_task_id`

❌ **NEVER:**
- Create photo/cert tasks manually
- Spawn tasks without checking schedule_template_row configuration
- Skip TaskSpawner service

**📖 Implementation:** See [TRAPID_TEACHER.md §5.5](TRAPID_TEACHER.md#55-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

## RULE #5.6: Schedule Cascade - Dependency-Based Date Propagation

✅ **MUST:**
- Use `ScheduleCascadeService` to recalculate dependent task dates
- Respect dependency types (FS/SS/FF/SF)
- Apply lag_days to calculations
- Skip manually_positioned tasks (user-set dates)
- Recursively cascade to downstream tasks
- Use company timezone and working days

❌ **NEVER:**
- Skip cascade when task dates change
- Ignore dependency types
- Override manually_positioned tasks
- Cascade to different projects

**📖 Implementation:** See [TRAPID_TEACHER.md §5.6](TRAPID_TEACHER.md#56-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

## RULE #5.7: OneDrive Folder Creation - Async with Status Tracking

✅ **MUST:**
- Use `CreateJobFoldersJob` background job
- Track status: `not_requested` → `pending` → `processing` → `completed` / `failed`
- Use `onedrive_folder_creation_status` enum field
- Set `onedrive_folders_created_at` timestamp on completion
- Make idempotent (check if folders already exist)
- Use exponential backoff for retries

❌ **NEVER:**
- Create folders synchronously in controller
- Skip status tracking
- Create duplicate folders
- Fail silently without updating status

**📖 Implementation:** See [TRAPID_TEACHER.md §5.7](TRAPID_TEACHER.md#57-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

## RULE #5.8: Schedule Template Instantiation - All-or-Nothing Transaction

✅ **MUST:**
- Use `ActiveRecord::Base.transaction` for all template instantiation
- Rollback entire operation if any task fails to create
- Rollback if dependency creation fails
- Rollback if date calculation fails
- Return `{ success: true/false, errors: [] }` response

❌ **NEVER:**
- Create partial schedules (some tasks without others)
- Leave orphaned tasks if dependencies fail
- Continue after validation errors

**📖 Implementation:** See [TRAPID_TEACHER.md §5.8](TRAPID_TEACHER.md#58-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 5](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### Constructions

### Projects

### Project Tasks

---

# Chapter 6: Estimates & Quoting

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 6                │
│ 📘 USER MANUAL (HOW): Chapter 6                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## Overview

Estimates & Quoting handles import of material estimates from external systems (primarily Unreal Engine), fuzzy matching to Construction records, and automatic PO generation. The system uses intelligent job matching with confidence scoring and AI-powered plan review.

**Key Components:**
- **Estimate:** Imported material list from external source (Unreal Engine)
- **EstimateLineItem:** Individual materials with category, description, quantity
- **JobMatcherService:** Fuzzy matching using Levenshtein distance
- **EstimateToPurchaseOrderService:** Converts estimates to draft POs
- **PlanReviewService:** AI analysis comparing estimates to actual plans
- **External API:** Unreal Engine integration with API key authentication

**Key Files:**
- Models: `app/models/estimate.rb`, `app/models/estimate_line_item.rb`, `app/models/estimate_review.rb`
- Controllers: `app/controllers/api/v1/estimates_controller.rb`, `app/controllers/api/v1/external/unreal_estimates_controller.rb`
- Services: `app/services/job_matcher_service.rb`, `app/services/estimate_to_purchase_order_service.rb`, `app/services/plan_review_service.rb`
- Jobs: `app/jobs/ai_review_job.rb`

---

## RULE #6.1: Fuzzy Job Matching - Three-Tier Confidence Thresholds

✅ **MUST:**
- Use Levenshtein distance + word matching + substring bonuses
- Auto-match at **≥70% confidence** (high certainty)
- Suggest candidates at **50-70% confidence** (ambiguous)
- Return no match at **<50% confidence** (low similarity)
- Set `matched_automatically: true` for auto-matches
- Store `match_confidence_score` for all matches

❌ **NEVER:**
- Auto-match below 70% confidence
- Skip confidence scoring
- Match without normalizing strings (lowercase, trim, remove special chars)
- Allow duplicate auto-matches

**📖 Implementation:** See [TRAPID_TEACHER.md §6.1](TRAPID_TEACHER.md#61-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 6](TRAPID_LEXICON.md)

---

---

## RULE #6.2: External API Key Security - SHA256 Hashing Only

✅ **MUST:**
- Hash API keys with SHA256 before storage
- Validate incoming keys by hashing and comparing digests
- Store keys in `external_integrations` table
- Track usage with `last_used_at` timestamp
- Support key deactivation without deletion

❌ **NEVER:**
- Store plaintext API keys in database
- Log API keys in server logs
- Return API keys in API responses
- Use reversible encryption (one-way hash only)

**📖 Implementation:** See [TRAPID_TEACHER.md §6.2](TRAPID_TEACHER.md#62-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 6](TRAPID_LEXICON.md)

---

---

## RULE #6.3: Estimate Import - Validate Before Auto-Matching

✅ **MUST:**
- Validate `job_name` is present and non-empty
- Validate `materials` array has at least 1 item
- Validate each material has: `category`, `item`, `quantity`
- Return 422 Unprocessable Entity for invalid data
- Log validation errors with request details

❌ **NEVER:**
- Attempt to match with missing job_name
- Create estimate with zero line items
- Skip validation on external API endpoint
- Create estimate with nil or zero quantities

**📖 Implementation:** See [TRAPID_TEACHER.md §6.3](TRAPID_TEACHER.md#63-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 6](TRAPID_LEXICON.md)

---

---

## RULE #6.4: PO Generation from Estimate - Transaction Safety

✅ **MUST:**
- Wrap entire conversion in `ActiveRecord::Base.transaction`
- Rollback if any PO creation fails
- Rollback if any line item creation fails
- Rollback if supplier lookup fails critically
- Mark estimate as `imported` only on successful commit

❌ **NEVER:**
- Create partial POs (some categories succeed, others fail)
- Leave estimate in `matched` status if POs were created
- Continue after critical errors
- Create POs without line items

**📖 Implementation:** See [TRAPID_TEACHER.md §6.4](TRAPID_TEACHER.md#64-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 6](TRAPID_LEXICON.md)

---

---

## RULE #6.5: AI Plan Review - Async Processing Required

✅ **MUST:**
- Enqueue `AiReviewJob` for all plan reviews
- Create `EstimateReview` record with `status: 'pending'` immediately
- Return review_id to client for polling
- Update status to `processing` → `completed` / `failed`
- Set timeout of 5 minutes for Claude API call

❌ **NEVER:**
- Run plan review in synchronous HTTP request
- Block API response waiting for Claude
- Skip background job for "small" reviews
- Leave review in `processing` status indefinitely

**📖 Implementation:** See [TRAPID_TEACHER.md §6.5](TRAPID_TEACHER.md#65-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 6](TRAPID_LEXICON.md)

---

---

## RULE #6.6: Line Item Categorization - Normalized Category Matching

✅ **MUST:**
- Normalize categories to lowercase before grouping
- Map common variations: "plumbing" = "plumber" = "plumb"
- Use category normalization service
- Handle nil/blank categories with "Uncategorized" group
- Store original category in line item, use normalized for matching

❌ **NEVER:**
- Group POs by case-sensitive categories ("Plumbing" ≠ "plumbing")
- Skip category normalization in SmartPoLookupService
- Create separate POs for "Electrical" and "electrical"
- Fail import if category is missing

**📖 Implementation:** See [TRAPID_TEACHER.md §6.6](TRAPID_TEACHER.md#66-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 6](TRAPID_LEXICON.md)

---

---

## RULE #6.7: Estimate Status State Machine - Strict Transitions

✅ **MUST:**
- Start at `pending` status on creation
- Transition to `matched` when linked to construction
- Transition to `imported` when POs generated
- Allow `rejected` from any state
- Prevent reverse transitions (no imported → matched)

❌ **NEVER:**
- Skip `matched` status and go directly to `imported`
- Mark as `imported` before POs are created
- Change status back from `imported` to `pending`
- Allow PO generation from `pending` status

**📖 Implementation:** See [TRAPID_TEACHER.md §6.7](TRAPID_TEACHER.md#67-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 6](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### Estimates (Internal)

### Unreal Engine (External)

### Estimate Reviews

---

# Chapter 7: AI Plan Review

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 7                │
│ 📘 USER MANUAL (HOW): Chapter 7                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Overview

AI Plan Review validates construction estimates against actual PDF plans using Claude 3.5 Sonnet. Downloads plans from OneDrive, extracts materials using AI vision, compares against estimate line items, and identifies discrepancies with severity ratings.

**Key Files:**
- Model: `backend/app/models/estimate_review.rb`
- Controller: `backend/app/controllers/api/v1/estimate_reviews_controller.rb`
- Service: `backend/app/services/plan_review_service.rb`
- Job: `backend/app/jobs/ai_review_job.rb`
- Frontend: `frontend/src/components/estimates/AiReviewModal.jsx`

---

## RULE #7.1: Estimate Must Be Matched to Construction

✅ **MUST:**
- Validate `estimate.construction_id` is present before starting review
- Return 422 status with clear error message if not matched
- Show "Match to Job" button in UI if unmatched

❌ **NEVER:**
- Allow AI review on unmatched estimates
- Start review without construction context

**📖 Implementation:** See [TRAPID_TEACHER.md §7.1](TRAPID_TEACHER.md#71-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## RULE #7.2: OneDrive Plan Folder Structure

✅ **MUST search folders:**

❌ **NEVER:**
- Search entire OneDrive (security risk)
- Use different folder names without updating constant
- Skip folder validation

**📖 Implementation:** See [TRAPID_TEACHER.md §7.2](TRAPID_TEACHER.md#72-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## RULE #7.3: PDF File Size Limit

✅ **MUST:**
- Check file size before download
- Skip files > 20MB
- Return error if NO valid PDFs found after filtering

❌ **NEVER:**
- Attempt to send files > 20MB to Claude API
- Download large files unnecessarily
- Proceed without plan documents

**📖 Implementation:** See [TRAPID_TEACHER.md §7.3](TRAPID_TEACHER.md#73-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## RULE #7.4: Async Processing with Background Jobs

✅ **MUST:**
- Return 202 Accepted immediately with review_id
- Enqueue AiReviewJob with estimate_id
- Set initial status to 'pending', update to 'processing' in job
- Frontend MUST poll for status (every 5 seconds recommended)

❌ **NEVER:**
- Process review synchronously (causes request timeout)
- Block HTTP request waiting for Claude API response
- Assume review completes instantly

**📖 Implementation:** See [TRAPID_TEACHER.md §7.4](TRAPID_TEACHER.md#74-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## RULE #7.5: Claude API Model and Prompt Structure

✅ **MUST:**
- Use exact model ID: `claude-3-5-sonnet-20241022`
- Send PDFs as base64-encoded documents with MIME type `application/pdf`
- Request JSON response format with specific schema
- Include estimate line items in prompt for comparison context
- Set max_tokens to 4096 minimum

❌ **NEVER:**
- Use older Claude models (lack PDF support)
- Send PDFs as text (loses formatting)
- Omit response format instructions
- Exceed token limits with oversized prompts

**📖 Implementation:** See [TRAPID_TEACHER.md §7.5](TRAPID_TEACHER.md#75-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## RULE #7.6: Discrepancy Detection Logic

✅ **MUST categorize as:**

✅ **MUST use fuzzy matching:**
- Remove non-alphanumeric characters from item descriptions
- Case-insensitive comparison
- Match by category + description

❌ **NEVER:**
- Require exact string match (causes false negatives)
- Ignore category in matching (causes false positives)
- Use < 10% threshold for mismatches (too strict)

**📖 Implementation:** See [TRAPID_TEACHER.md §7.6](TRAPID_TEACHER.md#76-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## RULE #7.7: Confidence Score Calculation

✅ **MUST calculate:**

✅ **MUST store:**
- `confidence_score` - Final score (0-100)
- `items_matched` - Count of matched items
- `items_mismatched` - Count of quantity mismatches
- `items_missing` - Count of missing items
- `items_extra` - Count of extra items

❌ **NEVER:**
- Return confidence > 100 or < 0
- Use equal penalty weights for all discrepancy types
- Skip confidence calculation

**📖 Implementation:** See [TRAPID_TEACHER.md §7.7](TRAPID_TEACHER.md#77-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## RULE #7.8: Error Handling and Status Updates

✅ **MUST handle errors:**
- `NoConstructionError` - Estimate not matched
- `OneDriveNotConnectedError` - OneDrive credential missing
- `PDFNotFoundError` - No valid PDFs in plan folders
- `FileTooLargeError` - All PDFs exceed 20MB limit
- `Anthropic::Error` - Claude API errors (rate limit, auth, etc.)
- `StandardError` - Generic catch-all

✅ **MUST update review record:**

❌ **NEVER:**
- Leave review in 'processing' state on error (orphaned record)
- Expose sensitive error details to client
- Retry automatically without user intervention

**📖 Implementation:** See [TRAPID_TEACHER.md §7.8](TRAPID_TEACHER.md#78-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## RULE #7.9: Prevent Duplicate Processing Reviews

✅ **MUST check:**
- Query for existing review with `status: processing`
- Return 422 error if found
- Allow new review only if previous is completed/failed

❌ **NEVER:**
- Allow concurrent reviews on same estimate
- Overwrite existing processing review

**📖 Implementation:** See [TRAPID_TEACHER.md §7.9](TRAPID_TEACHER.md#79-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 7](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### POST /api/v1/estimates/:estimate_id/ai_review
**Purpose:** Start AI plan review (async)

**Request:** None

**Response (202 Accepted):**

**Response (422 Unprocessable Entity):**

---

### GET /api/v1/estimate_reviews/:id
**Purpose:** Get review status and results (for polling)

**Response (Completed - 200 OK):**

**Response (Processing - 200 OK):**

---

### GET /api/v1/estimates/:estimate_id/reviews
**Purpose:** List all reviews for an estimate

**Response (200 OK):**

---

### DELETE /api/v1/estimate_reviews/:id
**Purpose:** Delete a review record

**Response (200 OK):**

---

# Chapter 8: Purchase Orders

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 8                │
│ 📘 USER MANUAL (HOW): Chapter 8                │
└─────────────────────────────────────────────────┘

**User Context:** Generating POs
**Technical Rules:** PO generation, supplier matching

## Overview

Purchase Orders manage the complete procurement workflow from draft creation through payment tracking. Includes smart supplier/price lookup, approval workflow, schedule integration, and Xero invoice matching.

**Key Files:**
- Controller: `backend/app/controllers/api/v1/purchase_orders_controller.rb`
- Model: `backend/app/models/purchase_order.rb`
- Line Items: `backend/app/models/purchase_order_line_item.rb`
- Smart Lookup: `backend/app/services/smart_po_lookup_service.rb`

---

## RULE #8.1: PO Number Generation - Race Condition Protection

❌ **NEVER generate PO numbers without lock**

✅ **ALWAYS use `pg_advisory_xact_lock` in transaction**

**📖 Implementation:** See [TRAPID_TEACHER.md §8.1](TRAPID_TEACHER.md#81-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 8](TRAPID_LEXICON.md)

---

---

## RULE #8.2: Status State Machine

❌ **NEVER skip status steps**

✅ **ALWAYS validate transitions**

**📖 Implementation:** See [TRAPID_TEACHER.md §8.2](TRAPID_TEACHER.md#82-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 8](TRAPID_LEXICON.md)

---

---

## RULE #8.3: Payment Status Calculation

❌ **NEVER set `payment_status` directly**

✅ **ALWAYS use `determine_payment_status(amount)`**

**📖 Implementation:** See [TRAPID_TEACHER.md §8.3](TRAPID_TEACHER.md#83-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 8](TRAPID_LEXICON.md)

---

---

## RULE #8.4: Smart Lookup - Supplier Selection Priority

❌ **NEVER randomly select supplier**

✅ **ALWAYS use SmartPoLookupService priority cascade**

**📖 Implementation:** See [TRAPID_TEACHER.md §8.4](TRAPID_TEACHER.md#84-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 8](TRAPID_LEXICON.md)

---

---

## RULE #8.5: Line Items - Totals Calculation

❌ **NEVER save PO without recalculating totals**

✅ **ALWAYS use `before_save` callback**

**📖 Implementation:** See [TRAPID_TEACHER.md §8.5](TRAPID_TEACHER.md#85-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 8](TRAPID_LEXICON.md)

---

---

## RULE #8.6: Schedule Task Linking

❌ **NEVER link without unlinking previous**

✅ **ALWAYS use transaction for task linking**

**📖 Implementation:** See [TRAPID_TEACHER.md §8.6](TRAPID_TEACHER.md#86-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 8](TRAPID_LEXICON.md)

---

---

## RULE #8.7: Price Drift Monitoring

❌ **NEVER ignore price drift**

✅ **ALWAYS calculate drift percentage**

**📖 Implementation:** See [TRAPID_TEACHER.md §8.7](TRAPID_TEACHER.md#87-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 8](TRAPID_LEXICON.md)

---

---

## API Endpoints

**CRUD:**
- `GET /api/v1/purchase_orders` - List with filters
- `POST /api/v1/purchase_orders` - Create
- `PATCH /api/v1/purchase_orders/:id` - Update
- `DELETE /api/v1/purchase_orders/:id` - Delete

**Workflow Actions:**
- `POST /api/v1/purchase_orders/:id/approve`
- `POST /api/v1/purchase_orders/:id/send_to_supplier`
- `POST /api/v1/purchase_orders/:id/mark_received`

**Smart Features:**
- `POST /api/v1/purchase_orders/smart_lookup`
- `POST /api/v1/purchase_orders/smart_create`
- `POST /api/v1/purchase_orders/bulk_create`

**Documents:**
- `GET /api/v1/purchase_orders/:id/available_documents`
- `POST /api/v1/purchase_orders/:id/attach_documents`

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

**📖 Implementation:** See [TRAPID_TEACHER.md §9.1](TRAPID_TEACHER.md#91-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.2: isLoadingData Lock Timing

❌ **NEVER reset isLoadingData in drag handler**

✅ **ALWAYS reset in useEffect with 1000ms timeout**

**📖 Implementation:** See [TRAPID_TEACHER.md §9.2](TRAPID_TEACHER.md#92-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.3: Company Settings - Working Days & Timezone

❌ **NEVER hardcode working days or ignore company timezone**

✅ **ALWAYS read from:** `company_settings.working_days` and `company_settings.timezone`

**📖 Implementation:** See [TRAPID_TEACHER.md §9.3](TRAPID_TEACHER.md#93-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.4: Lock Hierarchy

❌ **NEVER cascade to locked tasks**

✅ **ALWAYS check all 5 locks before cascade**

**📖 Implementation:** See [TRAPID_TEACHER.md §9.4](TRAPID_TEACHER.md#94-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.5: Task Heights Configuration

✅ **MUST set all three to same value:**

❌ **NEVER have mismatched height values**

**📖 Implementation:** See [TRAPID_TEACHER.md §9.5](TRAPID_TEACHER.md#95-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.6: Auto-Scheduling

❌ **NEVER enable:** `gantt.config.auto_scheduling = true`

✅ **ALWAYS set:** `gantt.config.auto_scheduling = false`

**📖 Implementation:** See [TRAPID_TEACHER.md §9.6](TRAPID_TEACHER.md#96-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.7: API Pattern - Single Update + Cascade Response

❌ **NEVER make multiple API calls for cascade updates**

✅ **ALWAYS use:** Single update + cascade response pattern

**📖 Implementation:** See [TRAPID_TEACHER.md §9.7](TRAPID_TEACHER.md#97-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.8: useRef Anti-Loop Flags

✅ **MUST use all 7 useRef flags correctly:**

**📖 Implementation:** See [TRAPID_TEACHER.md §9.8](TRAPID_TEACHER.md#98-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.9: Predecessor Format

❌ **NEVER save without predecessor_ids**

✅ **ALWAYS include predecessor_ids in every update**

**📖 Implementation:** See [TRAPID_TEACHER.md §9.9](TRAPID_TEACHER.md#99-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.10: Cascade Triggers
**📖 Implementation:** See [TRAPID_TEACHER.md §9.10](TRAPID_TEACHER.md#910-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.11: Debounced Render Pattern

❌ **NEVER call gantt.render() directly**

✅ **ALWAYS use debounced render:**

**📖 Implementation:** See [TRAPID_TEACHER.md §9.11](TRAPID_TEACHER.md#911-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## RULE #9.12: Column Documentation - CC_UPDATE Table

❌ **NEVER change Schedule Master columns without updating CC_UPDATE table**

✅ **ALWAYS update NewFeaturesTab.jsx when column implementation changes**

**📖 Implementation:** See [TRAPID_TEACHER.md §9.12](TRAPID_TEACHER.md#912-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 9](TRAPID_LEXICON.md)

---

---

## 🔒 Protected Code Patterns - DO NOT MODIFY

### Protected Pattern #1: isLoadingData Lock in Drag Handler

**Location:** `DHtmlxGanttView.jsx:1414-1438`

✅ **MUST keep this exact implementation:**

❌ **DO NOT change timeout value**
❌ **DO NOT reset isLoadingData synchronously**

**For bug history, see:** Lexicon Chapter 9 → BUG-001 (8 iterations to fix)

### Protected Pattern #2: Backend Cascade Service

**Location:** `backend/app/services/schedule_cascade_service.rb`

✅ **MUST use update_column, NOT update:**

❌ **NEVER use:** `dependent_task.update(start_date: new_start_date)`

### Protected Pattern #3: Predecessor ID Conversion

**Location:** `backend/app/services/schedule_cascade_service.rb:95-96, 107-108`

✅ **MUST always convert:**

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

**Last Updated:** 2025-11-16

---

## Overview

This chapter defines rules for the **Project Tasks & Checklists** system, which manages work breakdown, task dependencies, supervisor checklists, and automated task spawning. Tasks are instances of work within a job, created from Schedule Templates or manually, with full support for dependencies, progress tracking, and documentation requirements.

**Related Chapters:**
- Chapter 9: Gantt & Schedule Master (schedule template instantiation)
- Chapter 5: Jobs & Construction Management (job lifecycle)
- Chapter 8: Purchase Orders (materials tracking)

---

## RULE #10.1: Task Status Lifecycle & Automatic Date Updates

✅ **MUST update dates automatically:**

❌ **NEVER:**
- Allow status to skip lifecycle stages (not_started → complete without in_progress)
- Overwrite existing actual dates when status changes again
- Leave progress_percentage < 100 when status is complete

**📖 Implementation:** See [TRAPID_TEACHER.md §10.1](TRAPID_TEACHER.md#101-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.2: Task Dependencies & Circular Dependency Prevention

✅ **MUST validate:**

❌ **NEVER:**
- Allow task to depend on itself (self-dependency)
- Allow circular chains (A depends on B, B depends on C, C depends on A)
- Allow cross-project dependencies
- Allow duplicate dependencies (same predecessor + successor pair)

**📖 Implementation:** See [TRAPID_TEACHER.md §10.2](TRAPID_TEACHER.md#102-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.3: Automatic Task Spawning from Templates

✅ **MUST implement via TaskSpawner service:**

✅ **MUST trigger spawning on status changes:**

❌ **NEVER:**
- Spawn tasks multiple times (check if already spawned)
- Spawn tasks without checking template configuration
- Create circular parent-child relationships
- Skip sequence ordering for subtasks (causes display chaos)

**📖 Implementation:** See [TRAPID_TEACHER.md §10.3](TRAPID_TEACHER.md#103-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.4: Supervisor Checklist Template-to-Instance Flow

✅ **MUST copy templates to instances during job instantiation:**

❌ **NEVER:**
- Share checklist items across tasks (each task gets own copies)
- Allow checklist item deletion after task starts
- Skip category validation (required for filtering)
- Store User FK for completed_by (store username string for flexibility)

**📖 Implementation:** See [TRAPID_TEACHER.md §10.4](TRAPID_TEACHER.md#104-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.5: Response Type Validation & Photo Upload

✅ **MUST validate before marking complete:**

✅ **MUST use Cloudinary for photo storage:**

❌ **NEVER:**
- Allow completion without required response data
- Store photos in Rails backend (use Cloudinary)
- Skip folder organization in Cloudinary (use job-specific folders)
- Allow checklist item updates after completion (completed_at is immutable)

**📖 Implementation:** See [TRAPID_TEACHER.md §10.5](TRAPID_TEACHER.md#105-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.6: Auto-Complete Predecessors Feature

✅ **MUST implement via callback:**

✅ **MUST show checkbox in task form:**

❌ **NEVER:**
- Auto-complete tasks with incomplete subtasks (check has_subtasks)
- Skip audit trail (add completion_notes explaining auto-completion)
- Allow infinite recursion (predecessors don't trigger their own predecessors)
- Auto-complete milestones (they should be explicitly completed)

**📖 Implementation:** See [TRAPID_TEACHER.md §10.6](TRAPID_TEACHER.md#106-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.7: Materials Status Calculation

✅ **MUST include in task serialization:**

✅ **MUST show status badges:**

❌ **NEVER:**
- Store materials_status in database (always calculate)
- Show materials status for tasks without critical_po flag
- Allow task to start if materials_status = 'delayed' (warn user)
- Skip materials check during schedule cascade calculations

**📖 Implementation:** See [TRAPID_TEACHER.md §10.7](TRAPID_TEACHER.md#107-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.8: Sequence Order for Task Display

✅ **MUST set sequence on creation:**

✅ **MUST index for efficient sorting:**

❌ **NEVER:**
- Use random sequence numbers (breaks visual grouping)
- Allow gaps larger than 1.0 between top-level tasks
- Use sequence > 9.9 for subtasks (use 9 or fewer subtasks per parent)
- Resort entire project when adding one task (use smart insertion)

**📖 Implementation:** See [TRAPID_TEACHER.md §10.8](TRAPID_TEACHER.md#108-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.9: Task Update Audit Trail
**📖 Implementation:** See [TRAPID_TEACHER.md §10.9](TRAPID_TEACHER.md#109-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.10: Duration Days Validation

✅ **MUST validate:**

❌ **NEVER:**
- Allow duration_days = 0 (causes same-day start/end, confusing)
- Allow negative durations (logically impossible)
- Skip duration validation on updates
- Use decimal durations (always integer days)

**📖 Implementation:** See [TRAPID_TEACHER.md §10.10](TRAPID_TEACHER.md#1010-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## RULE #10.11: Tags System for Flexible Categorization

✅ **MUST use GIN index for efficient queries:**

✅ **MUST include tags in serialization:**

❌ **NEVER:**
- Store tags as comma-separated string (use JSONB array)
- Allow duplicate tags in array
- Skip GIN index (queries will be slow)
- Use tags for data that should be proper associations (e.g., don't tag "assigned_to_john", use assigned_to FK)

**📖 Implementation:** See [TRAPID_TEACHER.md §10.11](TRAPID_TEACHER.md#1011-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 10](TRAPID_LEXICON.md)

---

---

## Protected Code Patterns

### 1. Task Spawning Service

**File:** `/Users/rob/Projects/trapid/backend/app/services/schedule/task_spawner.rb`

**DO NOT modify these methods without understanding Schedule Master integration:**

**Reason:** Task spawning is tightly coupled with Schedule Master template system. Changes here affect job instantiation.

---

### 2. Circular Dependency Check

**File:** `/Users/rob/Projects/trapid/backend/app/models/task_dependency.rb`

**DO NOT modify without graph theory expertise:**

**Reason:** Incorrect implementation causes infinite loops or missed circular references.

---

### 3. Template Instantiation

**File:** `/Users/rob/Projects/trapid/backend/app/services/schedule/template_instantiator.rb`

**DO NOT skip checklist item creation:**

**Reason:** This is the ONLY place checklists are instantiated. Skip this and jobs have no checklists.

---

## Summary

Chapter 10 establishes 11 rules covering:

1. **Task lifecycle** - Status flow and automatic date updates
2. **Dependencies** - Circular dependency prevention and validation
3. **Task spawning** - Automatic photo/certificate/subtask creation
4. **Supervisor checklists** - Template-to-instance flow
5. **Response validation** - Photo/note requirements per response type
6. **Auto-completion** - Predecessor auto-complete feature
7. **Materials tracking** - PO delivery vs task start comparison
8. **Sequence ordering** - Decimal sequences for parent-child proximity
9. **Audit trail** - (INCOMPLETE) Task update history
10. **Duration validation** - Minimum 1-day duration requirement
11. **Tags system** - JSONB array for flexible categorization

These rules ensure tasks are properly validated, dependencies are safe, automated workflows function correctly, and checklists support field supervisor workflows.

---

# Chapter 11: Weather & Public Holidays

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 11               │
│ 📘 USER MANUAL (HOW): Chapter 11               │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Overview

Weather & Public Holidays manages construction schedule interruptions through automatic rain logging and public holiday tracking. Integrates with Gantt/Schedule Master to automatically skip non-working days and provide accurate completion dates.

**Key Files:**
- Models: `backend/app/models/public_holiday.rb`, `backend/app/models/rain_log.rb`
- Controllers: `backend/app/controllers/api/v1/public_holidays_controller.rb`, `backend/app/controllers/api/v1/rain_logs_controller.rb`
- Service: `backend/app/services/weather_api_client.rb`
- Job: `backend/app/jobs/check_yesterday_rain_job.rb`

---

## RULE #11.1: Unique Holidays Per Region

✅ **MUST:**
- Validate uniqueness: `validates :date, uniqueness: { scope: :region }`
- Use region codes: QLD, NSW, VIC, SA, WA, TAS, NT, NZ
- Store date in UTC (no time component)

❌ **NEVER:**
- Allow duplicate holidays for same date + region
- Use inconsistent region codes
- Store holidays with time components

**📖 Implementation:** See [TRAPID_TEACHER.md §11.1](TRAPID_TEACHER.md#111-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 11](TRAPID_LEXICON.md)

---

---

## RULE #11.2: Rain Log - One Entry Per Construction Per Day

✅ **MUST:**
- Enforce uniqueness at database level: `UNIQUE(construction_id, date)`
- Check for existing log before auto-creation
- Use `find_or_initialize_by` pattern for updates

❌ **NEVER:**
- Create multiple rain logs for same job + date
- Override existing automatic logs without checking source
- Allow future-dated rain logs

**📖 Implementation:** See [TRAPID_TEACHER.md §11.2](TRAPID_TEACHER.md#112-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 11](TRAPID_LEXICON.md)

---

---

## RULE #11.3: Rainfall Severity Auto-Calculation

✅ **MUST calculate severity as:**
- Light: `< 5mm`
- Moderate: `5mm to 15mm`
- Heavy: `> 15mm`

✅ **MUST:**
- Auto-calculate on create if `rainfall_mm` present
- Recalculate on update if `rainfall_mm` changes
- Allow nil severity if `rainfall_mm` is nil or 0

❌ **NEVER:**
- Allow manual severity override without rainfall_mm
- Use different thresholds without updating constants
- Skip calculation for automatic entries

**📖 Implementation:** See [TRAPID_TEACHER.md §11.3](TRAPID_TEACHER.md#113-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 11](TRAPID_LEXICON.md)

---

---

## RULE #11.4: Manual Rain Logs Require Notes

✅ **MUST:**
- Validate presence: `validates :notes, presence: true, if: :source_manual?`
- Display notes in UI for audit trail
- Include who created the entry (`created_by_user_id`)

❌ **NEVER:**
- Allow blank notes for manual entries
- Skip audit trail for manual modifications
- Allow automatic entries to have editable notes

**📖 Implementation:** See [TRAPID_TEACHER.md §11.4](TRAPID_TEACHER.md#114-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 11](TRAPID_LEXICON.md)

---

---

## RULE #11.5: Weather API - Historical Data Only

✅ **MUST:**
- Validate date is not in future before API call
- Use `Date.yesterday` for automatic checks
- Raise `ArgumentError` if future date provided

❌ **NEVER:**
- Call weather API for today or future dates
- Use weather forecasts (not historical data)
- Proceed with API call if date validation fails

**📖 Implementation:** See [TRAPID_TEACHER.md §11.5](TRAPID_TEACHER.md#115-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 11](TRAPID_LEXICON.md)

---

---

## RULE #11.6: Location Extraction Priority

✅ **MUST follow priority:**

❌ **NEVER:**
- Use random location extraction order
- Fail silently if location cannot be determined
- Use company address as fallback (wrong location)

**📖 Implementation:** See [TRAPID_TEACHER.md §11.6](TRAPID_TEACHER.md#116-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 11](TRAPID_LEXICON.md)

---

---

## RULE #11.7: Gantt Integration - Working Day Calculation

✅ **MUST:**
- Load company `working_days` configuration
- Load `PublicHoliday` dates for relevant region (3-year range)
- Skip task to next working day if lands on weekend OR holiday
- Respect lock hierarchy (locked tasks can stay on holidays)

❌ **NEVER:**
- Check only weekends without holidays
- Check only holidays without weekends
- Override locked task dates
- Use different holiday lookups across services

**📖 Implementation:** See [TRAPID_TEACHER.md §11.7](TRAPID_TEACHER.md#117-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 11](TRAPID_LEXICON.md)

---

---

## RULE #11.8: Weather API Response Storage

✅ **MUST:**
- Store complete API JSON response
- Include location confirmation data
- Preserve all weather metrics (temp, condition, etc.)
- Use for future analysis and verification

❌ **NEVER:**
- Store only rainfall value
- Discard API response after extraction
- Modify API response before storage

**📖 Implementation:** See [TRAPID_TEACHER.md §11.8](TRAPID_TEACHER.md#118-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 11](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### GET /api/v1/public_holidays
**Purpose:** List public holidays with filtering

**Query Params:**
- `region` (optional) - QLD, NSW, VIC, etc. (default: QLD)
- `year` (optional) - Filter by specific year

**Response (200 OK):**

---

### GET /api/v1/public_holidays/dates
**Purpose:** Get array of holiday dates (optimized for Gantt view)

**Query Params:**
- `region` (optional) - Default: QLD
- `year_start` (optional) - Default: current year
- `year_end` (optional) - Default: current year + 2

**Response (200 OK):**

---

### GET /api/v1/constructions/:construction_id/rain_logs
**Purpose:** List rain logs for a job

**Query Params:**
- `start_date` (optional) - Filter from date
- `end_date` (optional) - Filter to date
- `source` (optional) - automatic, manual

**Response (200 OK):**

---

### POST /api/v1/constructions/:construction_id/rain_logs
**Purpose:** Create manual rain log entry

**Request Body:**

**Response (201 Created):**

---

# Chapter 12: OneDrive Integration

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 12               │
│ 📘 USER MANUAL (HOW): Chapter 12               │
└─────────────────────────────────────────────────┘

## Overview

OneDrive integration enables automatic folder creation for each construction job and document management. Supports uploading plans, quotes, contracts, and syncing product images for the price book.

**Key Files:**
- Controller: `backend/app/controllers/api/v1/organization_onedrive_controller.rb`
- Microsoft Graph Client: `backend/app/services/microsoft_graph_client.rb`
- Model: `backend/app/models/organization_one_drive_credential.rb`

---

## RULE #12.1: Organization-Wide Authentication

❌ **NEVER require each user to authenticate separately**

✅ **ALWAYS store single credential for entire organization**

**📖 Implementation:** See [TRAPID_TEACHER.md §12.1](TRAPID_TEACHER.md#121-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 12](TRAPID_LEXICON.md)

---

---

## RULE #12.2: Folder Template System

❌ **NEVER hardcode folder names**

✅ **ALWAYS respect template customizations**

**📖 Implementation:** See [TRAPID_TEACHER.md §12.2](TRAPID_TEACHER.md#122-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 12](TRAPID_LEXICON.md)

---

---

## RULE #12.3: Root Folder Management

❌ **NEVER create folders at OneDrive root level**

✅ **ALWAYS use `root_folder_id` from credential**

**📖 Implementation:** See [TRAPID_TEACHER.md §12.3](TRAPID_TEACHER.md#123-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 12](TRAPID_LEXICON.md)

---

---

## RULE #12.4: Pricebook Image Sync

❌ **NEVER rely solely on OneDrive for image display**

✅ **ALWAYS upload to Cloudinary after OneDrive upload**

**📖 Implementation:** See [TRAPID_TEACHER.md §12.4](TRAPID_TEACHER.md#124-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 12](TRAPID_LEXICON.md)

---

---

## RULE #12.5: File Upload Chunking

❌ **NEVER use simple upload for files >4MB**

✅ **ALWAYS use resumable upload session**

**📖 Implementation:** See [TRAPID_TEACHER.md §12.5](TRAPID_TEACHER.md#125-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 12](TRAPID_LEXICON.md)

---

---

## API Endpoints

**Authentication:**
- `GET /api/v1/organization_onedrive/status`
- `GET /api/v1/organization_onedrive/authorize`
- `GET /api/v1/organization_onedrive/callback`
- `DELETE /api/v1/organization_onedrive/disconnect`

**Folder Management:**
- `POST /api/v1/organization_onedrive/create_job_folders`
- `GET /api/v1/organization_onedrive/browse_folders`
- `PATCH /api/v1/organization_onedrive/change_root_folder`

**File Operations:**
- `POST /api/v1/organization_onedrive/upload`
- `GET /api/v1/organization_onedrive/download`

**Pricebook:**
- `POST /api/v1/organization_onedrive/sync_pricebook_images`

---

# Chapter 13: Outlook/Email Integration

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 13               │
│ 📘 USER MANUAL (HOW): Chapter 13               │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

---

## Overview

This chapter defines rules for **Outlook/Email Integration**, focusing on inbound email ingestion, OAuth authentication, auto-matching to jobs, and email storage. The system currently supports **one-way email import** (Outlook → Trapid) with automatic job association via intelligent parsing.

**Current State:** Inbound email capture implemented. Outbound sending NOT implemented.

**Related Chapters:**
- Chapter 5: Jobs & Construction Management (email association)
- Chapter 3: Contacts & Relationships (sender matching)

---

## RULE #13.1: Organization-Wide Singleton OAuth Credential

✅ **MUST implement as singleton:**

✅ **MUST auto-refresh tokens before expiration:**

❌ **NEVER:**
- Store multiple Outlook credentials (one organization = one credential)
- Store tokens unencrypted
- Let tokens expire without auto-refresh
- Hardcode token expiration buffer (always use 5-minute safety margin)

**📖 Implementation:** See [TRAPID_TEACHER.md §13.1](TRAPID_TEACHER.md#131-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 13](TRAPID_LEXICON.md)

---

---

## RULE #13.2: Four-Strategy Email-to-Job Matching

✅ **MUST implement all 4 strategies:**

✅ **MUST auto-assign on email creation:**

❌ **NEVER:**
- Skip matching strategies (must try all 4 in order)
- Match to inactive/archived jobs
- Auto-assign to wrong construction (false positive worse than nil)
- Allow email creation without attempting match

**📖 Implementation:** See [TRAPID_TEACHER.md §13.2](TRAPID_TEACHER.md#132-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 13](TRAPID_LEXICON.md)

---

---

## RULE #13.3: Microsoft Graph API Usage Pattern

✅ **MUST use Graph API v1.0:**

✅ **MUST request these scopes:**

❌ **NEVER:**
- Use Outlook REST API v2.0 (deprecated, use Graph API)
- Request more scopes than needed (principle of least privilege)
- Skip $select parameter (bandwidth waste - emails can be large)
- Use synchronous API calls without pagination

**📖 Implementation:** See [TRAPID_TEACHER.md §13.3](TRAPID_TEACHER.md#133-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 13](TRAPID_LEXICON.md)

---

---

## RULE #13.4: Email Threading Support via Message-ID

✅ **MUST include threading fields:**

✅ **MUST populate threading fields:**

❌ **NEVER:**
- Allow duplicate message_id (unique constraint required)
- Skip message_id extraction (breaks threading)
- Store references as array (use text with space-separated values per RFC 2822)

**📖 Implementation:** See [TRAPID_TEACHER.md §13.4](TRAPID_TEACHER.md#134-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 13](TRAPID_LEXICON.md)

---

---

## RULE #13.5: Webhook Support for Email Services

✅ **MUST implement webhook receiver:**

❌ **NEVER:**
- Return error status for webhook (email providers will retry, causing duplicates)
- Skip duplicate detection (check message_id uniqueness)
- Process webhook synchronously (use background job for heavy parsing)

**📖 Implementation:** See [TRAPID_TEACHER.md §13.5](TRAPID_TEACHER.md#135-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 13](TRAPID_LEXICON.md)

---

---

## RULE #13.6: Inbound-Only Architecture (Current Limitation)
**📖 Implementation:** See [TRAPID_TEACHER.md §13.6](TRAPID_TEACHER.md#136-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 13](TRAPID_LEXICON.md)

---

---

## Protected Code Patterns

### 1. Token Refresh Logic

**File:** `/Users/rob/Projects/trapid/backend/app/services/outlook_service.rb`

**DO NOT modify auto-refresh timing:**

**Reason:** 5-minute buffer prevents race conditions where token expires mid-request.

---

### 2. Email Matching Strategy Order

**File:** `/Users/rob/Projects/trapid/backend/app/services/email_parser_service.rb`

**DO NOT change strategy priority:**

1. Job reference in subject (most specific)
2. Job reference in body
3. Sender email contact match
4. Address fuzzy match (least specific)

**Reason:** Priority order minimizes false positives. Changing order causes incorrect job associations.

---

### 3. Singleton Credential Pattern

**File:** `/Users/rob/Projects/trapid/backend/app/models/organization_outlook_credential.rb`

**DO NOT create multiple credentials:**

**Reason:** Single-tenant architecture. Multiple credentials break OAuth flow and cause token conflicts.

---

## Summary

Chapter 13 establishes 6 rules covering:

1. **Singleton OAuth credential** - Organization-wide token with auto-refresh
2. **Four-strategy matching** - Job ref in subject/body, sender contact, address fuzzy match
3. **Graph API usage** - v1.0 endpoint, OData filters, minimal scopes
4. **Email threading** - Message-ID, In-Reply-To, References for conversation support
5. **Webhook support** - Inbound email capture from SendGrid, Mailgun, etc.
6. **Inbound-only limitation** - No outbound sending (documented gap)

These rules ensure reliable email ingestion, secure OAuth management, and accurate job association while documenting known limitations for future development.

---

# Chapter 14: Chat & Communications

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 14               │
│ 📘 USER MANUAL (HOW): Chapter 14               │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Overview

This chapter defines rules for **Chat & Communications**, covering internal team chat, direct messaging, SMS integration via Twilio, and email storage. The system supports multi-channel communication with job/construction linking capabilities.

**Key Features:**
- Team channels (#general, #team, #support)
- Direct user-to-user messaging
- SMS sending/receiving via Twilio
- Message-to-job linking
- Email ingestion and storage

**Key Files:**
- Models: `backend/app/models/chat_message.rb`, `sms_message.rb`, `email.rb`
- Controllers: `backend/app/controllers/api/v1/chat_messages_controller.rb`, `sms_messages_controller.rb`
- Services: `backend/app/services/twilio_service.rb`
- Frontend: `frontend/src/pages/ChatPage.jsx`, `frontend/src/components/chat/ChatBox.jsx`

**Related Chapters:**
- Chapter 5: Jobs & Construction Management (message linking)
- Chapter 3: Contacts & Relationships (SMS contact association)

---

## RULE #14.1: ChatMessage Multi-Channel Architecture

✅ **MUST define channel types:**

✅ **MUST route messages correctly:**

**📖 Implementation:** See [TRAPID_TEACHER.md §14.1](TRAPID_TEACHER.md#141-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.2: Message-to-Job Linking

✅ **MUST provide save-to-job endpoints:**

✅ **MUST include construction_id foreign key:**

✅ **MUST allow bulk conversation saving:**

**📖 Implementation:** See [TRAPID_TEACHER.md §14.2](TRAPID_TEACHER.md#142-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.3: SMS Twilio Integration

✅ **MUST centralize Twilio operations:**

✅ **MUST handle incoming SMS webhooks:**

✅ **MUST support Australian phone formats:**

**📖 Implementation:** See [TRAPID_TEACHER.md §14.3](TRAPID_TEACHER.md#143-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.4: SMS Status Tracking

✅ **MUST define status states:**

✅ **MUST accept Twilio status webhooks:**

✅ **MUST show status icons:**

**📖 Implementation:** See [TRAPID_TEACHER.md §14.4](TRAPID_TEACHER.md#144-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.5: Unread Message Tracking

✅ **MUST add read timestamp:**

✅ **MUST provide unread count endpoint:**

✅ **MUST poll for unread count:**

**📖 Implementation:** See [TRAPID_TEACHER.md §14.5](TRAPID_TEACHER.md#145-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.6: Message Polling (No WebSockets)

✅ **MUST poll at 3-second intervals:**

✅ **MUST poll SMS messages:**

❌ **NEVER use WebSockets:**
- WebSocket infrastructure not implemented
- ActionCable not configured
- All real-time updates via polling

**📖 Implementation:** See [TRAPID_TEACHER.md §14.6](TRAPID_TEACHER.md#146-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.7: Contact-SMS Fuzzy Matching

✅ **MUST support partial phone matches:**

**📖 Implementation:** See [TRAPID_TEACHER.md §14.7](TRAPID_TEACHER.md#147-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.8: Message Deletion Authorization

✅ **MUST verify ownership:**

❌ **NEVER allow:**
- Admins deleting other users' messages (not implemented)
- Bulk message deletion without ownership check
- Deletion of messages saved to jobs without audit trail

**📖 Implementation:** See [TRAPID_TEACHER.md §14.8](TRAPID_TEACHER.md#148-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.9: Email Ingestion Storage

✅ **MUST store email metadata:**

✅ **MUST include fields:**

**📖 Implementation:** See [TRAPID_TEACHER.md §14.9](TRAPID_TEACHER.md#149-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## RULE #14.10: Authentication Placeholder - CRITICAL TODO

✅ **MUST implement proper authentication:**

❌ **NEVER use in production:**
- `User.first` placeholder
- Hardcoded user IDs
- Session-less chat without auth

**📖 Implementation:** See [TRAPID_TEACHER.md §14.10](TRAPID_TEACHER.md#1410-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 14](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### Chat Messages

| Method | Endpoint | Query Params | Purpose |
|--------|----------|--------------|---------|
| GET | `/api/v1/chat_messages` | `channel`, `project_id`, `user_id` | Fetch messages |
| POST | `/api/v1/chat_messages` | - | Create message |
| DELETE | `/api/v1/chat_messages/:id` | - | Delete own message |
| GET | `/api/v1/chat_messages/unread_count` | - | Get unread count |
| POST | `/api/v1/chat_messages/mark_as_read` | - | Mark all as read |
| POST | `/api/v1/chat_messages/:id/save_to_job` | `construction_id` | Link message to job |
| POST | `/api/v1/chat_messages/save_conversation_to_job` | `construction_id`, `message_ids[]` | Bulk link to job |

### SMS Messages

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/contacts/:id/sms_messages` | Get SMS for contact |
| POST | `/api/v1/contacts/:id/sms_messages` | Send SMS |
| POST | `/api/v1/sms/webhook` | Twilio incoming webhook |
| POST | `/api/v1/sms/status` | Twilio status webhook |

### Emails

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/constructions/:id/emails` | Get emails for job |

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

❌ **NEVER store API keys in plaintext**

✅ **ALWAYS encrypt tokens using ActiveRecord Encryption**

**📖 Implementation:** See [TRAPID_TEACHER.md §15.1](TRAPID_TEACHER.md#151-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 15](TRAPID_LEXICON.md)

---

---

## RULE #15.2: Two-Way Contact Sync

❌ **NEVER assume single-direction sync**

✅ **ALWAYS check `sync_with_xero` flag before syncing**

✅ **ALWAYS update `last_synced_at` timestamp**

**📖 Implementation:** See [TRAPID_TEACHER.md §15.2](TRAPID_TEACHER.md#152-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 15](TRAPID_LEXICON.md)

---

---

## RULE #15.3: Invoice Matching

❌ **NEVER sync payments without invoice match**

✅ **ALWAYS validate invoice total vs PO total**

✅ **ALWAYS store `xero_invoice_id` on PurchaseOrder**

**📖 Implementation:** See [TRAPID_TEACHER.md §15.3](TRAPID_TEACHER.md#153-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 15](TRAPID_LEXICON.md)

---

---

## RULE #15.4: Webhook Signature Verification

❌ **NEVER process webhooks without signature verification**

✅ **ALWAYS use `XERO_WEBHOOK_KEY` from environment**

**📖 Implementation:** See [TRAPID_TEACHER.md §15.4](TRAPID_TEACHER.md#154-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 15](TRAPID_LEXICON.md)

---

---

## RULE #15.5: Rate Limiting & Error Handling

❌ **NEVER retry immediately on 429 errors**

✅ **ALWAYS implement exponential backoff**

✅ **ALWAYS log failed requests for debugging**

**📖 Implementation:** See [TRAPID_TEACHER.md §15.5](TRAPID_TEACHER.md#155-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 15](TRAPID_LEXICON.md)

---

---

## RULE #15.6: Tax Rates & Chart of Accounts

❌ **NEVER hardcode tax codes**

✅ **ALWAYS fetch from Xero and cache locally**

**📖 Implementation:** See [TRAPID_TEACHER.md §15.6](TRAPID_TEACHER.md#156-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 15](TRAPID_LEXICON.md)

---

---

## RULE #15.7: Background Job Processing

❌ **NEVER sync contacts in HTTP request**

✅ **ALWAYS use `XeroContactSyncJob` via Solid Queue**

✅ **ALWAYS provide job progress tracking**

**📖 Implementation:** See [TRAPID_TEACHER.md §15.7](TRAPID_TEACHER.md#157-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 15](TRAPID_LEXICON.md)

---

---

## RULE #15.8: Payment Sync Workflow

❌ **NEVER create Xero payment before local Payment record**

✅ **ALWAYS link Payment to PurchaseOrder**

**📖 Implementation:** See [TRAPID_TEACHER.md §15.8](TRAPID_TEACHER.md#158-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 15](TRAPID_LEXICON.md)

---

---

## Protected Code Patterns

### Pattern #1: Secure Token Refresh
**Location:** `XeroApiClient#make_request`

**DO NOT MODIFY:**

### Pattern #2: OData Query Sanitization
**Location:** `xero_controller.rb:600-606`

**DO NOT MODIFY:**

### Pattern #3: Webhook Signature Timing-Safe Comparison
**Location:** `xero_controller.rb:716`

**DO NOT MODIFY:**

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

**Last Updated:** 2025-11-16

## Overview

This chapter defines rules for **Payments & Financials**, covering payment recording, invoice matching, Xero synchronization, payment status tracking, and financial reporting. The system tracks payments against purchase orders with automatic status updates and budget variance analysis.

**Key Features:**
- Payment recording and tracking
- Xero invoice fuzzy matching (6-strategy algorithm)
- Automatic payment status calculation
- Budget variance tracking
- Financial dashboard with KPIs
- Payment synchronization to Xero

**Key Files:**
- Models: `backend/app/models/payment.rb`, `purchase_order.rb` (payment fields)
- Controllers: `backend/app/controllers/api/v1/payments_controller.rb`
- Services: `backend/app/services/xero_payment_sync_service.rb`, `invoice_matching_service.rb`
- Frontend: `frontend/src/components/purchase-orders/PaymentsList.jsx`, `NewPaymentModal.jsx`

**Related Chapters:**
- Chapter 8: Purchase Orders (payment association)
- Chapter 15: Xero Accounting Integration (sync infrastructure)
- Chapter 4: Price Books & Suppliers (supplier payment tracking)

---

## RULE #16.1: Payment Model Structure

✅ **MUST include core fields:**

✅ **MUST use DECIMAL(15,2) for precision:**

**📖 Implementation:** See [TRAPID_TEACHER.md §16.1](TRAPID_TEACHER.md#161-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.2: Automatic Payment Status Updates

✅ **MUST trigger on payment save/destroy:**

✅ **MUST define payment status states:**

**📖 Implementation:** See [TRAPID_TEACHER.md §16.2](TRAPID_TEACHER.md#162-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.3: Xero Invoice Fuzzy Matching

✅ **MUST implement matching hierarchy:**

✅ **MUST update PO with invoice data:**

**📖 Implementation:** See [TRAPID_TEACHER.md §16.3](TRAPID_TEACHER.md#163-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.4: Xero Payment Sync

✅ **MUST validate and sync:**

**📖 Implementation:** See [TRAPID_TEACHER.md §16.4](TRAPID_TEACHER.md#164-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.5: Payment Method Enum

✅ **MUST restrict to valid methods:**

✅ **MUST provide method selector:**

**📖 Implementation:** See [TRAPID_TEACHER.md §16.5](TRAPID_TEACHER.md#165-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.6: Financial Precision with DECIMAL(15,2)

✅ **MUST use DECIMAL type:**

✅ **MUST validate precision:**

❌ **NEVER use FLOAT:**
- Causes rounding errors in currency calculations
- Example: `0.1 + 0.2 = 0.30000000000000004` (FLOAT)
- DECIMAL: `0.10 + 0.20 = 0.30` (exact)

**📖 Implementation:** See [TRAPID_TEACHER.md §16.6](TRAPID_TEACHER.md#166-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.7: Payment Status Badge Display

✅ **MUST use semantic colors:**

**📖 Implementation:** See [TRAPID_TEACHER.md §16.7](TRAPID_TEACHER.md#167-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.8: Payment Summary Calculation

✅ **MUST include summary:**

✅ **MUST show summary prominently:**

**📖 Implementation:** See [TRAPID_TEACHER.md §16.8](TRAPID_TEACHER.md#168-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.9: Budget Variance Tracking

✅ **MUST calculate variances:**

✅ **MUST highlight overages:**

**📖 Implementation:** See [TRAPID_TEACHER.md §16.9](TRAPID_TEACHER.md#169-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## RULE #16.10: Cascade Delete Payments

✅ **MUST set dependent: :destroy:**

❌ **NEVER orphan payments:**
- Deleting PO without deleting payments breaks referential integrity
- Payment without PO is meaningless
- Use `dependent: :destroy` not `dependent: :nullify`

**📖 Implementation:** See [TRAPID_TEACHER.md §16.10](TRAPID_TEACHER.md#1610-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 16](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### Payments

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/purchase_orders/:po_id/payments` | List payments with summary |
| POST | `/api/v1/purchase_orders/:po_id/payments` | Record new payment |
| GET | `/api/v1/payments/:id` | Get single payment |
| PATCH | `/api/v1/payments/:id` | Update payment |
| DELETE | `/api/v1/payments/:id` | Delete payment |
| POST | `/api/v1/payments/:id/sync_to_xero` | Manual Xero sync |

### Xero Invoice Matching

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/xero/match_invoice` | Match Xero invoice to PO |
| GET | `/api/v1/xero/invoices` | Get Xero invoices |

---

# Chapter 17: Workflows & Automation

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 17               │
│ 📘 USER MANUAL (HOW): Chapter 17               │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Overview

This chapter defines rules for **Workflows & Automation**, covering background job processing, workflow approval systems, automated triggers, scheduled tasks, and model callbacks. The system uses Solid Queue for background job processing with automated retry logic and error handling.

**Key Features:**
- Multi-step workflow approvals
- Background job processing (Solid Queue)
- Automated price updates (daily recurring)
- OneDrive folder creation automation
- Xero contact synchronization
- AI-powered plan reviews
- Model callbacks for cascading updates
- Idempotent job design

**Key Files:**
- Jobs: `backend/app/jobs/*.rb` (10+ background jobs)
- Models: `backend/app/models/workflow_instance.rb`, `workflow_step.rb`
- Queue: `backend/config/solid_queue.yml`
- Frontend: `frontend/src/components/workflows/*.jsx`

**Related Chapters:**
- Chapter 12: OneDrive Integration (folder creation automation)
- Chapter 15: Xero Accounting Integration (contact sync automation)
- Chapter 7: AI Plan Review (AI automation)

---

## RULE #17.1: Solid Queue Background Job System

✅ **MUST configure Solid Queue:**

✅ **MUST inherit from ApplicationJob:**

**📖 Implementation:** See [TRAPID_TEACHER.md §17.1](TRAPID_TEACHER.md#171-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 17](TRAPID_LEXICON.md)

---

---

## RULE #17.2: Workflow State Machine

✅ **MUST implement state machine:**

✅ **MUST auto-advance on step completion:**

**📖 Implementation:** See [TRAPID_TEACHER.md §17.2](TRAPID_TEACHER.md#172-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 17](TRAPID_LEXICON.md)

---

---

## RULE #17.3: Idempotent Background Jobs

✅ **MUST check completion status:**

✅ **MUST verify record doesn't exist:**

**📖 Implementation:** See [TRAPID_TEACHER.md §17.3](TRAPID_TEACHER.md#173-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 17](TRAPID_LEXICON.md)

---

---

## RULE #17.4: Price Update Automation

✅ **MUST implement price application:**

**📖 Implementation:** See [TRAPID_TEACHER.md §17.4](TRAPID_TEACHER.md#174-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 17](TRAPID_LEXICON.md)

---

---

## RULE #17.5: Model Callback Automation

✅ **MUST update dependent data:**

✅ **MUST trigger child creation:**

✅ **MUST track changes:**

**📖 Implementation:** See [TRAPID_TEACHER.md §17.5](TRAPID_TEACHER.md#175-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 17](TRAPID_LEXICON.md)

---

---

## RULE #17.6: Job Status Tracking

✅ **MUST provide status visibility:**

✅ **MUST show percentage:**

**📖 Implementation:** See [TRAPID_TEACHER.md §17.6](TRAPID_TEACHER.md#176-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 17](TRAPID_LEXICON.md)

---

---

## RULE #17.7: Batch Processing with Rate Limiting

✅ **MUST batch and throttle:**

**📖 Implementation:** See [TRAPID_TEACHER.md §17.7](TRAPID_TEACHER.md#177-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 17](TRAPID_LEXICON.md)

---

---

## RULE #17.8: Workflow Metadata Storage

✅ **MUST support all workflow types:**

✅ **MUST collect metadata:**

**📖 Implementation:** See [TRAPID_TEACHER.md §17.8](TRAPID_TEACHER.md#178-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 17](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### Workflows

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/workflow_instances` | List workflows |
| POST | `/api/v1/workflow_instances` | Start workflow |
| GET | `/api/v1/workflow_instances/:id` | Get workflow details |
| POST | `/api/v1/workflow_steps/:id/approve` | Approve step |
| POST | `/api/v1/workflow_steps/:id/reject` | Reject step |
| POST | `/api/v1/workflow_steps/:id/request_changes` | Request changes |

### Background Jobs

| Job | Trigger | Schedule |
|-----|---------|----------|
| ApplyPriceUpdatesJob | Daily | Midnight |
| CreateJobFoldersJob | Manual | On-demand |
| XeroContactSyncJob | Webhook/Manual | On-demand |
| AiReviewJob | Manual | On-demand |
| ImportJob | Manual | On-demand |

---

# Chapter 18: Custom Tables & Formulas

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 18               │
│ 📘 USER MANUAL (HOW): Chapter 18               │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Overview

This chapter defines rules for **Custom Tables & Formulas**, a dynamic table generation system that allows users to create custom data tables with typed columns, formula calculations, and cross-table relationships. The system uses Rails' dynamic class generation to create individual database tables for each custom table.

**Key Features:**
- 17 column types (text, number, date, lookup, computed, etc.)
- Formula evaluation via Dentaku gem
- Cross-table lookups in formulas
- Dynamic ActiveRecord model generation
- Lookup columns with searchable display values
- N+1 query prevention via batch loading

**Key Files:**
- Models: `backend/app/models/table.rb`, `column.rb`
- Services: `backend/app/services/table_builder.rb`, `formula_evaluator.rb`
- Controllers: `backend/app/controllers/api/v1/tables_controller.rb`, `columns_controller.rb`, `records_controller.rb`
- Frontend: `frontend/src/pages/TablePage.jsx`, `frontend/src/components/table/AddColumnModal.jsx`

**Related Chapters:**
- Chapter 1: Authentication & Users (user column type references User model)
- Chapter 3: Contacts & Relationships (similar lookup pattern)

---

## RULE #18.1: Dynamic Table Creation Pattern

✅ **MUST use auto-generated unique name:**

✅ **MUST create ActiveRecord model at runtime:**

❌ **NEVER:**
- Use table names without prefix
- Allow reserved names: `["user", "users", "table", "tables", "column", "columns", "record", "records"]`
- Reuse database_table_name across tables

**📖 Implementation:** See [TRAPID_TEACHER.md §18.1](TRAPID_TEACHER.md#181-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 18](TRAPID_LEXICON.md)

---

---

## RULE #18.2: Column Type System

✅ **MUST map column types correctly:**

✅ **MUST use TableBuilder for physical schema changes:**

**📖 Implementation:** See [TRAPID_TEACHER.md §18.2](TRAPID_TEACHER.md#182-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 18](TRAPID_LEXICON.md)

---

---

## RULE #18.3: Formula Evaluation System

✅ **MUST support curly brace references:**

✅ **MUST evaluate formulas safely:**

✅ **MUST flag columns with cross-table refs:**

**📖 Implementation:** See [TRAPID_TEACHER.md §18.3](TRAPID_TEACHER.md#183-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 18](TRAPID_LEXICON.md)

---

---

## RULE #18.4: Lookup Column Pattern

✅ **MUST create associations dynamically:**

✅ **MUST batch-load related records:**

✅ **MUST return id + display value:**

**📖 Implementation:** See [TRAPID_TEACHER.md §18.4](TRAPID_TEACHER.md#184-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 18](TRAPID_LEXICON.md)

---

---

## RULE #18.5: Record CRUD with Formula Calculation

✅ **MUST calculate formulas on save:**

✅ **MUST transform computed values on read:**

**📖 Implementation:** See [TRAPID_TEACHER.md §18.5](TRAPID_TEACHER.md#185-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 18](TRAPID_LEXICON.md)

---

---

## RULE #18.6: Table Deletion Safety

✅ **MUST validate before deletion:**

✅ **MUST drop database table:**

**📖 Implementation:** See [TRAPID_TEACHER.md §18.6](TRAPID_TEACHER.md#186-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 18](TRAPID_LEXICON.md)

---

---

## RULE #18.7: Column Validation Rules

✅ **MUST enforce validation rules:**

✅ **MUST validate record data before save:**

**📖 Implementation:** See [TRAPID_TEACHER.md §18.7](TRAPID_TEACHER.md#187-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 18](TRAPID_LEXICON.md)

---

---

## RULE #18.8: Foreign Key Constraints

✅ **MUST add foreign keys for lookups:**

❌ **NEVER use on_delete: :cascade** for lookup columns (data loss risk)

**📖 Implementation:** See [TRAPID_TEACHER.md §18.8](TRAPID_TEACHER.md#188-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 18](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### Tables

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/tables` | List all tables with record counts |
| GET | `/api/v1/tables/:id` | Get table with columns |
| POST | `/api/v1/tables` | Create new table |
| PATCH | `/api/v1/tables/:id` | Update table metadata |
| DELETE | `/api/v1/tables/:id` | Delete table (with safety checks) |

### Columns

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/tables/:table_id/columns` | Add column to table |
| PATCH | `/api/v1/tables/:table_id/columns/:id` | Update column |
| DELETE | `/api/v1/tables/:table_id/columns/:id` | Remove column |
| GET | `/api/v1/tables/:table_id/columns/:id/lookup_options` | Get lookup values |
| POST | `/api/v1/tables/:table_id/columns/test_formula` | Test formula on sample |
| GET | `/api/v1/tables/:table_id/columns/:id/lookup_search?q=` | Search lookups |

### Records

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/tables/:table_id/records` | List records (search, sort, paginate) |
| GET | `/api/v1/tables/:table_id/records/:id` | Get single record |
| POST | `/api/v1/tables/:table_id/records` | Create record |
| PATCH | `/api/v1/tables/:table_id/records/:id` | Update record |
| DELETE | `/api/v1/tables/:table_id/records/:id` | Delete record |

---

# Chapter 19: UI/UX Standards & Patterns

┌─────────────────────────────────────────────────┐
│ 📍 IMPLEMENTATION: Chapter 19                   │
│ 📕 LEXICON (BUGS):    Chapter 19               │
│ 📘 USER MANUAL (HOW): Chapter 19               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Authority:** ABSOLUTE
**Last Updated:** 2025-11-17 AEST

This chapter defines ALL UI/UX patterns for Trapid. Every interactive element MUST follow these standards.

---

## RULE #19.1: Standard Table Component Usage

✅ **MUST ask user before creating ANY table:**

❌ **NEVER:**
- Create table without asking user
- Choose on behalf of user
- Create "basic" custom table (use DataTable instead)

**📖 Implementation:** See [TRAPID_TEACHER.md §19.1](TRAPID_TEACHER.md#191-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.2: Table Header Requirements
**📖 Implementation:** See [TRAPID_TEACHER.md §19.2](TRAPID_TEACHER.md#192-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.3: Column Search/Filter Requirements (REQUIRED)
**📖 Implementation:** See [TRAPID_TEACHER.md §19.3](TRAPID_TEACHER.md#193-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.4: Column Resizing Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.4](TRAPID_TEACHER.md#194-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.5: Column Reordering Standards

❌ **NEVER:**
- Put entire header in one onClick handler
- Make drag handle sortable
- Forget `e.stopPropagation()` on drag handle

**📖 Implementation:** See [TRAPID_TEACHER.md §19.5](TRAPID_TEACHER.md#195-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.5A: Column Visibility Toggle (REQUIRED)

❌ **NEVER:**
- Allow hiding ALL columns
- Hide actions column
- Forget localStorage persistence

**📖 Implementation:** See [TRAPID_TEACHER.md §19.5A](TRAPID_TEACHER.md#195a-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.5B: Column Width Persistence (REQUIRED)
**📖 Implementation:** See [TRAPID_TEACHER.md §19.5B](TRAPID_TEACHER.md#195b-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.6: Scroll Behavior Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.6](TRAPID_TEACHER.md#196-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.7: Column Width Standards

✅ **MUST set widths consistently:**
- `<th>`: `style={{ width: `${width}px`, minWidth: `${width}px` }}`
- `<td>`: `style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}`

**📖 Implementation:** See [TRAPID_TEACHER.md §19.7](TRAPID_TEACHER.md#197-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.8: Cell Content Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.8](TRAPID_TEACHER.md#198-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.9: Row Interaction Standards

❌ **NEVER:**
- Add explicit size classes to checkboxes (`h-4 w-4` OK, but browser default preferred)
- Make selection column draggable
- Include selection in columnOrder state

**📖 Implementation:** See [TRAPID_TEACHER.md §19.9](TRAPID_TEACHER.md#199-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.10: Column Visibility Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.10](TRAPID_TEACHER.md#1910-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.11: Search & Filter UI Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.11](TRAPID_TEACHER.md#1911-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.11A: Table Toolbar Layout Standards (REQUIRED)

❌ **NEVER:**
- Put search on right side
- Use different button heights
- Stack toolbar vertically
- Add gap between search and first button

**📖 Implementation:** See [TRAPID_TEACHER.md §19.11A](TRAPID_TEACHER.md#1911a-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.12: Empty States

✅ **MUST differentiate:**

**📖 Implementation:** See [TRAPID_TEACHER.md §19.12](TRAPID_TEACHER.md#1912-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.13: State Persistence Standards

✅ **MUST persist to localStorage:**

❌ **NEVER:**
- Use generic keys (collision risk)
- Persist without try/catch
- Forget defaults

**📖 Implementation:** See [TRAPID_TEACHER.md §19.13](TRAPID_TEACHER.md#1913-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.14: Sorting Standards

✅ **MUST support:**
- Primary/secondary sort
- 3-state cycle: asc → desc → none

**📖 Implementation:** See [TRAPID_TEACHER.md §19.14](TRAPID_TEACHER.md#1914-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.15: Dark Mode Requirements

❌ **NEVER:**
- Use light-mode-only colors
- Use pure white/black (use gray-50/gray-900)

**📖 Implementation:** See [TRAPID_TEACHER.md §19.15](TRAPID_TEACHER.md#1915-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.16: Performance Standards

✅ **MUST memoize when:**
- Filtering large datasets (>100 rows)
- Sorting complex data
- Computing derived values

❌ **NEVER:**
- Filter/sort without memoization
- Create inline functions in map()

**📖 Implementation:** See [TRAPID_TEACHER.md §19.16](TRAPID_TEACHER.md#1916-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.17: Accessibility Standards

✅ **MUST support:**
- Tab through interactive elements
- Enter/Space to trigger actions
- `scope="col"` on `<th>` elements
- `aria-label` on icon-only buttons
- Semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- `sr-only` text for icons

**📖 Implementation:** See [TRAPID_TEACHER.md §19.17](TRAPID_TEACHER.md#1917-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.18: Testing Considerations

✅ **MUST verify:**

**📖 Implementation:** See [TRAPID_TEACHER.md §19.18](TRAPID_TEACHER.md#1918-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.19: URL State Management

✅ **MUST sync URL for:**
- Active tab selection (always)
- Filter/search queries (optional, for sharing)
- Pagination state
- Sort state (optional)

❌ **NEVER:**
- Store tab state only in component
- Break browser back button
- Use push for every state change

**📖 Implementation:** See [TRAPID_TEACHER.md §19.19](TRAPID_TEACHER.md#1919-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.20: Search Functionality Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.20](TRAPID_TEACHER.md#1920-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.21: Form Standards

✅ **MUST include for all inputs:**
- Label with `htmlFor` matching input `id`
- Dark mode styling
- Focus states (indigo ring)
- Error state styling

**📖 Implementation:** See [TRAPID_TEACHER.md §19.21](TRAPID_TEACHER.md#1921-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.22: Modal & Drawer Standards

✅ **MUST include:**
- Close button (top-right)
- Dark mode support

**📖 Implementation:** See [TRAPID_TEACHER.md §19.22](TRAPID_TEACHER.md#1922-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.23: Toast Notification Standards

✅ **MUST use Toast for:**
- Success confirmations
- Error messages
- Warning notifications
- Info messages

❌ **NEVER:**
- Show technical errors to users
- Use toasts for critical errors (use modal)
- Stack multiple toasts
- Show longer than 5 seconds

**📖 Implementation:** See [TRAPID_TEACHER.md §19.23](TRAPID_TEACHER.md#1923-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.24: Loading State Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.24](TRAPID_TEACHER.md#1924-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.25: Button & Action Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.25](TRAPID_TEACHER.md#1925-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.26: Status Badge Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.26](TRAPID_TEACHER.md#1926-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.27: Empty State Standards

✅ **MUST differentiate:**

**📖 Implementation:** See [TRAPID_TEACHER.md §19.27](TRAPID_TEACHER.md#1927-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.28: Navigation Standards
**📖 Implementation:** See [TRAPID_TEACHER.md §19.28](TRAPID_TEACHER.md#1928-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.29: Chapter 19 Documentation Maintenance (REQUIRED)

✅ **MUST update Chapter 19 when:**
- Adding new table features
- Modifying existing table patterns
- Creating new components
- Changing standard UI patterns
- Adding new requirements
- Discovering missing features

❌ **NEVER:**
- Make table changes without updating Chapter 19
- Create custom patterns not documented
- Skip timestamp update
- Forget to commit Bible with code

**📖 Implementation:** See [TRAPID_TEACHER.md §19.29](TRAPID_TEACHER.md#1929-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## RULE #19.30: Touch Target Sizes & Click Areas

❌ **NEVER:**
- Create interactive elements < 44px without compensating padding
- Place elements closer than 8px
- Assume mouse users only

**📖 Implementation:** See [TRAPID_TEACHER.md §19.30](TRAPID_TEACHER.md#1930-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 19](TRAPID_LEXICON.md)

---

---

## Protected Code Patterns (Chapter 19)

---

**End of Chapter 19**
# Chapter 20: Agent System & Automation

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 20                │
│ 📘 USER MANUAL (HOW): N/A (Developer-only)      │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Overview

The Agent System provides specialized AI agents for development tasks. Each agent has specific capabilities, tracks run history, and is stored in the `agent_definitions` database table.

**7 Active Agents:**
1. **backend-developer** - Rails API development
2. **frontend-developer** - React + Vite frontend
3. **production-bug-hunter** - General bug diagnosis
4. **deploy-manager** - Git + Heroku deployment
5. **planning-collaborator** - Architecture planning
6. **gantt-bug-hunter** - Gantt-specific diagnostics
7. **ui-compliance-auditor** - RULE #19 table compliance auditing

**Database-Primary:** Agent definitions stored in database, managed via API.

---

## RULE #20.1: Agent Definitions Are Database-Driven

✅ **MUST:**
- Store all agent metadata in database
- Update run history after each agent execution
- Use API endpoints to manage agents
- Track success/failure rates
- Maintain agent priority order

❌ **NEVER:**
- Hardcode agent configurations in code
- Skip recording agent runs
- Modify `.claude/agents/*.md` files without updating database
- Create agents without database entries

**📖 Implementation:** See [TRAPID_TEACHER.md §20.1](TRAPID_TEACHER.md#201-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## RULE #20.2: Agent Invocation Protocol

✅ **MUST:**
- Check if agent exists and is active
- Record run start timestamp
- Execute agent task
- Record success or failure with details
- Return comprehensive result

❌ **NEVER:**
- Invoke inactive agents
- Skip recording run results
- Return vague error messages
- Execute agents without user context

**📖 Implementation:** See [TRAPID_TEACHER.md §20.2](TRAPID_TEACHER.md#202-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## RULE #20.3: Run History Tracking

✅ **MUST:**
- Record total_runs, successful_runs, failed_runs
- Store last_run_at timestamp
- Save last_status and last_message
- Include detailed last_run_details (JSONB)
- Calculate success_rate automatically

❌ **NEVER:**
- Skip recording runs
- Overwrite historical run data
- Record runs for testing/debugging
- Fake success/failure status

**📖 Implementation:** See [TRAPID_TEACHER.md §20.3](TRAPID_TEACHER.md#203-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## RULE #20.4: Agent Types and Specialization

✅ **MUST:**
- Assign agent_type: `development`, `diagnostic`, `deployment`, or `planning`
- Define clear focus area (e.g., "Rails API Backend Development")
- Specify tools available to agent
- Document when to use each agent
- Provide example invocations

❌ **NEVER:**
- Create overlapping agent responsibilities
- Use generic agent for specialized tasks
- Skip documenting agent capabilities
- Create agents without clear purpose

**📖 Implementation:** See [TRAPID_TEACHER.md §20.4](TRAPID_TEACHER.md#204-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## RULE #20.5: Agent Priority and Display Order

✅ **MUST:**
- Set priority field (0-100)
- Display agents sorted by: priority DESC, name ASC
- Show active agents first
- Hide inactive agents from main list

❌ **NEVER:**
- Display agents alphabetically only
- Show inactive agents in main list
- Change priority without reason

**📖 Implementation:** See [TRAPID_TEACHER.md §20.5](TRAPID_TEACHER.md#205-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## RULE #20.6: Agent Shortcuts and Invocation

✅ **MUST:**
- Support `run {agent-id}` (e.g., `run backend-developer`)
- Support shortened versions (e.g., `backend dev`, `gantt`)
- Document shortcuts in `example_invocations` field
- Parse user input case-insensitively

❌ **NEVER:**
- Require exact agent_id match
- Skip documenting shortcuts
- Create conflicting shortcuts

**📖 Implementation:** See [TRAPID_TEACHER.md §20.6](TRAPID_TEACHER.md#206-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## RULE #20.7: Recently Run Check (Smart Testing)

✅ **MUST:**
- Check `last_run_at` timestamp
- Compare to threshold (e.g., 60 minutes)
- Skip redundant tests if recent successful run
- ALWAYS re-run if last run failed
- Ask user if uncertain

❌ **NEVER:**
- Skip tests without checking recency
- Ignore failed runs in recency check
- Use stale results without user awareness

**📖 Implementation:** See [TRAPID_TEACHER.md §20.7](TRAPID_TEACHER.md#207-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## RULE #20.8: Shortcut Clarity - AgentShortcutsTab Updates

✅ **MUST:**
- Update `frontend/src/components/settings/AgentShortcutsTab.jsx` when adding new shortcuts
- Add new shortcuts to the `baseCommands` array
- Ensure shortcuts match agent file definitions exactly
- Use sequential IDs (avoid duplicates)
- Document the shortcut pattern in the command field
- Follow the format: `{ id: N, command: 'What Claude executes', shortcut: 'what user types, comma-separated' }`

❌ **NEVER:**
- Leave shortcuts undocumented
- Create duplicate IDs in baseCommands array
- Use shortcuts that contradict agent definitions
- Hardcode shortcuts outside the table

**📖 Implementation:** See [TRAPID_TEACHER.md §20.8](TRAPID_TEACHER.md#208-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## RULE #20.9: Creating New Agents - Complete Checklist

✅ **MUST UPDATE (4 files):**

❌ **NEVER:**
- Create an agent in only one location
- Skip updating run-history.json
- Forget to add to the controllers fallback list
- Miss updating the frontend component

**📖 Implementation:** See [TRAPID_TEACHER.md §20.9](TRAPID_TEACHER.md#209-)
**📕 Bug History:** See [TRAPID_LEXICON.md Chapter 20](TRAPID_LEXICON.md)

---

---

## API Endpoints Reference

### GET /api/v1/agent_definitions
Returns list of all active agents, sorted by priority.

**Response:**

### GET /api/v1/agent_definitions/:agent_id
Returns single agent with full details.

### POST /api/v1/agent_definitions/:agent_id/record_run
Records a run result.

**Request:**

### POST /api/v1/agent_definitions (admin)
Creates a new agent.

### PATCH /api/v1/agent_definitions/:agent_id (admin)
Updates an agent.

### DELETE /api/v1/agent_definitions/:agent_id (admin)
Deactivates an agent (sets `active: false`).

---

## Protected Code Patterns (Chapter 20)

### AgentDefinition Model
**File:** `backend/app/models/agent_definition.rb`
**Protected:** `record_success()`, `record_failure()`, `success_rate()`, `recently_run?()` methods

### Agent API Controller
**File:** `backend/app/controllers/api/v1/agent_definitions_controller.rb`
**Protected:** Run recording logic, parameter filtering, JSON response format

❌ **DO NOT:**
- Modify run recording methods without updating all agents
- Change API response format (breaks frontend)
- Remove JSONB fields (metadata, last_run_details)
- Skip validations on agent creation

---

## 📋 Quick Checklist Before Committing

- [ ] Followed all RULES in relevant chapters
- [ ] Did NOT modify Protected Code Patterns
- [ ] Updated Bible if new RULE discovered
- [ ] Updated Lexicon if bug fixed
- [ ] Tested changes locally

---

**Last Updated:** 2025-11-16 09:01 AEST
**Maintained By:** Development Team
**Authority Level:** ABSOLUTE
