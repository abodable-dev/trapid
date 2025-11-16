# TRAPID IMPLEMENTATION PATTERNS - Developer's Cookbook

**Version:** 1.0.0
**Last Updated:** 2025-11-17 06:34 AEST
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
- [Chapter 19: UI/UX Standards & Patterns](#chapter-19-uiux-standards--patterns)

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
---

# Chapter 19: UI/UX Standards & Patterns

📖 **Bible Authority:** [TRAPID_BIBLE.md Chapter 19](TRAPID_BIBLE.md#chapter-19-uiux-standards--patterns)
📕 **Related Knowledge:** [LEXICON Chapter 19](TRAPID_LEXICON.md#chapter-19)

**Last Updated:** 2025-11-17 14:30 AEST

---

## §19.1: Table Component Selection Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.1

### Quick Start

**Decision tree:**
- Read-only, basic sorting only? → Use DataTable.jsx
- Need editing, bulk actions, advanced features? → Use full Table pattern

### When to Use DataTable Component

✅ **USE DataTable.jsx when:**
- Simple list/grid view needed
- Basic sorting sufficient
- No column reordering required
- No column resizing required
- No inline column filters needed

```jsx
// Example: Simple read-only table
import DataTable from '../components/DataTable'

const PublicHolidaysPage = () => {
  const columns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'name', label: 'Holiday Name', sortable: true },
    { key: 'state', label: 'State', sortable: true }
  ]

  return <DataTable columns={columns} data={holidays} />
}
```

### Full Implementation - Advanced Table

When you need ALL features (not using DataTable.jsx):

```jsx
// REQUIRED features for ALL tables (except DataTable.jsx):
// ✅ Row selection checkboxes with bulk actions
// ✅ Column resizing (drag handles)
// ✅ Column reordering (drag-and-drop headers)
// ✅ Inline column filters
// ✅ Global search
// ✅ Column visibility toggle
// ✅ State persistence (localStorage)
// ✅ Dark mode support
// ✅ Sticky headers with gradient background
// ✅ Standardized toolbar layout (RULE #19.11A)

const ContactsPage = () => {
  // State management
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [columnWidths, setColumnWidths] = useState(defaultWidths)
  const [columnOrder, setColumnOrder] = useState(['name', 'email', 'status'])
  const [visibleColumns, setVisibleColumns] = useState({ name: true, email: true })
  const [columnFilters, setColumnFilters] = useState({})
  const [globalSearch, setGlobalSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  // Table with ALL required features
  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar - RULE #19.11A */}
      <div className="mb-4 flex items-center justify-between gap-4">
        {/* LEFT: Global search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>

        {/* RIGHT: Action buttons */}
        <div className="flex items-center gap-2">
          <button onClick={handleNew} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
            <PlusIcon className="h-5 w-5 inline mr-2" />
            New Contact
          </button>
          <button onClick={toggleColumnSelector} className="px-3 py-2 bg-gray-200 rounded-lg">
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bulk actions when items selected */}
      {selectedItems.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <span>{selectedItems.size} selected</span>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
            <tr>
              {/* Selection column */}
              <th className="px-2 py-3 w-8 text-center">
                <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
              </th>
              
              {/* Data columns */}
              {columnOrder.filter(key => visibleColumns[key]).map(colKey => (
                <th key={colKey} draggable onDragStart={(e) => handleDragStart(e, colKey)}>
                  {/* Column header with resize handle, sort, filter */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{/* Rows */}</tbody>
        </table>
      </div>
    </div>
  )
}
```

### Common Mistakes

❌ **Don't create custom basic tables:**
```jsx
// BAD - Creating your own simple table instead of using DataTable
const MyCustomTable = () => (
  <table>
    <thead><tr><th>Name</th></tr></thead>
    <tbody>{/* ... */}</tbody>
  </table>
)
```

✅ **Do use DataTable for simple cases:**
```jsx
// GOOD - Use existing DataTable component
import DataTable from '../components/DataTable'
<DataTable columns={columns} data={data} />
```

❌ **Don't skip required features:**
```jsx
// BAD - Missing column visibility toggle, resize handles, filters
const IncompleteTable = () => (
  <table>
    {/* Only has basic sorting, missing other features */}
  </table>
)
```

✅ **Do implement ALL features or use DataTable:**
```jsx
// GOOD - Either use DataTable OR implement all features
// See full implementation example above
```

### Testing

```javascript
// Test component selection
describe('Table Component Selection', () => {
  it('uses DataTable for simple read-only data', () => {
    const { container } = render(<PublicHolidaysPage />)
    expect(container.querySelector('.data-table')).toBeInTheDocument()
  })

  it('uses full table for editable/advanced features', () => {
    const { container } = render(<ContactsPage />)
    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    expect(container.querySelector('.resize-handle')).toBeInTheDocument()
  })
})
```

---

## §19.2: Table Header Implementation

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.2

### Quick Start

```jsx
// Sticky header with gradient and sort indicators
<thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
  <tr>
    <th onClick={() => handleSort('name')}>
      Name
      {sortConfig.key === 'name' && (
        sortConfig.direction === 'asc' 
          ? <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          : <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      )}
    </th>
  </tr>
</thead>
```

### Full Implementation

```jsx
const TableHeader = ({ column, sortConfig, onSort }) => {
  const isSorted = sortConfig.key === column.key
  const sortDirection = isSorted ? sortConfig.direction : null

  return (
    <th
      className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none"
      onClick={() => column.sortable && onSort(column.key)}
    >
      <div className="flex items-center justify-between">
        <span>{column.label}</span>
        
        {/* Sort indicators */}
        {column.sortable && (
          <div className="ml-2">
            {isSorted ? (
              sortDirection === 'asc' ? (
                <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              )
            ) : (
              <div className="opacity-0 group-hover:opacity-50">
                <ChevronUpIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        )}
      </div>
    </th>
  )
}

// Usage
<thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
  <tr className="group">
    {columns.map(column => (
      <TableHeader 
        key={column.key} 
        column={column} 
        sortConfig={sortConfig} 
        onSort={handleSort} 
      />
    ))}
  </tr>
</thead>
```

### Sort State Management

```jsx
const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

const handleSort = (columnKey) => {
  setSortConfig(prev => {
    // Cycle: null → asc → desc → null
    if (prev.key !== columnKey) {
      return { key: columnKey, direction: 'asc' }
    }
    if (prev.direction === 'asc') {
      return { key: columnKey, direction: 'desc' }
    }
    return { key: null, direction: null }
  })
}

// Apply sorting to data
const sortedData = useMemo(() => {
  if (!sortConfig.key) return filteredData

  return [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    // Handle nulls
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1

    // Compare values
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })
}, [filteredData, sortConfig])
```

### Common Mistakes

❌ **Don't use static headers:**
```jsx
// BAD - Headers scroll away
<thead>
  <tr><th>Name</th></tr>
</thead>
```

✅ **Do use sticky headers:**
```jsx
// GOOD - Headers stay visible
<thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100">
  <tr><th>Name</th></tr>
</thead>
```

❌ **Don't forget dark mode:**
```jsx
// BAD - Only light mode colors
<thead className="bg-gray-50">
```

✅ **Do support dark mode:**
```jsx
// GOOD - Both modes
<thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
```

### Testing

```javascript
describe('Table Headers', () => {
  it('displays sort indicators on active column', () => {
    const { getByText } = render(<Table sortConfig={{ key: 'name', direction: 'asc' }} />)
    const header = getByText('Name').parentElement
    expect(header.querySelector('.chevron-up')).toBeInTheDocument()
  })

  it('changes sort direction on click', () => {
    const handleSort = jest.fn()
    const { getByText } = render(<TableHeader column={{ key: 'name', sortable: true }} onSort={handleSort} />)
    fireEvent.click(getByText('Name'))
    expect(handleSort).toHaveBeenCalledWith('name')
  })

  it('headers remain sticky when scrolling', () => {
    const { container } = render(<Table />)
    const thead = container.querySelector('thead')
    expect(thead).toHaveClass('sticky', 'top-0')
  })
})
```

---

## §19.3: Column Filter Implementation

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.3

### Quick Start

```jsx
// Text input filter in header
<th>
  <div>Name</div>
  <input
    type="text"
    placeholder="Search..."
    value={columnFilters.name || ''}
    onChange={(e) => handleColumnFilterChange('name', e.target.value)}
    onClick={(e) => e.stopPropagation()}
    className="mt-1 w-full text-xs px-2 py-1 border rounded"
  />
</th>

// Dropdown filter for enum columns
<th>
  <div>Status</div>
  <select
    value={columnFilters.status || ''}
    onChange={(e) => handleColumnFilterChange('status', e.target.value)}
    onClick={(e) => e.stopPropagation()}
    className="mt-1 w-full text-xs px-2 py-1 border rounded"
  >
    <option value="">All</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</th>
```

### Full Implementation

```jsx
const TableWithFilters = () => {
  const [columnFilters, setColumnFilters] = useState({})
  const [globalSearch, setGlobalSearch] = useState('')

  const columns = [
    { key: 'select', label: '', searchable: false },
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'email', label: 'Email', sortable: true, searchable: true },
    { key: 'status', label: 'Status', sortable: true, searchable: true, filterType: 'dropdown' },
    { key: 'role', label: 'Role', sortable: true, searchable: true, filterType: 'dropdown' },
    { key: 'actions', label: 'Actions', searchable: false }
  ]

  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  // Apply filters
  const filteredData = useMemo(() => {
    let result = data

    // Apply global search
    if (globalSearch) {
      result = result.filter(item =>
        Object.values(item).some(val =>
          val?.toString().toLowerCase().includes(globalSearch.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.keys(columnFilters).forEach(key => {
      const filterValue = columnFilters[key]
      if (filterValue) {
        result = result.filter(item =>
          item[key]?.toString().toLowerCase().includes(filterValue.toLowerCase())
        )
      }
    })

    return result
  }, [data, globalSearch, columnFilters])

  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.key}>
              <div className="flex items-center justify-between">
                <span>{column.label}</span>
                {/* Sort indicator */}
              </div>

              {/* Column filter */}
              {column.searchable && (
                column.filterType === 'dropdown' ? (
                  <select
                    value={columnFilters[column.key] || ''}
                    onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All {column.label}</option>
                    {column.key === 'status' && (
                      <>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </>
                    )}
                    {column.key === 'role' && (
                      <>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Search..."
                    value={columnFilters[column.key] || ''}
                    onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                )
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredData.map(item => (
          <tr key={item.id}>{/* cells */}</tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Debounced Filter (Optional for Large Datasets)

```jsx
import { useState, useEffect } from 'react'

const DebouncedFilter = ({ column, value, onChange }) => {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(column.key, inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, column.key, onChange])

  return (
    <input
      type="text"
      placeholder="Search..."
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="mt-1 w-full text-xs px-2 py-1 border rounded"
    />
  )
}
```

### Common Mistakes

❌ **Don't forget e.stopPropagation():**
```jsx
// BAD - Clicking filter triggers sort
<input onChange={handleChange} />  // Clicks propagate to th onClick
```

✅ **Do stop event propagation:**
```jsx
// GOOD - Filter clicks don't trigger sort
<input onChange={handleChange} onClick={(e) => e.stopPropagation()} />
```

❌ **Don't make selection/action columns searchable:**
```jsx
// BAD - Filter on checkbox column
{ key: 'select', label: '', searchable: true }  // Wrong!
```

✅ **Do exclude non-data columns:**
```jsx
// GOOD - Only data columns are searchable
{ key: 'select', label: '', searchable: false },
{ key: 'name', label: 'Name', searchable: true },
{ key: 'actions', label: 'Actions', searchable: false }
```

### Testing

```javascript
describe('Column Filters', () => {
  it('filters data when typing in column filter', () => {
    const { getByPlaceholderText, getAllByRole } = render(<TableWithFilters data={testData} />)
    const nameFilter = getByPlaceholderText('Search...')
    
    fireEvent.change(nameFilter, { target: { value: 'John' } })
    
    const rows = getAllByRole('row')
    expect(rows.length).toBe(2) // Header + 1 matching row
  })

  it('uses dropdown for enum columns', () => {
    const { getByLabelText } = render(<TableWithFilters />)
    const statusFilter = getByLabelText('Status filter')
    expect(statusFilter.tagName).toBe('SELECT')
  })

  it('combines global search with column filters', () => {
    const { getByPlaceholderText, getAllByRole } = render(<TableWithFilters data={testData} />)
    
    fireEvent.change(getByPlaceholderText('Search...'), { target: { value: 'active' } })
    const statusFilter = document.querySelector('select')
    fireEvent.change(statusFilter, { target: { value: 'admin' } })
    
    // Should show only rows matching both filters
    expect(getAllByRole('row').length).toBeLessThan(testData.length + 1)
  })
})
```

---

## §19.4: Column Resizing Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.4

### Quick Start

```jsx
// Resize handle on column header
<th style={{ width: columnWidths[column.key] }}>
  {column.label}
  <div
    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400"
    onMouseDown={(e) => handleResizeStart(e, column.key)}
    onClick={(e) => e.stopPropagation()}
  />
</th>
```

### Full Implementation

```jsx
const ResizableTable = () => {
  const [columnWidths, setColumnWidths] = useState({
    name: 200,
    email: 250,
    status: 120,
    actions: 100
  })
  const [resizingColumn, setResizingColumn] = useState(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  const handleResizeStart = (e, columnKey) => {
    setResizingColumn(columnKey)
    setResizeStartX(e.clientX)
    setResizeStartWidth(columnWidths[columnKey] || 200)
  }

  const handleResizeMove = (e) => {
    if (!resizingColumn) return
    
    const diff = e.clientX - resizeStartX
    const newWidth = Math.max(100, resizeStartWidth + diff)  // Min 100px
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }))
  }

  const handleResizeEnd = () => {
    setResizingColumn(null)
  }

  // Attach mouse move/up listeners when resizing
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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('tableColumnWidths', JSON.stringify(columnWidths))
  }, [columnWidths])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tableColumnWidths')
    if (saved) {
      setColumnWidths(JSON.parse(saved))
    }
  }, [])

  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th
              key={column.key}
              className="relative px-6 py-3"
              style={{ width: columnWidths[column.key] }}
            >
              {column.label}

              {/* Resize handle */}
              {column.key !== 'actions' && (
                <div
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
                  onMouseDown={(e) => handleResizeStart(e, column.key)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </th>
          ))}
        </tr>
      </thead>
    </table>
  )
}
```

### Minimum Width Enforcement

```jsx
const handleResizeMove = (e) => {
  if (!resizingColumn) return
  
  const diff = e.clientX - resizeStartX
  const newWidth = Math.max(
    100,  // Minimum width
    Math.min(
      800,  // Maximum width (optional)
      resizeStartWidth + diff
    )
  )
  
  setColumnWidths(prev => ({
    ...prev,
    [resizingColumn]: newWidth
  }))
}
```

### Common Mistakes

❌ **Don't allow columns to collapse:**
```jsx
// BAD - No minimum width
const newWidth = resizeStartWidth + diff  // Can go negative!
```

✅ **Do enforce minimum width:**
```jsx
// GOOD - Never smaller than 100px
const newWidth = Math.max(100, resizeStartWidth + diff)
```

❌ **Don't forget to persist:**
```jsx
// BAD - Widths reset on page reload
const [columnWidths, setColumnWidths] = useState(defaultWidths)
// No localStorage
```

✅ **Do save to localStorage:**
```jsx
// GOOD - Persists user preferences
useEffect(() => {
  localStorage.setItem('tableColumnWidths', JSON.stringify(columnWidths))
}, [columnWidths])
```

### Testing

```javascript
describe('Column Resizing', () => {
  it('resizes column on drag', () => {
    const { container } = render(<ResizableTable />)
    const resizeHandle = container.querySelector('.cursor-col-resize')
    
    fireEvent.mouseDown(resizeHandle, { clientX: 100 })
    fireEvent.mouseMove(document, { clientX: 150 })
    fireEvent.mouseUp(document)
    
    const column = container.querySelector('th')
    expect(column.style.width).toBe('250px') // 200 + 50
  })

  it('enforces minimum width', () => {
    const { container } = render(<ResizableTable />)
    const resizeHandle = container.querySelector('.cursor-col-resize')
    
    fireEvent.mouseDown(resizeHandle, { clientX: 200 })
    fireEvent.mouseMove(document, { clientX: 0 })  // Try to make it tiny
    fireEvent.mouseUp(document)
    
    const column = container.querySelector('th')
    expect(parseInt(column.style.width)).toBeGreaterThanOrEqual(100)
  })

  it('persists widths to localStorage', () => {
    const { container } = render(<ResizableTable />)
    const resizeHandle = container.querySelector('.cursor-col-resize')
    
    fireEvent.mouseDown(resizeHandle, { clientX: 100 })
    fireEvent.mouseMove(document, { clientX: 150 })
    fireEvent.mouseUp(document)
    
    const saved = JSON.parse(localStorage.getItem('tableColumnWidths'))
    expect(saved.name).toBe(250)
  })
})
```

---

## §19.5: Column Reordering Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.5

### Quick Start

```jsx
// Draggable column header
<th
  draggable
  onDragStart={(e) => handleDragStart(e, column.key)}
  onDragOver={handleDragOver}
  onDrop={(e) => handleDrop(e, column.key)}
