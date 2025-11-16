# Claude Code Instructions for Trapid Project

## 🔴 READ THESE FIRST

Before doing ANY work on this project:

1. **[TRAPID_BIBLE.md](TRAPID_DOCS/TRAPID_BIBLE.md)** - ABSOLUTE AUTHORITY (all RULES)
2. **[IMPLEMENTATION_PATTERNS.md](TRAPID_DOCS/IMPLEMENTATION_PATTERNS.md)** - Developer's cookbook (HOW to implement)
3. **[TRAPID_LEXICON.md](TRAPID_DOCS/TRAPID_LEXICON.md)** - Bug history, architecture decisions, knowledge base
4. **[TRAPID_USER_MANUAL.md](TRAPID_DOCS/TRAPID_USER_MANUAL.md)** - End-user guides (for reference)

**Chapter Guide:** [CHAPTER_GUIDE.md](TRAPID_DOCS/00_INDEX/CHAPTER_GUIDE.md) - Quick lookup for features → chapters

---

## 📚 The Trinity+1 Documentation System

Trapid uses a **four-document system** to separate concerns and eliminate redundancy:

### 📖 Bible (RULES) - `TRAPID_BIBLE.md`
**Who:** Claude Code + Human Developers
**What:** MUST/NEVER/ALWAYS directives only
**Authority:** ABSOLUTE

**Contains:**
- ✅ Coding rules (MUST/NEVER/ALWAYS)
- ✅ Protected code patterns
- ✅ Configuration values that must match
- ✅ Cross-references to Implementation Patterns

**Does NOT contain:**
- ❌ Code examples (see Implementation Patterns)
- ❌ Bug history (see Lexicon)
- ❌ Architecture explanations (see Lexicon)

**Example:**
```markdown
## RULE #19.1: Table Type Selection

✅ MUST ask user which table type to use:
1. DataTable.jsx (read-only display)
2. Full advanced table (filters, pagination, edit)

See: IMPLEMENTATION_PATTERNS.md §19.1 for full code examples
```

---

### 🔧 Implementation Patterns (HOW-TO) - `IMPLEMENTATION_PATTERNS.md`
**Who:** Claude Code + Human Developers
**What:** Full code examples and step-by-step guides
**Authority:** REFERENCE (examples, not rules)

**Contains:**
- ✅ Full code examples with comments
- ✅ Step-by-step implementation guides
- ✅ Architecture patterns and best practices
- ✅ Common mistakes and how to avoid them
- ✅ Testing strategies
- ✅ Migration guides for refactoring

**Does NOT contain:**
- ❌ Rules (see Bible)
- ❌ Bug history (see Lexicon)
- ❌ User guides (see User Manual)

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

**Source of Truth:** Database table `documented_bugs` (NOT the .md file)
**Exported to:** `TRAPID_LEXICON.md` (auto-generated via `bin/rails trapid:export_lexicon`)

**Contains:**
- ✅ Bug discoveries and resolutions
- ✅ Architecture decisions and rationale
- ✅ Performance optimizations
- ✅ Testing strategies
- ✅ Common issues and gotchas
- ✅ Terminology definitions

**Update Workflow:**
1. Go to Trapid app → Documentation page → 📕 TRAPID Lexicon
2. Add/edit entries via UI (stores in `documented_bugs` table)
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

## 🎯 When to Use Each Document

### Scenario 1: Creating a New Table Component

1. **Read Bible first** → RULE #19.1 says "ask user which table type"
2. **Ask user** → Get their choice (DataTable vs Advanced)
3. **Read Implementation Patterns** → §19.1 shows full code example
4. **Check Lexicon** → Look for known bugs with tables (Chapter 19)
5. **Implement** → Follow Bible rules + Implementation Patterns examples

### Scenario 2: Fixing a Gantt Bug

1. **Check Lexicon first** → Chapter 9 for known Gantt bugs
2. **Read bug entry** → Understand root cause and past solutions
3. **Check Bible** → Chapter 9 protected code patterns
4. **Fix bug** → Follow Bible rules, learn from Lexicon
5. **Update Lexicon** → Add new bug entry via UI, export to .md

### Scenario 3: User Asks "How do I create a job?"

1. **Send them to User Manual** → Chapter 5
2. **If it doesn't work** → Check Lexicon Chapter 5 for known issues
3. **If need to fix code** → Read Bible Chapter 5 rules

### Scenario 4: Adding New Xero Webhook

1. **Read Bible Chapter 15** → Xero integration rules
2. **Read Implementation Patterns §15.X** → Webhook handler code examples
3. **Check Lexicon Chapter 15** → Known webhook issues
4. **Implement** → Follow Bible rules + patterns
5. **Test** → Follow testing strategy from Implementation Patterns

---

## 🔄 Cross-Reference System

All documents cross-reference each other:

```
📖 Bible RULE #19.1
  → "See IMPLEMENTATION_PATTERNS.md §19.1 for code examples"
  → "See LEXICON Chapter 19 for table bugs"

🔧 Implementation Patterns §19.1
  ← "Bible Rule: TRAPID_BIBLE.md RULE #19.1"
  → "Related Lexicon: Chapter 19 table performance issues"

📕 Lexicon Entry: "Gantt Shaking Bug"
  → "Rule Reference: Bible Chapter 9, RULE #9.3"
  → "Solution Pattern: IMPLEMENTATION_PATTERNS.md §9.3"
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
1. Check Lexicon (has it been seen before?)
2. Check Bible (are there protected patterns?)
3. Fix code following Bible rules
4. Update Lexicon via UI + export

**"I'm creating a new component"**
1. Read Bible chapter for rules
2. Read Implementation Patterns for code examples
3. Check Lexicon for known issues
4. Implement following all three

**"I'm optimizing performance"**
1. Check Lexicon for past optimizations
2. Check Bible for protected code warnings
3. Follow Implementation Patterns for best practices
4. Document optimization in Lexicon

**"User can't use a feature"**
1. Send them to User Manual
2. If it's broken, check Lexicon
3. If needs fixing, check Bible

---

**When in doubt:** Ask the user for clarification.
