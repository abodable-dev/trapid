# One-Click Staging Environment Setup 🚀

Set up your complete staging environment with **just one click** in GitHub!

## How It Works

I've created an automated GitHub Actions workflow that will:
- ✅ Create `trapid-backend-staging` Heroku app
- ✅ Add PostgreSQL database
- ✅ Copy production database to staging
- ✅ Copy all environment variables (auto-configured for staging)
- ✅ Deploy backend to staging
- ✅ Verify everything is working

**Time:** ~10 minutes (fully automated)

---

## Step 1: Run the Setup Workflow

1. **Go to GitHub Actions:**
   - Visit: https://github.com/abodable-dev/trapid/actions

2. **Find the workflow:**
   - Click on "Setup Staging Environment (One-Time)" in the left sidebar

3. **Run the workflow:**
   - Click the "Run workflow" button (top right)
   - Select branch: `main` or `claude/jake-staging-branch-011CUtPjdUrM4hTBxCDLJYUS`
   - Options:
     - ✅ Copy production database to staging? → **Yes** (checked)
     - ✅ Deploy backend to staging immediately? → **Yes** (checked)
   - Click the green "Run workflow" button

4. **Wait for completion:**
   - The workflow will run for ~10 minutes
   - You can watch the progress in real-time
   - Green checkmark = Success! ✅

---

## Step 2: Configure Vercel Staging Frontend

After the workflow completes, you need to configure Vercel:

### Option A: Vercel Dashboard (Easiest)

1. Go to Vercel dashboard: https://vercel.com/
2. Find your staging project (trapid-staging)
3. Go to Settings → Environment Variables
4. Add or update:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://trapid-backend-staging.herokuapp.com`
   - **Environment:** Production (this is "production" for the staging project)
5. Click "Save"
6. Redeploy: Go to Deployments → Click the three dots on latest → Redeploy

### Option B: Vercel CLI (If you have it)

```bash
vercel env add VITE_API_URL production
# Enter: https://trapid-backend-staging.herokuapp.com

vercel --prod
```

---

## Step 3: Test Your Staging Environment

### Test Backend Directly:
```bash
curl https://trapid-backend-staging.herokuapp.com/
```

### Test Frontend Connection:
1. Visit: https://trapid-staging.vercel.app
2. Open browser DevTools (F12) → Console tab
3. Try logging in or any API action
4. Check Network tab - API calls should go to `trapid-backend-staging.herokuapp.com`

---

## You're Done! 🎉

From now on:
- Push to `rob` branch → **Automatically deploys to staging**
- Push to `main` branch → **Automatically deploys to production**

### Example Workflow:

```bash
# Make changes on rob branch
git checkout rob
git pull origin rob

# Edit some files...
vim backend/app/controllers/contacts_controller.rb

# Commit and push
git add .
git commit -m "Add new contact feature"
git push origin rob

# Wait 2-3 minutes for automatic deployment
# Then test at: https://trapid-staging.vercel.app
```

---

## Troubleshooting

### Workflow failed?
- Check the workflow logs in GitHub Actions
- Common issue: `HEROKU_API_KEY` secret not set
  - Go to: https://github.com/abodable-dev/trapid/settings/secrets/actions
  - Add `HEROKU_API_KEY` with your Heroku auth token

### Backend not responding?
```bash
# Check if it's running (need Heroku CLI)
heroku ps -a trapid-backend-staging

# Check logs
heroku logs --tail -a trapid-backend-staging
```

### Frontend not connecting to backend?
- Verify Vercel environment variable is set correctly
- Try redeploying the frontend
- Check browser console for CORS errors

---

## Refreshing Staging Data

To reset staging database from production (useful periodically):

### Option A: Re-run the Setup Workflow
1. Go to GitHub Actions
2. Run "Setup Staging Environment (One-Time)" again
3. Check "Copy production database to staging"
4. Uncheck "Deploy backend" (unless you want to redeploy)

### Option B: Manual Command (If you have Heroku CLI)
```bash
heroku pg:backups:capture -a trapid-backend
BACKUP_URL=$(heroku pg:backups:url -a trapid-backend)
heroku pg:backups:restore "$BACKUP_URL" DATABASE_URL -a trapid-backend-staging --confirm trapid-backend-staging
```

---

## What Was Created?

After setup, you have:

| Environment | Frontend | Backend | Database |
|------------|----------|---------|----------|
| **Production** | https://trapid.vercel.app | https://trapid-backend-447058022b51.herokuapp.com | Production data |
| **Staging** | https://trapid-staging.vercel.app | https://trapid-backend-staging.herokuapp.com | Copy of production |

---

## Need Help?

- **View workflow logs:** https://github.com/abodable-dev/trapid/actions
- **Detailed setup guide:** See `SETUP_STAGING_BACKEND.md`
- **Manual setup script:** See `scripts/setup_staging_backend.sh`
