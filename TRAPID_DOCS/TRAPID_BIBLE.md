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

**Last Updated:** 2025-11-16

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

**JWT is the ONLY authentication mechanism.** No session cookies.

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

**Implementation:**
```ruby
# backend/app/services/json_web_token.rb
def self.encode(payload, exp = 24.hours.from_now)
  payload[:exp] = exp.to_i
  JWT.encode(payload, SECRET_KEY)
end

def self.decode(token)
  decoded = JWT.decode(token, SECRET_KEY)[0]
  HashWithIndifferentAccess.new decoded
rescue JWT::DecodeError, JWT::ExpiredSignature
  nil  # Return nil on invalid/expired tokens
end
```

**Token Validation:**
```ruby
# ApplicationController
before_action :authorize_request

def authorize_request
  header = request.headers['Authorization']
  header = header.split(' ').last if header

  decoded = JsonWebToken.decode(header)
  @current_user = User.find(decoded[:user_id]) if decoded
rescue ActiveRecord::RecordNotFound, JWT::DecodeError
  render json: { error: 'Unauthorized' }, status: :unauthorized
end
```

**Files:**
- `backend/app/services/json_web_token.rb`
- `backend/app/controllers/application_controller.rb`

---

## RULE #1.2: Password Security Requirements

**Passwords MUST meet strict complexity requirements.**

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

**Implementation:**
```ruby
# app/models/user.rb
has_secure_password  # Uses bcrypt

validates :password, length: { minimum: 12 }, if: :password_required?
validate :password_complexity, if: :password_required?

private

def password_complexity
  return unless password.present?

  rules = [
    [/[A-Z]/, 'uppercase letter'],
    [/[a-z]/, 'lowercase letter'],
    [/[0-9]/, 'number'],
    [/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'special character']
  ]

  rules.each do |regex, description|
    unless password.match?(regex)
      errors.add(:password, "must include at least one #{description}")
    end
  end
end

def password_required?
  password_digest.nil? || password.present?
end
```

**Why 12 characters?**
- NIST recommends 8+ for human-created, 12+ for user-chosen
- Protects against brute force (12 chars = 10^21 combinations with mixed case/symbols)
- Industry best practice (Google, Microsoft, Apple all require 12+)

**Files:**
- `backend/app/models/user.rb`
- `backend/app/models/portal_user.rb` (same rules)

---

## RULE #1.3: Role-Based Access Control

**Roles are HARDCODED enums, not database-driven.**

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

**Role Definitions:**
```ruby
# app/models/user.rb
ROLES = %w[user admin product_owner estimator supervisor builder].freeze
ASSIGNABLE_ROLES = %w[admin sales site supervisor builder estimator].freeze

# Permission methods
def admin?
  role == 'admin'
end

def can_create_templates?
  admin? || product_owner?
end

def can_edit_schedule?
  admin? || product_owner? || estimator?
end

def can_view_supervisor_tasks?
  admin? || supervisor?
end

def can_view_builder_tasks?
  admin? || builder?
end
```

**Controller Usage:**
```ruby
# app/controllers/api/v1/schedule_template_rows_controller.rb
before_action :check_can_edit_templates, except: [:audit_logs]

def check_can_edit_templates
  unless @current_user.can_create_templates?
    render json: { error: 'Unauthorized' }, status: :forbidden
  end
end
```

**Why hardcoded?**
- Prevents privilege escalation via API
- Ensures consistent role names across codebase
- Roles tied to business logic (not arbitrary)

**Files:**
- `backend/app/models/user.rb`
- `backend/app/controllers/application_controller.rb`

---

## RULE #1.4: Rate Limiting on Auth Endpoints

**Rate limiting MUST be enforced on all authentication endpoints.**

✅ **MUST configure:**
- Auth endpoints: 5 requests per 20 seconds per IP
- Password reset: 3 requests per hour per email
- General API: 300 requests per 5 minutes per IP

❌ **NEVER:**
- Disable rate limiting in production
- Use same limits for external vs internal APIs
- Skip rate limiting for "trusted" IPs (除非 explicitly whitelisted)

**Implementation:**
```ruby
# config/initializers/rack_attack.rb
Rack::Attack.throttle('auth/ip', limit: 5, period: 20.seconds) do |req|
  req.ip if req.path.start_with?('/api/v1/auth/')
end

Rack::Attack.throttle('password_reset/email', limit: 3, period: 1.hour) do |req|
  if req.path == '/api/v1/users/reset_password' && req.post?
    req.params['email'].to_s.downcase.presence
  end
end

Rack::Attack.throttle('general/ip', limit: 300, period: 5.minutes) do |req|
  req.ip
end
```

