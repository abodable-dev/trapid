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
- Add columns manually without creating migrations

✅ **ALWAYS:**
- Create new migration to fix issues
- Test migrations with `db:rollback`
- Add indexes for foreign keys
- Use `add_column` with default values carefully
- Create migrations for ALL schema changes (even if applied manually)

**For system-wide patterns, see:** Lexicon Chapter 0

## RULE #4: Agent Maintenance & Learning

### When an Agent Fails to Catch a Bug

✅ **MUST update agent when:**
1. Agent should have caught the issue based on its responsibilities
2. Clear pattern emerges that agent could prevent in future
3. Pre-check or validation could have detected the problem

### Agent Update Process

When a bug reveals an agent gap:

1. **Update Agent Definition** (`.claude/agents/[agent-name].md`):
   - Add specific check/validation to protocol
   - Include examples of what to look for
   - Add to pre-flight checklist

2. **Document in Lexicon** (TRAPID_LEXICON.md Chapter 0):
   - Record the bug that was missed
   - Explain why agent should have caught it
   - Reference the agent update

3. **Update Bible** (this file) if needed:
   - Only if bug reveals a new RULE
   - Add to relevant chapter

### Example: Migration Check

**Bug:** `working_days` column added manually without migration
**Agent:** deploy-manager
**Update:** Added pre-deployment check for unmigrated schema changes
**Location:** `.claude/agents/deploy-manager.md` - Pre-Deployment Checks

```bash
# Check for unmigrated local schema changes
git diff db/schema.rb
```

✅ **ALWAYS ask:** "Could an agent have prevented this?"
✅ **ALWAYS update** agent definitions when the answer is yes
❌ **NEVER** let the same class of bug happen twice

**For agent architecture, see:** Lexicon Chapter 0

## RULE #5: Documentation Authority Hierarchy

### ⚖️ Authority Order (Highest to Lowest)

When documentation conflicts arise, follow this hierarchy:

#### For Claude Code / AI Agents:

**1. TRAPID_BIBLE.md** - ABSOLUTE AUTHORITY
- **Scope:** Protected features covered by Bible chapters
- **Content:** RULES (MUST/NEVER/ALWAYS)
- **When it wins:** ALWAYS for covered features
- **Example:** "Chapter 9 says NEVER use sequence_order directly" → This rule CANNOT be broken

**2. CLAUDE.md** - META INSTRUCTIONS
- **Scope:** General AI behavior, workflow, deployment
- **Content:** How to work, when to use agents, commit style
- **When it wins:** For general behavior NOT covered by Bible
- **Defers to:** Bible for feature-specific rules
- **Example:** "Read Bible first before Gantt work" → Must follow

