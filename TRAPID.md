# Claude Code Instructions for Trapid Project

## 🔴 READ THESE FIRST

Before doing ANY work on this project, **fetch documentation from the live database API**:

### 🌐 Unified Documentation API
**Base URL:** `https://trapid-backend-447058022b51.herokuapp.com/api/v1/trinity`

### 📖 Bible (RULES) - ABSOLUTE AUTHORITY
**API:** `/api/v1/trinity?category=bible`
- Fetch all Bible rules from unified database
- Always up-to-date, no export needed
- Contains: MUST/NEVER/ALWAYS rules, protected patterns, config values
- Entry types: MUST, NEVER, ALWAYS, PROTECTED, CONFIG, rule

### 🔧 Teacher (HOW-TO) - Implementation Patterns
**API:** `/api/v1/trinity?category=teacher`
- Fetch all Teacher entries from unified database
- Full code examples, step-by-step guides
- Entry types: component, feature, util, hook, integration, optimization

### 📕 Lexicon (KNOWLEDGE) - Bug History & Architecture
**API:** `/api/v1/trinity?category=lexicon`
- Fetch all Lexicon entries from unified database
- Bug discoveries, architecture decisions, performance notes
- Entry types: bug, architecture, test, performance, dev_note, common_issue

### 📘 User Manual (END-USER GUIDES)
**File:** [TRAPID_USER_MANUAL.md](TRAPID_DOCS/TRAPID_USER_MANUAL.md) - (Still markdown-based)

### ⚡ Quick Lookup
**Chapter Guide:** [CHAPTER_GUIDE.md](TRAPID_DOCS/00_INDEX/CHAPTER_GUIDE.md) - Features → chapters

---

## 🚨 IMPORTANT: Always Use Database APIs

**DO NOT read markdown files** (`TRAPID_BIBLE.md`, `TRAPID_TEACHER.md`, `TRAPID_LEXICON.md`) - they are auto-generated exports that may be stale.

**ALWAYS fetch from APIs** to get real-time, up-to-date documentation from the database.

---

## 📚 The Trinity+1 Documentation System

Trapid uses a **four-document system** to separate concerns and eliminate redundancy:

### 📖 Bible (RULES) - `TRAPID_BIBLE.md`
**Who:** Claude Code + Human Developers
**What:** MUST/NEVER/ALWAYS directives only
**Authority:** ABSOLUTE

**Source of Truth:** Database table `trinity` with `category='bible'` (NOT the .md file)
**Exported to:** `TRAPID_BIBLE.md` (auto-generated via `bin/rails trapid:export_bible`)

**Contains:**
- ✅ Coding rules (MUST/NEVER/ALWAYS)
- ✅ Protected code patterns
- ✅ Configuration values that must match
- ✅ Cross-references to Implementation Patterns

**Does NOT contain:**
- ❌ Code examples (see Implementation Patterns)
- ❌ Bug history (see Lexicon)
- ❌ Architecture explanations (see Lexicon)

**Update Workflow:**
1. Go to Trapid app → Documentation page → 📖 Bible
2. Add/edit rules via UI (stores in `trinity` table with `category='bible'`)
3. Run: `bin/rails trapid:export_bible`
4. Commit the updated `TRAPID_BIBLE.md` file

**Example:**
```markdown
## RULE #19.1: Table Type Selection

✅ MUST ask user which table type to use:
1. DataTable.jsx (read-only display)
2. Full advanced table (filters, pagination, edit)

See: TRAPID_TEACHER.md §19.1 for full code examples
```

---

### 🔧 Trapid Teacher (HOW-TO) - `TRAPID_TEACHER.md`
**Who:** Claude Code + Human Developers
**What:** Full code examples and step-by-step guides
**Authority:** REFERENCE (examples, not rules)

**Source of Truth:** Database table `trinity` (NOT the .md file)
**Exported to:** `TRAPID_TEACHER.md` (auto-generated via `bin/rails trapid:export_teacher`)

**Contains:**
- ✅ Full code examples with comments
- ✅ Step-by-step implementation guides
- ✅ Architecture patterns and best practices
- ✅ Common mistakes and how to avoid them
- ✅ Testing strategies
- ✅ Migration guides for refactoring

