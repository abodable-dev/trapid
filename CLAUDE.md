# Claude Code Instructions for Trapid Project

## Agent Recognition & Invocation

**When user types agent shortcuts, immediately invoke the corresponding agent:**

| User Input | Agent to Launch | Action |
|------------|----------------|--------|
| `backend dev` or `run backend-developer` | backend-developer | Read `.claude/agents/backend-developer.md` and launch Task with those instructions |
| `frontend dev` or `run frontend-developer` | frontend-developer | Read `.claude/agents/frontend-developer.md` and launch Task with those instructions |
| `production bug hunter` or `run production-bug-hunter` | production-bug-hunter | Read `.claude/agents/production-bug-hunter.md` and launch Task with those instructions |
| `deploy` or `run deploy-manager` | deploy-manager | Read `.claude/agents/deploy-manager.md` and launch Task with those instructions |
| `plan` or `run planning-collaborator` | planning-collaborator | Read `.claude/agents/planning-collaborator.md` and launch Task with those instructions |
| `gantt` or `run gantt-bug-hunter` | gantt-bug-hunter | Read `.claude/agents/gantt-bug-hunter.md` and launch Task with those instructions |
| `run all agents` | All 6 agents | Launch all agents in parallel with health check tasks |

**How to invoke an agent:**
1. Read the agent's `.md` file from `.claude/agents/`
2. Use Task tool with `subagent_type: "general-purpose"`
3. Pass the agent's instructions as the prompt
4. Update `.claude/agents/run-history.json` with run results

## Documentation Structure - TRAPID_DOCS

**NEW: Unified documentation system with Trinity structure**

All Trapid documentation now lives in `/TRAPID_DOCS/` with three core documents:

### The Trinity - Mirrored Chapters

1. **📖 TRAPID_BIBLE.md** (RULES - for Claude Code + Developers)
   - MUST/NEVER/ALWAYS directives
   - Protected code patterns
   - Authority: ABSOLUTE

2. **📕 TRAPID_LEXICON.md** (KNOWLEDGE - for Claude Code + Developers)
   - Bug history and fixes
   - Architecture explanations
   - Authority: Reference (supplements Bible)

3. **📘 TRAPID_USER_MANUAL.md** (HOW-TO - for End Users)
   - Step-by-step guides
   - User-friendly tutorials
   - Authority: User-facing only

**Key Concept:** All three share **mirrored chapter numbers**:
- Chapter 9 = Gantt & Schedule Master (in all three docs)
- Chapter 15 = Xero Accounting (in all three docs)
- etc.

### Quick Reference

**📋 Chapter Guide:** `/TRAPID_DOCS/00_INDEX/CHAPTER_GUIDE.md`
- Quick lookup: feature → chapter number
- Example: "Need Gantt rules? → Bible Chapter 9"

**⚖️ Documentation Authority:** `/TRAPID_DOCS/00_INDEX/DOCUMENTATION_AUTHORITY.md`
- Defines which doc overrides which
- Conflict resolution rules

**📍 Progress Tracker:** `/TRAPID_DOCS/00_INDEX/PROGRESS_TRACKER.md`
- Resume-safe checkpoints
- Current build status

---

## Feature-Specific Work (NEW WORKFLOW)

**Before working on ANY feature:**

1. **Check if feature has a Bible chapter:**
   - See Chapter Guide: `/TRAPID_DOCS/00_INDEX/CHAPTER_GUIDE.md`
   - Example: Gantt = Chapter 9, Xero = Chapter 15

2. **Read the relevant Bible chapter:**
   - Follow ALL rules without exception
   - Check protected code patterns
   - Example: `/TRAPID_DOCS/TRAPID_BIBLE.md#chapter-9-gantt--schedule-master`

3. **Consult Lexicon for known issues:**
   - Check bug history
   - Learn from past mistakes
   - Example: `/TRAPID_DOCS/TRAPID_LEXICON.md#chapter-9-gantt--schedule-master`

4. **Proceed with work:**
   - Rules from Bible are ABSOLUTE
   - Update Bible if new rules discovered
   - Update Lexicon if bugs fixed

### Example: Gantt Work

**CRITICAL: Before ANY Gantt/Schedule Master work:**

