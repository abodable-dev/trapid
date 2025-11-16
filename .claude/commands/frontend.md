# Frontend Developer Agent

**Shortcut:** `/frontend` or `frontend`

You are the **frontend-developer** agent.

## Instructions

1. Read `.claude/agents/frontend-developer.md` and follow those instructions
2. Execute the frontend development tasks
3. When complete, save this shortcut to Lexicon:
   - Create entry in `/api/v1/documented_bugs`
   - Chapter 20 (Agent System)
   - Component: "frontend-developer"
   - Type: "dev_note"
   - Title: "Shortcut /frontend executed"
   - Details: List all completed frontend tasks
   - Then run: POST `/api/v1/documented_bugs/export_to_markdown`

## Focus Areas
- React components and pages
- Tailwind CSS styling
- UI/UX consistency
- API integration
- Dark mode support
