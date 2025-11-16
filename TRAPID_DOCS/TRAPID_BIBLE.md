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
│ 📕 LEXICON (BUGS):    Chapter 0                │
│ 📘 USER MANUAL (HOW): Chapter 0                │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Authority:** ABSOLUTE
**Last Updated:** 2025-11-16 09:01 AEST

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

**🔴 CRITICAL: Lexicon is database-driven via `documented_bugs` table**

**Lexicon Source of Truth:** Database table `documented_bugs`, NOT the `.md` file
**Exported to:** `TRAPID_LEXICON.md` (auto-generated, do NOT edit directly)

✅ **MUST update Lexicon when:**
1. Discovering a new bug
2. Resolving an existing bug
3. Adding architecture/background knowledge
4. Explaining WHY a rule exists

**How to Update Lexicon:**
```
1. Go to Trapid app → Documentation page
2. Click "📕 TRAPID Lexicon"
3. Add/edit entries via UI (stores in documented_bugs table)
4. Run: bin/rails trapid:export_lexicon
5. Commit the updated TRAPID_LEXICON.md file
```

**Database Schema:**
- `chapter_number` - Which chapter (0-20)
- `chapter_name` - Chapter title
- `knowledge_type` - Type: bug, architecture, test, performance, dev_note, common_issue, terminology
- `bug_title` - Entry title
- `status` - For bugs: open, fixed, by_design, monitoring
- `severity` - For bugs: low, medium, high, critical
- `description`, `scenario`, `root_cause`, `solution`, `prevention` - Content fields
- `rule_reference` - Link to Bible RULE (e.g., "Chapter 9, RULE #9.3")

**API Endpoints:**
- `GET /api/v1/documented_bugs` - List entries
- `POST /api/v1/documented_bugs` - Create entry
- `PATCH /api/v1/documented_bugs/:id` - Update entry
- `DELETE /api/v1/documented_bugs/:id` - Delete entry
- `POST /api/v1/documented_bugs/export_to_markdown` - Export to .md file

### Trinity Completion Rule (CRITICAL)

**🔴 RULE: When completing ANY Bible chapter, you MUST also complete Lexicon + User Manual for that chapter**

✅ **MUST complete all three documents:**
1. **Bible Chapter** - COMPREHENSIVE rules (MUST/NEVER/ALWAYS patterns)
2. **Lexicon Chapter** - COMPREHENSIVE bugs + architecture + tests
3. **User Manual Chapter** - BRIEF user guide (how-to for end users)

❌ **NEVER leave a chapter partially complete**
- Bible without Lexicon = Rules without context (BAD)
- Bible without User Manual = No user-facing guide (BAD)
- Only Bible completed = INCOMPLETE Trinity (BAD)

✅ **Workflow:**
```
1. Research feature (use Task agent if needed)
2. Write Bible chapter (comprehensive)
3. Write Lexicon chapter (comprehensive)
4. Write User Manual chapter (brief)
5. Commit all three documents together
6. Update CONTINUATION_INSTRUCTIONS.md
7. Commit and push progress
```

**Example:**
- ✅ CORRECT: Chapter 9 has Bible + Lexicon + User Manual
- ❌ WRONG: Chapter 19 has only Bible (missing Lexicon + User Manual)

**If you discover an incomplete chapter:**
1. Immediately complete the missing Lexicon + User Manual
2. Update CONTINUATION_INSTRUCTIONS.md to mark complete
3. Commit all changes

### Bug Fix Documentation Workflow

**🔴 CRITICAL: Every bug fix MUST be documented in Lexicon**

When fixing a bug, follow this workflow:

1. **Fix the bug** - Write the code fix
2. **Update Lexicon via UI** - Add entry to `documented_bugs` table via Trapid Documentation page
3. **Export Lexicon** - Run `bin/rails trapid:export_lexicon` to regenerate `.md` file
4. **Update Bible** - Add new RULE if bug revealed a coding pattern violation
5. **Test the fix** - Verify bug is resolved
6. **Commit** - Include code fix + exported Lexicon file in same commit

**Lexicon Bug Entry Fields (via UI):**

When adding a bug entry via Trapid Documentation UI, fill in:

**Required:**
- `chapter_number` - Chapter where bug occurred (0-20)
- `chapter_name` - e.g., "Gantt & Schedule Master"
- `knowledge_type` - Select "bug"
- `bug_title` - Concise title (e.g., "Gantt Shaking During Cascade")

**Bug-Specific:**
- `status` - open, fixed, by_design, monitoring
- `severity` - low, medium, high, critical
- `first_reported` - Date discovered (YYYY-MM-DD)
- `fixed_date` - Date resolved (YYYY-MM-DD)

**Content:**
- `description` - Brief summary of bug and impact
- `scenario` - How the bug manifests (user-facing description)
- `root_cause` - Technical explanation of what caused it
- `solution` - How it was fixed (code snippets, file paths)
- `prevention` - How to avoid this bug in future
- `component` - Specific component (e.g., "DHtmlxGanttView")
- `rule_reference` - Link to Bible rule (e.g., "Chapter 9, RULE #9.3")

**After saving:**
```bash
bin/rails trapid:export_lexicon
git add TRAPID_DOCS/TRAPID_LEXICON.md
git commit -m "docs: Document [bug title] in Lexicon"
```

**Example Reference:** See Lexicon Chapter 9 entries in `documented_bugs` table

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

### Documentation Timestamp Requirements

✅ **MUST include date AND time when updating any Trinity documentation:**

**Required Format:**
```
**Last Updated:** YYYY-MM-DD HH:MM TIMEZONE
```

**Examples:**
- `**Last Updated:** 2025-11-16 09:01 AEST`
- `**Last Updated:** 2025-11-16 14:30 PST`
- `**Last Updated:** 2025-11-16 22:15 UTC`

**Applies to:**
- TRAPID_BIBLE.md (this document)
- TRAPID_LEXICON.md
- TRAPID_USER_MANUAL.md
- All chapter headers within these documents
- CONTINUATION_INSTRUCTIONS.md

❌ **NEVER:**
- Use date-only format (e.g., `2025-11-16`)
- Omit timezone
- Use relative time (e.g., "yesterday")

**Why:**
- Tracks when information was last verified
- Helps identify stale content
- Critical for compliance and audit trails
- Enables users to trust documentation currency

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

┌─────────────────────────────────────────────────┐
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

**CompanySetting MUST use singleton pattern with first_or_create initialization.**

### Implementation

✅ **MUST implement as singleton:**

```ruby
# app/models/company_setting.rb
class CompanySetting < ApplicationRecord
  def self.instance
    first_or_create!(
      company_name: "Trapid Construction",
      timezone: "Australia/Brisbane",
      working_days: {
        "monday" => true,
        "tuesday" => true,
        "wednesday" => true,
        "thursday" => true,
        "friday" => true,
        "saturday" => false,
        "sunday" => true  # Note: Sunday = true by default
      }
    )
  end
end
```

### Usage Pattern

✅ **MUST access via instance method:**

```ruby
# In controllers, services, models:
settings = CompanySetting.instance

# Access fields:
timezone = settings.timezone
working_days = settings.working_days
company_name = settings.company_name
```

❌ **NEVER:**
- Create multiple CompanySetting records (singleton = one record only)
- Hardcode configuration values instead of reading from settings
- Use `CompanySetting.first` (use `CompanySetting.instance`)
- Call `CompanySetting.create` manually (use `instance` method)

**Why:**
- Singleton pattern ensures consistent configuration across application
- `first_or_create!` initializes with defaults if database empty
- Centralized configuration prevents scattered hardcoded values
- Easy to update settings without code changes

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb`

---

## RULE #2.2: Timezone Handling - Backend Time Calculations

**All time-based calculations MUST use company timezone, not UTC or server timezone.**

### Timezone Methods

✅ **MUST use CompanySetting timezone methods:**

```ruby
# app/models/company_setting.rb
def today
  Time.use_zone(timezone) { Time.zone.today }
end

def now
  Time.use_zone(timezone) { Time.zone.now }
end

# Usage in services/models:
settings = CompanySetting.instance
current_date = settings.today  # NOT Date.today!
current_time = settings.now    # NOT Time.now!
```

### Working with Timestamps

✅ **MUST use Time.use_zone context:**

```ruby
# When calculating dates for a job:
settings = CompanySetting.instance

Time.use_zone(settings.timezone) do
  job_start = Time.zone.parse("2025-01-15 08:00:00")
  job_end = job_start + 5.days

  # All calculations within this block use company timezone
end
```

❌ **NEVER:**
- Use `Date.today` or `Time.now` without timezone context
- Store dates/times in UTC without timezone conversion
- Assume server timezone matches company timezone
- Use JavaScript `new Date()` for date calculations (see RULE #2.3)

**Why:**
- Construction companies operate in specific regions/timezones
- Midnight in Brisbane ≠ midnight in UTC (causes off-by-one day errors)
- Schedule calculations must align with business hours
- International deployments require timezone awareness

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb` (lines 40-48)

---

## RULE #2.3: Timezone Handling - Frontend Time Display

**Frontend MUST use Intl.DateTimeFormat with company timezone, NOT browser timezone.**

### Correct Pattern

✅ **MUST use Intl API with explicit timezone:**

```javascript
// frontend/src/utils/timezoneUtils.js
import { companySettings } from '../contexts/CompanySettingsContext';

export const formatDate = (dateString) => {
  const timezone = companySettings.timezone; // e.g., "Australia/Brisbane"

  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date(dateString));
};

export const formatDateTime = (dateString) => {
  const timezone = companySettings.timezone;

  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(new Date(dateString));
};
```

### Usage in Components

✅ **MUST import and use timezone utilities:**

```jsx
// GanttChart.jsx
import { formatDate, formatDateTime } from '../utils/timezoneUtils';

const TaskRow = ({ task }) => (
  <div>
    <span>Start: {formatDate(task.planned_start_date)}</span>
    <span>End: {formatDate(task.planned_end_date)}</span>
  </div>
);
```

❌ **NEVER:**
- Use `Date.toLocaleDateString()` without timeZone parameter (uses browser timezone!)
- Use `Date.toLocaleString()` without explicit timezone
- Use date libraries without timezone configuration (moment.js, date-fns)
- Assume user's browser timezone matches company timezone

**Why:**
- User in Sydney (AEDT) viewing Brisbane (AEST) job must see Brisbane times
- Browser timezone detection causes data corruption in international deployments
- Gantt chart dates must align with backend calculations
- Prevents off-by-one day errors in date pickers

**File Reference:** `/Users/rob/Projects/trapid/frontend/src/utils/timezoneUtils.js` (290 lines)

---

## RULE #2.4: Working Days Configuration & Business Day Calculations

**Working days MUST be stored as JSONB and used in all schedule/cascade calculations.**

### Schema

```ruby
# db/schema.rb
create_table :company_settings do |t|
  t.jsonb :working_days, default: {
    "monday" => true,
    "tuesday" => true,
    "wednesday" => true,
    "thursday" => true,
    "friday" => true,
    "saturday" => false,
    "sunday" => true  # Default includes Sunday (construction industry)
  }
end
```

### Business Day Logic

✅ **MUST implement working_day? and business_day? methods:**

```ruby
# app/models/company_setting.rb
def working_day?(date)
  day_name = date.strftime('%A').downcase  # "monday", "tuesday", etc.
  working_days[day_name] == true
end

def business_day?(date)
  # Business day = working day AND not a public holiday
  working_day?(date) && !PublicHoliday.on_date(date).exists?
end
```

### Usage in Schedule Cascade

✅ **MUST use in date calculations:**

```ruby
# app/services/schedule/cascade_calculator.rb
def next_business_day(date)
  settings = CompanySetting.instance
  current = date + 1.day

  while !settings.business_day?(current)
    current += 1.day
  end

  current
end

def add_business_days(start_date, days_to_add)
  settings = CompanySetting.instance
  current = start_date
  days_added = 0

  while days_added < days_to_add
    current += 1.day
    days_added += 1 if settings.business_day?(current)
  end

  current
end
```

❌ **NEVER:**
- Hardcode working days as Monday-Friday only (some industries work Sundays, skip Saturdays)
- Use Rails' `business_day?` method (doesn't respect company settings)
- Calculate task dates without checking working_days
- Allow cascade to schedule tasks on non-working days (exception: locked tasks)

**Why:**
- Construction industry often works Sundays, skips Saturdays
- Regional variations (some states have different working patterns)
- Gantt cascade must align with actual crew availability
- Prevents scheduling conflicts

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb` (lines 50-62)

---

## RULE #2.5: User Roles & Permission System

**Users MUST have exactly one system role from enum, with role-based permission checks.**

### System Roles

```ruby
# app/models/user.rb
enum role: {
  user: 0,           # Basic access (view-only for most features)
  admin: 1,          # Full system access
  product_owner: 2,  # Full access + product backlog management
  estimator: 3,      # Estimate/quote creation and editing
  supervisor: 4,     # Field supervisor (task completion, checklists)
  builder: 5         # Builder/contractor (task viewing, updates)
}
```

### Permission Methods

✅ **MUST implement permission helper methods:**

```ruby
# app/models/user.rb
def can_create_templates?
  admin? || product_owner?
end

def can_edit_schedule?
  admin? || product_owner? || estimator?
end

def can_view_supervisor_tasks?
  supervisor? || admin? || product_owner?
end

def can_view_builder_tasks?
  builder? || admin? || product_owner?
end

def can_manage_users?
  admin? || product_owner?
end
```

### Controller Authorization

✅ **MUST check permissions in controllers:**

```ruby
# app/controllers/api/v1/schedule_templates_controller.rb
before_action :require_template_permissions, only: [:create, :update, :destroy]

def require_template_permissions
  unless current_user.can_create_templates?
    render json: { error: "Insufficient permissions" }, status: :forbidden
  end
end
```

❌ **NEVER:**
- Allow users to change their own role (admin-only operation)
- Grant permissions based on string matching role names
- Skip permission checks in controllers ("I'll handle it in the UI")
- Use role checking in frontend only (backend MUST validate)

**Why:**
- Role-based access control prevents unauthorized actions
- Permission methods centralize authorization logic
- Enum roles are database-efficient and type-safe
- Security in depth (backend + frontend checks)

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/user.rb` (lines 15-25, 70-95)

---

## RULE #2.6: Assignable Roles for Task Assignment

**Tasks MUST use separate assignable_role enum for assignment categories, independent of system role.**

### Assignable Roles

```ruby
# app/models/user.rb
enum assignable_role: {
  admin: 0,
  sales: 1,
  site: 2,
  supervisor: 3,
  builder: 4,
  estimator: 5,
  none: 6
}, _prefix: :assignable
```

### Why Separate Enum?

✅ **MUST use assignable_role for task filtering:**

```ruby
# app/controllers/api/v1/schedule_tasks_controller.rb
def my_tasks
  # Filter by assignable_role, not system role
  tasks = ScheduleTask.where(assignable_role: current_user.assignable_role)
  render json: tasks
end
```

❌ **NEVER:**
- Confuse system role (permissions) with assignable_role (task filtering)
- Use system role for task assignment
- Allow users with assignable_role: none to be assigned tasks
- Hardcode role names in task queries

**Why:**
- System role = permissions (what you CAN do)
- Assignable role = categorization (what tasks you SEE)
- User can be admin (permission) + site (task category) simultaneously
- Prevents permission escalation via task assignment

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/user.rb` (lines 27-35)

---

## RULE #2.7: Password Complexity Requirements

**User passwords MUST meet complexity requirements, except for OAuth users.**

### Validation

✅ **MUST validate password complexity:**

```ruby
# app/models/user.rb
validates :password, presence: true, if: :password_required?
validates :password, length: { minimum: 12 }, if: :password_required?
validate :password_complexity, if: :password_required?

def password_complexity
  return if password.blank?

  rules = []
  rules << "must include at least one uppercase letter" unless password.match?(/[A-Z]/)
  rules << "must include at least one lowercase letter" unless password.match?(/[a-z]/)
  rules << "must include at least one digit" unless password.match?(/\d/)
  rules << "must include at least one special character" unless password.match?(/[@$!%*?&]/)

  if rules.any?
    errors.add(:password, rules.join(", "))
  end
end

def password_required?
  !oauth_uid.present?  # OAuth users skip password validation
end
```

### OAuth Exception

✅ **MUST generate random password for OAuth users:**

```ruby
# app/services/oauth_user_creator.rb
def create_from_oauth(oauth_data)
  User.create!(
    email: oauth_data[:email],
    name: oauth_data[:name],
    oauth_uid: oauth_data[:uid],
    oauth_provider: oauth_data[:provider],
    password: SecureRandom.urlsafe_base64(32),  # Random, unused password
    role: :user
  )
end
```

❌ **NEVER:**
- Allow passwords shorter than 12 characters
- Allow passwords without uppercase, lowercase, digit, and special character
- Require OAuth users to set passwords (they don't use them)
- Store passwords in plain text (use bcrypt via has_secure_password)

**Why:**
- Prevents weak passwords ("password123")
- Reduces risk of brute force attacks
- Aligns with NIST password guidelines
- OAuth users don't use passwords (skip validation)

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/user.rb` (lines 40-65)

---

## RULE #2.8: Timezone Options Limitation

**Frontend timezone dropdown MUST only show 12 supported Australian/NZ timezones.**

### Supported Timezones

✅ **MUST use this exact list:**

```javascript
// frontend/src/components/settings/CompanySettingsTab.jsx
const TIMEZONE_OPTIONS = [
  'Australia/Sydney',     // NSW, VIC, TAS
  'Australia/Melbourne',  // VIC
  'Australia/Brisbane',   // QLD (no DST)
  'Australia/Adelaide',   // SA
  'Australia/Perth',      // WA
  'Australia/Darwin',     // NT (no DST)
  'Australia/Hobart',     // TAS
  'Australia/Canberra',   // ACT
  'Australia/Lord_Howe',  // Lord Howe Island
  'Pacific/Auckland',     // NZ
  'Pacific/Chatham',      // Chatham Islands
  'Australia/Eucla'       // WA (rare)
];
```

### Dropdown Implementation

✅ **MUST use select with these options:**

```jsx
<select
  value={settings.timezone}
  onChange={(e) => updateTimezone(e.target.value)}
  className="form-select"
>
  {TIMEZONE_OPTIONS.map(tz => (
    <option key={tz} value={tz}>{tz}</option>
  ))}
</select>
```

❌ **NEVER:**
- Allow free-text timezone entry (validation nightmare)
- Show all 400+ IANA timezones (overwhelming, unnecessary)
- Use timezone abbreviations (AEST, AEDT - ambiguous)
- Default to UTC (construction companies operate in specific regions)

**Why:**
- Trapid targets Australian/NZ construction market
- 12 timezones cover entire deployment region
- IANA timezone names handle DST automatically
- Prevents invalid timezone selection

**File Reference:** `/Users/rob/Projects/trapid/frontend/src/components/settings/CompanySettingsTab.jsx` (lines 45-60)

---

## RULE #2.9: Working Days UI - Sunday Default True

**Working days configuration MUST default Sunday to TRUE for construction industry.**

### Default Configuration

✅ **MUST initialize with Sunday = true:**

```ruby
# app/models/company_setting.rb
DEFAULT_WORKING_DAYS = {
  "monday" => true,
  "tuesday" => true,
  "wednesday" => true,
  "thursday" => true,
  "friday" => true,
  "saturday" => false,   # Most crews don't work Saturdays
  "sunday" => true       # Sunday work common in construction
}.freeze
```

### UI Representation

✅ **MUST show checkboxes for all 7 days:**

```jsx
// CompanySettingsTab.jsx
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

{DAYS.map(day => (
  <label key={day} className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={settings.working_days[day] || false}
      onChange={(e) => updateWorkingDay(day, e.target.checked)}
    />
    <span className="capitalize">{day}</span>
  </label>
))}
```

❌ **NEVER:**
- Hardcode Monday-Friday as only working days
- Hide Sunday checkbox (some companies DO work Sundays)
- Default all days to true (Saturday rarely worked)
- Prevent users from customizing working days

**Why:**
- Construction industry often works Sundays to meet deadlines
- Saturday premium rates discourage weekend work
- Regional variations (some states/companies have different patterns)
- Schedule cascade must reflect actual crew availability

**File Reference:** `/Users/rob/Projects/trapid/frontend/src/components/settings/CompanySettingsTab.jsx` (lines 120-145)

---

## Protected Code Patterns

### 1. CompanySetting Instance Method

**File:** `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb`

**DO NOT modify singleton pattern:**

```ruby
def self.instance
  first_or_create!(
    company_name: "Trapid Construction",
    timezone: "Australia/Brisbane",
    working_days: DEFAULT_WORKING_DAYS
  )
end
```

**Reason:** Changing this breaks initialization across entire application. All services depend on `instance` method.

---

### 2. Timezone Context Manager

**File:** `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb`

**DO NOT remove Time.use_zone wrappers:**

```ruby
def today
  Time.use_zone(timezone) { Time.zone.today }
end

def now
  Time.use_zone(timezone) { Time.zone.now }
end
```

**Reason:** These methods are called hundreds of times across services. Removing timezone context causes off-by-one day errors globally.

---

### 3. Password Complexity Validation

**File:** `/Users/rob/Projects/trapid/backend/app/models/user.rb`

**DO NOT weaken password requirements:**

```ruby
def password_complexity
  rules = []
  rules << "must include at least one uppercase letter" unless password.match?(/[A-Z]/)
  rules << "must include at least one lowercase letter" unless password.match?(/[a-z]/)
  rules << "must include at least one digit" unless password.match?(/\d/)
  rules << "must include at least one special character" unless password.match?(/[@$!%*?&]/)

  if rules.any?
    errors.add(:password, rules.join(", "))
  end
end
```

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

**Contacts MUST support multiple types simultaneously via contact_types array.**

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

**Implementation:**

```ruby
# app/models/contact.rb
CONTACT_TYPES = ['customer', 'supplier', 'sales', 'land_agent'].freeze

validates :primary_contact_type, inclusion: { in: CONTACT_TYPES }, allow_nil: true
validate :contact_types_must_be_valid

before_save :set_primary_contact_type_if_blank

def is_supplier?
  contact_types&.include?('supplier')
end

private

def contact_types_must_be_valid
  return if contact_types.blank?
  invalid_types = contact_types - CONTACT_TYPES
  if invalid_types.any?
    errors.add(:contact_types, "contains invalid types: #{invalid_types.join(', ')}")
  end
end
```

**Query Examples:**

```ruby
# Find all suppliers
Contact.where("'supplier' = ANY(contact_types)")

# Find contacts that are BOTH customer AND supplier
Contact.where("contact_types @> ARRAY['customer', 'supplier']::varchar[]")

# Filter by type in controller
case params[:type]
when 'customers'
  @contacts = @contacts.where("'customer' = ANY(contact_types)")
when 'suppliers'
  @contacts = @contacts.where("'supplier' = ANY(contact_types)")
when 'both'
  @contacts = @contacts.where("contact_types @> ARRAY['customer', 'supplier']::varchar[]")
end
```

**Files:**
- `app/models/contact.rb`
- `app/controllers/api/v1/contacts_controller.rb` (index filtering)
- Migration: `db/migrate/20251106030000_change_contact_type_to_array.rb`

---

## RULE #3.2: Bidirectional Relationships Require Reverse Sync

**ContactRelationship MUST automatically create and sync reverse relationships.**

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

**Implementation:**

