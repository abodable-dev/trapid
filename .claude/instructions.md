# Project Instructions for Claude Code

## 🚨 CRITICAL: Read Documentation from Database APIs

### Unified Documentation System

This project uses a **database-backed documentation system** with three categories:

1. **📖 Bible (RULES)** - MUST/NEVER/ALWAYS directives
2. **📕 Lexicon (KNOWLEDGE)** - Bug history, architecture decisions
3. **🔧 Teacher (HOW-TO)** - Implementation patterns and code examples

**IMPORTANT:** All documentation lives in the `trinity` table. Markdown files are auto-generated exports that may be stale.

### Before Working on ANY Feature

**You MUST fetch documentation from the live API:**

```bash
# Get Bible rules for a chapter (e.g., Chapter 9 for Gantt)
curl -s 'https://trapid-backend-447058022b51.herokuapp.com/api/v1/trinity?category=bible&chapter_number=9'

# Get Lexicon entries (bug history) for a chapter
curl -s 'https://trapid-backend-447058022b51.herokuapp.com/api/v1/trinity?category=lexicon&chapter_number=9'

# Get Teacher entries (implementation patterns) for a chapter
curl -s 'https://trapid-backend-447058022b51.herokuapp.com/api/v1/trinity?category=teacher&chapter_number=9'
```

### When to Fetch Documentation

**ALWAYS fetch Bible rules when:**
- User mentions a feature (Gantt, Xero, OneDrive, etc.)
- Working on files related to a specific chapter
- User reports a bug
- Adding new functionality
- Modifying existing code

**Common triggers by chapter:**
- **Chapter 9 (Gantt):** "Gantt", "Schedule Master", "cascade", "dependencies", DHtmlxGanttView.jsx, schedule_cascade_service.rb
- **Chapter 15 (Xero):** "Xero", "accounting", "invoice", xero_api_client.rb
- **Chapter 19 (UI/UX):** "table", "modal", "form", "dark mode", UI components
- **Chapter 20 (Agents):** "agent", "automation", .claude/agents/

### What You CANNOT Do (Without Fetching Bible First)

❌ **NEVER:**
- Modify feature code without fetching Bible rules for that chapter
- Change values or patterns mentioned in Bible rules
- Skip reading Protected Code Patterns
- "Optimize" or "simplify" code without checking Bible first

### Documentation Update Process

**When you discover a new rule:**
1. Go to Trapid app → Documentation page
2. Add entry via UI (stores in `trinity` table)
3. Run export: `bin/rails trapid:export_bible` (or export_lexicon, export_teacher)
4. Commit the updated markdown file

**When you fix a bug:**
1. Add Lexicon entry via Trapid UI (entry_type: bug)
2. If bug creates a new RULE → Also add Bible entry
3. Run export: `bin/rails trapid:export_lexicon`
4. Commit the updated markdown file

### API Endpoints

**Base URL:** `https://trapid-backend-447058022b51.herokuapp.com/api/v1/trinity`

**Filter by category:** `?category=bible` (or lexicon, teacher)
**Filter by chapter:** `&chapter_number=9`
**Filter by entry type:** `&entry_type=bug` (for Lexicon) or `&entry_type=MUST` (for Bible)

### Quick Reference: What Goes Where

**Bible (RULES):**
- Entry types: MUST, NEVER, ALWAYS, PROTECTED, CONFIG, rule
- "You MUST do X"
- "NEVER do Y"
- "ALWAYS check Z before W"

**Lexicon (KNOWLEDGE):**
- Entry types: bug, architecture, test, performance, dev_note, common_issue
- Bug discoveries and fixes
- Architecture decisions
- Performance optimizations

**Teacher (HOW-TO):**
- Entry types: component, feature, util, hook, integration, optimization
- Full code examples
- Step-by-step implementation guides
- Best practices

---

## Other Project Guidelines

### General Development
- Read relevant documentation before making changes
- Follow existing code patterns
- Test changes before committing
- Update documentation when changing behavior

### Git Workflow
- Create meaningful commit messages
- Reference issue numbers when applicable
- Don't commit commented-out code without explanation

---

**Last Updated:** November 15, 2025
**Authority:** These instructions are mandatory for all Claude Code sessions
