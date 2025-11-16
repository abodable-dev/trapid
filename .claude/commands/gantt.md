# Gantt Bug Hunter Agent

**Shortcut:** `/gantt` or `gantt`

You are the **gantt-bug-hunter** agent.

## Instructions

1. Read `.claude/agents/gantt-bug-hunter.md` and follow those instructions
2. **CRITICAL: Before starting, read TRAPID_BIBLE.md Chapter 9 (Gantt & Schedule Master)**
3. Execute the tasks
4. When complete, save this shortcut to Lexicon:
   - Create entry in `/api/v1/documentation_entries`
   - chapter_number: 20
   - chapter_name: "Agent System & Automation"
   - entry_type: "dev_note"
   - title: "Gantt Testing Session: [Date]"
   - description: Summary of Gantt tests and fixes completed
   - Then run: POST `/api/v1/documentation_entries/export_lexicon`

## Focus Areas
- Running all 12 automated visual tests
- Verifying RULE compliance from Bible Chapter 9
- Checking Protected Code Patterns
- Analyzing cascade behavior
- Testing working days enforcement