```ruby
# app/models/contact_relationship.rb
RELATIONSHIP_TYPES = [
  'previous_client', 'parent_company', 'subsidiary', 'partner',
  'referral', 'supplier_alternate', 'related_project', 'family_member', 'other'
].freeze

validates :relationship_type, inclusion: { in: RELATIONSHIP_TYPES }
validate :cannot_relate_to_self
validate :unique_relationship_pair

after_create :create_reverse_relationship
after_update :update_reverse_relationship
after_destroy :destroy_reverse_relationship

private

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

def cannot_relate_to_self
  if source_contact_id == related_contact_id
    errors.add(:base, "Cannot create relationship to same contact")
  end
end

def unique_relationship_pair
  existing = ContactRelationship.where(
    source_contact_id: source_contact_id,
    related_contact_id: related_contact_id
  ).where.not(id: id)

  if existing.exists?
    errors.add(:base, "Relationship already exists")
  end
end
```

**Files:**
- `app/models/contact_relationship.rb`
- `app/controllers/api/v1/contact_relationships_controller.rb`
- Migration: `db/migrate/20251112205154_create_contact_relationships.rb`

---

## RULE #3.3: Xero Sync Uses Priority-Based Fuzzy Matching

**XeroContactSyncService MUST match contacts using 4-tier priority matching.**

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

**Implementation:**

```ruby
# app/services/xero_contact_sync_service.rb
def match_contact(xero_contact)
  # Priority 1: Exact xero_id match
  if xero_contact.contact_id.present?
    match = Contact.find_by(xero_id: xero_contact.contact_id)
    return { contact: match, match_type: 'xero_id' } if match
  end

  # Priority 2: Tax number match (ABN/ACN)
  if xero_contact.tax_number.present?
    normalized_tax = xero_contact.tax_number.gsub(/\D/, '')
    if normalized_tax.length == 11
      match = Contact.where("regexp_replace(tax_number, '[^0-9]', '', 'g') = ?", normalized_tax).first
      return { contact: match, match_type: 'tax_number' } if match
    end
  end

  # Priority 3: Email match
  if xero_contact.email_address.present?
    match = Contact.find_by('LOWER(email) = ?', xero_contact.email_address.downcase)
    return { contact: match, match_type: 'email' } if match
  end

  # Priority 4: Fuzzy name match (>85% similarity)
  if xero_contact.name.present?
    contact_names = Contact.pluck(:full_name, :id).to_h
    fuzzy_matcher = FuzzyMatch.new(contact_names.keys)
    matched_name = fuzzy_matcher.find(xero_contact.name, threshold: 0.85)

    if matched_name
      match = Contact.find(contact_names[matched_name])
      return { contact: match, match_type: 'fuzzy_name' }
    end
  end

  { contact: nil, match_type: 'no_match' }
end
```

**Files:**
- `app/services/xero_contact_sync_service.rb`
- `app/models/contact.rb` (xero fields)
- Migration: `db/migrate/20251110091545_add_xero_fields_to_contacts.rb`

---

## RULE #3.4: Contact Deletion MUST Check Purchase Order Dependencies

**Contacts with suppliers that have purchase orders CANNOT be deleted.**

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

**Implementation:**

```ruby
# app/controllers/api/v1/contacts_controller.rb
def destroy
  # Check for linked suppliers with purchase orders
  if @contact.suppliers.any?
    suppliers_with_pos = @contact.suppliers.joins(:purchase_orders).distinct

    if suppliers_with_pos.any?
      # Check for paid/invoiced POs
      paid_pos = PurchaseOrder
        .where(supplier_id: suppliers_with_pos.pluck(:id))
        .where("status IN (?) OR amount_paid > 0 OR amount_invoiced > 0",
               ['paid', 'partially_paid', 'invoiced'])

      if paid_pos.exists?
        return render json: {
          success: false,
          error: "Cannot delete contact with suppliers that have paid or invoiced purchase orders"
        }, status: :unprocessable_entity
      end
    end
  end

  @contact.destroy
end
```

**Files:**
- `app/controllers/api/v1/contacts_controller.rb` (destroy action)
- `app/models/contact.rb` (has_many :purchase_orders, dependent: :restrict_with_error)

---

## RULE #3.5: Contact Merge MUST Consolidate All Related Records

**Contact merge feature MUST update all foreign keys and combine data intelligently.**

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

**Files:**
- `app/controllers/api/v1/contacts_controller.rb` (merge action)
- `app/models/contact_activity.rb`

---

## RULE #3.6: Portal Users MUST Have Secure Password Requirements

**PortalUser accounts MUST enforce strong password policies and account lockout.**

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

**Implementation:**

```ruby
# app/models/portal_user.rb
PASSWORD_REGEX = /\A
  (?=.*[a-z])           # At least one lowercase
  (?=.*[A-Z])           # At least one uppercase
  (?=.*\d)              # At least one digit
  (?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])  # At least one special char
  .{12,}                # At least 12 characters
\z/x

validates :password, length: { minimum: 12 }, format: PASSWORD_REGEX, on: :create
```

**Files:**
- `app/models/portal_user.rb`
- Migration: `db/migrate/20251113201841_add_portal_fields_to_contacts.rb`

---

## RULE #3.7: Primary Contact/Address/Person MUST Be Unique Per Contact

**Only ONE primary record allowed per contact for ContactPerson, ContactAddress, and ConstructionContact.**

✅ **MUST:**
- Validate `is_primary` uniqueness scoped to `contact_id` in before_save callback
- Automatically unmark other primaries when setting new primary
- Use database index on `[contact_id, is_primary]` for performance
- Ensure at least one contact remains on construction (cannot delete last)

❌ **NEVER:**
- Allow multiple primary persons/addresses per contact
- Delete the only remaining contact from a construction
- Set `is_primary = true` without unmarking others

**Files:**
- `app/models/contact_person.rb`
- `app/models/contact_address.rb`
- `app/models/construction_contact.rb`

---

## RULE #3.8: Contact Activity Logging MUST Track All Significant Changes

**All contact modifications, syncs, and relationships MUST be logged to ContactActivity.**

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

**Files:**
- `app/models/contact_activity.rb`
- `app/services/xero_contact_sync_service.rb`
- Migration: `db/migrate/20251110092329_create_contact_activities.rb`

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

**Estimates MUST be matched to a construction/job before AI review is allowed.**

✅ **MUST:**
- Validate `estimate.construction_id` is present before starting review
- Return 422 status with clear error message if not matched
- Show "Match to Job" button in UI if unmatched

❌ **NEVER:**
- Allow AI review on unmatched estimates
- Start review without construction context

**Implementation:**
```ruby
# app/services/plan_review_service.rb
def validate_estimate_matched!
  unless @estimate.construction
    raise NoConstructionError, "Estimate must be matched to a construction/job before AI review"
  end
end
```

**Why this rule exists:**
- OneDrive folder access requires construction association
- Plan documents stored under job folders
- Without construction context, cannot locate plan files

**Files:**
- `backend/app/services/plan_review_service.rb:20-25`
- `backend/app/controllers/api/v1/estimate_reviews_controller.rb:14-18`

---

## RULE #7.2: OneDrive Plan Folder Structure

**AI review MUST search for plans in exactly 3 specific OneDrive folders.**

✅ **MUST search folders:**
1. `01 - Plans`
2. `02 - Engineering`
3. `03 - Specifications`

❌ **NEVER:**
- Search entire OneDrive (security risk)
- Use different folder names without updating constant
- Skip folder validation

**Implementation:**
```ruby
# app/services/plan_review_service.rb
PLAN_FOLDER_PATHS = ['01 - Plans', '02 - Engineering', '03 - Specifications'].freeze

def fetch_pdf_plans_from_onedrive
  PLAN_FOLDER_PATHS.each do |folder_name|
    folder = find_folder_by_name(folder_name)
    next unless folder

    files = list_files_in_folder(folder['id'])
    pdf_files += files.select { |f| f['name'].end_with?('.pdf') }
  end
end
```

**Why this rule exists:**
- Standardized folder structure across all jobs
- Limits scope of file access (security)
- Matches OneDrive setup workflow

**Files:**
- `backend/app/services/plan_review_service.rb:10`

---

## RULE #7.3: PDF File Size Limit

**PDFs MUST be smaller than 20MB for Claude API analysis.**

✅ **MUST:**
- Check file size before download
- Skip files > 20MB
- Return error if NO valid PDFs found after filtering

❌ **NEVER:**
- Attempt to send files > 20MB to Claude API
- Download large files unnecessarily
- Proceed without plan documents

**Implementation:**
```ruby
# app/services/plan_review_service.rb
MAX_FILE_SIZE = 20.megabytes

def fetch_pdf_plans_from_onedrive
  pdf_files.each do |file|
    if file['size'] > MAX_FILE_SIZE
      Rails.logger.warn "Skipping #{file['name']} - too large (#{file['size']} bytes)"
      next
    end

    content = download_file(file['id'])
    valid_pdfs << { name: file['name'], size: file['size'], content: content }
  end

  raise PDFNotFoundError if valid_pdfs.empty?
end
```

**Why this rule exists:**
- Claude API has file size limits
- Large PDFs cause timeouts and errors
- Memory constraints on background job processing

**Files:**
- `backend/app/services/plan_review_service.rb:9`

---

## RULE #7.4: Async Processing with Background Jobs

**AI review MUST be processed asynchronously via AiReviewJob.**

✅ **MUST:**
- Return 202 Accepted immediately with review_id
- Enqueue AiReviewJob with estimate_id
- Set initial status to 'pending', update to 'processing' in job
- Frontend MUST poll for status (every 5 seconds recommended)

❌ **NEVER:**
- Process review synchronously (causes request timeout)
- Block HTTP request waiting for Claude API response
- Assume review completes instantly

**Implementation:**
```ruby
# app/controllers/api/v1/estimate_reviews_controller.rb
def create
  review = EstimateReview.create!(estimate: @estimate, status: :pending)
  AiReviewJob.perform_later(@estimate.id)

  render json: {
    success: true,
    review_id: review.id,
    status: 'processing',
    message: 'AI review started. This may take 30-60 seconds.'
  }, status: :accepted
end
```

**Frontend polling:**
```javascript
// Poll every 5 seconds
const pollInterval = setInterval(async () => {
  const response = await api.get(`/api/v1/estimate_reviews/${reviewId}`)
  if (response.status === 'completed' || response.status === 'failed') {
    clearInterval(pollInterval)
    showResults(response)
  }
}, 5000)
```

**Why this rule exists:**
- Claude API takes 30-60 seconds for typical plans
- OneDrive download adds additional latency
- Prevents request timeouts and poor UX

**Files:**
- `backend/app/controllers/api/v1/estimate_reviews_controller.rb:12-22`
- `backend/app/jobs/ai_review_job.rb`
- `frontend/src/components/estimates/AiReviewModal.jsx:45-60`

---

## RULE #7.5: Claude API Model and Prompt Structure

**MUST use claude-3-5-sonnet-20241022 model with structured PDF analysis prompt.**

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

**Implementation:**
```ruby
# app/services/plan_review_service.rb
def send_to_claude_api(pdf_data, prompt)
  client = Anthropic::Client.new(access_token: ENV['ANTHROPIC_API_KEY'])

  content = pdf_data.map do |pdf|
    {
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: pdf[:base64_content]
      }
    }
  end

  content << { type: 'text', text: prompt }

  response = client.messages.create(
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: content }]
  )

  response.dig('content', 0, 'text')
end
```

**Required prompt structure:**
```ruby
def build_analysis_prompt
  <<~PROMPT
    Analyze these construction plan PDFs and extract ALL materials/items mentioned.

    Compare against this estimate:
    #{JSON.pretty_generate(estimate_line_items)}

    Return ONLY a JSON object with this exact structure:
    {
      "items_identified": [
        {"category": "...", "item": "...", "quantity": 10, "unit": "ea"}
      ],
      "discrepancies": [
        {
          "type": "quantity_mismatch|missing|extra",
          "severity": "high|medium|low",
          "category": "...",
          "item": "...",
          "plan_quantity": 10,
          "estimate_quantity": 8,
          "recommendation": "..."
        }
      ]
    }

    Severity levels:
    - HIGH: > 20% quantity difference
    - MEDIUM: 10-20% difference
    - LOW: < 10% difference
  PROMPT
end
```

**Why this rule exists:**
- Claude 3.5 Sonnet has best PDF vision capabilities
- Structured JSON output enables automated discrepancy detection
- Max tokens ensures complete analysis for typical plans
- Base64 encoding preserves PDF formatting/images

**Files:**
- `backend/app/services/plan_review_service.rb:95-125`

---

## RULE #7.6: Discrepancy Detection Logic

**Discrepancies MUST be categorized into 4 types with severity ratings.**

✅ **MUST categorize as:**
1. **Matched** - Quantity difference ≤ 10%
2. **Quantity Mismatch** - Same item, quantity difference > 10%
   - HIGH severity: > 20% difference
   - MEDIUM severity: 10-20% difference
3. **Missing** - In plans but NOT in estimate (severity: INFO)
4. **Extra** - In estimate but NOT in plans (severity: INFO)

✅ **MUST use fuzzy matching:**
- Remove non-alphanumeric characters from item descriptions
- Case-insensitive comparison
- Match by category + description

❌ **NEVER:**
- Require exact string match (causes false negatives)
- Ignore category in matching (causes false positives)
- Use < 10% threshold for mismatches (too strict)

**Implementation:**
```ruby
# app/services/plan_review_service.rb
def identify_discrepancies(parsed_analysis)
  plan_items = parsed_analysis['items_identified'] || []
  estimate_items = @estimate.estimate_line_items

  matched = []
  mismatched = []
  missing = []
  extra = []

  plan_items.each do |plan_item|
    est_item = estimate_items.find do |e|
      fuzzy_match?(e.category, plan_item['category']) &&
      fuzzy_match?(e.item_description, plan_item['item'])
    end

    if est_item
      diff_pct = ((plan_item['quantity'] - est_item.quantity).abs.to_f / plan_item['quantity']) * 100

      if diff_pct <= 10
        matched << plan_item
      else
        severity = diff_pct > 20 ? 'high' : 'medium'
        mismatched << {
          type: 'quantity_mismatch',
          severity: severity,
          category: plan_item['category'],
          item: plan_item['item'],
          plan_quantity: plan_item['quantity'],
          estimate_quantity: est_item.quantity,
          difference_percent: diff_pct.round(1),
          recommendation: "Verify with plans - estimate may be #{diff_pct > 0 ? 'short' : 'over'} by #{(plan_item['quantity'] - est_item.quantity).abs} units"
        }
      end
    else
      missing << {
        type: 'missing',
        severity: 'info',
        category: plan_item['category'],
        item: plan_item['item'],
        plan_quantity: plan_item['quantity'],
        recommendation: 'Item appears in plans but missing from estimate'
      }
    end
  end

  # Find extra items in estimate
  estimate_items.each do |est_item|
    unless plan_items.any? { |p| fuzzy_match?(p['item'], est_item.item_description) }
      extra << {
        type: 'extra',
        severity: 'info',
        estimate_quantity: est_item.quantity,
        recommendation: 'Item in estimate but not found in plans - verify if needed'
      }
    end
  end

  {
    matched: matched,
    mismatched: mismatched,
    missing: missing,
    extra: extra
  }
end

def fuzzy_match?(str1, str2)
  normalize(str1) == normalize(str2)
end

def normalize(str)
  str.to_s.downcase.gsub(/[^a-z0-9]/, '')
end
```

**Why this rule exists:**
- 10% tolerance accounts for rounding in plans
- Fuzzy matching handles minor description variations
- Severity ratings prioritize critical issues
- Category matching reduces false positives (e.g., "bolt" in plumbing vs electrical)

**Files:**
- `backend/app/services/plan_review_service.rb:130-195`

---

## RULE #7.7: Confidence Score Calculation

**Confidence score MUST be calculated as (matched %) minus penalty for discrepancies.**

✅ **MUST calculate:**
```ruby
base_score = (items_matched / total_items) * 100
penalty = (items_mismatched * 5) + (items_missing * 3) + (items_extra * 2)
confidence_score = [base_score - penalty, 0].max  # Clamp to 0 minimum
```

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

**Why this rule exists:**
- Provides single metric for estimate accuracy
- Weighted penalties reflect severity of issues
- Mismatches penalized most (wrong quantity is critical)
- Missing items penalized more than extras (safety concern)
- Extras penalized least (may be intentional buffers)

**Implementation:**
```ruby
# app/services/plan_review_service.rb
def calculate_confidence_score(discrepancies)
  matched = discrepancies[:matched].count
  mismatched = discrepancies[:mismatched].count
  missing = discrepancies[:missing].count
  extra = discrepancies[:extra].count

  total = matched + mismatched + missing
  return 0 if total.zero?

  base_score = (matched.to_f / total) * 100
  penalty = (mismatched * 5) + (missing * 3) + (extra * 2)

  [base_score - penalty, 0].max.round(2)
end
```

**Files:**
- `backend/app/services/plan_review_service.rb:200-215`

---

## RULE #7.8: Error Handling and Status Updates

**Review status MUST be updated to 'failed' on ANY error with descriptive message.**

✅ **MUST handle errors:**
- `NoConstructionError` - Estimate not matched
- `OneDriveNotConnectedError` - OneDrive credential missing
- `PDFNotFoundError` - No valid PDFs in plan folders
- `FileTooLargeError` - All PDFs exceed 20MB limit
- `Anthropic::Error` - Claude API errors (rate limit, auth, etc.)
- `StandardError` - Generic catch-all

✅ **MUST update review record:**
```ruby
review.update!(
  status: :failed,
  ai_findings: { error: error_message },
  reviewed_at: Time.current
)
```

❌ **NEVER:**
- Leave review in 'processing' state on error (orphaned record)
- Expose sensitive error details to client
- Retry automatically without user intervention

**Implementation:**
```ruby
# app/services/plan_review_service.rb
def handle_error(message)
  @review.update!(
    status: :failed,
    ai_findings: { error: message },
    reviewed_at: Time.current
  )

  { success: false, error: message }
end

# Usage
begin
  validate_estimate_matched!
  pdf_files = fetch_pdf_plans_from_onedrive
  # ... rest of processing
rescue NoConstructionError => e
  handle_error("Estimate must be matched to a job before AI review")
rescue PDFNotFoundError => e
  handle_error("No plan documents found in OneDrive folders: 01-Plans, 02-Engineering, 03-Specifications")
rescue Anthropic::Error => e
  handle_error("Claude API error: #{e.message}")
rescue StandardError => e
  Rails.logger.error("AI Review failed: #{e.message}\n#{e.backtrace.join("\n")}")
  handle_error("Analysis failed. Please try again or contact support.")
end
```

**Why this rule exists:**
- Prevents orphaned 'processing' reviews
- Provides actionable error messages to users
- Enables retry after fixing underlying issue
- Logs detailed errors for debugging

**Files:**
- `backend/app/services/plan_review_service.rb:220-240`
- `backend/app/jobs/ai_review_job.rb:8-20`

---

## RULE #7.9: Prevent Duplicate Processing Reviews

**MUST prevent multiple simultaneous reviews for the same estimate.**

✅ **MUST check:**
- Query for existing review with `status: processing`
- Return 422 error if found
- Allow new review only if previous is completed/failed

❌ **NEVER:**
- Allow concurrent reviews on same estimate
- Overwrite existing processing review

**Implementation:**
```ruby
# app/controllers/api/v1/estimate_reviews_controller.rb
def create
  # Check for existing processing review
  existing_review = @estimate.estimate_reviews.find_by(status: 'processing')

  if existing_review
    return render json: {
      success: false,
      error: 'AI review already in progress for this estimate'
    }, status: :unprocessable_entity
  end

  review = EstimateReview.create!(estimate: @estimate, status: :pending)
  AiReviewJob.perform_later(@estimate.id)

  render json: { success: true, review_id: review.id, status: 'processing' }, status: :accepted
end
```

**Why this rule exists:**
- Prevents race conditions
- Avoids duplicate Claude API calls (cost savings)
- Ensures clean UI state (single progress indicator)

**Files:**
- `backend/app/controllers/api/v1/estimate_reviews_controller.rb:14-25`

---

## API Endpoints Reference

### POST /api/v1/estimates/:estimate_id/ai_review
**Purpose:** Start AI plan review (async)

**Request:** None

**Response (202 Accepted):**
```json
{
  "success": true,
  "review_id": 123,
  "status": "processing",
  "message": "AI review started. This may take 30-60 seconds."
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "error": "Estimate must be matched to a construction/job before AI review"
}
```

---

### GET /api/v1/estimate_reviews/:id
**Purpose:** Get review status and results (for polling)

**Response (Completed - 200 OK):**
```json
{
  "success": true,
  "review_id": 123,
  "status": "completed",
  "reviewed_at": "2025-11-16T10:30:00Z",
  "confidence_score": 85.5,
  "summary": {
    "items_matched": 12,
    "items_mismatched": 2,
    "items_missing": 1,
    "items_extra": 0,
    "total_discrepancies": 3
  },
  "discrepancies": [...]
}
```

**Response (Processing - 200 OK):**
```json
{
  "success": true,
  "review_id": 123,
  "status": "processing",
  "message": "AI review in progress. Check back in 30-60 seconds."
}
```

---

### GET /api/v1/estimates/:estimate_id/reviews
**Purpose:** List all reviews for an estimate

**Response (200 OK):**
```json
{
  "success": true,
  "reviews": [
    {
      "id": 123,
      "status": "completed",
      "confidence_score": 85.5,
      "total_discrepancies": 3,
      "reviewed_at": "2025-11-16T10:30:00Z",
      "created_at": "2025-11-16T10:15:00Z"
    }
  ]
}
```

---

### DELETE /api/v1/estimate_reviews/:id
**Purpose:** Delete a review record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

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

## RULE #9.3: Company Settings - Working Days & Timezone

❌ **NEVER hardcode working days or ignore company timezone**
✅ **ALWAYS read from:** `company_settings.working_days` and `company_settings.timezone`

**Code location:** `backend/app/services/schedule_cascade_service.rb:175-192`

**Required implementation:**
```ruby
def working_day?(date)
  # CRITICAL: Use company timezone, not server timezone (UTC)
  timezone = @company_settings.timezone || 'UTC'
  date_in_company_tz = date.in_time_zone(timezone)

  working_days = @company_settings.working_days || default_config
  day_name = date_in_company_tz.strftime('%A').downcase
  working_days[day_name] == true
end
```

**Why Timezone Matters:**
- Server runs in UTC (production) or local time (development)
- Company may be in different timezone (e.g., Australia/Sydney)
- `Date.today` in UTC could be different day than company's "today"
- Tasks scheduled for "today" must use **company's today**, not server's today

**Example:**
```ruby
# ❌ WRONG - uses server timezone
reference_date = Date.today  # Could be Saturday in UTC, Sunday in AU
reference_date = Date.current  # Still uses server timezone!

# ✅ CORRECT - uses company timezone
reference_date = CompanySetting.today  # Preferred method
# OR
timezone = CompanySetting.instance.timezone || 'UTC'
reference_date = Time.now.in_time_zone(timezone).to_date
```

**Compliant Code (Backend):**
- ✅ `backend/app/services/schedule_cascade_service.rb:25` - uses `CompanySetting.today`
- ✅ `backend/app/controllers/api/v1/bug_hunter_tests_controller.rb:219` - uses `Time.now.in_time_zone(timezone).to_date`
- ✅ `backend/app/services/schedule/template_instantiator.rb:155` - uses `CompanySetting.today` (fixed 2025-11-16)
- ✅ `backend/app/services/schedule/generator_service.rb:230` - uses `CompanySetting.today` (fixed 2025-11-16)
- ✅ `backend/app/services/schedule/generator_service.rb:258` - uses `CompanySetting.today` (fixed 2025-11-16)

**Compliant Code (Frontend):**
- ✅ `frontend/src/utils/timezoneUtils.js:47-68` - `getTodayInCompanyTimezone()` uses `Intl.DateTimeFormat` (fixed 2025-11-16)
- ✅ `frontend/src/utils/timezoneUtils.js:74-99` - `getNowInCompanyTimezone()` uses `Intl.DateTimeFormat` (fixed 2025-11-16)