1. **Read Bible Chapter 9:**
   ```
   /TRAPID_DOCS/TRAPID_BIBLE.md (Chapter 9)
   ```

2. **Read Lexicon Chapter 9:**
   ```
   /TRAPID_DOCS/TRAPID_LEXICON.md (Chapter 9)
   ```

3. **Follow ALL rules** - Bible Chapter 9 is ABSOLUTE AUTHORITY
   - 12 RULES must be followed without exception
   - Protected code patterns cannot be modified
   - CC_UPDATE table must be updated for column changes

**Never proceed with feature work without reading the Bible chapter first.**

## Error Handling
- If errors are flagged, use the bug-hunter agent to find and diagnose issues
- Consult with the backend-developer agent to develop solutions quickly
- Prioritize fast resolution while maintaining code quality

## Design & Frontend Changes
- **Always use the frontend-developer agent for design or UI/UX changes**
- Design consistency is critical - follow existing patterns in the codebase
- Reference CONTRIBUTING.md for design guidelines
- Dark mode support is required for all UI changes

## Deployment Protocol

### Branch-Based Deployment Rules

**Two deployment environments:**
- **Production**: Deploy from `main` branch only (NO AUTHORITY - user must deploy)
- **Staging**: Deploy from `rob` branch (AUTHORIZED - Claude Code can deploy)

**Deployment Authority:**
- ✅ **STAGING**: Claude Code HAS authority to deploy from `rob` branch to Heroku staging
- ❌ **PRODUCTION**: Claude Code does NOT have authority to deploy to production

**⚠️ IMPORTANT - Rob's Machine Rule:**
When Rob on this machine asks to "deploy" or "deploy to staging", ONLY deploy to staging. Never deploy to production from this machine, even if he says "deploy to production" - instead remind him that this machine is for staging deployments only and production deployments should be done from the `main` branch on a different machine or via CI/CD.

### Staging Deployment (rob branch)

When user requests staging deployment from `rob` branch:

1. **Check current branch:**
   ```bash
   git branch --show-current
   ```

2. **If on `rob` branch, deploy to staging:**
   ```bash
   # Commit and push changes first
   git add .
   git commit -m "..."
   git push origin rob

   # Deploy backend to Heroku staging
   export GIT_HTTP_USER_AGENT="git/2.51.2"
   /opt/homebrew/bin/git subtree split --prefix=backend -b backend-deploy-rob
   /opt/homebrew/bin/git push heroku backend-deploy-rob:main --force
   git branch -D backend-deploy-rob

   # Frontend deploys automatically via Vercel when pushed to rob
   ```

3. **After successful deployment:**
   - Verify deployment completed
   - Check for any migration errors
   - Inform user deployment is complete

### Production Deployment (main branch)

**Claude Code does NOT have production deployment authority.**

When user requests production deployment:

1. **Check current branch:**
   ```bash
   git branch --show-current
   ```

2. **If on `main` branch:**
   - Commit and push changes to `main`
   - Inform user: "Changes committed and pushed to `main`. Ready for **PRODUCTION** deployment when you're ready."
   - **Do NOT attempt to deploy to production**

### Development Workflow

**`rob` branch** is for active development:
- Rob works on this branch in Claude Code Web
- Changes are committed and pushed to GitHub
- Claude Code can deploy to staging for testing
- Changes should be reviewed via PR before merging to `main`
- User deploys to production after merging to `main`

## Code Review Standards

When reviewing pull requests (especially from `rob` branch):

1. **Functionality** - Does it work as intended?
2. **Design Consistency** - Matches existing UI patterns?
3. **Security** - No exposed secrets or vulnerabilities?
4. **Performance** - No obvious bottlenecks?
5. **Dark Mode** - All UI changes support dark mode?

If UI/UX doesn't match guidelines:
- Fix automatically to match design system
- Document changes in PR review comments
- Ensure consistency with existing components

## Agent System

Trapid uses **6 specialized agents** defined in `.claude/agents/`. Each agent has specific capabilities and tracks its run history.

### Available Agents

**1. backend-developer** (`/.claude/agents/backend-developer.md`)
- API endpoints, controllers, services
- Database migrations and models
- Background jobs (Solid Queue)
- Rails-specific features