>
  <Bars3Icon className="h-4 w-4 text-gray-400 cursor-move" />
  {column.label}
</th>
```

### Full Implementation

```jsx
const ReorderableTable = () => {
  const [columnOrder, setColumnOrder] = useState(['name', 'email', 'status', 'role'])
  const [draggedColumn, setDraggedColumn] = useState(null)

  const handleDragStart = (e, columnKey) => {
    setDraggedColumn(columnKey)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('tableColumnOrder', JSON.stringify(columnOrder))
  }, [columnOrder])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tableColumnOrder')
    if (saved) {
      setColumnOrder(JSON.parse(saved))
    }
  }, [])

  return (
    <table>
      <thead>
        <tr>
          {columnOrder.map(colKey => {
            const column = columns.find(c => c.key === colKey)
            return (
              <th
                key={colKey}
                draggable
                onDragStart={(e) => handleDragStart(e, colKey)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colKey)}
                className={`cursor-move ${draggedColumn === colKey ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Bars3Icon className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span>{column.label}</span>
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            {columnOrder.map(colKey => (
              <td key={colKey}>{item[colKey]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Separating Drag and Sort Events

**CRITICAL:** When columns are BOTH draggable AND sortable:

```jsx
<th draggable onDragStart={...} onDragOver={...} onDrop={...} className="cursor-move">
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        {/* Drag handle - NOT sortable */}
        <Bars3Icon
          className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
          title="Drag to reorder"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Sortable area - SEPARATE from drag handle */}
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            if (column.sortable) handleSort(column.key)
          }}
        >
          <div>{column.label}</div>
          {isSorted && <ChevronUpIcon className="h-4 w-4 text-indigo-600" />}
        </div>
      </div>
      
      {/* Column filter input below */}
      {column.searchable && (
        <input
          type="text"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleFilter(column.key, e.target.value)}
        />
      )}
    </div>
  </div>
</th>
```

### Common Mistakes

❌ **Don't mix drag and click events:**
```jsx
// BAD - Clicking drag handle triggers sort
<th onClick={handleSort}>
  <Bars3Icon />  {/* Clicking icon also sorts! */}
  {column.label}
</th>
```

✅ **Do separate event handlers:**
```jsx
// GOOD - Drag handle and sort area separated
<th>
  <Bars3Icon onClick={(e) => e.stopPropagation()} />
  <div onClick={handleSort}>{column.label}</div>
</th>
```

❌ **Don't forget visual feedback:**
```jsx
// BAD - No indication which column is being dragged
<th draggable onDragStart={...}>
```

✅ **Do highlight dragged column:**
```jsx
// GOOD - Shows what's being moved
<th 
  draggable 
  className={draggedColumn === colKey ? 'bg-indigo-100' : ''}
>
```

### Testing

```javascript
describe('Column Reordering', () => {
  it('reorders columns on drag and drop', () => {
    const { getAllByRole } = render(<ReorderableTable />)
    const headers = getAllByRole('columnheader')
    
    fireEvent.dragStart(headers[0])
    fireEvent.drop(headers[2])
    
    const newHeaders = getAllByRole('columnheader')
    expect(newHeaders[0].textContent).not.toBe(headers[0].textContent)
  })

  it('persists column order to localStorage', () => {
    const { getAllByRole } = render(<ReorderableTable />)
    const headers = getAllByRole('columnheader')
    
    fireEvent.dragStart(headers[0])
    fireEvent.drop(headers[2])
    
    const saved = JSON.parse(localStorage.getItem('tableColumnOrder'))
    expect(saved).toEqual(['email', 'status', 'name', 'role'])
  })

  it('separates drag from sort events', () => {
    const handleSort = jest.fn()
    const { container } = render(<TableHeader column={...} onSort={handleSort} />)
    
    const dragHandle = container.querySelector('.bars-3-icon')
    fireEvent.click(dragHandle)
    
    expect(handleSort).not.toHaveBeenCalled()  // Drag handle doesn't trigger sort
  })
})
```

---

## §19.5A: Column Visibility Toggle Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.5A

### Quick Start

```jsx
// Column visibility button
<button onClick={() => setShowColumnPicker(!showColumnPicker)}>
  <EyeIcon className="h-4 w-4" />
  <span>Columns</span>
</button>

// Dropdown with checkboxes
{showColumnPicker && (
  <div className="absolute z-20 mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2">
    {columns.map(column => (
      <label key={column.key} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
        <input
          type="checkbox"
          checked={visibleColumns[column.key]}
          onChange={() => handleToggleColumn(column.key)}
        />
        <span>{column.label}</span>
      </label>
    ))}
  </div>
)}
```

### Full Implementation

```jsx
const TableWithColumnVisibility = () => {
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    status: true,
    role: false,  // Hidden by default
    actions: true  // Always visible
  })
  const [showColumnPicker, setShowColumnPicker] = useState(false)

  const columns = [
    { key: 'select', label: '', searchable: false },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'actions', label: 'Actions', searchable: false }
  ]

  const handleToggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  // Persist to localStorage
  useEffect(() => {
    const state = {
      columnWidths,
      columnOrder,
      visibleColumns,  // Save visibility state
      sortConfig
    }
    localStorage.setItem('tableState', JSON.stringify(state))
  }, [columnWidths, columnOrder, visibleColumns, sortConfig])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tableState')
    if (saved) {
      const state = JSON.parse(saved)
      setVisibleColumns(state.visibleColumns || defaultVisibleColumns)
    }
  }, [])

  return (
    <div>
      {/* Toolbar with column visibility button */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          {/* Search */}
        </div>

        <div className="flex items-center gap-2">
          {/* Column visibility toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
              <span className="text-sm">Columns</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            {/* Dropdown */}
            {showColumnPicker && (
              <div className="absolute right-0 z-20 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[200px]">
                {columns.filter(c => c.key !== 'actions' && c.key !== 'select').map(column => (
                  <label
                    key={column.key}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.key]}
                      onChange={() => handleToggleColumn(column.key)}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{column.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table - render only visible columns */}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
              const column = columns.find(c => c.key === colKey)
              return (
                <th key={colKey}>
                  {column.label}
                </th>
              )
            })}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td><input type="checkbox" /></td>
              {columnOrder.filter(key => visibleColumns[key]).map(colKey => (
                <td key={colKey}>{item[colKey]}</td>
              ))}
              <td>{/* Actions */}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Using Headless UI Menu

```jsx
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

<Menu as="div" className="relative inline-block text-left">
  <MenuButton className="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
    <EyeIcon className="h-5 w-5" />
    Columns
  </MenuButton>

  <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
    {columns.filter(c => c.key !== 'actions').map(column => (
      <MenuItem key={column.key}>
        {({ focus }) => (
          <button
            onClick={() => handleToggleColumn(column.key)}
            className={`${
              focus ? 'bg-gray-100 dark:bg-gray-700' : ''
            } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
          >
            <input
              type="checkbox"
              checked={visibleColumns[column.key]}
              onChange={() => {}}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-3">{column.label}</span>
          </button>
        )}
      </MenuItem>
    ))}
  </MenuItems>
