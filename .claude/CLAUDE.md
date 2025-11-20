# Claude Code Instructions for Trapid Project

## 🔴 CRITICAL: Efficient Documentation Access

**ALWAYS use the Dense Index pattern to find relevant documentation before reading full files.**

---

## 📚 Trinity Documentation System

The Trinity system uses a **database-first architecture** with three categories:
- **Bible (RULES):** What you MUST/NEVER/ALWAYS do
- **Teacher (HOW-TO):** Step-by-step implementation patterns and code examples
- **Lexicon (KNOWLEDGE):** Bug history, architecture decisions, test catalog

**Base API:** `https://trapid-backend-447058022b51.herokuapp.com/api/v1/trinity`

---

## ⚡ Dense Index Workflow (MANDATORY)

**CRITICAL:** Files are too large to read directly. ALWAYS use this 2-step workflow:

### Step 1: Search Dense Index via API

Use the Trinity API to search the `dense_index` field for relevant entries:

```bash
# Search across all documentation
GET /api/v1/trinity/search?q=your_search_term

# Filter by category
GET /api/v1/trinity?category=bible&search=your_term
GET /api/v1/trinity?category=teacher&search=your_term
GET /api/v1/trinity?category=lexicon&search=your_term
```

**Dense Index Format:**
Each entry has a `dense_index` field containing ultra-compressed keywords for fast searching:
- Chapter number (e.g., "191" = Chapter 19, Section 1)
- Entry title (lowercase, no spaces)
- Entry type (component/rule/bug/etc)
- Category (bible/teacher/lexicon)
- Key concepts and related terms
- File paths (if applicable)

**Example:**
```
"191 trapidtableviewtheonetablestandard component teacher trapidtableview the only table component for trapid frontend src components documentation"
```

### Step 2: Read ONLY Relevant Chapter Files

Once you identify the relevant chapter from Step 1, read the specific chapter file:

**Teacher Chapters:**
- `TRAPID_DOCS/TEACHER/CHAPTER_XX_TOPIC_NAME.md` (XX = chapter number with leading zero)
- Average size: ~8KB per chapter (vs 770KB monolithic file)
- Example: `TRAPID_DOCS/TEACHER/CHAPTER_19_UI_UX.md`

**Bible & Lexicon:**
- `TRAPID_DOCS/TRAPID_BIBLE.md` (~56KB total, organized by chapters)
- `TRAPID_DOCS/TRAPID_LEXICON.md` (~107KB total, organized by chapters)

**User Manual:**
- `TRAPID_DOCS/TRAPID_USER_MANUAL.md` (end-user facing documentation)

---

## 🎯 Documentation Categories Explained

### 📖 Bible (RULES)
**What it contains:** Authoritative rules that MUST be followed
- MUST/NEVER/ALWAYS statements
- Coding standards and conventions
- Security requirements
- Database schema rules
- API design patterns

**When to consult:**
- Before implementing ANY feature
- When making architectural decisions
- When code review identifies non-compliance
- When in doubt about "the right way"

**Access:**
1. Search dense index: `/api/v1/trinity?category=bible&search=table`
2. Read relevant Bible section from `TRAPID_DOCS/TRAPID_BIBLE.md`

### 🔧 Teacher (HOW-TO)
**What it contains:** Step-by-step implementation patterns
- Complete code examples
- Component templates
- Feature implementation guides
- Integration tutorials
- Common patterns and utilities

**When to consult:**
- When implementing a new feature
- When learning how to use a component
- When looking for code examples
- When following Bible rules (Teacher shows HOW)

**Access:**
1. Search dense index: `/api/v1/trinity?category=teacher&search=trapidtableview`
2. Identify chapter number from results
3. Read specific chapter: `TRAPID_DOCS/TEACHER/CHAPTER_XX_TOPIC.md`

### 📕 Lexicon (KNOWLEDGE)
**What it contains:** Historical knowledge and decisions
- Bug history (what went wrong, how it was fixed)
- Architecture decisions (why we chose X over Y)
- Test catalog (what tests exist)
- Performance notes
- Common issues and solutions

