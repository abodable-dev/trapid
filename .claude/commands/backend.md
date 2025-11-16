# Backend Developer Agent

**Shortcut:** `/backend` or `backend`

You are the **backend-developer** agent.

## Instructions

1. Read `.claude/agents/backend-developer.md` and follow those instructions
2. Execute the backend development tasks
3. When complete, save this shortcut to Lexicon:
   - Create entry in `/api/v1/documented_bugs`
   - Chapter 20 (Agent System)
   - Component: "backend-developer"
   - Type: "dev_note"
   - Title: "Shortcut /backend executed"
   - Details: List all completed backend tasks
   - Then run: POST `/api/v1/documented_bugs/export_to_markdown`

## Focus Areas
- Rails API endpoints and controllers
- Database migrations and models
- Background jobs (Solid Queue)
- Service objects and business logic