</Menu>
```

### Common Mistakes

❌ **Don't hide actions column:**
```jsx
// BAD - User can't perform actions
{columns.map(column => (
  <label key={column.key}>
    <input checked={visibleColumns[column.key]} />  {/* Includes actions! */}
    {column.label}
  </label>
))}
```

✅ **Do always show actions:**
```jsx
// GOOD - Filter out actions from picker
{columns.filter(c => c.key !== 'actions').map(column => (
  <label key={column.key}>
    <input checked={visibleColumns[column.key]} />
    {column.label}
  </label>
))}
```

❌ **Don't forget to persist:**
```jsx
// BAD - Visibility resets on reload
const [visibleColumns, setVisibleColumns] = useState(defaults)
// No localStorage
```

✅ **Do save visibility state:**
```jsx
// GOOD - Preserves user preferences
useEffect(() => {
  localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns))
}, [visibleColumns])
```

### Testing

```javascript
describe('Column Visibility', () => {
  it('toggles column visibility', () => {
    const { getByText, queryByText, getByLabelText } = render(<TableWithColumnVisibility />)
    
    expect(getByText('Email')).toBeInTheDocument()
    
    const checkbox = getByLabelText('Email')
    fireEvent.click(checkbox)
    
    expect(queryByText('Email')).not.toBeInTheDocument()
  })

  it('persists visibility preferences', () => {
    const { getByLabelText } = render(<TableWithColumnVisibility />)
    
    fireEvent.click(getByLabelText('Email'))
    
    const saved = JSON.parse(localStorage.getItem('tableState'))
    expect(saved.visibleColumns.email).toBe(false)
  })

  it('always shows actions column', () => {
    const { queryByLabelText } = render(<TableWithColumnVisibility />)
    
    // Actions column should not appear in visibility picker
    expect(queryByLabelText('Actions')).not.toBeInTheDocument()
  })
})
```

---

## §19.9: Row Selection Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.9

### Quick Start

```jsx
// Selection checkbox in first column
<td className="px-2 py-3 w-8 text-center">
  <input
    type="checkbox"
    checked={selectedItems.has(item.id)}
    onChange={() => handleToggleSelection(item.id)}
    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
  />