**3. TRAPID_LEXICON.md** - KNOWLEDGE REFERENCE
- **Scope:** Bug history, architecture explanations
- **Content:** How things work, why we chose X
- **When it wins:** NEVER (reference only, doesn't override)
- **Purpose:** Supplements Bible with context
- **Example:** "BUG-001 explains drag flicker history" → Helpful context, not a rule

#### Decision Tree for AI:

```
Question: Should I do X?

1. Is there a Bible chapter for this feature?
   YES → Read Bible chapter → Follow ALL rules
   NO  → Continue to #2

2. Does CLAUDE.md have instructions for this?
   YES → Follow CLAUDE.md
   NO  → Use best judgment

3. Is there relevant Lexicon knowledge?
   ALWAYS check for context, but don't let it override rules
```

#### For Human Developers:

**1. TRAPID_BIBLE.md** - TECHNICAL RULES
- **Scope:** Protected code patterns, critical business rules
- **When to consult:** Before modifying any feature with a Bible chapter
- **Binding:** YES - these rules prevent bugs
- **Example:** "Gantt cascade rules in Ch 9" → Must follow

**2. CONTRIBUTING.md** - DEVELOPMENT WORKFLOW
- **Scope:** Git workflow, PR process, commit style, branch strategy
- **When to consult:** When contributing code, creating PRs
- **Binding:** YES - for workflow consistency
- **Example:** "Create PR from `rob` branch" → Must follow

**3. TRAPID_LEXICON.md** - BUG HISTORY
- **Scope:** Known issues, past fixes, lessons learned
- **When to consult:** When encountering bugs or investigating issues
- **Binding:** NO (reference only)
- **Example:** "BUG-001 drag flicker history" → Learn from past

#### Decision Tree for Developers:

```
Question: How should I implement X?

1. Does X have a Bible chapter?
   YES → Read Bible chapter → Follow all rules → Check Lexicon for gotchas
   NO  → Continue to #2

2. Is this a Git/PR workflow question?
   YES → Follow CONTRIBUTING.md
   NO  → Use best judgment + code review

3. Check Lexicon for related bugs
   ALWAYS check to avoid repeating past mistakes
```

### Conflict Resolution

✅ **MUST follow these rules when documents conflict:**

1. **Bible vs Lexicon:** Bible wins (Lexicon provides context only)
2. **Bible vs CLAUDE.md:** Bible wins for features, CLAUDE.md for workflow
3. **Bible vs CONTRIBUTING.md:** Both apply (different domains)
4. **Old docs vs Trinity docs:** Trinity (TRAPID_BIBLE/LEXICON/USER_MANUAL) wins

❌ **NEVER:**
- Ignore a Bible rule because Lexicon suggests otherwise
- Follow old GANTT_BIBLE.md instead of TRAPID_BIBLE.md Chapter 9
- Override Bible rules without team discussion

### Authority Matrix

| Document | AI Agents | Developers | Users | Scope |
|----------|-----------|------------|-------|-------|
| **TRAPID_BIBLE.md** | ABSOLUTE | ABSOLUTE | N/A | Feature rules |
| **CLAUDE.md** | ABSOLUTE | Advisory | N/A | AI meta-instructions |
| **TRAPID_LEXICON.md** | Reference | Reference | N/A | Bug history |
| **TRAPID_USER_MANUAL.md** | N/A | N/A | ABSOLUTE | User guides |
| **CONTRIBUTING.md** | Advisory | ABSOLUTE | N/A | Dev workflow |

### What if Bible Doesn't Cover My Feature?

✅ **MUST:**
1. Check Lexicon for related knowledge
2. Check CONTRIBUTING.md for general patterns
3. Use best judgment
4. Create a Bible chapter if you discover critical rules
5. Document your decisions

### What if I Find a Conflict?

✅ **MUST:**
1. Note the conflict in team chat
2. File an issue to resolve it
3. Follow the higher-authority document (per hierarchy above)
4. Update the lower-authority document once conflict is resolved

### What if Bible Rule Seems Wrong?

❌ **NEVER ignore the rule**

✅ **MUST:**
1. Discuss with team
2. If rule needs changing, update Bible + version number
3. Document why rule changed in Lexicon

**For full authority documentation, see:** [00_INDEX/DOCUMENTATION_AUTHORITY.md](00_INDEX/DOCUMENTATION_AUTHORITY.md)

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

**Last Updated:** 2025-11-16

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

**Every price update MUST automatically create a PriceHistory record tracking old and new values.**

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

**Implementation:**

```ruby
# app/models/pricebook_item.rb
class PricebookItem < ApplicationRecord
  attr_accessor :skip_price_history_callback

  before_save :update_price_timestamp, if: :current_price_changed?
  after_update :track_price_change, if: :saved_change_to_current_price?

  private

  def update_price_timestamp
    self.price_last_updated_at = Time.current
  end

  def track_price_change
    return if skip_price_history_callback

    old_price = saved_changes['current_price'][0]
    new_price = saved_changes['current_price'][1]

    price_histories.create!(
      old_price: old_price,
      new_price: new_price,
      change_reason: 'manual_edit',
      supplier_id: default_supplier_id,
      changed_by_user_id: Current.user&.id,
      user_name: Current.user&.full_name,
      date_effective: Date.current
    )
  end
end
```

**Skipping History (Rare Cases):**
```ruby
# Only when bulk importing historical data
item.skip_price_history_callback = true
item.update!(current_price: 450.00)
```

**Why:** Complete price history enables volatility detection, trend analysis, and audit compliance. Never lose pricing data.

**Files:**
- `app/models/pricebook_item.rb`
- `app/models/price_history.rb`

---

## RULE #4.2: Prevent Duplicate Price History - Unique Constraint + Time Window

**Price history MUST prevent duplicate entries using both database constraint and time-window validation.**

✅ **MUST:**
- Use unique index: `(pricebook_item_id, supplier_id, new_price, created_at)`
- Add custom validation preventing entries within 5 seconds
- Handle race conditions gracefully (return existing record)
- Log duplicate attempts for monitoring

❌ **NEVER:**
- Rely only on application-level validation
- Allow duplicate price history from concurrent requests
- Fail hard on duplicate attempts (graceful degradation)

**Implementation:**

```ruby
# Migration
add_index :price_histories,
  [:pricebook_item_id, :supplier_id, :new_price, :created_at],
  unique: true,
  name: 'index_price_histories_on_unique_combination'

# Model validation
class PriceHistory < ApplicationRecord
  validate :prevent_duplicate_price_history

  private

  def prevent_duplicate_price_history
    # Check for recent identical entry (< 5 seconds ago)
    recent = PriceHistory.where(
      pricebook_item_id: pricebook_item_id,
      supplier_id: supplier_id,
      new_price: new_price
    ).where('created_at > ?', 5.seconds.ago).exists?

    if recent
      errors.add(:base, 'Duplicate price history entry within 5 seconds')
    end
  end
end
```

**Controller Handling:**
```ruby
def add_price
  @item = PricebookItem.find(params[:id])

  history = @item.price_histories.create(price_params)

  if history.persisted?
    render json: { success: true, history: history }
  elsif history.errors[:base].include?('Duplicate price history')
    # Graceful: return existing entry
    existing = @item.price_histories
      .where(new_price: params[:price])
      .order(created_at: :desc)
      .first
    render json: { success: true, history: existing, duplicate: true }
  else
    render json: { success: false, errors: history.errors.full_messages }, status: :unprocessable_entity
  end
end
```

**Why:** Concurrent PO generation can trigger simultaneous price history creation. Unique constraint prevents database corruption, time-window validation catches application-level duplicates.

**Files:**
- `app/models/price_history.rb`
- `app/controllers/api/v1/pricebook_items_controller.rb`
- Database migration

---

## RULE #4.3: SmartPoLookupService - 6-Strategy Cascading Fallback

**Smart PO lookup MUST use a 6-strategy cascade for item matching, stopping at first successful match.**

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

**Strategy Priority Order:**

1. **Exact match with supplier in category**
2. **Fuzzy (LIKE) match with supplier in category**
3. **Full-text search with supplier in category**
4. **Exact match without supplier requirement in category**
5. **Fuzzy match without supplier in category**
6. **Full-text search without supplier in category**

**Implementation:**

```ruby
# app/services/smart_po_lookup_service.rb
class SmartPoLookupService
  STRATEGIES = [
    :exact_match_with_supplier,
    :fuzzy_match_with_supplier,
    :fulltext_with_supplier,
    :exact_match_without_supplier,
    :fuzzy_match_without_supplier,
    :fulltext_without_supplier
  ].freeze

  def lookup(task_description:, category:, quantity: 1, supplier_preference: nil)
    @task_description = task_description
    @category = category.to_s.downcase
    @quantity = quantity
    @warnings = []

    # Find supplier first
    @supplier = find_supplier(supplier_preference)

    # Cascade through strategies
    @price_book_item = find_pricebook_item

    unless @price_book_item
      @warnings << "No pricebook entry found for '#{task_description}'"
    end

    build_result
  end

  private

  def find_pricebook_item
    STRATEGIES.each do |strategy|
      result = send(strategy)
      if result
        Rails.logger.info("SmartPoLookup: #{strategy} matched item #{result.id}")
        return result
      end
    end
    nil
  end

  def exact_match_with_supplier
    return nil unless @supplier

    PricebookItem.active
      .where(category: @category)
      .where(supplier_id: @supplier.id)
      .where('LOWER(item_name) = ?', @task_description.downcase)
      .first
  end

  def fuzzy_match_with_supplier
    return nil unless @supplier

    PricebookItem.active
      .where(category: @category)
      .where(supplier_id: @supplier.id)
      .where('LOWER(item_name) LIKE ?', "%#{@task_description.downcase}%")
      .first
  end

  def fulltext_with_supplier
    return nil unless @supplier

    PricebookItem.active
      .where(category: @category)
      .where(supplier_id: @supplier.id)
      .where("searchable_text @@ plainto_tsquery('english', ?)", @task_description)
      .first
  end

  def exact_match_without_supplier
    PricebookItem.active
      .where(category: @category)
      .where('LOWER(item_name) = ?', @task_description.downcase)
      .first
  end

  def fuzzy_match_without_supplier
    PricebookItem.active
      .where(category: @category)
      .where('LOWER(item_name) LIKE ?', "%#{@task_description.downcase}%")
      .first
  end

  def fulltext_without_supplier
    PricebookItem.active
      .where(category: @category)
      .where("searchable_text @@ plainto_tsquery('english', ?)", @task_description)
      .first
  end
end
```

**Why:** Cascading strategies balance precision (exact match) with recall (fuzzy/fulltext). Stopping at first match prevents ambiguity and improves performance.

**Files:**
- `app/services/smart_po_lookup_service.rb`

---

## RULE #4.4: Supplier Matching - Normalized Name Comparison with Business Suffix Removal

**Supplier matching MUST normalize names by removing common business suffixes before comparison.**

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

**Normalization Algorithm:**

```ruby
# app/services/supplier_matcher.rb
class SupplierMatcher
  BUSINESS_SUFFIXES = [
    'pty ltd', 'pty. ltd.', 'limited', 'ltd', 'ltd.',
    'incorporated', 'inc', 'inc.',
    'corporation', 'corp', 'corp.',
    'company', 'co', 'co.',
    'services', 'service',
    'group',
    'australia', 'australian',
    'queensland', 'qld',
    '& associates', '& sons'
  ].freeze

  def normalize_name(name)
    normalized = name.to_s.downcase.strip

    # Remove business suffixes
    BUSINESS_SUFFIXES.each do |suffix|
      normalized = normalized.gsub(/\b#{Regexp.escape(suffix)}\b/, '')
    end

    # Remove special characters and collapse spaces
    normalized.gsub(/[^a-z0-9\s]/, ' ').squeeze(' ').strip
  end

  def find_match(supplier_name)
    normalized_search = normalize_name(supplier_name)

    contacts = Contact.where(contact_types: ['supplier']).active

    best_match = nil
    best_score = 0.0

    contacts.each do |contact|
      normalized_contact = normalize_name(contact.full_name)
      score = similarity_score(normalized_search, normalized_contact)

      if score > best_score
        best_score = score
        best_match = contact
      end
    end

    {
      contact: best_match,
      score: best_score,
      match_type: categorize_match(best_score)
    }
  end

  private

  def similarity_score(str1, str2)
    return 1.0 if str1 == str2
    return 0.0 if str1.empty? || str2.empty?

    distance = levenshtein_distance(str1, str2)
    max_length = [str1.length, str2.length].max

    1.0 - (distance.to_f / max_length)
  end

  def categorize_match(score)
    case score
    when 1.0        then :exact
    when 0.9..0.99  then :high
    when 0.7..0.89  then :fuzzy
    else                 :unmatched
    end
  end

  def levenshtein_distance(s1, s2)
    # Dynamic programming algorithm
    matrix = Array.new(s1.length + 1) { Array.new(s2.length + 1) }

    (0..s1.length).each { |i| matrix[i][0] = i }
    (0..s2.length).each { |j| matrix[0][j] = j }

    (1..s1.length).each do |i|
      (1..s2.length).each do |j|
        cost = s1[i - 1] == s2[j - 1] ? 0 : 1
        matrix[i][j] = [
          matrix[i - 1][j] + 1,      # deletion
          matrix[i][j - 1] + 1,      # insertion
          matrix[i - 1][j - 1] + cost # substitution
        ].min
      end
    end

    matrix[s1.length][s2.length]
  end
end
```

**Example Normalizations:**
```
"Water Supplies Pty Ltd" → "water supplies"
"ABC Electrical Services Queensland" → "abc electrical"
"Smith & Associates Inc." → "smith"
```

**Why:** Business suffixes add noise to name matching. "ABC Company" and "ABC Co Pty Ltd" are the same supplier - normalization ensures correct matching.

**Files:**
- `app/services/supplier_matcher.rb`

---

## RULE #4.5: Price Volatility Detection - Coefficient of Variation on 6-Month Window

**Price volatility MUST be calculated using Coefficient of Variation (CV) on the last 6 months of price history.**

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

**Implementation:**

```ruby
# app/models/pricebook_item.rb
class PricebookItem < ApplicationRecord
  def price_volatility
    # Get last 6 months of price history
    recent_prices = price_histories
      .where('created_at >= ?', 6.months.ago)
      .order(created_at: :desc)
      .pluck(:new_price)
      .compact

    return { status: 'unknown', cv: nil, risk_score: 10 } if recent_prices.length < 3

    # Calculate mean
    mean = recent_prices.sum / recent_prices.length.to_f

    # Calculate standard deviation
    variance = recent_prices.map { |p| (p - mean) ** 2 }.sum / recent_prices.length.to_f
    std_dev = Math.sqrt(variance)

    # Coefficient of Variation
    cv = (std_dev / mean) * 100

    # Classify volatility
    status = case cv
      when 0..4.99    then 'stable'
      when 5..14.99   then 'moderate'
      else                 'volatile'
    end

    # Risk score (0-50)
    risk_score = case status
      when 'stable'   then 0
      when 'moderate' then 25
      when 'volatile' then 50
      else                 10  # unknown
    end

    { status: status, cv: cv.round(2), risk_score: risk_score }
  end
end
```

**Example Calculations:**
```ruby
# Stable pricing
prices = [100, 103, 102, 105, 104]
mean = 102.8, std_dev = 1.92, CV = 1.87% → "stable"

# Volatile pricing
prices = [100, 150, 80, 160, 90]
mean = 116, std_dev = 35.8, CV = 30.9% → "volatile"
```

**Why:** CV provides scale-independent volatility measure - 5% variance matters differently for $10 vs $1000 items. Rolling 6-month window balances recency with statistical validity.

**Files:**
- `app/models/pricebook_item.rb`

---

## RULE #4.6: Risk Scoring - Multi-Factor Weighted Calculation (0-100 Scale)

**Risk score MUST combine 4 weighted factors: price freshness (40%), supplier reliability (20%), volatility (20%), missing data (20%).**

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

**Risk Components:**

```ruby
# app/models/pricebook_item.rb
class PricebookItem < ApplicationRecord
  def risk_score
    Rails.cache.fetch("pricebook_item:#{id}:risk_score", expires_in: 1.hour) do
      calculate_risk_score
    end
  end

  private

  def calculate_risk_score
    # Component 1: Price Freshness (0-40 points)
    freshness_score = case price_freshness_status
      when 'fresh'               then 0
      when 'needs_confirmation'  then 20
      when 'outdated', 'unknown' then 40
      when 'missing'             then 40
      else                            20
    end

    # Component 2: Supplier Reliability (0-20 points - inverse)
    reliability_score = if supplier
      # Higher supplier metrics = lower risk
      supplier_score = (supplier.rating.to_f * 8) +           # 0-40
                       (supplier.response_rate.to_f * 0.3) +  # 0-30
                       ([30, 30 - (supplier.avg_response_time.to_f / 2)].min) # 0-30

      # Convert 0-100 to 0-20 (inverse: high score = low risk)
      20 - (supplier_score / 5.0)
    else
      20  # No supplier = max risk
    end

    # Component 3: Price Volatility (0-20 points)
    volatility_data = price_volatility
    volatility_score = volatility_data[:risk_score] * 0.4  # Scale 0-50 to 0-20

    # Component 4: Missing Information (0-20 points)
    missing_score = 0
    missing_score += 10 if supplier_id.nil?
    missing_score += 7  if brand.blank?
    missing_score += 3  if category.blank?

    # Total (0-100)
    total = freshness_score +
            reliability_score.clamp(0, 20) +
            volatility_score +
            missing_score

    # Determine level
    level = case total
      when 0..24   then 'low'
      when 25..49  then 'medium'
      when 50..74  then 'high'
      else              'critical'
    end

    {
      score: total.round,
      level: level,
      components: {
        freshness: freshness_score,
        reliability: reliability_score.round,
        volatility: volatility_score.round,
        missing: missing_score
      }
    }
  end
end
```

**Database Filtering (Efficient):**

```ruby
# app/models/pricebook_item.rb
scope :by_risk_level, ->(level) {
  case level
  when 'critical'
    # No price OR price >6 months old
    where('current_price IS NULL OR current_price = 0 OR price_last_updated_at < ?', 6.months.ago)
  when 'high'
    # 3-6 months old
    where('price_last_updated_at >= ? AND price_last_updated_at < ?', 6.months.ago, 3.months.ago)
  when 'medium'
    # <3 months BUT missing supplier/brand/category
    where('price_last_updated_at >= ?', 3.months.ago)
      .where('supplier_id IS NULL OR brand IS NULL OR category IS NULL')
  when 'low'
    # Recent price AND has supplier
    where('price_last_updated_at >= ? AND supplier_id IS NOT NULL', 3.months.ago)
  end
}
```

**Why:** Multi-factor risk assessment provides actionable insights. Weighted components reflect business priorities (stale pricing is highest risk).

**Files:**
- `app/models/pricebook_item.rb`

---

## RULE #4.7: Bulk Updates - Transaction Wrapper with Price History Batch Creation

**Bulk pricebook updates MUST be wrapped in database transaction with efficient price history batch creation.**

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

**Implementation:**

```ruby
# app/controllers/api/v1/pricebook_items_controller.rb
def bulk_update
  updates = params[:updates] || []
  results = { success: [], failed: [], price_histories_created: 0 }

  ActiveRecord::Base.transaction do
    price_histories_batch = []

    updates.each do |update_params|
      item = PricebookItem.find_by(id: update_params[:id])

      unless item
        results[:failed] << { id: update_params[:id], error: 'Item not found' }
        next
      end

      # Track price change for history
      old_price = item.current_price
      new_price = update_params[:current_price]

      # Skip auto price history creation
      item.skip_price_history_callback = true

      # Update item
      if item.update(update_params.except(:id, :create_or_update_price, :new_price))
        results[:success] << { id: item.id, item_code: item.item_code }

        # Prepare price history for batch insert
        if new_price && new_price != old_price
          price_histories_batch << {
            pricebook_item_id: item.id,
            old_price: old_price,
            new_price: new_price,
            change_reason: 'bulk_update',
            supplier_id: item.default_supplier_id,
            changed_by_user_id: current_user.id,
            user_name: current_user.full_name,
            date_effective: Date.current,
            created_at: Time.current,
            updated_at: Time.current
          }
        end
      else
        results[:failed] << {
          id: item.id,
          item_code: item.item_code,
          errors: item.errors.full_messages
        }
        raise ActiveRecord::Rollback
      end
    end

    # Batch insert price histories
    if price_histories_batch.any?
      PriceHistory.insert_all!(price_histories_batch)
      results[:price_histories_created] = price_histories_batch.length
    end

    # Commit transaction (implicit)
  end

  render json: {
    success: true,
    updated_count: results[:success].length,
    failed_count: results[:failed].length,
    price_histories_created: results[:price_histories_created],
    results: results
  }
rescue ActiveRecord::Rollback
  render json: {
    success: false,
    error: 'Bulk update failed - all changes rolled back',
    results: results
  }, status: :unprocessable_entity
end
```

**Performance Comparison:**
```
Individual Updates (100 items):
- 100 UPDATE queries
- 100 INSERT queries (price history)
= 200 queries, ~5 seconds

Bulk Update with Transaction:
- 100 UPDATE queries
- 1 INSERT query (batch)
= 101 queries, ~1 second
```

**Why:** Transactions ensure all-or-nothing semantics. Batch inserts reduce database round-trips from N to 1, improving performance 5x for large updates.

**Files:**
- `app/controllers/api/v1/pricebook_items_controller.rb`

---

## RULE #4.8: OneDrive Image Proxy - Cache Control with 1-Hour Expiry

**OneDrive file proxying MUST set Cache-Control header to prevent repeated downloads.**

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

**Implementation:**

```ruby
# app/controllers/api/v1/pricebook_items_controller.rb
def proxy_image
  @item = PricebookItem.find(params[:id])
  file_type = params[:file_type] # 'image', 'spec', or 'qr_code'

  file_id = case file_type
    when 'image'    then @item.image_file_id
    when 'spec'     then @item.spec_file_id
    when 'qr_code'  then @item.qr_code_file_id
  end

  unless file_id
    render json: { error: 'File not found' }, status: :not_found
    return
  end

  # Get OneDrive credential
  credential = OrganizationOneDriveCredential.active.first
  unless credential
    render json: { error: 'OneDrive not configured' }, status: :service_unavailable
    return
  end

  # Fetch file content from OneDrive
  graph_client = MicrosoftGraphClient.new(credential)

  begin
    file_content = graph_client.download_file(file_id)
    file_metadata = graph_client.get_file_metadata(file_id)

    # Determine Content-Type
    content_type = file_metadata['file']['mimeType'] || 'application/octet-stream'

    # Send file with caching
    send_data file_content,
      type: content_type,
      disposition: 'inline',
      cache_control: 'public, max-age=3600'  # 1 hour cache

  rescue MicrosoftGraphClient::FileNotFoundError
    render json: { error: 'File not found in OneDrive' }, status: :not_found
  rescue MicrosoftGraphClient::AuthenticationError
    render json: { error: 'OneDrive credential expired' }, status: :service_unavailable
  end
end
```

**Route:**
```ruby
get 'pricebook/:id/proxy_image/:file_type', to: 'pricebook_items#proxy_image'
```

**Why:** OneDrive URLs expire after 1 hour, breaking client-side caching. Proxying with stable URLs + Cache-Control provides reliable image access while respecting credential lifespan.

**Files:**
- `app/controllers/api/v1/pricebook_items_controller.rb`
- Routes

---

## API Endpoints Reference

### Pricebook Items
```
GET    /api/v1/pricebook?search=&category=&supplier_id=&risk_level=&page=1&limit=100
GET    /api/v1/pricebook/:id
POST   /api/v1/pricebook
PATCH  /api/v1/pricebook/:id
DELETE /api/v1/pricebook/:id (soft delete)

PATCH  /api/v1/pricebook/bulk_update
POST   /api/v1/pricebook/:id/add_price
POST   /api/v1/pricebook/:id/set_default_supplier
GET    /api/v1/pricebook/:id/proxy_image/:file_type

POST   /api/v1/pricebook/import
POST   /api/v1/pricebook/preview
POST   /api/v1/pricebook/import_price_history
GET    /api/v1/pricebook/price_health_check
```

### Suppliers
```
GET    /api/v1/suppliers?active=true&match_status=matched
GET    /api/v1/suppliers/:id
POST   /api/v1/suppliers
PATCH  /api/v1/suppliers/:id
DELETE /api/v1/suppliers/:id (soft delete)

POST   /api/v1/suppliers/:id/link_contact
POST   /api/v1/suppliers/:id/unlink_contact
POST   /api/v1/suppliers/:id/verify_match
POST   /api/v1/suppliers/auto_match

GET    /api/v1/suppliers/:id/pricebook/export
POST   /api/v1/suppliers/:id/pricebook/import
```

---

# Chapter 5: Jobs & Construction Management

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 5                │
│ 📘 USER MANUAL (HOW): Chapter 5                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

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

**Construction records MUST have at least one associated contact.**

✅ **MUST:**
- Validate `must_have_at_least_one_contact` on update
- Allow creation without contacts (initial save)
- Require at least one contact before job can be used
- Show validation error if all contacts removed

❌ **NEVER:**
- Allow Construction to exist without contacts after initial creation
- Skip contact validation on updates
- Delete all contacts without replacement

**Implementation:**

```ruby
# app/models/construction.rb
class Construction < ApplicationRecord
  has_many :construction_contacts, dependent: :destroy
  has_many :contacts, through: :construction_contacts

  validates :title, presence: true
  validates :status, presence: true
  validates :site_supervisor_name, presence: true
  validate :must_have_at_least_one_contact, on: :update

  private

  def must_have_at_least_one_contact
    if construction_contacts.empty?
      errors.add(:base, 'Construction must have at least one contact')
    end
  end
end
```

**Why:** Every construction job needs contact information for communication, PO delivery, and project coordination.

**Files:**
- `app/models/construction.rb`
- `app/models/construction_contact.rb`

---

## RULE #5.2: Live Profit Calculation - Dynamic Not Cached

**Live profit MUST be calculated dynamically, NEVER cached in database.**

✅ **MUST:**
- Calculate `live_profit = contract_value - sum(all_purchase_orders.total)`
- Recalculate `profit_percentage = (live_profit / contract_value) * 100`
- Use `calculate_live_profit` and `calculate_profit_percentage` methods
- Return calculated values in API responses

❌ **NEVER:**
- Store live_profit or profit_percentage in database
- Cache profit values (they change with every PO update)
- Use stale profit calculations

**Implementation:**

```ruby
# app/models/construction.rb
class Construction < ApplicationRecord
  has_many :purchase_orders

  def calculate_live_profit
    return 0 if contract_value.nil?

    total_po_cost = purchase_orders.sum(:total) || 0
    contract_value - total_po_cost
  end

  def calculate_profit_percentage
    return 0 if contract_value.nil? || contract_value.zero?

    (calculate_live_profit / contract_value) * 100
  end
end
```

**API Response:**
```ruby
# app/controllers/api/v1/constructions_controller.rb
def show
  @construction = Construction.find(params[:id])
  render json: @construction.as_json.merge(
    live_profit: @construction.calculate_live_profit,
    profit_percentage: @construction.calculate_profit_percentage
  )
end
```

**Why:** Profit changes with every PO created/updated/deleted. Dynamic calculation ensures accuracy.

**Files:**
- `app/models/construction.rb`
- `app/controllers/api/v1/constructions_controller.rb`

---

## RULE #5.3: Task Dependencies - No Circular References

**Task dependencies MUST NOT create circular references.**

✅ **MUST:**
- Validate `no_circular_dependencies` before saving TaskDependency
- Use graph traversal (BFS) to detect cycles
- Check entire predecessor chain for successor_task
- Reject dependency if circular reference detected

❌ **NEVER:**
- Allow Task A → B → C → A chains
- Skip circular dependency validation
- Allow self-dependencies (task depending on itself)

**Implementation:**

```ruby
# app/models/task_dependency.rb
class TaskDependency < ApplicationRecord
  belongs_to :successor_task, class_name: 'ProjectTask'
  belongs_to :predecessor_task, class_name: 'ProjectTask'

  validate :no_circular_dependencies
  validate :no_self_dependency
  validate :same_project_tasks

  private

  def no_circular_dependencies
    return if creates_circular_dependency? == false

    errors.add(:base, 'Cannot create circular dependency')
  end

  def no_self_dependency
    if successor_task_id == predecessor_task_id
      errors.add(:base, 'Task cannot depend on itself')
    end
  end

  def same_project_tasks
    if successor_task && predecessor_task &&
       successor_task.project_id != predecessor_task.project_id
      errors.add(:base, 'Both tasks must belong to the same project')
    end
  end

  def creates_circular_dependency?
    # BFS to find all predecessors of predecessor_task
    visited = Set.new
    queue = [predecessor_task_id]

    while queue.any?
      current_id = queue.shift
      next if visited.include?(current_id)

      visited.add(current_id)

      # If we find successor_task in the chain, it's circular
      return true if current_id == successor_task_id

      # Add all predecessors of current task to queue
      TaskDependency.where(successor_task_id: current_id).pluck(:predecessor_task_id).each do |pred_id|
        queue << pred_id unless visited.include?(pred_id)
      end
    end

    false
  end
end
```

**Why:** Circular dependencies break cascade calculations and make schedule impossible to resolve.

**Files:**
- `app/models/task_dependency.rb`

---

## RULE #5.4: Task Status Transitions - Automatic Date Setting

**Task status transitions MUST automatically update actual dates.**

✅ **MUST:**
- Set `actual_start_date = Date.current` when status → `in_progress` (if nil)
- Set `actual_end_date = Date.current` when status → `complete`
- Set `progress_percentage = 100` when status → `complete`
- Use `before_save :update_actual_dates` callback

❌ **NEVER:**
- Allow `complete` status without actual_end_date
- Allow `in_progress` without actual_start_date
- Manually set these dates in controller

**Implementation:**

```ruby
# app/models/project_task.rb
class ProjectTask < ApplicationRecord
  before_save :update_actual_dates

  private

  def update_actual_dates
    if status_changed?
      case status
      when 'in_progress'
        self.actual_start_date ||= Date.current
      when 'complete'
        self.actual_end_date = Date.current
        self.progress_percentage = 100
      end
    end
  end
end
```

**Why:** Automatic date tracking ensures accurate timeline tracking without manual input.

**Files:**
- `app/models/project_task.rb`

---

## RULE #5.5: Task Spawning - Status-Based Child Task Creation

**Child tasks (photos, certificates, subtasks) MUST be spawned automatically based on parent task status.**

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

**Implementation:**

```ruby
# app/models/project_task.rb
class ProjectTask < ApplicationRecord
  after_save :spawn_child_tasks_on_status_change

  private

  def spawn_child_tasks_on_status_change
    return unless saved_change_to_status?
    return unless schedule_template_row.present?

    spawner = Schedule::TaskSpawner.new(self)

    case status
    when 'in_progress'
      spawner.spawn_subtasks if schedule_template_row.has_subtasks?
    when 'complete'
      spawner.spawn_photo_task if schedule_template_row.require_photo?
      spawner.spawn_certificate_task if schedule_template_row.require_certificate?
    end
  end
end
```

**TaskSpawner Service:**
```ruby
# app/services/schedule/task_spawner.rb
class Schedule::TaskSpawner
  def initialize(parent_task)
    @parent_task = parent_task
  end

  def spawn_photo_task
    ProjectTask.create!(
      project: @parent_task.project,
      name: "Photo - #{@parent_task.name}",
      spawned_type: 'photo',
      parent_task: @parent_task,
      category: 'photo',
      task_type: 'documentation',
      status: 'not_started',
      duration_days: 0,
      planned_start_date: @parent_task.actual_end_date,
      planned_end_date: @parent_task.actual_end_date
    )
  end

  def spawn_certificate_task
    lag_days = @parent_task.schedule_template_row&.cert_lag_days || 10

    ProjectTask.create!(
      project: @parent_task.project,
      name: "Certificate - #{@parent_task.name}",
      spawned_type: 'certificate',
      parent_task: @parent_task,
      category: 'certificate',
      task_type: 'documentation',
      status: 'not_started',
      duration_days: 0,
      planned_start_date: @parent_task.actual_end_date + lag_days.days,
      planned_end_date: @parent_task.actual_end_date + lag_days.days
    )
  end

  def spawn_subtasks
    subtask_list = @parent_task.schedule_template_row.subtask_list || []

    subtask_list.each_with_index do |subtask_name, index|
      ProjectTask.create!(
        project: @parent_task.project,
        name: subtask_name,
        spawned_type: 'subtask',
        parent_task: @parent_task,
        category: @parent_task.category,
        task_type: @parent_task.task_type,
        supplier_name: @parent_task.supplier_name,
        status: 'not_started',
        duration_days: 1,
        sequence_order: (@parent_task.sequence_order || 0) + index + 1,
        planned_start_date: @parent_task.planned_start_date,
        planned_end_date: @parent_task.planned_start_date + 1.day
      )
    end
  end
end
```

**Why:** Automatic task spawning ensures required documentation and subtasks are tracked without manual creation.

**Files:**
- `app/models/project_task.rb`
- `app/services/schedule/task_spawner.rb`

---

## RULE #5.6: Schedule Cascade - Dependency-Based Date Propagation

**When a task's dates or duration change, dependent task dates MUST cascade automatically.**

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

**Implementation:**

```ruby
# app/services/schedule_cascade_service.rb
class ScheduleCascadeService
  def initialize(changed_task)
    @changed_task = changed_task
    @project = changed_task.project
    @timezone = CompanySetting.timezone || 'UTC'
  end

  def cascade!
    # Find all tasks that depend on this task
    dependent_tasks = TaskDependency
      .where(predecessor_task_id: @changed_task.id)
      .includes(:successor_task)
      .map(&:successor_task)

    dependent_tasks.each do |task|
      next if task.manually_positioned? # Skip user-set dates

      recalculate_task_dates(task)
      task.save!

      # Recursively cascade to downstream tasks
      ScheduleCascadeService.new(task).cascade!
    end
  end

  private

  def recalculate_task_dates(task)
    # Find all dependencies for this task
    dependencies = TaskDependency.where(successor_task_id: task.id).includes(:predecessor_task)

    # Calculate start date based on all predecessors
    earliest_start = dependencies.map do |dep|
      calculate_start_based_on_dependency(dep)
    end.compact.max || @project.start_date

    task.planned_start_date = earliest_start
    task.planned_end_date = earliest_start + task.duration_days.days
  end

  def calculate_start_based_on_dependency(dependency)
    pred_task = dependency.predecessor_task
    lag = dependency.lag_days || 0

    case dependency.dependency_type
    when 'finish_to_start'
      pred_task.planned_end_date + lag.days
    when 'start_to_start'
      pred_task.planned_start_date + lag.days
    when 'finish_to_finish'
      pred_task.planned_end_date - dependency.successor_task.duration_days.days + lag.days
    when 'start_to_finish'
      pred_task.planned_start_date + lag.days
    end
  end
end
```

**Trigger:**
```ruby
# app/models/project_task.rb
class ProjectTask < ApplicationRecord
  after_save :cascade_date_changes, if: :should_cascade?

  private

  def should_cascade?
    saved_change_to_planned_start_date? ||
    saved_change_to_planned_end_date? ||
    saved_change_to_duration_days?
  end

  def cascade_date_changes
    ScheduleCascadeService.new(self).cascade!
  end
end
```

**Why:** Cascading ensures schedule stays coherent when tasks are delayed or accelerated.

**Files:**
- `app/services/schedule_cascade_service.rb`
- `app/models/project_task.rb`

---

## RULE #5.7: OneDrive Folder Creation - Async with Status Tracking

**OneDrive folder creation MUST be asynchronous with proper status tracking.**

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

**Implementation:**

```ruby
# app/controllers/api/v1/constructions_controller.rb
class Api::V1::ConstructionsController < ApplicationController
  def create
    @construction = Construction.new(construction_params)

    if @construction.save
      folder_creation_enqueued = false

      if params[:create_onedrive_folders] && params[:template_id]
        @construction.update(onedrive_folder_creation_status: :pending)
        CreateJobFoldersJob.perform_later(@construction.id, params[:template_id])
        folder_creation_enqueued = true
      end

      render json: @construction.as_json.merge(
        folder_creation_enqueued: folder_creation_enqueued
      ), status: :created
    else
      render json: { errors: @construction.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
```

**Background Job:**
```ruby
# app/jobs/create_job_folders_job.rb
class CreateJobFoldersJob < ApplicationJob
  queue_as :default

  retry_on MicrosoftGraphClient::APIError, wait: :exponentially_longer, attempts: 3
  retry_on MicrosoftGraphClient::AuthenticationError, wait: 5.seconds, attempts: 2

  def perform(construction_id, template_id)
    construction = Construction.find(construction_id)

    # Update status to processing
    construction.update!(onedrive_folder_creation_status: :processing)

    # Get credential and template
    credential = OrganizationOneDriveCredential.active.first
    template = FolderTemplate.find(template_id)

    # Check if folders already exist (idempotent)
    graph_client = MicrosoftGraphClient.new(credential)
    existing_folder = graph_client.find_folder_by_name(construction.title)

    if existing_folder
      construction.update!(
        onedrive_folder_creation_status: :completed,
        onedrive_folders_created_at: Time.current
      )
      return
    end

    # Create folder structure
    root_folder = graph_client.create_folder(construction.title)
    template.folder_structure.each do |subfolder|
      graph_client.create_folder(subfolder['name'], parent_id: root_folder['id'])
    end

    # Mark as completed
    construction.update!(
      onedrive_folder_creation_status: :completed,
      onedrive_folders_created_at: Time.current
    )
  rescue StandardError => e
    construction.update!(onedrive_folder_creation_status: :failed)
    raise e
  end
end
```

**Status Enum:**
```ruby
# app/models/construction.rb
class Construction < ApplicationRecord
  enum onedrive_folder_creation_status: {
    not_requested: 0,
    pending: 1,
    processing: 2,
    completed: 3,
    failed: 4
  }
end
```

**Why:** Folder creation can take 5-10 seconds. Async processing prevents blocking API requests and provides better UX.

**Files:**
- `app/jobs/create_job_folders_job.rb`
- `app/controllers/api/v1/constructions_controller.rb`
- `app/models/construction.rb`

---

## RULE #5.8: Schedule Template Instantiation - All-or-Nothing Transaction

**Schedule template instantiation MUST be wrapped in a transaction.**

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

**Implementation:**

```ruby
# app/services/schedule/template_instantiator.rb
class Schedule::TemplateInstantiator
  def initialize(project:, template:)
    @project = project
    @template = template
    @task_map = {} # Maps template_row_id → created ProjectTask
  end

  def call
    ActiveRecord::Base.transaction do
      create_tasks_from_template
      create_dependencies
      calculate_dates_forward_pass
      create_auto_purchase_orders
      update_project_dates

      { success: true, tasks: @task_map.values }
    end
  rescue StandardError => e
    { success: false, errors: [e.message] }
  end

  private

  def create_tasks_from_template
    @template.schedule_template_rows.order(:sequence_order).each do |row|
      task = ProjectTask.create!(
        project: @project,
        name: row.task_name,
        task_type: row.task_type,
        category: row.category,
        duration_days: row.duration_days,
        sequence_order: row.sequence_order,
        schedule_template_row: row,
        status: 'not_started',
        is_milestone: row.is_milestone,
        is_critical_path: row.is_critical_path
      )

      @task_map[row.id] = task
    end
  end

  def create_dependencies
    @template.schedule_template_rows.each do |row|
      next if row.predecessors.blank?

      row.predecessors.each do |pred_config|
        predecessor_task = @task_map[pred_config['template_row_id']]
        successor_task = @task_map[row.id]

        TaskDependency.create!(
          predecessor_task: predecessor_task,
          successor_task: successor_task,
          dependency_type: pred_config['type'] || 'finish_to_start',
          lag_days: pred_config['lag_days'] || 0
        )
      end
    end
  end

  def calculate_dates_forward_pass
    # Forward pass algorithm to calculate all task dates
    # ... (implementation details)
  end

  def create_auto_purchase_orders
    # Create POs for tasks marked with creates_schedule_tasks
    # ... (implementation details)
  end

  def update_project_dates
    earliest_start = @task_map.values.map(&:planned_start_date).compact.min
    latest_end = @task_map.values.map(&:planned_end_date).compact.max

    @project.update!(
      start_date: earliest_start,
      planned_end_date: latest_end
    )
  end
end
```

**Why:** Template instantiation creates dozens of interrelated records. Transaction ensures schedule is complete or doesn't exist.

**Files:**
- `app/services/schedule/template_instantiator.rb`

---

## API Endpoints Reference

### Constructions
```
GET    /api/v1/constructions
POST   /api/v1/constructions
GET    /api/v1/constructions/:id
PATCH  /api/v1/constructions/:id
DELETE /api/v1/constructions/:id
GET    /api/v1/constructions/:id/saved_messages
GET    /api/v1/constructions/:id/emails
GET    /api/v1/constructions/:id/documentation_tabs
```

### Projects
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id
GET    /api/v1/projects/:id/gantt
```

### Project Tasks
```
GET    /api/v1/projects/:project_id/tasks
POST   /api/v1/projects/:project_id/tasks
GET    /api/v1/projects/:project_id/tasks/:id
PATCH  /api/v1/projects/:project_id/tasks/:id
DELETE /api/v1/projects/:project_id/tasks/:id
POST   /api/v1/projects/:project_id/tasks/:id/auto_complete_subtasks
```

---

# Chapter 6: Estimates & Quoting

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 6                │
│ 📘 USER MANUAL (HOW): Chapter 6                │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

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

**Job matching MUST use three distinct confidence thresholds with specific actions.**

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

**Implementation:**

```ruby
# app/services/job_matcher_service.rb
class JobMatcherService
  AUTO_MATCH_THRESHOLD = 70.0
  SUGGEST_THRESHOLD = 50.0

  def initialize(job_name_from_estimate)
    @job_name = job_name_from_estimate
    @normalized_search = normalize_string(job_name)
  end

  def call
    matches = Construction.all.map do |construction|
      {
        construction: construction,
        score: calculate_similarity_score(construction.title)
      }
    end.sort_by { |m| -m[:score] }

    best_match = matches.first

    if best_match[:score] >= AUTO_MATCH_THRESHOLD
      {
        success: true,
        status: :auto_matched,
        matched_job: {
          id: best_match[:construction].id,
          title: best_match[:construction].title,
          confidence_score: best_match[:score]
        }
      }
    elsif best_match[:score] >= SUGGEST_THRESHOLD
      {
        success: true,
        status: :suggest_candidates,
        candidate_jobs: matches.first(5).select { |m| m[:score] >= SUGGEST_THRESHOLD }
      }
    else
      {
        success: true,
        status: :no_match,
        job_name_searched: @job_name
      }
    end
  end

  private

  def calculate_similarity_score(construction_title)
    normalized_title = normalize_string(construction_title)

    # Base: Levenshtein distance
    distance = levenshtein_distance(@normalized_search, normalized_title)
    max_length = [@normalized_search.length, normalized_title.length].max
    base_score = (1.0 - (distance.to_f / max_length)) * 100

    # Bonus: Substring match
    if normalized_title.include?(@normalized_search) || @normalized_search.include?(normalized_title)
      base_score += 20
    end

    # Bonus: Word matching
    search_words = @normalized_search.split
    title_words = normalized_title.split
    matching_words = (search_words & title_words).length
    base_score += (matching_words * 15)

    # Cap at 99% (never 100% unless exact)
    [base_score, 99.0].min.round(1)
  end

  def normalize_string(str)
    str.downcase.strip.gsub(/[^a-z0-9\s]/, '').squeeze(' ')
  end

  def levenshtein_distance(s1, s2)
    # Dynamic programming algorithm
    matrix = Array.new(s1.length + 1) { Array.new(s2.length + 1) }

    (0..s1.length).each { |i| matrix[i][0] = i }
    (0..s2.length).each { |j| matrix[0][j] = j }

    (1..s1.length).each do |i|
      (1..s2.length).each do |j|
        cost = s1[i - 1] == s2[j - 1] ? 0 : 1
        matrix[i][j] = [
          matrix[i - 1][j] + 1,      # deletion
          matrix[i][j - 1] + 1,      # insertion
          matrix[i - 1][j - 1] + cost # substitution
        ].min
      end
    end

    matrix[s1.length][s2.length]
  end
end
```

**Example Matches:**
- "Malbon Residence" vs "The Malbon Residence - 123 Main St" → **85%** (auto-match)
- "Smith Project" vs "Smith Custom Build" → **62%** (suggest)
- "Jones House" vs "Acme Commercial Building" → **15%** (no match)

**Why:** Three-tier system balances automation with safety - auto-match only when confident, suggest when ambiguous, defer to user when uncertain.

**Files:**
- `app/services/job_matcher_service.rb`
- `app/controllers/api/v1/external/unreal_estimates_controller.rb`

---

## RULE #6.2: External API Key Security - SHA256 Hashing Only

**API keys MUST NEVER be stored in plaintext. Use SHA256 hashing.**

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

**Implementation:**

```ruby
# app/models/external_integration.rb
class ExternalIntegration < ApplicationRecord
  validates :name, presence: true
  validates :api_key_digest, presence: true

  def self.authenticate(api_key)
    digest = Digest::SHA256.hexdigest(api_key)
    integration = find_by(api_key_digest: digest, active: true)

    if integration
      integration.touch(:last_used_at)  # Track usage
      integration
    else
      nil
    end
  end

  def generate_api_key
    # Generate secure random key
    new_key = SecureRandom.hex(32)

    # Store digest only
    self.api_key_digest = Digest::SHA256.hexdigest(new_key)
    save!

    # Return plaintext ONCE for user to save
    new_key
  end
end
```

**Controller Authentication:**
```ruby
# app/controllers/api/v1/external/unreal_estimates_controller.rb
class Api::V1::External::UnrealEstimatesController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_api_key

  private

  def authenticate_api_key
    api_key = request.headers['X-API-Key']

    unless api_key
      render json: { error: 'Missing X-API-Key header' }, status: :unauthorized
      return
    end

    @integration = ExternalIntegration.authenticate(api_key)

    unless @integration
      render json: { error: 'Invalid or inactive API key' }, status: :unauthorized
      return
    end
  end
end
```

**Database Schema:**
```ruby
create_table :external_integrations do |t|
  t.string :name, null: false
  t.string :api_key_digest, null: false  # SHA256 hash
  t.boolean :active, default: true
  t.datetime :last_used_at
  t.timestamps
end
```

**Key Generation Workflow:**
1. Admin generates key via console or UI
2. System shows plaintext key ONCE
3. Admin copies key to Unreal Engine config
4. System stores SHA256 digest only
5. Future requests hash incoming key and compare digests

**Why:** One-way hashing prevents key exposure even if database is compromised. SHA256 is fast for validation but computationally infeasible to reverse.

**Files:**
- `app/models/external_integration.rb`
- `app/controllers/api/v1/external/unreal_estimates_controller.rb`

---

## RULE #6.3: Estimate Import - Validate Before Auto-Matching

**Estimate import MUST validate data before attempting job matching.**

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

**Implementation:**

```ruby
# app/controllers/api/v1/external/unreal_estimates_controller.rb
class Api::V1::External::UnrealEstimatesController < ApplicationController
  def create
    # Validate request parameters
    unless params[:job_name].present?
      render json: {
        success: false,
        error: 'Missing required field: job_name'
      }, status: :unprocessable_entity
      return
    end

    unless params[:materials].is_a?(Array) && params[:materials].any?
      render json: {
        success: false,
        error: 'Missing or empty materials array'
      }, status: :unprocessable_entity
      return
    end

    # Validate each material
    params[:materials].each_with_index do |material, index|
      unless material[:item].present?
        render json: {
          success: false,
          error: "Material at index #{index} missing 'item' field"
        }, status: :unprocessable_entity
        return
      end

      unless material[:quantity].present? && material[:quantity].to_f > 0
        render json: {
          success: false,
          error: "Material at index #{index} has invalid quantity"
        }, status: :unprocessable_entity
        return
      end
    end

    # Create estimate
    @estimate = Estimate.new(
      source: 'unreal_engine',
      job_name_from_source: params[:job_name],
      estimator_name: params[:estimator],
      status: 'pending',
      total_items: params[:materials].length
    )

    if @estimate.save
      # Create line items
      params[:materials].each do |material|
        @estimate.estimate_line_items.create!(
          category: material[:category],
          item_description: material[:item],
          quantity: material[:quantity],
          unit: material[:unit] || 'ea',
          notes: material[:notes]
        )
      end

      # Attempt job matching
      matcher = JobMatcherService.new(@estimate.job_name_from_source)
      match_result = matcher.call

      # ... handle match result
    else
      render json: {
        success: false,
        errors: @estimate.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
end
```

**Validation Errors Return:**
```json
{
  "success": false,
  "error": "Material at index 0 missing 'item' field"
}
```

**Why:** Validating before matching prevents orphaned data and ensures estimates can be processed. External integrations are prone to malformed data.

**Files:**
- `app/controllers/api/v1/external/unreal_estimates_controller.rb`
- `app/models/estimate.rb`
- `app/models/estimate_line_item.rb`

---

## RULE #6.4: PO Generation from Estimate - Transaction Safety

**Converting estimates to POs MUST use database transactions (all-or-nothing).**

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

**Implementation:**

```ruby
# app/services/estimate_to_purchase_order_service.rb
class EstimateToPurchaseOrderService
  def initialize(estimate)
    @estimate = estimate
    @construction = estimate.construction
    @created_pos = []
    @warnings = []
  end

  def execute
    # Validation
    unless @estimate.status == 'matched'
      return { success: false, error: 'Estimate must be matched to a job first' }
    end

    unless @estimate.estimate_line_items.any?
      return { success: false, error: 'Estimate has no line items' }
    end

    # Transaction-wrapped conversion
    ActiveRecord::Base.transaction do
      # Group line items by category
      @estimate.estimate_line_items.group_by(&:category).each do |category, items|
        create_purchase_order_for_category(category, items)
      end

      # Mark estimate as imported
      @estimate.update!(status: 'imported', imported_at: Time.current)

      # Commit transaction (implicit)
    end

    # Success response
    {
      success: true,
      estimate_id: @estimate.id,
      purchase_orders_created: @created_pos.length,
      purchase_orders: @created_pos.map(&:summary_hash),
      warnings: @warnings
    }

  rescue ActiveRecord::RecordInvalid => e
    # Transaction rolled back automatically
    { success: false, error: "Database validation failed: #{e.message}" }
  rescue StandardError => e
    # Transaction rolled back automatically
    Rails.logger.error("Estimate to PO conversion failed: #{e.message}")
    { success: false, error: 'Internal error during conversion' }
  end

  private

  def create_purchase_order_for_category(category, items)
    # Smart supplier lookup
    lookup_result = SmartPoLookupService.new.lookup(
      task_description: items.first.item_description,
      category: category&.downcase
    )

    supplier = lookup_result[:supplier]

    # Create PO
    po = PurchaseOrder.create!(
      construction: @construction,
      estimate: @estimate,
      supplier: supplier,
      description: "Auto-generated from #{@estimate.source} estimate",
      status: 'draft',
      required_date: 14.days.from_now.to_date,
      delivery_address: @construction.title,
      special_instructions: build_special_instructions(category, supplier)
    )

    # Create line items
    items.each_with_index do |item, index|
      item_lookup = SmartPoLookupService.new.lookup(
        task_description: item.item_description,
        category: category&.downcase,
        quantity: item.quantity
      )

      PurchaseOrderLineItem.create!(
        purchase_order: po,
        line_number: index + 1,
        description: item.item_description,
        quantity: item.quantity,
        unit_price: item_lookup[:unit_price] || 0,
        pricebook_item_id: item_lookup[:price_book_item]&.id,
        notes: item.notes
      )

      # Track warnings
      if item_lookup[:warnings].any?
        @warnings.concat(item_lookup[:warnings])
      end
    end

    # Calculate PO totals
    po.calculate_totals
    po.save!

    @created_pos << po
  end
end
```

**Transaction Behavior:**
- **Success:** All POs created, estimate marked imported
- **Failure:** No POs created, estimate remains `matched`, error returned

**Why:** Transaction ensures data integrity - either entire estimate converts successfully or nothing happens. Prevents orphaned POs or inconsistent state.

**Files:**
- `app/services/estimate_to_purchase_order_service.rb`

---

## RULE #6.5: AI Plan Review - Async Processing Required

**AI plan review MUST run asynchronously via background job, NEVER synchronously in request.**

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

**Implementation:**

```ruby
# app/controllers/api/v1/estimate_reviews_controller.rb
class Api::V1::EstimateReviewsController < ApplicationController
  def create
    @estimate = Estimate.find(params[:estimate_id])

    # Validate estimate is matched
    unless @estimate.construction
      render json: { error: 'Estimate must be matched to a construction first' }, status: :unprocessable_entity
      return
    end

    # Create review record
    @review = @estimate.estimate_reviews.create!(
      status: 'pending'
    )

    # Enqueue background job
    AiReviewJob.perform_later(@estimate.id)

    # Immediate response
    render json: {
      success: true,
      review_id: @review.id,
      status: 'processing',
      message: 'AI review started. Poll /api/v1/estimate_reviews/:id for results.'
    }, status: :accepted  # 202 Accepted
  end

  def show
    @review = EstimateReview.find(params[:id])

    render json: {
      success: true,
      review_id: @review.id,
      status: @review.status,
      reviewed_at: @review.reviewed_at,
      confidence_score: @review.confidence_score,
      summary: {
        items_matched: @review.items_matched,
        items_mismatched: @review.items_mismatched,
        items_missing: @review.items_missing,
        items_extra: @review.items_extra
      },
      discrepancies: @review.discrepancies,
      ai_findings: @review.ai_findings
    }
  end
end
```

**Background Job:**
```ruby
# app/jobs/ai_review_job.rb
class AiReviewJob < ApplicationJob
  queue_as :default

  def perform(estimate_id)
    estimate = Estimate.find(estimate_id)
    review = estimate.estimate_reviews.pending.last

    # Update status to processing
    review.update!(status: 'processing')

    # Execute AI review
    service = PlanReviewService.new(estimate)
    result = service.execute

    if result[:success]
      review.update!(
        status: 'completed',
        ai_findings: result[:ai_findings],
        discrepancies: result[:discrepancies],
        items_matched: result[:items_matched],
        items_mismatched: result[:items_mismatched],
        items_missing: result[:items_missing],
        items_extra: result[:items_extra],
        confidence_score: result[:confidence_score],
        reviewed_at: Time.current
      )
    else
      review.update!(status: 'failed')
    end
  rescue StandardError => e
    review.update!(status: 'failed')
    Rails.logger.error("AI Review Job failed: #{e.message}")
    raise e  # Re-raise for Solid Queue retry logic
  end
end
```

**Frontend Polling:**
```javascript
// Poll every 2 seconds until status changes from 'processing'
const pollReviewStatus = async (reviewId) => {
  const response = await fetch(`/api/v1/estimate_reviews/${reviewId}`);
  const data = await response.json();

  if (data.status === 'processing') {
    setTimeout(() => pollReviewStatus(reviewId), 2000);
  } else {
    // Display results
    showReviewResults(data);
  }
};
```

**Why:** AI reviews can take 30-120 seconds depending on PDF size and Claude API latency. Async processing prevents request timeouts and improves UX.

**Files:**
- `app/controllers/api/v1/estimate_reviews_controller.rb`
- `app/jobs/ai_review_job.rb`
- `app/services/plan_review_service.rb`

---

## RULE #6.6: Line Item Categorization - Normalized Category Matching

**Categories MUST be normalized for PO grouping and supplier matching.**

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

**Implementation:**

```ruby
# app/services/estimate_to_purchase_order_service.rb
def normalized_category(category)
  return 'uncategorized' if category.blank?

  normalized = category.downcase.strip

  # Common variations mapping
  CATEGORY_MAPPINGS = {
    'plumber' => 'plumbing',
    'plumb' => 'plumbing',
    'electrician' => 'electrical',
    'elect' => 'electrical',
    'carpenter' => 'carpentry',
    'carp' => 'carpentry',
    'paint' => 'painting',
    'concrete' => 'concreting',
    'concret' => 'concreting'
  }.freeze

  CATEGORY_MAPPINGS[normalized] || normalized
end

# Group line items with normalized categories
grouped_items = @estimate.estimate_line_items.group_by do |item|
  normalized_category(item.category)
end
```

**SmartPoLookupService Integration:**
```ruby
# app/services/smart_po_lookup_service.rb
def lookup(task_description:, category:, quantity: 1)
  normalized_cat = CategoryNormalizationService.normalize(category)

  # Find supplier by normalized category
  supplier = find_supplier_for_category(normalized_cat)

  # ... rest of lookup logic
end
```

**Why:** Category normalization prevents duplicate POs for functionally identical categories and ensures consistent supplier matching.

**Files:**
- `app/services/estimate_to_purchase_order_service.rb`
- `app/services/smart_po_lookup_service.rb`

---

## RULE #6.7: Estimate Status State Machine - Strict Transitions

**Estimate status MUST follow this state machine flow ONLY.**

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

**State Diagram:**
```
pending ─┬─> matched ──> imported
         │
         └─> rejected (terminal)
```

**Implementation:**

```ruby
# app/models/estimate.rb
class Estimate < ApplicationRecord
  STATUSES = %w[pending matched imported rejected].freeze

  validates :status, inclusion: { in: STATUSES }
  validate :valid_status_transition, on: :update

  def match_to_construction!(construction, confidence_score)
    raise "Cannot match from status: #{status}" unless status == 'pending'

    update!(
      construction: construction,
      match_confidence_score: confidence_score,
      status: 'matched'
    )
  end

  def mark_imported!
    raise "Cannot import from status: #{status}" unless status == 'matched'

    update!(
      status: 'imported',
      imported_at: Time.current
    )
  end

  def reject!
    update!(status: 'rejected')
  end

  private

  def valid_status_transition
    return unless status_changed?

    old_status = status_was
    new_status = status

    invalid_transitions = {
      'matched' => ['pending'],
      'imported' => ['pending', 'matched'],
      'rejected' => []  # Can transition to rejected from anywhere
    }

    if invalid_transitions[new_status]&.include?(old_status)
      errors.add(:status, "cannot transition from #{old_status} to #{new_status}")
    end
  end
end
```

**Controller Usage:**
```ruby
# app/controllers/api/v1/estimates_controller.rb
def match
  @estimate = Estimate.find(params[:id])
  construction = Construction.find(params[:construction_id])

  begin
    @estimate.match_to_construction!(construction, 100.0)  # Manual match = 100%
    render json: { success: true, estimate: @estimate }
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
end
```

**Why:** Strict state machine prevents invalid workflows like generating POs from unmatched estimates or re-processing already-imported estimates.

**Files:**
- `app/models/estimate.rb`
- `app/controllers/api/v1/estimates_controller.rb`

---

## API Endpoints Reference

### Estimates (Internal)
```
GET    /api/v1/estimates?status=pending
GET    /api/v1/estimates/:id
PATCH  /api/v1/estimates/:id/match
POST   /api/v1/estimates/:id/generate_purchase_orders
DELETE /api/v1/estimates/:id
```

### Unreal Engine (External)
```
POST   /api/v1/external/unreal_estimates
Headers: X-API-Key: YOUR_KEY
```

### Estimate Reviews
```
POST   /api/v1/estimates/:estimate_id/ai_review
GET    /api/v1/estimate_reviews/:id
GET    /api/v1/estimates/:estimate_id/reviews
DELETE /api/v1/estimate_reviews/:id
```

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
