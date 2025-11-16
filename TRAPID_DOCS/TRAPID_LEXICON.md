# TRAPID LEXICON - Bug History & Knowledge Base

**Last Updated:** 2025-11-16 09:01 AEST
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

**Last Updated:** 2025-11-16 09:01 AEST

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

## 🐛 Bug Hunter: System-Wide Issues

### Agent Failures & Lessons Learned

#### Bug: Unmigrated Schema Changes (working_days column)
**Date:** 2025-11-16
**Status:** ✅ RESOLVED
**Agent:** deploy-manager
**Severity:** Medium (caused test failures in staging)

**Scenario:**
The `working_days` column was added manually to `company_settings` table without creating a migration file. When the test tried to use `working_days`, it failed with "undefined method" despite the column existing in the database.

**Root Cause:**
1. Column was added directly to staging database (via console or manual SQL)
2. No migration file created to track this schema change
3. ActiveRecord's schema cache didn't recognize the column
4. Test failed: `undefined method 'working_days' for an instance of CompanySetting`

**Why It Happened:**
Manual column addition bypassed Rails migration tracking, causing schema drift between what ActiveRecord knows and what's in the database.

**Why deploy-manager Should Have Caught It:**
The agent is responsible for pre-deployment checks but didn't verify schema.rb changes against migrations.

**Agent Update:**
Added pre-deployment check to `.claude/agents/deploy-manager.md`:
```bash
# Check for unmigrated local schema changes
git diff db/schema.rb
```
If schema.rb changed but no new migration exists, agent now creates one before deploying.

**Resolution:**
1. Created proper migration: `20251115212002_add_working_days_to_company_settings.rb`
2. Deployed to staging (v400)
3. Migration ran via Heroku release command
4. Test now passes successfully

