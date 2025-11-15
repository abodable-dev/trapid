# Claude Code Instructions for Trapid Project

## Gantt & Schedule Master Development

**CRITICAL: Before ANY Gantt/Schedule Master work:**

1. **Read the Gantt Bible:**
   ```
   /Users/rob/Projects/trapid/GANTT_BIBLE.md
   ```

2. **Give thumbs up and wait for user confirmation:**
   - After reading the Bible, respond with 👍
   - Wait for user to respond before proceeding
   - This ensures you have the latest rules in context

3. **The Bible is ABSOLUTE AUTHORITY:**
   - All 13 RULES must be followed without exception
   - Protected code patterns cannot be modified
   - CC_UPDATE table must be updated for column changes (RULE #12)

4. **Two-document system:**
   - 📖 **GANTT_BIBLE.md** - RULES only (directives, MUST/NEVER/ALWAYS)
   - 📕 **GANTT_BUG_HUNTER_LEXICON.md** - KNOWLEDGE only (bug history, explanations)

**When to read the Bible:**
- At the start of every session involving Gantt work
- Before making ANY changes to Schedule Master
- Before investigating Gantt-related bugs
- When user asks about Gantt functionality

**Never proceed with Gantt work without reading the Bible first.**

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

## Agent Usage Guidelines

**backend-developer agent:**
- API endpoints, controllers, services
- Database migrations and models
- Background jobs (Solid Queue)
- Rails-specific features

**frontend-developer agent:**
- React components and pages
- Tailwind CSS styling
- UI/UX implementation
- API integration on frontend

**bug-hunter agent:**
- Production bug diagnosis
- Heroku log analysis
- Error reproduction and fixing
- Works with other agents for fixes

**deploy-manager agent:**
- Commit and push changes to appropriate branch
- **HAS AUTHORITY to deploy to staging from `rob` branch**
- Does NOT have authority to deploy to production from `main` branch
- Deploys backend to Heroku staging using git subtree
- Frontend deploys automatically via Vercel

**planning-collaborator agent:**
- Feature brainstorming
- Architecture planning
- Documentation creation
- Strategic decisions

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
