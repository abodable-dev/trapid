# TRAPID TEACHER - Implementation Patterns & Code Examples

**Version:** 1.0.0
**Last Updated:** 2025-11-17 11:28 AEST
**Authority Level:** Reference (HOW to implement Bible rules)
**Audience:** Claude Code + Human Developers

---

## 🔴 CRITICAL: Read This First

### This Document is "The Teacher"

This file contains **code examples and step-by-step guides** for implementing Trapid features.

**This Teacher Contains HOW-TO ONLY:**
- 🧩 Component patterns (full code examples)
- ✨ Feature implementation guides (step-by-step)
- 🔧 Utility functions (reusable code)
- 🪝 Hook patterns (React/Rails hooks)
- 🔌 Integration guides (Xero, OneDrive, etc.)
- ⚡ Optimization techniques (performance improvements)

**For RULES (MUST/NEVER/ALWAYS):**
- 📖 See [TRAPID_BIBLE.md](TRAPID_BIBLE.md)

**For BUG HISTORY & KNOWLEDGE:**
- 📕 See [TRAPID_LEXICON.md](TRAPID_LEXICON.md)

**For USER GUIDES (how to use features):**
- 📘 See [TRAPID_USER_MANUAL.md](TRAPID_USER_MANUAL.md)

---

## 💾 Database-Driven Teacher

**IMPORTANT:** This file is auto-generated from the `documentation_entries` database table.

**To edit entries:**
1. Go to Documentation page in Trapid
2. Click "🔧 TRAPID Teacher"
3. Use the UI to add/edit/delete teaching patterns
4. Run `rake trapid:export_teacher` to update this file

**Single Source of Truth:** Database (not this file)

---

## Table of Contents