**Entry Types:** `component`, `feature`, `util`, `hook`, `integration`, `optimization`

**Does NOT contain:**
- ❌ Rules (see Bible)
- ❌ Bug history (see Lexicon)
- ❌ User guides (see User Manual)

**Update Workflow:**
1. Go to Trapid app → Documentation page → 🔧 TRAPID Teacher
2. Add/edit entries via UI (stores in `trinity` table with Teacher entry_type)
3. Run: `bin/rails trapid:export_teacher`
4. Commit the updated `TRAPID_TEACHER.md` file

**Example:**
```markdown
## §19.1: Advanced Table Component Pattern

📖 **Bible Rule:** TRAPID_BIBLE.md RULE #19.1

### Quick Start
```jsx
// Minimal advanced table setup
import AdvancedTable from '@/components/shared/AdvancedTable'

const MyTable = () => (
  <AdvancedTable
    data={items}
    columns={columns}
    onRowClick={handleRowClick}
  />
)
```

### Full Implementation
[... 200 lines of detailed code examples ...]
```

---

### 📕 Lexicon (KNOWLEDGE) - `TRAPID_LEXICON.md`
**Who:** Claude Code + Human Developers
**What:** Bug history, lessons learned, architecture context
**Authority:** REFERENCE (explains WHY rules exist)

**Source of Truth:** Database table `trinity` (NOT the .md file)
**Exported to:** `TRAPID_LEXICON.md` (auto-generated via `bin/rails trapid:export_lexicon`)

**Contains:**
- ✅ Bug discoveries and resolutions
- ✅ Architecture decisions and rationale
- ✅ Performance optimizations
- ✅ Testing strategies
- ✅ Common issues and gotchas
- ✅ Terminology definitions

**Entry Types:** `bug`, `architecture`, `test`, `performance`, `dev_note`, `common_issue`

**Update Workflow:**
1. Go to Trapid app → Documentation page → 📕 TRAPID Lexicon
2. Add/edit entries via UI (stores in `trinity` table with Lexicon entry_type)
3. Run: `bin/rails trapid:export_lexicon`
4. Commit the updated `TRAPID_LEXICON.md` file

---

### 📘 User Manual (END-USER) - `TRAPID_USER_MANUAL.md`
**Who:** End Users (non-technical)
**What:** Step-by-step feature guides
**Authority:** USER-FACING

**Contains:**
- ✅ How to use features (with screenshots)
- ✅ Step-by-step workflows
- ✅ Troubleshooting guides
- ✅ FAQ sections

**Does NOT contain:**
- ❌ Code examples (see Implementation Patterns)
- ❌ Rules for developers (see Bible)
- ❌ Bug history (see Lexicon)

---

## 🎯 When to Use Each Documentation Source

### Scenario 1: Creating a New Table Component

1. **Fetch Bible rules** → `GET /api/v1/trinity?category=bible&chapter=19`
2. **Read RULE #19.1** → Says "ask user which table type"
3. **Ask user** → Get their choice (DataTable vs Advanced)
4. **Fetch Teacher entries** → `GET /api/v1/trinity?category=teacher&chapter=19`
5. **Read §19.1** → Shows full code example
6. **Check Lexicon** → `GET /api/v1/trinity?category=lexicon&chapter=19` for known table bugs
7. **Implement** → Follow Bible rules + Teacher examples

### Scenario 2: Fixing a Gantt Bug

1. **Fetch Lexicon entries** → `GET /api/v1/trinity?category=lexicon&chapter=9`
2. **Search for similar bug** → Filter by title/description
3. **Read bug entry** → Understand root cause and past solutions
4. **Fetch Bible rules** → `GET /api/v1/trinity?category=bible&chapter=9`
5. **Check protected patterns** → Review RULE #9.3, etc.
6. **Fix bug** → Follow Bible rules, learn from Lexicon
7. **Update Lexicon** → Add new bug entry via Trapid UI

### Scenario 3: User Asks "How do I create a job?"

1. **Send them to User Manual** → Chapter 5 (still markdown-based)
2. **If it doesn't work** → Fetch Lexicon: `GET /api/v1/trinity?category=lexicon&chapter=5`
3. **If need to fix code** → Fetch Bible: `GET /api/v1/trinity?category=bible&chapter=5`

