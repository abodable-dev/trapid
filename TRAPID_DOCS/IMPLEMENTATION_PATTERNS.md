# TRAPID IMPLEMENTATION PATTERNS - Developer's Cookbook

**Version:** 1.0.0
**Last Updated:** 2025-11-17 10:30 AEST
**Authority Level:** REFERENCE (Not enforced, examples only)
**Audience:** Developers implementing features

---

## 🎯 What This Document Is

This is your **implementation cookbook** for building Trapid features correctly.

**Contains:**
- ✅ Full code examples with comments
- ✅ Step-by-step implementation guides
- ✅ Architecture patterns and best practices
- ✅ Integration guides
- ✅ Common mistakes and how to avoid them
- ✅ Testing strategies
- ✅ Migration guides for refactoring

**Does NOT contain:**
- ❌ Rules (see TRAPID_BIBLE.md)
- ❌ Bug history (see TRAPID_LEXICON.md)
- ❌ User guides (see TRAPID_USER_MANUAL.md)

---

## 📚 How to Use This Document

### When Implementing a New Feature:
1. **Read Bible rules first** → Know what you MUST/NEVER do
2. **Come here for code examples** → See HOW to implement it
3. **Check Lexicon** → Learn from past bugs/gotchas
4. **Test against Bible rules** → Ensure compliance

### When Debugging:
1. **Check Lexicon first** → Known bugs and solutions
2. **Read this for context** → Understand how it should work
3. **Verify against Bible** → Confirm you're following rules

---

## 📖 Table of Contents

**Cross-Reference:**
- 📕 [Bible (Rules)](TRAPID_BIBLE.md) - MUST/NEVER/ALWAYS
- 📕 [Lexicon (Knowledge)](TRAPID_LEXICON.md) - Bug history & lessons
- 📘 [User Manual](TRAPID_USER_MANUAL.md) - End user guides

