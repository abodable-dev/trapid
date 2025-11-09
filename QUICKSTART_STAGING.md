# Quick Start: Setting Up Staging Environment

This is the fastest way to get your staging backend up and running.

## Option 1: Automated Setup (Recommended) ⚡

Run the automated setup script:

```bash
cd /path/to/trapid
./scripts/setup_staging_backend.sh
```

This script will:
- ✅ Create `trapid-backend-staging` Heroku app
- ✅ Add PostgreSQL database
- ✅ Copy production database to staging
- ✅ Copy all environment variables (with staging-specific updates)
- ✅ Add git remote for staging
- ✅ Deploy backend to staging

**Time:** ~5-10 minutes (mostly waiting for database provisioning)

---

## Option 2: Manual Setup

If you prefer to run commands manually, see `SETUP_STAGING_BACKEND.md` for detailed step-by-step instructions.

---

## After Setup: Configure Vercel Staging

1. Go to your Vercel staging project:
   - Visit: https://vercel.com/[your-team]/settings/environment-variables

2. Add environment variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://trapid-backend-staging.herokuapp.com`
   - **Environment:** Production (this is production for the staging project)

3. Redeploy staging frontend:
   ```bash
   git checkout rob
   git push origin rob
   ```

---

## Testing Your Staging Environment

1. **Test backend directly:**
   ```bash
   curl https://trapid-backend-staging.herokuapp.com/
   ```

2. **Test frontend connection:**
   - Visit: https://trapid-staging.vercel.app
   - Open browser console
   - Look for API requests going to `trapid-backend-staging.herokuapp.com`
   - Try logging in or creating data

3. **Check logs:**
   ```bash
   # Backend logs
   heroku logs --tail -a trapid-backend-staging

   # App status
   heroku ps -a trapid-backend-staging

   # Database info
   heroku pg:info -a trapid-backend-staging
   ```

---

## Using Staging Environment

Now when you push to `rob` branch:

1. **Frontend** auto-deploys to: https://trapid-staging.vercel.app
2. **Backend** auto-deploys to: https://trapid-backend-staging.herokuapp.com

Both deployments are automatic via GitHub Actions!

### Workflow Example:

```bash
# Make changes
git checkout rob
git pull origin rob

# Edit files...
vim backend/app/controllers/contacts_controller.rb

# Commit and push
git add .
git commit -m "Add new contact feature"
git push origin rob

# Wait 2-3 minutes for automatic deployment
# Then test at: https://trapid-staging.vercel.app
```

---

## Refreshing Staging Data

To reset staging database from production (useful periodically):

```bash
heroku pg:backups:capture -a trapid-backend
BACKUP_URL=$(heroku pg:backups:url -a trapid-backend)
heroku pg:backups:restore "$BACKUP_URL" DATABASE_URL -a trapid-backend-staging --confirm trapid-backend-staging
```

---

## Troubleshooting

### Backend deployment failed
```bash
# Check GitHub Actions
# Go to: https://github.com/abodable-dev/trapid/actions

# Check Heroku logs
heroku logs --tail -a trapid-backend-staging
```

### Frontend not connecting to backend
```bash
# Verify Vercel environment variable
# Go to Vercel project settings → Environment Variables
# Ensure VITE_API_URL=https://trapid-backend-staging.herokuapp.com
```

### Database connection error
```bash
# Check database status
heroku pg:info -a trapid-backend-staging

# Check DATABASE_URL is set
heroku config:get DATABASE_URL -a trapid-backend-staging
```

---

## Need Help?

- Full documentation: `SETUP_STAGING_BACKEND.md`
- Backend logs: `heroku logs --tail -a trapid-backend-staging`
- GitHub Actions: https://github.com/abodable-dev/trapid/actions
- Vercel dashboard: https://vercel.com/dashboard