### Scenario 4: Adding New Xero Webhook

1. **Fetch Bible rules** → `GET /api/v1/trinity?category=bible&chapter=15`
2. **Review Xero integration rules** → RULE #15.X
3. **Fetch Teacher entries** → `GET /api/v1/trinity?category=teacher&chapter=15`
4. **Read webhook handler examples** → §15.X
5. **Check Lexicon** → `GET /api/v1/trinity?category=lexicon&chapter=15` for known webhook issues
6. **Implement** → Follow Bible rules + Teacher patterns
7. **Test** → Follow testing strategy from Teacher

---

## 🔄 Cross-Reference System

All documents cross-reference each other:

```
📖 Bible RULE #19.1
  → "See TRAPID_TEACHER.md §19.1 for code examples"
  → "See LEXICON Chapter 19 for table bugs"

🔧 Trapid Teacher §19.1
  ← "Bible Rule: TRAPID_BIBLE.md RULE #19.1"
  → "Related Lexicon: Chapter 19 table performance issues"

📕 Lexicon Entry: "Gantt Shaking Bug"
  → "Rule Reference: Bible Chapter 9, RULE #9.3"
  → "Solution Pattern: TRAPID_TEACHER.md §9.3"
```

---

## 📋 Chapter Organization

All four documents use the **same chapter structure** (0-20):

| Ch# | Feature | Example Use Case |
|-----|---------|------------------|
| 0 | System-Wide Rules | API response format, migrations |
| 1 | Authentication | Login, password reset |
| 2 | System Admin | Company settings, timezone |
| 3 | Contacts | Customer/supplier management |
| 4 | Price Books | Supplier pricing, smart lookup |
| 5 | Jobs | Construction project management |
| 6 | Estimates | Quote imports, job matcher |
| 7 | AI Plan Review | Claude/Grok integration |
| 8 | Purchase Orders | PO generation, email parsing |
| 9 | Gantt | Schedule, cascade, dependencies |
| 10 | Tasks | Daily checklists, supervisor tasks |
| 11 | Weather | Rain days, public holidays |
| 12 | OneDrive | File sync, folder creation |
| 13 | Outlook | Email parser, inbox integration |
| 14 | Chat | Messaging, SMS, Twilio |
| 15 | Xero | Accounting sync, invoices |
| 16 | Payments | Invoice matching, financials |
| 17 | Workflows | Automation, triggers |
| 18 | Custom Tables | Spreadsheet-like tables, formulas |
| 19 | UI/UX | Design patterns, dark mode |
| 20 | Agents | Claude Code automation, deployment |

---

## ⚡ Quick Reference

**"I'm fixing a bug"**
1. Fetch Lexicon: `GET /api/v1/trinity?category=lexicon` (has it been seen before?)
2. Fetch Bible: `GET /api/v1/trinity?category=bible` (are there protected patterns?)
3. Fix code following Bible rules
4. Update Lexicon via Trapid UI (database auto-updates)

**"I'm creating a new component"**
1. Fetch Bible rules: `GET /api/v1/trinity?category=bible`
2. Fetch Teacher entries: `GET /api/v1/trinity?category=teacher`
3. Fetch Lexicon: `GET /api/v1/trinity?category=lexicon` for known issues
4. Implement following all three

**"I'm optimizing performance"**
1. Fetch Lexicon: `GET /api/v1/trinity?category=lexicon&entry_type=performance`
2. Fetch Bible: `GET /api/v1/trinity?category=bible` for protected code warnings
3. Fetch Teacher: `GET /api/v1/trinity?category=teacher&entry_type=optimization`
4. Document optimization via Trapid UI

**"User can't use a feature"**
1. Send them to User Manual (still markdown-based)
2. If it's broken, fetch Lexicon: `GET /api/v1/trinity?category=lexicon`
3. If needs fixing, fetch Bible: `GET /api/v1/trinity?category=bible`

---

## 💾 Database-Driven Documentation System

**All three** (Bible, Lexicon, and Teacher) are backed by a unified `documentation_entries` table. The markdown files are auto-generated exports.