**Response:**
- Status: `429 Too Many Requests`
- Header: `Retry-After: <seconds>`
- Body: `{ error: 'Rate limit exceeded. Try again later.' }`

**Files:**
- `config/initializers/rack_attack.rb`

---

## RULE #1.5: OAuth Integration Pattern

**OAuth MUST use OmniAuth with proper callback handling.**

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

**Implementation:**
```ruby
# config/initializers/omniauth.rb
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :microsoft_office365,
    ENV['ONEDRIVE_CLIENT_ID'],
    ENV['ONEDRIVE_CLIENT_SECRET'],
    scope: 'openid profile email User.Read'
end

# app/models/user.rb
def self.from_omniauth(auth)
  where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
    user.email = auth.info.email
    user.name = auth.info.name
    user.password = SecureRandom.hex(16)  # Random password
    user.oauth_token = auth.credentials.token
    user.oauth_expires_at = Time.at(auth.credentials.expires_at)
  end
end

# app/controllers/api/v1/omniauth_callbacks_controller.rb
def microsoft_office365
  user = User.from_omniauth(request.env['omniauth.auth'])
  token = JsonWebToken.encode(user_id: user.id)

  redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?token=#{token}"
end
```

**Supported Providers:**
- Microsoft Office 365 (OneDrive, Outlook integration)

**Files:**
- `config/initializers/omniauth.rb`
- `app/controllers/api/v1/omniauth_callbacks_controller.rb`
- `app/models/user.rb`

---

## RULE #1.6: Password Reset Flow

**Password reset MUST use secure tokens with expiration.**

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

**Implementation:**
```ruby
# app/controllers/api/v1/users_controller.rb
def reset_password
  token = SecureRandom.urlsafe_base64(32)
  @user.update!(
    reset_password_token: Digest::SHA256.hexdigest(token),
    reset_password_sent_at: Time.current
  )

  # UserMailer.reset_password(@user, token).deliver_later
  render json: { message: 'Password reset email sent' }
end

# Validate token (in separate endpoint)
def validate_reset_token
  hashed_token = Digest::SHA256.hexdigest(params[:token])
  user = User.find_by(reset_password_token: hashed_token)

  if user && user.reset_password_sent_at > 2.hours.ago
    render json: { valid: true }
  else
    render json: { valid: false, error: 'Token expired or invalid' }
  end
end

# Update password with token
def update_password_with_token
  hashed_token = Digest::SHA256.hexdigest(params[:token])
  user = User.find_by(reset_password_token: hashed_token)

  if user && user.reset_password_sent_at > 2.hours.ago
    user.update!(
      password: params[:password],
      reset_password_token: nil,
      reset_password_sent_at: nil
    )
    render json: { message: 'Password updated successfully' }
  else
    render json: { error: 'Token expired' }, status: :unprocessable_entity
  end
end
```

**Why hash tokens?**
- Database breach doesn't expose valid reset links
- Tokens can't be reused if database is compromised

**Files:**
- `app/controllers/api/v1/users_controller.rb`
- `app/models/user.rb` (schema: `reset_password_token`, `reset_password_sent_at`)

---

## RULE #1.7: Portal User Separation

**Portal users (suppliers/customers) MUST be isolated from admin users.**

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

**Implementation:**
```ruby
# app/models/portal_user.rb
class PortalUser < ApplicationRecord
  belongs_to :contact
  has_secure_password

  enum portal_type: { supplier: 'supplier', customer: 'customer' }

  validates :password, length: { minimum: 12 }, if: :password_required?
  validate :password_complexity, if: :password_required?

  # Account lockout
  def lock_account!
    update!(locked_until: 30.minutes.from_now)
  end

  def record_failed_login!
    increment!(:failed_login_attempts)
    lock_account! if failed_login_attempts >= 5
  end

  def record_successful_login!
    update!(
      failed_login_attempts: 0,
      locked_until: nil,
      last_login_at: Time.current
    )
  end
end

# app/models/portal_access_log.rb
class PortalAccessLog < ApplicationRecord
  belongs_to :portal_user

  enum action_type: {
    login: 'login',
    logout: 'logout',
    view_po: 'view_po',
    download_document: 'download_document',
    make_payment: 'make_payment'
  }

  # Log format: IP, user agent, timestamp
  def self.log(portal_user:, action:, ip:, user_agent:)
    create!(
      portal_user: portal_user,
      action_type: action,
      ip_address: ip,
      user_agent: user_agent,
      occurred_at: Time.current
    )
  end
end
```