- [Chapter 0: Overview & System-Wide Rules](#chapter-0-overview-system-wide-rules)
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


# Chapter 0: Overview & System-Wide Rules

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  0               │
│ 📕 LEXICON (BUGS):    Chapter  0               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §0.1: Lexicon Update Workflow - Database-Driven Documentation

✨ Feature

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #0 - Documentation Maintenance

### Quick Summary
Step-by-step workflow for updating Lexicon via database UI and exporting to markdown.

### Step-by-Step Guide
**Lexicon is database-driven** - Source of truth is `documentation_entries` table, NOT the .md file.

**Update Workflow:**
1. Go to Trapid app → Documentation page
2. Click "📕 TRAPID Lexicon"
3. Add/edit entries via UI (stores in documentation_entries table)
4. Run: `bin/rails trapid:export_lexicon`
5. Commit the updated TRAPID_LEXICON.md file

**Export Command:**
```bash
cd backend
bin/rails trapid:export_lexicon
```

**Git Workflow:**
```bash
git add TRAPID_DOCS/TRAPID_LEXICON.md
git commit -m "docs: Update Lexicon from database export"
```

### Code Example
```jsx
# Example: Adding a bug entry via Rails console
DocumentationEntry.create!(
  chapter_number: 9,
  chapter_name: 'Gantt & Schedule Master',
  entry_type: 'bug',
  title: 'Gantt Shaking During Cascade',
  status: 'fixed',
  severity: 'high',
  first_reported: '2025-11-10',
  fixed_date: '2025-11-11',
  description: 'Visual shaking during dependency updates',
  root_cause: 'isLoadingData not properly managing render locks',
  solution: 'Added proper lock timing in cascade handler',
  rule_reference: 'Chapter 9, RULE #9.2'
)
```

---

## §0.2: Database Schema Reference - documentation_entries Table

🔧 Util

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #0

### Quick Summary
Complete field reference for documentation_entries table structure.

### Step-by-Step Guide
**Database Schema Fields:**

**Core Fields:**
- `chapter_number` - Which chapter (0-20)
- `chapter_name` - Chapter title
- `entry_type` - Type: bug, architecture, test, performance, dev_note, common_issue, component, feature, util, hook, integration, optimization
- `title` - Entry title

**Lexicon-Specific (bugs):**
- `status` - For bugs: open, fixed, by_design, monitoring
- `severity` - For bugs: low, medium, high, critical
- `first_reported` - Date discovered (YYYY-MM-DD)
- `fixed_date` - Date resolved (YYYY-MM-DD)

**Teacher-Specific:**
- `section_number` - Format: X.Y or X.YA (e.g., 19.1, 19.11A)
- `difficulty` - beginner, intermediate, advanced
- `summary` - Quick summary/description
- `code_example` - Full code blocks
- `common_mistakes` - What to avoid
- `testing_strategy` - How to test
- `related_rules` - Link to Bible rules

**Universal Content Fields:**
- `description` - Brief summary
- `scenario` - How it manifests
- `root_cause` - Technical explanation
- `solution` - How to fix/implement
- `prevention` - How to avoid
- `component` - Specific component name
- `details` - Step-by-step guides
- `examples` - Examples
- `recommendations` - Best practices
- `rule_reference` - Link to Bible RULE

---

## §0.3: API Endpoints Reference - Documentation System

🔌 Integration

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #0

### Quick Summary
REST API endpoints for managing documentation entries.

### Step-by-Step Guide
**Documentation Entries API:**

`GET /api/v1/documentation_entries` - List entries
  - Query params: chapter, type, status, severity, search, category (lexicon/teacher)
  
`POST /api/v1/documentation_entries` - Create entry
  - Body: { documentation_entry: { chapter_number, title, entry_type, ... } }
  
`GET /api/v1/documentation_entries/:id` - Get single entry

`PUT /api/v1/documentation_entries/:id` - Update entry
  - Body: { documentation_entry: { ... } }

`DELETE /api/v1/documentation_entries/:id` - Delete entry

`GET /api/v1/documentation_entries/stats` - Get statistics

`POST /api/v1/documentation_entries/export_lexicon` - Export Lexicon to markdown

`POST /api/v1/documentation_entries/export_teacher` - Export Teacher to markdown

**Legacy Routes (backwards compatible):**
`/api/v1/documented_bugs/*` - Maps to documentation_entries controller

### Code Example
```jsx
// Example: Creating a documentation entry via API
const response = await api.post('/api/v1/documentation_entries', {
  documentation_entry: {
    chapter_number: 19,
    chapter_name: 'UI/UX Standards & Patterns',
    entry_type: 'component',
    section_number: '19.1',
    title: 'Table Component Selection Pattern',
    summary: 'Decision tree for choosing table type',
    related_rules: 'TRAPID_BIBLE.md RULE #19.1'
  }
})

// Example: Exporting Lexicon
await api.post('/api/v1/documentation_entries/export_lexicon')
```

---

## §0.4: Component Creation Enforcement Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #0.1

### Quick Summary
Automated workflow Claude Code must follow before creating any new component.

### Step-by-Step Guide
**Enforcement Workflow:**

**Step 1: Identify Component Type**
Check filename pattern:
- `*Table*.jsx` → Chapter 19 (UI/UX)
- `*Modal*.jsx` → Chapter 19 (UI/UX)
- `*Form*.jsx` → Chapter 19 (UI/UX)
- `*Gantt*.jsx` → Chapter 9 (Gantt) + Chapter 19 (UI/UX)
- `*Auth*.jsx` → Chapter 1 (Authentication)
- `*Contact*.jsx` → Chapter 3 (Contacts)
- See RULE #0.1 for full mapping table

**Step 2: Read Required Chapters**
Use Read tool to load:
```
Read: /Users/rob/Projects/trapid/TRAPID_DOCS/TRAPID_BIBLE.md
  - offset: [chapter start]
  - limit: [chapter length]
```

**Step 3: Follow ALL Rules**
Parse chapter for:
- MUST directives
- NEVER directives
- ALWAYS directives
- User confirmation requirements

**Step 4: Ask User When Required**
Some rules require asking (e.g., RULE #19.1 table type)

**Step 5: Create Component**
Now write the file following all discovered rules

### Code Example
```jsx
// Example: Creating LexiconTableView.jsx (CORRECT workflow)

// 1. User requests: "Create a table view for Lexicon"
// 2. Claude recognizes: filename contains "Table" → need Chapter 19
// 3. Claude reads: TRAPID_BIBLE.md Chapter 19
// 4. Claude sees: RULE #19.1 requires asking user for table type
// 5. Claude asks: "Should I use:
  1. DataTable.jsx (read-only)
  2. Full advanced table?"
// 6. User responds: "2"
// 7. Claude creates: LexiconTableView.jsx with ALL Chapter 19 features

// Component mapping reference:
const COMPONENT_CHAPTER_MAP = {
  table: [19],
  modal: [19],
  form: [19],
  gantt: [9, 19],
  auth: [1],
  contact: [3],
  pricebook: [4],
  job: [5],
  estimate: [6],
  po: [8],
  xero: [15]
}
```

### ⚠️ Common Mistakes
**Common Mistakes:**

❌ Creating component immediately without reading Bible
❌ Skipping user confirmation when rules require it
❌ Reading only part of the chapter
❌ Ignoring NEVER rules because they seem optional
❌ Assuming best practices override Bible rules

**Consequences:**
- Non-compliant component
- Requires refactoring
- Wastes time and tokens
- Violates RULE #0.1

---

## §0.5: Bug Fix Documentation Workflow

✨ Feature

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #0 - Bug Fix Documentation

### Quick Summary
Complete workflow for documenting every bug fix in the Lexicon.

### Step-by-Step Guide
**🔴 CRITICAL: Every bug fix MUST be documented**

**Complete Workflow:**

**1. Fix the Bug**
- Write the code fix
- Test locally
- Verify fix works

**2. Update Lexicon via UI**
Navigate to Trapid app:
- Go to Documentation page
- Click "📕 TRAPID Lexicon"
- Click "Add Entry"
- Fill in all fields (see field guide below)
- Save

**3. Export Lexicon**
```bash
cd backend
bin/rails trapid:export_lexicon
```

**4. Update Bible (if needed)**
Add new RULE if bug revealed:
- Protected code pattern
- Configuration requirement
- Critical validation

**5. Commit Everything**
```bash
git add [code files] TRAPID_DOCS/TRAPID_LEXICON.md
git commit -m "fix: [bug description]

- Fixed [issue]
- Added Lexicon entry
- See TRAPID_LEXICON.md Chapter X"
```

### Code Example
```jsx
# Example Lexicon Entry Fields (via UI)

**Required:**
chapter_number: 9
chapter_name: "Gantt & Schedule Master"
entry_type: "bug"
title: "Gantt Shaking During Cascade"

**Bug-Specific:**
status: "fixed"
severity: "high"
first_reported: "2025-11-10"
fixed_date: "2025-11-11"

**Content:**
description: "Visual shaking observed during dependency updates in Gantt chart"

scenario: "When dragging a task with dependencies, the chart would visibly shake/flicker"

root_cause: "isLoadingData lock not properly set during cascade operations, causing re-renders mid-update"

solution: "Added proper isLoadingData.current = true at start of cascade, set to false after 300ms timeout to allow DOM to settle"

prevention: "Always use isLoadingData lock for any batch Gantt updates. See RULE #9.2 for timing requirements"

component: "DHtmlxGanttView.jsx"

rule_reference: "Chapter 9, RULE #9.2"

# After saving, export:
# bin/rails trapid:export_lexicon
```

### 🧪 Testing Strategy
**Testing the Documentation:**

1. Verify entry appears in UI
2. Check export generates correct markdown
3. Confirm cross-references link properly
4. Test search finds the entry
5. Validate all fields populated

---

## §0.6: Chapter Relationship Map - Feature Dependencies

🔧 Util

**📖 Related Bible Rules:** TRAPID_BIBLE.md Chapter 0 - Chapter Relationship Map

### Quick Summary
Understanding how chapters relate and depend on each other for complete context.

### Step-by-Step Guide
**Feature Dependencies Overview:**

**Core Infrastructure (Used by ALL):**
- Chapter 1: Authentication & Users
- Chapter 2: System Administration (timezone, company settings)

**Data & Content Management:**
- Chapter 3: Contacts → Used by Ch 4 (suppliers), Ch 5 (clients), Ch 6 (quotes), Ch 8 (POs), Ch 14 (chat), Ch 15 (Xero)
- Chapter 4: Price Books → Used by Ch 6 (estimate pricing), Ch 8 (PO pricing), Ch 17 (automation)
- Chapter 18: Custom Tables → Standalone

**Project Execution Flow:**
1. Ch 6: Estimates & Quoting
2. Ch 5: Jobs & Construction (central)
3. Ch 8: Purchase Orders (from estimates)
4. Ch 9: Gantt (visual timeline)
5. Ch 10: Project Tasks
6. Ch 11: Weather (affects schedule)

**AI & Automation:**
- Ch 7: AI Plan Review → Uses Ch 12 (OneDrive)
- Ch 17: Workflows → Orchestrates Ch 4, Ch 12

**Integrations:**
- Ch 12: OneDrive → Used by Ch 5, Ch 7, Ch 17
- Ch 13: Outlook → Links to Ch 5
- Ch 14: Chat → For Ch 5, Ch 10
- Ch 15: Xero → Syncs Ch 3, links Ch 8
- Ch 16: Payments → Tracks Ch 8, reconciles Ch 15

**UI/UX:**
- Ch 19: UI/UX Standards → Applies to ALL frontend

### Examples
**Example 1: Creating a Job (Chapter 5)**
Requires:
- User (Ch 1)
- Client contact (Ch 3)
- Company timezone (Ch 2)

May trigger:
- OneDrive folders (Ch 12)
- Gantt entry (Ch 9)
- Tasks (Ch 10)
- Chat channel (Ch 14)

**Example 2: Generating Purchase Orders (Chapter 8)**
Source: Estimate (Ch 6)
Uses: Supplier contacts (Ch 3), Pricebook items (Ch 4)
May create: Workflow approval (Ch 17), Xero bill (Ch 15), Payment tracking (Ch 16)

**Example 3: Gantt Scheduling (Chapter 9)**
Requires: Job (Ch 5), Tasks (Ch 10), Weather (Ch 11), Timezone (Ch 2)
Affects: Task due dates (Ch 10), Workflow deadlines (Ch 17)

### Recommendations
**When Working on a Feature:**

1. Identify primary chapter
2. Check this map for dependencies
3. Read ALL related chapters
4. Consider cross-chapter impacts
5. Test integration points

---


# Chapter 1: Authentication & Users

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  1               │
│ 📕 LEXICON (BUGS):    Chapter  1               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §1.1: JWT Token Handling Implementation

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #1.1

### Quick Summary
Complete JWT authentication pattern using JsonWebToken service for encoding and decoding tokens.

### Code Example
```jsx
# backend/app/services/json_web_token.rb
class JsonWebToken
  SECRET_KEY = Rails.application.secrets.secret_key_base.to_s

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end
end

# ApplicationController authorization
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

---

## §1.2: Password Complexity Validation

🔧 Util | 🟢 Beginner

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #1.2

### Quick Summary
12-character minimum password with complexity rules using custom validation.

### Code Example
```jsx
# app/models/user.rb
has_secure_password

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

---

## §1.3: Role-Based Access Control

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #1.3

### Quick Summary
Permission system using hardcoded roles and model-based permission methods.

### Code Example
```jsx
# app/models/user.rb
ROLES = %w[user admin product_owner estimator supervisor builder].freeze

def admin?
  role == 'admin'
end

def can_create_templates?
  admin? || product_owner?
end

def can_edit_schedule?
  admin? || product_owner? || estimator?
end

# Controller usage:
before_action :check_can_edit_templates

def check_can_edit_templates
  unless @current_user.can_create_templates?
    render json: { error: 'Unauthorized' }, status: :forbidden
  end
end

```

---

## §1.4: Rate Limiting with Rack::Attack

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #1.4

### Quick Summary
Configure rate limiting on auth endpoints using Rack::Attack middleware.

### Code Example
```jsx
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

---

## §1.5: OAuth Integration with OmniAuth

🔌 Integration | 🔴 Advanced

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #1.5

### Quick Summary
Microsoft Office 365 OAuth integration using OmniAuth gem.

### Code Example
```jsx
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
    user.password = SecureRandom.hex(16)
    user.oauth_token = auth.credentials.token
    user.oauth_expires_at = Time.at(auth.credentials.expires_at)
  end
end

```

---

## §1.6: Password Reset Flow with Secure Tokens

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #1.6

### Quick Summary
Secure password reset using hashed tokens with 2-hour expiration.

### Code Example
```jsx
# Generate reset token
def reset_password
  token = SecureRandom.urlsafe_base64(32)
  @user.update!(
    reset_password_token: Digest::SHA256.hexdigest(token),
    reset_password_sent_at: Time.current
  )
  # Send token via email (not API response)
end

# Validate and update password
def update_password_with_token
  hashed_token = Digest::SHA256.hexdigest(params[:token])
  user = User.find_by(reset_password_token: hashed_token)

  if user && user.reset_password_sent_at > 2.hours.ago
    user.update!(
      password: params[:password],
      reset_password_token: nil,
      reset_password_sent_at: nil
    )
    render json: { message: 'Password updated' }
  else
    render json: { error: 'Token expired' }, status: :unprocessable_entity
  end
end

```

---

## §1.7: Portal User Separation

✨ Feature | 🔴 Advanced

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #1.7

### Quick Summary
Isolated portal_users table with activity logging and account lockout.

### Code Example
```jsx
# app/models/portal_user.rb
class PortalUser < ApplicationRecord
  belongs_to :contact
  has_secure_password

  enum portal_type: { supplier: 'supplier', customer: 'customer' }

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
def self.log(portal_user:, action:, ip:, user_agent:)
  create!(
    portal_user: portal_user,
    action_type: action,
    ip_address: ip,
    user_agent: user_agent,
    occurred_at: Time.current
  )
end

```

---


# Chapter 2: System Administration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  2               │
│ 📕 LEXICON (BUGS):    Chapter  2               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §2.1: Company Settings Singleton Pattern

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.1

### Code Example
```jsx
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

# ---

# In controllers, services, models:
settings = CompanySetting.instance

# Access fields:
timezone = settings.timezone
working_days = settings.working_days
company_name = settings.company_name
```

---

## §2.2: Timezone Handling - Backend Time Calculations

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.2

### Code Example
```jsx
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

# ---

# When calculating dates for a job:
settings = CompanySetting.instance

Time.use_zone(settings.timezone) do
  job_start = Time.zone.parse("2025-01-15 08:00:00")
  job_end = job_start + 5.days

  # All calculations within this block use company timezone
end
```

---

## §2.3: Timezone Handling - Frontend Time Display

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.3

### Code Example
```jsx
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

# ---

// GanttChart.jsx
import { formatDate, formatDateTime } from '../utils/timezoneUtils';

const TaskRow = ({ task }) => (
  <div>
    <span>Start: {formatDate(task.planned_start_date)}</span>
    <span>End: {formatDate(task.planned_end_date)}</span>
  </div>
);
```

---

## §2.4: Working Days Configuration & Business Day Calculations

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.4

### Code Example
```jsx
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

# ---

# app/models/company_setting.rb
def working_day?(date)
  day_name = date.strftime('%A').downcase  # "monday", "tuesday", etc.
  working_days[day_name] == true
end

def business_day?(date)
  # Business day = working day AND not a public holiday
  working_day?(date) && !PublicHoliday.on_date(date).exists?
end

# ---

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

---

## §2.5: User Roles & Permission System

🧩 Component | 🟢 Beginner

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.5

### Code Example
```jsx
# app/models/user.rb
enum role: {
  user: 0,           # Basic access (view-only for most features)
  admin: 1,          # Full system access
  product_owner: 2,  # Full access + product backlog management
  estimator: 3,      # Estimate/quote creation and editing
  supervisor: 4,     # Field supervisor (task completion, checklists)
  builder: 5         # Builder/contractor (task viewing, updates)
}

# ---

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

# ---

# app/controllers/api/v1/schedule_templates_controller.rb
before_action :require_template_permissions, only: [:create, :update, :destroy]

def require_template_permissions
  unless current_user.can_create_templates?
    render json: { error: "Insufficient permissions" }, status: :forbidden
  end
end
```

---

## §2.6: Assignable Roles for Task Assignment

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.6

### Code Example
```jsx
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

# ---

# app/controllers/api/v1/schedule_tasks_controller.rb
def my_tasks
  # Filter by assignable_role, not system role
  tasks = ScheduleTask.where(assignable_role: current_user.assignable_role)
  render json: tasks
end
```

---

## §2.7: Password Complexity Requirements

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.7

### Code Example
```jsx
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

# ---

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

---

## §2.8: Timezone Options Limitation

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.8

### Code Example
```jsx
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

# ---

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

---

## §2.9: Working Days UI - Sunday Default True

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #2.9

### Code Example
```jsx
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

# ---

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

---


# Chapter 3: Contacts & Relationships

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  3               │
│ 📕 LEXICON (BUGS):    Chapter  3               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §3.1: Contact Types are Multi-Select Arrays

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #3.1

### Quick Summary
- Use `contact_types` as PostgreSQL array column - Allow multiple types: `['customer', 'supplier']` for hybrid contacts - Set `primary_contact_type` automatically if blank (first type in array) - Vali

### Code Example
```jsx
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

# ---

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

---

## §3.2: Bidirectional Relationships Require Reverse Sync

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #3.2

### Quick Summary
- Create reverse relationship after creating forward relationship - Update reverse relationship when forward is updated - Delete reverse relationship when forward is deleted - Use Thread-local flags t

### Code Example
```jsx
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

---

## §3.3: Xero Sync Uses Priority-Based Fuzzy Matching

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #3.3

### Quick Summary
-

### Code Example
```jsx
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

---

## §3.4: Contact Deletion MUST Check Purchase Order Dependencies

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #3.4

### Quick Summary
- Check for linked suppliers via `contact.suppliers` association - Check if suppliers have purchase orders: `suppliers.joins(:purchase_orders).distinct` - Block deletion if ANY purchase orders exist -

### Code Example
```jsx
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

---

## §3.6: Portal Users MUST Have Secure Password Requirements

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #3.6

### Quick Summary
- Minimum 12 characters - At least one uppercase, lowercase, digit, and special character - Lock account after 5 failed login attempts - Lockout duration: 30 minutes - Reset failed attempts counter on

### Code Example
```jsx
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

---


# Chapter 4: Price Books & Suppliers

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  4               │
│ 📕 LEXICON (BUGS):    Chapter  4               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §4.1: Price Changes MUST Create Price History Automatically

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #4.1

### Quick Summary
- Use `after_update` callback to detect price changes - Create PriceHistory with `old_price`, `new_price`, `change_reason` - Set `price_last_updated_at` to current timestamp - Track `changed_by_user_i

### Code Example
```jsx
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

# ---

# Only when bulk importing historical data
item.skip_price_history_callback = true
item.update!(current_price: 450.00)
```

---

## §4.2: Prevent Duplicate Price History - Unique Constraint + Time Window

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #4.2

### Quick Summary
- Use unique index: `(pricebook_item_id, supplier_id, new_price, created_at)` - Add custom validation preventing entries within 5 seconds - Handle race conditions gracefully (return existing record) -

### Code Example
```jsx
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

# ---

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

---

## §4.3: SmartPoLookupService - 6-Strategy Cascading Fallback

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #4.3

### Quick Summary
- Execute strategies in priority order (most specific → most general) - Stop immediately on first match (don't continue searching) - Track which strategy succeeded for analytics - Collect warnings for

### Code Example
```jsx
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

---

## §4.4: Supplier Matching - Normalized Name Comparison with Business Suffix Removal

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #4.4

### Quick Summary
- Remove business entity types: "Pty Ltd", "Limited", "Inc", "Corporation", "Co" - Remove location identifiers: "Australia", "Australian", "Qld", "Queensland" - Remove organizational terms: "Group", "

### Code Example
```jsx
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

# ---

"Water Supplies Pty Ltd" → "water supplies"
"ABC Electrical Services Queensland" → "abc electrical"
"Smith & Associates Inc." → "smith"
```

---

## §4.5: Price Volatility Detection - Coefficient of Variation on 6-Month Window

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #4.5

### Quick Summary
- Use rolling 6-month window of prices - Calculate CV = (Standard Deviation / Mean) × 100 - Classify: stable (<5%), moderate (5-15%), volatile (>15%) - Require minimum 3 data points for valid calculat

### Code Example
```jsx
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

# ---

# Stable pricing
prices = [100, 103, 102, 105, 104]
mean = 102.8, std_dev = 1.92, CV = 1.87% → "stable"

# Volatile pricing
prices = [100, 150, 80, 160, 90]
mean = 116, std_dev = 35.8, CV = 30.9% → "volatile"
```

---

## §4.6: Risk Scoring - Multi-Factor Weighted Calculation (0-100 Scale)

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #4.6

### Quick Summary
- Calculate all 4 components independently - Apply fixed weights (freshness=40%, reliability=20%, volatility=20%, missing=20%) - Return score 0-100 with level: low/medium/high/critical - Use database-

### Code Example
```jsx
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

# ---

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

---

## §4.7: Bulk Updates - Transaction Wrapper with Price History Batch Creation

⚡ Optimization | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #4.7

### Quick Summary
- Wrap all updates in `ActiveRecord::Base.transaction` - Batch create price histories in single insert - Rollback entirely on any validation error - Return detailed success/failure report per item - U

### Code Example
```jsx
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

# ---

Individual Updates (100 items):
- 100 UPDATE queries
- 100 INSERT queries (price history)
= 200 queries, ~5 seconds

Bulk Update with Transaction:
- 100 UPDATE queries
- 1 INSERT query (batch)
= 101 queries, ~1 second
```

---

## §4.8: OneDrive Image Proxy - Cache Control with 1-Hour Expiry

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #4.8

### Quick Summary
- Set `Cache-Control: public, max-age=3600` (1 hour) - Store OneDrive `file_id` permanently (not URL) - Refresh URL on each request via Microsoft Graph API - Handle expired credentials gracefully (503

### Code Example
```jsx
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

# ---

get 'pricebook/:id/proxy_image/:file_type', to: 'pricebook_items#proxy_image'
```

---


# Chapter 5: Jobs & Construction Management

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  5               │
│ 📕 LEXICON (BUGS):    Chapter  5               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §5.1: Construction MUST Have At Least One Contact

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #5.1

### Quick Summary
- Validate `must_have_at_least_one_contact` on update - Allow creation without contacts (initial save) - Require at least one contact before job can be used - Show validation error if all contacts rem

### Code Example
```jsx
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

---

## §5.2: Live Profit Calculation - Dynamic Not Cached

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #5.2

### Quick Summary
- Calculate `live_profit = contract_value - sum(all_purchase_orders.total)` - Recalculate `profit_percentage = (live_profit / contract_value) * 100` - Use `calculate_live_profit` and `calculate_profit

### Code Example
```jsx
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

# ---

# app/controllers/api/v1/constructions_controller.rb
def show
  @construction = Construction.find(params[:id])
  render json: @construction.as_json.merge(
    live_profit: @construction.calculate_live_profit,
    profit_percentage: @construction.calculate_profit_percentage
  )
end
```

---

## §5.3: Task Dependencies - No Circular References

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #5.3

### Quick Summary
- Validate `no_circular_dependencies` before saving TaskDependency - Use graph traversal (BFS) to detect cycles - Check entire predecessor chain for successor_task - Reject dependency if circular refe

### Code Example
```jsx
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

---

## §5.4: Task Status Transitions - Automatic Date Setting

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #5.4

### Quick Summary
- Set `actual_start_date = Date.current` when status → `in_progress` (if nil) - Set `actual_end_date = Date.current` when status → `complete` - Set `progress_percentage = 100` when status → `complete`

### Code Example
```jsx
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

---

## §5.5: Task Spawning - Status-Based Child Task Creation

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #5.5

### Quick Summary
- Spawn

### Code Example
```jsx
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

# ---

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

---

## §5.6: Schedule Cascade - Dependency-Based Date Propagation

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #5.6

### Quick Summary
- Use `ScheduleCascadeService` to recalculate dependent task dates - Respect dependency types (FS/SS/FF/SF) - Apply lag_days to calculations - Skip manually_positioned tasks (user-set dates) - Recursi

### Code Example
```jsx
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

# ---

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

---

## §5.7: OneDrive Folder Creation - Async with Status Tracking

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #5.7

### Quick Summary
- Use `CreateJobFoldersJob` background job - Track status: `not_requested` → `pending` → `processing` → `completed` / `failed` - Use `onedrive_folder_creation_status` enum field - Set `onedrive_folder

### Code Example
```jsx
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

# ---

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

# ---

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

---

## §5.8: Schedule Template Instantiation - All-or-Nothing Transaction

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #5.8

### Quick Summary
- Use `ActiveRecord::Base.transaction` for all template instantiation - Rollback entire operation if any task fails to create - Rollback if dependency creation fails - Rollback if date calculation fai

### Code Example
```jsx
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

---


# Chapter 6: Estimates & Quoting

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  6               │
│ 📕 LEXICON (BUGS):    Chapter  6               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §6.1: Fuzzy Job Matching - Three-Tier Confidence Thresholds

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #6.1

### Quick Summary
- Use Levenshtein distance + word matching + substring bonuses - Auto-match at

### Code Example
```jsx
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

---

## §6.2: External API Key Security - SHA256 Hashing Only

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #6.2

### Quick Summary
- Hash API keys with SHA256 before storage - Validate incoming keys by hashing and comparing digests - Store keys in `external_integrations` table - Track usage with `last_used_at` timestamp - Support

### Code Example
```jsx
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

# ---

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

# ---

create_table :external_integrations do |t|
  t.string :name, null: false
  t.string :api_key_digest, null: false  # SHA256 hash
  t.boolean :active, default: true
  t.datetime :last_used_at
  t.timestamps
end
```

---

## §6.3: Estimate Import - Validate Before Auto-Matching

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #6.3

### Quick Summary
- Validate `job_name` is present and non-empty - Validate `materials` array has at least 1 item - Validate each material has: `category`, `item`, `quantity` - Return 422 Unprocessable Entity for inval

### Code Example
```jsx
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

# ---

{
  "success": false,
  "error": "Material at index 0 missing 'item' field"
}
```

---

## §6.4: PO Generation from Estimate - Transaction Safety

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #6.4

### Quick Summary
- Wrap entire conversion in `ActiveRecord::Base.transaction` - Rollback if any PO creation fails - Rollback if any line item creation fails - Rollback if supplier lookup fails critically - Mark estima

### Code Example
```jsx
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

---

## §6.5: AI Plan Review - Async Processing Required

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #6.5

### Quick Summary
- Enqueue `AiReviewJob` for all plan reviews - Create `EstimateReview` record with `status: 'pending'` immediately - Return review_id to client for polling - Update status to `processing` → `completed

### Code Example
```jsx
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

# ---

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

# ---

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

---

## §6.6: Line Item Categorization - Normalized Category Matching

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #6.6

### Quick Summary
- Normalize categories to lowercase before grouping - Map common variations: "plumbing" = "plumber" = "plumb" - Use category normalization service - Handle nil/blank categories with "Uncategorized" gr

### Code Example
```jsx
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

# ---

# app/services/smart_po_lookup_service.rb
def lookup(task_description:, category:, quantity: 1)
  normalized_cat = CategoryNormalizationService.normalize(category)

  # Find supplier by normalized category
  supplier = find_supplier_for_category(normalized_cat)

  # ... rest of lookup logic
end
```

---

## §6.7: Estimate Status State Machine - Strict Transitions

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #6.7

### Quick Summary
- Start at `pending` status on creation - Transition to `matched` when linked to construction - Transition to `imported` when POs generated - Allow `rejected` from any state - Prevent reverse transiti

### Code Example
```jsx
pending ─┬─> matched ──> imported
         │
         └─> rejected (terminal)

# ---

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

# ---

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

---


# Chapter 7: AI Plan Review

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  7               │
│ 📕 LEXICON (BUGS):    Chapter  7               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §7.1: Estimate Must Be Matched to Construction

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.1

### Quick Summary
- Validate `estimate.construction_id` is present before starting review - Return 422 status with clear error message if not matched - Show "Match to Job" button in UI if unmatched

### Code Example
```jsx
# app/services/plan_review_service.rb
def validate_estimate_matched!
  unless @estimate.construction
    raise NoConstructionError, "Estimate must be matched to a construction/job before AI review"
  end
end
```

---

## §7.2: OneDrive Plan Folder Structure

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.2

### Quick Summary
1. `01 - Plans` 2. `02 - Engineering` 3. `03 - Specifications`

### Code Example
```jsx
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

---

## §7.3: PDF File Size Limit

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.3

### Quick Summary
- Check file size before download - Skip files > 20MB - Return error if NO valid PDFs found after filtering

### Code Example
```jsx
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

---

## §7.4: Async Processing with Background Jobs

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.4

### Quick Summary
- Return 202 Accepted immediately with review_id - Enqueue AiReviewJob with estimate_id - Set initial status to 'pending', update to 'processing' in job - Frontend MUST poll for status (every 5 second

### Code Example
```jsx
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

# ---

// Poll every 5 seconds
const pollInterval = setInterval(async () => {
  const response = await api.get(`/api/v1/estimate_reviews/${reviewId}`)
  if (response.status === 'completed' || response.status === 'failed') {
    clearInterval(pollInterval)
    showResults(response)
  }
}, 5000)
```

---

## §7.5: Claude API Model and Prompt Structure

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.5

### Quick Summary
- Use exact model ID: `claude-3-5-sonnet-20241022` - Send PDFs as base64-encoded documents with MIME type `application/pdf` - Request JSON response format with specific schema - Include estimate line 

### Code Example
```jsx
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

# ---

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

---

## §7.6: Discrepancy Detection Logic

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.6

### Quick Summary
1.

### Code Example
```jsx
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

---

## §7.7: Confidence Score Calculation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.7

### Quick Summary
```ruby base_score = (items_matched / total_items) * 100 penalty = (items_mismatched * 5) + (items_missing * 3) + (items_extra * 2) confidence_score = [base_score - penalty, 0].max  # Clamp to 0 minim

### Code Example
```jsx
base_score = (items_matched / total_items) * 100
penalty = (items_mismatched * 5) + (items_missing * 3) + (items_extra * 2)
confidence_score = [base_score - penalty, 0].max  # Clamp to 0 minimum

# ---

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

---

## §7.8: Error Handling and Status Updates

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.8

### Quick Summary
- `NoConstructionError` - Estimate not matched - `OneDriveNotConnectedError` - OneDrive credential missing - `PDFNotFoundError` - No valid PDFs in plan folders - `FileTooLargeError` - All PDFs exceed 

### Code Example
```jsx
review.update!(
  status: :failed,
  ai_findings: { error: error_message },
  reviewed_at: Time.current
)

# ---

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

---

## §7.9: Prevent Duplicate Processing Reviews

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #7.9

### Quick Summary
- Query for existing review with `status: processing` - Return 422 error if found - Allow new review only if previous is completed/failed

### Code Example
```jsx
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

---


# Chapter 8: Purchase Orders

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  8               │
│ 📕 LEXICON (BUGS):    Chapter  8               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §8.1: PO Number Generation - Race Condition Protection

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #8.1

### Quick Summary
✅

### Code Example
```jsx
def generate_purchase_order_number
  ActiveRecord::Base.transaction do
    ActiveRecord::Base.connection.execute('SELECT pg_advisory_xact_lock(123456789)')

    last_po = PurchaseOrder.order(:purchase_order_number).last
    next_number = last_po ? last_po.purchase_order_number.gsub(/\D/, '').to_i + 1 : 1
    self.purchase_order_number = format('PO-%06d', next_number)
  end
end
```

---

## §8.2: Status State Machine

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #8.2

### Quick Summary
✅

### Code Example
```jsx
draft → pending → approved → sent → received → invoiced → paid
  ↘                                                         ↗
   cancelled (can cancel any non-paid status)

# ---

def can_edit?         # Only draft/pending
def can_approve?      # Only pending
def can_cancel?       # Any except paid/cancelled
```

---

## §8.3: Payment Status Calculation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #8.3

### Quick Summary
✅

### Code Example
```jsx
def determine_payment_status(invoice_amount)
  return :manual_review if total.zero? || invoice_amount > total + 1
  return :pending if invoice_amount.zero?

  percentage = (invoice_amount / total) * 100
  return :complete if percentage >= 95 && percentage <= 105
  return :part_payment
end
```

---

## §8.5: Line Items - Totals Calculation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #8.5

### Quick Summary
✅

### Code Example
```jsx
before_save :calculate_totals

def calculate_totals
  self.sub_total = line_items.sum { |li| li.quantity * li.unit_price }
  self.tax = sub_total * 0.10  # 10% GST
  self.total = sub_total + tax
end
```

---

## §8.6: Schedule Task Linking

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #8.6

### Quick Summary
✅

### Code Example
```jsx
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

## §8.7: Price Drift Monitoring

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #8.7

### Quick Summary
✅

### Code Example
```jsx
def price_drift
  return 0 if pricebook_item.nil?
  ((unit_price - pricebook_item.price) / pricebook_item.price) * 100
end
```

---


# Chapter 9: Gantt & Schedule Master

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter  9               │
│ 📕 LEXICON (BUGS):    Chapter  9               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §9.1: Predecessor ID Conversion

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #9.1

### Quick Summary
✅

### Code Example
```jsx
# Backend: Finding dependents
predecessor_id = predecessor_task.sequence_order + 1  # 0-based → 1-based
```

---

## §9.11: Debounced Render Pattern

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #9.11

### Quick Summary
✅

### Code Example
```jsx
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

## §9.2: isLoadingData Lock Timing

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #9.2

### Quick Summary
✅

### Code Example
```jsx
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

---

## §9.3: Company Settings - Working Days & Timezone

🧩 Component | 🔴 Advanced

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #9.3

### Quick Summary
✅

### Code Example
```jsx
def working_day?(date)
  # CRITICAL: Use company timezone, not server timezone (UTC)
  timezone = @company_settings.timezone || 'UTC'
  date_in_company_tz = date.in_time_zone(timezone)

  working_days = @company_settings.working_days || default_config
  day_name = date_in_company_tz.strftime('%A').downcase
  working_days[day_name] == true
end

# ---

# ❌ WRONG - uses server timezone
reference_date = Date.today  # Could be Saturday in UTC, Sunday in AU
reference_date = Date.current  # Still uses server timezone!

# ✅ CORRECT - uses company timezone
reference_date = CompanySetting.today  # Preferred method
# OR
timezone = CompanySetting.instance.timezone || 'UTC'
reference_date = Time.now.in_time_zone(timezone).to_date

# ---

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

## §9.5: Task Heights Configuration

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #9.5

### Quick Summary
✅

### Code Example
```jsx
gantt.config.row_height = 40
gantt.config.task_height = 40  // MUST match row_height
gantt.config.bar_height = 40   // MUST also match
```

---

## §9.7: API Pattern - Single Update + Cascade Response

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #9.7

### Quick Summary
✅

### Code Example
```jsx
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

## §9.9: Predecessor Format

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #9.9

### Quick Summary
✅

### Code Example
```jsx
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

---


# Chapter 10: Project Tasks & Checklists

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 10               │
│ 📕 LEXICON (BUGS):    Chapter 10               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §10.1: Task Status Lifecycle & Automatic Date Updates

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.1

### Code Example
```jsx
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

# ---

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

---

## §10.10: Duration Days Validation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.10

### Code Example
```jsx
# app/models/project_task.rb
validates :duration_days, presence: true, numericality: {
  greater_than_or_equal_to: 1,
  only_integer: true
}

# ---

# Planned end date calculation
def planned_end_date
  return nil unless planned_start_date && duration_days

  planned_start_date + (duration_days - 1).days
end

# Example:
# Start: Jan 1, Duration: 1 day → End: Jan 1 (same day)
# Start: Jan 1, Duration: 3 days → End: Jan 3
```

---

## §10.11: Tags System for Flexible Categorization

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.11

### Code Example
```jsx
# db/migrate/..._add_tags_to_project_tasks.rb
add_column :project_tasks, :tags, :jsonb, default: []
add_index :project_tasks, :tags, using: :gin

# ---

# Trade-based tags
tags: ['plumbing', 'electrical', 'carpentry']

# Priority tags
tags: ['urgent', 'client_facing', 'weather_dependent']

# Location tags
tags: ['first_floor', 'exterior', 'garage']

# Custom workflow tags
tags: ['requires_permit', 'council_inspection', 'engineer_signoff']

# ---

# Find tasks with specific tag
ProjectTask.where("tags @> ?", ['urgent'].to_json)

# Find tasks with any of multiple tags
ProjectTask.where("tags ?| array[:tags]", tags: ['plumbing', 'electrical'])

# Find tasks with all of multiple tags
ProjectTask.where("tags @> ?", ['urgent', 'client_facing'].to_json)

# ---

# app/controllers/api/v1/project_tasks_controller.rb
render json: {
  id: task.id,
  name: task.name,
  tags: task.tags || [],  # Always return array, never nil
  # ... other fields
}
```

---

## §10.2: Task Dependencies & Circular Dependency Prevention

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.2

### Code Example
```jsx
# app/models/task_dependency.rb
enum dependency_type: {
  finish_to_start: 0,   # Most common: B starts after A finishes
  start_to_start: 1,    # B starts when A starts
  finish_to_finish: 2,  # B finishes when A finishes
  start_to_finish: 3    # Rare: B finishes when A starts
}

# ---

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

---

## §10.3: Automatic Task Spawning from Templates

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.3

### Code Example
```jsx
# app/models/project_task.rb
enum spawned_type: {
  photo: 1,
  certificate: 2,
  subtask: 3
}

# spawned_type: nil = normal task (not spawned)

# ---

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

# ---

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

---

## §10.4: Supervisor Checklist Template-to-Instance Flow

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.4

### Code Example
```jsx
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

# ---

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

# ---

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

---

## §10.5: Response Type Validation & Photo Upload

🧩 Component | 🟢 Beginner

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.5

### Code Example
```jsx
# Valid response types:
# - checkbox: Simple completion toggle
# - photo: Requires photo upload
# - note: Requires text response
# - photo_and_note: Requires both photo AND note

# ---

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

# ---

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

---

## §10.6: Auto-Complete Predecessors Feature

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.6

### Code Example
```jsx
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

# ---

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

---

## §10.7: Materials Status Calculation

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.7

### Code Example
```jsx
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

# ---

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

# ---

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

---

## §10.8: Sequence Order for Task Display

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.8

### Code Example
```jsx
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

# ---

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

# ---

# db/migrate/..._add_sequence_order_to_project_tasks.rb
add_column :project_tasks, :sequence_order, :decimal, precision: 10, scale: 2
add_index :project_tasks, [:project_id, :sequence_order]
```

---

## §10.9: Task Update Audit Trail

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #10.9

### Quick Summary
Task Update Audit Trail

### Code Example
```jsx
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

---


# Chapter 11: Weather & Public Holidays

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 11               │
│ 📕 LEXICON (BUGS):    Chapter 11               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §11.1: Unique Holidays Per Region

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #11.1

### Quick Summary
- Validate uniqueness: `validates :date, uniqueness: { scope: :region }` - Use region codes: QLD, NSW, VIC, SA, WA, TAS, NT, NZ - Store date in UTC (no time component)

### Code Example
```jsx
# app/models/public_holiday.rb
validates :name, presence: true
validates :date, presence: true, uniqueness: { scope: :region }
validates :region, presence: true

# ---

UNIQUE(date, region)
```

---

## §11.2: Rain Log - One Entry Per Construction Per Day

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #11.2

### Quick Summary
- Enforce uniqueness at database level: `UNIQUE(construction_id, date)` - Check for existing log before auto-creation - Use `find_or_initialize_by` pattern for updates

### Code Example
```jsx
# app/models/rain_log.rb
validate :date_cannot_be_in_future

def date_cannot_be_in_future
  errors.add(:date, "can't be in the future") if date.present? && date > Date.current
end

# app/jobs/check_yesterday_rain_job.rb
existing_log = construction.rain_logs.find_by(date: yesterday)
next if existing_log  # Skip if already logged
```

---

## §11.3: Rainfall Severity Auto-Calculation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #11.3

### Quick Summary
- Light: `< 5mm` - Moderate: `5mm to 15mm` - Heavy: `> 15mm`

### Code Example
```jsx
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

---

## §11.4: Manual Rain Logs Require Notes

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #11.4

### Quick Summary
- Validate presence: `validates :notes, presence: true, if: :source_manual?` - Display notes in UI for audit trail - Include who created the entry (`created_by_user_id`)

### Code Example
```jsx
# app/models/rain_log.rb
belongs_to :created_by_user, class_name: 'User', optional: true

enum :source, {
  automatic: 'automatic',
  manual: 'manual'
}, prefix: true

validates :notes, presence: true, if: :source_manual?
```

---

## §11.5: Weather API - Historical Data Only

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #11.5

### Quick Summary
- Validate date is not in future before API call - Use `Date.yesterday` for automatic checks - Raise `ArgumentError` if future date provided

### Code Example
```jsx
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

---

## §11.6: Location Extraction Priority

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #11.6

### Quick Summary
1. `construction.location` (if present) 2. `construction.project.site_address` (extract suburb) 3. `construction.title` (parse after dash)

### Code Example
```jsx
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

---

## §11.7: Gantt Integration - Working Day Calculation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #11.7

### Quick Summary
- Load company `working_days` configuration - Load `PublicHoliday` dates for relevant region (3-year range) - Skip task to next working day if lands on weekend OR holiday - Respect lock hierarchy (loc

### Code Example
```jsx
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

---

## §11.8: Weather API Response Storage

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #11.8

### Quick Summary
- Store complete API JSON response - Include location confirmation data - Preserve all weather metrics (temp, condition, etc.) - Use for future analysis and verification

### Code Example
```jsx
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

---


# Chapter 12: OneDrive Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 12               │
│ 📕 LEXICON (BUGS):    Chapter 12               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §12.2: Folder Template System

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #12.2

### Quick Summary
✅

### Code Example
```jsx
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


# Chapter 13: Outlook/Email Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 13               │
│ 📕 LEXICON (BUGS):    Chapter 13               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §13.1: Organization-Wide Singleton OAuth Credential

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #13.1

### Code Example
```jsx
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

# ---

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

---

## §13.2: Four-Strategy Email-to-Job Matching

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #13.2

### Code Example
```jsx
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

# ---

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

---

## §13.3: Microsoft Graph API Usage Pattern

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #13.3

### Code Example
```jsx
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

# ---

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

---

## §13.4: Email Threading Support via Message-ID

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #13.4

### Code Example
```jsx
# db/schema.rb
create_table :emails do |t|
  t.string :message_id, null: false, index: { unique: true }
  t.string :in_reply_to      # Message-ID of parent email
  t.text :references         # Space-separated list of ancestor message IDs

  # ... other fields
end

# ---

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

# ---

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

---

## §13.5: Webhook Support for Email Services

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #13.5

### Code Example
```jsx
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

# ---

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

---

## §13.6: Inbound-Only Architecture (Current Limitation)

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #13.6

### Quick Summary
Inbound-Only Architecture (Current Limitation)

### Code Example
```jsx
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

---


# Chapter 14: Chat & Communications

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 14               │
│ 📕 LEXICON (BUGS):    Chapter 14               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §14.1: ChatMessage Multi-Channel Architecture

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.1

### Code Example
```jsx
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

# ---

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

---

## §14.10: Authentication Placeholder - CRITICAL TODO

🔧 Util | 🔴 Advanced

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.10

### Code Example
```jsx
# app/controllers/api/v1/chat_messages_controller.rb (Line 110)
def set_current_user
  @current_user = User.first # TODO: Replace with actual current_user logic
end

# ---

# app/controllers/api/v1/chat_messages_controller.rb
before_action :authenticate_user!

def set_current_user
  @current_user = current_user # From Devise or JWT auth
end
```

---

## §14.2: Message-to-Job Linking

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.2

### Code Example
```jsx
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

# ---

# db/migrate/20251111021538_add_construction_to_chat_messages.rb
add_reference :chat_messages, :construction, foreign_key: true
add_column :chat_messages, :saved_to_job, :boolean, default: false
add_index :chat_messages, [:construction_id, :channel, :created_at]

# ---

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

---

## §14.3: SMS Twilio Integration

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.3

### Code Example
```jsx
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

# ---

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

# ---

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

---

## §14.4: SMS Status Tracking

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.4

### Code Example
```jsx
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

# ---

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

# ---

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

---

## §14.5: Unread Message Tracking

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.5

### Code Example
```jsx
# app/models/user.rb
class User < ApplicationRecord
  has_many :chat_messages

  # Timestamp when user last viewed chat
  # Used to calculate unread count
  # Migration: add_column :users, :last_chat_read_at, :datetime
end

# ---

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

# ---

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

---

## §14.6: Message Polling (No WebSockets)

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.6

### Code Example
```jsx
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

# ---

// frontend/src/components/communications/SmsTab.jsx
useEffect(() => {
  loadMessages();

  const interval = setInterval(() => {
    loadMessages();
  }, 3000);

  return () => clearInterval(interval);
}, [contactId, jobId]);
```

---

## §14.7: Contact-SMS Fuzzy Matching

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.7

### Code Example
```jsx
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

---

## §14.8: Message Deletion Authorization

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.8

### Code Example
```jsx
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

---

## §14.9: Email Ingestion Storage

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #14.9

### Code Example
```jsx
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

# ---

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

---


# Chapter 15: Xero Accounting Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 15               │
│ 📕 LEXICON (BUGS):    Chapter 15               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §15.1: OAuth Token Management

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #15.1

### Quick Summary
✅

### Code Example
```jsx
class XeroCredential < ApplicationRecord
  encrypts :access_token
  encrypts :refresh_token

  def self.current
    order(created_at: :desc).first
  end
end
```

---

## §15.2: Two-Way Contact Sync

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #15.2

### Quick Summary
✅

### Code Example
```jsx
add_column :contacts, :xero_id, :string
add_column :contacts, :xero_contact_id, :string  # UUID
add_column :contacts, :sync_with_xero, :boolean, default: true
add_column :contacts, :last_synced_at, :datetime
add_column :contacts, :xero_sync_error, :text
```

---

## §15.4: Webhook Signature Verification

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #15.4

### Quick Summary
✅

### Code Example
```jsx
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

## §15.7: Background Job Processing

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #15.7

### Quick Summary
✅

### Code Example
```jsx
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

---

## §15.8: Payment Sync Workflow

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #15.8

### Quick Summary
✅

### Code Example
```jsx
add_column :payments, :xero_payment_id, :string
add_column :payments, :synced_to_xero_at, :datetime
```

---


# Chapter 16: Payments & Financials

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 16               │
│ 📕 LEXICON (BUGS):    Chapter 16               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §16.1: Payment Model Structure

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.1

### Code Example
```jsx
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

# ---

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

---

## §16.10: Cascade Delete Payments

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.10

### Code Example
```jsx
# app/models/purchase_order.rb
has_many :payments, dependent: :destroy

# Migration
add_foreign_key :payments, :purchase_orders, on_delete: :cascade
```

---

## §16.2: Automatic Payment Status Updates

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.2

### Code Example
```jsx
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

# ---

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

---

## §16.3: Xero Invoice Fuzzy Matching

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.3

### Code Example
```jsx
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

# ---

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

---

## §16.4: Xero Payment Sync

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.4

### Code Example
```jsx
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

---

## §16.5: Payment Method Enum

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.5

### Code Example
```jsx
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

# ---

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

---

## §16.6: Financial Precision with DECIMAL(15,2)

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.6

### Code Example
```jsx
# Payments table
t.decimal :amount, precision: 15, scale: 2, null: false

# Purchase orders table
t.decimal :total, precision: 15, scale: 2, default: 0.0
t.decimal :invoiced_amount, precision: 15, scale: 2, default: 0.0
t.decimal :xero_amount_paid, precision: 15, scale: 2, default: 0.0
t.decimal :xero_still_to_be_paid, precision: 15, scale: 2, default: 0.0
t.decimal :amount_still_to_be_invoiced, precision: 15, scale: 2, default: 0.0
t.decimal :budget, precision: 15, scale: 2

# ---

# app/models/payment.rb
validates :amount, numericality: {
  greater_than: 0,
  less_than_or_equal_to: 999_999_999_999.99
}

# app/models/purchase_order.rb
validates :total, :invoiced_amount, :xero_amount_paid,
  numericality: { greater_than_or_equal_to: 0 }
```

---

## §16.7: Payment Status Badge Display

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.7

### Code Example
```jsx
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

---

## §16.8: Payment Summary Calculation

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.8

### Code Example
```jsx
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

# ---

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

---

## §16.9: Budget Variance Tracking

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #16.9

### Code Example
```jsx
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

# ---

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

---


# Chapter 17: Workflows & Automation

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 17               │
│ 📕 LEXICON (BUGS):    Chapter 17               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §17.1: Solid Queue Background Job System

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #17.1

### Code Example
```jsx
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

# ---

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

---

## §17.2: Workflow State Machine

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #17.2

### Code Example
```jsx
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

# ---

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

---

## §17.3: Idempotent Background Jobs

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #17.3

### Code Example
```jsx
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

# ---

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

---

## §17.4: Price Update Automation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #17.4

### Code Example
```jsx
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

# ---

# config/solid_queue.yml
recurring_tasks:
  - key: apply_price_updates
    class_name: ApplyPriceUpdatesJob
    schedule: every day at midnight
```

---

## §17.5: Model Callback Automation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #17.5

### Code Example
```jsx
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

# ---

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

# ---

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

---

## §17.6: Job Status Tracking

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #17.6

### Code Example
```jsx
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

# ---

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

---

## §17.7: Batch Processing with Rate Limiting

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #17.7

### Code Example
```jsx
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

---

## §17.8: Workflow Metadata Storage

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #17.8

### Code Example
```jsx
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

# ---

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

---


# Chapter 18: Custom Tables & Formulas

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 18               │
│ 📕 LEXICON (BUGS):    Chapter 18               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §18.1: Dynamic Table Creation Pattern

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #18.1

### Code Example
```jsx
# app/models/table.rb
before_validation :set_database_table_name, on: :create

def set_database_table_name
  return if database_table_name.present?

  safe_name = name.parameterize.underscore
  unique_suffix = SecureRandom.hex(3)
  self.database_table_name = "user_#{safe_name}_#{unique_suffix}"
end

# ---

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

---

## §18.2: Column Type System

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #18.2

### Code Example
```jsx
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

# ---

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

---

## §18.3: Formula Evaluation System

⚡ Optimization | 🟢 Beginner

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #18.3

### Code Example
```jsx
# Valid formula examples:
"{quantity} * {unit_price}"                    # Simple calculation
"({cost} + {tax}) * {quantity}"                # Grouping
"{amount} / {units}"                           # Division with decimal result
"{supplier.tax_rate} * {amount}"               # Cross-table lookup
"IF({quantity} > 100, {bulk_price}, {unit_price})" # Conditional (Dentaku function)

# ---

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

# ---

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

---

## §18.4: Lookup Column Pattern

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #18.4

### Code Example
```jsx
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

# ---

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

# ---

{
  "supplier": {
    "id": 5,
    "display": "ABC Building Supplies"
  }
}
```

---

## §18.5: Record CRUD with Formula Calculation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #18.5

### Code Example
```jsx
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

# ---

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

---

## §18.6: Table Deletion Safety

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #18.6

### Code Example
```jsx
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

# ---

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

---

## §18.7: Column Validation Rules

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #18.7

### Code Example
```jsx
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

# ---

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

---

## §18.8: Foreign Key Constraints

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #18.8

### Code Example
```jsx
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

---


# Chapter 19: UI/UX Standards & Patterns

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 19               │
│ 📕 LEXICON (BUGS):    Chapter 19               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §19.1: Table Component Selection Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.1

### Quick Summary
Decision tree for choosing between DataTable.jsx (read-only, basic sorting) vs Full table pattern (editing, bulk actions, advanced features)

---

## §19.10: Column Visibility Toggle Pattern

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** RULE #19.10: Column Visibility Standards

### Quick Summary
Implement column visibility toggle dropdown

---

## §19.11: Search & Filter UI Standards Pattern

🧩 Component | 🟢 Beginner

**📖 Related Bible Rules:** RULE #19.11: Search & Filter UI Standards

### Quick Summary
Implement search boxes with clear buttons

---

## §19.11A: Standardized Toolbar Layout Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.11A

### Quick Summary
Standard layout for table toolbars: Global search (left), action buttons in specific order (right)

---

## §19.13: State Persistence Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.13

### Quick Summary
How to persist table state (filters, column order, visibility) to localStorage

---

## §19.15: Dark Mode Implementation

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.15

### Quick Summary
Pattern for implementing dark mode support in table components

---

## §19.2: Table Header Implementation

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.2

### Quick Summary
Required header elements: sortable columns, visibility controls, sticky headers, dark mode

---

## §19.20: Search Functionality Implementation Pattern

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** RULE #19.20: Search Functionality Standards

### Quick Summary
Implement performant search with debouncing

---

## §19.21: Form Standards Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.21

### Quick Summary
Standard patterns for form layout, validation, and submission

---

## §19.24: Loading State Standards Pattern

🧩 Component | 🟢 Beginner

**📖 Related Bible Rules:** RULE #19.24: Loading State Standards

### Quick Summary
Implement loading spinners and skeleton screens

---

## §19.25: Button & Action Standards Pattern

🧩 Component | 🟢 Beginner

**📖 Related Bible Rules:** RULE #19.25: Button & Action Standards

### Quick Summary
Implement consistent button styles and states

---

## §19.26: Status Badge Standards Pattern

🧩 Component | 🟢 Beginner

**📖 Related Bible Rules:** RULE #19.26: Status Badge Standards

### Quick Summary
Implement status badges with consistent colors

---

## §19.28: Navigation Standards Pattern

🧩 Component | 🟢 Beginner

**📖 Related Bible Rules:** RULE #19.28: Navigation Standards

### Quick Summary
Implement tab navigation and breadcrumbs

---

## §19.3: Column Filter Implementation

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.3

### Quick Summary
How to implement inline column filters in table headers

---

## §19.31: Data-Dense Table Layout

🧩 Component

### Description
## §19.31: Data-Dense Table Layout Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.31

### Quick Start

```jsx
<table className="w-full">
  <thead>
    <tr>
      <th className="px-4 py-2.5 text-xs">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="px-4 py-2.5 text-sm truncate overflow-hidden whitespace-nowrap" title="Full content">
        Truncated content
      </td>
    </tr>
  </tbody>
</table>
```

### Full Implementation

```jsx
const DataDenseTable = ({ rows }) => {
  const [expandedRows, setExpandedRows] = useState(new Set())

  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
        <tr className="border-b border-gray-100 dark:border-gray-800">
          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
            Name
          </th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
            Description
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={row.id}
            className={`border-b cursor-pointer ${
              index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800/30'
            }`}
            onClick={() => toggleRow(row.id)}
          >
            <td
              className="px-4 py-2.5 text-sm truncate overflow-hidden whitespace-nowrap"
              title={row.name}
            >
              {row.name}
            </td>
            <td
              className="px-4 py-2.5 text-sm truncate overflow-hidden whitespace-nowrap"
              title={row.description}
            >
              {row.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Key Measurements

| Element | Padding | Font Size |
|---------|---------|-----------|
| Header  | `py-2.5 px-4` | `text-xs` |
| Cell    | `py-2.5 px-4` | `text-sm` |

### Truncation Pattern

```jsx
<td
  className="truncate overflow-hidden whitespace-nowrap"
  title={fullContent} // Hover tooltip
>
  {fullContent}
</td>
```


---

## §19.32: Zebra Striping (Alternating Row Colors)

🧩 Component

### Description
## §19.32: Zebra Striping Implementation

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.32

### Quick Start

```jsx
<tbody>
  {rows.map((row, index) => (
    <tr
      key={row.id}
      className={`
        border-b hover:bg-blue-50/40
        ${index % 2 === 0
          ? 'bg-white dark:bg-gray-900'
          : 'bg-gray-100 dark:bg-gray-800/30'
        }
      `}
    >
      <td>{row.content}</td>
    </tr>
  ))}
</tbody>
```

### Full Implementation with State

```jsx
const ZebraTable = ({ data }) => {
  const [sortedData, setSortedData] = useState(data)

  // Zebra pattern is maintained even after filtering/sorting
  return (
    <tbody>
      {sortedData.map((row, index) => (
        <tr
          key={row.id}
          className={`
            group
            border-b border-gray-100 dark:border-gray-800/50
            hover:bg-blue-50/40 dark:hover:bg-gray-800/30
            cursor-pointer
            transition-all duration-150
            ${index % 2 === 0
              ? 'bg-white dark:bg-gray-900'
              : 'bg-gray-100 dark:bg-gray-800/30'
            }
          `}
        >
          <td className="px-4 py-2.5">{row.content}</td>
        </tr>
      ))}
    </tbody>
  )
}
```

### Color Palette

| Row Type | Light Mode | Dark Mode |
|----------|------------|-----------|
| Even     | `bg-white` | `bg-gray-900` |
| Odd      | `bg-gray-100` | `bg-gray-800/30` |
| Hover    | `bg-blue-50/40` | `bg-gray-800/30` |

### Common Mistakes

❌ **Too subtle:**
```jsx
// BAD: Not enough contrast
bg-gray-50/50 // Too light
```

✅ **Good contrast:**
```jsx
// GOOD: Clear visual separation
bg-gray-100 // Solid color, good contrast
```

### When to Use

- ✅ Wide tables (> 5 columns)
- ✅ Tables with many rows (> 10 rows)
- ✅ Tables requiring horizontal tracking
- ❌ Small tables (< 5 columns)
- ❌ Short lists (< 5 rows)


---

## §19.33: Sticky Horizontal Scrollbar Component Pattern

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** **Related Bible Rules:**
- RULE #19.1: Table Type Selection (Advanced vs DataTable)
- RULE #19.2: Sticky Gradient Headers
- RULE #19.10: Column Visibility Toggle

**Related Lexicon Entries:**
- §19.12: Sticky Horizontal Scrollbar Implementation Bugs

**Example Implementation:**
- frontend/src/components/documentation/BibleTableView.jsx
- frontend/src/components/documentation/LexiconTableView.jsx


### Quick Summary
Learn how to implement a custom sticky horizontal scrollbar that stays visible at the bottom of wide tables, with bidirectional scroll synchronization.

### Code Example
```jsx
## Step 1: Add State and Refs

```javascript
import { useState, useRef, useEffect } from 'react'

export default function BibleTableView({ content }) {
  // Refs for containers
  const scrollContainerRef = useRef(null)
  const stickyScrollbarRef = useRef(null)

  // Scroll loop prevention flags
  const isScrollingStickyRef = useRef(false)
  const isScrollingMainRef = useRef(false)

  // Track table width
  const [tableScrollWidth, setTableScrollWidth] = useState(0)

  // ... other state
}
```

## Step 2: Implement Scroll Handlers

```javascript
// Main container scroll handler
const handleScroll = (e) => {
  // Prevent loop: If sticky scrollbar triggered this, return early
  if (isScrollingStickyRef.current) {
    isScrollingStickyRef.current = false
    return
  }

  // Mark that main container is scrolling
  isScrollingMainRef.current = true

  const container = e.target
  const { scrollLeft } = container

  // Sync horizontal sticky scrollbar
  if (stickyScrollbarRef.current) {
    stickyScrollbarRef.current.scrollLeft = scrollLeft
  }

  // Clear flag after sync
  setTimeout(() => { isScrollingMainRef.current = false }, 0)
}

// Sticky scrollbar scroll handler
const handleStickyScroll = (e) => {
  // Prevent loop: If main container triggered this, return early
  if (isScrollingMainRef.current) {
    isScrollingMainRef.current = false
    return
  }

  // Mark that sticky scrollbar is scrolling
  isScrollingStickyRef.current = true

  const scrollLeft = e.target.scrollLeft

  // Sync main container
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollLeft = scrollLeft
  }

  // Clear flag after sync
  setTimeout(() => { isScrollingStickyRef.current = false }, 0)
}
```

## Step 3: Track Table Width with ResizeObserver

```javascript
useEffect(() => {
  const container = scrollContainerRef.current
  if (!container) return

  const updateScrollbar = () => {
    // IMPORTANT: Measure actual table element, not container
    const table = container.querySelector('table')
    const actualTableWidth = table ? table.offsetWidth : container.scrollWidth

    setTableScrollWidth(actualTableWidth)
  }

  updateScrollbar()

  // Update on resize (column resize, window resize, etc.)
  const resizeObserver = new ResizeObserver(updateScrollbar)
  resizeObserver.observe(container)

  return () => resizeObserver.disconnect()
}, [filteredData, columnWidths])
```

## Step 4: Ensure Horizontal Overflow

```javascript
// Define columns with sufficient width to force horizontal scroll
const COLUMNS = [
  { key: 'select', width: 50 },
  { key: 'rule', width: 150 },
  { key: 'chapter', width: 400 },
  { key: 'title', width: 600 },
  { key: 'content', width: 1200 }  // Wide column
]
// Total: 2400px - forces overflow on most screens

// Apply to table element
<table
  style={{
    minWidth: `${Object.values(columnWidths).reduce((sum, w) => sum + w, 0)}px`,
    width: '100%'
  }}
>
```

## Step 5: Hide Native Horizontal Scrollbar

```javascript
<style>{`
  /* Hide horizontal scrollbar on main container */
  .bible-table-scroll::-webkit-scrollbar:horizontal {
    display: none !important;
    height: 0 !important;
  }
`}</style>

<div
  ref={scrollContainerRef}
  onScroll={handleScroll}
  className="bible-table-scroll flex-1 overflow-y-scroll overflow-x-scroll"
  style={{
    scrollbarWidth: 'none',        // Firefox
    msOverflowStyle: 'none'         // IE/Edge
  }}
>
  <table>...</table>
</div>
```

## Step 6: Render Sticky Scrollbar

```javascript
{/* Sticky Horizontal Scrollbar - Always visible at bottom */}
<div
  ref={stickyScrollbarRef}
  onScroll={handleStickyScroll}
  className="sticky-horizontal-scroll"
  style={{
    position: 'sticky',              // Stick to viewport
    bottom: 0,                       // Bottom of viewport
    zIndex: 10,                      // Above table content
    height: '20px',
    overflowX: 'scroll',
    overflowY: 'hidden',
    scrollbarWidth: 'auto',
    scrollbarColor: '#6B7280 #E5E7EB',
    backgroundColor: '#E5E7EB'
  }}
>
  {/* Inner div creates scrollable width */}
  <div style={{
    width: `${tableScrollWidth}px`,
    height: '100%',
    backgroundColor: 'transparent'
  }} />
</div>
```

## Complete Flex Layout Structure

```javascript
<div className="flex-1 min-h-0 flex flex-col px-4">
  {/* Main scrollable container */}
  <div
    ref={scrollContainerRef}
    onScroll={handleScroll}
    className="bible-table-scroll flex-1 overflow-y-scroll overflow-x-scroll"
    style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}
  >
    <table
      style={{
        minWidth: `${Object.values(columnWidths).reduce((sum, w) => sum + w, 0)}px`,
        width: '100%'
      }}
    >
      {/* Table content */}
    </table>
  </div>

  {/* Sticky scrollbar - outside main container */}
  <div
    ref={stickyScrollbarRef}
    onScroll={handleStickyScroll}
    className="sticky-horizontal-scroll border-t-2"
    style={{
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
      height: '20px',
      overflowX: 'scroll',
      overflowY: 'hidden'
    }}
  >
    <div style={{ width: `${tableScrollWidth}px`, height: '100%' }} />
  </div>
</div>
```

```

### ⚠️ Common Mistakes
## ❌ Common Mistakes

### 1. Scroll Loop (Infinite Loop)

**Wrong:**
```javascript
const handleScroll = (e) => {
  stickyScrollbarRef.current.scrollLeft = e.target.scrollLeft
}

const handleStickyScroll = (e) => {
  scrollContainerRef.current.scrollLeft = e.target.scrollLeft
}
```

**Why it fails:** Each handler triggers the other, creating infinite loop.

**Correct:**
```javascript
const isScrollingStickyRef = useRef(false)
const isScrollingMainRef = useRef(false)

const handleScroll = (e) => {
  if (isScrollingStickyRef.current) {
    isScrollingStickyRef.current = false
    return  // Prevent loop
  }
  isScrollingMainRef.current = true
  // ... sync code
}
```

### 2. Measuring Container Instead of Table

**Wrong:**
```javascript
const { scrollWidth } = container
setTableScrollWidth(scrollWidth)
```

**Why it fails:** Container scrollWidth may not match actual table width when table has minWidth.

**Correct:**
```javascript
const table = container.querySelector('table')
const actualTableWidth = table ? table.offsetWidth : scrollWidth
setTableScrollWidth(actualTableWidth)
```

### 3. Using overflow-x-hidden

**Wrong:**
```javascript
<div className="overflow-x-hidden">
```

**Why it fails:** Prevents horizontal scrolling entirely.

**Correct:**
```javascript
<div
  className="overflow-x-scroll"
  style={{ scrollbarWidth: 'none' }}  // Hide scrollbar visually
>
```

### 4. Forgetting Bidirectional Sync

**Wrong:**
```javascript
// Only sync one direction
const handleScroll = (e) => {
  stickyScrollbarRef.current.scrollLeft = e.target.scrollLeft
}
// Missing handleStickyScroll!
```

**Why it fails:** User can't drag sticky scrollbar to scroll table.

**Correct:** Implement both handleScroll AND handleStickyScroll.


### 🧪 Testing Strategy
## ✅ Testing Strategy

### Manual Testing Checklist

- [ ] Drag sticky scrollbar → table scrolls horizontally
- [ ] Scroll table with mouse/trackpad → sticky scrollbar moves
- [ ] Resize column → sticky scrollbar width updates
- [ ] Only ONE horizontal scrollbar visible (custom, not native)
- [ ] Scrollbar stays visible when scrolling vertically
- [ ] Test on wide monitor (2000px+) - ensure overflow still works
- [ ] Test on narrow monitor (1366px) - ensure scrollbar appears
- [ ] Dark mode - scrollbar styling correct
- [ ] No infinite scroll loops (check browser console)

### Automated Testing

```javascript
describe('Sticky Horizontal Scrollbar', () => {
  it('syncs main container scroll to sticky scrollbar', () => {
    const { container } = render(<TableView />)
    const mainScroll = container.querySelector('.bible-table-scroll')
    const stickyScroll = container.querySelector('.sticky-horizontal-scroll')

    fireEvent.scroll(mainScroll, { target: { scrollLeft: 100 } })

    expect(stickyScroll.scrollLeft).toBe(100)
  })

  it('syncs sticky scrollbar scroll to main container', () => {
    const { container } = render(<TableView />)
    const mainScroll = container.querySelector('.bible-table-scroll')
    const stickyScroll = container.querySelector('.sticky-horizontal-scroll')

    fireEvent.scroll(stickyScroll, { target: { scrollLeft: 200 } })

    expect(mainScroll.scrollLeft).toBe(200)
  })
})
```


### Description
## 📋 Overview

The **Sticky Horizontal Scrollbar Pattern** provides a custom scrollbar that remains visible at the bottom of the viewport when scrolling through wide tables. This pattern is essential for tables where:
- Content extends beyond viewport width
- Users need easy horizontal navigation
- Native browser scrollbars may scroll out of view

## 🎯 Use Cases

- Wide data tables (Bible, Lexicon, Teacher table views)
- Gantt charts with horizontal timeline
- Spreadsheet-like interfaces
- Any horizontally scrolling content with vertical scroll

## 📖 Bible Reference

**RULE #19.12**: Sticky Horizontal Scrollbar Pattern
See: TRAPID_BIBLE.md Chapter 19, RULE #19.12

## 🐛 Common Issues

**Bug History**: See TRAPID_LEXICON.md Chapter 19, §19.12
- Scroll loop prevention
- Table width detection
- Native scrollbar conflicts
- Overflow detection on wide monitors


---

## §19.34: Modern Table Header Aesthetics

🧩 Component

### Description
## §19.34: Modern Table Header Implementation

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.34

### Quick Start

```jsx
<thead className="sticky top-0 z-20 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 shadow-sm">
  <tr className="border-b border-gray-100 dark:border-gray-800">
    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 tracking-wider">
      Column Name
    </th>
  </tr>
</thead>
```

### Full Modern Header

```jsx
<thead className="sticky top-0 z-20 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 shadow-sm">
  <tr className="border-b border-gray-100 dark:border-gray-800">
    <th
      className="
        px-4 py-2.5
        text-left text-xs font-medium
        text-gray-600 dark:text-gray-400
        tracking-wider
        hover:bg-blue-50/50 dark:hover:bg-gray-800/30
        hover:text-gray-900 dark:hover:text-gray-100
        transition-all
        cursor-pointer
      "
      onClick={() => handleSort('columnKey')}
    >
      <div className="flex items-center gap-2">
        <span>Column Name</span>
        {sortBy === 'columnKey' && (
          <ChevronUpIcon className={`w-4 h-4 ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
        )}
      </div>
    </th>
  </tr>
</thead>
```

### Glass-Morphism Effect

**Key properties:**
```jsx
backdrop-blur-md          // Blur background content
bg-white/95               // 95% opacity white
dark:bg-gray-900/95       // 95% opacity dark gray
shadow-sm                 // Subtle shadow for depth
```

### Typography Standards

| Property | Value | Purpose |
|----------|-------|---------|
| Font size | `text-xs` | Compact, modern look |
| Font weight | `font-medium` | Not too heavy |
| Text color | `text-gray-600` | Subtle, not harsh |
| Letter spacing | `tracking-wider` | Improves readability |

### Color Palette

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `bg-white/95` | `bg-gray-900/95` |
| Text | `text-gray-600` | `text-gray-400` |
| Border | `border-gray-100` | `border-gray-800` |
| Hover BG | `bg-blue-50/50` | `bg-gray-800/30` |
| Hover Text | `text-gray-900` | `text-gray-100` |

### Sticky Positioning

```jsx
<thead className="sticky top-0 z-20">
  {/* z-20 ensures header stays above table rows */}
</thead>
```

### Common Mistakes

❌ **Heavy font weight:**
```jsx
// BAD: Too heavy
font-bold font-semibold
```

✅ **Medium weight:**
```jsx
// GOOD: Balanced
font-medium
```

❌ **Opaque background:**
```jsx
// BAD: Loses glass-morphism
bg-white
```

✅ **Semi-transparent:**
```jsx
// GOOD: Modern glass effect
bg-white/95
```


---

## §19.35: Table Border Framing

🧩 Component

### Description
## §19.35: Table Border Framing Implementation

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.35

### Quick Start

```jsx
<table className="w-full border-collapse border-l border-r border-gray-200 dark:border-gray-700">
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

### Full Implementation

```jsx
const FramedTable = ({ data }) => {
  return (
    <div className="w-full">
      <table className="w-full border-collapse border-l border-r border-gray-200 dark:border-gray-700">
        <thead className="border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
              Column
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="px-4 py-2.5">{row.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Border Hierarchy

| Element | Border | Color (Light) | Color (Dark) |
|---------|--------|---------------|--------------|
| Table frame | `border-l border-r` | `border-gray-200` | `border-gray-700` |
| Header row | `border-b` | `border-gray-200` | `border-gray-700` |
| Body rows | `border-b` | `border-gray-100` | `border-gray-800` |

### Why Border Framing?

**Visual Container Boundary:**
- Full-width layouts need clear edges
- Tables spanning entire viewport need definition
- Dark mode benefits from explicit boundaries

**Before (no borders):**
```
[Sidebar] | Table content blends with page background
```

**After (with borders):**
```
[Sidebar] | | Table is clearly framed | Page background
```

### Complete Border Pattern

```jsx
<table className="
  w-full
  border-collapse
  border-l border-r                          // Left/Right frame
  border-gray-200 dark:border-gray-700       // Frame color
">
  <thead className="
    border-b                                  // Bottom border
    border-gray-200 dark:border-gray-700      // Header border
  ">
    <tr>
      <th className="border-b border-gray-200 dark:border-gray-700">
        Header
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="
      border-b                                // Row separator
      border-gray-100 dark:border-gray-800    // Lighter for rows
    ">
      <td>Content</td>
    </tr>
  </tbody>
</table>
```

### Common Mistakes

❌ **Apply to container div:**
```jsx
// BAD: Border on wrapper
<div className="border-l border-r">
  <table>...</table>
</div>
```

✅ **Apply to table element:**
```jsx
// GOOD: Border on table
<table className="border-l border-r">
  ...
</table>
```

❌ **Only top/bottom borders:**
```jsx
// BAD: Incomplete framing
<table className="border-t border-b">
```

✅ **Complete frame:**
```jsx
// GOOD: Full container boundary
<table className="border-l border-r">
```


---

## §19.36: Expand/Collapse Row Details

🧩 Component

### Description
## §19.36: Expand/Collapse Row Details Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.36

### Quick Start

```jsx
const [expandedRows, setExpandedRows] = useState(new Set())

const toggleRow = (id) => {
  setExpandedRows(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
}

return (
  <tbody>
    {rows.map(row => (
      <React.Fragment key={row.id}>
        <tr onClick={() => toggleRow(row.id)}>
          <td>{expandedRows.has(row.id) ? '▼' : '▶'}</td>
          <td>{row.summary}</td>
        </tr>
        {expandedRows.has(row.id) && (
          <tr>
            <td colSpan={columns.length}>
              <pre>{row.details}</pre>
            </td>
          </tr>
        )}
      </React.Fragment>
    ))}
  </tbody>
)
```

### Full Implementation

```jsx
const ExpandableTable = ({ data, columns }) => {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [visibleColumns, setVisibleColumns] = useState(['col1', 'col2', 'col3'])

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="w-12">Expand</th>
          {visibleColumns.map(col => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <React.Fragment key={row.id}>
            {/* Main row - clickable */}
            <tr
              onClick={() => toggleRow(row.id)}
              className={`
                cursor-pointer
                hover:bg-blue-50/40 dark:hover:bg-gray-800/30
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
              `}
            >
              <td className="text-center">
                <span className="text-gray-600">
                  {expandedRows.has(row.id) ? '▼' : '▶'}
                </span>
              </td>
              {visibleColumns.map(col => (
                <td key={col} className="truncate overflow-hidden whitespace-nowrap">
                  {row[col]}
                </td>
              ))}
            </tr>

            {/* Expanded details row */}
            {expandedRows.has(row.id) && (
              <tr className="bg-blue-50/20 dark:bg-gray-800/10">
                <td colSpan={visibleColumns.length + 1} className="px-6 py-6">
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    {/* Metadata */}
                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>ID: {row.id}</span>
                      <span>•</span>
                      <span>Created: {row.created_at}</span>
                    </div>

                    {/* Detailed content */}
                    <pre className="
                      whitespace-pre-wrap text-xs
                      bg-white dark:bg-gray-900
                      p-4 rounded-lg
                      border border-gray-100 dark:border-gray-700
                      overflow-auto shadow-sm
                    ">
                      {row.detailedContent}
                    </pre>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}
```

### Set vs Array for Expansion State

**✅ Use Set (Fast O(1) lookup):**
```jsx
const [expandedRows, setExpandedRows] = useState(new Set())

// Check if expanded: O(1)
expandedRows.has(row.id)

// Toggle: O(1)
const next = new Set(prev)
next.has(id) ? next.delete(id) : next.add(id)
```

**❌ Use Array (Slow O(n) lookup):**
```jsx
const [expandedRows, setExpandedRows] = useState([])

// Check if expanded: O(n) - SLOW!
expandedRows.includes(row.id)

// Toggle: O(n) - SLOW!
expandedRows.includes(id)
  ? expandedRows.filter(i => i !== id)
  : [...expandedRows, id]
```

### Click Event Handling

**✅ Entire row clickable:**
```jsx
<tr onClick={() => toggleRow(row.id)}>
  <td>{expandIcon}</td>
  <td onClick={(e) => e.stopPropagation()}>
    <button>Action</button> {/* Stops propagation */}
  </td>
</tr>
```

**❌ Only icon clickable:**
```jsx
// BAD: Small touch target, bad UX
<tr>
  <td onClick={() => toggleRow(row.id)}>{expandIcon}</td>
  <td>{content}</td>
</tr>
```

### colSpan for Full-Width Details

**✅ Correct (spans all columns):**
```jsx
<tr>
  <td colSpan={visibleColumns.length + 1}> {/* +1 for expand column */}
    <pre>{details}</pre>
  </td>
</tr>
```

**❌ Missing colSpan:**
```jsx
// BAD: Content constrained to first column
<tr>
  <td>
    <pre>{details}</pre>
  </td>
</tr>
```

### Visual Separation

```jsx
<tr className="bg-blue-50/20 dark:bg-gray-800/10 border-b border-gray-50">
  <td colSpan={columns.length}>
    {/* Different background clearly shows expanded state */}
  </td>
</tr>
```

### Icons

| State | Icon | Unicode |
|-------|------|---------|
| Collapsed | ▶ | `\u25B6` |
| Expanded | ▼ | `\u25BC` |

Or use Heroicons:
```jsx
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

{expandedRows.has(row.id)
  ? <ChevronDownIcon className="w-4 h-4" />
  : <ChevronRightIcon className="w-4 h-4" />
}
```


---

## §19.4: Column Resizing Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.4

### Quick Summary
Pattern for implementing draggable column resize handles

---

## §19.5: Column Reordering Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.5

### Quick Summary
Pattern for implementing drag-and-drop column reordering

---

## §19.5A: Column Visibility Toggle Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.5A

### Quick Summary
Pattern for eye icon dropdown to show/hide columns

---

## §19.5B: Column Width Persistence Pattern

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** **Related Bible Rules:**
- RULE #19.5B: Column Width Persistence (REQUIRED)
- RULE #19.13: State Persistence Standards
- RULE #19.4: Column Resizing Standards

### Quick Summary
Learn how to persist column widths to localStorage so users' custom column sizing is remembered across sessions.

### Code Example
```jsx
## Step 1: Define Default Column Widths

```javascript
const COLUMNS = [
  { key: 'id', label: 'ID', width: 100, resizable: true },
  { key: 'name', label: 'Name', width: 300, resizable: true },
  { key: 'email', label: 'Email', width: 250, resizable: true },
  { key: 'status', label: 'Status', width: 150, resizable: true }
]

const DEFAULT_COLUMN_WIDTHS = COLUMNS.reduce((acc, col) => {
  acc[col.key] = col.width
  return acc
}, {})
// Result: { id: 100, name: 300, email: 250, status: 150 }
```

## Step 2: Add State Management

```javascript
import { useState, useEffect } from 'react'

export default function MyTable() {
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS)
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('myTableColumnWidths')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setColumnWidths(parsed)
      } catch (e) {
        console.error('Failed to load column widths:', e)
        // Keep defaults on error
      }
    }
  }, [])
  
  // Save to localStorage whenever widths change
  useEffect(() => {
    try {
      localStorage.setItem('myTableColumnWidths', JSON.stringify(columnWidths))
    } catch (e) {
      console.error('Failed to save column widths:', e)
    }
  }, [columnWidths])
  
  return (/* table JSX */)
}
```

## Step 3: Use Widths in Table Headers and Cells

```javascript
<thead>
  <tr>
    {COLUMNS.map(col => (
      <th
        key={col.key}
        style={{
          width: `${columnWidths[col.key]}px`,
          minWidth: `${columnWidths[col.key]}px`
        }}
      >
        {col.label}
        
        {/* Resize Handle */}
        {col.resizable && (
          <div
            className=resize-handle
            onMouseDown={(e) => handleResizeStart(e, col.key)}
          />
        )}
      </th>
    ))}
  </tr>
</thead>

<tbody>
  {data.map(row => (
    <tr key={row.id}>
      {COLUMNS.map(col => (
        <td
          key={col.key}
          style={{
            width: `${columnWidths[col.key]}px`,
            minWidth: `${columnWidths[col.key]}px`,
            maxWidth: `${columnWidths[col.key]}px`
          }}
        >
          {row[col.key]}
        </td>
      ))}
    </tr>
  ))}
</tbody>
```

## Step 4: Implement Resize Handlers

```javascript
const [resizingColumn, setResizingColumn] = useState(null)
const [resizeStartX, setResizeStartX] = useState(0)
const [resizeStartWidth, setResizeStartWidth] = useState(0)

const handleResizeStart = (e, columnKey) => {
  e.stopPropagation()
  setResizingColumn(columnKey)
  setResizeStartX(e.clientX)
  setResizeStartWidth(columnWidths[columnKey])
}

const handleResizeMove = (e) => {
  if (!resizingColumn) return
  
  const diff = e.clientX - resizeStartX
  const newWidth = Math.max(50, resizeStartWidth + diff) // Min 50px
  
  setColumnWidths(prev => ({
    ...prev,
    [resizingColumn]: newWidth
  }))
}

const handleResizeEnd = () => {
  setResizingColumn(null)
}

useEffect(() => {
  if (resizingColumn) {
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }
}, [resizingColumn, resizeStartX, resizeStartWidth])
```
```

### ⚠️ Common Mistakes
## ❌ Common Mistakes

### 1. Not Using Unique localStorage Keys

**Wrong:**
```javascript
localStorage.setItem('columnWidths', JSON.stringify(widths))
// Collision risk if multiple tables on different pages!
```

**Right:**
```javascript
localStorage.setItem('contactsTableColumnWidths', JSON.stringify(widths))
localStorage.setItem('jobsTableColumnWidths', JSON.stringify(widths))
// Unique key per table
```

### 2. No Try/Catch on Parse

**Wrong:**
```javascript
const saved = JSON.parse(localStorage.getItem('widths'))
setColumnWidths(saved)
// Crashes if localStorage corrupted or empty!
```

**Right:**
```javascript
try {
  const saved = JSON.parse(localStorage.getItem('widths'))
  if (saved) setColumnWidths(saved)
} catch (e) {
  console.error('Failed to parse widths:', e)
  // Falls back to defaults
}
```

### 3. Forgetting Minimum Width

**Wrong:**
```javascript
const newWidth = resizeStartWidth + diff
// Can become negative or 0!
```

**Right:**
```javascript
const newWidth = Math.max(50, resizeStartWidth + diff)
// Always at least 50px
```

### 4. Not Cleaning Up Event Listeners

**Wrong:**
```javascript
useEffect(() => {
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
  // Memory leak! Never removed
}, [resizingColumn])
```

**Right:**
```javascript
useEffect(() => {
  if (resizingColumn) {
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }
}, [resizingColumn])
```

### 🧪 Testing Strategy
## ✅ Testing Strategy

### Manual Testing Checklist

- [ ] Resize column → width changes
- [ ] Reload page → width persists
- [ ] Clear localStorage → falls back to defaults
- [ ] Resize to very small → respects minimum (50px)
- [ ] Multiple tables on site → no collision (unique keys)
- [ ] Corrupted localStorage → doesn't crash, uses defaults

### Automated Testing (Optional)

```javascript
describe('Column Width Persistence', () => {
  it('saves widths to localStorage', () => {
    const { rerender } = render(<MyTable />)
    
    // Simulate resize
    fireEvent.mouseDown(screen.getByRole('columnheader', { name: 'Name' }))
    fireEvent.mouseMove(document, { clientX: 100 })
    fireEvent.mouseUp(document)
    
    // Check localStorage
    const saved = JSON.parse(localStorage.getItem('myTableColumnWidths'))
    expect(saved.name).toBeGreaterThan(300)
  })
  
  it('restores widths from localStorage', () => {
    localStorage.setItem('myTableColumnWidths', JSON.stringify({ name: 500 }))
    
    render(<MyTable />)
    
    const header = screen.getByRole('columnheader', { name: 'Name' })
    expect(header).toHaveStyle({ width: '500px' })
  })
})
```

### Description
## 📋 Overview

The **Column Width Persistence Pattern** ensures that when users manually resize table columns, their preferences are saved to localStorage and restored on subsequent visits.

This pattern is **required** for all tables with resizable columns to provide a consistent user experience.

---

## §19.6: Scroll Behavior Implementation

🧩 Component

### Description
## §19.6: Scroll Behavior Standards Implementation

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.6

### Container Pattern

Use flex layout with proper overflow handling:

```jsx
<div className="flex-1 min-h-0 flex flex-col">
  <div
    ref={scrollContainerRef}
    onScroll={handleScroll}
    className="flex-1 overflow-y-scroll overflow-x-auto"
  >
    <table>...</table>
  </div>
</div>
```

**Key Points:**
- `flex-1 min-h-0 flex flex-col` on container (critical for proper scrolling)
- `overflow-y-scroll overflow-x-auto` on scrollable area
- `min-h-0` prevents flex children from overflowing

### Scroll Sync Pattern

Sync horizontal scroll between main container and sticky scrollbar:

```jsx
const handleScroll = (e) => {
  const { scrollLeft } = e.target
  if (stickyScrollbarRef.current) {
    stickyScrollbarRef.current.scrollLeft = scrollLeft
  }
}

const handleStickyScroll = (e) => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollLeft = e.target.scrollLeft
  }
}
```

### ResizeObserver for Dynamic Updates

```jsx
useEffect(() => {
  const container = scrollContainerRef.current
  if (!container) return

  const updateScrollbar = () => {
    const { scrollWidth } = container
    setTableScrollWidth(scrollWidth)
  }

  updateScrollbar()
  const resizeObserver = new ResizeObserver(updateScrollbar)
  resizeObserver.observe(container)

  return () => resizeObserver.disconnect()
}, [filteredData, columnWidths])
```

### Custom Scrollbar Styling

```css
.custom-scroll::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #F3F4F6;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #9CA3AF;
  border-radius: 8px;
}
```

**Firefox support:**
```css
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #9CA3AF #E5E7EB;
}
```


---

## §19.8: Cell Content Standards Pattern

🧩 Component | 🟢 Beginner

**📖 Related Bible Rules:** **Related Bible Rules:**
- RULE #19.8: Cell Content Standards
- RULE #19.15: Dark Mode Requirements
- RULE #19.7: Column Width Standards


### Quick Summary
Learn how to properly format and truncate cell content with tooltips for overflow text, ensuring data remains accessible.

### Code Example
```jsx
## Step 1: Apply Truncation Classes

```javascript
<td
  className="px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 truncate overflow-hidden whitespace-nowrap"
  title={row.longText} // Full text shown on hover
>
  {row.longText}
</td>
```

**Key Classes:**
- `truncate` - Adds ellipsis (...)
- `overflow-hidden` - Prevents overflow
- `whitespace-nowrap` - Keeps text on one line

## Step 2: Column-Specific Width Constraints

```javascript
<td
  style={{
    width: `${columnWidths['name']}px`,
    minWidth: `${columnWidths['name']}px`,
    maxWidth: `${columnWidths['name']}px`
  }}
  className="px-4 py-2.5 truncate overflow-hidden whitespace-nowrap"
  title={row.name}
>
  {row.name}
</td>
```

## Step 3: Special Content Types

### Email Addresses
```javascript
<td className="truncate" title={row.email}>
  <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline">
    {row.email}
  </a>
</td>
```

### Dates
```javascript
<td className="whitespace-nowrap">
  {new Date(row.created_at).toLocaleDateString()}
</td>
```

### Status Badges
```javascript
<td>
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
    row.status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }`}>
    {row.status}
  </span>
</td>
```

### Numbers/Currency
```javascript
<td className="text-right font-mono">
  ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
</td>
```

## Step 4: Multi-Line Content (Notes/Descriptions)

For cells that need to show multiple lines:

```javascript
<td
  className="px-4 py-2.5 text-sm max-w-md"
  style={{ maxWidth: '400px' }}
>
  <div className="line-clamp-2 overflow-hidden" title={row.notes}>
    {row.notes}
  </div>
</td>
```

**Line Clamp Options:**
- `line-clamp-1` - 1 line with ellipsis
- `line-clamp-2` - 2 lines with ellipsis
- `line-clamp-3` - 3 lines with ellipsis

```

### ⚠️ Common Mistakes
## ❌ Common Mistakes

### 1. Forgetting title Attribute

**Wrong:**
```javascript
<td className="truncate">
  {row.longText}
</td>
// User can't see full text!
```

**Right:**
```javascript
<td className="truncate" title={row.longText}>
  {row.longText}
</td>
// Hover shows full text
```

### 2. Not Setting maxWidth

**Wrong:**
```javascript
<td className="truncate">
  {row.longText}
</td>
// Truncate doesn't work without width constraint!
```

**Right:**
```javascript
<td
  className="truncate"
  style={{ maxWidth: `${columnWidths['text']}px` }}
>
  {row.longText}
</td>
```

### 3. Using Truncate on Numbers

**Wrong:**
```javascript
<td className="truncate">
  $1,234,567.89
</td>
// Never truncate currency!
```

**Right:**
```javascript
<td className="text-right font-mono whitespace-nowrap">
  $1,234,567.89
</td>
```


### 🧪 Testing Strategy
## ✅ Testing Strategy

### Manual Testing Checklist

- [ ] Long text shows ellipsis (...)
- [ ] Hover over truncated cell → tooltip shows full text
- [ ] Currency/numbers align right and don't truncate
- [ ] Status badges render correctly
- [ ] Dark mode text is readable
- [ ] Line-clamp shows correct number of lines
- [ ] Email links are clickable


### Description
## 📋 Overview

The **Cell Content Standards Pattern** defines how to handle text overflow, truncation, and tooltips in table cells to maintain clean layouts while ensuring all data remains accessible to users.

This pattern prevents horizontal scrolling caused by long content and provides hover tooltips for full text.


---

## §19.9: Row Selection Pattern

🧩 Component

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #19.9

### Quick Summary
Pattern for checkbox-based row selection with bulk actions

---


# Chapter 20: Agent System & Automation

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):     Chapter 20               │
│ 📕 LEXICON (BUGS):    Chapter 20               │
└─────────────────────────────────────────────────┘

**Audience:** Claude Code + Human Developers
**Purpose:** Code examples, implementation patterns, and step-by-step guides
**Last Updated:** 2025-11-17

---

## §20.1: Agent Definitions Are Database-Driven

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.1

### Quick Summary
- Store all agent metadata in database - Update run history after each agent execution - Use API endpoints to manage agents - Track success/failure rates - Maintain agent priority order

### Code Example
```jsx
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

---

## §20.2: Agent Invocation Protocol

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.2

### Quick Summary
- Check if agent exists and is active - Record run start timestamp - Execute agent task - Record success or failure with details - Return comprehensive result

### Code Example
```jsx
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

## §20.3: Run History Tracking

✨ Feature | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.3

### Quick Summary
- Record total_runs, successful_runs, failed_runs - Store last_run_at timestamp - Save last_status and last_message - Include detailed last_run_details (JSONB) - Calculate success_rate automatically

### Code Example
```jsx
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

# ---

def success_rate
  return 0 if total_runs.zero?
  (successful_runs.to_f / total_runs * 100).round(1)
end
```

---

## §20.4: Agent Types and Specialization

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.4

### Quick Summary
- Assign agent_type: `development`, `diagnostic`, `deployment`, or `planning` - Define clear focus area (e.g., "Rails API Backend Development") - Specify tools available to agent - Document when to us

### Code Example
```jsx
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

## §20.5: Agent Priority and Display Order

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.5

### Quick Summary
- Set priority field (0-100) - Display agents sorted by: priority DESC, name ASC - Show active agents first - Hide inactive agents from main list

### Code Example
```jsx
100 - Critical development agents (backend-developer)
90  - Essential development agents (frontend-developer)
85  - Specialized diagnostic agents (gantt-bug-hunter)
80  - General diagnostic agents (production-bug-hunter)
70  - Deployment agents (deploy-manager)
60  - Planning agents (planning-collaborator)
0   - Default (new agents)
```

---

## §20.6: Agent Shortcuts and Invocation

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.6

### Quick Summary
- Support `run {agent-id}` (e.g., `run backend-developer`) - Support shortened versions (e.g., `backend dev`, `gantt`) - Document shortcuts in `example_invocations` field - Parse user input case-insen

### Code Example
```jsx
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

## §20.7: Recently Run Check (Smart Testing)

🔧 Util | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.7

### Quick Summary
- Check `last_run_at` timestamp - Compare to threshold (e.g., 60 minutes) - Skip redundant tests if recent successful run - ALWAYS re-run if last run failed - Ask user if uncertain

### Code Example
```jsx
# In AgentDefinition model
def recently_run?(minutes = 60)
  return false if last_run_at.nil?
  return false if last_status != 'success'
  last_run_at > minutes.minutes.ago
end

# ---

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

## §20.8: Shortcut Clarity - AgentShortcutsTab Updates

🧩 Component | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.8

### Quick Summary
- Update `frontend/src/components/settings/AgentShortcutsTab.jsx` when adding new shortcuts - Add new shortcuts to the `baseCommands` array - Ensure shortcuts match agent file definitions exactly - Us

### Code Example
```jsx
// Adding new agent shortcut
const baseCommands = [
  // ... existing shortcuts ...
  { id: 8, command: 'Run UI Compliance Auditor agent', shortcut: 'ui audit, run ui-compliance-auditor, ui compliance' },
  // ... more shortcuts ...
]
```

---

## §20.9: Creating New Agents - Complete Checklist

🔌 Integration | 🟡 Intermediate

**📖 Related Bible Rules:** TRAPID_BIBLE.md RULE #20.9

### Quick Summary
1.

### Code Example
```jsx
"agent-id": {
     "total_runs": 0,
     "successful_runs": 0,
     "failed_runs": 0,
     "last_run": null,
     "last_status": null,
     "last_message": null,
     "runs": []
   }

# ---

# 1. backend/db/seeds/agent_definitions.rb
{
  agent_id: 'ui-compliance-auditor',
  name: 'UI Compliance Auditor',
  agent_type: 'diagnostic',
  focus: 'Table UI Compliance & RULE #19 Standards',
  model: 'sonnet',
  purpose: 'Audits UI components for RULE #19 compliance...',
  # ... other fields
}

# ---

# 2. backend/app/controllers/api/v1/agents_controller.rb
agents: {
  'backend-developer': default_agent_stats,
  # ... other agents
  'ui-compliance-auditor': default_agent_stats
}

# ---

// 3. .claude/agents/run-history.json
{
  "agents": {
    "ui-compliance-auditor": {
      "total_runs": 0,
      "successful_runs": 0,
      "failed_runs": 0,
      "last_run": null,
      "last_status": null,
      "last_message": null,
      "runs": []
    }
  }
}

# ---

// 4. frontend/src/components/settings/AgentStatus.jsx
const getAgentIcon = (agentName) => {
  const icons = {
    'ui-compliance-auditor': '✅',
    // ... other agents
  };
};
```

---


**Last Generated:** 2025-11-17 11:28 AEST
**Generated By:** `rake trapid:export_teacher`
**Maintained By:** Development Team via Database UI
**Review Schedule:** After adding new patterns or updating examples