### Table Structure: `documentation_entries`

```ruby
# Unified table for Bible, Lexicon, and Teacher entries
create_table :trinity do |t|
  t.string :category, null: false        # bible, lexicon, teacher
  t.integer :chapter_number, null: false  # 0-20
  t.string :chapter_name, null: false
  t.string :section_number               # e.g., "19.1", "19.11A" (optional)
  t.string :title, null: false
  t.string :entry_type, null: false      # Discriminator field
  t.text :description

  # Teacher-specific fields
  t.string :difficulty                   # beginner, intermediate, advanced
  t.text :summary
  t.text :code_example
  t.text :common_mistakes
  t.text :testing_strategy
  t.text :related_rules

  t.timestamps
end

# Indexes
add_index :trinity, :category
add_index :trinity, [:category, :chapter_number]
```

### Entry Types

**Bible Types** (rules):
- `MUST` - Must do this
- `NEVER` - Never do that
- `ALWAYS` - Always check X before Y
- `PROTECTED` - Protected code patterns
- `CONFIG` - Configuration values
- `rule` - General rule

**Lexicon Types** (knowledge/bugs):
- `bug` - Bug discoveries and fixes
- `architecture` - System design decisions
- `test` - Testing approaches and strategies
- `performance` - Performance optimizations
- `dev_note` - Development notes and gotchas
- `common_issue` - Frequently encountered problems

**Teacher Types** (implementation patterns):
- `component` - React component patterns
- `feature` - Feature implementation guides
- `util` - Utility functions and helpers
- `hook` - React hooks and custom hooks
- `integration` - Third-party integrations (Xero, OneDrive, etc.)
- `optimization` - Code optimization patterns

### ActiveRecord Scopes

```ruby
# app/models/trinity.rb
scope :bible_entries, -> { where(category: 'bible') }
scope :lexicon_entries, -> { where(category: 'lexicon') }
scope :teacher_entries, -> { where(category: 'teacher') }
```

### Export Commands

```bash
# Export Lexicon to markdown
bin/rails trapid:export_lexicon

# Export Teacher to markdown
bin/rails trapid:export_teacher

# Both are run automatically when entries are created/updated via UI
```

### Why Database-Driven?

1. **Scalability**: All three (Bible, Lexicon, Teacher) can grow infinitely without file size limits
2. **Searchability**: Database queries are faster than grepping markdown files
3. **UI Management**: Non-technical users can add entries via Trapid app
4. **Version Control**: Markdown exports are still committed to Git for diffs
5. **Single Source of Truth**: Database is authoritative, markdown is generated
6. **Structured Data**: Enforced schema prevents inconsistent formatting
7. **Multi-Agent Safety**: Database prevents concurrent edit conflicts (see below)

---

## 🔒 Multi-Agent Safety: Preventing Concurrent Edit Conflicts

**Problem:** Multiple Claude agents (or agent + human) editing the same markdown file simultaneously = **data loss guaranteed**

**Solution:** All documentation is now database-backed with atomic operations.

### Protected Documentation (Database-Backed)

✅ **SAFE for concurrent edits:**
- **Bible** → `trinity` table → `TRAPID_BIBLE.md` (auto-generated)
- **Lexicon** → `trinity` table (Lexicon types) → `TRAPID_LEXICON.md` (auto-generated)
- **Teacher** → `trinity` table (Teacher types) → `TRAPID_TEACHER.md` (auto-generated)

### How It Works

1. **Agent A** wants to add Bible rule → Creates `Trinity` record in database
2. **Agent B** wants to add different rule → Creates separate `Trinity` record in database
3. **Both succeed** → Database handles concurrency via transactions
4. **Export runs** → Generates complete `TRAPID_BIBLE.md` with both rules

### Update Commands

```bash
# Bible
bin/rails trapid:export_bible

# Lexicon
bin/rails trapid:export_lexicon

# Teacher
bin/rails trapid:export_teacher
```

### ⚠️ User Manual Still At Risk

**TRAPID_USER_MANUAL.md** is NOT database-backed yet. If running multiple agents:
- Coordinate User Manual edits manually
- Consider moving to database in future

---

**When in doubt:** Ask the user for clarification.