**Why separate tables?**
- Different security requirements (lockout for external, not internal)
- Different permissions (portal users see only their data)
- Easier compliance auditing (all portal activity logged)

**Files:**
- `app/models/portal_user.rb`
- `app/models/portal_access_log.rb`
- `app/controllers/api/v1/portal/authentication_controller.rb`

---

## RULE #1.8: Login Activity Tracking

**MUST track `last_login_at` on every successful login.**

✅ **MUST:**
- Update `last_login_at` timestamp on successful login
- Store in UTC timezone
- Track for both User and PortalUser
- Use for account activity monitoring

❌ **NEVER:**
- Update on token refresh (only on actual login)
- Track in local timezone
- Skip updates (used for security monitoring)

**Implementation:**
```ruby
# app/controllers/api/v1/authentication_controller.rb
def login
  user = User.find_by(email: params[:email])

  if user&.authenticate(params[:password])
    user.update!(last_login_at: Time.current)  # REQUIRED
    token = JsonWebToken.encode(user_id: user.id)
    render json: { token: token, user: user }
  else
    render json: { error: 'Invalid email or password' }, status: :unauthorized
  end
end
```

**Use cases:**
- Security: Detect dormant accounts
- Compliance: Audit user access
- UX: "Last seen" indicators

**Files:**
- `app/controllers/api/v1/authentication_controller.rb`
- `app/models/user.rb` (schema: `last_login_at`)

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

## Overview

Purchase Orders manage the complete procurement workflow from draft creation through payment tracking. Includes smart supplier/price lookup, approval workflow, schedule integration, and Xero invoice matching.

**Key Files:**
- Controller: `backend/app/controllers/api/v1/purchase_orders_controller.rb`
- Model: `backend/app/models/purchase_order.rb`
- Line Items: `backend/app/models/purchase_order_line_item.rb`
- Smart Lookup: `backend/app/services/smart_po_lookup_service.rb`

---

## RULE #8.1: PO Number Generation - Race Condition Protection

**ALWAYS use PostgreSQL advisory locks for PO number generation.**

❌ **NEVER generate PO numbers without lock**
✅ **ALWAYS use `pg_advisory_xact_lock` in transaction**

**Code location:** `PurchaseOrder#generate_purchase_order_number`

**Required implementation:**
```ruby
def generate_purchase_order_number
  ActiveRecord::Base.transaction do
    ActiveRecord::Base.connection.execute('SELECT pg_advisory_xact_lock(123456789)')

    last_po = PurchaseOrder.order(:purchase_order_number).last
    next_number = last_po ? last_po.purchase_order_number.gsub(/\D/, '').to_i + 1 : 1
    self.purchase_order_number = format('PO-%06d', next_number)
  end
end
```

**Why:** Prevents duplicate PO numbers in concurrent requests.

---

## RULE #8.2: Status State Machine

**PO status MUST follow this flow ONLY.**

❌ **NEVER skip status steps**
✅ **ALWAYS validate transitions**

**Status Flow:**
```
draft → pending → approved → sent → received → invoiced → paid
  ↘                                                         ↗
   cancelled (can cancel any non-paid status)
```

**Validation Methods:**
```ruby
def can_edit?         # Only draft/pending
def can_approve?      # Only pending
def can_cancel?       # Any except paid/cancelled
```

---

## RULE #8.3: Payment Status Calculation

**Payment status MUST be calculated, never manually set.**

❌ **NEVER set `payment_status` directly**
✅ **ALWAYS use `determine_payment_status(amount)`**

**Code location:** `PurchaseOrder#determine_payment_status`

**Logic:**
```ruby
def determine_payment_status(invoice_amount)
  return :manual_review if total.zero? || invoice_amount > total + 1
  return :pending if invoice_amount.zero?

  percentage = (invoice_amount / total) * 100
  return :complete if percentage >= 95 && percentage <= 105
  return :part_payment
end
```

**Thresholds:**
- `pending`: Invoice = $0
- `part_payment`: Invoice < 95% of total
- `complete`: Invoice 95%-105% of total (5% tolerance)
- `manual_review`: Invoice > total by $1+ OR total is $0

---

## RULE #8.4: Smart Lookup - Supplier Selection Priority

**Supplier selection MUST follow this priority order.**

❌ **NEVER randomly select supplier**
✅ **ALWAYS use SmartPoLookupService priority cascade**

**Code location:** `SmartPoLookupService#lookup`

**Priority Order:**
1. Supplier code match (e.g., WATER_TANKS)
2. Default supplier for trade category
3. Any active supplier for category
4. First active supplier (fallback)