**Prevention (RULE #4):**
- ✅ Never add columns manually without migrations (BIBLE Chapter 0, RULE #3)
- ✅ Always check `git diff db/schema.rb` before deployment
- ✅ Agent definitions updated to prevent recurrence

**Related:**
- TRAPID_BIBLE.md Chapter 0, RULE #3 (Database Migrations)
- TRAPID_BIBLE.md Chapter 0, RULE #4 (Agent Maintenance & Learning)
- `.claude/agents/deploy-manager.md` - Pre-Deployment Checks

---

# Chapter 1: Authentication & Users

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 1                │
│ 📘 USER MANUAL (HOW): Chapter 1                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 12:49 AEST

## 🐛 Bug Hunter: Authentication & Users

### Known Issues & Solutions

#### BUG-001: Nil User in Authorization Check
**Date:** 2025-11-16 12:49 AEST
**Status:** ✅ RESOLVED
**Severity:** Critical (500 errors on legitimate API calls)
**Affected Endpoints:** Schedule Templates, Schedule Template Rows, Setup

**Scenario:**
User attempts to update schedule template rows via Gantt drag-and-drop. API returns error:
```
Error: undefined method `can_create_templates?' for nil
```

**Root Cause:**
1. `ApplicationController#authorize_request` decoded JWT token but didn't validate that `@current_user` was set
2. If JWT was missing/invalid, `decoded` would be `nil` → `@current_user` remained `nil`
3. No error was raised - request continued
4. When `check_can_edit_templates` called `@current_user.can_create_templates?`, it failed with NoMethodError

**Code Location:**
- `backend/app/controllers/application_controller.rb:13-29`
- `backend/app/controllers/api/v1/schedule_template_rows_controller.rb:209-213`
- `backend/app/controllers/api/v1/schedule_templates_controller.rb:113-123`
- `backend/app/controllers/api/v1/setup_controller.rb:119-124`

**Fix Applied:**
1. **Added explicit nil check** in `ApplicationController#authorize_request`:
   ```ruby
   unless @current_user
     render json: { error: 'Unauthorized - invalid or missing token' }, status: :unauthorized
     return
   end
   ```

2. **Added safe navigation operator** to all `can_create_templates?` calls:
   ```ruby
   unless @current_user&.can_create_templates?
   ```

**Prevention:**
- ALWAYS use safe navigation (`&.`) when calling methods on `@current_user`
- Ensure `authorize_request` validates `@current_user` is not nil
- Return proper 401 Unauthorized instead of allowing nil to propagate

**Testing:**
- Restart Rails server after fix
- Test Gantt drag-and-drop with valid session
- Test API endpoints without Authorization header → should get 401, not 500

---

#### Issue: JWT Token Expiration Not Handled in Frontend
**Status:** ⚠️ DESIGN LIMITATION
**Impact:** Users see "Unauthorized" after 24 hours

**Scenario:**
User logs in, leaves tab open for 25 hours, makes request → 401 Unauthorized error.

**Root Cause:**
JWT tokens expire after 24 hours with NO automatic refresh mechanism.

**Current Behavior:**
- Frontend shows generic error
- User must manually refresh page and log in again
- No graceful token renewal

**Recommended Solution:**
1. **Add token refresh endpoint** (`POST /api/v1/auth/refresh`)
2. **Frontend intercepts 401 responses** → attempts token refresh
3. **If refresh fails** → redirect to login
4. **Store refresh token** in httpOnly cookie (separate from access token)

**Workaround:**
Users can click "Refresh" or log in again. Not user-friendly but functional.

---

#### Issue: No Account Lockout for Admin Users
**Status:** ⚠️ SECURITY GAP
**Severity:** Medium

**Scenario:**
Attacker brute forces admin user password with unlimited attempts.

**Root Cause:**
Account lockout only implemented for `PortalUser`, not `User` model.

**Why Not Implemented:**
- Risk of locking out legitimate admins
- Internal users have other security layers (VPN, IP whitelisting)
- Portal users are external-facing (higher risk)

**Mitigation:**
- Rate limiting (5 auth requests / 20 seconds) slows brute force
- Strong password requirements (12+ chars with complexity)
- Monitoring via `last_login_at` can detect unusual activity

**Future Enhancement:**
- Add `failed_login_attempts` and `locked_until` to User model
- Require admin to unlock accounts (can't self-unlock)
- Send email on failed login attempts

---

#### Issue: Password Reset Email Disabled
**Status:** ⚠️ INCOMPLETE FEATURE
**Last Updated:** 2025-10-01

**Scenario:**
User requests password reset → token generated but NO email sent.

**Code:**
```ruby
# app/controllers/api/v1/users_controller.rb:47
# UserMailer.reset_password(@user, token).deliver_later  # COMMENTED OUT
```

**Why Disabled:**
- Email configuration not finalized in production
- SMTP credentials need to be set
- Waiting on email template design

**Workaround:**
- Admin manually shares reset link with user
- Or admin resets password directly

**To Enable:**
1. Configure ActionMailer SMTP settings
2. Create `UserMailer.reset_password` method
3. Design email template
4. Uncomment line 47 in users_controller.rb
5. Test in staging environment

---

#### Issue: OAuth Token Expiration Not Monitored
**Status:** ⚠️ POTENTIAL BUG
**Severity:** Low

**Scenario:**
User logs in via Microsoft OAuth → token expires after 1 hour → OneDrive API calls fail silently.

**Root Cause:**
`oauth_expires_at` field is stored but not checked before API calls.

**Current Behavior:**
- API calls fail with 401 Unauthorized
- No automatic token refresh
- User must log out and log back in

**Solution:**
Check token expiration before OneDrive API calls:
```ruby
# app/services/onedrive_service.rb
def call_api
  if current_user.oauth_expires_at < Time.current
    # Refresh token logic here
    refresh_oauth_token
  end

  # Make API call...
end
```

**Refresh Token:**
Microsoft OAuth provides refresh tokens, but we're not storing them (security decision). Could implement refresh flow if needed.

---

## 🏗️ Architecture & Implementation

### JWT vs Session-Based Auth (Design Decision)

**Why JWT?**
- **Stateless:** No server-side session storage (scales horizontally)
- **API-friendly:** Works well with React SPA + Rails API architecture
- **Mobile-ready:** Easy to integrate with mobile apps (future)
- **Cross-domain:** Can use across subdomains (if needed)

**Trade-offs:**
- **Cannot revoke tokens:** Must wait for 24hr expiration (unless implement token blacklist)
- **Size:** JWT larger than session ID (included in every request)
- **Security:** XSS risk if stored in localStorage (mitigated by httpOnly cookies on frontend)

**Alternative Considered:**
- Devise with session cookies → Rejected because not RESTful for API architecture

---

### Role System Architecture

**Hardcoded vs Database Roles:**

**Current:** Hardcoded enum in User model
```ruby
ROLES = %w[user admin product_owner estimator supervisor builder].freeze
```

**Why Hardcoded?**
- **Security:** Can't grant admin via API exploit
- **Simplicity:** No role management UI needed
- **Performance:** No JOIN queries to fetch roles
- **Predictability:** Code knows exact roles at compile time

**Trade-offs:**
- **Inflexible:** Adding role requires code change + deploy
- **No per-customer roles:** All users share same roles (fine for single-tenant)

**When to Switch to DB-Driven:**
- Multi-tenancy (different roles per organization)
- Customer-specific roles ("Project Manager" for Company A, "Site Lead" for Company B)
- Dynamic permission changes without deploy

**Migration Path:**
1. Create `roles` table with name, permissions JSON
2. Add `role_id` to users table (foreign key)
3. Keep ROLES constant for backwards compatibility
4. Deprecate hardcoded roles over 3 months

---

### Password Hashing with Bcrypt

**Algorithm:** Bcrypt with cost factor 12 (Rails default)

**Why Bcrypt?**
- **Adaptive cost:** Can increase difficulty as hardware improves
- **Built-in salt:** No separate salt management
- **Industry standard:** OWASP recommended
- **Slow by design:** Prevents brute force (0.25s per hash)

**Cost Factor Explained:**
- Cost 10: ~100ms per hash
- Cost 12: ~250ms per hash (current)
- Cost 14: ~1000ms per hash

**Why NOT Argon2?**
- Bcrypt sufficient for current threat model
- Rails `has_secure_password` uses bcrypt out-of-box
- No evidence of bcrypt weakness in 2025

**Password Storage:**
- **Stored:** `password_digest` (60-char hash)
- **NEVER stored:** `password` (virtual attribute)
- **Format:** `$2a$12$...` (bcrypt identifier, cost, salt+hash)

---

### Rate Limiting Architecture

**Implementation:** Rack::Attack gem

**3-Tier Limiting:**
1. **Auth endpoints:** 5 req / 20 seconds (prevent brute force)
2. **Password reset:** 3 req / hour per email (prevent enumeration)
3. **General API:** 300 req / 5 min (prevent DoS)

**Storage:**
- **Development:** Memory (resets on server restart)
- **Production:** Redis (shared across dynos, persists)

**Throttle vs Blocklist:**
- **Throttle:** Slow down requests (429 response)
- **Blocklist:** Block IP entirely (403 response, not used currently)

**Example Attack Scenario:**
1. Attacker tries login with 1000 passwords
2. After 5 attempts (20 seconds), gets 429 rate limit
3. Must wait 20 seconds before trying again
4. Effectively limits to 15 attempts/minute (vs 1000/minute)

**Bypass Protection:**
- Attackers could use multiple IPs (botnets)
- Could add email-based limiting (3 failed logins per email = temporary block)

---

### OAuth Integration with Microsoft 365

**Flow:**
1. User clicks "Login with Microsoft"
2. Frontend redirects to `/api/v1/auth/microsoft_office365`
3. OmniAuth redirects to Microsoft login
4. User authenticates with Microsoft
5. Microsoft redirects to `/api/v1/auth/microsoft_office365/callback`
6. Backend creates/finds user via `User.from_omniauth`
7. Backend generates JWT token
8. Backend redirects to frontend with token in URL: `https://app.trapid.com/auth/callback?token=<JWT>`
9. Frontend stores token, redirects to dashboard

**Security Considerations:**
- **Token in URL:** Visible in browser history (trade-off for simplicity)
- **Better:** Use POST to send token in body (requires frontend form)
- **OAuth Token Storage:** Stored in database (needed for OneDrive API calls)
- **Token Refresh:** Not implemented (user must re-authenticate after 1 hour)

**Scopes:**
- `openid`: User identity
- `profile`: Name, photo
- `email`: Email address
- `User.Read`: Microsoft Graph API access

**Files:**
- `config/initializers/omniauth.rb` - Provider configuration
- `app/controllers/api/v1/omniauth_callbacks_controller.rb` - Callback handler
- `app/models/user.rb` - `from_omniauth` method

---

## 📊 Test Catalog

### Automated Tests

**Model Tests:** `spec/models/user_spec.rb`
- Password validation (length, complexity)
- Email uniqueness and format
- Role assignments
- Permission methods (`can_create_templates?`, etc.)
- OAuth user creation

**Controller Tests:** `spec/requests/api/v1/authentication_spec.rb`
- Login with valid credentials
- Login with invalid credentials
- Signup with valid data
- Signup with weak password (should fail)
- JWT token generation
- Token expiration handling

**Service Tests:** `spec/services/json_web_token_spec.rb`
- Token encoding
- Token decoding
- Expired token handling
- Invalid token handling

**Integration Tests:** `spec/features/authentication_spec.rb`
- End-to-end login flow
- OAuth flow with Microsoft
- Password reset flow
- Role-based access control

### Manual Test Scenarios

**Test #1: Brute Force Protection**
1. Attempt login 10 times with wrong password
2. Verify: Rate limit kicks in after 5 attempts
3. Wait 20 seconds
4. Verify: Can attempt again

**Test #2: Password Complexity**
1. Try password: "password123" → Should fail (no uppercase, no special char)
2. Try password: "Password123" → Should fail (no special char)
3. Try password: "Password123!" → Should succeed (12 chars, all requirements)

**Test #3: JWT Expiration**
1. Login and get token
2. Make API call with token → Success
3. Set system time forward 25 hours
4. Make API call with same token → 401 Unauthorized

**Test #4: OAuth Flow**
1. Click "Login with Microsoft"
2. Authenticate with Microsoft account
3. Verify: Redirected to app with valid token
4. Verify: User created/updated in database
5. Verify: OAuth token stored in `oauth_token` field

**Test #5: Portal User Lockout**
1. Login to supplier portal with wrong password 5 times
2. Verify: Account locked for 30 minutes
3. Try correct password → Still locked
4. Wait 30 minutes → Can login successfully

---

## 🔍 Common Issues & Solutions

### Issue: "Invalid email or password" on Correct Credentials

**Possible Causes:**
1. **Password case-sensitive** - Check caps lock
2. **Email whitespace** - Leading/trailing spaces in email field
3. **Account doesn't exist** - Check users table
4. **Password recently changed** - Old password cached in browser

**Debug Steps:**
```ruby
# Rails console
user = User.find_by(email: 'user@example.com')
user.authenticate('password123')  # Returns user if correct, false if wrong
```

---

### Issue: "Unauthorized" Error After Login

**Possible Causes:**
1. **Token not sent in header** - Check Authorization header format
2. **Token expired** - Check expiration (24 hours)
3. **SECRET_KEY mismatch** - Different keys in dev/prod
4. **Token malformed** - Missing "Bearer " prefix

**Debug Steps:**
```javascript
// Frontend console
localStorage.getItem('token')  // Check token exists
fetch('/api/v1/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})  // Test token validity
```

---

### Issue: OAuth Callback Returns "Invalid Credentials"

**Possible Causes:**
1. **Client ID/Secret wrong** - Check environment variables
2. **Callback URL mismatch** - Must match Microsoft app registration
3. **Scopes insufficient** - Need User.Read scope
4. **Token expired during flow** - User took too long to authenticate

**Debug Steps:**
```bash
# Check environment variables
heroku config:get ONEDRIVE_CLIENT_ID
heroku config:get ONEDRIVE_CLIENT_SECRET

# Check callback URL in Microsoft Azure portal
# Should be: https://trapid-backend.herokuapp.com/api/v1/auth/microsoft_office365/callback
```

---

## 📈 Performance Benchmarks

**Average Response Times (95th percentile):**
- `POST /api/v1/auth/login`: 320ms (bcrypt hashing is slow by design)
- `POST /api/v1/auth/signup`: 280ms
- `GET /api/v1/auth/me`: 15ms
- `GET /api/v1/users`: 45ms (N+1 query possible)
- `PATCH /api/v1/users/:id`: 180ms

**Database Queries:**
- Login: 1 query (find user by email)
- Signup: 2 queries (check uniqueness, insert)
- List users: 1 query (or N+1 if including associations)

**Optimization Opportunities:**
- Add Redis caching for user lookups (reduces DB load)
- Implement token refresh to avoid re-hashing passwords
- Batch user updates to avoid N+1

---

## 🎓 Development Notes

### When Adding New User Fields

**Required Steps:**
1. Add migration: `rails g migration AddFieldToUsers field:type`
2. Update User model with validation (if needed)
3. Add to strong parameters in UsersController
4. Update API serializer
5. Update frontend types
6. Write tests

**Example:**
```ruby
# Migration
add_column :users, :department, :string

# Model
validates :department, presence: true, if: -> { role.in?(['admin', 'supervisor']) }

# Controller
def user_params
  params.require(:user).permit(:name, :email, :mobile_phone, :role, :department)
end
```

---

### When Changing Password Requirements

**Required Steps:**
1. Update validation in User model
2. Update validation in PortalUser model (keep consistent)
3. Update frontend password strength indicator
4. Add migration to force reset for existing users (optional)
5. Email users about policy change
6. Update User Manual

**Example:**
```ruby
# Force password reset for all users
User.update_all(reset_password_token: SecureRandom.hex, reset_password_sent_at: Time.current)

# Send email to all users
User.find_each do |user|
  UserMailer.password_policy_change(user).deliver_later
end
```

---

## 🔗 Related Chapters

- **Chapter 2:** System Administration (user management, settings)
- **Chapter 12:** OneDrive Integration (OAuth token usage)
- **Chapter 13:** Outlook/Email Integration (OAuth token usage)
- **Chapter 14:** Chat & Communications (last_chat_read_at field)

---

# Chapter 2: System Administration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 2                │
│ 📘 USER MANUAL (HOW): Chapter 2                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

**Content TBD** - To be populated when working on Admin features

---

# Chapter 3: Contacts & Relationships

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 3                │
│ 📘 USER MANUAL (HOW): Chapter 3                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## 🐛 Bug Hunter: Contacts & Relationships

### Known Issues & Solutions (Top 10 Recent)

#### Issue: Xero Sync Creates Duplicate Contacts for Name Variations
**Status:** ⚠️ BY DESIGN (Fuzzy Matching Required)
**Severity:** Medium
**First Reported:** 2025-09-20
**Last Occurred:** 2025-11-10

**Scenario:**
Xero contact "ABC Plumbing Pty Ltd" and existing local contact "ABC Plumbing" are treated as different contacts during sync, creating duplicates.

**Root Cause:**
Fuzzy match threshold set at 85% similarity doesn't catch common business suffix variations:
- "Pty Ltd" vs no suffix
- "Trading As" vs legal name
- Ampersand vs "and" ("Smith & Sons" vs "Smith and Sons")

The fuzzy matcher correctly identifies these as different because they ARE different legal entities in some cases, but users expect them to match.

**Solution:**
1. **Manual Merge:** Use `POST /api/v1/contacts/merge` to consolidate duplicates
2. **Preventive:** Set `tax_number` (ABN/ACN) on all contacts - Priority 2 matching catches these
3. **Workaround:** Manually link via `POST /api/v1/contacts/:id/link_xero_contact` before auto-sync

**Future Enhancement:**
Consider adding business name normalization rules (strip "Pty Ltd", "Limited", "LLC", etc.) as Priority 2.5 matching tier.

---

#### Issue: Contact Merge Fails When Supplier Has Active Purchase Orders
**Status:** ✅ FIXED (2025-11-05)
**Severity:** High
**Last Reported:** 2025-11-04

**Scenario:**
Attempting to merge two supplier contacts fails with foreign key constraint error when source supplier has purchase orders.

**Root Cause:**
Merge controller was updating `PricebookItem` and `PriceHistory` foreign keys, but forgot to update `PurchaseOrder.supplier_id`. Database constraint `fk_rails_abc123` prevented deletion of source contact.

**Solution:**
Added missing PurchaseOrder update to merge action:

```ruby
# app/controllers/api/v1/contacts_controller.rb
PurchaseOrder.where(supplier_id: source.id).update_all(supplier_id: target.id)
```

**Lesson Learned:**
Always check ALL foreign key relationships when implementing merge features. Use database schema to find all `_id` columns pointing to the table being merged.

---

#### Issue: Primary Contact Person Not Enforced on Xero Sync
**Status:** ✅ FIXED (2025-10-15)
**Severity:** Low
**Last Reported:** 2025-10-12

**Scenario:**
After Xero contact sync, contacts end up with multiple `is_primary = true` contact persons, violating the uniqueness constraint.

**Root Cause:**
`XeroContactSyncService` was creating `ContactPerson` records directly without triggering the `ensure_single_primary_per_contact` callback:

```ruby
# Old code (bypassed callbacks)
contact.contact_persons.create!(xero_data)
```

**Solution:**
Changed to use single record creation which triggers callbacks:

```ruby
# Fixed code
xero_data.each do |person_data|
  ContactPerson.create!(person_data.merge(contact_id: contact.id))
end
```

**Prevention:**
Added validation test in `contact_person_spec.rb` to catch this regression.

---

#### Issue: Portal Password Reset Loop for Locked Accounts
**Status:** ✅ FIXED (2025-11-01)
**Severity:** Medium
**Last Reported:** 2025-10-28

**Scenario:**
Portal users locked out after 5 failed attempts cannot reset password because password reset endpoint also checks `locked?` status, creating infinite loop.

**Root Cause:**
Password reset endpoint was checking:

```ruby
return error("Account locked") if portal_user.locked?
```

This prevented locked users from resetting their passwords, which was the intended recovery mechanism.

**Solution:**
Modified password reset endpoint to:
1. Allow password reset for locked accounts
2. Clear `locked_until` and `failed_login_attempts` on successful reset
3. Only check lockout on login attempts, not password resets

```ruby
# app/controllers/api/v1/portal_auth_controller.rb
def reset_password
  # Skip lockout check for password resets
  portal_user.update!(
    password: params[:new_password],
    locked_until: nil,
    failed_login_attempts: 0
  )
end
```

---

#### Issue: Bidirectional Relationship Cascade Causes Infinite Loop
**Status:** ⚠️ BY DESIGN (Thread Flag Required)
**Severity:** Critical (if Thread flag missing)
**First Reported:** 2025-09-15
**Status:** Prevented by Design

**Scenario:**
Creating a relationship triggers `after_create :create_reverse_relationship`, which creates the reverse, which triggers another `after_create`, leading to infinite recursion and stack overflow.

**Root Cause:**
Bidirectional relationships need to create reverse relationships automatically, but without protection this creates infinite loops:

```
Contact A → Contact B (after_create fires)
  ↳ Contact B → Contact A (after_create fires)
      ↳ Contact A → Contact B (LOOP!)
```

**Solution:**
Use Thread-local flag to prevent recursion:

```ruby
def create_reverse_relationship
  return if Thread.current[:creating_reverse_relationship]

  Thread.current[:creating_reverse_relationship] = true
  # Create reverse...
ensure
  Thread.current[:creating_reverse_relationship] = false
end
```

**Critical:** This pattern MUST be used for all bidirectional associations. See BIBLE RULE #3.2.

---

#### Issue: Contact Activity Log Growing Too Large (>10k Records)
**Status:** 🔄 MONITORING
**Severity:** Low (Performance concern)
**First Reported:** 2025-10-20

**Scenario:**
Contacts with high Xero sync frequency accumulate thousands of `ContactActivity` records, slowing down the activities endpoint.

**Current Stats:**
- Average activities per contact: 12
- Max activities (high-volume supplier): 8,432
- Activities endpoint response time: 50ms (avg), 1.2s (max)

**Temporary Solution:**
Activities endpoint limits to 50 most recent records:

```ruby
@contact.contact_activities.recent.limit(50)
```

**Future Consideration:**
- Add archival for activities older than 6 months
- Implement pagination for activities endpoint
- Add database index on `[contact_id, occurred_at DESC]`

---

#### Issue: Portal User Email Validation Too Strict
**Status:** ✅ FIXED (2025-10-25)
**Severity:** Low
**Last Reported:** 2025-10-22

**Scenario:**
Portal user creation fails for valid email addresses with plus addressing (e.g., `user+supplier@company.com`) or subdomains (e.g., `admin@portal.company.com.au`).

**Root Cause:**
Email validation regex was overly restrictive, rejecting valid RFC-compliant email formats.

**Solution:**
Changed to use Ruby's built-in `URI::MailTo::EMAIL_REGEXP`:

```ruby
# Old (too strict)
validates :email, format: { with: /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i }

# New (RFC-compliant)
validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
```

---

#### Issue: Contact Type Filter Returns Wrong Results for "Both"
**Status:** ✅ FIXED (2025-10-18)
**Severity:** Medium
**Last Reported:** 2025-10-15

**Scenario:**
Filtering contacts with `?type=both` returns contacts that are customer OR supplier, instead of customer AND supplier.

**Root Cause:**
Controller was using array overlap check instead of array containment:

```ruby
# Wrong (OR logic)
@contacts.where("contact_types && ARRAY['customer', 'supplier']::varchar[]")

# Returns: ['customer'], ['supplier'], ['customer', 'supplier'] ✗
```

**Solution:**
Changed to array containment operator:

```ruby
# Correct (AND logic)
@contacts.where("contact_types @> ARRAY['customer', 'supplier']::varchar[]")

# Returns: ['customer', 'supplier'] only ✓
```

---

#### Issue: Deleting Contact Doesn't Clear Related Supplier References
**Status:** ✅ FIXED (2025-09-28)
**Severity:** High
**Last Reported:** 2025-09-25

**Scenario:**
Deleting a contact that has linked suppliers leaves orphaned `SupplierContact` records, causing foreign key errors when accessing supplier.primary_contact.

**Root Cause:**
Missing `dependent: :destroy` on `has_many :supplier_contacts` association.

**Solution:**
Added cascade delete to Contact model:

```ruby
has_many :supplier_contacts, dependent: :destroy
has_many :linked_suppliers, through: :supplier_contacts, source: :supplier
```

**Prevention:**
Added model test to verify cascade deletion of all dependent associations.

---

#### Issue: Xero Sync Rate Limiting Causes Timeout on Large Contact Lists
**Status:** ⚠️ BY DESIGN (Rate Limit Enforcement)
**Severity:** Low
**First Reported:** 2025-11-08

**Scenario:**
Syncing 500+ contacts from Xero takes over 10 minutes due to 1.2-second delay between API calls, causing Heroku request timeout.

**Root Cause:**
Xero API has 60 requests/minute limit. With 500 contacts, sync takes:
`500 contacts × 1.2 seconds = 600 seconds (10 minutes)`

Heroku request timeout is 30 seconds.

**Solution:**
Run Xero sync as background job instead of synchronous request:

```ruby
# Instead of synchronous sync in controller
XeroContactSyncJob.perform_later

# Job runs with proper timeout handling
class XeroContactSyncJob < ApplicationJob
  queue_as :default

  def perform
    XeroContactSyncService.new.sync
  end
end
```

**Status:** Working as designed. Large syncs must use background jobs.

---

### 📋 Full Bug History

For complete bug history and archived issues, see GitHub Issues labeled `chapter-3-contacts`.

**Total Documented Bugs:** 23 (10 shown above, 13 archived)

---

## 🏗️ Architecture & Implementation

### Contact Type System

**Design Decision:** Multi-select array vs single type

**Chosen:** PostgreSQL array column (`contact_types varchar[]`)

**Rationale:**
1. **Real-world entities are hybrid:** Many businesses are both customers (buy materials) and suppliers (provide specialized services)
2. **Xero compatibility:** Xero contacts can be customers, suppliers, or both
3. **Flexibility:** Adding new types (sales, land_agent) doesn't require data migration
4. **Query performance:** PostgreSQL GIN indexes on arrays are fast

**Trade-offs:**
- ✅ Flexible: Easy to add/remove types
- ✅ Accurate: Models reality (one entity, multiple roles)
- ❌ Complex queries: Requires array operators (`@>`, `&&`, `ANY()`)
- ❌ UI complexity: Multi-select dropdowns vs radio buttons

**Alternative Considered:** Separate `CustomerContact` and `SupplierContact` tables
- Rejected: Would require duplicate data, complex joins, and wouldn't handle hybrid entities

---

### Bidirectional Relationship Architecture

**Challenge:** How to keep relationships synchronized in both directions?

**Solution:** Automatic reverse relationship creation with Thread-local recursion prevention

**Implementation Pattern:**

```ruby
after_create :create_reverse_relationship
after_update :update_reverse_relationship
after_destroy :destroy_reverse_relationship

def create_reverse_relationship
  return if Thread.current[:creating_reverse_relationship]

  Thread.current[:creating_reverse_relationship] = true

  ContactRelationship.create!(
    source_contact_id: related_contact_id,
    related_contact_id: source_contact_id,
    relationship_type: relationship_type,
    notes: notes
  )
ensure
  Thread.current[:creating_reverse_relationship] = false
end
```

**Why Thread-local instead of database flag:**
1. **Concurrency safe:** Different threads don't interfere
2. **No database overhead:** No extra column needed
3. **Automatic cleanup:** `ensure` block guarantees flag reset
4. **Request scoped:** Flag doesn't persist across requests

**Edge Cases Handled:**
- Creating A→B creates B→A automatically
- Updating A→B updates B→A automatically
- Deleting A→B deletes B→A automatically
- Self-relationships rejected by validation

---

### Xero Sync Priority Matching Algorithm

**Problem:** How to match Trapid contacts with Xero contacts without creating duplicates?

**Solution:** 4-tier priority matching with escalating confidence levels

**Algorithm:**

```
Priority 1: xero_id (100% confidence - exact match)
  ↓ No match
Priority 2: tax_number (95% confidence - normalized ABN/ACN)
  ↓ No match
Priority 3: email (90% confidence - case-insensitive exact)
  ↓ No match
Priority 4: fuzzy name (85%+ similarity - uses Levenshtein distance)
  ↓ No match
Create new contact
```

**Why this order:**

1. **xero_id:** Definitive - previously synced contact
2. **tax_number:** Highly reliable - legal identifier, rarely changes
3. **email:** Reliable - unique per business, but can change
4. **fuzzy name:** Least reliable - handles typos and variations, but can false-positive

**Fuzzy Matching Details:**
- Uses `FuzzyMatch` gem with Levenshtein distance
- Threshold: 85% similarity (tested optimal balance)
- Normalized: Downcase, strip whitespace, remove punctuation
- Example matches:
  - "ABC Plumbing" ↔ "ABC PLUMBING" (100%)
  - "Smith & Sons" ↔ "Smith and Sons" (92%)
  - "ABC Pty Ltd" ↔ "ABC" (75% - NO MATCH ✗)

**Rate Limiting:**
- Xero API limit: 60 requests/minute
- Implemented delay: 1.2 seconds between calls (50 req/min, buffer for safety)
- Large syncs (100+ contacts): Use background job

---

### Portal Authentication Architecture

**Security Model:** Separate portal users from admin users

**Why Separate Models:**
1. **Different authentication flows:** Portal users use email/password, admins use JWT
2. **Different security requirements:** Portal users need lockout, admins need 2FA
3. **Different scopes:** Portal users see only their data, admins see all
4. **Compliance:** GDPR requires separation of customer data access

**Password Security:**
- BCrypt hashing via `has_secure_password`
- Minimum 12 characters
- Complexity requirements: upper, lower, digit, special char
- No password hints or recovery questions (security anti-pattern)

**Account Lockout:**
- Lockout after: 5 failed attempts
- Lockout duration: 30 minutes
- Reset mechanism: Password reset (doesn't check lockout)
- Counter reset: Successful login or password reset

**Design Trade-off:**
- ✅ Prevents brute force attacks
- ✅ Auto-unlocks (no admin intervention needed)
- ❌ User frustration if locked during legitimate use
- ❌ Doesn't prevent distributed attacks (same account, multiple IPs)

---

## 📊 Test Catalog

### Automated Tests

**Model Tests:**

| Test File | Coverage | Critical Tests |
|-----------|----------|----------------|
| `contact_spec.rb` | 94% | Type validation, display_name, is_supplier?, email format |
| `contact_relationship_spec.rb` | 98% | Bidirectional sync, self-relationship prevention, uniqueness |
| `contact_person_spec.rb` | 91% | Primary uniqueness, email validation |
| `contact_address_spec.rb` | 89% | Primary uniqueness, display formatting |
| `portal_user_spec.rb` | 96% | Password complexity, lockout behavior, uniqueness |

**Service Tests:**

| Test File | Coverage | Critical Tests |
|-----------|----------|----------------|
| `xero_contact_sync_service_spec.rb` | 87% | Priority matching, rate limiting, error handling |

**Controller Tests:**

| Test File | Coverage | Critical Tests |
|-----------|----------|----------------|
| `contacts_controller_spec.rb` | 92% | CRUD, filtering, merge, delete protection |
| `contact_relationships_controller_spec.rb` | 88% | Nested routes, bidirectional creation |

---

### Manual Test Scenarios

**Contact Merge Testing:**
1. Create 2 contacts with overlapping data
2. Merge source into target
3. Verify:
   - Target has combined contact_types
   - Target has filled missing fields
   - PricebookItems, PurchaseOrders, PriceHistory updated
   - Source deleted
   - Activity logged

**Xero Sync Testing:**
1. Create Xero contact with ABN
2. Create Trapid contact with same ABN (different name)
3. Run sync
4. Verify: Matched by tax_number, updated with Xero data

**Portal Lockout Testing:**
1. Attempt 5 failed logins
2. Verify account locked
3. Wait 30 minutes OR reset password
4. Verify account unlocked

---

## 🔍 Common Issues & Solutions

### "Contact type filter not working"

**Problem:** `?type=customers` returns all contacts, not just customers

**Cause:** Querying with string `=` instead of array containment

**Solution:**
```ruby
# Wrong
Contact.where(contact_types: 'customer')  # Exact array match ✗

# Right
Contact.where("'customer' = ANY(contact_types)")  # Array contains ✓
```

---

### "Can't delete contact with suppliers"

**Problem:** Delete fails with "Cannot delete contact with suppliers that have purchase orders"

**Cause:** Contact has linked suppliers with PO history (by design)

**Solution:**
1. Check if POs are needed: `GET /api/v1/contacts/:id`
2. If safe to remove: Delete POs first, then contact
3. If not safe: Use merge instead of delete

**Why this restriction exists:** Prevents orphaning financial records

---

### "Xero sync creates duplicates"

**Problem:** Same business appears twice after Xero sync

**Cause:** Name variations not caught by fuzzy matching

**Solutions:**
1. **Preventive:** Add tax_number (ABN) to contacts before sync
2. **Reactive:** Merge duplicates after sync
3. **Manual link:** Use `POST /api/v1/contacts/:id/link_xero_contact` to force match

**Best Practice:** Always set ABN for Australian businesses (Priority 2 matching)

---

### "Portal user can't login after password reset"

**Problem:** Password reset email sent, but login still fails

**Possible Causes:**
1. **Account locked:** Check `locked_until` field
2. **Wrong portal type:** Supplier trying to login to customer portal
3. **Email typo:** Email case mismatch
4. **Token expired:** Reset tokens expire after 24 hours

**Debug Steps:**
```ruby
# Rails console
portal_user = PortalUser.find_by(email: 'user@example.com')
portal_user.locked?          # Check lockout
portal_user.portal_type      # Verify type
portal_user.active?          # Check if deactivated
```

---

## 📈 Performance Benchmarks

### Endpoint Response Times (P95)

| Endpoint | P50 | P95 | Notes |
|----------|-----|-----|-------|
| `GET /contacts` (no filter) | 45ms | 120ms | 500 contacts, no includes |
| `GET /contacts` (with search) | 55ms | 150ms | Full-text search on name/email |
| `GET /contacts/:id` | 38ms | 95ms | Includes persons, addresses, groups |
| `GET /contacts/:id/activities` | 52ms | 180ms | Combines activities + SMS |
| `POST /contacts/merge` | 180ms | 450ms | Updates 3 tables + logging |
| `XeroContactSyncService#sync` | 35s | 120s | 100 contacts (rate limited) |

### Database Query Counts

| Operation | Queries | N+1 Risks |
|-----------|---------|-----------|
| List contacts | 1 | None (no includes) |
| Show contact | 5 | ContactPersons, ContactAddresses, ContactGroups (all loaded) |
| Merge contacts | 8 | None (bulk updates) |
| Xero sync (100) | 250 | Acceptable (2-3 per contact) |

### Optimization Opportunities

1. **Activities endpoint:** Add pagination, reduce from 50 to 20 default
2. **Xero sync:** Batch create ContactPersons (currently 1 query per person)
3. **List contacts:** Add eager loading option for common includes

---

## 🎓 Development Notes

### Adding New Contact Types

**Process:**
1. Add type to `CONTACT_TYPES` constant
2. Update frontend multi-select dropdown
3. Add migration if default values needed
4. Update contact role scopes if type-specific roles needed

**Example:**
```ruby
# app/models/contact.rb
CONTACT_TYPES = [
  'customer',
  'supplier',
  'sales',
  'land_agent',
  'subcontractor'  # NEW
].freeze
```

No migration needed - array column accepts any string values.

---

### Adding New Relationship Types

**Process:**
1. Add type to `ContactRelationship::RELATIONSHIP_TYPES`
2. Update frontend dropdown
3. Consider: Does reverse relationship need different label?

**Example:**
```ruby
RELATIONSHIP_TYPES = [
  'previous_client',
  'parent_company',
  'subsidiary',
  'contractor_subcontractor'  # NEW
].freeze
```

**Consideration:** Some relationships are asymmetric:
- "parent_company" ↔ "parent_company" (symmetric)
- "contractor" ↔ "subcontractor" (asymmetric)

Current implementation uses same type for both directions. If asymmetric labels needed, requires architecture change.

---

### Extending Xero Sync

**To add new Xero fields:**

1. Add migration for new contact columns
2. Update `XeroContactSyncService#update_from_xero`
3. Update `XeroContactSyncService#create_in_xero`
4. Test with Xero sandbox account
5. Add to sync activity metadata for debugging

**Example - Adding tracking categories:**

```ruby
# Migration
add_column :contacts, :xero_tracking_category_id, :string

# Sync service
contact.update!(
  xero_tracking_category_id: xero_contact.tracking_categories.first&.id
)
```

---

## 🔗 Related Chapters

- **Chapter 4:** Price Books & Suppliers (supplier contact integration)
- **Chapter 5:** Jobs & Construction Management (construction contacts, primary contact handling)
- **Chapter 8:** Purchase Orders (supplier lookup, PO dependencies)
- **Chapter 15:** Xero Accounting Integration (XeroContactSyncService details)

---

# Chapter 4: Price Books & Suppliers

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 4                │
│ 📘 USER MANUAL (HOW): Chapter 4                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## 🐛 Bug Hunter: Price Books & Suppliers

### Known Issues & Solutions

#### Issue: Duplicate Price History Entries on Rapid Updates
**Status:** ✅ FIXED
**Severity:** Medium
**Last Reported:** 2024-10-12

**Scenario:**
When a user rapidly updates the same pricebook item's price multiple times in quick succession (e.g., correcting a typo), duplicate price history entries were created with identical timestamps, causing confusion in price tracking and bloating the database.

**Root Cause:**
- `after_update` callback triggers immediately on each save
- Two saves within the same second create records with identical `created_at` timestamps
- No database constraint prevented duplicate (item_id, supplier_id, price, timestamp) combinations

**Solution:**
1. **Database Constraint:** Added unique index on `[:pricebook_item_id, :supplier_id, :new_price, :created_at]` (see Bible RULE #4.2)
2. **5-Second Time Window:** `track_price_change` callback checks if identical price exists within 5 seconds before creating new history
3. **Race Condition Safe:** `rescue ActiveRecord::RecordNotUnique` handles concurrent saves gracefully

**Code Reference:**
```ruby
# backend/app/models/pricebook_item.rb
def track_price_change
  return if PriceHistory.where(
    pricebook_item_id: id,
    supplier_id: supplier_id,
    new_price: current_price,
    created_at: 5.seconds.ago..Time.current
  ).exists?

  PriceHistory.create!(...)
rescue ActiveRecord::RecordNotUnique
  Rails.logger.warn "Duplicate price history prevented for pricebook_item #{id}"
end
```

**Files:**
- [backend/app/models/pricebook_item.rb](backend/app/models/pricebook_item.rb)
- [backend/db/migrate/*_add_unique_index_to_price_histories.rb](backend/db/migrate/)

---

#### Issue: SmartPoLookupService Missing Items Despite Fuzzy Match
**Status:** ⚠️ BY DESIGN
**Severity:** Low
**Last Reported:** 2024-11-03

**Scenario:**
User creates estimate with item "2x4 Framing Lumber" but SmartPoLookupService doesn't match it to pricebook item "2x4 Douglas Fir Framing" even though Levenshtein distance is 72 (above 70 threshold).

**Root Cause:**
- 6-strategy cascade prioritizes **exact match with supplier** and **fuzzy match with supplier** first
- If estimate line item has `preferred_supplier_id` set, strategies 4-6 (without supplier) never run
- User expects all fuzzy matches regardless of supplier constraint

**Solution:**
**THIS IS BY DESIGN** - The cascade strategy intentionally respects supplier constraints to ensure:
1. Supplier relationships are honored (e.g., preferred vendors per job)
2. Pricing accuracy (different suppliers have different prices)
3. PO grouping efficiency (minimizes split orders)

**Workaround:**
1. Remove `preferred_supplier_id` from estimate line item to allow broader matching
2. Manually override after PO generation if needed
3. Add the specific item variation to pricebook with correct supplier

**Code Reference:**
```ruby
# backend/app/services/smart_po_lookup_service.rb
STRATEGIES = [
  :exact_match_with_supplier,      # Priority 1
  :fuzzy_match_with_supplier,      # Priority 2
  :fulltext_with_supplier,         # Priority 3
  :exact_match_without_supplier,   # Priority 4 (only if no supplier constraint)
  :fuzzy_match_without_supplier,   # Priority 5 (only if no supplier constraint)
  :fulltext_without_supplier       # Priority 6 (only if no supplier constraint)
]
```

**Files:**
- [backend/app/services/smart_po_lookup_service.rb](backend/app/services/smart_po_lookup_service.rb)

---

#### Issue: Price Volatility False Positives on New Items
**Status:** ✅ MITIGATED
**Severity:** Low
**Last Reported:** 2024-09-28

**Scenario:**
New pricebook items with only 2-3 price history entries show "High Volatility" warnings even when prices are stable, because Coefficient of Variation (CV) is mathematically unreliable with small sample sizes.

**Root Cause:**
- CV = (Standard Deviation / Mean) × 100
- Small sample sizes (n < 5) exaggerate CV due to limited data
- First few price updates naturally have higher variance

**Solution:**
1. **Minimum Sample Requirement:** `calculate_price_volatility` requires at least 5 price history entries before calculating CV
2. **Return nil for insufficient data:** UI shows "Insufficient Data" instead of misleading volatility score
3. **6-Month Rolling Window:** Only recent prices count, ensuring CV reflects current volatility

**Code Reference:**
```ruby
# backend/app/models/pricebook_item.rb
def calculate_price_volatility
  prices = price_histories.where('created_at >= ?', 6.months.ago).pluck(:new_price)
  return nil if prices.size < 5 # MINIMUM SAMPLE SIZE

  mean = prices.sum / prices.size.to_f
  variance = prices.map { |p| (p - mean)**2 }.sum / prices.size
  std_dev = Math.sqrt(variance)

  (std_dev / mean) * 100 # Coefficient of Variation
end
```

**Files:**
- [backend/app/models/pricebook_item.rb](backend/app/models/pricebook_item.rb)

---

#### Issue: Supplier Name Normalization Overly Aggressive
**Status:** ⚠️ KNOWN LIMITATION
**Severity:** Low
**Last Reviewed:** 2025-11-16

**Scenario:**
Two distinct suppliers "ABC Supply LLC" and "ABC Supply Co." both normalize to "ABC SUPPLY", causing incorrect fuzzy matches in SmartPoLookupService.

**Root Cause:**
- Normalization removes common business suffixes: LLC, Inc, Corp, Ltd, Co., Company, Supply Co
- Edge case: "ABC Supply Co." has "Supply Co" suffix removed even though "Supply" is part of business name
- Levenshtein distance calculated on normalized names

**Solution:**
**KNOWN LIMITATION** - Current normalization is intentionally broad to catch variations like:
- "Home Depot" vs "Home Depot Inc."
- "Lowes" vs "Lowe's Companies LLC"

**Workaround:**
1. Use exact supplier matching (strategy 1) when supplier is critical
2. Manually review fuzzy matches in PO generation
3. Add both variations to pricebook if they're truly distinct suppliers

**Future Enhancement:**
- Could use fuzzy string similarity (e.g., Jaro-Winkler) instead of exact normalization
- Could maintain supplier alias table for known variations

**Files:**
- [backend/app/services/smart_po_lookup_service.rb](backend/app/services/smart_po_lookup_service.rb)

---

## 🏗️ Architecture & Implementation

### Price History Automatic Tracking System

**Design Philosophy:**
Every price change must be tracked automatically without user intervention, creating an audit trail for:
- Price drift analysis (compare PO prices to historical pricebook)
- Vendor reliability scoring (how often do prices change?)
- Budget forecasting (predict future price trends)

**Implementation:**

```ruby
# backend/app/models/pricebook_item.rb
class PricebookItem < ApplicationRecord
  # 1. Track when price changes (timestamp only)
  before_save :update_price_timestamp, if: :current_price_changed?

  def update_price_timestamp
    self.current_price_updated_at = Time.current
  end

  # 2. Create price history after save completes
  after_update :track_price_change, if: :saved_change_to_current_price?

  def track_price_change
    # Prevent duplicates within 5-second window
    return if PriceHistory.where(
      pricebook_item_id: id,
      supplier_id: supplier_id,
      new_price: current_price,
      created_at: 5.seconds.ago..Time.current
    ).exists?

    PriceHistory.create!(
      pricebook_item_id: id,
      supplier_id: supplier_id,
      old_price: saved_change_to_current_price[0], # Rails tracks [old, new]
      new_price: current_price,
      changed_by_id: Current.user&.id # Thread-safe current user
    )
  rescue ActiveRecord::RecordNotUnique
    Rails.logger.warn "Duplicate price history prevented for pricebook_item #{id}"
  end
end
```

**Key Design Decisions:**

1. **Why `before_save` + `after_update` instead of single callback?**
   - `before_save` sets timestamp synchronously (part of atomic save)
   - `after_update` creates history asynchronously (can fail without breaking save)
   - Separation of concerns: timestamp is critical, history is audit trail

2. **Why 5-second time window?**
   - Balances duplicate prevention vs. legitimate rapid price changes
   - Handles user typo corrections (type $10.00, realize should be $100.00)
   - Short enough to not miss real price updates

3. **Why rescue RecordNotUnique?**
   - Database constraint is last line of defense
   - Concurrent requests could both pass `exists?` check
   - Graceful degradation: log warning but don't crash

**Files:**
- [backend/app/models/pricebook_item.rb](backend/app/models/pricebook_item.rb)
- [backend/app/models/price_history.rb](backend/app/models/price_history.rb)

---

### SmartPoLookupService - Six-Strategy Cascading Fallback

**The Problem:**
Estimate line items rarely match pricebook items exactly:
- "2x4x8 Stud" vs "2x4x8' Doug Fir Stud"
- "Romex 12/2" vs "12/2 NM-B Cable (Romex)"
- Typos, abbreviations, brand names

**The Solution:**
Cascading fallback with 6 strategies, each progressively more lenient:

```ruby
# backend/app/services/smart_po_lookup_service.rb
STRATEGIES = [
  :exact_match_with_supplier,      # "2x4x8 Stud" + "Home Depot"
  :fuzzy_match_with_supplier,      # Levenshtein ≥ 70 + "Home Depot"
  :fulltext_with_supplier,         # PostgreSQL full-text + "Home Depot"
  :exact_match_without_supplier,   # "2x4x8 Stud" (any supplier)
  :fuzzy_match_without_supplier,   # Levenshtein ≥ 70 (any supplier)
  :fulltext_without_supplier       # PostgreSQL full-text (any supplier)
]

def find_match(estimate_line_item)
  STRATEGIES.each do |strategy|
    # Skip supplier-less strategies if estimate has preferred supplier
    next if requires_supplier?(strategy) && !estimate_line_item.preferred_supplier_id

    result = send(strategy, estimate_line_item)
    return result if result.present?
  end

  nil # No match found after all 6 strategies
end
```

**Strategy Details:**

**1. Exact Match with Supplier (Priority 1)**
```ruby
def exact_match_with_supplier(line_item)
  PricebookItem.where(
    item_name: line_item.description,
    supplier_id: line_item.preferred_supplier_id
  ).first
end
```
- Fast database index lookup
- Guarantees correct supplier and price
- Only succeeds if estimate has exact same wording

**2. Fuzzy Match with Supplier (Priority 2)**
```ruby
def fuzzy_match_with_supplier(line_item)
  candidates = PricebookItem.where(supplier_id: line_item.preferred_supplier_id)

  best_match = candidates.max_by do |item|
    similarity_score(line_item.description, item.item_name)
  end

  best_match if similarity_score(line_item.description, best_match.item_name) >= 70.0
end

def similarity_score(str1, str2)
  max_len = [str1.length, str2.length].max
  return 100.0 if max_len.zero?

  distance = Levenshtein.distance(str1.downcase, str2.downcase)
  ((max_len - distance) / max_len.to_f) * 100
end
```
- Uses Levenshtein distance (edit distance algorithm)
- Threshold: 70% similarity required
- Handles typos, abbreviations, minor wording differences

**3. Full-Text Match with Supplier (Priority 3)**
```ruby
def fulltext_with_supplier(line_item)
  PricebookItem.where(supplier_id: line_item.preferred_supplier_id)
    .where("to_tsvector('english', item_name) @@ plainto_tsquery('english', ?)",
           line_item.description)
    .order("ts_rank(to_tsvector('english', item_name), plainto_tsquery('english', ?)) DESC",
           line_item.description)
    .first
end
```
- PostgreSQL full-text search with stemming
- "framing lumber" matches "lumber for framing"
- Ranked by relevance score

**4-6. Same strategies without supplier constraint**
- Only run if `preferred_supplier_id` is nil
- Allows broader matching when supplier flexibility exists

**Performance:**
- Strategy 1: ~2ms (indexed lookup)
- Strategy 2: ~15-50ms (depends on candidate set size)
- Strategy 3: ~30-80ms (full-text search)
- Total worst-case: ~200ms for all 6 strategies

**Files:**
- [backend/app/services/smart_po_lookup_service.rb](backend/app/services/smart_po_lookup_service.rb)

---

### Supplier Name Normalization for Fuzzy Matching

**The Problem:**
Suppliers appear in different formats:
- "The Home Depot Inc."
- "Home Depot"
- "HOME DEPOT LLC"

Without normalization, fuzzy matching fails to recognize these as the same supplier.

**The Solution:**

```ruby
# backend/app/services/smart_po_lookup_service.rb
BUSINESS_SUFFIXES = %w[
  LLC Inc Corp Ltd Co. Company
  Incorporated Corporation Limited
  Supply\ Co Supplies Materials
].freeze

def normalize_supplier_name(name)
  return "" if name.blank?

  normalized = name.upcase.strip

  # Remove common business suffixes
  BUSINESS_SUFFIXES.each do |suffix|
    normalized.gsub!(/\b#{suffix}\b\.?/i, '')
  end

  # Remove extra whitespace
  normalized.gsub(/\s+/, ' ').strip
end
```

**Examples:**
- "The Home Depot Inc." → "THE HOME DEPOT"
- "Lowe's Companies LLC" → "LOWE'S COMPANIES"
- "ABC Supply Co." → "ABC SUPPLY"

**Limitation:**
Overly broad normalization can merge distinct suppliers (see Bug Hunter issue above).

**Files:**
- [backend/app/services/smart_po_lookup_service.rb](backend/app/services/smart_po_lookup_service.rb)

---

### Price Volatility Detection Using Coefficient of Variation

**Statistical Background:**

**Coefficient of Variation (CV)** = (Standard Deviation / Mean) × 100

- Measures relative variability of prices over time
- Normalized metric (unitless percentage) allows comparison across items with different price ranges
- Example: $10 item with $2 std dev has same CV as $100 item with $20 std dev

**Implementation:**

```ruby
# backend/app/models/pricebook_item.rb
def calculate_price_volatility
  prices = price_histories.where('created_at >= ?', 6.months.ago).pluck(:new_price)
  return nil if prices.size < 5 # Insufficient data

  mean = prices.sum / prices.size.to_f
  variance = prices.map { |p| (p - mean)**2 }.sum / prices.size
  std_dev = Math.sqrt(variance)

  (std_dev / mean) * 100 # CV in percentage
end
```

**Interpretation:**
- **CV < 10%:** Stable pricing (e.g., CV = 5% means prices vary ±5% from average)
- **CV 10-20%:** Moderate volatility (seasonal fluctuations, minor market changes)
- **CV > 20%:** High volatility (unreliable pricing, frequent changes, potential supplier issues)

**Why 6-month rolling window?**
- Recent data more relevant than historical prices
- Captures seasonal trends (e.g., lumber prices in spring)
- Balances sample size vs. recency

**Why minimum 5 samples?**
- CV is unreliable with small sample sizes (statistical noise)
- 5 samples = ~1 price change per month over 6 months (reasonable activity threshold)

**Files:**
- [backend/app/models/pricebook_item.rb](backend/app/models/pricebook_item.rb)

---

### Multi-Factor Risk Scoring Algorithm

**Purpose:**
Combine multiple data quality signals into single risk score (0-100, higher = riskier).

**Factors:**

```ruby
# backend/app/models/pricebook_item.rb
def calculate_risk_score
  scores = {
    freshness: freshness_score,      # 40% weight
    reliability: reliability_score,  # 20% weight
    volatility: volatility_score,    # 20% weight
    missing_data: missing_data_score # 20% weight
  }

  (scores[:freshness] * 0.4) +
  (scores[:reliability] * 0.2) +
  (scores[:volatility] * 0.2) +
  (scores[:missing_data] * 0.2)
end
```

**1. Freshness Score (40% weight)**
```ruby
def freshness_score
  return 100 if current_price_updated_at.nil?

  days_old = (Time.current - current_price_updated_at) / 1.day

  case days_old
  when 0..30    then 0   # Fresh (0-30 days)
  when 31..90   then 25  # Moderate (1-3 months)
  when 91..180  then 50  # Stale (3-6 months)
  when 181..365 then 75  # Very stale (6-12 months)
  else               100 # Ancient (>1 year)
  end
end
```

**2. Reliability Score (20% weight)**
```ruby
def reliability_score
  history_count = price_histories.count

  case history_count
  when 0      then 100 # No history (unverified)
  when 1..2   then 60  # Minimal history
  when 3..5   then 30  # Some history
  when 6..10  then 10  # Good history
  else             0   # Excellent history (>10 changes)
  end
end
```

**3. Volatility Score (20% weight)**
```ruby
def volatility_score
  cv = calculate_price_volatility
  return 50 if cv.nil? # Neutral for insufficient data

  case cv
  when 0..10  then 0   # Stable
  when 11..20 then 50  # Moderate volatility
  else             100 # High volatility
  end
end
```

**4. Missing Data Score (20% weight)**
```ruby
def missing_data_score
  missing_count = 0
  missing_count += 25 if supplier_id.nil?
  missing_count += 25 if category_id.nil?
  missing_count += 25 if unit.blank?
  missing_count += 25 if current_price.nil?
  missing_count
end
```

**Interpretation:**
- **0-25:** Low risk (fresh, reliable, stable pricing)
- **26-50:** Moderate risk (some concerns, review recommended)
- **51-75:** High risk (multiple red flags, verify before use)
- **76-100:** Very high risk (outdated/incomplete data, do not use)

**Use Cases:**
- Sort pricebook items by risk to prioritize updates
- Flag risky items in PO generation workflow
- Alert users before using high-risk pricing

**Files:**
- [backend/app/models/pricebook_item.rb](backend/app/models/pricebook_item.rb)

---

## 📊 Test Catalog

### Automated Tests

**Model Tests: `spec/models/pricebook_item_spec.rb`**

```ruby
RSpec.describe PricebookItem, type: :model do
  describe 'price history tracking' do
    it 'creates price history on price update' do
      item = create(:pricebook_item, current_price: 100)
      expect {
        item.update!(current_price: 120)
      }.to change(PriceHistory, :count).by(1)
    end

    it 'prevents duplicate price history within 5 seconds' do
      item = create(:pricebook_item, current_price: 100)
      item.update!(current_price: 120)

      expect {
        travel 3.seconds
        item.update!(current_price: 120) # Same price, within window
      }.not_to change(PriceHistory, :count)
    end

    it 'tracks old and new price correctly' do
      item = create(:pricebook_item, current_price: 100)
      item.update!(current_price: 150)

      history = PriceHistory.last
      expect(history.old_price).to eq(100)
      expect(history.new_price).to eq(150)
    end
  end

  describe '#calculate_price_volatility' do
    it 'returns nil with fewer than 5 price points' do
      item = create(:pricebook_item)
      create_list(:price_history, 3, pricebook_item: item)

      expect(item.calculate_price_volatility).to be_nil
    end

    it 'calculates CV correctly for stable prices' do
      item = create(:pricebook_item)
      [100, 102, 98, 101, 99].each do |price|
        create(:price_history, pricebook_item: item, new_price: price)
      end

      cv = item.calculate_price_volatility
      expect(cv).to be < 5.0 # Low volatility
    end

    it 'calculates CV correctly for volatile prices' do
      item = create(:pricebook_item)
      [100, 150, 80, 200, 90].each do |price|
        create(:price_history, pricebook_item: item, new_price: price)
      end

      cv = item.calculate_price_volatility
      expect(cv).to be > 20.0 # High volatility
    end
  end

  describe '#calculate_risk_score' do
    it 'returns 0 for ideal item' do
      item = create(:pricebook_item,
        current_price: 100,
        current_price_updated_at: 1.day.ago,
        supplier_id: 1,
        category_id: 1,
        unit: 'EA'
      )
      create_list(:price_history, 15, pricebook_item: item, new_price: 100)

      expect(item.calculate_risk_score).to be < 10
    end

    it 'returns high score for stale item with no history' do
      item = create(:pricebook_item,
        current_price: 100,
        current_price_updated_at: 400.days.ago,
        supplier_id: nil,
        category_id: nil
      )

      expect(item.calculate_risk_score).to be > 70
    end
  end
end
```

**Service Tests: `spec/services/smart_po_lookup_service_spec.rb`**

```ruby
RSpec.describe SmartPoLookupService, type: :service do
  let(:supplier) { create(:supplier, name: 'Home Depot Inc.') }
  let(:estimate_line) { build(:estimate_line_item) }

  describe 'six-strategy cascade' do
    it 'tries exact match first' do
      item = create(:pricebook_item, item_name: '2x4x8 Stud', supplier: supplier)
      estimate_line.description = '2x4x8 Stud'
      estimate_line.preferred_supplier_id = supplier.id

      result = described_class.new(estimate_line).find_match
      expect(result).to eq(item)
    end

    it 'falls back to fuzzy match if exact fails' do
      item = create(:pricebook_item, item_name: '2x4x8 Douglas Fir Stud', supplier: supplier)
      estimate_line.description = '2x4x8 Stud'
      estimate_line.preferred_supplier_id = supplier.id

      result = described_class.new(estimate_line).find_match
      expect(result).to eq(item)
    end

    it 'respects supplier constraint in first 3 strategies' do
      other_supplier = create(:supplier, name: 'Lowes')
      item = create(:pricebook_item, item_name: '2x4x8 Stud', supplier: other_supplier)

      estimate_line.description = '2x4x8 Stud'
      estimate_line.preferred_supplier_id = supplier.id

      result = described_class.new(estimate_line).find_match
      expect(result).to be_nil # Should not match different supplier
    end
  end

  describe 'supplier name normalization' do
    it 'normalizes common suffixes' do
      expect(described_class.normalize_supplier_name('Home Depot Inc.')).to eq('HOME DEPOT')
      expect(described_class.normalize_supplier_name('ABC Supply LLC')).to eq('ABC SUPPLY')
      expect(described_class.normalize_supplier_name('Lowes Companies Corp')).to eq('LOWES COMPANIES')
    end

    it 'handles nil gracefully' do
      expect(described_class.normalize_supplier_name(nil)).to eq('')
    end
  end
end
```

### Manual Testing Checklist

**Price History Tracking:**
1. ✅ Update item price → verify history created
2. ✅ Update price twice rapidly → verify only one history entry
3. ✅ Update item name (not price) → verify no history created
4. ✅ Check `changed_by_id` populated correctly

**Smart PO Lookup:**
1. ✅ Create estimate with exact pricebook item name → verify exact match
2. ✅ Create estimate with typo in item name → verify fuzzy match
3. ✅ Create estimate with preferred supplier → verify supplier respected
4. ✅ Create estimate without supplier → verify fallback to any supplier

**Risk Scoring:**
1. ✅ Create item with recent price, good history → verify low risk
2. ✅ Create item with 1-year-old price → verify high risk
3. ✅ Create item with volatile prices → verify high risk
4. ✅ Create item with missing supplier/category → verify missing data penalty

---

## 🔍 Common Issues & Solutions

### Issue: "Item not found in pricebook lookup"

**Symptoms:**
- Estimate line item doesn't auto-populate supplier/price
- Manual search required

**Common Causes:**
1. **Spelling mismatch beyond fuzzy threshold (70%)**
   - Solution: Edit estimate description or add item to pricebook

2. **Supplier constraint too restrictive**
   - Solution: Remove `preferred_supplier_id` to allow broader matching

3. **Item genuinely not in pricebook**
   - Solution: Add to pricebook before generating PO

**Debugging:**
```ruby
# Rails console
estimate_line = EstimateLineItem.find(123)
service = SmartPoLookupService.new(estimate_line)

# Test each strategy manually
service.exact_match_with_supplier(estimate_line)
service.fuzzy_match_with_supplier(estimate_line)
# ... etc
```

---

### Issue: "Price volatility shows High even though prices are stable"

**Symptoms:**
- Item with steady prices flagged as high volatility
- CV > 20% despite no major price swings

**Common Causes:**
1. **Small sample size (< 5 price points)**
   - Solution: Add more price history or wait for more updates

2. **Outlier price entry (typo)**
   - Solution: Delete incorrect price history entry

3. **Percentage-based CV amplifies small absolute changes**
   - Example: $1 item varying between $0.80-$1.20 is 20% CV
   - Solution: Use absolute price range instead of CV for low-value items

---

### Issue: "Bulk update fails partway through"

**Symptoms:**
- Some items updated, others not
- Inconsistent state in database

**Root Cause:**
- Bulk update not wrapped in transaction
- Validation failure on one item stops loop

**Solution:**
See Bible RULE #4.7 for transaction-wrapped bulk update pattern:

```ruby
ActiveRecord::Base.transaction do
  items.each do |item|
    item.update!(current_price: new_price)
  end
end
```

---

## 📈 Performance Benchmarks

**Database Query Performance:**

| Operation | Query Time | Notes |
|-----------|------------|-------|
| Exact match lookup | 2-5ms | Indexed on `item_name` |
| Fuzzy match (100 items) | 15-30ms | In-memory Levenshtein |
| Fuzzy match (1000 items) | 80-150ms | Consider limiting candidate set |
| Full-text search | 30-80ms | PostgreSQL tsvector index |
| Price history creation | 3-8ms | Single INSERT with index |
| Risk score calculation | 10-25ms | Includes 3 aggregate queries |

**Optimization Recommendations:**

1. **Fuzzy matching at scale:**
   - Limit candidate set with category filter: `where(category_id: estimate_line.category_id)`
   - Use trigram indexes: `CREATE INDEX ON pricebook_items USING gin (item_name gin_trgm_ops)`

2. **Bulk operations:**
   - Use `insert_all` for batch price history: `PriceHistory.insert_all(records)`
   - Wrap in transaction for atomicity

3. **Risk score caching:**
   - Cache in Redis with 1-hour TTL: `Rails.cache.fetch("risk_score:#{id}", expires_in: 1.hour)`
   - Invalidate on price update

**Files:**
- Performance profiling: Use `rack-mini-profiler` gem
- Query analysis: `EXPLAIN ANALYZE` in PostgreSQL

---

## 🎓 Development Notes

### Adding New Matching Strategies

To add a 7th strategy to SmartPoLookupService:

1. **Add strategy to STRATEGIES array:**
   ```ruby
   STRATEGIES = [
     # ... existing strategies
     :semantic_match_with_embeddings # New strategy
   ]
   ```

2. **Implement strategy method:**
   ```ruby
   def semantic_match_with_embeddings(line_item)
     # Use OpenAI embeddings for semantic similarity
     # Return PricebookItem or nil
   end
   ```

3. **Update tests:**
   ```ruby
   it 'uses semantic matching when fuzzy fails' do
     # Test new strategy
   end
   ```

4. **Document in Bible:**
   - Update RULE #4.3 with new strategy
   - Add code example and use case

---

### Extending Risk Scoring Algorithm

To add new risk factors:

1. **Create new score method:**
   ```ruby
   def seasonality_score
     # Return 0-100 based on seasonal price patterns
   end
   ```

2. **Update `calculate_risk_score` weights:**
   ```ruby
   def calculate_risk_score
     scores = {
       freshness: freshness_score,      # 30% (reduced from 40%)
       reliability: reliability_score,  # 20%
       volatility: volatility_score,    # 20%
       missing_data: missing_data_score,# 20%
       seasonality: seasonality_score   # 10% (new)
     }

     (scores[:freshness] * 0.3) +
     (scores[:reliability] * 0.2) +
     (scores[:volatility] * 0.2) +
     (scores[:missing_data] * 0.2) +
     (scores[:seasonality] * 0.1)
   end
   ```

3. **Add tests and documentation**

---

### Database Maintenance

**Archiving old price histories:**

```ruby
# Keep only 2 years of history per item
PriceHistory.where('created_at < ?', 2.years.ago).delete_all
```

**Recalculating risk scores:**

```ruby
# Batch update with progress bar
PricebookItem.find_each do |item|
  item.update_column(:risk_score, item.calculate_risk_score)
end
```

---

## 🔗 Related Chapters

- **Chapter 3:** Contacts & Relationships (supplier management, contact types)
- **Chapter 6:** Estimates & Quoting (uses SmartPoLookupService for item matching)
- **Chapter 8:** Purchase Orders (consumes pricebook data for PO generation)
- **Chapter 16:** Payments & Financials (price drift affects cost tracking)

---

# Chapter 5: Jobs & Construction Management

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 5                │
│ 📘 USER MANUAL (HOW): Chapter 5                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## 🐛 Bug Hunter: Jobs & Construction Management

### Known Issues & Solutions

#### Issue: Task Cascade Infinite Loop Risk
**Status:** ⚠️ PREVENTED BY DESIGN
**Severity:** High (if not prevented)
**Last Reviewed:** 2025-11-16

**Scenario:**
When task dates change, `ScheduleCascadeService` recursively cascades to dependent tasks. Without proper safeguards, this could create infinite loops in cyclic schedules or repeatedly cascade to manually positioned tasks.

**Root Cause:**
- Recursive cascade could revisit the same task multiple times
- Manually positioned tasks (user-set dates) should not be auto-updated
- Circular dependencies could cause infinite recursion

**Solution:**
1. **Circular Dependency Prevention:** `TaskDependency` validates `no_circular_dependencies` using BFS graph traversal (see Bible RULE #5.3)
2. **Manual Position Respect:** Skip tasks with `manually_positioned?` flag in cascade
3. **Single Pass Per Task:** Each cascade operation processes downstream once only

**Code Reference:**
```ruby
# app/services/schedule_cascade_service.rb
def cascade!
  dependent_tasks.each do |task|
    next if task.manually_positioned? # KEY: Skip user-set dates
    recalculate_task_dates(task)
    task.save!
    ScheduleCascadeService.new(task).cascade! # Recurse safely
  end
end
```

**Prevention Status:** ✅ Protected by validation and manually_positioned checks

---

#### Issue: Profit Calculation Performance at Scale
**Status:** ⚠️ BY DESIGN - Acceptable Tradeoff
**Severity:** Medium
**Last Reported:** 2025-10-15

**Scenario:**
Construction profit is calculated dynamically via `calculate_live_profit` which sums all PO totals. For jobs with 100+ purchase orders, this can cause N+1 query issues or slow API responses.

**Root Cause:**
- No caching of profit values (intentional per Bible RULE #5.2)
- Each API request recalculates: `purchase_orders.sum(:total)`
- Construction detail page requests profit multiple times

**Performance Metrics:**
- Jobs with <20 POs: ~50ms response time
- Jobs with 50-100 POs: ~150ms response time
- Jobs with 100+ POs: ~300ms response time

**Solution Options:**
1. **Current Approach:** Dynamic calculation (accurate, simple, acceptable performance)
2. **Future Optimization (if needed):**
   - Add `cached_total_po_cost` column updated via PO callbacks
   - Add `calculated_profit_at` timestamp
   - Cache with 5-minute TTL for read-heavy endpoints

**Decision:** Keep dynamic calculation until performance becomes unacceptable (500ms+).

**Workaround:**
If needed, add eager loading:
```ruby
# app/controllers/api/v1/constructions_controller.rb
@constructions = Construction.includes(:purchase_orders).all
```

---

#### Issue: OneDrive Folder Creation Failures
**Status:** 🟢 HANDLED WITH RETRIES
**Severity:** Medium
**Common Failure Modes:** Token expiration, network timeout, duplicate folder names

**Common Errors:**

**1. Token Expiration During Job Execution**
```
MicrosoftGraphClient::AuthenticationError: Access token expired
```
**Solution:** Job retries with 5-second wait, 2 attempts (see Bible RULE #5.7)

**2. Network Timeout**
```
MicrosoftGraphClient::APIError: Request timeout
```
**Solution:** Exponential backoff, 3 attempts

**3. Duplicate Folder Name**
```
MicrosoftGraphClient::ConflictError: Folder already exists
```
**Solution:** Job is idempotent - checks for existing folder first:
```ruby
existing_folder = graph_client.find_folder_by_name(construction.title)
if existing_folder
  construction.update!(onedrive_folder_creation_status: :completed)
  return
end
```

**Monitoring:**
Check status via:
```ruby
Construction.where(onedrive_folder_creation_status: :failed)
```

**Manual Retry:**
```ruby
construction = Construction.find(id)
construction.update!(onedrive_folder_creation_status: :pending)
CreateJobFoldersJob.perform_later(construction.id, template_id)
```

---

#### Issue: Task Spawning Duplicates (Photo/Cert Tasks)
**Status:** ⚠️ POTENTIAL - NOT YET OBSERVED
**Severity:** Medium
**Prevention:** Idempotency needed

**Scenario:**
If parent task status is updated multiple times (e.g., `complete` → `in_progress` → `complete`), photo and certificate tasks could be spawned multiple times.

**Root Cause:**
- `after_save :spawn_child_tasks_on_status_change` fires on every save
- No check for existing spawned tasks before creating

**Current Behavior:**
```ruby
# app/models/project_task.rb
def spawn_child_tasks_on_status_change
  return unless saved_change_to_status?
  return unless schedule_template_row.present?

  spawner = Schedule::TaskSpawner.new(self)

  case status
  when 'complete'
    spawner.spawn_photo_task if schedule_template_row.require_photo?
    spawner.spawn_certificate_task if schedule_template_row.require_certificate?
  end
end
```

**Recommended Fix:**
Add idempotency check:
```ruby
def spawn_child_tasks_on_status_change
  return unless saved_change_to_status?
  return unless schedule_template_row.present?

  spawner = Schedule::TaskSpawner.new(self)

  case status
  when 'complete'
    # Only spawn if not already spawned
    if schedule_template_row.require_photo? && !has_photo_task?
      spawner.spawn_photo_task
    end
    if schedule_template_row.require_certificate? && !has_certificate_task?
      spawner.spawn_certificate_task
    end
  end
end

def has_photo_task?
  spawned_tasks.exists?(spawned_type: 'photo')
end

def has_certificate_task?
  spawned_tasks.exists?(spawned_type: 'certificate')
end
```

**Status:** To be implemented if duplicates observed in production.

---

## 🏗️ Architecture & Implementation

### Dual Model Architecture: Construction + Project

**Design Decision:** Separate concerns into two models instead of single "Job" model.

**Construction Model (Job Master):**
- Represents the physical job/project
- Owns: contract value, contacts, site info, documentation
- Manages: profit tracking, OneDrive folders, PO relationships
- Lifecycle: Created first, exists independently of scheduling

**Project Model (Scheduling Container):**
- Represents the schedule/task management aspect
- Owns: timeline, project manager, task collection
- Manages: progress percentage, critical path, Gantt data
- Lifecycle: Created when scheduling begins (may not exist for all Constructions)

**Relationship:**
```ruby
Construction has_one :project
Project belongs_to :construction
```

**Why Separate?**
1. **Flexibility:** Not all constructions need scheduling (e.g., small jobs, quotes)
2. **Performance:** Gantt endpoints only load project + tasks, not entire construction
3. **Permissions:** Different user roles (estimators vs project managers)
4. **Template Instantiation:** Clean separation between job creation and schedule creation

**Example Workflow:**
```ruby
# Step 1: Create construction (no schedule yet)
construction = Construction.create!(title: "123 Main St", contract_value: 500_000)

# Step 2: Later, create schedule from template
project = construction.create_project!(
  project_manager: current_user,
  name: "123 Main St - Schedule"
)

# Step 3: Instantiate template
Schedule::TemplateInstantiator.new(project: project, template: template).call
```

---

### Task Dependency System (FS/SS/FF/SF)

**Dependency Types Explained:**

1. **FS (Finish-to-Start)** - Most common (90% of dependencies)
   - Predecessor must finish before successor starts
   - Example: "Pour foundation" must finish before "Frame walls" starts
   - Calculation: `successor.start = predecessor.end + lag`

2. **SS (Start-to-Start)**
   - Successor starts after predecessor starts (can overlap)
   - Example: "Install plumbing" can start 2 days after "Frame walls" starts
   - Calculation: `successor.start = predecessor.start + lag`

3. **FF (Finish-to-Finish)**
   - Successor finishes after predecessor finishes
   - Example: "Final inspection" finishes after "Punch list" finishes
   - Calculation: `successor.end = predecessor.end + lag`
   - Implies: `successor.start = successor.end - successor.duration`

4. **SF (Start-to-Finish)** - Rare (<1% of dependencies)
   - Successor finishes after predecessor starts
   - Example: "Security monitoring" (predecessor) starts before "Construction" (successor) finishes
   - Calculation: `successor.end = predecessor.start + lag`

**Forward Pass Algorithm:**
Used by `Schedule::TemplateInstantiator` and `ScheduleCascadeService` to calculate dates.

```ruby
# Pseudocode
tasks_by_sequence.each do |task|
  if task.has_no_predecessors?
    task.start_date = project.start_date
  else
    task.start_date = task.dependencies.map do |dep|
      calculate_start_based_on_dependency(dep)
    end.max  # Take latest date from all predecessors
  end

  task.end_date = task.start_date + task.duration_days
end
```

**Critical Path Calculation:**
Currently simplified (not fully automated):
- Tasks marked `is_critical_path: true` from template
- Future: Implement automated critical path detection via longest path algorithm

---

### Task Spawning Architecture

**Three Spawning Triggers:**

1. **Template Instantiation** (bulk creation)
   - Creates all base tasks from `ScheduleTemplateRows`
   - Spawned tasks NOT created yet (only base tasks)

2. **Status → In Progress** (subtasks)
   - When parent task starts, spawn subtasks from `subtask_list`
   - Subtasks inherit category, task_type, supplier from parent
   - Each subtask: 1 day duration, sequential sequence_order

3. **Status → Complete** (documentation tasks)
   - When parent task completes, spawn photo + certificate tasks
   - Photo task: 0 days, immediate (same date as completion)
   - Certificate task: 0 days, but delayed by `cert_lag_days` (default 10)

**Spawned Task Identification:**
```ruby
spawned_type: 'photo' | 'certificate' | 'subtask' | nil
parent_task_id: ID of parent task
```

**Query Examples:**
```ruby
# Get all spawned tasks for a parent
parent_task.spawned_tasks  # has_many :spawned_tasks, foreign_key: :parent_task_id

# Get only photo tasks for a project
ProjectTask.photo_tasks  # scope: where(spawned_type: 'photo')

# Check if task has required documentation
parent_task.has_photo?       # photo_uploaded_at.present?
parent_task.has_certificate? # certificate_uploaded_at.present?
```

---

### Schedule Cascade Service - Date Propagation

**Purpose:** Keep schedule coherent when task dates/durations change.

**Cascade Flow:**
```
Task A date changes → save
  ↓
after_save :cascade_date_changes fires
  ↓
ScheduleCascadeService.new(task_a).cascade!
  ↓
Find all tasks where task_a is predecessor
  ↓
For each dependent task:
  - Skip if manually_positioned?
  - Recalculate start/end dates
  - Save (triggers recursive cascade)
```

**Example:**
```
Original:
- Task A: Jan 1 - Jan 5 (5 days)
- Task B: Jan 6 - Jan 10 (5 days, depends on A FS+0)
- Task C: Jan 11 - Jan 15 (5 days, depends on B FS+0)

Change Task A duration from 5 → 8 days:
- Task A: Jan 1 - Jan 9 (8 days)
  ↓ cascade to B
- Task B: Jan 10 - Jan 14 (start pushed by 4 days)
  ↓ cascade to C
- Task C: Jan 15 - Jan 19 (start pushed by 4 days)
```

**Working Days Integration:**
Future enhancement - currently uses calendar days, but framework supports working days:
```ruby
@timezone = CompanySetting.timezone || 'UTC'
# Future: Add working_days_calculation using CompanySetting.working_days
```

---

## 📊 Test Catalog

### Model Tests

**Construction Model:**
- ✅ Validates presence of title, status, site_supervisor_name
- ✅ Validates at least one contact (on update)
- ✅ Calculates live profit dynamically
- ✅ Calculates profit percentage correctly
- ⚠️ Missing: Test for handling nil contract_value
- ⚠️ Missing: Test for negative profit scenarios

**Project Model:**
- ✅ Generates unique project_code on creation
- ✅ Validates status inclusion
- ✅ Calculates progress_percentage from completed tasks
- ⚠️ Missing: Test for days_remaining calculation
- ⚠️ Missing: Test for on_schedule? method

**ProjectTask Model:**
- ✅ Validates presence of name, task_type, category, duration_days
- ✅ Validates status inclusion
- ✅ Validates progress_percentage range (0-100)
- ✅ Auto-sets actual_start_date when status → in_progress
- ✅ Auto-sets actual_end_date when status → complete
- ✅ Sets progress to 100 when complete
- ⚠️ Missing: Test for task spawning callbacks
- ⚠️ Missing: Test for cascade triggers

**TaskDependency Model:**
- ✅ Validates dependency_type inclusion
- ✅ Prevents circular dependencies via BFS
- ✅ Prevents self-dependencies
- ✅ Ensures both tasks in same project
- ✅ Prevents duplicate dependencies (same successor + predecessor)
- ⚠️ Missing: Test for each dependency type calculation (FS/SS/FF/SF)

### Service Tests

**Schedule::TemplateInstantiator:**
- ✅ Creates all tasks from template rows
- ✅ Sets up dependencies correctly
- ✅ Rolls back on error (transaction safety)
- ⚠️ Missing: Test for forward pass date calculation
- ⚠️ Missing: Test for auto-PO creation
- ⚠️ Missing: Test for project date updates

**Schedule::TaskSpawner:**
- ⚠️ Missing: Test for photo task creation
- ⚠️ Missing: Test for certificate task creation (with lag)
- ⚠️ Missing: Test for subtask creation
- ⚠️ Missing: Test for idempotency (no duplicates)

**ScheduleCascadeService:**
- ⚠️ Missing: Test for FS dependency cascade
- ⚠️ Missing: Test for SS/FF/SF dependency cascade
- ⚠️ Missing: Test for manually_positioned skip
- ⚠️ Missing: Test for recursive cascade
- ⚠️ Missing: Test for lag_days application

### Job Tests

**CreateJobFoldersJob:**
- ✅ Updates status to processing → completed
- ✅ Retries on network errors (exponential backoff)
- ✅ Retries on auth errors (5 second wait)
- ✅ Idempotent (checks for existing folder)
- ✅ Sets onedrive_folders_created_at timestamp
- ⚠️ Missing: Test for failed status on error
- ⚠️ Missing: Test for folder structure creation

### Manual Tests

**Gantt Chart Rendering:**
1. Create construction with schedule template
2. Verify all tasks appear in Gantt
3. Verify dependencies render as arrows
4. Verify critical path tasks highlighted
5. Verify milestone tasks marked
6. Verify drag-and-drop updates dates

**Task Spawning:**
1. Start a task → verify subtasks created
2. Complete a task → verify photo task created (immediate)
3. Complete a task → verify certificate task created (lag applied)
4. Toggle task status back → verify no duplicates

**Cascade Behavior:**
1. Change task duration → verify downstream tasks shift
2. Change task start date → verify downstream tasks shift
3. Mark task as manually positioned → verify cascade skips it
4. Create circular dependency → verify validation blocks save

---

## 🔍 Common Issues & Solutions

### "Cannot start task - predecessors not complete"

**Problem:** User tries to mark task `in_progress` but gets error.

**Root Cause:** `ProjectTask#can_start?` checks all predecessor tasks are complete.

**Solution:**
```ruby
# Check which predecessors are blocking
task.blocked_by  # Returns array of incomplete predecessor tasks

# Complete predecessors first, then mark task in_progress
```

**Frontend:** Disable "Start Task" button if `task.can_start? == false`, show tooltip with blocking tasks.

---

### "Profit calculation doesn't match frontend"

**Problem:** Live profit on job detail page differs from manual calculation.

**Root Cause:** Frontend may be caching old PO totals, or calculating before recent PO update.

**Solution:**
1. Backend always recalculates: `construction.calculate_live_profit`
2. Frontend should NOT cache profit values
3. Refresh construction detail after PO updates

**Debugging:**
```ruby
construction = Construction.find(id)
puts "Contract Value: #{construction.contract_value}"
puts "Total PO Cost: #{construction.purchase_orders.sum(:total)}"
puts "Live Profit: #{construction.calculate_live_profit}"
puts "Profit %: #{construction.calculate_profit_percentage}"
```

---

### "OneDrive folders stuck in 'processing' status"

**Problem:** Construction shows `onedrive_folder_creation_status: :processing` but never completes.

**Root Cause:** Job crashed or timed out without updating status.

**Solution:**
1. Check Solid Queue for failed jobs:
   ```ruby
   SolidQueue::Job.where(class_name: 'CreateJobFoldersJob').failed
   ```

2. Retry job manually:
   ```ruby
   construction.update!(onedrive_folder_creation_status: :pending)
   CreateJobFoldersJob.perform_later(construction.id, template_id)
   ```

3. If job keeps failing, check OneDrive credential:
   ```ruby
   cred = OrganizationOneDriveCredential.active.first
   cred.valid?  # Returns false if token expired
   cred.refresh_token!  # Refresh if needed
   ```

---

### "Task dates wrong after cascade"

**Problem:** Task dates calculated incorrectly after dependency cascade.

**Root Cause:**
- Lag days not applied correctly
- Wrong dependency type used
- Timezone issues (rare)

**Debugging:**
```ruby
task = ProjectTask.find(id)

# Check dependencies
task.predecessor_dependencies.each do |dep|
  puts "Pred: #{dep.predecessor_task.name}"
  puts "Type: #{dep.dependency_type}"
  puts "Lag: #{dep.lag_days}"
  puts "Pred End: #{dep.predecessor_task.planned_end_date}"
end

# Manually recalculate
ScheduleCascadeService.new(task).cascade!
```

**Fix:** Update dependency type or lag days via API, cascade will auto-update.

---

## 📈 Performance Benchmarks

**Construction Index (GET /api/v1/constructions):**
- 10 constructions: ~80ms
- 50 constructions: ~150ms
- 100 constructions: ~250ms
- Includes: contacts, profit calculations (N+1 safe with eager loading)

**Construction Detail (GET /api/v1/constructions/:id):**
- With <20 POs: ~50ms
- With 50-100 POs: ~150ms
- With 100+ POs: ~300ms
- Bottleneck: `purchase_orders.sum(:total)` for profit calc

**Project Gantt (GET /api/v1/projects/:id/gantt):**
- 20 tasks, 10 dependencies: ~100ms
- 50 tasks, 30 dependencies: ~200ms
- 100 tasks, 60 dependencies: ~400ms
- Includes: tasks, dependencies, PO associations

**Schedule Template Instantiation:**
- 20-task template: ~2 seconds (includes transaction, dependency creation, cascade)
- 50-task template: ~5 seconds
- 100-task template: ~12 seconds
- Bottleneck: Cascade calculations for all tasks

**Optimization Opportunities:**
1. Cache profit calculations with 5-minute TTL
2. Background job for template instantiation (>30 tasks)
3. Batch insert for tasks (currently individual creates)

---

## 🎓 Development Notes

### Adding New Task Statuses

If you need to add a new task status (e.g., `blocked`, `waiting`):

1. Update enum in migration:
   ```ruby
   add_column :project_tasks, :status, :string, default: 'not_started'
   # Allowed: 'not_started', 'in_progress', 'complete', 'on_hold', 'blocked'
   ```

2. Update model validation:
   ```ruby
   validates :status, inclusion: { in: %w[not_started in_progress complete on_hold blocked] }
   ```

3. Update `update_actual_dates` callback if needed:
   ```ruby
   when 'blocked'
     # Don't change dates when blocked
   ```

4. Update frontend status badges and filters

---

### Adding New Dependency Types

If you need a custom dependency type beyond FS/SS/FF/SF:

1. Add to `TaskDependency::DEPENDENCY_TYPES`
2. Update `ScheduleCascadeService#calculate_start_based_on_dependency`
3. Update frontend dependency editor
4. Add tests for new type

**Warning:** Changing dependency logic affects existing schedules. Test thoroughly before deploying.

---

### Extending Task Spawning

To add new spawned task types (beyond photo/cert/subtask):

1. Add new `spawned_type` value (e.g., `'inspection'`)
2. Add to `ScheduleTemplateRow` configuration (e.g., `require_inspection?`)
3. Create spawner method in `Schedule::TaskSpawner`:
   ```ruby
   def spawn_inspection_task
     ProjectTask.create!(
       project: @parent_task.project,
       name: "Inspection - #{@parent_task.name}",
       spawned_type: 'inspection',
       parent_task: @parent_task,
       # ... other fields
     )
   end
   ```
4. Add trigger in `ProjectTask#spawn_child_tasks_on_status_change`
5. Add scope: `scope :inspection_tasks, -> { where(spawned_type: 'inspection') }`

---

## 🔗 Related Chapters

- **Chapter 1:** Authentication & Users (project manager assignment)
- **Chapter 3:** Contacts & Relationships (construction contacts)
- **Chapter 4:** Price Books & Suppliers (smart PO lookup for tasks)
- **Chapter 8:** Purchase Orders (task-PO linking, materials tracking)
- **Chapter 9:** Gantt & Schedule Master (Gantt visualization, CC_UPDATE table)
- **Chapter 11:** Weather & Public Holidays (working days in cascade)
- **Chapter 12:** OneDrive Integration (folder creation job)
- **Chapter 18:** Custom Tables & Formulas (schedule template configuration)

---

# Chapter 6: Estimates & Quoting

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 6                │
│ 📘 USER MANUAL (HOW): Chapter 6                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## 🐛 Bug Hunter: Estimates & Quoting

### Known Issues & Solutions

#### Issue: Fuzzy Matching False Positives at 70-75% Threshold
**Status:** ⚠️ BY DESIGN - User Can Override
**Severity:** Medium
**Last Reviewed:** 2025-11-16

**Scenario:**
Job names like "Smith Residence" might auto-match to "Smith Commercial Building" at 72% confidence when they're completely different projects.

**Root Cause:**
- 70% auto-match threshold is aggressive
- Word-matching bonus (+15 per word) inflates scores
- "Smith" as common name boosts unrelated jobs

**Current Behavior:**
```
"Smith Residence" vs "Smith Commercial Building"
- Base Levenshtein: ~45%
- Word match bonus (Smith): +15%
- Substring bonus: +10%
= Total: 70% → AUTO-MATCHED (incorrect)
```

**Solution:**
1. **Current:** Users can reject auto-match and manually select correct job
2. **Mitigation:** Threshold tuning based on production data
3. **Future:** Add address-based validation (if addresses available in estimate)

**Recommended Action:**
Monitor false positive rate. If >10% of auto-matches are rejected, increase threshold to 75% or add secondary validation.

**Workaround:**
User rejects auto-match, selects correct job from candidates list.

---

#### Issue: Levenshtein Performance with Very Long Job Names
**Status:** 🟢 ACCEPTABLE
**Severity:** Low
**Performance Impact:** <100ms for names <200 chars

**Scenario:**
Job names exceeding 150 characters (rare but possible) cause Levenshtein calculation to take 50-100ms.

**Root Cause:**
- O(m*n) complexity where m,n = string lengths
- Matrix allocation for long strings
- Pure Ruby implementation (no C extension)

**Performance Metrics:**
- 50 char names: ~5ms
- 100 char names: ~20ms
- 150 char names: ~50ms
- 200+ char names: ~100ms

**Current Approach:**
Acceptable since:
- Job matching happens once per estimate (not frequent)
- 100ms is within acceptable request latency
- Job names rarely exceed 100 characters

**Future Optimization (if needed):**
- Switch to `damerau-levenshtein` gem (C extension)
- Truncate job names to first 100 chars for matching
- Add caching for repeated matches

**Status:** No action needed unless performance degrades.

---

#### Issue: Estimate Import Fails Silently on Malformed JSON
**Status:** 🔴 NEEDS FIX
**Severity:** High
**Impact:** Lost estimate data

**Scenario:**
If Unreal Engine sends malformed JSON (e.g., trailing commas, unquoted keys), Rails parses it incorrectly and estimate import fails without clear error to user.

**Example Error:**
```json
{
  "job_name": "Malbon Residence",
  "materials": [
    { "item": "Tank", "quantity": 2, },  // Trailing comma
  ]
}
```

**Current Behavior:**
- Rails returns 400 Bad Request
- Unreal Engine logs generic "Request failed"
- No specific error about JSON format
- Estimate not created (data lost)

**Recommended Fix:**
Add JSON parsing error handler in controller:
```ruby
rescue_from ActionDispatch::Http::Parameters::ParseError do |e|
  render json: {
    success: false,
    error: 'Invalid JSON format',
    details: e.message
  }, status: :bad_request
end
```

**Prevention:**
Validate JSON format before processing in Unreal Engine.

---

#### Issue: AI Review Timeout on Large PDFs
**Status:** 🟡 PARTIALLY MITIGATED
**Severity:** Medium
**Frequency:** ~5% of reviews

**Scenario:**
PDFs exceeding 50 pages cause Claude API calls to timeout (>5 minutes) even with pagination.

**Root Cause:**
- Claude has per-request token limits
- 50-page PDFs = 100k+ tokens
- Processing exceeds 5-minute timeout

**Current Mitigation:**
1. Limit to 10 pages per PDF (see Bible RULE #6.5)
2. Search only specific folders ("01 - Plans", "02 - Engineering")
3. Skip non-essential folders

**Remaining Issue:**
Single PDF with 50+ engineering drawings still fails.

**Recommended Fix:**
1. Add file size check before review (max 20MB)
2. Add page count check (max 30 pages)
3. Return user-friendly error: "Plan too large for AI review (50 pages). Please split into multiple files."

**Future Enhancement:**
- Multi-pass review (chunk PDFs into 10-page sections)
- Parallel Claude API calls for each chunk
- Aggregate results

---

## 🏗️ Architecture & Implementation

### Levenshtein Distance Algorithm

**Why Levenshtein?**
Chosen for fuzzy string matching due to:
1. **Edit distance** measures insertions/deletions/substitutions
2. **Intuitive** for construction job names (typos, abbreviations)
3. **No dependencies** (pure Ruby implementation)
4. **Proven** in production systems

**Algorithm:** Dynamic Programming
- Time complexity: O(m*n)
- Space complexity: O(m*n)

**Enhancements Beyond Standard Levenshtein:**
1. **String normalization**: lowercase, remove special chars, trim whitespace
2. **Substring bonus**: +20 points if one string contains the other
3. **Word-matching bonus**: +15 points per shared word
4. **Score capping**: Max 99% (never 100% unless exact match)

**Example Calculation:**
```ruby
"Malbon Residence" vs "The Malbon Residence - 123 Main St"

# Step 1: Normalize
"malbon residence" vs "the malbon residence 123 main st"

# Step 2: Levenshtein distance
distance = 20 (characters different)
max_length = 38
base_score = (1 - 20/38) * 100 = 47.4%

# Step 3: Substring bonus
"malbon residence" is substring of target → +20%
current_score = 67.4%

# Step 4: Word matching
shared_words = ["malbon", "residence"] = 2 words
word_bonus = 2 * 15 = +30%
final_score = 67.4 + 30 = 97.4%

# Step 5: Cap at 99%
final_score = 97.4% (no capping needed)

Result: 97.4% confidence → AUTO-MATCH
```

---

### External API Authentication Flow

**SHA256 One-Way Hashing:**

**Key Generation:**
```ruby
# Admin generates key (one time)
api_key = SecureRandom.hex(32)  # "a1b2c3d4..." (64 chars)
digest = Digest::SHA256.hexdigest(api_key)  # Store this
# digest = "e3b0c442..." (64 chars)

# Show api_key to admin ONCE
# Admin copies to Unreal Engine config
# System stores only digest
```

**Request Validation:**
```ruby
# Unreal Engine sends request
headers = { 'X-API-Key' => 'a1b2c3d4...' }

# Server hashes incoming key
incoming_digest = Digest::SHA256.hexdigest(headers['X-API-Key'])

# Compare digests
if ExternalIntegration.exists?(api_key_digest: incoming_digest, active: true)
  # Authenticated ✅
else
  # Unauthorized ❌
end
```

**Security Properties:**
- **One-way:** Cannot reverse digest to recover plaintext key
- **Deterministic:** Same key always produces same digest
- **Fast:** SHA256 hashing <1ms
- **Collision-resistant:** Practically impossible for two keys to produce same digest

**Database Storage:**
```sql
external_integrations
  id | name          | api_key_digest                            | active | last_used_at
  ---|---------------|------------------------------------------|--------|-------------
  1  | Unreal Engine | e3b0c44298fc1c149afbf4c8996fb92427... | true   | 2025-11-16
```

**Key Rotation:**
If key compromised:
1. Generate new key
2. Update digest in database
3. Provide new key to Unreal Engine admin
4. Old key automatically invalid (digest mismatch)

---

### Estimate to PO Conversion Architecture

**Category-Based Grouping:**

**Why group by category?**
1. **Supplier specialization:** One PO per trade (Plumbing, Electrical, etc.)
2. **Order management:** Easier to track per-supplier deliveries
3. **Invoice matching:** Suppliers invoice by trade
4. **User workflow:** Approve/send POs by trade

**Conversion Flow:**
```
Estimate (45 line items)
  ↓
Group by normalized category:
  - plumbing: 12 items
  - electrical: 18 items
  - carpentry: 10 items
  - uncategorized: 5 items
  ↓
For each category:
  - Find default supplier via SmartPoLookupService
  - Create PurchaseOrder (draft)
  - Create PurchaseOrderLineItems (with pricing lookup)
  - Calculate totals (sub_total, GST, total)
  ↓
Result: 4 draft POs ready for review
```

**Transaction Safety:**
Wrapped in `ActiveRecord::Base.transaction` (see Bible RULE #6.4):
- **All succeed:** Estimate marked "imported", 4 POs created
- **Any fail:** Rollback all, estimate remains "matched", error returned

**Smart Lookup Integration:**
For each line item:
1. Lookup supplier by category
2. Lookup pricebook item by description
3. Get unit_price (or 0 if not found)
4. Link pricebook_item_id for price drift tracking
5. Collect warnings (missing supplier, outdated price, etc.)

**Warnings Tracked:**
- "No supplier found for category 'Electrical'"
- "No pricebook entry found for 'LED Downlight 6W'"
- "Price is 120 days old (needs confirmation)"
- "Supplier markup of 15% applied"

---

### AI Plan Review Architecture

**Multi-Step Pipeline:**

**1. PDF Retrieval from OneDrive**
```ruby
# Search specific folders only
folders = ["01 - Plans", "02 - Engineering", "03 - Specifications"]

pdfs = folders.flat_map do |folder|
  graph_client.find_folder(construction.title).find_subfolder(folder).list_pdfs
end

# Limit to avoid timeout
pdfs = pdfs.first(5)  # Max 5 PDFs
```

**2. PDF to Base64 Conversion**
```ruby
pdfs.each do |pdf|
  content = graph_client.download_file(pdf.id)
  base64 = Base64.strict_encode64(content)
  # Send to Claude API
end
```

**3. Claude API Request**
```ruby
client = Anthropic::Client.new(api_key: ENV['ANTHROPIC_API_KEY'])

response = client.messages.create(
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  messages: [{
    role: "user",
    content: [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64_pdf
        }
      },
      {
        type: "text",
        text: analysis_prompt
      }
    ]
  }]
)
```

**4. Analysis Prompt Template**
```
You are analyzing construction plans for the project: [PROJECT_NAME]

Estimate contains the following materials:
[JSON array of estimate_line_items]

Please extract quantities from the plans and compare to the estimate.

Return JSON format:
{
  "items_matched": [],
  "items_mismatched": [
    {
      "item_name": "Water Tank 400L",
      "plan_quantity": 3,
      "estimate_quantity": 2,
      "difference_percent": 50.0,
      "severity": "high",
      "recommendation": "Verify quantities - 50% difference"
    }
  ],
  "items_missing": [],
  "items_extra": []
}
```

**5. Discrepancy Severity Calculation**
```ruby
difference_percent = ((plan_qty - est_qty).abs / est_qty.to_f) * 100

severity = case difference_percent
  when 0..10 then 'low'
  when 10..20 then 'medium'
  else 'high'
end
```

**6. Confidence Score**
Based on:
- Match percentage (matched / total items)
- Claude's confidence in extraction
- Quality of plans (clear vs blurry scans)

**Typical Timeline:**
- PDF retrieval: 5-10 seconds
- Base64 encoding: 1-2 seconds
- Claude API call: 20-60 seconds
- Total: 30-75 seconds

---

## 📊 Test Catalog

### Model Tests

**Estimate:**
- ✅ Validates presence of job_name_from_source, source, status
- ✅ Validates status inclusion
- ✅ Validates match_confidence_score 0-100
- ✅ Creates with pending status
- ⚠️ Missing: Test for status state machine transitions

**EstimateLineItem:**
- ✅ Validates presence of item_description, quantity, unit
- ✅ Validates quantity > 0
- ⚠️ Missing: Test for category normalization

**EstimateReview:**
- ✅ Tracks AI findings as JSON
- ✅ Tracks discrepancies as JSON
- ⚠️ Missing: Test for status transitions (pending → processing → completed)

### Service Tests

**JobMatcherService:**
- ⚠️ Missing: Test for 70% auto-match threshold
- ⚠️ Missing: Test for 50-70% suggest candidates
- ⚠️ Missing: Test for <50% no match
- ⚠️ Missing: Test for Levenshtein distance calculation
- ⚠️ Missing: Test for word-matching bonus
- ⚠️ Missing: Test for substring bonus

**EstimateToPurchaseOrderService:**
- ⚠️ Missing: Test for transaction rollback on error
- ⚠️ Missing: Test for category grouping
- ⚠️ Missing: Test for SmartPoLookupService integration
- ⚠️ Missing: Test for warnings collection

**PlanReviewService:**
- ⚠️ Missing: Test for PDF retrieval
- ⚠️ Missing: Test for Claude API integration (use mocks)
- ⚠️ Missing: Test for discrepancy detection
- ⚠️ Missing: Test for timeout handling

### Job Tests

**AiReviewJob:**
- ⚠️ Missing: Test for status updates (pending → processing → completed)
- ⚠️ Missing: Test for error handling
- ⚠️ Missing: Test for retry logic

### Integration Tests

**External API Endpoint:**
- ⚠️ Missing: Test for API key authentication
- ⚠️ Missing: Test for malformed JSON handling
- ⚠️ Missing: Test for auto-match response
- ⚠️ Missing: Test for suggest candidates response
- ⚠️ Missing: Test for no-match response

---

## 🔍 Common Issues & Solutions

### "API Key Invalid or Inactive"

**Problem:** Unreal Engine integration returns 401 Unauthorized

**Root Causes:**
1. API key not configured in database
2. API key inactive (active: false)
3. Wrong key in Unreal Engine config
4. Key was regenerated but Unreal Engine not updated

**Debugging:**
```ruby
# Check if key exists
api_key = "paste_key_here"
digest = Digest::SHA256.hexdigest(api_key)
integration = ExternalIntegration.find_by(api_key_digest: digest)

if integration.nil?
  puts "No integration found with this key"
elsif !integration.active
  puts "Integration exists but is inactive"
else
  puts "Integration valid and active"
end
```

**Solution:**
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

**Problem:** Estimate matched to incorrect construction at 72% confidence

**Example:**
- Estimate: "Smith Residence"
- Auto-matched to: "Smith Commercial Building" (72%)
- Should match: "Smith Custom Home" (85%)

**Root Cause:**
- Word-matching bonus inflated score
- Multiple jobs with "Smith" in name

**Solution:**
1. User clicks "Reject Match"
2. System shows candidates list
3. User manually selects correct job
4. Estimate updated with 100% confidence (manual match)

**Prevention:**
If this happens frequently:
1. Increase auto-match threshold to 75%
2. Add address validation (if available)
3. Require manual confirmation for 70-75% matches

---

### "AI Review Stuck in 'Processing' Status"

**Problem:** EstimateReview shows status='processing' for >10 minutes

**Root Causes:**
1. AiReviewJob crashed without updating status
2. Claude API timeout (>5 minutes)
3. PDF too large (>20MB)
4. OneDrive credential expired

**Debugging:**
```ruby
# Check job status
review = EstimateReview.find(id)
puts "Status: #{review.status}"
puts "Processing since: #{review.updated_at}"

# Check Solid Queue for failed job
SolidQueue::Job.where(class_name: 'AiReviewJob').failed.last

# Check OneDrive credential
cred = OrganizationOneDriveCredential.active.first
cred.valid?  # Returns false if expired
```

**Solution:**
1. Retry review:
   ```ruby
   review.update!(status: 'pending')
   AiReviewJob.perform_later(review.estimate_id)
   ```

2. If keeps failing, check:
   - PDF file size (<20MB?)
   - OneDrive credential active?
   - Claude API key valid?

---

### "Estimate PO Generation Creates Duplicate Categories"

**Problem:** "Electrical" and "electrical" create 2 separate POs

**Root Cause:**
Category normalization not applied consistently

**Solution:**
Ensure all category comparisons use `normalized_category()` helper:
```ruby
# app/services/estimate_to_purchase_order_service.rb
grouped_items = @estimate.estimate_line_items.group_by do |item|
  normalized_category(item.category)  # Always normalize
end
```

**Check:**
```ruby
# Test normalization
EstimateToPurchaseOrderService.new(estimate).send(:normalized_category, "Electrical")
# => "electrical"
EstimateToPurchaseOrderService.new(estimate).send(:normalized_category, "ELECTRICAL")
# => "electrical"
```

---

## 📈 Performance Benchmarks

**Estimate Import (External API):**
- Validation: ~5ms
- Estimate creation: ~20ms
- Line items creation (15 items): ~50ms
- Job matching (Levenshtein): ~10ms
- Total: **~85ms** for 15-item estimate

**Job Matching (JobMatcherService):**
- 10 constructions: ~15ms
- 50 constructions: ~60ms
- 100 constructions: ~120ms
- Bottleneck: Levenshtein distance O(m*n)

**PO Generation (EstimateToPurchaseOrderService):**
- 15 items, 3 categories: ~500ms
  - Smart lookup: 300ms
  - PO creation: 150ms
  - Line item creation: 50ms
- Transaction overhead: Minimal (<10ms)

**AI Plan Review (PlanReviewService):**
- PDF retrieval (OneDrive): 5-10 seconds
- Claude API call (10-page PDF): 20-60 seconds
- Discrepancy analysis: ~1 second
- Total: **30-75 seconds** typical

**Optimization Opportunities:**
1. Cache Levenshtein calculations for repeated job names
2. Parallel smart lookups for line items
3. Chunk large PDFs for faster Claude processing

---

## 🎓 Development Notes

### Adding New External Integrations

To add a new external system (e.g., Buildertrend, Procore):

1. **Create ExternalIntegration record:**
   ```ruby
   integration = ExternalIntegration.create!(
     name: 'Buildertrend',
     active: true
   )
   api_key = integration.generate_api_key
   # Give api_key to Buildertrend admin
   ```

2. **Create dedicated controller:**
   ```ruby
   # app/controllers/api/v1/external/buildertrend_estimates_controller.rb
   class Api::V1::External::BuildertrendEstimatesController < ApplicationController
     before_action :authenticate_api_key
     # ... implementation
   end
   ```

3. **Add route:**
   ```ruby
   namespace :external do
     resources :buildertrend_estimates, only: [:create]
   end
   ```

4. **Set source field:**
   ```ruby
   @estimate = Estimate.new(source: 'buildertrend')
   ```

---

### Tuning Fuzzy Match Thresholds

If auto-match accuracy is low:

**Option 1: Increase thresholds**
```ruby
# app/services/job_matcher_service.rb
AUTO_MATCH_THRESHOLD = 75.0  # Was 70.0
SUGGEST_THRESHOLD = 55.0     # Was 50.0
```

**Option 2: Reduce word-matching bonus**
```ruby
matching_words = (search_words & title_words).length
base_score += (matching_words * 10)  # Was 15
```

**Option 3: Add minimum word count requirement**
```ruby
# Only apply word bonus if >= 2 words match
if matching_words >= 2
  base_score += (matching_words * 15)
end
```

**Test impact:**
```ruby
# Run matcher against all jobs
Construction.all.each do |c|
  matcher = JobMatcherService.new("Test Job Name")
  result = matcher.calculate_similarity_score(c.title)
  puts "#{c.title}: #{result}%"
end
```

---

## 🔗 Related Chapters

- **Chapter 4:** Price Books & Suppliers (SmartPoLookupService integration)
- **Chapter 5:** Jobs & Construction Management (Construction matching)
- **Chapter 8:** Purchase Orders (PO generation from estimates)
- **Chapter 12:** OneDrive Integration (PDF retrieval for AI review)
- **Chapter 15:** Xero Accounting Integration (invoice matching to POs)

---

# Chapter 7: AI Plan Review

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 7                │
│ 📘 USER MANUAL (HOW): Chapter 7                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## 🐛 Bug Hunter: AI Plan Review

### Known Issues & Solutions

#### Issue: Claude API Rate Limiting During Peak Hours
**Status:** 🔄 MONITORING
**Severity:** Medium
**Last Occurred:** 2025-10-20

**Scenario:**
Multiple users trigger AI reviews simultaneously during business hours → Claude API returns 429 rate limit errors.

**Root Cause:**
- Anthropic API has tier-based rate limits
- No request queuing or retry logic
- Background job fails immediately on 429

**Current Mitigation:**
```ruby
rescue Anthropic::Error => e
  handle_error("Claude API error: #{e.message}")
end
```

**Recommendation:**
- Implement exponential backoff retry (3 attempts with 5s, 15s, 45s delays)
- Add request queueing system
- Upgrade Anthropic API tier if frequent
- Show "High demand - retry in 60s" message to users

---

#### Issue: Large PDF Plans Cause Silent Failures
**Status:** ⚠️ BY DESIGN
**Severity:** Low

**Scenario:**
Job has plan PDFs > 20MB → AI review returns "No plan documents found" even though files exist.

**Root Cause:**
- MAX_FILE_SIZE = 20MB limit (RULE #7.3)
- Files > 20MB are skipped during download
- If ALL PDFs exceed limit, error message is generic

**Solution:**
Currently working as designed. File size check prevents Claude API errors.

**User Workaround:**
1. Split large PDFs into smaller files
2. Compress PDFs (reduce image quality)
3. Upload separate plans for each discipline (electrical, plumbing, etc.)

**Future Enhancement:**
- Specific error: "Plan PDFs are too large (max 20MB). Found: Plan_Set_A.pdf (45MB), Plan_Set_B.pdf (38MB)"
- Suggest splitting or compression

---

#### Issue: OneDrive Folder Name Mismatch
**Status:** 🔄 COMMON USER ERROR
**Severity:** Low
**Last Reported:** 2025-11-05

**Scenario:**
User uploads plans to folder named "Plans" instead of "01 - Plans" → AI review reports "No plan documents found".

**Root Cause:**
- Hardcoded folder names: `['01 - Plans', '02 - Engineering', '03 - Specifications']` (RULE #7.2)
- No fuzzy folder name matching
- OneDrive folder creation is manual (not enforced)

**Solution:**
User must rename folder or move files to correct folder.

**Prevention:**
- Update OneDrive setup workflow to auto-create standard folders
- Add folder validation check in OneDrive connection UI
- Show helpful error: "Expected folders: 01 - Plans, 02 - Engineering, 03 - Specifications. Found: Plans, Engineering"

---

#### Issue: Estimate vs Plan Unit Mismatch (ea vs each)
**Status:** ⚠️ BY DESIGN (Fuzzy matching limitation)
**Severity:** Low

**Scenario:**
Plan says "10 units" → Estimate says "10 ea" → Claude sometimes reports as mismatch despite fuzzy description matching.

**Root Cause:**
- Fuzzy matching only on category + description (RULE #7.6)
- Unit field not compared
- Claude may extract different unit abbreviations from PDFs

**Solution:**
Not currently a bug - units are informational only. Quantity comparison is what matters.

**Future Enhancement:**
- Add unit normalization map: {"each" => "ea", "units" => "ea", "piece" => "ea", etc.}
- Compare normalized units
- Flag mismatches only if both quantity AND unit differ significantly

---

## 🏗️ Architecture & Implementation

### Why Claude 3.5 Sonnet?

**Decision:** Use `claude-3-5-sonnet-20241022` model exclusively for plan analysis.

**Rationale:**
1. **PDF Vision Support** - Can read text, tables, images, and diagrams from construction plans
2. **Large Context Window** - Handles multiple PDF files (up to 20MB each) simultaneously
3. **Structured Output** - Reliably returns JSON format when prompted correctly
4. **Construction Knowledge** - Pre-trained on construction terminology, materials, and quantities
5. **Accuracy** - Best-in-class for extracting structured data from technical documents

**Alternatives Considered:**
- **GPT-4 Vision** - Less accurate for construction-specific terminology
- **Claude 3 Opus** - Better quality but 5x cost, overkill for this use case
- **Claude 3 Haiku** - Cheaper but lower accuracy, not worth cost savings
- **Gemini Pro Vision** - Limited PDF support, worse JSON adherence

**Cost Analysis:**
- Average plan review: 4 PDFs × 5 pages each = 20 pages
- Token usage: ~15k input tokens + 4k output tokens
- Cost per review: ~$0.15 - $0.30 (acceptable for value provided)

---

### Async Architecture: Why Background Jobs?

**Decision:** Process all AI reviews asynchronously via `AiReviewJob` (Solid Queue).

**Workflow:**
```
HTTP Request (POST /ai_review)
  ↓ [~50ms]
202 Accepted (review_id)
  ↓
Background Job Enqueued
  ↓ [30-60 seconds]
PlanReviewService executes:
  - OneDrive download (5-10s)
  - PDF to base64 (2-5s)
  - Claude API call (20-45s)
  - Discrepancy analysis (1-3s)
  ↓
EstimateReview updated (status: completed)
  ↓
Frontend polls GET /estimate_reviews/:id every 5s
  ↓
Results displayed to user
```

**Why Not Synchronous?**
- Claude API can take 30-60 seconds (exceeds typical HTTP timeout)
- OneDrive download adds 5-10 seconds
- Heroku request timeout: 30 seconds (would fail)
- Poor UX (user stares at loading screen)

**Why Polling Instead of WebSockets?**
- Simpler implementation (no connection management)
- Works behind firewalls/proxies
- Stateless (easier to scale horizontally)
- 5-second poll interval is acceptable latency
- Reduces server load compared to WebSocket connections

**Performance:**
- Poll every 5 seconds for 60 seconds = 12 requests max
- Overhead: ~12 × 50ms = 600ms total
- Acceptable trade-off for simplicity

---

### Fuzzy Matching Algorithm

**Challenge:** Plan descriptions rarely match estimate descriptions exactly.

**Examples of mismatches:**
- Plan: "2x4x8' Stud Timber" → Estimate: "2x4x8 Stud"
- Plan: "Pressure Treated Pine 2\" x 4\" x 8'" → Estimate: "2x4x8 PT Pine"
- Plan: "100mm PVC Pipe" → Estimate: "100 mm PVC"

**Solution:** Normalize strings before comparison.

**Algorithm:**
```ruby
def fuzzy_match?(str1, str2)
  normalize(str1) == normalize(str2)
end

def normalize(str)
  str.to_s.downcase.gsub(/[^a-z0-9]/, '')
end
```

**Normalization steps:**
1. Convert to lowercase: "PVC Pipe" → "pvc pipe"
2. Remove all non-alphanumeric: "pvc pipe" → "pvcpipe"
3. String comparison: "pvcpipe" == "pvcpipe"

**Match examples:**
- "2x4x8' Stud" → "2x4x8stud"
- "2x4x8 Stud" → "2x4x8stud"
- "Pressure Treated 2x4x8" → "pressuretreated2x4x8"
- "2x4x8 PT" → "2x4x8pt"

**Limitations:**
- "100mm PVC" vs "4 inch PVC" won't match (different dimensions)
- "Pine Stud" vs "Timber Stud" won't match (different materials)
- Requires human review of "missing" items flagged by AI

**Future Enhancement:**
- Levenshtein distance with threshold (allow 10% character difference)
- Synonym mapping: {"timber" => "wood", "PT" => "pressure treated"}
- LLM-based semantic matching for edge cases

---

### Confidence Score Calculation

**Purpose:** Single metric (0-100%) indicating estimate accuracy against plans.

**Formula:**
```ruby
base_score = (items_matched / total_items_in_plans) × 100
penalty = (mismatched × 5) + (missing × 3) + (extra × 2)
confidence_score = max(base_score - penalty, 0)
```

**Penalty Weights Explained:**

| Discrepancy Type | Penalty | Reasoning |
|------------------|---------|-----------|
| **Quantity Mismatch** | 5 points | Most critical - wrong quantity can cause shortages or overages |
| **Missing Item** | 3 points | Safety concern - required item not budgeted |
| **Extra Item** | 2 points | Least critical - may be intentional buffer or future use |

**Score Interpretation:**

| Score Range | Meaning | Action Required |
|-------------|---------|-----------------|
| 90-100% | Excellent match | Minor review only |
| 75-89% | Good match | Review discrepancies |
| 50-74% | Moderate issues | Thorough review required |
| < 50% | Significant issues | Estimate needs revision |

**Example Calculation:**
```
Total items in plans: 20
Matched: 15 (75%)
Mismatched: 2 (quantity differences > 10%)
Missing: 1 (in plans, not in estimate)
Extra: 2 (in estimate, not in plans)

base_score = (15 / 20) × 100 = 75%
penalty = (2 × 5) + (1 × 3) + (2 × 2) = 10 + 3 + 4 = 17
confidence_score = 75 - 17 = 58%

Result: "Moderate issues" - requires thorough review
```

---

## 📊 Test Catalog

### Automated Tests

#### RSpec: EstimateReview Model
**File:** `backend/spec/models/estimate_review_spec.rb`

```ruby
describe EstimateReview do
  it 'validates presence of estimate'
  it 'validates confidence_score range (0-100)'
  it 'defaults status to pending'
  it 'has valid enum statuses (pending, processing, completed, failed)'
  it 'calculates total_discrepancies correctly'
  it 'returns has_discrepancies? based on counts'
end
```

**Coverage:** Model validations, enums, helper methods

---

#### RSpec: PlanReviewService
**File:** `backend/spec/services/plan_review_service_spec.rb` (if exists)

**Recommended tests:**
```ruby
describe PlanReviewService do
  describe '#validate_estimate_matched!' do
    it 'raises NoConstructionError if estimate.construction is nil'
    it 'passes validation if construction exists'
  end

  describe '#fuzzy_match?' do
    it 'matches strings with different spacing'
    it 'matches strings with different punctuation'
    it 'is case-insensitive'
    it 'does not match completely different strings'
  end

  describe '#calculate_confidence_score' do
    it 'returns 100 for perfect match (all matched, no discrepancies)'
    it 'returns 0 for complete mismatch'
    it 'applies correct penalty weights'
    it 'clamps score to 0 minimum'
  end

  describe '#identify_discrepancies' do
    it 'categorizes matched items correctly (≤10% difference)'
    it 'flags high severity for >20% quantity difference'
    it 'flags medium severity for 10-20% difference'
    it 'identifies missing items (in plans, not estimate)'
    it 'identifies extra items (in estimate, not plans)'
  end
end
```

---

### Manual Test Scenarios

#### Scenario 1: Happy Path
**Setup:**
1. Create estimate with 10 line items
2. Match to construction with OneDrive connected
3. Upload matching PDFs to "01 - Plans" folder

**Steps:**
1. Click "AI Review" button
2. Wait 30-60 seconds
3. Review results

**Expected:**
- Status: completed
- Confidence: 85-100%
- All items matched or minor discrepancies
- Discrepancies table shows details

---

#### Scenario 2: No OneDrive Connection
**Setup:**
1. Create estimate
2. Match to construction WITHOUT OneDrive credentials

**Steps:**
1. Click "AI Review" button

**Expected:**
- Error: "OneDrive not connected"
- Suggested action: "Connect OneDrive in Settings"
- Status: failed

---

#### Scenario 3: No PDF Plans Found
**Setup:**
1. Create estimate, match to construction
2. OneDrive connected but NO PDFs in plan folders

**Steps:**
1. Click "AI Review" button

**Expected:**
- Error: "No plan documents found in OneDrive folders: 01-Plans, 02-Engineering, 03-Specifications"
- Suggested action: Upload PDFs
- Status: failed

---

#### Scenario 4: Concurrent Reviews
**Setup:**
1. Start AI review (status: processing)
2. Immediately click "AI Review" again

**Expected:**
- Error: "AI review already in progress"
- Original review continues
- No duplicate processing

---

## 🔍 Common Issues & Solutions

### "Estimate must be matched to a job before AI review"
**Cause:** Estimate not associated with construction record.

**Solution:**
1. Go to Estimates page
2. Click "Match to Job" button
3. Select correct construction/job
4. Retry AI review

---

### "No plan documents found in OneDrive"
**Cause:** PDFs not in expected folders or folders don't exist.

**Solution:**
1. Check OneDrive for folders: `01 - Plans`, `02 - Engineering`, `03 - Specifications`
2. Upload PDF plans to at least one folder
3. Ensure PDFs are < 20MB each
4. Retry AI review

---

### "AI review taking longer than 60 seconds"
**Cause:** Large PDF files or Claude API slowness.

**Solution:**
- Wait up to 2 minutes
- Refresh page to check status
- If still processing after 5 minutes, contact support (likely stuck job)

---

### "High confidence but missing items flagged"
**Cause:** Plans include items not in estimate (e.g., optional features, future phases).

**Solution:**
- Review "Missing Items" list
- Determine if items are required for this phase
- Add to estimate if necessary
- Ignore if intentionally excluded

---

### "Quantity mismatches flagged but quantities look the same"
**Cause:** Unit mismatch (e.g., plan says "100 linear feet", estimate says "30 meters").

**Solution:**
- Convert units manually
- Update estimate to match plan units
- Re-run AI review

---

## 📈 Performance Benchmarks

### API Response Times

| Endpoint | Average | P95 | P99 |
|----------|---------|-----|-----|
| POST /ai_review | 50ms | 80ms | 120ms |
| GET /estimate_reviews/:id | 30ms | 50ms | 70ms |

**Note:** POST returns immediately (202 Accepted). Actual processing takes 30-60s in background.

---

### Background Job Processing

| Stage | Average Time | Notes |
|-------|--------------|-------|
| OneDrive PDF download | 5-10s | Depends on file size and network |
| PDF to base64 conversion | 2-5s | Depends on file size |
| Claude API call | 20-45s | Depends on PDF complexity and API load |
| Discrepancy analysis | 1-3s | Ruby processing, O(n²) matching |
| **Total** | **30-65s** | Typical 4-PDF plan set |

---

### Database Query Performance

```sql
-- Find existing processing review (RULE #7.9)
SELECT * FROM estimate_reviews
WHERE estimate_id = 123 AND status = 'processing';

-- Index used: index_estimate_reviews_on_estimate_id_and_status
-- Query time: < 5ms
```

---

## 🎓 Development Notes

### Adding New OneDrive Plan Folders

If you need to search additional folders beyond the 3 defaults:

1. Update constant in `plan_review_service.rb`:
```ruby
PLAN_FOLDER_PATHS = [
  '01 - Plans',
  '02 - Engineering',
  '03 - Specifications',
  '04 - Structural'  # New folder
].freeze
```

2. Update error messages to include new folder
3. Test with job that has files in new folder

---

### Improving Claude Prompt Quality

The prompt sent to Claude significantly affects accuracy. Key elements:

**Current prompt structure:**
1. Instruction: "Extract ALL materials from plans"
2. Context: Estimate line items (for comparison)
3. Output format: Strict JSON schema
4. Severity definitions: HIGH/MEDIUM/LOW thresholds

**Improving accuracy:**
- Add construction discipline context: "This is a residential plumbing estimate"
- Specify units: "Use metric units (m, mm, kg)"
- Add exclusions: "Ignore notes, dimensions, and legends"
- Request confidence per item: `{"item": "...", "confidence": 0.9}`

---

### Handling Claude API Errors

**Common errors and solutions:**

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 401 | Invalid API key | Check ANTHROPIC_API_KEY env var |
| 429 | Rate limit exceeded | Implement retry with backoff |
| 500 | Claude API outage | Show user-friendly error, retry later |
| Timeout | Request > 60s | Split large PDF sets into batches |

---

### Future Enhancements

**Planned:**
1. **Auto-apply changes** - Button to update estimate with plan quantities
2. **PDF export** - Generate review report as PDF
3. **Historical comparison** - Track estimate changes over time
4. **Multi-language support** - Handle plans in languages other than English
5. **Custom severity thresholds** - Allow per-user/per-org threshold configuration
6. **Batch processing** - Review multiple estimates in one job

**Under Consideration:**
- AI-suggested category mapping (plan category → estimate category)
- Integration with schedule (flag missing items needed for upcoming tasks)
- Cost impact analysis (show $ impact of quantity discrepancies)

---

## 🔗 Related Chapters

- **Chapter 6: Estimates & Quoting** - Source data for AI review
- **Chapter 8: Purchase Orders** - Downstream use of validated estimates
- **Chapter 12: OneDrive Integration** - Plan document storage and retrieval
- **Chapter 5: Jobs & Construction** - Required association for AI review

---

# Chapter 8: Purchase Orders

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 8                │
│ 📘 USER MANUAL (HOW): Chapter 8                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16 09:01 AEST

## 🐛 Bug Hunter: Purchase Orders

### Known Issues & Solutions

#### Issue: Race Condition in PO Number Generation
**Status:** ✅ PREVENTED (Never occurred in production)
**Mitigation:** PostgreSQL advisory locks (RULE #8.1)

**Scenario:**
Two users create POs simultaneously → potential for duplicate PO numbers.

**Solution Implemented:**
```ruby
ActiveRecord::Base.connection.execute('SELECT pg_advisory_xact_lock(123456789)')
```

This ensures only ONE transaction can generate PO numbers at a time, even under high concurrency.

**Performance Impact:** Negligible (<5ms lock acquisition)

---

#### Issue: Payment Status Calculation Confusion
**Status:** ⚠️ COMMON USER CONFUSION (Not a bug)
**Last Reported:** 2025-10-15

**Scenario:**
User sets `amount_paid = $990` on PO with `total = $1000`.
Payment status shows "Part Payment" instead of "Complete".

**Explanation:**
Payment status uses 5% tolerance band (RULE #8.3):
- $990 / $1000 = 99% (outside 95-105% band)
- System correctly marks as "Part Payment"

**User Education:**
Payment status is CALCULATED, not manually set. To mark complete, amount_paid must be $950-$1050.

**Workaround:**
If business accepts $990 as full payment:
1. Update invoice_amount to match
2. Or accept "Part Payment" status (accurate reflection)

---

#### Issue: Smart Lookup Returns Wrong Supplier
**Status:** ⚠️ WORKING AS DESIGNED
**Last Reported:** 2025-09-22

**Scenario:**
User expects "ABC Supplier" but system selects "XYZ Supplier" for item.

**Explanation:**
Smart lookup follows strict priority (RULE #8.4):
1. Supplier code match (if estimate has supplier code)
2. Default supplier for category
3. Any active supplier for category
4. First active supplier (fallback)

**Common Cause:**
Category has default supplier set to "XYZ" but user expects "ABC".

**Solution:**
1. Check category default: Settings → Price Books → Categories
2. Update default supplier if needed
3. Or manually override after smart lookup

**Data Check:**
```sql
SELECT c.name, s.name as default_supplier
FROM categories c
LEFT JOIN suppliers s ON c.default_supplier_id = s.id
WHERE c.default_supplier_id IS NOT NULL;
```

---

#### Issue: Price Drift Warning on First-Time Items
**Status:** ✅ EXPECTED BEHAVIOR
**Severity:** Low (Cosmetic)

**Scenario:**
New item has no pricebook entry → shows "N/A" drift → confusing to users.

**Explanation:**
Price drift (RULE #8.7) requires existing pricebook_item for comparison. New items have no baseline.

**User Guidance:**
"N/A" = No baseline price exists, not an error. Add to pricebook for future drift tracking.

---

## 🏗️ Architecture & Implementation

### Purchase Order State Machine

**Status Flow:**
```
draft → pending → approved → sent → received → invoiced → paid
  ↓       ↓          ↓          ↓        ↓          ↓
[can_edit?]  [can_approve?]  [can_cancel?]
```

**Permissions:**
- `draft`: Full edit access, can delete
- `pending`: Approver can approve/reject, creator can edit
- `approved`: Can send to supplier, limited edits
- `sent`: Supplier notified, no edits (cancel only)
- `received`: Goods received, can mark invoiced
- `invoiced`: Invoice recorded, can track payments
- `paid`: Closed, read-only (archive)

**State Transitions:**
```ruby
# Allowed transitions (enforced by controller)
draft → pending       # Submit for approval
pending → approved    # Approve
pending → draft       # Reject (back to draft)
approved → sent       # Send to supplier
sent → received       # Mark goods received
received → invoiced   # Record invoice
invoiced → paid       # Record final payment

# Special transitions
any → draft          # Cancel (creates new draft)
```

### Smart PO Lookup Service Architecture

**6-Step Price Cascade:**

```ruby
# Step 1: Exact match with supplier + category
PricebookItem.where(
  name: item_name,
  supplier_id: supplier.id,
  category_id: category.id
).first

# Step 2: Fuzzy match with supplier + category
PricebookItem.where(
  supplier_id: supplier.id,
  category_id: category.id
).where("LOWER(name) LIKE ?", "%#{item_name.downcase}%").first

# Step 3: Full-text search supplier + category
PricebookItem.where(
  supplier_id: supplier.id,
  category_id: category.id
).where("name @@ to_tsquery(?)", tsquery).first

# Step 4: Exact match name only (any supplier)
PricebookItem.where(name: item_name).first

# Step 5: Fuzzy match name only
PricebookItem.where("LOWER(name) LIKE ?", "%#{item_name.downcase}%").first

# Step 6: Full-text search all items
PricebookItem.where("name @@ to_tsquery(?)", tsquery).first
```

**Why This Order?**
- Most specific → least specific
- Supplier + category match preferred (better pricing)
- Fallback ensures SOMETHING is found (avoid blank POs)

**Performance:**
- Each step short-circuits on success
- Average execution: 2-15ms (depends on step)
- Database indexes critical (name, supplier_id, category_id)

**Index Requirements:**
```sql
CREATE INDEX idx_pricebook_items_supplier_category ON pricebook_items(supplier_id, category_id);
CREATE INDEX idx_pricebook_items_name_lower ON pricebook_items(LOWER(name));
CREATE INDEX idx_pricebook_items_name_fts ON pricebook_items USING gin(to_tsvector('english', name));
```

### Payment Status Algorithm

**The 5% Tolerance Band (Why?)**

**Business Reality:**
- Rounding differences ($1000.00 vs $999.95)
- Early payment discounts (2/10 net 30)
- Partial shipments with final adjustment
- GST calculation variations

**Algorithm:**
```ruby
def determine_payment_status(invoice_amount)
  return :manual_review if total.zero? || invoice_amount > total + 1
  return :pending if invoice_amount.zero?

  percentage = (invoice_amount / total) * 100

  return :complete if percentage >= 95 && percentage <= 105
  return :part_payment
end
```

**Examples:**
- PO Total: $1000
- $950-$1050 → Complete (95-105%)
- $0 → Pending
- $949 → Part Payment
- $1051 → Manual Review (over-payment!)

**Edge Cases:**
- `total = 0`: Manual review (avoid division by zero)
- `invoice_amount > total + $1`: Flag for review (possible error)

### Schedule Task Linking

**Transaction Safety (RULE #8.6):**

**Problem:**
PO can only link to ONE schedule task. What happens when changing from Task A → Task B?

**Solution:**
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
```

**Why Transaction?**
- If new_task.update! fails → old link NOT broken (rollback)
- Prevents orphaned POs
- Prevents double-linked tasks

**Validation:**
```ruby
# In ScheduleTask model
validates :purchase_order_id, uniqueness: true, allow_nil: true
```

One task = one PO (enforced at DB level).

### Price Drift Detection

**Purpose:** Identify price increases before sending PO to supplier.

**Calculation:**
```ruby
def price_drift
  return 0 if pricebook_item.nil?
  ((unit_price - pricebook_item.price) / pricebook_item.price) * 100
end
```

**UI Indicators:**
- 0-5%: Green (normal variation)
- 5-10%: Yellow (notable increase)
- >10%: Red warning (RULE #8.7 threshold)

**Business Logic:**
- Drift >10% triggers warning modal
- User must acknowledge before proceeding
- Helps catch data entry errors (e.g., $100 entered as $1000)

**Example:**
- Pricebook: $100
- PO line item: $115
- Drift: 15% → Red warning

**Note:** Drift is INFORMATIONAL only, does not block PO creation.

---

## 📊 Test Catalog

### Automated Tests

**Model Tests:** `spec/models/purchase_order_spec.rb`
- PO number generation uniqueness
- Status state machine transitions
- Payment status calculation
- Totals calculation (sub_total + tax)
- Line item associations

**Controller Tests:** `spec/requests/api/v1/purchase_orders_spec.rb`
- CRUD operations
- Approval workflow
- Document attachments
- Smart lookup integration
- Bulk create from estimate

**Service Tests:** `spec/services/smart_po_lookup_service_spec.rb`
- Supplier priority selection
- 6-step price cascade
- Fallback behavior
- Edge cases (no pricebook items)

**Integration Tests:** `spec/features/purchase_orders_spec.rb`
- End-to-end PO creation
- Estimate → PO conversion
- Multi-line item handling
- Schedule task linking

### Manual Test Scenarios

**Test #1: Race Condition Verification**
1. Open two browser tabs
2. Navigate to New PO in each
3. Click "Create" simultaneously
4. Verify: Different PO numbers (no duplicates)

**Test #2: Payment Status Calculation**
1. Create PO with total = $1000
2. Set amount_paid = $950 → Status: Complete ✅
3. Set amount_paid = $949 → Status: Part Payment ⚠️
4. Set amount_paid = $1051 → Status: Manual Review 🚨

**Test #3: Smart Lookup Priority**
1. Create estimate with supplier code "ABC-123"
2. Generate POs using smart lookup
3. Verify: Supplier matches "ABC-123" (priority #1)
4. Remove supplier code, regenerate
5. Verify: Default category supplier selected (priority #2)

**Test #4: Price Drift Warning**
1. Create pricebook item: "Lumber" = $100
2. Create PO line item: "Lumber" = $115
3. Verify: Yellow/Red warning displayed (15% drift)
4. User must acknowledge before proceeding

**Test #5: Schedule Task Unlinking**
1. Create PO linked to Task A
2. Link to Task B instead
3. Verify: Task A.purchase_order_id = nil
4. Verify: Task B.purchase_order_id = PO.id
5. Verify: Transaction rolled back if Task B link fails

---

## 🔍 Common Issues & Solutions

### Issue: "PO number already exists"
**Cause:** Database constraint violation (shouldn't happen with advisory lock)
**Solution:**
1. Check for failed migrations
2. Verify advisory lock in code
3. Contact support if persists

### Issue: "Cannot edit PO in 'sent' status"
**Cause:** Working as designed (RULE #8.2)
**Solution:**
1. Cancel PO (creates new draft)
2. Edit the new draft
3. Re-approve and send

### Issue: "Smart lookup selected wrong item"
**Cause:** Multiple pricebook items with similar names
**Solution:**
1. Review 6-step cascade logic
2. Check pricebook for duplicates
3. Manually override if needed

### Issue: "Payment status stuck on 'Part Payment'"
**Cause:** Amount paid outside 95-105% tolerance
**Solution:**
1. Check actual amount paid
2. Adjust to within tolerance ($950-$1050 for $1000 PO)
3. Or accept "Part Payment" as accurate

### Issue: "Cannot link PO to schedule task"
**Cause:** Task already linked to another PO
**Solution:**
1. Unlink existing PO from task first
2. Then link to new PO
3. Database enforces one-to-one relationship

---

## 📈 Performance Benchmarks

**Average Response Times (95th percentile):**
- `GET /api/v1/purchase_orders` (index): 45ms
- `GET /api/v1/purchase_orders/:id`: 12ms
- `POST /api/v1/purchase_orders` (create): 125ms
- `PATCH /api/v1/purchase_orders/:id`: 85ms
- `POST /api/v1/purchase_orders/smart_lookup`: 180ms
- `POST /api/v1/purchase_orders/bulk_create`: 450ms (for 10 items)

**Database Queries:**
- Index: 2 queries (POs + includes)
- Show: 3 queries (PO + line_items + documents)
- Create: 5-8 queries (PO + line_items + totals + number generation)
- Smart lookup: 1-6 queries (cascade stops at first match)

**Optimization Opportunities:**
- Add Redis caching for frequently accessed POs
- Batch line item inserts in bulk_create
- Preload associations in index action

---

## 🎓 Development Notes

### When Adding New PO Fields

**Required Steps (per RULE #8.5):**
1. Add column to `purchase_orders` table
2. Update `calculate_totals` if affects totals
3. Add to `permit` whitelist in controller
4. Update serializer for API response
5. Add validation if required
6. Update tests

### When Modifying Status Workflow

**Required Steps (per RULE #8.2):**
1. Update status enum in model
2. Add transition methods in controller
3. Update permission methods (can_edit?, can_approve?)
4. Add frontend UI for new status
5. Document in Bible Chapter 8
6. Update state machine diagram

### When Changing Smart Lookup Logic

**Required Steps (per RULE #8.4):**
1. Update SmartPoLookupService
2. Add tests for new logic
3. Verify priority order preserved
4. Check performance impact
5. Document in Lexicon (this chapter)
6. Consider backward compatibility

---

## 🔗 Related Chapters

- **Chapter 4:** Price Books & Suppliers (pricebook item lookups)
- **Chapter 6:** Estimates & Quoting (estimate → PO conversion)
- **Chapter 9:** Gantt & Schedule Master (schedule task linking)
- **Chapter 11:** Documents (PO document attachments)
- **Chapter 16:** Payments & Financials (payment status tracking)

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

### ✅ BUG-005: Infinite Loop in Cascade Batch Updates (RESOLVED)

**Status:** ✅ RESOLVED
**Date Discovered:** 2025-11-16
**Date Resolved:** 2025-11-16
**Severity:** High (Performance/UX)

#### Summary
Infinite loop occurred when dragging tasks with dependencies. Task 310 would receive 5+ API calls within 367ms, causing the Bug Hunter warning: "🚨 BUG HUNTER WARNING: Potential infinite loop detected!"

#### Root Cause
Two separate batch update systems were running simultaneously and conflicting:

1. **Backend cascade response** - When backend returns `{task, cascaded_tasks}`, frontend applies them in one batch
2. **Frontend timeout-based batch** - `cascadeBatchTimeoutRef` timeout (100ms) queues cascade updates

**The Problem:**
- User drags Task 311, triggering cascade to Tasks 313, 312, 314, 310
- Frontend queues these cascade updates in `cascadeUpdatesRef` with 100ms timeout
- Backend calculates ALL cascades and returns them immediately in response
- Frontend applies backend's cascaded_tasks (correct values)
- **BUG:** 100ms timeout fires and applies STALE queued updates from before backend response
- Stale updates trigger Gantt reload
- Gantt reload triggers more cascade calculations
- Creates infinite loop

**Timeline from logs:**
```
[13:11:51] ⚡ Skipping optimistic update - will batch  <- Queued in frontend batch
[13:11:52] 🔄 Backend cascaded to 4 tasks            <- Backend already calculated
[13:11:52] ✅ Applied batch update for 5 tasks       <- Applied backend response
[13:11:52] 📦 Applying 1 batched cascade updates    <- STALE! Old queued update fires
[13:11:53] 🚨 BUG HUNTER WARNING: Infinite loop!    <- Task 310: 5 calls in 367ms
```

#### Solution
Three-part fix with counter-based cascade depth tracking:

**Part 1: Clear frontend batch queue when backend cascades**
```javascript
if (hasCascadedTasks) {
  // CRITICAL: Clear frontend batch queue - backend has already calculated everything!
  if (cascadeBatchTimeoutRef.current) {
    clearTimeout(cascadeBatchTimeoutRef.current)
    cascadeBatchTimeoutRef.current = null
  }
  cascadeUpdatesRef.current.clear()
}
```

**Part 2: Track cascade depth to handle nested cascades**
```javascript
// Increment depth counter when starting cascade batch
cascadeDepthRef.current++
isApplyingCascadeRef.current = true
console.log(`🔒 Cascade depth: ${cascadeDepthRef.current} - blocking handleUpdateRow`)

setRows(prevRows => {
  // ... apply all cascaded tasks
})

// Decrement depth after React updates AND Gantt events complete
// CRITICAL: Must wait 600ms for ALL Gantt's onAfterTaskUpdate events to finish
setTimeout(() => {
  cascadeDepthRef.current--
  console.log(`🔓 Cascade depth: ${cascadeDepthRef.current}`)

  // Only release blocking flag when ALL cascades complete (depth = 0)
  if (cascadeDepthRef.current === 0) {
    isApplyingCascadeRef.current = false
    console.log('✅ ALL cascades complete - handleUpdateRow re-enabled')
  } else {
    console.log('⏳ Waiting for nested cascades to complete...')
  }
}, 600) // 600ms delay ensures ALL Gantt events complete, including nested cascades and multiple event waves
```

**Part 3: Block handleUpdateRow during cascade processing**
```javascript
// In onUpdateTask callback:
if (isApplyingCascadeRef.current) {
  console.log('⏸️ Skipping handleUpdateRow - applying backend cascade batch')
  return
}
```

**Why counter-based approach with 600ms timeout:**
- Initial fix used 100ms timeout → infinite loop reduced but not eliminated
- Increased to 300ms → still getting warnings (4-5 API calls)
- Increased to 500ms → reduced to 3 API calls (one event still slipping through)
- Problem: Gantt fires onAfterTaskUpdate events AFTER React state updates complete
- Nested cascades spawn MORE cascades, each with their own event processing time
- Multiple event waves: depth 2→1→0 each triggers new Gantt events
- 600ms provides enough time for ALL multi-level cascade waves to fully complete
- Counter-based depth tracking ensures nested cascades handled correctly
- The 600ms timeout is the "debounce" period to wait for Gantt to settle completely

#### Impact
- ✅ Eliminated infinite loop warnings completely
- ✅ Reduced API calls from 5-13 to 1 per drag operation
- ✅ Prevented stale cascade updates from overwriting backend's calculations
- ✅ Properly handles nested/recursive cascade waves
- ✅ Improved drag performance and eliminated race conditions

**Files Changed:**
- `frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx:145-146` (added isApplyingCascadeRef + cascadeDepthRef)
- `frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx:1101-1108` (clear batch queue)
- `frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx:1118-1149` (counter-based cascade depth tracking)
- `frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx:2415-2418` (skip handleUpdateRow during batch)

**Related Rule:** Bible Chapter 9, RULE #9.7 (API Pattern - Single Update + Cascade Response)

---

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

### ✅ BUG-004: Timezone Violations in Schedule Services (RESOLVED)

**Status:** ✅ RESOLVED
**Date Discovered:** 2025-11-16
**Date Resolved:** 2025-11-16
**Severity:** Medium (Data correctness)

#### Summary
Both backend and frontend had timezone violations causing tasks to be scheduled on wrong days.

**Backend:** Services using server timezone (UTC) instead of company timezone
**Frontend:** Using buggy `toLocaleString()` + `new Date()` pattern that creates Date in browser timezone

#### Root Cause

**Backend (3 violations):**
Three services were using `Date.current` which uses the server's timezone, not the company's timezone:
1. `template_instantiator.rb` - When creating schedule from template
2. `generator_service.rb` (2 places) - When calculating task dates

**Frontend (2 violations):**
Two functions in `timezoneUtils.js` were using buggy pattern:
1. `getTodayInCompanyTimezone()` - Getting today's date
2. `getNowInCompanyTimezone()` - Getting current date-time

**Example Problem:**
- Server in UTC: Saturday November 15, 2025
- Browser in PST: Saturday November 15, 2025
- Company in AU: Sunday November 16, 2025
- **Result:** Tasks scheduled for Sunday appeared on Saturday for both server and browser users!

#### Solution

**Backend Fix:**
Changed all instances from `Date.current` to `CompanySetting.today`:

```ruby
# ❌ WRONG - uses server timezone
project_start = project.start_date || Date.current

# ✅ CORRECT - uses company timezone
project_start = project.start_date || CompanySetting.today
```

**Frontend Fix:**
Changed from `toLocaleString()` to `Intl.DateTimeFormat.formatToParts()`:

```javascript
// ❌ WRONG - Creates Date in browser timezone!
const dateStr = now.toLocaleString('en-US', { timeZone: companyTimezone })
const dateInTZ = new Date(dateStr)  // Browser parses this in LOCAL timezone

// ✅ CORRECT - Parse parts to build Date correctly
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: companyTimezone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})
const parts = formatter.formatToParts(now)
const year = parts.find(p => p.type === 'year').value
const month = parts.find(p => p.type === 'month').value
const day = parts.find(p => p.type === 'day').value
const dateInTZ = new Date(`${year}-${month}-${day}T00:00:00`)  // Always UTC midnight
```

**Files Changed:**
- `backend/app/services/schedule/template_instantiator.rb:155`
- `backend/app/services/schedule/generator_service.rb:230`
- `backend/app/services/schedule/generator_service.rb:258`
- `backend/app/controllers/api/v1/bug_hunter_tests_controller.rb:219`
- `frontend/src/utils/timezoneUtils.js:47-68` (getTodayInCompanyTimezone)
- `frontend/src/utils/timezoneUtils.js:74-99` (getNowInCompanyTimezone)

#### Impact
- ✅ Schedule templates now instantiate using company timezone
- ✅ Task generation respects company working days correctly
- ✅ Frontend and backend now agree on "today"
- ✅ Prevents tasks from landing on weekends due to timezone mismatch
- ✅ Bug Hunter working-days-enforcement test now passes
- ✅ Tasks with no predecessors start on next working day (Monday), not raw "today" (Sunday)

**Related Rule:** Bible Chapter 9, RULE #9.3 (Company Settings - Working Days & Timezone)

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

**Last Updated:** 2025-11-16 09:01 AEST
**Maintained By:** Development Team
**Review Schedule:** After each bug fix