**Frontend Timezone Rule:**
```javascript
// ❌ WRONG - toLocaleString creates wrong Date object in browser timezone
const dateInTZ = new Date(now.toLocaleString('en-US', { timeZone: companyTimezone }))

// ✅ CORRECT - Use Intl.DateTimeFormat and parse parts
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
const dateInTZ = new Date(`${year}-${month}-${day}T00:00:00`)
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

**Task status MUST follow defined lifecycle with automatic date population.**

### Status Flow

```ruby
# app/models/project_task.rb
enum status: {
  not_started: 0,
  in_progress: 1,
  complete: 2,
  on_hold: 3
}

# Valid transitions:
# not_started → in_progress → complete
# any status → on_hold → previous status
```

### Automatic Date Updates

✅ **MUST update dates automatically:**

```ruby
# When status changes to in_progress
before_save :set_actual_start_date, if: -> { status_changed? && in_progress? }

def set_actual_start_date
  self.actual_start_date ||= Date.today
end

# When status changes to complete
before_save :set_completion_data, if: -> { status_changed? && complete? }

def set_completion_data
  self.actual_end_date ||= Date.today
  self.progress_percentage = 100
end
```

❌ **NEVER:**
- Allow status to skip lifecycle stages (not_started → complete without in_progress)
- Overwrite existing actual dates when status changes again
- Leave progress_percentage < 100 when status is complete

**Why:**
- Automatic dates provide accurate project tracking
- Progress_percentage = 100 ensures consistent completion state
- Prevents manual errors in date entry

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/project_task.rb`

---

## RULE #10.2: Task Dependencies & Circular Dependency Prevention

**Tasks MUST validate dependency relationships to prevent circular dependencies and enforce project boundaries.**

### Dependency Types

```ruby
# app/models/task_dependency.rb
enum dependency_type: {
  finish_to_start: 0,   # Most common: B starts after A finishes
  start_to_start: 1,    # B starts when A starts
  finish_to_finish: 2,  # B finishes when A finishes
  start_to_finish: 3    # Rare: B finishes when A starts
}
```

### Required Validations

✅ **MUST validate:**

```ruby
# app/models/task_dependency.rb
validates :predecessor_task_id, uniqueness: { scope: :successor_task_id }
validates :dependency_type, presence: true
validate :no_circular_dependencies
validate :same_project

def no_circular_dependencies
  # Check if predecessor has successor in its dependency chain
  visited = Set.new
  check_circular(successor_task, visited)
end

def same_project
  unless predecessor_task.project_id == successor_task.project_id
    errors.add(:base, "Tasks must be in same project")
  end
end
```

❌ **NEVER:**
- Allow task to depend on itself (self-dependency)
- Allow circular chains (A depends on B, B depends on C, C depends on A)
- Allow cross-project dependencies
- Allow duplicate dependencies (same predecessor + successor pair)

**Why:**
- Circular dependencies cause infinite loops in scheduling calculations
- Same-project constraint ensures consistent timeline management
- Prevents logical impossibilities in task ordering

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/task_dependency.rb`

---

## RULE #10.3: Automatic Task Spawning from Templates

**Tasks MUST spawn child tasks automatically based on template configuration and parent task status changes.**

### Spawned Task Types

```ruby
# app/models/project_task.rb
enum spawned_type: {
  photo: 1,
  certificate: 2,
  subtask: 3
}

# spawned_type: nil = normal task (not spawned)
```

### Spawning Logic

✅ **MUST implement via TaskSpawner service:**

```ruby
# app/services/schedule/task_spawner.rb

# Photo Task: Spawned when parent completes, if require_photo: true
def spawn_photo_task(parent_task)
  return unless parent_task.schedule_template_row&.require_photo

  ProjectTask.create!(
    project: parent_task.project,
    name: "📸 Photo - #{parent_task.name}",
    spawned_type: :photo,
    parent_task: parent_task,
    planned_start_date: parent_task.actual_end_date,
    duration_days: 1,
    status: :not_started
  )
end

# Certificate Task: Spawned when parent completes, if require_certificate: true
def spawn_certificate_task(parent_task)
  row = parent_task.schedule_template_row
  return unless row&.require_certificate

  lag_days = row.certificate_lag_days || 0

  ProjectTask.create!(
    project: parent_task.project,
    name: "📜 Certificate - #{parent_task.name}",
    spawned_type: :certificate,
    parent_task: parent_task,
    planned_start_date: parent_task.actual_end_date + lag_days.days,
    duration_days: row.certificate_duration_days || 3,
    status: :not_started
  )
end

# Subtasks: Spawned when parent starts, if has_subtasks: true
def spawn_subtasks(parent_task)
  row = parent_task.schedule_template_row
  return unless row&.has_subtasks

  row.subtask_templates.each_with_index do |template, index|
    ProjectTask.create!(
      project: parent_task.project,
      name: template.name,
      spawned_type: :subtask,
      parent_task: parent_task,
      sequence_order: parent_task.sequence_order + (index + 1) * 0.1,
      planned_start_date: parent_task.planned_start_date,
      duration_days: template.duration_days,
      status: :not_started
    )
  end
end
```

### Spawning Triggers

✅ **MUST trigger spawning on status changes:**

```ruby
# app/models/project_task.rb
after_save :spawn_child_tasks, if: :status_changed?

def spawn_child_tasks
  if complete? && saved_change_to_status?
    Schedule::TaskSpawner.new.spawn_photo_task(self)
    Schedule::TaskSpawner.new.spawn_certificate_task(self)
  end

  if in_progress? && saved_change_to_status?
    Schedule::TaskSpawner.new.spawn_subtasks(self)
  end
end
```

❌ **NEVER:**
- Spawn tasks multiple times (check if already spawned)
- Spawn tasks without checking template configuration
- Create circular parent-child relationships
- Skip sequence ordering for subtasks (causes display chaos)

**Why:**
- Automation reduces manual overhead
- Photo/certificate tasks ensure compliance documentation
- Subtasks allow detailed work breakdown
- Sequence ordering keeps related tasks together in UI

**File Reference:** `/Users/rob/Projects/trapid/backend/app/services/schedule/task_spawner.rb`

---

## RULE #10.4: Supervisor Checklist Template-to-Instance Flow

**Supervisor checklist templates MUST be copied to ProjectTask instances during job creation.**

### Template Definition

```ruby
# app/models/supervisor_checklist_template.rb
class SupervisorChecklistTemplate < ApplicationRecord
  validates :name, presence: true
  validates :category, inclusion: {
    in: %w[Safety Quality Pre-Start Completion Documentation]
  }
  validates :response_type, inclusion: {
    in: %w[checkbox photo note photo_and_note]
  }

  has_many :schedule_template_row_checklists
  has_many :schedule_template_rows, through: :schedule_template_row_checklists
end
```

### Instance Creation

✅ **MUST copy templates to instances during job instantiation:**

```ruby
# app/services/schedule/template_instantiator.rb
def create_checklist_items_for_task(project_task)
  row = project_task.schedule_template_row
  return unless row

  row.supervisor_checklist_templates.each do |template|
    ProjectTaskChecklistItem.create!(
      project_task: project_task,
      name: template.name,
      description: template.description,
      category: template.category,
      response_type: template.response_type,
      sequence_order: template.sequence_order,
      is_completed: false
    )
  end
end
```

### Required Fields

✅ **ProjectTaskChecklistItem MUST include:**

```ruby
# app/models/project_task_checklist_item.rb
validates :name, presence: true
validates :response_type, inclusion: {
  in: %w[checkbox photo note photo_and_note]
}

# Completion tracking
attribute :is_completed, :boolean, default: false
attribute :completed_at, :datetime
attribute :completed_by, :string  # Username, not FK

# Response data
attribute :response_note, :text
attribute :response_photo_url, :string
```

❌ **NEVER:**
- Share checklist items across tasks (each task gets own copies)
- Allow checklist item deletion after task starts
- Skip category validation (required for filtering)
- Store User FK for completed_by (store username string for flexibility)

**Why:**
- Template-to-instance pattern allows reuse without coupling
- Each task needs independent checklist completion tracking
- Username string supports future external supervisor check-ins
- Category grouping improves UX in mobile checklist views

**File References:**
- `/Users/rob/Projects/trapid/backend/app/models/supervisor_checklist_template.rb`
- `/Users/rob/Projects/trapid/backend/app/models/project_task_checklist_item.rb`
- `/Users/rob/Projects/trapid/backend/app/services/schedule/template_instantiator.rb`

---

## RULE #10.5: Response Type Validation & Photo Upload

**Checklist items MUST validate response data based on response_type.**

### Response Types

```ruby
# Valid response types:
# - checkbox: Simple completion toggle
# - photo: Requires photo upload
# - note: Requires text response
# - photo_and_note: Requires both photo AND note
```

### Validation Logic

✅ **MUST validate before marking complete:**

```ruby
# app/models/project_task_checklist_item.rb
validate :response_data_present, if: :is_completed?

def response_data_present
  case response_type
  when 'checkbox'
    # No additional data required
  when 'photo'
    errors.add(:response_photo_url, "required") if response_photo_url.blank?
  when 'note'
    errors.add(:response_note, "required") if response_note.blank?
  when 'photo_and_note'
    errors.add(:response_photo_url, "required") if response_photo_url.blank?
    errors.add(:response_note, "required") if response_note.blank?
  end
end
```

### Photo Upload via Cloudinary

✅ **MUST use Cloudinary for photo storage:**

```ruby
# Frontend component: SupervisorChecklistItemRow.jsx
const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'supervisor_checklist'); // Cloudinary preset
  formData.append('folder', `jobs/${jobId}/checklists`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  return data.secure_url; // Store this in response_photo_url
};
```

❌ **NEVER:**
- Allow completion without required response data
- Store photos in Rails backend (use Cloudinary)
- Skip folder organization in Cloudinary (use job-specific folders)
- Allow checklist item updates after completion (completed_at is immutable)

**Why:**
- Response validation ensures documentation quality
- Cloudinary provides CDN, image optimization, and unlimited storage
- Job-specific folders enable easy bulk export/archival
- Immutable completion data prevents tampering

**File Reference:** `/Users/rob/Projects/trapid/frontend/src/components/schedule-master/SupervisorChecklistItemRow.jsx`

---

## RULE #10.6: Auto-Complete Predecessors Feature

**Tasks with auto_complete_predecessors = true MUST auto-complete all predecessor tasks when marked complete.**

### Feature Purpose

This feature prevents blocking on forgotten prerequisite tasks. When a downstream task completes, it proves the upstream work is done.

### Implementation

✅ **MUST implement via callback:**

```ruby
# app/models/project_task.rb
after_save :complete_predecessors, if: -> {
  auto_complete_predecessors? &&
  complete? &&
  saved_change_to_status?
}

def complete_predecessors
  predecessor_tasks = TaskDependency
    .where(successor_task_id: id)
    .includes(:predecessor_task)
    .map(&:predecessor_task)

  predecessor_tasks.each do |task|
    next if task.complete?

    task.update!(
      status: :complete,
      actual_end_date: Date.today,
      progress_percentage: 100,
      completion_notes: "Auto-completed by successor task: #{name}"
    )
  end