</td>

// Bulk action buttons when items selected
{selectedItems.size > 0 && (
  <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
    <span>{selectedItems.size} selected</span>
    <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">
      Delete Selected
    </button>
  </div>
)}
```

### Full Implementation

```jsx
const TableWithSelection = () => {
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [data, setData] = useState([...])

  // Toggle single item
  const handleToggleSelection = (itemId) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  // Select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(filteredData.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedItems.size} items?`)) return

    try {
      await deleteBulk(Array.from(selectedItems))
      setData(prev => prev.filter(item => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
      toast.success('Items deleted successfully')
    } catch (error) {
      toast.error('Failed to delete items')
    }
  }

  const allSelected = filteredData.length > 0 && selectedItems.size === filteredData.length

  return (
    <div>
      {/* Bulk actions when items selected */}
      {selectedItems.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {selectedItems.size} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedItems(new Set())}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            Clear Selection
          </button>
        </div>
      )}

      <table>
        <thead>
          <tr>
            {/* Select all checkbox - NEVER draggable, fixed width, centered */}
            <th className="relative px-2 py-3 w-8 text-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                checked={allSelected}
                onChange={handleSelectAll}
              />
            </th>
            {/* Other columns */}
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr
              key={item.id}
              className={`transition-colors duration-150 ${
                selectedItems.has(item.id)
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {/* Row checkbox - matches header styling */}
              <td className="px-2 py-3 w-8 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  checked={selectedItems.has(item.id)}
                  onChange={() => handleToggleSelection(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              {/* Other cells */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Selection Column Rules

**CRITICAL requirements for selection column:**

```jsx
// ✅ CORRECT - Selection column
<th className="relative px-2 py-3 w-8 text-center">  {/* Minimal padding, fixed width, centered */}
  <input
    type="checkbox"
    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"  // NO h-/w- classes
    checked={allSelected}
    onChange={handleSelectAll}
  />
</th>

// ❌ WRONG - Common mistakes
<th draggable className="px-6 py-4">  {/* DON'T: make draggable, use large padding */}
  <input type="checkbox" className="h-5 w-5" />  {/* DON'T: explicit size classes */}
</th>
```

**Rules:**
- ✅ **ALWAYS first column** (leftmost)
- ✅ **NEVER sortable** (no click handler, no chevrons)
- ✅ **NEVER draggable** (exclude from reordering)
- ✅ **NEVER resizable** (fixed `w-8`)
- ✅ **ALWAYS visible** (not in column visibility toggle)
- ✅ **Minimal padding:** `px-2 py-3` (save space)
- ✅ **Centered:** `text-center` (CRITICAL for alignment)
- ✅ **Checkbox NO size classes** (browser default ~16px)

### Inline Bulk Actions Pattern

Alternative to separate row: show bulk actions inline with toolbar

```jsx
<div className="mb-4 flex items-center justify-between gap-4" style={{ minHeight: '44px' }}>
  {/* LEFT: Global search */}
  <div className="flex-1">
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search..."
        value={globalSearch}
        onChange={(e) => setGlobalSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg"
      />
    </div>
  </div>

  {/* RIGHT: Action buttons */}
  <div className="flex items-center gap-2">
    {/* Bulk actions (CONDITIONAL - only when items selected) */}
    {selectedItems.size > 0 && (
      <>
        <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {selectedItems.size} selected
        </span>
        <button
          onClick={handleBulkDelete}
          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm whitespace-nowrap"
        >
          Delete Selected
        </button>
        <button
          onClick={() => setSelectedItems(new Set())}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm whitespace-nowrap"
        >
          Clear Selection
        </button>
      </>
    )}

    {/* Other buttons */}
    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
      New Item
    </button>
    <button className="px-3 py-2 bg-gray-200 rounded-lg">
      <EyeIcon className="h-5 w-5" />
    </button>
  </div>
</div>
```

### Common Mistakes

❌ **Don't use large checkboxes:**
```jsx
// BAD - Wastes horizontal space
<input type="checkbox" className="h-5 w-5" />
```

✅ **Do use browser default size:**
```jsx
// GOOD - Small but visible, efficient
<input type="checkbox" className="rounded border-gray-300 text-indigo-600" />
```

❌ **Don't make selection column draggable:**
```jsx
// BAD - Selection column should be locked first
<th draggable onDragStart={...}>
  <input type="checkbox" />
</th>
```

✅ **Do keep selection column fixed:**
```jsx
// GOOD - Never draggable, always first
<th className="px-2 py-3 w-8">  {/* No draggable attribute */}
  <input type="checkbox" />
</th>
```

### Testing

```javascript
describe('Row Selection', () => {
  it('selects individual rows', () => {
    const { getAllByRole } = render(<TableWithSelection data={testData} />)
    const checkboxes = getAllByRole('checkbox')
    
    fireEvent.click(checkboxes[1])  // Select first data row
    
    expect(checkboxes[1].checked).toBe(true)
  })

  it('selects all rows with header checkbox', () => {
    const { getAllByRole } = render(<TableWithSelection data={testData} />)
    const checkboxes = getAllByRole('checkbox')
    
    fireEvent.click(checkboxes[0])  // Select all
    
    checkboxes.slice(1).forEach(checkbox => {
      expect(checkbox.checked).toBe(true)
    })
  })

  it('shows bulk actions when items selected', () => {
    const { getAllByRole, getByText } = render(<TableWithSelection data={testData} />)
    
    fireEvent.click(getAllByRole('checkbox')[1])
    
    expect(getByText(/1 selected/)).toBeInTheDocument()
    expect(getByText('Delete Selected')).toBeInTheDocument()
  })

  it('clears selection after bulk delete', async () => {
    const { getAllByRole, getByText } = render(<TableWithSelection data={testData} />)
    
    fireEvent.click(getAllByRole('checkbox')[1])
    fireEvent.click(getByText('Delete Selected'))
    
    await waitFor(() => {
      expect(getAllByRole('checkbox')[0].checked).toBe(false)
    })
  })
})
```

---

## §19.11A: Standardized Toolbar Layout Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.11A

### Quick Start

```jsx
// Standard toolbar layout
<div className="mb-4 flex items-center justify-between gap-4">
  {/* LEFT: Global search (extends to buttons) */}
  <div className="flex-1">
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2" />
    </div>
  </div>

  {/* RIGHT: Action buttons (specific order) */}
  <div className="flex items-center gap-2">
    <button>New Item</button>
    <button><EyeIcon /></button>
    <button><ArrowDownTrayIcon /></button>
  </div>
</div>
```

### Full Implementation

```jsx
const StandardToolbar = () => {
  const [globalSearch, setGlobalSearch] = useState('')
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  return (
    <div>
      {/* Table Toolbar - RULE #19.11A */}
      <div className="mb-4 flex items-center justify-between gap-4">
        {/* LEFT SIDE: Global Search - extends to first button */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Action buttons (aligned right, specific order) */}
        <div className="flex items-center gap-2">
          {/* 1. New [Entity] Button (if applicable) */}
          <button
            onClick={handleNewItem}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Contact
          </button>

          {/* 2. Column Visibility Toggle (ALWAYS include) */}
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            title="Toggle columns"
          >
            <EyeIcon className="h-5 w-5" />
          </button>

          {/* 3. Export Button (if applicable) */}
          {hasExportFeature && (
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title="Export data"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          )}

          {/* 4. Import Button (if applicable) */}
          {hasImportFeature && (
            <button
              onClick={handleImport}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title="Import data"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table>{/* ... */}</table>
    </div>
  )
}
```

### Button Order Examples

**Contacts table:**
```
[Global Search................................] [New Contact] [Column] [Export] [Import]
```

**Commands table (no import/export):**
```
[Global Search................................] [New Command] [Column]
```

**Read-only table:**
```
[Global Search................................] [Column] [Export]
```

### With Edit/Save Buttons

When table has inline editing:

```jsx
<div className="mb-4 flex items-center justify-between gap-4">
  {/* LEFT: Search */}
  <div className="flex-1">
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2" />
    </div>
  </div>

  {/* RIGHT: Buttons */}
  <div className="flex items-center gap-2">
    {/* Edit/Save/Reset (FIRST on right side) */}
    {isEditing ? (
      <>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
          <CheckIcon className="h-5 w-5 inline mr-2" />
          Save
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg">
          <XMarkIcon className="h-5 w-5 inline mr-2" />
          Cancel
        </button>
      </>
    ) : (
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
        <PencilIcon className="h-5 w-5 inline mr-2" />
        Edit
      </button>
    )}

    {/* New Item */}
    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
      <PlusIcon className="h-5 w-5 inline mr-2" />
      New Contact
    </button>

    {/* Column Visibility */}
    <button className="px-3 py-2 bg-gray-200 rounded-lg">
      <EyeIcon className="h-5 w-5" />
    </button>
  </div>
</div>
```

### Common Mistakes

❌ **Don't constrain search width:**
```jsx
// BAD - Search doesn't extend to buttons
<div className="max-w-md">
  <input type="text" placeholder="Search..." />
</div>
```

✅ **Do use flex-1:**
```jsx
// GOOD - Search extends to buttons
<div className="flex-1">
  <input type="text" placeholder="Search..." />
</div>
```

❌ **Don't put Edit buttons above toolbar:**
```jsx
// BAD - Separate row above
<div className="mb-2">
  <button>Edit</button>
</div>
<div className="mb-4 flex">
  <input type="text" />
  <button>New Item</button>
</div>
```

✅ **Do put Edit buttons inline:**
```jsx
// GOOD - Same horizontal row
<div className="mb-4 flex items-center justify-between">
  <div className="flex-1"><input /></div>
  <div className="flex gap-2">
    <button>Edit</button>
    <button>New Item</button>
  </div>
</div>
```

### Testing

```javascript
describe('Standardized Toolbar', () => {
  it('renders buttons in correct order', () => {
    const { container } = render(<StandardToolbar />)
    const buttons = container.querySelectorAll('button')
    
    expect(buttons[0].textContent).toContain('New Contact')
    expect(buttons[1].querySelector('svg')).toHaveClass('eye-icon')
    expect(buttons[2].querySelector('svg')).toHaveClass('arrow-down-tray-icon')
  })

  it('search bar extends to buttons', () => {
    const { container } = render(<StandardToolbar />)
    const searchWrapper = container.querySelector('.flex-1')
    
    expect(searchWrapper).toBeTruthy()
    expect(searchWrapper.querySelector('input')).toBeTruthy()
  })

  it('maintains same height for all buttons', () => {
    const { container } = render(<StandardToolbar />)
    const buttons = container.querySelectorAll('button')
    
    const heights = Array.from(buttons).map(btn => btn.offsetHeight)
    const allSameHeight = heights.every(h => h === heights[0])
    
    expect(allSameHeight).toBe(true)
  })
})
```

---

## §19.13: State Persistence Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.13

### Quick Start

```jsx
// Save to localStorage
useEffect(() => {
  localStorage.setItem('contactsTableState', JSON.stringify({ columnWidths, columnOrder }))
}, [columnWidths, columnOrder])

// Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem('contactsTableState')
  if (saved) {
    const state = JSON.parse(saved)
    setColumnWidths(state.columnWidths || defaults)
  }
}, [])
```

### Full Implementation

```jsx
const TableWithPersistence = () => {
  const TABLE_STATE_KEY = 'contactsTableState'

  // Default state
  const defaultState = {
    columnWidths: {
      name: 200,
      email: 250,
      status: 120,
      role: 150,
      actions: 100
    },
    columnOrder: ['name', 'email', 'status', 'role'],
    visibleColumns: {
      name: true,
      email: true,
      status: true,
      role: true
    },
    sortConfig: {
      key: null,
      direction: null
    }
  }

  // State with localStorage initialization
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem(TABLE_STATE_KEY)
    return saved ? JSON.parse(saved).columnWidths : defaultState.columnWidths
  })

  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem(TABLE_STATE_KEY)
    return saved ? JSON.parse(saved).columnOrder : defaultState.columnOrder
  })

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(TABLE_STATE_KEY)
    return saved ? JSON.parse(saved).visibleColumns : defaultState.visibleColumns
  })

  const [sortConfig, setSortConfig] = useState(() => {
    const saved = localStorage.getItem(TABLE_STATE_KEY)
    return saved ? JSON.parse(saved).sortConfig : defaultState.sortConfig
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const state = {
        columnWidths,
        columnOrder,
        visibleColumns,
        sortConfig
      }
      localStorage.setItem(TABLE_STATE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save table state:', error)
    }
  }, [columnWidths, columnOrder, visibleColumns, sortConfig])

  // Reset to defaults
  const handleResetTable = () => {
    setColumnWidths(defaultState.columnWidths)
    setColumnOrder(defaultState.columnOrder)
    setVisibleColumns(defaultState.visibleColumns)
    setSortConfig(defaultState.sortConfig)
    localStorage.removeItem(TABLE_STATE_KEY)
  }

  return (
    <div>
      {/* Reset button */}
      <button onClick={handleResetTable} className="text-sm text-gray-600 hover:text-gray-800">
        Reset Table Layout
      </button>

      <table>{/* ... */}</table>
    </div>
  )
}
```

### Safe localStorage Access

```jsx
const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('localStorage save failed:', error)
    // Handle quota exceeded, privacy mode, etc.
  }
}

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (error) {
    console.error('localStorage load failed:', error)
    return defaultValue
  }
}