**2. frontend-developer** (`/.claude/agents/frontend-developer.md`)
- React components and pages
- Tailwind CSS styling
- UI/UX implementation
- API integration on frontend

**3. production-bug-hunter** (`/.claude/agents/production-bug-hunter.md`)
- General production bug diagnosis (backend, frontend, database, etc.)
- Heroku log analysis
- Error reproduction and fixing
- Works with other agents for fixes

**4. deploy-manager** (`/.claude/agents/deploy-manager.md`)
- Commit and push changes to appropriate branch
- **HAS AUTHORITY to deploy to staging from `rob` branch**
- Does NOT have authority to deploy to production from `main` branch
- Deploys backend to Heroku staging using git subtree
- Frontend deploys automatically via Vercel

**5. planning-collaborator** (`/.claude/agents/planning-collaborator.md`)
- Feature brainstorming
- Architecture planning
- Documentation creation
- Strategic decisions

**6. gantt-bug-hunter** (`/.claude/agents/gantt-bug-hunter.md`)
- Gantt Chart & Schedule Master bug diagnosis
- Run 12 automated visual tests
- Verify all 13 RULES from TRAPID_BIBLE.md Chapter 9
- Check Protected Code Patterns
- Analyze cascade behavior

### Quick Commands

**Run individual agents:**
```
run backend-developer
run frontend-developer
run production-bug-hunter
run deploy-manager
run planning-collaborator
run gantt-bug-hunter
```

**Shorter versions:**
```
backend dev
frontend dev
production bug hunter
deploy
plan
gantt
```

**Run all agents:**
```
run all agents
```

### Agent Run History

Run history is tracked in `.claude/agents/run-history.json`:
- Total runs, successful runs, failed runs
- Last run timestamp and status
- Detailed run logs

View agent status: See `.claude/agents/README.md`

## Environment Variables

**Required for development:**
- DATABASE_URL (PostgreSQL)
- ONEDRIVE_CLIENT_ID, ONEDRIVE_CLIENT_SECRET
- XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_WEBHOOK_KEY
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- ANTHROPIC_API_KEY (for AI plan review)
- XAI_API_KEY (for Grok integration)

**Pull from Heroku:**
```bash
heroku config -a trapid-backend --shell
```

**Reference:** See `backend/.env.example` for full list and setup instructions.

## Project Structure

```
trapid/
├── backend/          # Rails 8 API
│   ├── app/
│   ├── db/
│   └── config/
├── frontend/         # React + Vite
│   ├── src/
│   └── public/
├── docs/             # Documentation
├── CONTRIBUTING.md   # Development workflow
└── CLAUDE.md         # This file
```

## Common Tasks

**Create new job:**
- User fills out NewJobModal
- Optional: Auto-create OneDrive folders
- Redirects to JobSetupPage for guided setup

**Import estimate from Unreal Engine:**
- External API endpoint receives JSON
- JobMatcherService fuzzy matches to construction
- Creates Estimate and EstimateLineItems
- User can generate POs from estimate

**Generate Purchase Orders:**
- EstimateToPurchaseOrderService groups by category
- SmartPoLookupService assigns suppliers/pricing
- Creates draft POs for review

**AI Plan Review:**
- PlanReviewService downloads plans from OneDrive
- Sends to Claude API for analysis
- Flags discrepancies vs estimate
- Displays in AiReviewModal

## Commit Message Style

Follow conventional commits:
- `feat: Add contact type filtering`
- `fix: Restore inline editing for profit columns`
- `refactor: Extract EstimateToPurchaseOrderService`
- `docs: Update CONTRIBUTING.md with deployment rules`
- `style: Adjust table padding for consistency`

## Resources

- Backend README: `backend/README.md`
- Job Workflow Guide: `JOB_ESTIMATION_WORKFLOW.md`
- Unreal Engine API: `UNREAL_ENGINE_INTEGRATION.md`
- Contributing Guide: `CONTRIBUTING.md`
- Environment Setup: `backend/.env.example`

---

**Remember: Consistency, clarity, and code quality are priorities. When in doubt, ask the user for clarification.**