end
```

### UI Indicator

✅ **MUST show checkbox in task form:**

```jsx
// TaskEditModal.jsx
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={task.auto_complete_predecessors || false}
    onChange={(e) => setTask({
      ...task,
      auto_complete_predecessors: e.target.checked
    })}
  />
  <span>Auto-complete predecessor tasks when this task completes</span>
  <Tooltip>
    If enabled, marking this task complete will automatically complete
    all tasks it depends on (proving they're done).
  </Tooltip>
</label>
```

❌ **NEVER:**
- Auto-complete tasks with incomplete subtasks (check has_subtasks)
- Skip audit trail (add completion_notes explaining auto-completion)
- Allow infinite recursion (predecessors don't trigger their own predecessors)
- Auto-complete milestones (they should be explicitly completed)

**Why:**
- Reduces admin burden for long dependency chains
- Proves prerequisite work is complete (otherwise downstream couldn't finish)
- Prevents blocker syndrome where 90% tasks stuck on forgotten 10% tasks
- Completion notes provide transparency on why task auto-completed

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/project_task.rb` (lines 150-165)

---

## RULE #10.7: Materials Status Calculation

**Tasks linked to purchase orders MUST calculate materials_status based on delivery vs start dates.**

### Calculated Field

This is a **calculated field** (not stored), returned in API responses:

```ruby
# app/models/project_task.rb
def materials_status
  return 'no_po' unless purchase_order

  delivery_date = purchase_order.estimated_delivery_date
  return 'no_po' unless delivery_date

  if delivery_date <= planned_start_date
    'on_time'
  else
    'delayed'
  end
end
```

### API Response

✅ **MUST include in task serialization:**

```ruby
# app/controllers/api/v1/project_tasks_controller.rb
def show
  task = ProjectTask.find(params[:id])

  render json: {
    id: task.id,
    name: task.name,
    status: task.status,
    planned_start_date: task.planned_start_date,
    purchase_order_id: task.purchase_order_id,
    materials_status: task.materials_status, # ← Include calculated field
    # ... other fields
  }
end
```

### UI Indicators

✅ **MUST show status badges:**

```jsx
// TaskRow.jsx
const MaterialsBadge = ({ status }) => {
  const badges = {
    no_po: { text: 'No PO', color: 'gray' },
    on_time: { text: 'Materials On Time', color: 'green' },
    delayed: { text: 'Materials Delayed', color: 'red' }
  };

  const { text, color } = badges[status];

  return (
    <span className={`badge badge-${color}`}>
      {text}
    </span>
  );
};
```

❌ **NEVER:**
- Store materials_status in database (always calculate)
- Show materials status for tasks without critical_po flag
- Allow task to start if materials_status = 'delayed' (warn user)
- Skip materials check during schedule cascade calculations

**Why:**
- Real-time calculation prevents stale data
- Prevents crew arriving on site without materials
- Critical_po flag identifies tasks that MUST wait for deliveries
- Early warning system for procurement delays

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/project_task.rb` (lines 180-195)

---

## RULE #10.8: Sequence Order for Task Display

**Tasks MUST use decimal sequence_order to maintain parent-child proximity in sorted lists.**

### Sequence Strategy

```ruby
# Normal tasks: Integer sequence (1, 2, 3, ...)
# Spawned subtasks: Parent + 0.1 increments (2.1, 2.2, 2.3, ...)

# Example:
# 1.0 - Foundation
# 2.0 - Framing
#   2.1 - 📸 Photo - Framing  (spawned)
#   2.2 - 📜 Certificate - Framing Structure (spawned)
# 3.0 - Roofing
#   3.1 - Install trusses (subtask)
#   3.2 - Install sheets (subtask)
#   3.3 - Install gutters (subtask)
# 4.0 - Electrical
```

### Implementation

✅ **MUST set sequence on creation:**

```ruby
# app/services/schedule/task_spawner.rb
def spawn_subtasks(parent_task)
  row = parent_task.schedule_template_row
  return unless row&.has_subtasks

  row.subtask_templates.each_with_index do |template, index|
    ProjectTask.create!(
      # ... other fields
      sequence_order: parent_task.sequence_order + (index + 1) * 0.1,
      parent_task: parent_task
    )
  end
end

# For new top-level tasks:
def next_sequence_order(project)
  max = project.tasks.maximum(:sequence_order) || 0
  max.ceil + 1.0  # Always round up to next integer
end
```

### Database Index

✅ **MUST index for efficient sorting:**

```ruby
# db/migrate/..._add_sequence_order_to_project_tasks.rb
add_column :project_tasks, :sequence_order, :decimal, precision: 10, scale: 2
add_index :project_tasks, [:project_id, :sequence_order]
```

❌ **NEVER:**
- Use random sequence numbers (breaks visual grouping)
- Allow gaps larger than 1.0 between top-level tasks
- Use sequence > 9.9 for subtasks (use 9 or fewer subtasks per parent)
- Resort entire project when adding one task (use smart insertion)

**Why:**
- Decimal allows infinite insertion between existing tasks
- Parent-child proximity improves UX (related tasks grouped)
- Indexed sorting prevents N+1 queries on large task lists
- Predictable ordering simplifies drag-and-drop reordering

**File Reference:** `/Users/rob/Projects/trapid/backend/db/schema.rb` (project_tasks table)

---

## RULE #10.9: Task Update Audit Trail

**INCOMPLETE FEATURE - Task status/progress changes SHOULD be logged to TaskUpdate model for history tracking.**

### Intended Design

```ruby
# app/models/task_update.rb (DOES NOT EXIST YET)
class TaskUpdate < ApplicationRecord
  belongs_to :project_task
  belongs_to :user, optional: true

  validates :update_type, inclusion: {
    in: %w[status_change progress_update note_added assignment_changed]
  }
  validates :old_value, presence: true, if: -> { update_type.ends_with?('_change') }
  validates :new_value, presence: true
end

# Intended usage:
# app/models/project_task.rb
after_save :log_status_change, if: :saved_change_to_status?

def log_status_change
  TaskUpdate.create!(
    project_task: self,
    user: Current.user,
    update_type: 'status_change',
    old_value: saved_change_to_status[0],
    new_value: saved_change_to_status[1],
    timestamp: Time.current
  )
end
```

### Current Status

🔴 **NOT IMPLEMENTED:**
- TaskUpdate model does not exist
- No audit trail for task changes
- No "activity feed" in task detail view
- No rollback capability

### Recommendation

✅ **WHEN IMPLEMENTING:**
- Create TaskUpdate model with polymorphic support (for checklist items too)
- Log status changes, progress updates, assignment changes, note additions
- Store Current.user for attribution
- Add API endpoint: `GET /api/v1/project_tasks/:id/updates`
- Show activity feed in TaskDetailModal

❌ **DON'T:**
- Log every field change (too noisy) - only status, progress, assignment, notes
- Store full task snapshots (use old_value/new_value for changed field only)
- Allow TaskUpdate deletion (immutable audit log)

**Why this is important:**
- Construction projects require detailed audit trails for disputes
- Task history helps diagnose why deadlines were missed
- User attribution prevents "who changed this?" mysteries
- Supports compliance documentation

**File Reference:** N/A (feature not implemented)

---

## RULE #10.10: Duration Days Validation

**Tasks MUST have duration_days >= 1 (no zero-day or negative durations).**

### Validation

✅ **MUST validate:**

```ruby
# app/models/project_task.rb
validates :duration_days, presence: true, numericality: {
  greater_than_or_equal_to: 1,
  only_integer: true
}
```

### Calculation Impact

```ruby
# Planned end date calculation
def planned_end_date
  return nil unless planned_start_date && duration_days

  planned_start_date + (duration_days - 1).days
end

# Example:
# Start: Jan 1, Duration: 1 day → End: Jan 1 (same day)
# Start: Jan 1, Duration: 3 days → End: Jan 3
```

❌ **NEVER:**
- Allow duration_days = 0 (causes same-day start/end, confusing)
- Allow negative durations (logically impossible)
- Skip duration validation on updates
- Use decimal durations (always integer days)

**Why:**
- Minimum 1-day duration prevents same-day confusion
- Integer days simplify schedule calculations
- Enforces realistic project planning
- Prevents date calculation errors in cascade logic

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/project_task.rb` (validations)

---

## RULE #10.11: Tags System for Flexible Categorization

**Tasks MAY use JSONB tags array for flexible categorization beyond category field.**

### Schema

```ruby
# db/migrate/..._add_tags_to_project_tasks.rb
add_column :project_tasks, :tags, :jsonb, default: []
add_index :project_tasks, :tags, using: :gin
```

### Usage Patterns

✅ **RECOMMENDED tag patterns:**

```ruby
# Trade-based tags
tags: ['plumbing', 'electrical', 'carpentry']

# Priority tags
tags: ['urgent', 'client_facing', 'weather_dependent']

# Location tags
tags: ['first_floor', 'exterior', 'garage']

# Custom workflow tags
tags: ['requires_permit', 'council_inspection', 'engineer_signoff']
```

### Querying

✅ **MUST use GIN index for efficient queries:**

```ruby
# Find tasks with specific tag
ProjectTask.where("tags @> ?", ['urgent'].to_json)

# Find tasks with any of multiple tags
ProjectTask.where("tags ?| array[:tags]", tags: ['plumbing', 'electrical'])

# Find tasks with all of multiple tags
ProjectTask.where("tags @> ?", ['urgent', 'client_facing'].to_json)
```

### API Response

✅ **MUST include tags in serialization:**

```ruby
# app/controllers/api/v1/project_tasks_controller.rb
render json: {
  id: task.id,
  name: task.name,
  tags: task.tags || [],  # Always return array, never nil
  # ... other fields
}
```

❌ **NEVER:**
- Store tags as comma-separated string (use JSONB array)
- Allow duplicate tags in array
- Skip GIN index (queries will be slow)
- Use tags for data that should be proper associations (e.g., don't tag "assigned_to_john", use assigned_to FK)

**Why:**
- JSONB + GIN index provides fast querying
- Flexible categorization without schema changes
- Supports custom workflows per company
- Array structure prevents duplicates and simplifies frontend

**File Reference:** `/Users/rob/Projects/trapid/backend/db/schema.rb` (project_tasks.tags column)

---

## Protected Code Patterns

### 1. Task Spawning Service

**File:** `/Users/rob/Projects/trapid/backend/app/services/schedule/task_spawner.rb`

**DO NOT modify these methods without understanding Schedule Master integration:**

```ruby
class Schedule::TaskSpawner
  def spawn_photo_task(parent_task)
    # Called when parent task marked complete
  end

  def spawn_certificate_task(parent_task)
    # Called when parent task marked complete
    # Respects certificate_lag_days from template
  end

  def spawn_subtasks(parent_task)
    # Called when parent task marked in_progress
    # Uses sequence_order for proper display ordering
  end
end
```

**Reason:** Task spawning is tightly coupled with Schedule Master template system. Changes here affect job instantiation.

---

### 2. Circular Dependency Check

**File:** `/Users/rob/Projects/trapid/backend/app/models/task_dependency.rb`

**DO NOT modify without graph theory expertise:**

```ruby
validate :no_circular_dependencies

def no_circular_dependencies
  visited = Set.new
  check_circular(successor_task, visited)
end

private

def check_circular(task, visited)
  return if task.nil?

  if visited.include?(task.id)
    errors.add(:base, "Circular dependency detected")
    return
  end

  visited.add(task.id)

  task.predecessor_dependencies.each do |dep|
    check_circular(dep.predecessor_task, visited.dup)
  end
end
```

**Reason:** Incorrect implementation causes infinite loops or missed circular references.

---

### 3. Template Instantiation

**File:** `/Users/rob/Projects/trapid/backend/app/services/schedule/template_instantiator.rb`

**DO NOT skip checklist item creation:**

```ruby
def create_checklist_items_for_task(project_task)
  row = project_task.schedule_template_row
  return unless row

  row.supervisor_checklist_templates.each do |template|
    ProjectTaskChecklistItem.create!(
      project_task: project_task,
      name: template.name,
      # ... copy template fields
    )
  end
end
```

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

**PublicHoliday records MUST be unique by date + region combination.**

✅ **MUST:**
- Validate uniqueness: `validates :date, uniqueness: { scope: :region }`
- Use region codes: QLD, NSW, VIC, SA, WA, TAS, NT, NZ
- Store date in UTC (no time component)

❌ **NEVER:**
- Allow duplicate holidays for same date + region
- Use inconsistent region codes
- Store holidays with time components

**Implementation:**
```ruby
# app/models/public_holiday.rb
validates :name, presence: true
validates :date, presence: true, uniqueness: { scope: :region }
validates :region, presence: true
```

**Database constraint:**
```sql
UNIQUE(date, region)
```

**Why this rule exists:**
- Prevents data duplication
- Ensures single source of truth for holiday checking
- Region scoping allows different holidays per state (e.g., QLD vs NSW Labour Day dates differ)

**Files:**
- `backend/app/models/public_holiday.rb:3-5`
- `backend/db/migrate/20251111122612_create_public_holidays.rb`

---

## RULE #11.2: Rain Log - One Entry Per Construction Per Day

**RainLog records MUST be unique by construction_id + date.**

✅ **MUST:**
- Enforce uniqueness at database level: `UNIQUE(construction_id, date)`
- Check for existing log before auto-creation
- Use `find_or_initialize_by` pattern for updates

❌ **NEVER:**
- Create multiple rain logs for same job + date
- Override existing automatic logs without checking source
- Allow future-dated rain logs

**Implementation:**
```ruby
# app/models/rain_log.rb
validate :date_cannot_be_in_future

def date_cannot_be_in_future
  errors.add(:date, "can't be in the future") if date.present? && date > Date.current
end

# app/jobs/check_yesterday_rain_job.rb
existing_log = construction.rain_logs.find_by(date: yesterday)
next if existing_log  # Skip if already logged
```

**Why this rule exists:**
- Prevents data duplication
- Automatic job doesn't override manual entries
- Future dates prevented (can't log rain that hasn't happened)
- Ensures clean reporting

**Files:**
- `backend/app/models/rain_log.rb:15-18`
- `backend/db/migrate/20251113082745_create_rain_logs.rb`

---

## RULE #11.3: Rainfall Severity Auto-Calculation

**Severity MUST be auto-calculated from rainfall_mm when present.**

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

**Implementation:**
```ruby
# app/models/rain_log.rb
def self.calculate_severity(rainfall_mm)
  return nil if rainfall_mm.nil? || rainfall_mm.zero?
  rainfall_mm < 5 ? 'light' : rainfall_mm < 15 ? 'moderate' : 'heavy'
end

def auto_calculate_severity!
  calculated = self.class.calculate_severity(rainfall_mm)
  update_column(:severity, calculated) if calculated
end

# After create/update callbacks
after_save :auto_calculate_severity!, if: :rainfall_mm_changed?
```

**Why this rule exists:**
- Ensures consistent severity classification
- Eliminates human judgment variability
- Allows filtering by severity for impact analysis
- Construction industry standard thresholds

**Files:**
- `backend/app/models/rain_log.rb:30-35`

---

## RULE #11.4: Manual Rain Logs Require Notes

**Manual rain log entries MUST include notes explaining the entry.**

✅ **MUST:**
- Validate presence: `validates :notes, presence: true, if: :source_manual?`
- Display notes in UI for audit trail
- Include who created the entry (`created_by_user_id`)

❌ **NEVER:**
- Allow blank notes for manual entries
- Skip audit trail for manual modifications
- Allow automatic entries to have editable notes

**Implementation:**
```ruby
# app/models/rain_log.rb
belongs_to :created_by_user, class_name: 'User', optional: true

enum :source, {
  automatic: 'automatic',
  manual: 'manual'
}, prefix: true

validates :notes, presence: true, if: :source_manual?
```

**Why this rule exists:**
- Accountability for manual entries
- Dispute resolution (contractor vs client disagreements)
- Audit trail for insurance claims
- Prevents silent data manipulation

**Files:**
- `backend/app/models/rain_log.rb:11-13`

---

## RULE #11.5: Weather API - Historical Data Only

**WeatherAPI MUST only be called for historical dates (yesterday or earlier).**

✅ **MUST:**
- Validate date is not in future before API call
- Use `Date.yesterday` for automatic checks
- Raise `ArgumentError` if future date provided

❌ **NEVER:**
- Call weather API for today or future dates
- Use weather forecasts (not historical data)
- Proceed with API call if date validation fails

**Implementation:**
```ruby
# app/services/weather_api_client.rb
def fetch_historical(location, date)
  raise ArgumentError, 'Date cannot be in the future' if date > Date.current

  url = build_url('/history.json', {
    q: location,
    dt: date.strftime('%Y-%m-%d')
  })

  response = make_request(url)
  parse_response(response)
end
```

**Why this rule exists:**
- WeatherAPI free tier only includes historical data
- Forecasts are inaccurate for rain logging purposes
- Prevents unnecessary API calls
- Ensures data integrity (only log actual rainfall)

**Files:**
- `backend/app/services/weather_api_client.rb:14-18`
- `backend/app/jobs/check_yesterday_rain_job.rb:11`

---

## RULE #11.6: Location Extraction Priority

**Job location MUST be extracted in priority order: location field → site_address → job title.**

✅ **MUST follow priority:**
1. `construction.location` (if present)
2. `construction.project.site_address` (extract suburb)
3. `construction.title` (parse after dash)

❌ **NEVER:**
- Use random location extraction order
- Fail silently if location cannot be determined
- Use company address as fallback (wrong location)

**Implementation:**
```ruby
# app/jobs/check_yesterday_rain_job.rb
def extract_location(construction)
  # Priority 1: Explicit location field
  return construction.location if construction.location.present?

  # Priority 2: Parse site_address (extract suburb)
  if construction.project&.site_address.present?
    address = construction.project.site_address
    parts = address.split(',').map(&:strip)
    return parts[-2] if parts.length > 1  # Suburb is second-to-last
  end

  # Priority 3: Extract from title (e.g., "House Build - Bondi")
  if construction.title.include?('-')
    potential_location = construction.title.split('-').last.strip
    return potential_location if potential_location.present?
  end

  nil  # Skip if location cannot be determined
end
```

**Why this rule exists:**
- Explicit location is most accurate
- Site address parsing is second-best (actual job location)
- Title parsing is fallback for legacy jobs
- Prevents API calls with invalid locations

**Files:**
- `backend/app/jobs/check_yesterday_rain_job.rb:45-65`

---

## RULE #11.7: Gantt Integration - Working Day Calculation

**Schedule cascade MUST respect both working_days and public holidays.**

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

**Implementation:**
```ruby
# app/services/schedule_cascade_service.rb
def working_day?(date)
  working_days = @company_settings.working_days || default_working_days
  day_name = date.strftime('%A').downcase
  working_days[day_name] == true && !@holidays.include?(date)
end

def skip_to_next_working_day(day_offset)
  actual_date = @reference_date + day_offset.days

  while !working_day?(actual_date)
    actual_date += 1.day
  end

  (actual_date - @reference_date).to_i
end

def load_holidays
  today = CompanySetting.today
  year_range = (today.year..today.year + 2)

  holiday_dates = PublicHoliday
    .for_region(@region)
    .where('EXTRACT(YEAR FROM date) IN (?)', year_range.to_a)
    .pluck(:date)

  Set.new(holiday_dates)  # O(1) lookup
end
```

**Lock Hierarchy (prevents adjustment):**
1. `supplier_confirm?` - Highest
2. `confirm?`
3. `start?`
4. `complete?`
5. `manually_positioned?` - Lowest

**Why this rule exists:**
- Accurate project completion dates
- Respects company-specific working days (e.g., Sunday work in QLD construction)
- Prevents tasks scheduled on public holidays
- Lock hierarchy prevents overriding confirmed dates

**Files:**
- `backend/app/services/schedule_cascade_service.rb:180-220`
- Chapter 9 (Gantt) RULE #9.2, #9.3

---

## RULE #11.8: Weather API Response Storage

**Full weather API response MUST be stored in weather_api_response JSONB field.**

✅ **MUST:**
- Store complete API JSON response
- Include location confirmation data
- Preserve all weather metrics (temp, condition, etc.)
- Use for future analysis and verification

❌ **NEVER:**
- Store only rainfall value
- Discard API response after extraction
- Modify API response before storage

**Implementation:**
```ruby
# app/services/weather_api_client.rb
def parse_response(response)
  day_data = response.dig('forecast', 'forecastday', 0, 'day')

  {
    rainfall_mm: day_data['totalprecip_mm'].to_f,
    date: response.dig('forecast', 'forecastday', 0, 'date'),
    location: response.dig('location', 'name'),
    region: response.dig('location', 'region'),
    country: response.dig('location', 'country'),
    max_temp_c: day_data['maxtemp_c'].to_f,
    min_temp_c: day_data['mintemp_c'].to_f,
    condition: day_data.dig('condition', 'text'),
    raw_response: response  # Full API JSON
  }
end

# app/jobs/check_yesterday_rain_job.rb
rain_log = construction.rain_logs.create!(
  rainfall_mm: weather_data[:rainfall_mm],
  severity: RainLog.calculate_severity(weather_data[:rainfall_mm]),
  source: 'automatic',
  weather_api_response: weather_data[:raw_response]  # Store full response
)
```

**Why this rule exists:**
- Future analysis (temperature correlations, etc.)
- Dispute resolution (verify API data)
- Location verification (confirm API matched correct suburb)
- Free additional data for potential features

**Files:**
- `backend/app/services/weather_api_client.rb:55-70`
- `backend/app/models/rain_log.rb` (schema: `weather_api_response: jsonb`)

---

## API Endpoints Reference

### GET /api/v1/public_holidays
**Purpose:** List public holidays with filtering

**Query Params:**
- `region` (optional) - QLD, NSW, VIC, etc. (default: QLD)
- `year` (optional) - Filter by specific year

**Response (200 OK):**
```json
{
  "holidays": [
    {
      "id": 1,
      "name": "New Year's Day",
      "date": "2025-01-01",
      "region": "QLD"
    }
  ]
}
```

---

### GET /api/v1/public_holidays/dates
**Purpose:** Get array of holiday dates (optimized for Gantt view)

**Query Params:**
- `region` (optional) - Default: QLD
- `year_start` (optional) - Default: current year
- `year_end` (optional) - Default: current year + 2

**Response (200 OK):**
```json
{
  "dates": ["2025-01-01", "2025-01-27", "2025-04-18", "2025-04-19"]
}
```

---

### GET /api/v1/constructions/:construction_id/rain_logs
**Purpose:** List rain logs for a job

**Query Params:**
- `start_date` (optional) - Filter from date
- `end_date` (optional) - Filter to date
- `source` (optional) - automatic, manual

**Response (200 OK):**
```json
{
  "rain_logs": [
    {
      "id": 1,
      "construction_id": 5,
      "date": "2025-01-15",
      "rainfall_mm": 12.50,
      "hours_affected": 4.00,
      "severity": "moderate",
      "source": "automatic",
      "notes": null,
      "created_by_user": null,
      "created_at": "2025-01-16T00:05:00Z"
    }
  ]
}
```

---

### POST /api/v1/constructions/:construction_id/rain_logs
**Purpose:** Create manual rain log entry

**Request Body:**
```json
{
  "rain_log": {
    "date": "2025-01-15",
    "rainfall_mm": 25.0,
    "hours_affected": 8.0,
    "notes": "Heavy rain all day, crew sent home at noon"
  }
}
```

**Response (201 Created):**
```json
{
  "rain_log": {
    "id": 10,
    "severity": "heavy",
    "source": "manual",
    ...
  }
}
```

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

**Outlook credentials MUST use singleton pattern - one credential per organization.**

### Implementation

✅ **MUST implement as singleton:**

```ruby
# app/models/organization_outlook_credential.rb
class OrganizationOutlookCredential < ApplicationRecord
  encrypts :access_token, :refresh_token

  def self.current
    first_or_create!
  end

  def needs_refresh?
    expires_at.nil? || Time.current >= expires_at - 5.minutes
  end
end
```

### Token Refresh

✅ **MUST auto-refresh tokens before expiration:**

```ruby
# app/services/outlook_service.rb
def ensure_valid_token
  credential = OrganizationOutlookCredential.current

  if credential.needs_refresh?
    refresh_access_token(credential)
  end

  credential.access_token
end

def refresh_access_token(credential)
  response = HTTParty.post("https://login.microsoftonline.com/#{tenant}/oauth2/v2.0/token", {
    body: {
      client_id: ENV['OUTLOOK_CLIENT_ID'],
      client_secret: ENV['OUTLOOK_CLIENT_SECRET'],
      refresh_token: credential.refresh_token,
      grant_type: 'refresh_token'
    }
  })

  credential.update!(
    access_token: response['access_token'],
    refresh_token: response['refresh_token'],
    expires_at: Time.current + response['expires_in'].seconds
  )
end
```

❌ **NEVER:**
- Store multiple Outlook credentials (one organization = one credential)
- Store tokens unencrypted
- Let tokens expire without auto-refresh
- Hardcode token expiration buffer (always use 5-minute safety margin)

**Why:**
- Single tenant architecture = one shared inbox
- Auto-refresh prevents OAuth reauthorization interruptions
- Encrypted tokens protect organization email access
- 5-minute buffer prevents race conditions

**File Reference:** `/Users/rob/Projects/trapid/backend/app/models/organization_outlook_credential.rb`

---

## RULE #13.2: Four-Strategy Email-to-Job Matching

**Emails MUST use cascading strategy to auto-match to constructions.**

### Matching Strategies (Priority Order)

✅ **MUST implement all 4 strategies:**

```ruby
# app/services/email_parser_service.rb
def match_construction(email_data)
  # Strategy 1: Job reference in subject (highest priority)
  if email_data[:subject] =~ /#(\d+)/ || email_data[:subject] =~ /JOB-(\d+)/
    construction = Construction.find_by(reference_number: $1)
    return construction if construction
  end

  # Strategy 2: Job reference in body
  if email_data[:body] =~ /#(\d+)/ || email_data[:body] =~ /JOB-(\d+)/
    construction = Construction.find_by(reference_number: $1)
    return construction if construction
  end

  # Strategy 3: Sender email matches contact
  contact = Contact.find_by(email: email_data[:from])
  if contact
    # Return most recent active job for this contact
    return contact.constructions.active.order(created_at: :desc).first
  end

  # Strategy 4: Address matching (fuzzy)
  extract_addresses_from_email(email_data).each do |address|
    construction = Construction.where("address ILIKE ?", "%#{address}%").first
    return construction if construction
  end

  # No match found
  nil
end
```

### Auto-Assignment on Creation

✅ **MUST auto-assign on email creation:**

```ruby
# app/controllers/api/v1/emails_controller.rb
def create
  email_data = parse_email_params(params)

  matched_construction = EmailParserService.new.match_construction(email_data)

  email = Email.create!(
    construction: matched_construction,  # May be nil if no match
    from_email: email_data[:from],
    subject: email_data[:subject],
    body_text: email_data[:body],
    # ... other fields
  )

  render json: email
end
```

❌ **NEVER:**
- Skip matching strategies (must try all 4 in order)
- Match to inactive/archived jobs
- Auto-assign to wrong construction (false positive worse than nil)
- Allow email creation without attempting match

**Why:**
- Job reference (#123 or JOB-123) is most reliable indicator
- Contact-based matching handles ongoing correspondence
- Address matching catches forwarded emails
- Priority order prevents false positives

**File Reference:** `/Users/rob/Projects/trapid/backend/app/services/email_parser_service.rb`

---

## RULE #13.3: Microsoft Graph API Usage Pattern

**Outlook API calls MUST use Microsoft Graph v1.0 with OData filters.**

### API Client Pattern

✅ **MUST use Graph API v1.0:**

```ruby
# app/services/outlook_service.rb
GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"

def search_emails(query: nil, folder: 'inbox', max_results: 50)
  token = ensure_valid_token

  # Build OData filter
  filter_parts = []
  filter_parts << "receivedDateTime ge #{30.days.ago.iso8601}" if folder == 'inbox'
  filter_parts << "(contains(subject,'#{query}') or contains(body/content,'#{query}'))" if query

  params = {
    '$filter' => filter_parts.join(' and '),
    '$top' => max_results,
    '$select' => 'id,subject,from,toRecipients,ccRecipients,receivedDateTime,hasAttachments,body',
    '$orderby' => 'receivedDateTime desc'
  }

  response = HTTParty.get(
    "#{GRAPH_API_BASE}/me/mailFolders/#{folder}/messages",
    headers: { 'Authorization' => "Bearer #{token}" },
    query: params
  )

  response.parsed_response['value']
end
```

### Required OAuth Scopes

✅ **MUST request these scopes:**

```ruby
# app/controllers/api/v1/outlook_controller.rb
REQUIRED_SCOPES = [
  'Mail.Read',              # Read emails
  'MailboxSettings.Read',   # Read settings/folders
  'offline_access'          # Refresh token support
].freeze

def auth_url
  params = {
    client_id: ENV['OUTLOOK_CLIENT_ID'],
    redirect_uri: "#{ENV['FRONTEND_URL']}/settings/outlook/callback",
    scope: REQUIRED_SCOPES.join(' '),
    response_type: 'code',
    response_mode: 'query'
  }

  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?#{params.to_query}"
end
```

❌ **NEVER:**
- Use Outlook REST API v2.0 (deprecated, use Graph API)
- Request more scopes than needed (principle of least privilege)
- Skip $select parameter (bandwidth waste - emails can be large)
- Use synchronous API calls without pagination

**Why:**
- Graph API v1.0 is stable, v2.0 deprecated
- OData filters reduce bandwidth and processing
- Minimal scopes reduce security risk
- Pagination prevents memory issues with large mailboxes

**File Reference:** `/Users/rob/Projects/trapid/backend/app/services/outlook_service.rb`

---

## RULE #13.4: Email Threading Support via Message-ID

**Emails MUST store message_id, in_reply_to, and references for conversation threading.**

### Schema Requirements

✅ **MUST include threading fields:**

```ruby
# db/schema.rb
create_table :emails do |t|
  t.string :message_id, null: false, index: { unique: true }
  t.string :in_reply_to      # Message-ID of parent email
  t.text :references         # Space-separated list of ancestor message IDs

  # ... other fields
end
```

### Threading Logic

✅ **MUST populate threading fields:**

```ruby
# app/services/email_parser_service.rb
def extract_threading_info(raw_email_headers)
  {
    message_id: raw_email_headers['Message-ID']&.value,
    in_reply_to: raw_email_headers['In-Reply-To']&.value,
    references: raw_email_headers['References']&.value
  }
end

# Controller usage:
email = Email.create!(
  message_id: threading_info[:message_id],
  in_reply_to: threading_info[:in_reply_to],
  references: threading_info[:references],
  # ... other fields
)
```

### Conversation Grouping (Future)

✅ **INTENDED pattern for UI threading:**

```ruby
# app/models/email.rb
def conversation_root
  return self if in_reply_to.blank?
  Email.find_by(message_id: in_reply_to)
end

def conversation_thread
  # Get all emails in this thread
  root = conversation_root
  Email.where("message_id = ? OR references LIKE ?", root.message_id, "%#{root.message_id}%")
       .order(:received_at)
end
```

❌ **NEVER:**
- Allow duplicate message_id (unique constraint required)
- Skip message_id extraction (breaks threading)
- Store references as array (use text with space-separated values per RFC 2822)

**Why:**
- Message-ID is unique email identifier (RFC 5322)
- In-Reply-To + References enable conversation threading
- Threading improves UX for back-and-forth email exchanges
- Prepares for future conversation view UI

**File Reference:** `/Users/rob/Projects/trapid/backend/db/migrate/20251111021525_create_emails.rb`

---

## RULE #13.5: Webhook Support for Email Services

**Email webhook endpoint MUST accept payloads from SendGrid, Mailgun, etc.**

### Webhook Endpoint

✅ **MUST implement webhook receiver:**

```ruby
# app/controllers/api/v1/emails_controller.rb
def webhook
  # Parse incoming webhook payload (varies by service)
  email_data = case request.headers['User-Agent']
  when /SendGrid/
    parse_sendgrid_webhook(params)
  when /Mailgun/
    parse_mailgun_webhook(params)
  else
    parse_generic_webhook(params)
  end

  # Use same matching logic as Outlook import
  matched_construction = EmailParserService.new.match_construction(email_data)

  email = Email.create!(
    construction: matched_construction,
    from_email: email_data[:from],
    to_emails: email_data[:to],
    subject: email_data[:subject],
    body_text: email_data[:body_text],
    body_html: email_data[:body_html],
    received_at: email_data[:received_at] || Time.current,
    message_id: email_data[:message_id] || SecureRandom.uuid
  )

  head :ok  # Return 200 to acknowledge receipt
end
```

### Webhook Security

✅ **SHOULD validate webhook authenticity:**

```ruby
# For SendGrid:
def verify_sendgrid_signature
  signature = request.headers['X-Twilio-Email-Event-Webhook-Signature']
  timestamp = request.headers['X-Twilio-Email-Event-Webhook-Timestamp']

  # Verify signature matches expected value
  expected = OpenSSL::HMAC.hexdigest(
    'SHA256',
    ENV['SENDGRID_WEBHOOK_SECRET'],
    timestamp + request.raw_post
  )

  signature == expected
end
```

❌ **NEVER:**
- Return error status for webhook (email providers will retry, causing duplicates)
- Skip duplicate detection (check message_id uniqueness)
- Process webhook synchronously (use background job for heavy parsing)

**Why:**
- Webhooks enable email capture without OAuth
- Real-time email ingestion (no polling delay)
- Supports multiple email service providers
- Reduces API quota usage vs polling

**File Reference:** `/Users/rob/Projects/trapid/backend/app/controllers/api/v1/emails_controller.rb` (lines 83-103)

---

## RULE #13.6: Inbound-Only Architecture (Current Limitation)

**INCOMPLETE FEATURE: Outbound email sending NOT implemented.**

### Current Capabilities

✅ **IMPLEMENTED:**
- Outlook OAuth connection
- Email import from Outlook folders
- Auto-matching to jobs
- Email storage and display
- Webhook ingestion

❌ **NOT IMPLEMENTED:**
- Email composition UI
- Sending emails from Trapid
- Email templates (quote sent, job update, etc.)
- Attachment download/storage
- Calendar integration

### Future Outbound Pattern (When Implemented)

```ruby
# Proposed pattern (NOT YET IMPLEMENTED):
# app/mailers/job_mailer.rb
class JobMailer < ApplicationMailer
  def quote_sent(construction_id, contact_id)
    @construction = Construction.find(construction_id)
    @contact = Contact.find(contact_id)

    mail(
      to: @contact.email,
      subject: "Quote for #{@construction.name}",
      from: ENV['OUTBOUND_EMAIL_ADDRESS']
    )
  end
end

# Usage:
JobMailer.quote_sent(job.id, contact.id).deliver_later
```

❌ **DON'T:**
- Attempt to send emails via Outlook (requires Mail.Send scope not currently requested)
- Implement outbound without email templates
- Send emails without tracking (must create Email record)

**Why:**
- Inbound-only reduces OAuth scope requirements
- Outbound requires different architecture (ActionMailer + SMTP or Graph API send)
- Email templates need design and content approval
- Attachment handling requires file storage integration

**File Reference:** N/A (feature not implemented)

---

## Protected Code Patterns

### 1. Token Refresh Logic

**File:** `/Users/rob/Projects/trapid/backend/app/services/outlook_service.rb`

**DO NOT modify auto-refresh timing:**

```ruby
def needs_refresh?
  expires_at.nil? || Time.current >= expires_at - 5.minutes
end
```

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

```ruby
def self.current
  first_or_create!
end
```

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

**ChatMessage MUST support three distinct channel types: team channels, project messages, and direct messages.**

### Implementation

✅ **MUST define channel types:**

```ruby
# app/models/chat_message.rb
class ChatMessage < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true
  belongs_to :recipient_user, class_name: 'User', optional: true
  belongs_to :construction, optional: true

  validates :content, presence: true

  # Channel messages (team-wide)
  scope :in_channel, ->(channel) {
    where(channel: channel, project_id: nil, recipient_user_id: nil)
      .order(created_at: :asc)
  }

  # Project/job messages
  scope :for_project, ->(project_id) {
    where(project_id: project_id).order(created_at: :asc)
  }

  # Direct messages between users
  scope :between_users, ->(user1_id, user2_id) {
    where(
      '(user_id = ? AND recipient_user_id = ?) OR (user_id = ? AND recipient_user_id = ?)',
      user1_id, user2_id, user2_id, user1_id
    ).order(created_at: :asc)
  }

  # General channel (default)
  scope :general, -> {
    where(channel: 'general', project_id: nil, recipient_user_id: nil)
      .order(created_at: :asc)
  }
end
```

### Channel Logic

✅ **MUST route messages correctly:**

```ruby
# app/controllers/api/v1/chat_messages_controller.rb
def index
  if params[:user_id].present?
    # Direct message query
    @messages = ChatMessage.between_users(@current_user.id, params[:user_id])
  elsif params[:project_id].present?
    # Project message query
    @messages = ChatMessage.for_project(params[:project_id])
  else
    # Channel query (default: general)
    channel = params[:channel] || 'general'
    @messages = ChatMessage.in_channel(channel)
  end

  @messages = @messages.recent(100)
  render json: @messages.as_json(include_user: true)
end
```

**Files:**
- `backend/app/models/chat_message.rb`
- `backend/app/controllers/api/v1/chat_messages_controller.rb`
- `backend/db/migrate/20251111013321_create_chat_messages.rb`

---

## RULE #14.2: Message-to-Job Linking

**ChatMessage and SmsMessage MUST support linking to Construction (jobs) for record-keeping.**

### Implementation

✅ **MUST provide save-to-job endpoints:**

```ruby
# app/controllers/api/v1/chat_messages_controller.rb
def save_to_job
  @message = ChatMessage.find(params[:id])
  construction = Construction.find(params[:construction_id])

  @message.update!(
    construction_id: construction.id,
    saved_to_job: true
  )

  render json: { message: 'Message saved to job', chat_message: @message }
end

def save_conversation_to_job
  construction = Construction.find(params[:construction_id])
  message_ids = params[:message_ids]

  ChatMessage.where(id: message_ids).update_all(
    construction_id: construction.id,
    saved_to_job: true
  )

  render json: {
    message: "#{message_ids.length} messages saved to job",
    construction_id: construction.id
  }
end
```

### Database Schema

✅ **MUST include construction_id foreign key:**

```ruby
# db/migrate/20251111021538_add_construction_to_chat_messages.rb
add_reference :chat_messages, :construction, foreign_key: true
add_column :chat_messages, :saved_to_job, :boolean, default: false
add_index :chat_messages, [:construction_id, :channel, :created_at]
```

### Frontend Integration

✅ **MUST allow bulk conversation saving:**

```javascript
// frontend/src/components/chat/ChatBox.jsx
const saveConversationToJob = async () => {
  const messageIds = messages.map(m => m.id);

  await fetch('/api/v1/chat_messages/save_conversation_to_job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      construction_id: selectedConstruction,
      message_ids: messageIds
    })
  });
};
```

**Files:**
- `backend/app/controllers/api/v1/chat_messages_controller.rb:67-93`
- `backend/app/models/chat_message.rb`
- `frontend/src/components/chat/ChatBox.jsx`

---

## RULE #14.3: SMS Twilio Integration

**SMS MUST use Twilio for sending/receiving with webhook support and status tracking.**

### TwilioService Architecture

✅ **MUST centralize Twilio operations:**

```ruby
# app/services/twilio_service.rb
class TwilioService
  def self.send_sms(to:, body:, contact:, user: nil)
    settings = CompanySetting.current
    raise 'Twilio not enabled' unless settings.twilio_enabled

    client = Twilio::REST::Client.new(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    )

    normalized_to = normalize_phone_number(to)

    twilio_message = client.messages.create(
      from: settings.twilio_phone_number,
      to: normalized_to,
      body: body
    )

    sms = SmsMessage.create!(
      contact: contact,
      user: user,
      from_phone: settings.twilio_phone_number,
      to_phone: normalized_to,
      body: body,
      direction: 'outbound',
      status: 'sent',
      twilio_sid: twilio_message.sid,
      sent_at: Time.current
    )

    { success: true, sms: sms, twilio_message: twilio_message }
  rescue Twilio::REST::RestError => e
    { success: false, error: e.message }
  end
end
```

### Webhook Processing

✅ **MUST handle incoming SMS webhooks:**

```ruby
# app/controllers/api/v1/sms_messages_controller.rb
def webhook
  from_phone = params['From']
  body = params['Body']
  message_sid = params['MessageSid']

  result = TwilioService.process_incoming_sms(params)

  # Return TwiML response
  response = Twilio::TwiML::MessagingResponse.new do |r|
    r.message(body: 'Message received') if result[:success]
  end

  render xml: response.to_s
end
```

### Phone Number Normalization

✅ **MUST support Australian phone formats:**

```ruby
# app/services/twilio_service.rb
def self.normalize_phone_number(phone)
  clean = phone.gsub(/\D/, '') # Remove non-digits

  # Australian mobile starting with 04
  if clean.start_with?('04') && clean.length == 10
    return "+61#{clean[1..-1]}" # Convert to +61
  end

  # Already international format
  return "+#{clean}" if clean.start_with?('61')

  phone # Return as-is if unrecognized
end
```

**Files:**
- `backend/app/services/twilio_service.rb`
- `backend/app/controllers/api/v1/sms_messages_controller.rb`
- `backend/app/models/sms_message.rb`

---

## RULE #14.4: SMS Status Tracking

**SmsMessage MUST track delivery status via Twilio webhooks with enum states.**

### Status Enum

✅ **MUST define status states:**

```ruby
# app/models/sms_message.rb
class SmsMessage < ApplicationRecord
  belongs_to :contact
  belongs_to :user, optional: true # null for inbound messages

  validates :from_phone, :to_phone, :body, :direction, presence: true
  validates :direction, inclusion: { in: %w[inbound outbound] }

  scope :inbound, -> { where(direction: 'inbound') }
  scope :outbound, -> { where(direction: 'outbound') }
  scope :recent, -> { order(created_at: :desc) }

  # Status helpers
  def delivered?
    status == 'delivered'
  end

  def failed?
    status == 'failed'
  end

  def inbound?
    direction == 'inbound'
  end

  def outbound?
    direction == 'outbound'
  end
end
```

### Status Updates

✅ **MUST accept Twilio status webhooks:**

```ruby
# app/controllers/api/v1/sms_messages_controller.rb
def status_webhook
  message_sid = params['MessageSid']
  status = params['MessageStatus'] # queued, sent, delivered, failed

  TwilioService.update_message_status(message_sid, status)

  head :ok
end

# app/services/twilio_service.rb
def self.update_message_status(message_sid, status)
  sms = SmsMessage.find_by(twilio_sid: message_sid)
  return unless sms

  sms.update!(status: status)
end
```

### Frontend Display

✅ **MUST show status icons:**

```javascript
// frontend/src/components/contacts/SmsConversation.jsx
const getStatusIcon = (message) => {
  if (message.direction === 'inbound') return null;

  switch (message.status) {
    case 'delivered': return <CheckIcon className="text-green-500" />;
    case 'sent': return <CheckIcon className="text-blue-500" />;
    case 'failed': return <XMarkIcon className="text-red-500" />;
    case 'queued': return <ClockIcon className="text-gray-400" />;
    default: return null;
  }
};
```

**Files:**
- `backend/app/models/sms_message.rb`
- `backend/app/services/twilio_service.rb:78-82`
- `frontend/src/components/contacts/SmsConversation.jsx:92-104`

---

## RULE #14.5: Unread Message Tracking

**User model MUST track last_chat_read_at to enable unread count badges.**

### User Model Extension

✅ **MUST add read timestamp:**

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_many :chat_messages

  # Timestamp when user last viewed chat
  # Used to calculate unread count
  # Migration: add_column :users, :last_chat_read_at, :datetime
end
```

### Unread Count API

✅ **MUST provide unread count endpoint:**

```ruby
# app/controllers/api/v1/chat_messages_controller.rb
def unread_count
  if @current_user.last_chat_read_at.present?
    count = ChatMessage.where('created_at > ?', @current_user.last_chat_read_at).count
  else
    count = ChatMessage.count
  end

  render json: { unread_count: count }
end

def mark_as_read
  @current_user.update!(last_chat_read_at: Time.current)
  render json: { message: 'Messages marked as read' }
end
```

### Frontend Badge

✅ **MUST poll for unread count:**

```javascript
// frontend/src/components/AppLayout.jsx
useEffect(() => {
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/chat_messages/unread_count');
      const data = await response.json();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  fetchUnreadCount();
  const interval = setInterval(fetchUnreadCount, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, []);
```

**Files:**
- `backend/app/models/user.rb`
- `backend/app/controllers/api/v1/chat_messages_controller.rb:49-64`
- `frontend/src/components/AppLayout.jsx` (unread badge logic)

---

## RULE #14.6: Message Polling (No WebSockets)

**Frontend MUST use polling for real-time updates; WebSockets NOT implemented.**

### Polling Implementation

✅ **MUST poll at 3-second intervals:**

```javascript
// frontend/src/components/chat/ChatBox.jsx
useEffect(() => {
  loadMessages();

  const interval = setInterval(() => {
    loadMessages();
  }, 3000); // Poll every 3 seconds

  return () => clearInterval(interval);
}, [channel, projectId, userId]);

const loadMessages = async () => {
  let url = '/api/v1/chat_messages';

  if (userId) {
    url += `?user_id=${userId}`;
  } else if (projectId) {
    url += `?project_id=${projectId}`;
  } else {
    url += `?channel=${channel}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  setMessages(data);
};
```

### SMS Polling

✅ **MUST poll SMS messages:**

```javascript
// frontend/src/components/communications/SmsTab.jsx
useEffect(() => {
  loadMessages();

  const interval = setInterval(() => {
    loadMessages();
  }, 3000);

  return () => clearInterval(interval);
}, [contactId, jobId]);
```

❌ **NEVER use WebSockets:**
- WebSocket infrastructure not implemented
- ActionCable not configured
- All real-time updates via polling

**Files:**
- `frontend/src/components/chat/ChatBox.jsx:29-40`
- `frontend/src/components/communications/SmsTab.jsx`
- `frontend/src/components/messages/JobMessagesTab.jsx`

---

## RULE #14.7: Contact-SMS Fuzzy Matching

**Incoming SMS MUST match contacts via phone number fuzzy lookup (last 9 digits for AU).**

### Fuzzy Match Logic

✅ **MUST support partial phone matches:**

```ruby
# app/services/twilio_service.rb
def self.find_contact_by_phone(phone_number)
  normalized = normalize_phone_number(phone_number)

  # Try exact match first
  contact = Contact.find_by(mobile_phone: normalized)
  return contact if contact

  # Try partial match (last 9 digits for AU)
  # 0412 345 678 → 412345678
  last_9_digits = normalized.gsub(/\D/, '')[-9..-1]

  Contact.where(
    "regexp_replace(mobile_phone, '[^0-9]', '', 'g') LIKE ?",
    "%#{last_9_digits}"
  ).first
end

def self.process_incoming_sms(params)
  from_phone = params['From']
  body = params['Body']
  message_sid = params['MessageSid']

  contact = find_contact_by_phone(from_phone)

  unless contact
    Rails.logger.warn "Incoming SMS from unknown number: #{from_phone}"
    return { success: false, error: 'Contact not found' }
  end

  sms = SmsMessage.create!(
    contact: contact,
    from_phone: from_phone,
    to_phone: params['To'],
    body: body,
    direction: 'inbound',
    status: 'received',
    twilio_sid: message_sid,
    received_at: Time.current
  )

  { success: true, sms: sms, contact: contact }
end
```

**Why Last 9 Digits:**
- Australian mobile numbers: 04XX XXX XXX (10 digits)
- Different formats: +61, 04, 61, etc.
- Last 9 digits unique to subscriber

**Files:**
- `backend/app/services/twilio_service.rb:84-115`

---

## RULE #14.8: Message Deletion Authorization

**ChatMessage deletion MUST only allow users to delete their own messages.**

### Authorization Check

✅ **MUST verify ownership:**

```ruby
# app/controllers/api/v1/chat_messages_controller.rb
def destroy
  @message = ChatMessage.find(params[:id])

  # Authorization: only creator can delete
  unless @message.user_id == @current_user.id
    return render json: { error: 'Unauthorized' }, status: :forbidden
  end

  @message.destroy
  render json: { message: 'Message deleted' }
end
```

❌ **NEVER allow:**
- Admins deleting other users' messages (not implemented)
- Bulk message deletion without ownership check
- Deletion of messages saved to jobs without audit trail

**Files:**
- `backend/app/controllers/api/v1/chat_messages_controller.rb:44-47`

---

## RULE #14.9: Email Ingestion Storage

**Email model MUST store inbound emails from Outlook with optional Construction linking.**

### Email Model

✅ **MUST store email metadata:**

```ruby
# app/models/email.rb
class Email < ApplicationRecord
  belongs_to :construction, optional: true
  belongs_to :user, optional: true

  validates :from_email, :subject, :body, presence: true
  validates :message_id, uniqueness: true, allow_nil: true

  scope :recent, -> { order(received_at: :desc) }
  scope :for_construction, ->(construction_id) {
    where(construction_id: construction_id).order(received_at: :desc)
  }
  scope :unassigned, -> { where(construction_id: nil) }
  scope :with_attachments, -> { where(has_attachments: true) }

  def formatted_received_at
    return 'N/A' unless received_at
    received_at.strftime('%b %d, %Y %I:%M %p')
  end

  def short_subject
    return 'No Subject' if subject.blank?
    subject.length > 50 ? "#{subject[0..47]}..." : subject
  end
end
```

### Schema

✅ **MUST include fields:**

```ruby
# db/schema.rb (emails table)
create_table :emails do |t|
  t.references :construction, foreign_key: true, null: true
  t.references :user, foreign_key: true, null: true
  t.string :from_email, null: false
  t.json :to_emails, default: []
  t.json :cc_emails, default: []
  t.json :bcc_emails, default: []
  t.string :subject
  t.text :body
  t.datetime :received_at
  t.string :message_id # Microsoft Graph message ID
  t.boolean :has_attachments, default: false
  t.timestamps
end

add_index :emails, :message_id, unique: true
add_index :emails, :construction_id
```

**Note:** Email sending NOT implemented (inbound only).

**Files:**
- `backend/app/models/email.rb`
- `backend/db/schema.rb` (emails table)

---

## RULE #14.10: Authentication Placeholder - CRITICAL TODO

**ChatMessages controller currently uses placeholder authentication - MUST be replaced with proper auth.**

### Current Placeholder

⚠️ **CRITICAL SECURITY ISSUE:**

```ruby
# app/controllers/api/v1/chat_messages_controller.rb (Line 110)
def set_current_user
  @current_user = User.first # TODO: Replace with actual current_user logic
end
```

### Required Fix

✅ **MUST implement proper authentication:**

```ruby
# app/controllers/api/v1/chat_messages_controller.rb
before_action :authenticate_user!

def set_current_user
  @current_user = current_user # From Devise or JWT auth
end
```

❌ **NEVER use in production:**
- `User.first` placeholder
- Hardcoded user IDs
- Session-less chat without auth

**Status:** Placeholder exists, proper auth NOT implemented.

**Files:**
- `backend/app/controllers/api/v1/chat_messages_controller.rb:110`

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

**Payment MUST track amount, date, method, reference, and Xero sync status.**

### Implementation

✅ **MUST include core fields:**

```ruby
# app/models/payment.rb
class Payment < ApplicationRecord
  belongs_to :purchase_order
  belongs_to :created_by, class_name: 'User', foreign_key: 'created_by_id'

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :payment_date, presence: true
  validates :payment_method, inclusion: {
    in: %w[bank_transfer check credit_card cash eft other],
    allow_nil: true
  }

  scope :by_purchase_order, ->(po_id) { where(purchase_order_id: po_id).order(payment_date: :desc) }
  scope :synced_to_xero, -> { where.not(xero_payment_id: nil) }
  scope :sync_failed, -> { where.not(xero_sync_error: nil) }

  after_save :update_purchase_order_payment_status
  after_destroy :update_purchase_order_payment_status
end
```

### Database Schema

✅ **MUST use DECIMAL(15,2) for precision:**

```ruby
# db/migrate/20251112213631_create_payments.rb
create_table :payments do |t|
  t.references :purchase_order, null: false, foreign_key: true
  t.decimal :amount, precision: 15, scale: 2, null: false
  t.date :payment_date, null: false
  t.string :payment_method
  t.string :reference_number
  t.text :notes
  t.string :xero_payment_id
  t.datetime :xero_synced_at
  t.text :xero_sync_error
  t.references :created_by, foreign_key: { to_table: :users }
  t.timestamps
end

add_index :payments, :payment_date
add_index :payments, [:purchase_order_id, :payment_date]
add_index :payments, :xero_payment_id
```

**Files:**
- `backend/app/models/payment.rb`
- `backend/db/migrate/20251112213631_create_payments.rb`

---

## RULE #16.2: Automatic Payment Status Updates

**PurchaseOrder payment_status MUST update automatically when payments are recorded or deleted.**

### Callback Implementation

✅ **MUST trigger on payment save/destroy:**

```ruby
# app/models/payment.rb
after_save :update_purchase_order_payment_status
after_destroy :update_purchase_order_payment_status

private

def update_purchase_order_payment_status
  po = purchase_order
  total_paid = po.payments.sum(:amount)

  po.update!(
    xero_amount_paid: total_paid,
    xero_complete: total_paid >= po.total,
    xero_still_to_be_paid: [po.total - total_paid, 0].max
  )

  # Update payment_status enum
  po.update_payment_status_from_payments!
end
```

### Status Enum

✅ **MUST define payment status states:**

```ruby
# app/models/purchase_order.rb
enum payment_status: {
  pending: 'pending',
  part_payment: 'part_payment',
  complete: 'complete',
  manual_review: 'manual_review'
}

def update_payment_status_from_payments!
  total_paid = payments.sum(:amount)
  percentage = (total_paid / total) * 100

  new_status = if percentage >= 95 && percentage <= 105
    'complete'
  elsif percentage > 105
    'manual_review'
  elsif total_paid > 0
    'part_payment'
  else
    'pending'
  end

  update!(payment_status: new_status)
end
```

**Files:**
- `backend/app/models/payment.rb:30-42`
- `backend/app/models/purchase_order.rb` (payment status logic)

---

## RULE #16.3: Xero Invoice Fuzzy Matching

**InvoiceMatchingService MUST use 6-strategy fuzzy matching to link Xero invoices to POs.**

### Matching Strategies

✅ **MUST implement matching hierarchy:**

```ruby
# app/services/invoice_matching_service.rb
class InvoiceMatchingService
  def match_invoice_to_po(xero_invoice, po_id_hint: nil)
    # Strategy 1: Explicit PO ID provided
    return PurchaseOrder.find(po_id_hint) if po_id_hint.present?

    po_number = extract_po_number(xero_invoice)

    # Strategy 2: Reference field (most reliable)
    if xero_invoice['Reference'].present?
      po = match_by_reference(xero_invoice['Reference'])
      return po if po
    end

    # Strategy 3: InvoiceNumber field
    if xero_invoice['InvoiceNumber'].present?
      po = match_by_invoice_number(xero_invoice['InvoiceNumber'])
      return po if po
    end

    # Strategy 4: LineItems description
    po = match_by_line_items(xero_invoice['LineItems'])
    return po if po

    # Strategy 5: Normalized PO number (handles zero-padding)
    po = match_by_normalized_po_number(po_number)
    return po if po

    # Strategy 6: Supplier + amount fallback
    match_by_supplier_and_amount(
      xero_invoice['Contact']['Name'],
      xero_invoice['Total'],
      tolerance: 0.10
    )
  end

  private

  def extract_po_number(xero_invoice)
    text = [
      xero_invoice['Reference'],
      xero_invoice['InvoiceNumber'],
      xero_invoice['LineItems']&.map { |li| li['Description'] }&.join(' ')
    ].compact.join(' ')

    # Patterns: PO-123, P.O. 123, P/O 123, Purchase Order 123
    if text =~ /\b(?:PO|P\.O\.|P\/O|Purchase Order)\s*[:-]?\s*(\d+)/i
      $1.to_i
    end
  end

  def match_by_normalized_po_number(po_number)
    return nil unless po_number

    # Try exact match
    po = PurchaseOrder.find_by(po_number: po_number)
    return po if po

    # Try normalized (strip leading zeros)
    normalized = po_number.to_s.gsub(/^0+/, '')
    PurchaseOrder.where("CAST(po_number AS TEXT) LIKE ?", "%#{normalized}").first
  end
end
```

### Apply Invoice

✅ **MUST update PO with invoice data:**

```ruby
# app/models/purchase_order.rb
def apply_invoice!(invoice_amount:, invoice_date:, invoice_reference:)
  update!(
    invoiced_amount: invoice_amount,
    invoice_date: invoice_date,
    invoice_reference: invoice_reference,
    payment_status: determine_payment_status(invoice_amount)
  )
end

def determine_payment_status(invoice_amount)
  percentage = (invoice_amount / total) * 100

  if percentage >= 95 && percentage <= 105
    'complete'
  elsif percentage > 105 && (invoice_amount - total) > 1.00
    'manual_review' # Overage >$1 needs review
  elsif percentage < 95
    'part_payment'
  else
    'pending'
  end
end
```

**Files:**
- `backend/app/services/invoice_matching_service.rb`
- `backend/app/models/purchase_order.rb:167-184`

---

## RULE #16.4: Xero Payment Sync

**XeroPaymentSyncService MUST sync Trapid payments to Xero with error handling.**

### Sync Implementation

✅ **MUST validate and sync:**

```ruby
# app/services/xero_payment_sync_service.rb
class XeroPaymentSyncService
  def self.sync_payment(payment)
    new(payment).sync
  end

  def initialize(payment)
    @payment = payment
    @po = payment.purchase_order
  end

  def sync
    validate_xero_invoice!

    payload = build_payment_payload
    response = xero_client.create_payment(payload)

    @payment.mark_synced!(response['PaymentID'])
    { success: true, xero_payment_id: response['PaymentID'] }
  rescue => e
    @payment.mark_sync_failed!(e.message)
    { success: false, error: e.message }
  end

  private

  def validate_xero_invoice!
    raise "PO must have xero_invoice_id before syncing payments" unless @po.xero_invoice_id.present?
  end

  def build_payment_payload
    {
      Invoice: { InvoiceID: @po.xero_invoice_id },
      Account: { Code: bank_account_code },
      Date: @payment.payment_date.strftime('%Y-%m-%d'),
      Amount: @payment.amount.to_f,
      Reference: @payment.reference_number || "Payment for PO #{@po.po_number}"
    }
  end

  def xero_client
    @xero_client ||= XeroApiClient.new
  end

  def bank_account_code
    '091' # Default bank account code
  end
end

# app/models/payment.rb
def mark_synced!(xero_id)
  update!(
    xero_payment_id: xero_id,
    xero_synced_at: Time.current,
    xero_sync_error: nil
  )
end

def mark_sync_failed!(error_message)
  update!(xero_sync_error: error_message)
end

def synced_to_xero?
  xero_payment_id.present?
end

def sync_error?
  xero_sync_error.present?
end
```

**Files:**
- `backend/app/services/xero_payment_sync_service.rb`
- `backend/app/models/payment.rb:24-46`

---

## RULE #16.5: Payment Method Enum

**Payment method MUST be one of 6 valid types: bank_transfer, check, credit_card, cash, eft, other.**

### Validation

✅ **MUST restrict to valid methods:**

```ruby
# app/models/payment.rb
PAYMENT_METHODS = %w[bank_transfer check credit_card cash eft other].freeze

validates :payment_method, inclusion: {
  in: PAYMENT_METHODS,
  allow_nil: true,
  message: "%{value} is not a valid payment method"
}

def payment_method_label
  return 'Not Specified' if payment_method.blank?

  case payment_method
  when 'bank_transfer' then 'Bank Transfer'
  when 'check' then 'Check'
  when 'credit_card' then 'Credit Card'
  when 'cash' then 'Cash'
  when 'eft' then 'EFT'
  when 'other' then 'Other'
  end
end
```

### Frontend Dropdown

✅ **MUST provide method selector:**

```javascript
// frontend/src/components/purchase-orders/NewPaymentModal.jsx
const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'eft', label: 'EFT' },
  { value: 'check', label: 'Check' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' }
];

<select
  value={formData.payment_method}
  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
  className="w-full px-3 py-2 border rounded-md"
>
  <option value="">Select method...</option>
  {PAYMENT_METHODS.map(method => (
    <option key={method.value} value={method.value}>
      {method.label}
    </option>
  ))}
</select>
```

**Files:**
- `backend/app/models/payment.rb:10-13`
- `frontend/src/components/purchase-orders/NewPaymentModal.jsx:14-21`

---

## RULE #16.6: Financial Precision with DECIMAL(15,2)

**All financial amounts MUST use DECIMAL(15,2) for precision - never FLOAT or INTEGER.**

### Schema Enforcement

✅ **MUST use DECIMAL type:**

```ruby
# Payments table
t.decimal :amount, precision: 15, scale: 2, null: false

# Purchase orders table
t.decimal :total, precision: 15, scale: 2, default: 0.0
t.decimal :invoiced_amount, precision: 15, scale: 2, default: 0.0
t.decimal :xero_amount_paid, precision: 15, scale: 2, default: 0.0
t.decimal :xero_still_to_be_paid, precision: 15, scale: 2, default: 0.0
t.decimal :amount_still_to_be_invoiced, precision: 15, scale: 2, default: 0.0
t.decimal :budget, precision: 15, scale: 2
```

### Validation

✅ **MUST validate precision:**

```ruby
# app/models/payment.rb
validates :amount, numericality: {
  greater_than: 0,
  less_than_or_equal_to: 999_999_999_999.99
}

# app/models/purchase_order.rb
validates :total, :invoiced_amount, :xero_amount_paid,
  numericality: { greater_than_or_equal_to: 0 }
```

❌ **NEVER use FLOAT:**
- Causes rounding errors in currency calculations
- Example: `0.1 + 0.2 = 0.30000000000000004` (FLOAT)
- DECIMAL: `0.10 + 0.20 = 0.30` (exact)

**Files:**
- `backend/db/schema.rb` (all financial columns)
- `backend/app/models/payment.rb:7-9`

---

## RULE #16.7: Payment Status Badge Display

**Frontend MUST display payment_status with color-coded badges and icons.**

### Badge Component

✅ **MUST use semantic colors:**

```javascript
// frontend/src/components/purchase-orders/PaymentStatusBadge.jsx
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'gray',
    icon: HourglassIcon
  },
  part_payment: {
    label: 'Partial Payment',
    color: 'yellow',
    icon: CircleDotIcon
  },
  complete: {
    label: 'Paid',
    color: 'green',
    icon: CheckCircleIcon
  },
  manual_review: {
    label: 'Needs Review',
    color: 'red',
    icon: ExclamationTriangleIcon
  }
};

export function PaymentStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.color}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </Badge>
  );
}
```

**Files:**
- `frontend/src/components/purchase-orders/PaymentStatusBadge.jsx`

---

## RULE #16.8: Payment Summary Calculation

**Payments controller MUST return summary data with total_paid, po_total, and remaining.**

### API Response

✅ **MUST include summary:**

```ruby
# app/controllers/api/v1/payments_controller.rb
def index
  @purchase_order = PurchaseOrder.find(params[:purchase_order_id])
  @payments = @purchase_order.payments.order(payment_date: :desc)

  total_paid = @payments.sum(:amount)
  remaining = [@purchase_order.total - total_paid, 0].max

  render json: {
    success: true,
    payments: @payments.as_json(include: [:created_by]),
    summary: {
      total_paid: total_paid,
      po_total: @purchase_order.total,
      remaining: remaining,
      payment_status: @purchase_order.payment_status
    }
  }
end
```

### Frontend Display

✅ **MUST show summary prominently:**

```javascript
// frontend/src/components/purchase-orders/PaymentsList.jsx
<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
  <div className="grid grid-cols-3 gap-4 text-center">
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">PO Total</p>
      <p className="text-xl font-bold">${summary.po_total.toFixed(2)}</p>
    </div>
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
      <p className="text-xl font-bold text-green-600">${summary.total_paid.toFixed(2)}</p>
    </div>
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
      <p className="text-xl font-bold text-red-600">${summary.remaining.toFixed(2)}</p>
    </div>
  </div>
</div>
```

**Files:**
- `backend/app/controllers/api/v1/payments_controller.rb:4-20`
- `frontend/src/components/purchase-orders/PaymentsList.jsx:62-78`

---

## RULE #16.9: Budget Variance Tracking

**PurchaseOrder MUST track budget variance fields for cost analysis.**

### Variance Fields

✅ **MUST calculate variances:**

```ruby
# app/models/purchase_order.rb
# Schema fields:
# - budget (decimal 15,2) - Planned budget
# - diff_po_with_allowance_versus_budget - PO total vs budget
# - xero_budget_diff - Actual paid vs budget

def update_budget_variances!
  return unless budget.present?

  # PO vs Budget
  po_variance = total - budget
  update!(diff_po_with_allowance_versus_budget: po_variance)

  # Actual vs Budget
  actual_variance = xero_amount_paid - budget
  update!(xero_budget_diff: actual_variance)
end

def over_budget?
  budget.present? && total > budget
end

def budget_utilization_percentage
  return 0 unless budget.present? && budget > 0
  (total / budget * 100).round(2)
end
```

### Frontend Display

✅ **MUST highlight overages:**

```javascript
// frontend/src/pages/PurchaseOrderDetailPage.jsx
{po.budget && (
  <div className={cn(
    "p-4 rounded-lg",
    po.total > po.budget ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20"
  )}>
    <p className="text-sm font-medium">Budget: ${po.budget.toFixed(2)}</p>
    <p className="text-sm">Actual: ${po.total.toFixed(2)}</p>
    <p className={cn(
      "text-sm font-bold",
      po.total > po.budget ? "text-red-600" : "text-green-600"
    )}>
      Variance: ${(po.total - po.budget).toFixed(2)}
    </p>
  </div>
)}
```

**Files:**
- `backend/app/models/purchase_order.rb` (variance methods)
- `backend/db/migrate/20251105010955_add_payment_tracking_to_purchase_orders.rb`

---

## RULE #16.10: Cascade Delete Payments

**Payments MUST be deleted when PurchaseOrder is deleted to maintain data integrity.**

### Foreign Key Constraint

✅ **MUST set dependent: :destroy:**

```ruby
# app/models/purchase_order.rb
has_many :payments, dependent: :destroy

# Migration
add_foreign_key :payments, :purchase_orders, on_delete: :cascade
```

❌ **NEVER orphan payments:**
- Deleting PO without deleting payments breaks referential integrity
- Payment without PO is meaningless
- Use `dependent: :destroy` not `dependent: :nullify`

**Files:**
- `backend/app/models/purchase_order.rb:23`
- `backend/db/migrate/20251112213631_create_payments.rb:11`

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

**All background jobs MUST use ActiveJob with Solid Queue adapter and implement retry logic.**

### Configuration

✅ **MUST configure Solid Queue:**

```yaml
# config/solid_queue.yml
production:
  dispatchers:
    - polling_interval: 1
      batch_size: 500
  workers:
    - queues: "*"
      threads: 3
      processes: 1
      polling_interval: 0.1
  recurring_tasks:
    - key: apply_price_updates
      class_name: ApplyPriceUpdatesJob
      schedule: every day at midnight
```

### Base Job Retry Logic

✅ **MUST inherit from ApplicationJob:**

```ruby
# app/jobs/application_job.rb
class ApplicationJob < ActiveJob::Base
  retry_on ActiveRecord::Deadlocked, wait: :exponentially_longer, attempts: 5
  retry_on Net::ReadTimeout, wait: 5.seconds, attempts: 3
  retry_on Errno::ECONNREFUSED, wait: 10.seconds, attempts: 3

  discard_on ActiveJob::DeserializationError

  rescue_from(StandardError) do |exception|
    Rails.logger.error "Job failed: #{exception.class} - #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")
    # TODO: Send to error tracking (Sentry/Rollbar)
  end
end
```

**Files:**
- `backend/config/solid_queue.yml`
- `backend/app/jobs/application_job.rb`

---

## RULE #17.2: Workflow State Machine

**WorkflowInstance MUST auto-initialize first step and auto-advance through steps on completion.**

### Workflow Lifecycle

✅ **MUST implement state machine:**

```ruby
# app/models/workflow_instance.rb
enum status: {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
  cancelled: 'cancelled'
}

after_create :initialize_first_step

def initialize_first_step
  first_step = workflow_definition.steps.first
  update!(
    status: 'in_progress',
    current_step: first_step['name'],
    started_at: Time.current
  )
  create_step(first_step)
end

def advance!
  next_step_config = get_next_step
  return false unless next_step_config

  update!(current_step: next_step_config['name'])
  create_step(next_step_config)
  true
end

def complete!
  update!(
    status: 'completed',
    completed_at: Time.current
  )
end
```

### Step Automation

✅ **MUST auto-advance on step completion:**

```ruby
# app/models/workflow_step.rb
after_update :check_workflow_advancement, if: :saved_change_to_status?

def approve!(user:, comment: nil)
  update!(
    status: 'completed',
    completed_at: Time.current,
    comment: comment
  )
  workflow_instance.advance! || workflow_instance.complete!
end

def reject!(user:, comment:)
  update!(
    status: 'rejected',
    completed_at: Time.current,
    comment: comment
  )
  workflow_instance.update!(status: 'rejected')
end
```

**Files:**
- `backend/app/models/workflow_instance.rb`
- `backend/app/models/workflow_step.rb`

---

## RULE #17.3: Idempotent Background Jobs

**Background jobs MUST be idempotent to safely handle retries and re-runs.**

### Idempotent Pattern

✅ **MUST check completion status:**

```ruby
# app/jobs/create_job_folders_job.rb
def perform(construction_id, template_id = nil)
  construction = Construction.find(construction_id)

  # Idempotent: Check if already created
  if construction.onedrive_folders_created_at.present?
    Rails.logger.info "Folders already exist for construction #{construction.id}"
    return
  end

  construction.update!(onedrive_folder_creation_status: 'processing')

  # ... folder creation logic

  construction.update!(
    onedrive_folders_created_at: Time.current,
    onedrive_folder_creation_status: 'completed'
  )
rescue => e
  construction.update!(onedrive_folder_creation_status: 'failed')
  raise # Re-raise for retry
end
```

### Check Before Create

✅ **MUST verify record doesn't exist:**

```ruby
# app/jobs/check_yesterday_rain_job.rb
def perform
  yesterday = Date.yesterday
  Construction.active.each do |construction|
    # Idempotent: Skip if log already exists
    next if RainLog.exists?(construction: construction, date: yesterday)

    weather_data = fetch_weather(construction)
    create_rain_log_if_rainfall(construction, yesterday, weather_data) if weather_data
  end
end
```

**Files:**
- `backend/app/jobs/create_job_folders_job.rb:18-23`
- `backend/app/jobs/check_yesterday_rain_job.rb`

---

## RULE #17.4: Price Update Automation

**ApplyPriceUpdatesJob MUST run daily to apply scheduled price changes automatically.**

### Daily Recurring Job

✅ **MUST implement price application:**

```ruby
# app/jobs/apply_price_updates_job.rb
def perform
  today = Date.today
  applicable_updates = PriceHistory.where('date_effective <= ?', today)
    .where(applied: false)
    .includes(:pricebook_item)

  applicable_updates.each do |price_history|
    item = price_history.pricebook_item

    # Only update if this is the latest price for this date
    latest_for_date = item.price_histories
      .where('date_effective <= ?', today)
      .order(date_effective: :desc)
      .first

    next unless latest_for_date.id == price_history.id

    # Only update if supplier matches default
    next unless item.default_supplier_id == price_history.supplier_id

    old_price = item.current_price
    item.update!(current_price: price_history.new_price)

    price_history.update!(applied: true)

    Rails.logger.info "Applied price update for item #{item.code}: #{old_price} → #{price_history.new_price}"
  end
end
```

**Scheduling:**
```yaml
# config/solid_queue.yml
recurring_tasks:
  - key: apply_price_updates
    class_name: ApplyPriceUpdatesJob
    schedule: every day at midnight
```

**Files:**
- `backend/app/jobs/apply_price_updates_job.rb`
- `backend/config/solid_queue.yml:18-20`

---

## RULE #17.5: Model Callback Automation

**Models MUST use callbacks for cascading updates and automatic calculations.**

### Automatic Calculations

✅ **MUST update dependent data:**

```ruby
# app/models/purchase_order.rb
before_save :calculate_totals
after_save :update_construction_profit
after_destroy :update_construction_profit

def calculate_totals
  self.sub_total = line_items.sum(&:total_price)
  self.tax = sub_total * (tax_rate || 0.10)
  self.total = sub_total + tax
end

def update_construction_profit
  return unless construction
  construction.recalculate_profit!
end
```

### Auto-spawn Child Tasks

✅ **MUST trigger child creation:**

```ruby
# app/models/project_task.rb
after_save :spawn_child_tasks_on_status_change, if: :saved_change_to_status?

def spawn_child_tasks_on_status_change
  return unless spawn_rules_enabled?

  case status
  when 'completed'
    spawn_photo_task if spawn_photo_on_completion?
    spawn_certificate_task if spawn_certificate_on_completion?
  when 'in_progress'
    spawn_subtasks if spawn_subtasks_on_start?
  end
end
```

### Price History Tracking

✅ **MUST track changes:**

```ruby
# app/models/pricebook_item.rb
after_update :track_price_change, if: :should_track_price_change?

def track_price_change
  return if skip_price_history_callback

  PriceHistory.create!(
    pricebook_item: self,
    old_price: current_price_was,
    new_price: current_price,
    change_reason: price_change_reason || 'Manual update',
    changed_by: User.current
  )
end
```

**Files:**
- `backend/app/models/purchase_order.rb` (callbacks)
- `backend/app/models/project_task.rb` (spawn logic)
- `backend/app/models/pricebook_item.rb` (history tracking)

---

## RULE #17.6: Job Status Tracking

**Long-running jobs MUST update status fields to track progress.**

### Status Enum Pattern

✅ **MUST provide status visibility:**

```ruby
# app/models/construction.rb
enum onedrive_folder_creation_status: {
  not_requested: 'not_requested',
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed'
}

def create_folders_if_needed!(template_id = nil)
  return unless folders_not_requested?
  update!(onedrive_folder_creation_status: 'pending')
  CreateJobFoldersJob.perform_later(id, template_id)
end
```

### Import Progress Tracking

✅ **MUST show percentage:**

```ruby
# app/jobs/import_job.rb
def perform(import_session_id, table_id, column_mapping)
  session = ImportSession.find(import_session_id)
  session.update!(status: 'processing', progress: 0)

  importer = DataImporter.new(session.file_path, column_mapping)

  importer.on_progress do |processed, total|
    progress = (processed.to_f / total * 100).round(2)
    session.update!(progress: progress, processed_rows: processed, total_rows: total)
  end

  result = importer.import!
  session.update!(status: 'completed', progress: 100, result: result)
end
```

**Files:**
- `backend/app/models/construction.rb` (status enum)
- `backend/app/jobs/import_job.rb` (progress tracking)

---

## RULE #17.7: Batch Processing with Rate Limiting

**Jobs that call external APIs MUST implement batch processing and rate limiting.**

### Xero Contact Sync Pattern

✅ **MUST batch and throttle:**

```ruby
# app/jobs/xero_contact_sync_job.rb
BATCH_SIZE = 10
RATE_LIMIT_DELAY = 1.second
MAX_RETRIES = 3

def perform
  xero_contacts = fetch_xero_contacts

  xero_contacts.in_groups_of(BATCH_SIZE, false) do |batch|
    batch.each do |xero_contact|
      sync_contact(xero_contact)
      sleep(RATE_LIMIT_DELAY) # Respect API rate limits
    end
  end
end

def sync_contact(xero_contact)
  retries = 0
  begin
    # ... sync logic
  rescue XeroApiClient::RateLimitError => e
    retries += 1
    if retries <= MAX_RETRIES
      wait_time = 2 ** retries # Exponential backoff
      sleep(wait_time)
      retry
    else
      raise
    end
  end
end
```

**Batch Parameters:**
- Batch size: 10 contacts
- Rate limit: 1 second between API calls
- Max retries: 3 with exponential backoff

**Files:**
- `backend/app/jobs/xero_contact_sync_job.rb:7-9`

---

## RULE #17.8: Workflow Metadata Storage

**WorkflowInstance MUST store rich metadata in JSONB for flexible workflows.**

### Metadata Schema

✅ **MUST support all workflow types:**

```ruby
# app/models/workflow_instance.rb
# metadata JSONB structure:
{
  client_details: {
    name: string,
    email: string,
    phone: string,
    address: string
  },
  financial_info: {
    amount: decimal,
    currency: string,
    payment_terms: string
  },
  project_details: {
    name: string,
    reference: string,
    site_address: string,
    due_date: date,
    priority: string
  },
  scope_requirements: {
    scope: text,
    special_requirements: text
  },
  references: {
    external_reference: string,
    onedrive_url: string
  },
  attachments: [
    { filename: string, url: string, size: integer }
  ]
}
```

### Frontend Capture

✅ **MUST collect metadata:**

```javascript
// frontend/src/components/workflows/WorkflowStartModal.jsx
const metadata = {
  client_details: {
    name: formData.clientName,
    email: formData.clientEmail,
    phone: formData.clientPhone,
    address: formData.clientAddress
  },
  financial_info: {
    amount: formData.amount,
    currency: formData.currency,
    payment_terms: formData.paymentTerms
  },
  // ... rest of metadata
  attachments: attachments.map(a => ({
    filename: a.filename,
    url: a.url,
    size: a.size
  }))
};

await api.post('/workflow_instances', {
  workflow_type: 'purchase_order_approval',
  subject_id: poId,
  subject_type: 'PurchaseOrder',
  metadata: metadata
});
```

**Files:**
- `backend/app/models/workflow_instance.rb` (JSONB storage)
- `frontend/src/components/workflows/WorkflowStartModal.jsx` (metadata capture)

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

**Each custom table MUST create a separate physical database table with dynamic ActiveRecord model.**

### Database Table Naming

✅ **MUST use auto-generated unique name:**

```ruby
# app/models/table.rb
before_validation :set_database_table_name, on: :create

def set_database_table_name
  return if database_table_name.present?

  safe_name = name.parameterize.underscore
  unique_suffix = SecureRandom.hex(3)
  self.database_table_name = "user_#{safe_name}_#{unique_suffix}"
end
```

**Pattern:** `user_<table_name>_<random_hex>`
- Example: `user_contacts_abc123`
- Prevents name collisions
- Scopes to user-created tables

❌ **NEVER:**
- Use table names without prefix
- Allow reserved names: `["user", "users", "table", "tables", "column", "columns", "record", "records"]`
- Reuse database_table_name across tables

### Dynamic Model Generation

✅ **MUST create ActiveRecord model at runtime:**

```ruby
# app/models/table.rb
def dynamic_model
  return @dynamic_model if @dynamic_model

  class_name = name.gsub(/[^a-zA-Z0-9_]/, '').classify

  @dynamic_model = Object.const_set(class_name, Class.new(ApplicationRecord) do
    self.table_name = database_table_name
  end)

  # Auto-inject lookup associations
  columns.where(column_type: 'lookup').each do |column|
    inject_lookup_association(column)
  end

  @dynamic_model
end
```

**Files:**
- `backend/app/models/table.rb:85-110`
- `backend/app/services/table_builder.rb`

---

## RULE #18.2: Column Type System

**Columns MUST support all 17 data types with proper validation and database mapping.**

### Column Type Definitions

✅ **MUST map column types correctly:**

```ruby
# Column Types → Database Types
COLUMN_TYPE_MAPPINGS = {
  'single_line_text' => :string,        # VARCHAR(255)
  'multiple_lines_text' => :text,       # TEXT
  'email' => :string,                   # VARCHAR with email validation
  'phone' => :string,                   # VARCHAR with phone format
  'url' => :string,                     # VARCHAR with URL validation
  'number' => :decimal,                 # DECIMAL(15,2)
  'whole_number' => :integer,           # INTEGER
  'currency' => :decimal,               # DECIMAL(15,2)
  'percentage' => :decimal,             # DECIMAL(15,2)
  'date' => :date,                      # DATE
  'date_and_time' => :datetime,         # TIMESTAMP
  'boolean' => :boolean,                # BOOLEAN
  'choice' => :string,                  # VARCHAR (single select)
  'lookup' => :integer,                 # INTEGER (foreign key)
  'multiple_lookups' => :text,          # TEXT (JSON array)
  'user' => :integer,                   # INTEGER (FK to users)
  'computed' => :string                 # VARCHAR (formula result)
}
```

### Column Creation

✅ **MUST use TableBuilder for physical schema changes:**

```ruby
# app/services/table_builder.rb
def add_column(column)
  db_type = COLUMN_TYPE_MAPPINGS[column.column_type]

  ActiveRecord::Migration.suppress_messages do
    ActiveRecord::Migration.add_column(
      table.database_table_name,
      column.column_name,
      db_type,
      **column_options(column)
    )
  end

  # Add indexes for lookups
  add_lookup_index(column) if column.column_type.in?(['lookup', 'user'])

  # Add foreign key constraints
  add_foreign_key(column) if column.column_type == 'lookup'
end

def column_options(column)
  opts = {}
  opts[:limit] = column.max_length if column.column_type.ends_with?('text')
  opts[:precision] = 15 if column.column_type.in?(['number', 'currency', 'percentage'])
  opts[:scale] = 2 if column.column_type.in?(['number', 'currency', 'percentage'])
  opts[:null] = !column.required
  opts[:default] = column.default_value if column.default_value.present?
  opts
end
```

**Files:**
- `backend/app/services/table_builder.rb:45-78`
- `backend/app/models/column.rb:15-35`

---

## RULE #18.3: Formula Evaluation System

**Computed columns MUST use Dentaku gem for safe formula evaluation with cross-table support.**

### Formula Syntax

✅ **MUST support curly brace references:**

```ruby
# Valid formula examples:
"{quantity} * {unit_price}"                    # Simple calculation
"({cost} + {tax}) * {quantity}"                # Grouping
"{amount} / {units}"                           # Division with decimal result
"{supplier.tax_rate} * {amount}"               # Cross-table lookup
"IF({quantity} > 100, {bulk_price}, {unit_price})" # Conditional (Dentaku function)
```

### Formula Evaluator

✅ **MUST evaluate formulas safely:**

```ruby
# app/services/formula_evaluator.rb
def evaluate(formula_expression, record_data, record_instance = nil)
  # Step 1: Replace {field_name} with variable placeholders
  variables = {}
  processed_formula = formula_expression.gsub(/\{([^}]+)\}/) do |match|
    field_ref = $1

    if field_ref.include?('.')
      # Cross-table reference: {lookup_column.target_field}
      value = resolve_cross_table_reference(field_ref, record_instance)
    else
      # Direct field reference
      value = record_data[field_ref] || 0
    end

    var_name = field_ref.gsub('.', '_')
    variables[var_name] = value.to_f
    var_name
  end

  # Step 2: Evaluate with Dentaku
  calculator = Dentaku::Calculator.new
  result = calculator.evaluate(processed_formula, variables)

  # Step 3: Round floats to 2 decimals
  result.is_a?(Float) ? result.round(2) : result
rescue => e
  "ERROR: #{e.message}"
end

def resolve_cross_table_reference(field_ref, record_instance)
  lookup_column_name, target_field = field_ref.split('.')

  # Get related record via association
  related_record = record_instance.send(lookup_column_name.to_sym)
  return 0 unless related_record

  related_record.send(target_field.to_sym) || 0
end
```

### Cross-Table Reference Optimization

✅ **MUST flag columns with cross-table refs:**

```ruby
# app/models/column.rb
before_save :detect_cross_table_references, if: -> { column_type == 'computed' }

def detect_cross_table_references
  formula = settings&.dig('formula') || ''
  self.has_cross_table_refs = FormulaEvaluator.uses_cross_table_references?(formula)
end

# app/services/formula_evaluator.rb
def self.uses_cross_table_references?(formula_expression)
  formula_expression.match?(/\{[^}]+\.[^}]+\}/)
end
```

**Why:** Filters which formulas need full record instance vs just data hash (performance).

**Files:**
- `backend/app/services/formula_evaluator.rb:10-85`
- `backend/app/models/column.rb:95-105`

---

## RULE #18.4: Lookup Column Pattern

**Lookup columns MUST auto-inject belongs_to associations and prevent N+1 queries.**

### Association Injection

✅ **MUST create associations dynamically:**

```ruby
# app/models/table.rb
def inject_lookup_association(column)
  return unless column.lookup_table_id.present?

  target_table = Table.find(column.lookup_table_id)
  target_class = target_table.name.classify

  @dynamic_model.belongs_to column.column_name.to_sym,
    class_name: target_class,
    foreign_key: "#{column.column_name}_id",
    optional: !column.required
end
```

### Batch Loading (N+1 Prevention)

✅ **MUST batch-load related records:**

```ruby
# app/controllers/api/v1/records_controller.rb
def build_lookup_cache(records, table)
  cache = {}

  table.columns.where(column_type: 'lookup').each do |column|
    next unless column.lookup_table_id.present?

    target_table = Table.find(column.lookup_table_id)
    foreign_key = "#{column.column_name}_id"

    # Collect all foreign key IDs
    ids = records.map { |r| r.send(foreign_key) }.compact.uniq
    next if ids.empty?

    # Batch load related records
    related_records = target_table.dynamic_model.where(id: ids).index_by(&:id)

    cache[column.id] = {
      records: related_records,
      display_column: column.lookup_display_column || target_table.title_column
    }
  end

  cache
end
```

### Lookup Response Format

✅ **MUST return id + display value:**

```json
{
  "supplier": {
    "id": 5,
    "display": "ABC Building Supplies"
  }
}
```

**Files:**
- `backend/app/models/table.rb:112-125`
- `backend/app/controllers/api/v1/records_controller.rb:95-125`

---

## RULE #18.5: Record CRUD with Formula Calculation

**Record operations MUST trigger formula recalculation for computed columns.**

### Record Creation/Update

✅ **MUST calculate formulas on save:**

```ruby
# app/controllers/api/v1/records_controller.rb
def create
  record = @table.dynamic_model.new(record_params)

  if record.save
    # Calculate computed columns AFTER save (so ID exists for lookups)
    update_computed_columns(record)

    render json: record_to_json(record), status: :created
  else
    render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
  end
end

def update_computed_columns(record)
  computed_columns = @table.columns.where(column_type: 'computed')

  computed_columns.each do |column|
    formula = column.settings&.dig('formula')
    next unless formula.present?

    # Get current record data
    record_data = record.attributes

    # Evaluate formula
    result = FormulaEvaluator.new.evaluate(
      formula,
      record_data,
      column.has_cross_table_refs? ? record : nil
    )

    # Update computed field
    record.update_column(column.column_name, result.to_s)
  end
end
```

### Record Retrieval with Formulas

✅ **MUST transform computed values on read:**

```ruby
# app/controllers/api/v1/records_controller.rb
def record_to_json(record)
  json = record.attributes

  @table.columns.each do |column|
    case column.column_type
    when 'computed'
      # Parse string back to number
      value = json[column.column_name]
      json[column.column_name] = value.present? ? value.to_f : 0

    when 'lookup'
      # Replace FK with {id, display}
      if lookup_cache[column.id]
        id = json["#{column.column_name}_id"]
        related = lookup_cache[column.id][:records][id]
        display_col = lookup_cache[column.id][:display_column]

        json[column.column_name] = {
          id: id,
          display: related&.send(display_col) || 'Unknown'
        }
      end
    end
  end

  json
end
```

**Files:**
- `backend/app/controllers/api/v1/records_controller.rb:20-65`

---

## RULE #18.6: Table Deletion Safety

**Table deletion MUST enforce safety checks to prevent data loss and broken references.**

### Safety Checks

✅ **MUST validate before deletion:**

```ruby
# app/controllers/api/v1/tables_controller.rb
def destroy
  # Check 1: Is table marked as live?
  if @table.is_live?
    return render json: {
      error: 'Cannot delete live table. Set is_live to false first.'
    }, status: :unprocessable_entity
  end

  # Check 2: Does table have records?
  record_count = @table.dynamic_model.count
  if record_count > 0
    return render json: {
      error: "Cannot delete table with #{record_count} records. Delete records first."
    }, status: :unprocessable_entity
  end

  # Check 3: Do other tables reference this table?
  referencing_columns = Column.where(lookup_table_id: @table.id)
  if referencing_columns.any?
    table_names = referencing_columns.map { |c| c.table.name }.uniq.join(', ')
    return render json: {
      error: "Cannot delete. Referenced by lookup columns in: #{table_names}"
    }, status: :unprocessable_entity
  end

  # Safe to delete
  TableBuilder.new(@table).drop_database_table
  @table.destroy

  head :no_content
end
```

### Physical Table Cleanup

✅ **MUST drop database table:**

```ruby
# app/services/table_builder.rb
def drop_database_table
  ActiveRecord::Migration.suppress_messages do
    ActiveRecord::Migration.drop_table(table.database_table_name, if_exists: true)
  end

  # Remove dynamic model from memory
  class_name = table.name.classify
  Object.send(:remove_const, class_name) if Object.const_defined?(class_name)
end
```

**Files:**
- `backend/app/controllers/api/v1/tables_controller.rb:55-85`
- `backend/app/services/table_builder.rb:90-100`

---

## RULE #18.7: Column Validation Rules

**Columns MUST validate based on type-specific constraints.**

### Type-Specific Validations

✅ **MUST enforce validation rules:**

```ruby
# app/models/column.rb
validates :name, presence: true
validates :column_name, presence: true, uniqueness: { scope: :table_id }
validates :column_type, inclusion: { in: COLUMN_TYPES }

# Type-specific validations
validate :validate_max_length_for_text_columns
validate :validate_min_max_for_numeric_columns
validate :validate_lookup_table_exists

def validate_max_length_for_text_columns
  return unless column_type.ends_with?('text')

  if max_length.present? && max_length > 65535
    errors.add(:max_length, 'cannot exceed 65,535 for text columns')
  end
end

def validate_min_max_for_numeric_columns
  return unless column_type.in?(%w[number whole_number currency percentage])

  if min_value.present? && max_value.present? && min_value > max_value
    errors.add(:min_value, 'cannot be greater than max_value')
  end
end

def validate_lookup_table_exists
  return unless column_type.in?(%w[lookup multiple_lookups])

  if lookup_table_id.blank?
    errors.add(:lookup_table_id, 'is required for lookup columns')
  elsif !Table.exists?(lookup_table_id)
    errors.add(:lookup_table_id, 'references non-existent table')
  end
end
```

### Record-Level Validation

✅ **MUST validate record data before save:**

```ruby
# app/controllers/api/v1/records_controller.rb
def validate_record_data(record, params)
  @table.columns.each do |column|
    value = params[column.column_name]

    # Required check
    if column.required && value.blank?
      record.errors.add(column.column_name, column.validation_message || 'is required')
    end

    # Type-specific validation
    case column.column_type
    when 'email'
      unless value =~ URI::MailTo::EMAIL_REGEXP
        record.errors.add(column.column_name, 'is not a valid email')
      end
    when 'url'
      unless value =~ URI::DEFAULT_PARSER.make_regexp
        record.errors.add(column.column_name, 'is not a valid URL')
      end
    when 'number', 'currency', 'percentage'
      if column.min_value && value.to_f < column.min_value
        record.errors.add(column.column_name, "must be at least #{column.min_value}")
      end
      if column.max_value && value.to_f > column.max_value
        record.errors.add(column.column_name, "cannot exceed #{column.max_value}")
      end
    end
  end
end
```

**Files:**
- `backend/app/models/column.rb:40-75`
- `backend/app/controllers/api/v1/records_controller.rb:130-165`

---

## RULE #18.8: Foreign Key Constraints

**Lookup columns MUST use foreign keys with nullify-on-delete behavior.**

### Foreign Key Pattern

✅ **MUST add foreign keys for lookups:**

```ruby
# app/services/table_builder.rb
def add_foreign_key(column)
  return unless column.column_type == 'lookup'
  return unless column.lookup_table_id.present?

  target_table = Table.find(column.lookup_table_id)

  ActiveRecord::Migration.suppress_messages do
    ActiveRecord::Migration.add_foreign_key(
      table.database_table_name,
      target_table.database_table_name,
      column: "#{column.column_name}_id",
      on_delete: :nullify  # Don't cascade delete
    )
  end
end
```

**Why :nullify?**
- Deleting a supplier doesn't delete purchase orders
- Orphaned references show as "Unknown" in UI
- Preserves historical data integrity

❌ **NEVER use on_delete: :cascade** for lookup columns (data loss risk)

**Files:**
- `backend/app/services/table_builder.rb:82-95`

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
│ 📕 LEXICON (BUGS):    Chapter 19               │
│ 📘 USER MANUAL (HOW): Chapter 19               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Authority:** ABSOLUTE
**Last Updated:** 2025-11-16 12:30 AEST

This chapter defines ALL UI/UX patterns for Trapid. Every interactive element MUST follow these standards.

## RULE #19.1: Standard Table Component Usage

### Component Hierarchy

✅ **MUST use this hierarchy:**
1. **DataTable.jsx** - For simple data tables (read-only, basic sorting)
2. **Custom table implementations** - For advanced features (column reordering, resizing, inline filters)

❌ **NEVER:**
- Mix patterns within same table
- Create new table components without review
- Use raw HTML tables without following standards

### When to Use DataTable Component

✅ **USE DataTable.jsx when:**
- Simple list/grid view needed
- Basic sorting sufficient
- No column reordering required
- No column resizing required
- No inline column filters needed

**Example:** UsersPage, simple lists, report views

### When to Use Custom Table Implementation

✅ **REQUIRED features for ALL custom tables:**

**If you build a custom table (not using DataTable.jsx), it MUST have ALL of these:**
- ✅ Column resizing (drag handles on headers)
- ✅ Column reordering (drag-and-drop headers)
- ✅ Inline column filters (filter icon in each header)
- ✅ Global search (search bar above table)
- ✅ Column visibility toggle (eye icon button)
- ✅ State persistence (save column widths, order, filters to localStorage)
- ✅ Dark mode support
- ✅ Sticky headers with gradient background
- ✅ Scrollbar styling

**No exceptions.** Custom tables are for complex data - they must have ALL advanced features.

**Example:** ContactsPage, POTable, PriceBooksPage, SuppliersPage

**Tables needing upgrade to full compliance:**
- ActiveJobsPage (has inline editing, missing search/resize/reorder/filters)

---

## RULE #19.2: Table Header Requirements

### All Tables MUST Have:

✅ **REQUIRED header elements:**
1. **Sortable columns** - Click to sort (with visual indicators)
2. **Column visibility controls** - Show/hide columns via dropdown/modal
3. **Sticky headers** - Headers stay visible when scrolling vertically
4. **Dark mode support** - All header elements

### Header Classes (Standard Pattern)

```jsx
<thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
```

✅ **MUST include:**
- Gradient background (light and dark modes)
- `sticky top-0 z-10` for fixed headers
- Border separation between headers and body

### Sort Indicators (Standard Pattern)

✅ **MUST show sort state:**
- Unsorted: Chevron icons on hover (gray, low opacity)
- Ascending: ChevronUpIcon (indigo-600 dark:indigo-400)
- Descending: ChevronDownIcon (indigo-600 dark:indigo-400)

```jsx
{isSortable && isSorted && (
  sortDirection === 'asc' ?
    <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
    <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
)}
```

---

## RULE #19.3: Column Search/Filter Requirements

### Inline Column Filters (Advanced Tables)

✅ **MUST provide inline filters for searchable columns:**
- Input field directly in header cell (below column label)
- Dropdown for enum/status columns
- Debounced search for text inputs (optional optimization)

### Filter Input Pattern

```jsx
{column.searchable && (
  column.filterType === 'dropdown' ? (
    <select
      value={columnFilters[column.key] || ''}
      onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
    >
      <option value="">All {column.label}</option>
      {/* Options */}
    </select>
  ) : (
    <input
      type="text"
      placeholder="Search..."
      value={columnFilters[column.key] || ''}
      onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
    />
  )
)}
```

✅ **MUST include:**
- `onClick={(e) => e.stopPropagation()` to prevent sort trigger
- Dark mode styling
- Focus states (indigo ring)

---

## RULE #19.4: Column Resizing Standards

### Resize Handle Implementation

✅ **MUST provide resize handles for all columns (except actions):**

```jsx
<div
  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
  onMouseDown={(e) => handleResizeStart(e, column.key)}
  onClick={(e) => e.stopPropagation()}
/>
```

### Resize Logic Pattern

```jsx
const handleResizeMove = (e) => {
  if (!resizingColumn) return
  const diff = e.clientX - resizeStartX
  const newWidth = Math.max(100, resizeStartWidth + diff)
  setColumnWidths(prev => ({
    ...prev,
    [resizingColumn]: newWidth
  }))
}
```

✅ **MUST:**
- Minimum width: 100px
- Persist widths to localStorage
- Use `cursor-col-resize` cursor
- Show visual feedback on hover (indigo highlight)

❌ **NEVER:**
- Allow columns to shrink below 100px
- Resize without persisting state
- Make action columns resizable

---

## RULE #19.5: Column Reordering Standards

### Drag-and-Drop Implementation

✅ **MUST support column reordering via drag-and-drop:**

```jsx
<th
  draggable
  onDragStart={(e) => handleDragStart(e, column.key)}
  onDragOver={handleDragOver}
  onDrop={(e) => handleDrop(e, column.key)}
>
  <Bars3Icon className="h-4 w-4 text-gray-400 cursor-move" />
  {/* Column content */}
</th>
```

### Drag Handlers Pattern

```jsx
const handleDrop = (e, targetColumnKey) => {
  e.preventDefault()
  if (!draggedColumn || draggedColumn === targetColumnKey) {
    setDraggedColumn(null)
    return
  }

  const draggedIndex = columnOrder.indexOf(draggedColumn)
  const targetIndex = columnOrder.indexOf(targetColumnKey)

  const newOrder = [...columnOrder]
  newOrder.splice(draggedIndex, 1)
  newOrder.splice(targetIndex, 0, draggedColumn)

  setColumnOrder(newOrder)
  setDraggedColumn(null)
}
```

✅ **MUST:**
- Show drag handle icon (Bars3Icon) in header
- Highlight dragged column (indigo background)
- Persist column order to localStorage
- Use semantic drag events (dragStart, dragOver, drop)

---

## RULE #19.6: Scroll Behavior Standards

### Vertical Scrolling

✅ **MUST constrain scroll to viewable screen:**

```jsx
<div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" style={{
  scrollbarWidth: 'thin',
  scrollbarColor: '#9CA3AF #E5E7EB'
}}>
```

**Container structure:**
- Parent: `h-screen flex flex-col` (full viewport height)
- Table wrapper: `flex-1 overflow-auto` (scrolls within remaining space)
- Table: `sticky top-0` headers

### Horizontal Scrolling

✅ **MUST support horizontal scroll for wide tables:**

```jsx
<table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
```

✅ **MUST:**
- Set `overflow-auto` on wrapper div
- Use `minWidth: '100%'` for responsive behavior
- Use `width: 'max-content'` to allow expansion
- Keep headers sticky on both axes

❌ **NEVER:**
- Use fixed table width when columns can overflow
- Allow body to scroll independently of headers
- Block horizontal scroll when content exceeds viewport

### Custom Scrollbar Styling

✅ **MUST style scrollbars consistently:**

```css
scrollbarWidth: 'thin',
scrollbarColor: '#9CA3AF #E5E7EB'  /* Firefox */
```

**Note:** For Webkit, add global CSS if needed (Chrome/Safari)

---

## RULE #19.7: Column Width Standards

### Fixed vs Dynamic Widths

✅ **MUST set column widths consistently:**

```jsx
<th style={{ width: `${width}px`, minWidth: `${width}px`, position: 'relative' }}>
<td style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}>
```

**Default widths by column type:**
- **ID/Number columns:** 100-150px
- **Name columns:** 200-250px
- **Status columns:** 150px
- **Action columns:** 100px
- **Description columns:** 250-300px

✅ **MUST persist widths:**
- Save to localStorage on resize
- Load from localStorage on mount
- Provide sensible defaults if no saved state

---

## RULE #19.8: Cell Content Standards

### Text Overflow Handling

✅ **MUST handle long text:**
- Use `truncate` for single-line cells with overflow
- Use `whitespace-nowrap` for cells that should never wrap
- Show full text on hover (via title attribute or tooltip)

### Cell Padding

✅ **STANDARD cell padding:**
- Regular density: `px-4 py-5` or `px-6 py-4`
- Compact density: `px-3 py-2`

### Cell Alignment

✅ **MUST align by content type:**
- Text: Left align
- Numbers/Currency: Right align
- Actions: Right align
- Status badges: Left align

```jsx
className={`${
  column.align === 'right'
    ? 'text-right'
    : column.align === 'center'
    ? 'text-center'
    : 'text-left'
}`}
```

---

## RULE #19.9: Row Interaction Standards

### Hover States

✅ **MUST provide hover feedback:**

```jsx
<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
```

### Click Handlers

✅ **MUST use semantic click patterns:**
- Row click: Navigate or expand row
- Cell links: Use `<Link>` or `<button>` with `onClick={(e) => e.stopPropagation()`
- Action menus: Stop propagation to prevent row click

### Selection States

✅ **MUST show selected state:**

```jsx
className={`transition-colors duration-150 ${
  selectedContacts.has(contact.id)
    ? 'bg-indigo-50 dark:bg-indigo-900/20'
    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
}`}
```

---

## RULE #19.10: Column Visibility Standards

### Column Toggle UI

✅ **MUST provide column visibility controls:**
- Dropdown menu (Menu from Headless UI)
- Checkbox list of all columns
- Persist visibility state to localStorage
- **STANDARD BUTTON:** Eye icon + "Columns" text (NO other variations)

### Column Visibility Button Pattern (REQUIRED)

**🔴 CRITICAL: ALL tables MUST use this EXACT button pattern:**

```jsx
<Menu as="div" className="relative inline-block text-left">
  <MenuButton className="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
    <EyeIcon className="h-5 w-5" />
    Columns
  </MenuButton>

  <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
    {/* Checkbox items */}
  </MenuItems>
</Menu>
```

✅ **MUST use:**
- **EyeIcon** from `@heroicons/react/24/outline` (NOT AdjustmentsHorizontalIcon or others)
- **"Columns"** text label
- Same button classes as above (standard Tailwind UI menu button)

❌ **NEVER:**
- Use different icon (AdjustmentsHorizontalIcon, Cog6ToothIcon, etc.)
- Use different text label
- Use custom button styling

### Checkbox Pattern (Tab On/Off)

✅ **MUST use simple checkbox toggles:**

```jsx
{Object.keys(visibleColumns).map((columnKey) => (
  <MenuItem key={columnKey}>
    {({ active }) => (
      <button
        onClick={() => handleToggleColumn(columnKey)}
        className={`${
          active ? 'bg-gray-100 dark:bg-gray-700' : ''
        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
      >
        <input
          type="checkbox"
          checked={visibleColumns[columnKey]}
          onChange={() => {}}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <span className="ml-3">{getColumnLabel(columnKey)}</span>
      </button>
    )}
  </MenuItem>
))}
```

✅ **MUST:**
- Show all columns in list (even hidden ones)
- Mark currently visible with checkboxes (checked = visible, unchecked = hidden)
- Persist state to localStorage
- Use standard checkbox styling (indigo accent)

❌ **NEVER:**
- Use complex toggle switches instead of checkboxes
- Use different color accents
- Skip localStorage persistence

---

## RULE #19.11: Search & Filter UI Standards

### Global Search Box

✅ **MUST provide global search:**

```jsx
<div className="relative">
  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
  />
</div>
```

✅ **MUST include:**
- Magnifying glass icon on left
- Clear button on right (when text present)
- Dark mode styling
- Focus ring (indigo or blue)

### Filter Results Count

✅ **MUST show results count when filtering:**

```jsx
{searchQuery && (
  <div className="text-sm text-gray-600 dark:text-gray-400">
    Found {filteredItems.length} of {items.length} items
  </div>
)}
```

---

## RULE #19.12: Empty States

### No Data State

✅ **MUST show empty state when no data:**

```jsx
<div className="text-center py-12">
  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" /* ... */>
    {/* Icon */}
  </svg>
  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
    No data
  </h3>
  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
    Get started by adding a new record.
  </p>
  <div className="mt-6">
    <button /* ... */>Add Record</button>
  </div>
</div>
```

### No Search Results State

✅ **MUST differentiate between empty and filtered:**

```jsx
{filteredItems.length === 0 && (
  <tr>
    <td colSpan={visibleColumnCount} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
      {searchQuery
        ? `No items found matching your filters`
        : 'No items found. Click "Add New" to create one.'}
    </td>
  </tr>
)}
```

---

## RULE #19.13: State Persistence Standards

### What to Persist to localStorage

✅ **MUST persist these states:**
1. Column widths
2. Column order
3. Column visibility
4. Sort state (optional)

✅ **MUST use unique keys:**
- Format: `{page}_{table}_columnWidths`
- Example: `contacts_table_columnWidths`, `po_table_columnOrder`

### Persistence Pattern

```jsx
// Load on mount
const [columnWidths, setColumnWidths] = useState(() => {
  const saved = localStorage.getItem('contacts_columnWidths')
  return saved ? JSON.parse(saved) : defaultWidths
})

// Save on change
useEffect(() => {
  localStorage.setItem('contacts_columnWidths', JSON.stringify(columnWidths))
}, [columnWidths])
```

❌ **NEVER:**
- Use generic keys that could collide
- Persist without try/catch (localStorage can fail)
- Forget to provide defaults

---

## RULE #19.14: Sorting Standards

### Sort Priority

✅ **MUST support primary/secondary sort:**

```jsx
// Primary sort
if (aPrimaryVal !== bPrimaryVal) {
  if (aPrimaryVal < bPrimaryVal) return sortDirection === 'asc' ? -1 : 1
  if (aPrimaryVal > bPrimaryVal) return sortDirection === 'asc' ? 1 : -1
}

// Secondary sort (if primary values equal)
const aSecondaryVal = getSortValue(a, secondarySortBy)
const bSecondaryVal = getSortValue(b, secondarySortBy)

if (aSecondaryVal < bSecondaryVal) return secondarySortDirection === 'asc' ? -1 : 1
if (aSecondaryVal > bSecondaryVal) return secondarySortDirection === 'asc' ? 1 : -1
return 0
```

### Sort Cycle Behavior

✅ **MUST cycle through 3 states:**
1. Ascending
2. Descending
3. None (return to default/secondary sort)

### Null Handling in Sort

✅ **MUST handle null/undefined:**

```jsx
if (aValue == null && bValue == null) return 0
if (aValue == null) return 1  // Nulls last
if (bValue == null) return -1
```

---

## RULE #19.15: Dark Mode Requirements

### All Tables MUST Support Dark Mode

✅ **REQUIRED dark mode classes:**

**Headers:**
```jsx
className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
```

**Body:**
```jsx
className="bg-white dark:bg-gray-800"
```

**Borders:**
```jsx
className="border-gray-200 dark:border-gray-700"
```

**Text:**
```jsx
className="text-gray-900 dark:text-white"  // Primary text
className="text-gray-600 dark:text-gray-400"  // Secondary text
className="text-gray-500 dark:text-gray-400"  // Placeholder/label
```

**Hover:**
```jsx
className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
```

❌ **NEVER:**
- Use light-mode-only colors
- Forget dark mode on new elements
- Use pure white/black (use gray-50/gray-900 instead)

---

## RULE #19.16: Performance Standards

### Memoization Requirements

✅ **MUST memoize expensive computations:**

```jsx
const filteredAndSortedData = useMemo(() => {
  // Filter and sort logic
}, [data, filters, sortConfig])
```

### When to Memoize

✅ **MUST memoize when:**
- Filtering large datasets (>100 rows)
- Sorting complex data structures
- Computing derived values from props/state

### Event Handler Optimization

✅ **RECOMMENDED patterns:**
- Debounce search inputs (if >500 items)
- Throttle resize handlers (if needed)
- Use `useCallback` for handlers passed to children

❌ **NEVER:**
- Filter/sort on every render without memoization
- Create inline functions for sort/filter in map()

---

## RULE #19.17: Accessibility Standards

### Keyboard Navigation

✅ **MUST support:**
- Tab through interactive elements
- Enter/Space to trigger actions
- Arrow keys for menu navigation (via Headless UI)

### ARIA Attributes

✅ **MUST include:**
- `scope="col"` on `<th>` elements
- `aria-label` or `aria-labelledby` on tables
- `aria-sort` on sorted columns (optional enhancement)

### Screen Reader Support

✅ **MUST provide:**
- Semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- `sr-only` text for icon-only buttons
- Descriptive labels for all inputs

---

## RULE #19.18: Testing Considerations

### What to Test

✅ **MUST verify:**
1. Sort works correctly (asc/desc/none)
2. Filters narrow results
3. Column resize persists
4. Column reorder persists
5. Column visibility persists
6. Empty states display correctly
7. Dark mode renders properly
8. Responsive behavior on mobile

### Common Test Scenarios

- Add data → table updates
- Remove data → empty state appears
- Search → results filter
- Clear search → full results return
- Resize column → width persists on reload
- Hide column → column disappears and persists
- Sort by column A → sort by column B → verify secondary sort

---

## Protected Code Patterns (Chapter 19)

### DataTable Component Structure
**File:** `frontend/src/components/DataTable.jsx`
**Protected:** Core sorting and filtering logic, dark mode classes, empty states

### Advanced Table Pattern (ContactsPage)
**File:** `frontend/src/pages/ContactsPage.jsx`
**Protected:** Column resize logic, drag-and-drop handlers, localStorage persistence

### Advanced Table Pattern (POTable)
**File:** `frontend/src/components/purchase-orders/POTable.jsx`
**Protected:** Inline filter implementation, column configuration pattern

❌ **DO NOT:**
- Remove resize handles from existing tables
- Remove inline filters without replacement
- Change localStorage key patterns (breaks user preferences)
- Remove dark mode support
- Remove sticky headers
- Remove sort indicators

---

## RULE #19.19: URL State Management

### URL as Single Source of Truth

✅ **MUST sync component state with URL for:**
- Active tab selection
- Filter/search queries (optional, for shareable links)
- Pagination state
- Sort state (optional)

### URL Parameters Pattern

```jsx
import { useNavigate, useLocation } from 'react-router-dom'

// Read URL params on mount
const getInitialTab = () => {
  const params = new URLSearchParams(location.search)
  const tab = params.get('tab')
  return tabs.indexOf(tab) >= 0 ? tabs.indexOf(tab) : 0
}

const [activeTab, setActiveTab] = useState(getInitialTab())

// Update URL when state changes
const handleTabChange = (index) => {
  setActiveTab(index)
  const tabName = tabs[index]
  navigate(`/contacts?tab=${tabName}`, { replace: true })
}

// Listen for URL changes (browser back/forward)
useEffect(() => {
  const newIndex = getInitialTab()
  if (newIndex !== activeTab) {
    setActiveTab(newIndex)
  }
}, [location.search])
```

✅ **MUST:**
- Use `navigate()` with `{ replace: true }` for tab changes
- Support browser back/forward buttons
- Validate URL params before using
- Provide fallback for invalid params

❌ **NEVER:**
- Store tab state only in component (URL must be updated)
- Break browser back button by not syncing URL
- Use push navigation for every state change (causes history spam)

### When to Use URL Params

✅ **USE URL params for:**
- Tab selection (always)
- Page/view selection
- Filter states that should be shareable

❌ **AVOID URL params for:**
- Transient UI state (modal open/closed)
- Scroll position
- Column widths/order (use localStorage)
- Form input values (unless search forms)

---

## RULE #19.20: Search Functionality Standards

### Global Search Pattern

✅ **MUST implement global search with:**

```jsx
const [searchQuery, setSearchQuery] = useState('')

// Listen for global search events from AppLayout
useEffect(() => {
  const handleGlobalSearch = (event) => {
    setSearchQuery(event.detail)
  }

  window.addEventListener('global-search', handleGlobalSearch)
  return () => {
    window.removeEventListener('global-search', handleGlobalSearch)
  }
}, [])

// Filter logic
const filteredItems = items.filter(item =>
  item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.email?.toLowerCase().includes(searchQuery.toLowerCase())
)
```

### Search Box UI Requirements

✅ **MUST include:**
- MagnifyingGlassIcon on left (gray-400)
- Clear button on right (when text present)
- Placeholder text describing what's searchable
- Dark mode styling
- Focus ring (blue-500 or indigo-500)

```jsx
<div className="relative">
  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search contacts..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
  />
  {searchQuery && (
    <button
      onClick={() => setSearchQuery('')}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  )}
</div>
```

### Search Debouncing

✅ **RECOMMENDED for large datasets (>500 items):**

```jsx
import { useState, useEffect } from 'react'

const [searchInput, setSearchInput] = useState('')
const [debouncedSearch, setDebouncedSearch] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchInput)
  }, 300)

  return () => clearTimeout(timer)
}, [searchInput])

