# Claude Code Agents

This directory contains specialized agent definitions for the Trapid project.

## Available Agents

### 1. backend-developer
**Focus:** Rails API Backend Development
- API endpoints, controllers, services
- Database migrations and models
- Background jobs (Solid Queue)
- Rails-specific features

### 2. frontend-developer
**Focus:** React + Vite Frontend Development
- React components and pages
- Tailwind CSS styling
- UI/UX implementation
- API integration on frontend

### 3. production-bug-hunter
**Focus:** General Production Bug Diagnosis & Resolution
- Production bug diagnosis (backend, frontend, database, etc.)
- Heroku log analysis
- Error reproduction and fixing
- Works with other agents for fixes
- **Note:** For Gantt bugs, use **"Gantt Bug Hunter"** workflow (separate from this agent)

### 4. deploy-manager
**Focus:** Git Operations & Staging Deployment
- Commit and push changes to appropriate branch
- **HAS AUTHORITY** to deploy to staging from `rob` branch
- Does NOT have authority to deploy to production from `main` branch
- Deploys backend to Heroku staging using git subtree
- Frontend deploys automatically via Vercel

### 5. planning-collaborator
**Focus:** Feature Planning & Architecture Design
- Feature brainstorming
- Architecture planning
- Documentation creation
- Strategic decisions

### 6. gantt-bug-hunter
**Focus:** Gantt Chart & Schedule Master Bug Diagnosis
- Gantt/Schedule Master bug diagnosis
- Run 12 automated visual tests
- Verify all 13 RULES from Trinity Chapter 9
- Check Protected Code Patterns
- Analyze cascade behavior

### 7. trinity-sync-validator
**Focus:** Trinity Database & Markdown Sync Validation
- Validates Trinity database integrity
- Ensures markdown exports are up-to-date backups
- Prevents stale markdown files
- Ensures documentation integrity
- Trinity database is source of truth

### 8. ui-compliance-auditor
**Focus:** UI/UX Standards Compliance (Chapter 19)
- Audits all frontend code against Chapter 19 UI/UX standards
- Identifies missing features (resize, reorder, filters, search)
- Checks for incorrect icon usage
- Verifies dark mode support across all components
- Generates detailed compliance reports

## How to Use

### Quick Commands

```bash
# Run single agent
"run backend-developer"
"run frontend-developer"
"run production-bug-hunter"
"run deploy-manager"
"run planning-collaborator"
"run gantt-bug-hunter"
"run trinity-sync-validator"
"run ui-compliance-auditor"

# Shorter versions
"backend dev"
"frontend dev"
"production bug hunter"
"deploy"
"plan"
"gantt"
"trinity"
"ui audit"
```

### Run All Agents

```bash
"run all agents"
"/ag"
"allagent"
```

This will run all 8 agents in parallel with health check tasks.

## Run History

Agent run history is tracked in `run-history.json`:

```json
{
  "agent-name": {
    "total_runs": 10,
    "successful_runs": 9,
    "failed_runs": 1,
    "last_run": "2025-11-16T10:30:00Z",
    "last_status": "success",
    "last_message": "Completed successfully",
    "runs": [...]
  }
}
```

## Agent Definitions

Each agent has a Markdown file defining:
- Purpose and capabilities
- When to use
- Tools available
- Success criteria
- Example invocations

## Updating Agents

To modify an agent:
1. Edit the corresponding `.md` file
2. Agent changes take effect immediately
3. No restart required

## Adding New Agents

1. Create `new-agent.md` in this directory
2. Follow the template from existing agents
3. Add entry to `run-history.json`
4. Document in this README

## Notes

- Agents are stateless (each run is independent)
- Run history persists across sessions
- Agent definitions are version-controlled
- Agents should fetch from Trinity API (`/api/v1/trinity`), never read markdown files
- Trinity database is the source of truth for all documentation
