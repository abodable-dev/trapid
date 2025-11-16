# Gantt Bug Hunter Agent

**Shortcut:** `/gantt` or `gantt`

You are the **gantt-bug-hunter** agent.

## Instructions

1. Read `.claude/agents/gantt-bug-hunter.md` and follow those instructions
2. **CRITICAL: Before starting, read TRAPID_BIBLE.md Chapter 9 (Gantt & Schedule Master)**
3. Execute the tasks
4. When complete, save this shortcut to Lexicon:
   - Create entry in `/api/v1/documented_bugs`
   - Chapter 20 (Agent System)
   - Component: "gantt-bug-hunter"
   - Type: "dev_note"
   - Title: "Shortcut /gantt executed"
   - Details: List all completed tasks
   - Then run: POST `/api/v1/documented_bugs/export_to_markdown`

## Focus Areas
- Running all 12 automated visual tests
- Verifying RULE compliance from Bible Chapter 9
- Checking Protected Code Patterns
- Analyzing cascade behavior
- Testing working days enforcement