// Use debouncedSearch for filtering
```

### Search Results Display

✅ **MUST show when filtering:**

```jsx
{searchQuery && (
  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
    Found {filteredItems.length} of {items.length} items
  </div>
)}
```

---

## RULE #19.21: Form Standards

### Form Layout

✅ **MUST use consistent form layouts:**

**In Modals:**
```jsx
<form onSubmit={handleSubmit} className="space-y-6">
  <div>
    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Name
    </label>
    <input
      type="text"
      id="name"
      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
    />
  </div>

  <div className="flex justify-end gap-3">
    <button type="button" onClick={onClose} className="...">Cancel</button>
    <button type="submit" className="...">Save</button>
  </div>
</form>
```

### Input Field Requirements

✅ **MUST include for all inputs:**
- Label with `htmlFor` matching input `id`
- Dark mode styling
- Focus states (indigo ring)
- Placeholder text (optional)
- Error state styling

### Input Classes (Standard)

```jsx
// Base input
className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"

// Error state
className="block w-full rounded-md border-red-300 dark:border-red-600 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-500 focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 sm:text-sm"
```

### Validation & Error Display

✅ **MUST show validation errors:**

```jsx
{errors.email && (
  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
    {errors.email}
  </p>
)}
```

### Submit Button States

✅ **MUST show loading state:**

```jsx
<button
  type="submit"
  disabled={loading}
  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Saving...
    </>
  ) : (
    'Save'
  )}