// Usage
const [columnWidths, setColumnWidths] = useState(() =>
  loadFromLocalStorage('tableState', defaultWidths)
)

useEffect(() => {
  saveToLocalStorage('tableState', columnWidths)
}, [columnWidths])
```

### Unique Storage Keys

```jsx
// ✅ GOOD - Page/feature specific keys
const CONTACTS_TABLE_STATE = 'contactsTableState'
const PO_TABLE_STATE = 'poTableState'
const JOBS_TABLE_STATE = 'jobsTableState'

// ❌ BAD - Generic keys that could collide
const TABLE_STATE = 'tableState'  // Which table?
```

### Common Mistakes

❌ **Don't use generic keys:**
```jsx
// BAD - Collision risk
localStorage.setItem('tableState', JSON.stringify(state))
```

✅ **Do use specific keys:**
```jsx
// GOOD - Unique per table
localStorage.setItem('contactsTableState', JSON.stringify(state))
```

❌ **Don't forget error handling:**
```jsx
// BAD - Can crash in privacy mode
const saved = JSON.parse(localStorage.getItem('key'))
```

✅ **Do wrap in try/catch:**
```jsx
// GOOD - Gracefully handles errors
try {
  const saved = JSON.parse(localStorage.getItem('key'))
} catch (error) {
  console.error('Failed to load:', error)
}
```

### Testing

```javascript
describe('State Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves state to localStorage on change', () => {
    const { rerender } = render(<TableWithPersistence />)
    
    // Simulate state change
    fireEvent.click(screen.getByText('Resize'))
    
    const saved = JSON.parse(localStorage.getItem('contactsTableState'))
    expect(saved.columnWidths).toBeDefined()
  })

  it('loads state from localStorage on mount', () => {
    const mockState = {
      columnWidths: { name: 300 },
      columnOrder: ['name', 'email']
    }
    localStorage.setItem('contactsTableState', JSON.stringify(mockState))
    
    const { container } = render(<TableWithPersistence />)
    const nameColumn = container.querySelector('th[data-key="name"]')
    
    expect(nameColumn.style.width).toBe('300px')
  })

  it('resets to defaults when requested', () => {
    localStorage.setItem('contactsTableState', JSON.stringify({ columnWidths: { name: 999 } }))
    
    const { getByText, container } = render(<TableWithPersistence />)
    
    fireEvent.click(getByText('Reset Table Layout'))
    
    const nameColumn = container.querySelector('th[data-key="name"]')
    expect(nameColumn.style.width).toBe('200px')  // Default
    expect(localStorage.getItem('contactsTableState')).toBeNull()
  })
})
```

---

## §19.15: Dark Mode Implementation

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.15

### Quick Start

```jsx
// Header with dark mode
<thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