**Chapters:**
- [Chapter 0: System-Wide Patterns](#chapter-0-system-wide-patterns)
- [Chapter 1: Authentication & Users](#chapter-1-authentication--users) (Coming soon)
- [Chapter 2: System Administration](#chapter-2-system-administration) (Coming soon)
- [Chapter 3: Contacts & Relationships](#chapter-3-contacts--relationships) (Coming soon)
- [Chapter 4: Price Books & Suppliers](#chapter-4-price-books--suppliers) (Coming soon)
- [Chapter 5: Jobs & Construction Management](#chapter-5-jobs--construction-management) (Coming soon)
- [Chapter 6: Estimates & Quoting](#chapter-6-estimates--quoting) (Coming soon)
- [Chapter 7: AI Plan Review](#chapter-7-ai-plan-review) (Coming soon)
- [Chapter 8: Purchase Orders](#chapter-8-purchase-orders) (Coming soon)
- [Chapter 9: Gantt & Schedule Master](#chapter-9-gantt--schedule-master) (Coming soon)
- [Chapter 10: Project Tasks & Checklists](#chapter-10-project-tasks--checklists) (Coming soon)
- [Chapter 11: Weather & Public Holidays](#chapter-11-weather--public-holidays) (Coming soon)
- [Chapter 12: OneDrive Integration](#chapter-12-onedrive-integration) (Coming soon)
- [Chapter 13: Outlook/Email Integration](#chapter-13-outlookenail-integration) (Coming soon)
- [Chapter 14: Chat & Communications](#chapter-14-chat--communications) (Coming soon)
- [Chapter 15: Xero Accounting Integration](#chapter-15-xero-accounting-integration) (Coming soon)
- [Chapter 16: Payments & Financials](#chapter-16-payments--financials) (Coming soon)
- [Chapter 17: Workflows & Automation](#chapter-17-workflows--automation) (Coming soon)
- [Chapter 18: Custom Tables & Formulas](#chapter-18-custom-tables--formulas) (Coming soon)
- [Chapter 19: UI/UX Standards & Patterns](#chapter-19-uiux-standards--patterns) (Coming soon)

---

# Chapter 0: System-Wide Patterns

📖 **Bible Authority:** [TRAPID_BIBLE.md Chapter 0](TRAPID_BIBLE.md#chapter-0-overview--system-wide-rules)
📕 **Related Knowledge:** [LEXICON Chapter 0](TRAPID_LEXICON.md#chapter-0-overview--system-wide-patterns)

**Last Updated:** 2025-11-17 10:30 AEST

---

## §0.1: API Response Format Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #2

### Quick Start

```ruby
# Success response
render json: { success: true, data: { user: @user }, message: "User created" }

# Error response
render json: { success: false, error: "Validation failed", details: @user.errors }, status: :unprocessable_entity
```

### Full Implementation

```ruby
# app/controllers/api/v1/users_controller.rb
class Api::V1::UsersController < ApplicationController
  def create
    @user = User.new(user_params)

    if @user.save
      render json: {
        success: true,
        data: { user: @user },
        message: "User created successfully"
      }, status: :created
    else
      render json: {
        success: false,
        error: "Failed to create user",
        details: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def index
    @users = User.all

    render json: {
      success: true,
      data: {
        users: @users,
        total: @users.count
      }
    }
  end

  def destroy
    @user = User.find(params[:id])

    if @user.destroy
      render json: {
        success: true,
        message: "User deleted successfully"
      }
    else
      render json: {
        success: false,
        error: "Failed to delete user",
        details: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: "User not found"
    }, status: :not_found
  end
end
```

### Response Structure

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Your data here (object or array)
  },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": {
    // Optional error details (validation errors, stack trace in dev, etc.)
  }
}
```

### Frontend Pattern

```javascript
// frontend/src/api/users.js
export const createUser = async (userData) => {
  try {
    const response = await fetch('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error, details: result.details };
    }
  } catch (error) {
    return { success: false, error: 'Network error', details: error.message };
  }
};

// Usage in component
const handleSubmit = async () => {
  const result = await createUser(formData);

  if (result.success) {
    toast.success('User created!');
    navigate('/users');
  } else {
    toast.error(result.error);
    console.error('Validation errors:', result.details);
  }
};
```

### HTTP Status Codes

| Status | When to Use | Example |
|--------|-------------|---------|
| 200 OK | Successful GET, PATCH, DELETE | User fetched successfully |
| 201 Created | Successful POST (resource created) | User created successfully |
| 204 No Content | Successful DELETE (no response body) | User deleted (no message) |
| 400 Bad Request | Invalid request format | Missing required parameter |
| 401 Unauthorized | Authentication failed | Invalid JWT token |
| 403 Forbidden | Authenticated but not authorized | Non-admin trying admin action |
| 404 Not Found | Resource doesn't exist | User ID not found |
| 422 Unprocessable Entity | Validation failed | Password too short |
| 500 Internal Server Error | Server-side error | Database connection failed |

### Common Mistakes

❌ **Don't mix response formats:**
```ruby
# BAD - Inconsistent
def create
  if @user.save
    render json: @user  # Missing success wrapper
  else
    render json: { error: "Failed" }  # Missing success: false
  end
end
```

✅ **Do use consistent format:**
```ruby
# GOOD - Consistent
def create
  if @user.save
    render json: { success: true, data: { user: @user } }
  else
    render json: { success: false, error: "Failed", details: @user.errors }
  end
end
```

❌ **Don't return HTML errors in JSON API:**
```ruby
# BAD - Will return HTML error page
def show
  @user = User.find(params[:id])  # Raises ActiveRecord::RecordNotFound
  render json: { success: true, data: { user: @user } }
end
```

✅ **Do rescue exceptions:**
```ruby
# GOOD - Returns JSON error
def show
  @user = User.find(params[:id])
  render json: { success: true, data: { user: @user } }
rescue ActiveRecord::RecordNotFound
  render json: { success: false, error: "User not found" }, status: :not_found
end
```

### Testing

```ruby
# spec/requests/api/v1/users_spec.rb
RSpec.describe 'Users API', type: :request do
  describe 'POST /api/v1/users' do
    context 'with valid parameters' do
      let(:valid_params) { { email: 'test@example.com', password: 'Password123!' } }

      it 'returns success response with created user' do
        post '/api/v1/users', params: valid_params

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['success']).to be true
        expect(json['data']['user']['email']).to eq('test@example.com')
        expect(json['message']).to be_present
      end
    end

    context 'with invalid parameters' do
      let(:invalid_params) { { email: 'invalid' } }

      it 'returns error response with validation details' do
        post '/api/v1/users', params: invalid_params

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['success']).to be false
        expect(json['error']).to be_present
        expect(json['details']).to be_present
      end
    end
  end
end
```

---

## §0.2: Database Migration Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #3

### Quick Start

```bash
# Create migration
bin/rails generate migration AddColumnToTable column_name:type

# Run migration
bin/rails db:migrate

# Test rollback
bin/rails db:rollback
```

### Safe Migration Patterns

#### Adding Columns

```ruby
# db/migrate/20251117_add_status_to_users.rb
class AddStatusToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :status, :string, default: 'active', null: false
    add_index :users, :status
  end
end
```

**Key Points:**
- ✅ Use `default` value to populate existing rows
- ✅ Use `null: false` to prevent nil values
- ✅ Add index if column will be queried
- ✅ Use `change` method (auto-reversible)

#### Removing Columns (Two-Step Process)

```ruby
# Step 1: Deploy this migration first
class IgnoreDeprecatedColumn < ActiveRecord::Migration[7.1]
  def change
    # Don't remove yet! Just stop using it in code first.
    # Update all code to not reference this column.
  end
end

# Step 2: After code deployed, remove column in separate migration
class RemoveDeprecatedColumnFromUsers < ActiveRecord::Migration[7.1]
  def change
    remove_column :users, :deprecated_column, :string
  end
end
```

**Why two steps?**
- Prevents downtime during rolling deployments
- Old code still running needs column to exist
- Deploy code changes first, then remove column

#### Changing Column Types (Use up/down)

```ruby
class ChangeContactTypesToArray < ActiveRecord::Migration[7.1]
  def up
    # Add new array column
    add_column :contacts, :contact_types_new, :string, array: true, default: []

    # Migrate data
    Contact.find_each do |contact|
      contact.update_column(:contact_types_new, [contact.contact_type].compact)
    end

    # Remove old column, rename new
    remove_column :contacts, :contact_type
    rename_column :contacts, :contact_types_new, :contact_types
  end

  def down
    # Add old column back
    add_column :contacts, :contact_type, :string

    # Migrate data back
    Contact.find_each do |contact|
      contact.update_column(:contact_type, contact.contact_types&.first)
    end

    # Remove array column
    remove_column :contacts, :contact_types
  end
end
```

#### Adding Foreign Keys

```ruby
class AddUserToJobs < ActiveRecord::Migration[7.1]
  def change
    add_reference :jobs, :user, foreign_key: true, null: false, index: true
  end
end
```

**Key Points:**
- ✅ Use `add_reference` (creates column + index + FK)
- ✅ Add `foreign_key: true` for referential integrity
- ✅ Add `index: true` (automatic, but be explicit)
- ✅ Use `null: false` if required association

#### Creating Tables

```ruby
class CreateContactRelationships < ActiveRecord::Migration[7.1]
  def change
    create_table :contact_relationships do |t|
      t.references :source_contact, null: false, foreign_key: { to_table: :contacts }, index: true
      t.references :related_contact, null: false, foreign_key: { to_table: :contacts }, index: true
      t.string :relationship_type, null: false
      t.text :notes

      t.timestamps

      # Prevent duplicate relationships
      t.index [:source_contact_id, :related_contact_id], unique: true, name: 'index_contact_relationships_unique_pair'
    end
  end
end
```

### Common Mistakes

❌ **Don't modify existing migrations after deployment:**
```ruby
# BAD - Never edit this after it's been run in production
class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :name  # Oops, forgot email! DON'T ADD IT HERE!
    end
  end
end
```

✅ **Do create new migration:**
```ruby
# GOOD - New migration to add missing column
class AddEmailToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :email, :string, null: false
    add_index :users, :email, unique: true
  end
end
```

❌ **Don't add columns manually without migration:**
```bash
# BAD - Schema changes must go through migrations
$ heroku pg:psql
=> ALTER TABLE users ADD COLUMN email VARCHAR(255);
```

✅ **Do create migration even for manual changes:**
```ruby
# GOOD - Create migration AFTER manual fix in production
class AddEmailToUsersPostHotfix < ActiveRecord::Migration[7.1]
  def change
    # Column already exists in production, but migration needed for dev/test
    unless column_exists?(:users, :email)
      add_column :users, :email, :string
    end
  end
end
```

### Testing Migrations

```ruby
# spec/db/migrate/add_status_to_users_spec.rb
require 'rails_helper'
require 'active_record/migration'

RSpec.describe 'AddStatusToUsers migration', type: :migration do
  let(:migration) { AddStatusToUsers.new }

  it 'adds status column with default value' do
    # Rollback migration
    migration.migrate(:down) if ActiveRecord::Base.connection.column_exists?(:users, :status)

    # Run migration
    migration.migrate(:up)

    # Verify column exists
    expect(ActiveRecord::Base.connection.column_exists?(:users, :status)).to be true

    # Verify default value
    user = User.create!(email: 'test@example.com', password: 'Password123!')
    expect(user.status).to eq('active')
  end

  it 'is reversible' do
    migration.migrate(:up)
    expect { migration.migrate(:down) }.not_to raise_error
    expect(ActiveRecord::Base.connection.column_exists?(:users, :status)).to be false
  end
end
```

### Migration Checklist

Before running `db:migrate` in production:

- [ ] Migration has been tested locally
- [ ] Migration has been tested with rollback (`db:rollback`)
- [ ] Migration is reversible (or uses `up`/`down` methods)
- [ ] Large data migrations are batched (`.find_each` not `.each`)
- [ ] Foreign keys reference correct tables
- [ ] Indexes added for frequently queried columns
- [ ] Default values set for new columns with `null: false`
- [ ] Migration doesn't lock tables for extended periods (use `disable_ddl_transaction!` for large tables)

---

## §0.3: Lexicon Documentation Workflow

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #0

### Quick Start

**When you fix a bug:**
1. Fix the code
2. Go to Trapid app → Documentation page → 📕 TRAPID Lexicon
3. Click "Add Entry"
4. Fill in bug details
5. Run: `bin/rails trapid:export_lexicon`
6. Commit code + exported Lexicon file together

### Full Workflow

#### Step 1: Fix the Bug

```ruby
# Example: Fix Gantt cascade shaking bug
# backend/app/services/schedule/cascade_calculator.rb

def calculate_cascade(job_id)
  # BEFORE: Direct sequence_order manipulation caused shaking
  # task.update!(sequence_order: new_order)  # ❌ BAD

  # AFTER: Use batch update with transaction
  ActiveRecord::Base.transaction do
    tasks_to_update.each do |task|
      task.sequence_order = task.calculated_order
    end
    Task.import tasks_to_update, on_duplicate_key_update: [:sequence_order]
  end
end
```

#### Step 2: Document in Lexicon (via UI)

**Navigate to:** Trapid app → Settings → Documentation → 📕 TRAPID Lexicon → "Add Entry"

**Fill in form:**

| Field | Value |
|-------|-------|
| **Chapter** | 9 - Gantt & Schedule Master |
| **Knowledge Type** | bug |
| **Title** | Gantt Shaking During Cascade Updates |
| **Status** | fixed |
| **Severity** | high |
| **First Reported** | 2025-11-10 |
| **Fixed Date** | 2025-11-11 |
| **Component** | CascadeCalculator |
| **Description** | Gantt chart visibly "shakes" during cascade updates when tasks are repositioned. Users reported nausea and difficulty tracking changes. |
| **Scenario** | 1. Open Gantt chart with 50+ tasks<br>2. Drag one task to new date<br>3. Cascade triggers<br>4. All dependent tasks flicker/shake as sequence_order updates fire individually |
| **Root Cause** | Sequential `task.update!` calls in cascade loop triggered separate React re-renders for each task. 50 tasks = 50 DOM updates in 200ms, causing visible flickering. |
| **Solution** | Batch updates using `.import` with transaction. All sequence_order changes happen in single database round-trip, triggering one React render instead of 50. |
| **Prevention** | Always use batch updates for multi-record changes. Test with large datasets (50+ records) to catch visual issues. |
| **Rule Reference** | Chapter 9, RULE #9.3 |

**Click "Save Entry"**

#### Step 3: Export to Markdown

```bash
# This regenerates TRAPID_LEXICON.md from database
bin/rails trapid:export_lexicon

# Output:
# ✅ Exported 47 entries to TRAPID_DOCS/TRAPID_LEXICON.md
```

#### Step 4: Verify Export

```bash
# Check that your entry appears in the file
grep -A 10 "Gantt Shaking" TRAPID_DOCS/TRAPID_LEXICON.md
```

#### Step 5: Commit Together

```bash
# Stage both code fix and documentation
git add backend/app/services/schedule/cascade_calculator.rb
git add TRAPID_DOCS/TRAPID_LEXICON.md

# Commit with descriptive message
git commit -m "fix: Prevent Gantt shaking during cascade updates

- Batch sequence_order updates using .import
- Reduces 50 renders to 1 render
- Documented in Lexicon Chapter 9

Fixes #123"
```

### Lexicon Entry Types

| Type | When to Use | Example |
|------|-------------|---------|
| **bug** | Something broke and you fixed it | "Gantt shaking during cascade" |
| **architecture** | Explaining how/why system designed | "Why we use singleton for CompanySetting" |
| **performance** | Optimization or performance note | "Batch updates 5x faster than individual" |
| **test** | Testing strategy or edge case | "How to test cascade with locked tasks" |
| **dev_note** | Implementation note for developers | "OneDrive URLs expire after 1 hour" |
| **common_issue** | Frequently encountered gotcha | "Don't forget to add index on foreign keys" |
| **terminology** | Definition of domain term | "What is 'cascade' in Gantt context" |

### API Endpoints (Advanced)

```ruby
# If you prefer API over UI
POST /api/v1/documented_bugs
Content-Type: application/json

{
  "chapter_number": 9,
  "chapter_name": "Gantt & Schedule Master",
  "knowledge_type": "bug",
  "bug_title": "Gantt Shaking During Cascade Updates",
  "status": "fixed",
  "severity": "high",
  "description": "...",
  "scenario": "...",
  "root_cause": "...",
  "solution": "...",
  "prevention": "...",
  "component": "CascadeCalculator",
  "rule_reference": "Chapter 9, RULE #9.3"
}

# Then export
POST /api/v1/documented_bugs/export_to_markdown
```

### Common Mistakes

❌ **Don't edit TRAPID_LEXICON.md directly:**
```bash
# BAD - Manual edits will be overwritten on next export
vim TRAPID_DOCS/TRAPID_LEXICON.md
# Add bug entry manually...
git commit -m "Add bug to Lexicon"  # ❌ Will be lost!
```

✅ **Do use database + export:**
```bash
# GOOD - Use UI or API to add to documented_bugs table
# Then export to .md file
bin/rails trapid:export_lexicon
git commit -m "Add bug to Lexicon"  # ✅ Persisted in database
```

❌ **Don't skip Lexicon documentation:**
```bash
# BAD - Fix bug but don't document it
git commit -m "fix: Gantt shaking"  # No Lexicon entry = knowledge lost
```

✅ **Do document every bug fix:**
```bash
# GOOD - Fix + document together
# 1. Fix code
# 2. Add Lexicon entry via UI
# 3. Export Lexicon
# 4. Commit both together
git add backend/app/services/schedule/cascade_calculator.rb TRAPID_DOCS/TRAPID_LEXICON.md
git commit -m "fix: Gantt shaking (documented in Lexicon Ch 9)"
```

---

## §0.4: Protected Code Patterns - How to Identify

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #0 (Protected Code Patterns sections in each chapter)

### What Makes Code "Protected"?

**Protected code** is code that:
1. ✅ Other code depends on heavily (breaking it breaks many features)
2. ✅ Encapsulates critical business logic
3. ✅ Has been bug-fixed extensively (contains hard-won knowledge)
4. ✅ Would be easy to "optimize" incorrectly

### Quick Identification Guide

| Pattern | Protected? | Why |
|---------|-----------|-----|
| Singleton `instance` method | ✅ YES | Entire app depends on it |
| Timezone wrapper methods | ✅ YES | Removing breaks date calculations globally |
| Cascade calculation logic | ✅ YES | Heavily tested, fragile business logic |
| Password validation regex | ✅ YES | Security requirement, don't weaken |
| API response format | ✅ YES | Frontend expects consistent structure |
| Simple CRUD controller | ❌ NO | Can be refactored safely |
| View helper method | ❌ NO | Low impact if changed |

### Example: CompanySetting Singleton

```ruby
# app/models/company_setting.rb

# ⚠️ PROTECTED: DO NOT MODIFY
def self.instance
  first_or_create!(
    company_name: "Trapid Construction",
    timezone: "Australia/Brisbane",
    working_days: DEFAULT_WORKING_DAYS
  )
end
```

**Why protected?**
- Called in ~50 different files
- Changing method signature breaks all callers
- `first_or_create!` ensures database consistency
- Default values are critical for app initialization

**What you CAN do:**
- ✅ Change default values (company_name, timezone)
- ✅ Add new fields to first_or_create! (backward compatible)

**What you CANNOT do:**
- ❌ Remove `instance` method
- ❌ Change return type
- ❌ Rename method to `get_settings`
- ❌ Make it require parameters

### Example: Cascade Calculator

```ruby
# app/services/schedule/cascade_calculator.rb

# ⚠️ PROTECTED: DO NOT MODIFY without reading Chapter 9
def calculate_cascade(job_id, changed_task_id)
  # This logic represents 6 months of bug fixes
  # Contains workarounds for circular dependencies, locked tasks, working days
  # DO NOT "simplify" or "optimize" without extensive testing
end
```

**Why protected?**
- Contains hard-won bug fixes (see Lexicon Ch 9)
- Business-critical feature (auto-scheduling)
- Complex edge cases (circular deps, locked tasks, working days)
- Heavily tested with specific scenarios

**What you CAN do:**
- ✅ Add new features (e.g., holiday awareness) with tests
- ✅ Fix bugs with Lexicon documentation
- ✅ Optimize performance IF tests still pass

**What you CANNOT do:**
- ❌ Rewrite from scratch without approval
- ❌ Remove "redundant" checks (they prevent edge cases)
- ❌ Change algorithm without understanding why current one exists

### How to Document Protected Code

**In Bible:**

```markdown
## Protected Code Patterns

### 1. CompanySetting Instance Method

**File:** `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb:10-18`

**DO NOT modify singleton pattern:**
```ruby
def self.instance
  first_or_create!(...)
end
```

**Reason:** Changing this breaks initialization across entire application. All services depend on `instance` method.
```

**In Code Comments:**

```ruby
# app/models/company_setting.rb

# ⚠️ PROTECTED CODE (See TRAPID_BIBLE.md Chapter 2)
# This method is called in 50+ files across the application.
# DO NOT change method signature or return type.
# See Lexicon Chapter 2 for bug history.
def self.instance
  first_or_create!(
    company_name: "Trapid Construction",
    timezone: "Australia/Brisbane",
    working_days: DEFAULT_WORKING_DAYS
  )
end
```

### Testing Protected Code

```ruby
# spec/models/company_setting_spec.rb

RSpec.describe CompanySetting, type: :model do
  describe '.instance' do
    it 'returns singleton instance' do
      instance1 = CompanySetting.instance
      instance2 = CompanySetting.instance

      expect(instance1).to eq(instance2)
      expect(CompanySetting.count).to eq(1)
    end

    it 'creates with default values if empty' do
      CompanySetting.destroy_all

      instance = CompanySetting.instance

      expect(instance.company_name).to eq("Trapid Construction")
      expect(instance.timezone).to eq("Australia/Brisbane")
      expect(instance.working_days["sunday"]).to be true
    end

    # ⚠️ CRITICAL TEST: Ensures method signature hasn't changed
    it 'responds to instance method without parameters' do
      expect(CompanySetting).to respond_to(:instance)
      expect(CompanySetting.method(:instance).arity).to eq(0)  # No params!
    end
  end
end
```

---

## Coming Soon

The following sections will be added as chapters are migrated from Bible:

- §0.5: Agent Update Workflow
- §0.6: Documentation Authority Resolution
- §0.7: Git Commit Standards
- §0.8: Testing Patterns
- §0.9: Error Handling Patterns
- §0.10: Background Job Patterns

---

## Contributing to This Document

When you add a new implementation pattern:

1. ✅ Extract code examples from Bible
2. ✅ Add step-by-step guide
3. ✅ Include common mistakes section
4. ✅ Add testing examples
5. ✅ Cross-reference Bible rule
6. ✅ Link related Lexicon entries
7. ✅ Update "Last Updated" timestamp
8. ✅ Commit with message: `docs: Add implementation pattern §X.Y`

**Remember:** This document is EXAMPLES, not RULES. The rules live in TRAPID_BIBLE.md.