</button>
```

---

## RULE #19.22: Modal & Drawer Standards

### When to Use What

✅ **USE Dialog/Modal when:**
- Require immediate user action
- Confirming destructive actions
- Simple forms (1-5 fields)
- Alerts and notifications

✅ **USE SlideOver/Drawer when:**
- Complex forms (>5 fields)
- Viewing detailed information
- Multi-step wizards
- Editing without leaving context

✅ **USE Full Page when:**
- Very complex forms
- Multi-section editing
- Creating new major entities
- When user needs full context

### Modal Implementation (Headless UI)

```jsx
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

<Dialog open={isOpen} onClose={onClose} className="relative z-50">
  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

  <div className="fixed inset-0 flex items-center justify-center p-4">
    <DialogPanel className="mx-auto max-w-lg rounded-xl bg-white dark:bg-gray-800 p-6">
      <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">
        Modal Title
      </DialogTitle>

      {/* Content */}

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose}>Cancel</button>
        <button>Confirm</button>
      </div>
    </DialogPanel>
  </div>
</Dialog>
```

### Modal Sizes

✅ **STANDARD modal widths:**
- `max-w-sm` (384px) - Simple confirmations
- `max-w-md` (448px) - Small forms
- `max-w-lg` (512px) - Standard forms
- `max-w-xl` (576px) - Complex forms
- `max-w-2xl` (672px) - Wide content
- `max-w-4xl` (896px) - Very wide content
- `max-w-7xl` (1280px) - Full-width modals

### Close Button Placement

✅ **MUST include close button:**

```jsx
<div className="absolute right-4 top-4">
  <button
    onClick={onClose}
    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
  >
    <XMarkIcon className="h-6 w-6" />
  </button>