**Price Search Cascade (6 steps):**
1. Exact match: item name + supplier + category
2. Fuzzy match: item name + supplier + category
3. Full-text search: supplier + category
4. Exact match: item name (no supplier requirement)
5. Fuzzy match: item name (no supplier requirement)
6. Full-text search: all items

---

## RULE #8.5: Line Items - Totals Calculation

**Totals MUST be recalculated before save.**

❌ **NEVER save PO without recalculating totals**
✅ **ALWAYS use `before_save` callback**

**Code location:** `PurchaseOrder#calculate_totals`

**Required callback:**
```ruby
before_save :calculate_totals

def calculate_totals
  self.sub_total = line_items.sum { |li| li.quantity * li.unit_price }
  self.tax = sub_total * 0.10  # 10% GST
  self.total = sub_total + tax
end
```

---

## RULE #8.6: Schedule Task Linking

**MUST unlink old task before linking new task.**

❌ **NEVER link without unlinking previous**
✅ **ALWAYS use transaction for task linking**

**Code location:** `PurchaseOrdersController#update`

**Required implementation:**
```ruby
ActiveRecord::Base.transaction do
  # Unlink old task
  if old_task = purchase_order.schedule_task
    old_task.update!(purchase_order_id: nil)
  end

  # Link new task
  if new_task_id.present?
    new_task = ScheduleTask.find(new_task_id)
    new_task.update!(purchase_order_id: purchase_order.id)
  end
end
```

---

## RULE #8.7: Price Drift Monitoring

**Track price drift from pricebook for warnings.**

❌ **NEVER ignore price drift**
✅ **ALWAYS calculate drift percentage**

**Code location:** `PurchaseOrderLineItem#price_drift`

**Thresholds:**
- `in_sync`: Within 10% of pricebook
- `minor_drift`: 10%-20% drift
- `major_drift`: >20% drift (show warning)

**Calculation:**
```ruby
def price_drift
  return 0 if pricebook_item.nil?
  ((unit_price - pricebook_item.price) / pricebook_item.price) * 100
end
```

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

## Overview

OneDrive integration enables automatic folder creation for each construction job and document management. Supports uploading plans, quotes, contracts, and syncing product images for the price book.

**Key Files:**
- Controller: `backend/app/controllers/api/v1/organization_onedrive_controller.rb`
- Microsoft Graph Client: `backend/app/services/microsoft_graph_client.rb`
- Model: `backend/app/models/organization_one_drive_credential.rb`

---

## RULE #12.1: Organization-Wide Authentication

**ALWAYS use organization-wide OAuth (not per-user).**

❌ **NEVER require each user to authenticate separately**
✅ **ALWAYS store single credential for entire organization**

**Code location:** `OrganizationOneDriveCredential` model

**Token Management:**
- Access tokens expire after 1 hour
- Refresh tokens valid for 90 days
- Automatic refresh when token expires
- Encrypted storage using ActiveRecord Encryption

---

## RULE #12.2: Folder Template System

**ALWAYS use Folder Templates to create job folders.**

❌ **NEVER hardcode folder names**
✅ **ALWAYS respect template customizations**

**Code location:** `FolderTemplate` model

**Default Template Structure:**
```
Trapid Jobs/
  └── [Job Number] - [Job Name]/
      ├── Plans/
      ├── Quotes/
      ├── Contracts/
      ├── Photos/
      ├── Invoices/
      └── Correspondence/
```

---

## RULE #12.3: Root Folder Management

**ALWAYS store all job folders under configurable root folder.**

❌ **NEVER create folders at OneDrive root level**
✅ **ALWAYS use `root_folder_id` from credential**

**Code location:** `MicrosoftGraphClient#create_jobs_root_folder`

**Default:** "Trapid Jobs" folder created at root
**Changeable:** Admin can browse and select different root folder

---

## RULE #12.4: Pricebook Image Sync

**Product images MUST be stored in OneDrive AND Cloudinary.**

❌ **NEVER rely solely on OneDrive for image display**
✅ **ALWAYS upload to Cloudinary after OneDrive upload**

**Workflow:**
1. User uploads image to OneDrive
2. Backend downloads from OneDrive
3. Backend uploads to Cloudinary
4. Store both `one_drive_file_id` and `image_url`

---

## RULE #12.5: File Upload Chunking

**Large files (>4MB) MUST use chunked upload.**

❌ **NEVER use simple upload for files >4MB**
✅ **ALWAYS use resumable upload session**

**Thresholds:**
- <4MB: Simple upload
- ≥4MB: Chunked upload (10MB chunks)
- Max: 250GB (OneDrive limit)

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