**When to consult:**
- When encountering a bug
- When making architecture decisions
- When wondering "why is it built this way?"
- Before refactoring (check if there's history)

**Access:**
1. Search dense index: `/api/v1/trinity?category=lexicon&search=performance`
2. Read relevant Lexicon section from `TRAPID_DOCS/TRAPID_LEXICON.md`

---

## 🚫 What NOT to Do

**NEVER:**
- ❌ Read entire TRAPID_TEACHER.md (770KB - will fail or waste tokens)
- ❌ Skip the dense index search step
- ❌ Assume you know the right chapter without searching
- ❌ Ignore Bible rules because they're "too strict"
- ❌ Implement features without consulting Teacher examples
- ❌ Repeat past bugs without checking Lexicon history

**ALWAYS:**
- ✅ Search dense index FIRST via API
- ✅ Read ONLY the relevant chapter files
- ✅ Check Bible for rules before implementing
- ✅ Check Teacher for implementation patterns
- ✅ Check Lexicon for historical context
- ✅ Follow the 2-step workflow: Search → Read Specific Chapter

---

## 📊 Token Efficiency

**Old Approach (WRONG):**
- Read entire TRAPID_TEACHER.md: ~553,000 tokens ❌ (file too large, fails)
- Read all three docs: ~716,000 tokens ❌ (exceeds limits)

**New Approach (CORRECT):**
- Search dense index via API: ~100 tokens ✅
- Read relevant Teacher chapter: ~15,000 tokens ✅
- Total: ~15,100 tokens (98% reduction) ✅

---

## 🔍 Example Workflow

**Scenario:** Need to implement a new data table

**Step 1 - Search Dense Index:**
```bash
GET /api/v1/trinity/search?q=table
```

**Result:**
```json
{
  "success": true,
  "results": [
    {
      "id": 200,
      "chapter_number": 19,
      "section_number": "19.1",
      "title": "TrapidTableView - The One Table Standard",
      "category": "teacher",
      "dense_index": "191 trapidtableviewtheonetablestandard component teacher..."
    }
  ]
}
```

**Step 2 - Read Specific Chapter:**
Read `TRAPID_DOCS/TEACHER/CHAPTER_19_UI_UX.md` (Chapter 19 identified from search)

**Step 3 - Check Bible Rules:**
Search `/api/v1/trinity?category=bible&search=table` for any related rules

**Step 4 - Implement:**
Follow Teacher patterns while adhering to Bible rules

---

## 🎓 Best Practices

1. **Search is Cheap, Reading is Expensive**
   - API search: ~100 tokens
   - Reading wrong file: ~50,000+ tokens wasted
   - Always search first

2. **Chapter Numbers are Your Friend**
   - Chapter 0-2: Core System (auth, database, API)
   - Chapter 3-7: Data Management (tables, imports, exports)
   - Chapter 8-12: Business Logic (jobs, suppliers, quotes)
   - Chapter 13-17: Integrations (Xero, OneDrive, AI)
   - Chapter 18-21: UI/UX & Documentation

3. **When in Doubt, Ask the API**
   - Unsure which chapter? Search the dense index
   - Need quick lookup? Use `/api/v1/trinity/search`
   - Want related entries? Check `related_rules` field

4. **Update Documentation as You Go**
   - Found a bug? Add to Lexicon via UI
   - Created a pattern? Add to Teacher via UI
   - Discovered a rule? Add to Bible via UI
   - Run export tasks to update markdown files

---

## 📁 File Structure Reference

```
TRAPID_DOCS/
├── TRAPID_BIBLE.md              # All Bible rules (~56KB)
├── TRAPID_LEXICON.md            # All Lexicon entries (~107KB)
├── TRAPID_TEACHER.md            # Full Teacher index (DO NOT READ - too large)
├── TRAPID_USER_MANUAL.md        # End-user documentation
└── TEACHER/                     # Split Teacher chapters (READ THESE)
    ├── CHAPTER_19_UI_UX.md                    # ~8KB
    ├── CHAPTER_19_CUSTOM_TABLES_FORMULAS.md   # ~9KB
    └── (more chapters as they're populated)
```

---

## 🔄 Keeping Documentation in Sync

**Database is Source of Truth:**
- All edits happen in the Trapid UI (Documentation page)
- Markdown files are auto-generated exports for git history

**To Export Latest Changes:**
```bash
# Export all Teacher chapters to split files
cd backend && bin/rails trapid:export_teacher_split

# Or use the Ruby script (works without local DB)
ruby scripts/generate_teacher_chapters.rb

# Export Bible
cd backend && bin/rails trapid:export_bible

# Export Lexicon
cd backend && bin/rails trapid:export_lexicon
```

**Commit Message Format:**
```
docs: Update [Bible|Teacher|Lexicon] from database export
```

---

## Summary: The Golden Rule

**🔴 BEFORE reading ANY documentation file:**
1. Search the dense index via API
2. Identify the relevant chapter number
3. Read ONLY that specific chapter file
4. Save 98% of your tokens