// Body with dark mode
<tbody className="bg-white dark:bg-gray-800">

// Text with dark mode
<span className="text-gray-900 dark:text-white">Name</span>
```

### Full Implementation

```jsx
const DarkModeTable = () => {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition">
              New Item
            </button>
            <button className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              <EyeIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="border-collapse w-full">
          {/* Header */}
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                John Doe
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                john@example.com
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                  Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### Dark Mode Color Reference

```jsx
// Backgrounds
className="bg-white dark:bg-gray-800"              // Main surfaces
className="bg-gray-50 dark:bg-gray-900"            // Subtle backgrounds
className="bg-gray-100 dark:bg-gray-800"           // Headers, cards

// Borders
className="border-gray-200 dark:border-gray-700"   // Standard borders
className="border-gray-300 dark:border-gray-600"   // Input borders

// Text
className="text-gray-900 dark:text-white"          // Primary text
className="text-gray-600 dark:text-gray-400"       // Secondary text
className="text-gray-500 dark:text-gray-400"       // Tertiary text
className="text-gray-400 dark:text-gray-500"       // Placeholder/icon text

// Hover states
className="hover:bg-gray-50 dark:hover:bg-gray-800/50"    // Row hover
className="hover:bg-gray-100 dark:hover:bg-gray-700"      // Button hover

// Status badges (already support dark mode)
className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"  // Success
className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"          // Error
className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"  // Warning
className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"      // Info

// Accent colors (indigo - same in both modes)
className="bg-indigo-600 hover:bg-indigo-700"      // Primary buttons
className="text-indigo-600 dark:text-indigo-400"   // Links, active states
className="border-indigo-200 dark:border-indigo-800"  // Accent borders
```

### Form Inputs Dark Mode

```jsx
// Text input
<input
  type="text"
  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
/>

// Select dropdown
<select className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
  <option>Option 1</option>
</select>

// Checkbox
<input
  type="checkbox"
  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
/>
```

### Common Mistakes

❌ **Don't forget dark mode on new elements:**
```jsx
// BAD - Only light mode
<div className="bg-white border-gray-200">
  <span className="text-gray-900">Text</span>
</div>
```

✅ **Do add dark mode classes:**
```jsx
// GOOD - Both modes
<div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <span className="text-gray-900 dark:text-white">Text</span>
</div>
```

❌ **Don't use pure white/black:**
```jsx
// BAD - Harsh contrast
<div className="bg-white dark:bg-black text-black dark:text-white">
```

✅ **Do use gray tones:**
```jsx
// GOOD - Softer, more comfortable
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

### Testing

```javascript
describe('Dark Mode', () => {
  it('applies dark mode classes when dark mode active', () => {
    document.documentElement.classList.add('dark')
    
    const { container } = render(<DarkModeTable />)
    const table = container.querySelector('table')
    
    const computedStyle = window.getComputedStyle(table)
    // Should have dark background when dark class present
    expect(computedStyle.backgroundColor).not.toBe('rgb(255, 255, 255)')
    
    document.documentElement.classList.remove('dark')
  })

  it('renders all interactive elements with dark mode support', () => {
    const { container } = render(<DarkModeTable />)
    
    const inputs = container.querySelectorAll('input, select, button')
    inputs.forEach(element => {
      expect(element.className).toMatch(/dark:/)
    })
  })
})
```

---

## §19.21: Form Standards Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.21

### Quick Start

```jsx
// Standard form in modal
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
    <button type="button" onClick={onClose}>Cancel</button>
    <button type="submit">Save</button>
  </div>
</form>
```

### Full Implementation

```jsx
const ContactForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    email: '',
    phone: '',
    status: 'active'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div>
        <label 
          htmlFor="name" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
            errors.name
              ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
            errors.email
              ? 'border-red-300 dark:border-red-600'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone field (optional) */}
      <div>
        <label 
          htmlFor="phone" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="(optional)"
        />
      </div>

      {/* Status select */}
      <div>
        <label 
          htmlFor="status" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">
            {errors.submit}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </form>
  )
}
```

### Input Component Pattern

```jsx
// Reusable input component
const FormInput = ({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false, 
  placeholder 
}) => {
  return (
    <div>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label} {required && '*'}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
          error
            ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-300'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

// Usage
<FormInput
  id="name"
  label="Name"
  value={formData.name}
  onChange={(value) => handleChange('name', value)}
  error={errors.name}
  required
/>
```

### Common Mistakes

❌ **Don't forget htmlFor:**
```jsx
// BAD - Label not associated with input
<label>Name</label>
<input type="text" />
```

✅ **Do use htmlFor + id:**
```jsx
// GOOD - Proper association
<label htmlFor="name">Name</label>
<input type="text" id="name" />
```

❌ **Don't submit without validation:**
```jsx
// BAD - No validation
const handleSubmit = (e) => {
  e.preventDefault()
  onSubmit(formData)
}
```

✅ **Do validate before submit:**
```jsx
// GOOD - Validate first
const handleSubmit = (e) => {
  e.preventDefault()
  if (!validateForm()) return
  onSubmit(formData)
}
```

### Testing

```javascript
describe('Form Standards', () => {
  it('validates required fields', () => {
    const { getByText, getByLabelText } = render(<ContactForm />)
    
    fireEvent.click(getByText('Save'))
    
    expect(getByText('Name is required')).toBeInTheDocument()
    expect(getByText('Email is required')).toBeInTheDocument()
  })

  it('shows loading state on submit', async () => {
    const { getByText, getByLabelText } = render(<ContactForm onSubmit={mockSubmit} />)
    
    fireEvent.change(getByLabelText('Name'), { target: { value: 'John' } })
    fireEvent.change(getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.click(getByText('Save'))
    
    expect(getByText('Saving...')).toBeInTheDocument()
  })

  it('clears error when user types', () => {
    const { getByText, getByLabelText, queryByText } = render(<ContactForm />)
    
    fireEvent.click(getByText('Save'))  // Trigger validation
    expect(getByText('Name is required')).toBeInTheDocument()
    
    fireEvent.change(getByLabelText('Name'), { target: { value: 'John' } })
    
    expect(queryByText('Name is required')).not.toBeInTheDocument()
  })
})
```

---

## Contributing to Chapter 19

When implementing table features or UI patterns:

1. ✅ Follow Bible rules exactly (this chapter shows HOW)
2. ✅ Use code examples as templates
3. ✅ Test with dark mode enabled
4. ✅ Verify persistence works across page reloads
5. ✅ Check responsive behavior on mobile
6. ✅ Update Bible Chapter 19 if discovering new patterns
7. ✅ Document bugs in Lexicon Chapter 19

**Remember:** Bible has the RULES, this document has the IMPLEMENTATIONS.

