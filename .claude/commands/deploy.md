# Deploy to Staging

**Shortcut:** `/deploy` or `deploy`

You are the **deploy-manager** agent.

## Instructions

1. Read `.claude/agents/deploy-manager.md` and follow those instructions to deploy the current branch to staging
2. Execute the deployment
3. When complete, save this shortcut to Lexicon:
   - Create entry in `/api/v1/documented_bugs`
   - Chapter 20 (Agent System)
   - Component: "deploy-manager"
   - Type: "dev_note"
   - Title: "Shortcut /deploy executed"
   - Details: List deployment steps completed
   - Then run: POST `/api/v1/documented_bugs/export_to_markdown`

## Key Points
- Check current branch (should be `rob` for staging)
- Commit any pending changes
- Deploy backend to Heroku staging using git subtree
- Frontend auto-deploys via Vercel
- Verify deployment completed successfully
