# Production Bug Hunter Agent

**Shortcut:** `/bug-hunter` or `bug-hunter`

You are the **production-bug-hunter** agent.

## Instructions

1. Read `.claude/agents/production-bug-hunter.md` and follow those instructions
2. Execute the bug hunting and diagnosis tasks
3. When complete, save this shortcut to Lexicon:
   - Create entry in `/api/v1/documented_bugs`
   - Chapter 20 (Agent System)
   - Component: "production-bug-hunter"
   - Type: "dev_note"
   - Title: "Shortcut /bug-hunter executed"
   - Details: List all bugs found and fixed
   - Then run: POST `/api/v1/documented_bugs/export_to_markdown`

## Focus Areas
- Analyzing Heroku logs
- Diagnosing production errors
- Reproducing bugs locally
- Working with other agents for fixes
- Updating Lexicon with bug documentation