</div>
```

---

## RULE #19.23: Toast Notification Standards

### Toast Component Usage

✅ **MUST use Toast component for:**
- Success confirmations
- Error messages
- Warning notifications
- Info messages

### Toast Implementation

```jsx
import Toast from '../components/Toast'

const [toast, setToast] = useState(null)

// Trigger toast
setToast({
  message: 'Contact saved successfully',
  type: 'success' // 'success' | 'error' | 'warning' | 'info'
})

// Render toast
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}
```

### Toast Message Guidelines

✅ **MUST write clear messages:**
- Success: "Contact saved successfully", "Email sent"
- Error: "Failed to save contact. Please try again."
- Warning: "Changes not saved. Please review form."
- Info: "New update available"

❌ **NEVER:**
- Show technical error messages to users
- Use toasts for critical errors (use modal instead)
- Stack multiple toasts (replace existing)
- Show toasts longer than 5 seconds (auto-dismiss)

### Toast Position

✅ **STANDARD position:** Top-right of screen (fixed positioning)

---

## RULE #19.24: Loading State Standards

### Page-Level Loading

✅ **MUST show full-page loader while fetching critical data:**

```jsx
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
```

### Component-Level Loading

✅ **USE skeleton screens for partial loads:**

```jsx
{loading ? (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
) : (
  <div>{data}</div>
)}
```

### Button Loading States

✅ **MUST disable and show spinner:**

```jsx
<button disabled={loading} className="...">
  {loading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Loading...
    </>
  ) : (
    'Submit'
  )}
