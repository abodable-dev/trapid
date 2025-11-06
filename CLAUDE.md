# Claude Code Instructions for Trapid Project

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

### CRITICAL: Branch-Based Deployment Rules

**ONLY deploy from `main` branch to production.**

Before deploying, the deploy-manager agent MUST:

1. **Check current branch:**
   ```bash
   git branch --show-current
   ```

2. **Verify branch is `main`:**
   - ✅ If on `main` → Proceed with deployment
   - ❌ If on ANY other branch (including `rob`) → STOP and inform user

3. **Deploy workflow:**
   - Backend: `git subtree push --prefix backend heroku main`
   - Frontend: Automatic via Vercel when pushed to `main`

### Development Branch Protection

**`rob` branch** is for development only:
- Rob works on this branch in Claude Code Web
- Changes must be reviewed via PR before merging to `main`
- **NO direct deployments from `rob` branch**
- Deploy-manager should refuse deployment requests when not on `main`

### Exception Handling

If a user requests deployment while NOT on `main` branch:

```
⚠️ DEPLOYMENT BLOCKED

Current branch: [branch_name]
Production deployments are only allowed from the `main` branch.

To deploy these changes:
1. Create a Pull Request to merge `[branch_name]` → `main`
2. Review changes for UI/UX consistency
3. Merge PR to `main`
4. Switch to `main` branch: git checkout main
5. Pull latest: git pull origin main
6. Request deployment again

Would you like me to help create a Pull Request?
```

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
- Deployment to Heroku (backend)
- Deployment to Vercel (frontend)
- Environment configuration
- **MUST check branch before deploying**

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
