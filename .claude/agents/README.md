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
**Focus:** UI/UX Standards Compliance (Chapter 19 & 20 - Non-Table Components)
- Audits all frontend code against Chapter 19 UI/UX standards
- Focuses on forms, modals, navigation, buttons, layouts
- Checks for incorrect icon usage
- Verifies dark mode support across all components
- Generates detailed compliance reports
- **Note:** For table-specific audits, use ui-table-auditor

### 9. ui-table-auditor
**Focus:** Table Component Compliance (Chapter 19 - Tables)
- Specialized audits for ALL table components
- Trinity tables, DataTable, custom table implementations
- Validates table structure, inline editing, column formatting
- Checks sorting, filtering, row actions
- Verifies empty/loading states, mobile responsiveness
- Dark mode compliance for tables

### 10. trapid-table-architect
**Focus:** TrapidTableView Component Specialist
- Creates new table implementations using TrapidTableView
- Reviews existing tables for standards compliance
- Migrates legacy tables to TrapidTableView
- Optimizes table performance (N+1 queries, pagination)
- Ensures accessibility and mobile responsiveness
- Enforces the "One Table Standard"

### 11. architecture-guardian
**Focus:** Clean Architecture & Code Quality
- Reviews code for architectural consistency
- Ensures SOLID principles and clean architecture
- Validates component reusability
- Checks backward compatibility
- Identifies unnecessary fallbacks
- Maintains codebase scalability

### 12. code-guardian
**Focus:** Automated Pattern Violation Detection
- Scans code for known bug patterns
- Prevents repeat bugs before they reach production
- Posts PR review comments with fixes
- References Pattern Library and Detection Rules
- Tracks violation metrics
- Consolidates backend + frontend code review

### 13. invoke-helper
**Focus:** Agent Invocation Guide
- Helper agent for invoking other agents
- Provides agent shortcuts and invocation patterns
- Manages run history tracking

### 14. ssot-agent
**Focus:** Single Source of Truth Validation
- Validates Dense Index ↔ CLAUDE.md consistency
- Scans all .md files for conflicts with Trinity
- Suggests archivable documentation (superseded by Trinity)
- Audits backend code for SSoT compliance
- Audits frontend code for SSoT compliance
- Stops on conflicts and asks user to resolve
- Updates Trinity with archive records

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
"run ui-table-auditor"

# Shorter versions
"backend dev"
"frontend dev"
"production bug hunter"
"deploy"
"plan"
"gantt"
"trinity"
"ui audit"
"audit tables"
```

### Run All Agents

```bash
"run all agents"
"/ag"
"allagent"
```

This will run all 13 agents in parallel with health check tasks.

## Database Integration

All agent definitions are automatically synced to the `agent_definitions` database table.

### Viewing Agents in UI

Navigate to: **http://localhost:5173/admin/system?tab=developer-tools** → "Agent Status" sub-tab

The UI displays:
- Agent name and icon
- Description and focus area
- Last run timestamp
- Total runs and success rate
- Current status (success/failure)
- Run button to execute agent

### Auto-Sync Mechanisms

Agents are automatically synced to the database in two ways:

**1. Git Post-Commit Hook (Automatic)**
- Whenever you commit changes to `.claude/agents/*.md` files
- The hook detects changed agent files
- Automatically runs `bin/rails trapid:agents:sync`
- Agents appear in UI immediately after commit

**2. Manual Sync Command**
```bash
# From project root
npm run sync-agents

# Or directly
cd backend && bin/rails trapid:agents:sync
```

## Run History

Agent run history is tracked in the **database** (`agent_definitions` table):

- `total_runs` - Total number of times agent was executed
- `successful_runs` - Number of successful executions
- `failed_runs` - Number of failed executions
- `last_run_at` - Timestamp of last execution
- `last_status` - Last run status (success/failure)
- `last_message` - Last run message/summary
- `last_run_details` - JSON details of last run

View run history in the UI at: **http://localhost:5173/admin/system?tab=developer-tools** → "Agent Status"

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

1. **Create agent file** in `.claude/agents/your-agent-name.md`:

```markdown
---
name: your-agent-name
description: Brief description of what the agent does
model: sonnet  # or opus, haiku
type: development  # or diagnostic, deployment, planning
---

Your agent's full instructions and capabilities here...
```

2. **Sync to database**:
```bash
npm run sync-agents
```

3. **Verify in UI**:
- Navigate to http://localhost:5173/admin/system?tab=developer-tools
- Check "Agent Status" tab
- Your new agent should appear in the list

4. **Update this README** with agent description

**Important:** Keep YAML frontmatter simple. Avoid multi-line values with special characters. Put detailed instructions in the markdown body.

## Notes

- Agents are stateless (each run is independent)
- Run history is stored in the database and persists across sessions
- Agent definitions (markdown files) are version-controlled
- Agent run statistics are tracked automatically in the database
- Agents should fetch from Trinity API (`/api/v1/trinity`), never read markdown files
- Trinity database is the source of truth for all documentation

## Recording Agent Runs

When an agent completes, record the run in the database:

```ruby
# Success
agent = AgentDefinition.find_by(agent_id: 'your-agent-name')
agent.record_success('Task completed successfully', { details: 'any metadata' })

# Failure
agent.record_failure('Error message', { error: 'details' })
```

This updates:
- `total_runs` (incremented)
- `successful_runs` or `failed_runs` (incremented)
- `last_run_at` (current timestamp)
- `last_status` ('success' or 'failure')
- `last_message` (your message)
- `last_run_details` (optional metadata)