</button>
```

### Inline Loading Indicators

✅ **USE for in-place updates:**

```jsx
{updating ? (
  <div className="flex items-center gap-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
    <span className="text-sm text-gray-500">Updating...</span>
  </div>
) : (
  <span>{value}</span>
)}
```

---

## RULE #19.25: Button & Action Standards

### Button Hierarchy

✅ **MUST use correct button type for context:**

**Primary (Call-to-action):**
```jsx
className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
```

**Secondary:**
```jsx
className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
```

**Destructive:**
```jsx
className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
```

**Tertiary/Ghost:**
```jsx
className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
```

### Button Sizes

✅ **STANDARD sizes:**
- Small: `px-3 py-1.5 text-xs`
- Medium: `px-4 py-2 text-sm` (default)
- Large: `px-6 py-3 text-base`

### Icon Buttons

✅ **MUST include accessible label:**

```jsx
<button
  aria-label="Delete contact"
  className="p-2 text-gray-400 hover:text-gray-500"
>
  <TrashIcon className="h-5 w-5" />
</button>
```

### Dropdown Action Menus

✅ **USE Headless UI Menu:**

```jsx
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

<Menu as="div" className="relative">
  <MenuButton className="...">
    <EllipsisVerticalIcon className="h-5 w-5" />
  </MenuButton>

  <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg">
    <MenuItem>
      {({ focus }) => (
        <button className={`${focus ? 'bg-gray-100 dark:bg-gray-700' : ''} ...`}>
          Edit
        </button>
      )}
    </MenuItem>
  </MenuItems>
</Menu>
```

---

## RULE #19.26: Status Badge Standards

### Badge Color Coding

✅ **MUST use semantic colors:**

**Success/Active/Verified:**
```jsx
className="bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
```

**Warning/Pending:**
```jsx
className="bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50"
```

**Error/Cancelled:**
```jsx
className="bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
```

**Info/Draft:**
```jsx
className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50"
```

**Neutral/Inactive:**
```jsx
className="bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/50"
```

### Badge Variants

✅ **USE appropriate variant:**

**Pill (rounded-full):**
```jsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
  <CheckCircleIcon className="h-3.5 w-3.5" />
  Active
</span>
```

**Rounded (rounded-md):**
```jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
  Draft
</span>
```

### Icon Usage in Badges

✅ **RECOMMENDED icons by status:**
- Success: CheckCircleIcon
- Error: XCircleIcon
- Warning: ExclamationTriangleIcon
- Info: InformationCircleIcon

---

## RULE #19.27: Empty State Standards

### Empty State Variants

✅ **MUST differentiate between:**

**1. First-time empty (no data ever):**
```jsx
<div className="text-center py-12">
  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
    {/* Appropriate icon */}
  </svg>
  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
    No contacts yet
  </h3>
  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
    Get started by creating your first contact.
  </p>
  <div className="mt-6">
    <button onClick={handleCreate} className="...">
      <PlusIcon className="h-5 w-5 mr-2" />
      Add Contact
    </button>
  </div>
</div>
```

**2. Filtered empty (no results for search/filter):**
```jsx
<div className="text-center py-12">
  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
    No results found
  </h3>
  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
    Try adjusting your search or filters.
  </p>
  <div className="mt-6">
    <button onClick={clearFilters} className="...">
      Clear Filters
    </button>
  </div>
</div>
```

**3. Error state:**
```jsx
<div className="text-center py-12">
  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
    Failed to load data
  </h3>
  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
    {error.message}
  </p>
  <div className="mt-6">
    <button onClick={retry} className="...">
      Try Again
    </button>
  </div>
</div>
```

---

## RULE #19.28: Navigation Standards

### Breadcrumbs

✅ **USE for deep navigation:**

```jsx
<nav className="flex mb-4" aria-label="Breadcrumb">
  <ol className="inline-flex items-center space-x-1">
    <li>
      <Link to="/" className="text-gray-500 hover:text-gray-700">
        Home
      </Link>
    </li>
    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    <li>
      <Link to="/contacts" className="text-gray-500 hover:text-gray-700">
        Contacts
      </Link>
    </li>
    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    <li className="text-gray-900 dark:text-white font-medium">
      {contact.name}
    </li>
  </ol>
</nav>
```

### Back Button

✅ **USE BackButton component:**

```jsx
import BackButton from '../components/common/BackButton'

<BackButton />  // Auto-detects if can go back, otherwise navigates to fallback
```

### Active Link Highlighting

✅ **MUST highlight active navigation:**

```jsx
<Link
  to="/contacts"
  className={`${
    location.pathname === '/contacts'
      ? 'bg-gray-900 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  } px-3 py-2 rounded-md text-sm font-medium`}
>
  Contacts
</Link>
```

---

## Protected Code Patterns (Chapter 19 - All Sections)

### DataTable Component Structure
**File:** `frontend/src/components/DataTable.jsx`
**Protected:** Core sorting and filtering logic, dark mode classes, empty states

### Advanced Table Pattern (ContactsPage)
**File:** `frontend/src/pages/ContactsPage.jsx`
**Protected:** Column resize logic, drag-and-drop handlers, localStorage persistence, URL tab management

### Advanced Table Pattern (POTable)
**File:** `frontend/src/components/purchase-orders/POTable.jsx`
**Protected:** Inline filter implementation, column configuration pattern

### Toast Component
**File:** `frontend/src/components/Toast.jsx`
**Protected:** Toast timing logic, animation patterns

### BackButton Component
**File:** `frontend/src/components/common/BackButton.jsx`
**Protected:** Navigation history logic

❌ **DO NOT:**
- Remove resize handles from existing tables
- Remove inline filters without replacement
- Change localStorage key patterns (breaks user preferences)
- Remove dark mode support from any component
- Remove sticky headers
- Remove sort indicators
- Change URL parameter names (breaks bookmarks)
- Modify toast auto-dismiss timing without approval
- Remove search debouncing from large datasets
- Change button color coding (semantic meaning)
- Modify badge color scheme (status indicators)

---

# Chapter 20: Agent System & Automation

┌─────────────────────────────────────────────────┐
│ 📕 LEXICON (BUGS):    Chapter 20                │
│ 📘 USER MANUAL (HOW): N/A (Developer-only)      │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Overview

The Agent System provides specialized AI agents for development tasks. Each agent has specific capabilities, tracks run history, and is stored in the `agent_definitions` database table.

**6 Active Agents:**
1. **backend-developer** - Rails API development
2. **frontend-developer** - React + Vite frontend
3. **production-bug-hunter** - General bug diagnosis
4. **deploy-manager** - Git + Heroku deployment
5. **planning-collaborator** - Architecture planning
6. **gantt-bug-hunter** - Gantt-specific diagnostics

**Database-Primary:** Agent definitions stored in database, managed via API.

---

## RULE #20.1: Agent Definitions Are Database-Driven

**Agent configurations MUST be stored in the `agent_definitions` table.**

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

**Implementation:**

```ruby
# Record successful agent run
agent = AgentDefinition.find_by(agent_id: 'backend-developer')
agent.record_success(
  "Created API endpoint successfully",
  {
    files_created: 3,
    tests_passed: true,
    duration_seconds: 45
  }
)

# Record failed agent run
agent.record_failure(
  "Migration failed with syntax error",
  {
    error_type: "SyntaxError",
    error_message: "unexpected token",
    file: "db/migrate/...",
    line: 12
  }
)
```

**Files:**
- `backend/app/models/agent_definition.rb`
- `backend/app/controllers/api/v1/agent_definitions_controller.rb`
- `backend/db/migrate/*_create_agent_definitions.rb`

---

## RULE #20.2: Agent Invocation Protocol

**Agents MUST follow a standardized invocation pattern.**

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

**Example Workflow:**

```javascript
// 1. User types shortcut
"backend dev"

// 2. Claude Code reads agent definition
const agent = await fetch('/api/v1/agent_definitions/backend-developer')

// 3. Execute agent task
const result = await Task({
  subagent_type: 'general-purpose',
  prompt: agent.purpose + "\n\n" + userRequest,
  model: agent.model
})

// 4. Record result
await fetch(`/api/v1/agent_definitions/backend-developer/record_run`, {
  method: 'POST',
  body: {
    status: result.success ? 'success' : 'failure',
    message: result.message,
    details: result.details
  }
})
```

---

## RULE #20.3: Run History Tracking

**Every agent execution MUST be recorded in run history.**

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

**Database Fields:**

```ruby
# agent_definitions table
total_runs: 0
successful_runs: 0
failed_runs: 0
last_run_at: nil
last_status: 'success' | 'failure' | 'error'
last_message: "Completed successfully"
last_run_details: {
  duration_seconds: 45,
  files_modified: 3,
  tests_passed: true
}
```

**Success Rate Calculation:**

```ruby
def success_rate
  return 0 if total_runs.zero?
  (successful_runs.to_f / total_runs * 100).round(1)
end
```

---

## RULE #20.4: Agent Types and Specialization

**Each agent MUST have a specific agent_type and focus area.**

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

**Agent Types:**

| Type | Purpose | Examples |
|------|---------|----------|
| **development** | Code creation/modification | backend-developer, frontend-developer |
| **diagnostic** | Bug hunting and analysis | production-bug-hunter, gantt-bug-hunter |
| **deployment** | Release management | deploy-manager |
| **planning** | Architecture and design | planning-collaborator |

**Specialization Example:**

```ruby
# Gantt Bug Hunter - Highly specialized
agent_type: 'diagnostic'
focus: 'Gantt Chart & Schedule Master Bug Diagnosis'
when_to_use: 'Gantt-related bugs ONLY'

# Production Bug Hunter - General purpose
agent_type: 'diagnostic'
focus: 'General Production Bug Diagnosis & Resolution'
when_to_use: 'All non-Gantt production bugs'
```

---

## RULE #20.5: Agent Priority and Display Order

**Agents MUST be displayed in priority order (higher priority first).**

✅ **MUST:**
- Set priority field (0-100)
- Display agents sorted by: priority DESC, name ASC
- Show active agents first
- Hide inactive agents from main list

❌ **NEVER:**
- Display agents alphabetically only
- Show inactive agents in main list
- Change priority without reason

**Priority Guidelines:**

```ruby
100 - Critical development agents (backend-developer)
90  - Essential development agents (frontend-developer)
85  - Specialized diagnostic agents (gantt-bug-hunter)
80  - General diagnostic agents (production-bug-hunter)
70  - Deployment agents (deploy-manager)
60  - Planning agents (planning-collaborator)
0   - Default (new agents)
```

---

## RULE #20.6: Agent Shortcuts and Invocation

**Agents MUST support both full names and shortcuts.**

✅ **MUST:**
- Support `run {agent-id}` (e.g., `run backend-developer`)
- Support shortened versions (e.g., `backend dev`, `gantt`)
- Document shortcuts in `example_invocations` field
- Parse user input case-insensitively

❌ **NEVER:**
- Require exact agent_id match
- Skip documenting shortcuts
- Create conflicting shortcuts

**Shortcut Patterns:**

```plaintext
backend-developer:
  - "backend dev"
  - "run backend-developer"
  - "run backend"

frontend-developer:
  - "frontend dev"
  - "run frontend-developer"
  - "run frontend"

gantt-bug-hunter:
  - "gantt"
  - "gantt bug hunter"
  - "run gantt-bug-hunter"

deploy-manager:
  - "deploy"
  - "run deploy-manager"
  - "run deploy"

production-bug-hunter:
  - "production bug hunter"
  - "bug hunter"
  - "run production-bug-hunter"

planning-collaborator:
  - "plan"
  - "run planning-collaborator"
  - "run planner"
```

---

## RULE #20.7: Recently Run Check (Smart Testing)

**Diagnostic agents SHOULD check if tests ran recently to avoid redundant runs.**

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

**Implementation:**

```ruby
# In AgentDefinition model
def recently_run?(minutes = 60)
  return false if last_run_at.nil?
  return false if last_status != 'success'
  last_run_at > minutes.minutes.ago
end
```

**Usage in Agent:**

```javascript
// Gantt Bug Hunter protocol
const agent = await getAgent('gantt-bug-hunter')

if (agent.recently_run(60)) {
  console.log(`⏭️ Tests skipped (last successful run was ${minutesAgo} minutes ago)`)
  console.log(`Using cached results from ${agent.last_run_at}`)
  // Proceed with static analysis only
} else {
  console.log(`🧪 Running full test suite (last run: ${agent.last_run_at || 'Never'})`)
  // Run all 12 automated tests
}
```

---

## API Endpoints Reference

### GET /api/v1/agent_definitions
Returns list of all active agents, sorted by priority.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "agent_id": "backend-developer",
      "name": "Backend Developer",
      "agent_type": "development",
      "focus": "Rails API Backend Development",
      "priority": 100,
      "total_runs": 42,
      "successful_runs": 40,
      "failed_runs": 2,
      "success_rate": 95.2,
      "status_emoji": "✅"
    }
  ]
}
```

### GET /api/v1/agent_definitions/:agent_id
Returns single agent with full details.

### POST /api/v1/agent_definitions/:agent_id/record_run
Records a run result.

**Request:**
```json
{
  "status": "success",
  "message": "Created API endpoint successfully",
  "details": {
    "duration_seconds": 45,
    "files_created": 3,
    "tests_passed": true
  }
}
```

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
