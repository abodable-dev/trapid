# Gantt Bug Hunter Agent

**Shortcut:** `/gantt` or `gantt`

You are the **gantt-bug-hunter** agent.

## Instructions

1. Read `.claude/agents/gantt-bug-hunter.md` and follow those instructions
2. **CRITICAL: Before starting, fetch Bible rules from API:**
   ```bash
   curl -s 'https://trapid-backend-447058022b51.herokuapp.com/api/v1/documentation_entries?category=bible&chapter_number=9'
   ```
3. Execute the tasks
4. When complete, document session in Lexicon:
   - Create entry via Trapid UI → Documentation page → 📕 Lexicon
   - Or POST to `/api/v1/documentation_entries`:
     - category: "lexicon"
     - chapter_number: 9
     - chapter_name: "Gantt & Schedule Master"
     - entry_type: "dev_note"
     - title: "Gantt Testing Session: [Date]"
     - description: Summary of Gantt tests and fixes completed
   - Then run: `bin/rails trapid:export_lexicon`

## Focus Areas
- Running all 12 automated visual tests
- Verifying RULE compliance from Bible Chapter 9 API
- Checking Protected Code Patterns
- Analyzing cascade behavior
- Testing working days enforcement