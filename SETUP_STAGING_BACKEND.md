# Setting Up Staging Backend Environment

This guide walks through creating a separate Heroku staging backend environment for Rob's development work.

## Prerequisites

- Heroku CLI installed: `brew install heroku/brew/heroku` (Mac) or [download](https://devcenter.heroku.com/articles/heroku-cli)
- Authenticated with Heroku: `heroku auth:login`
- Access to `trapid-backend` production app

## Step 1: Create Staging Heroku App

```bash
# Create new Heroku app for staging
heroku create trapid-backend-staging

# Add PostgreSQL database (same plan as production for consistency)
heroku addons:create heroku-postgresql:essential-0 -a trapid-backend-staging

# Wait for database to provision
heroku pg:wait -a trapid-backend-staging
```

## Step 2: Copy Production Database to Staging

**Option A: Quick copy (recommended for initial setup)**
```bash
# Capture production backup
heroku pg:backups:capture -a trapid-backend

# Get backup URL
BACKUP_URL=$(heroku pg:backups:url -a trapid-backend)

# Restore to staging
heroku pg:backups:restore "$BACKUP_URL" DATABASE_URL -a trapid-backend-staging --confirm trapid-backend-staging
```

**Option B: Direct transfer (if Option A doesn't work)**
```bash
# Pull production database locally
heroku pg:pull DATABASE_URL trapid_production -a trapid-backend

# Push to staging
heroku pg:push trapid_production DATABASE_URL -a trapid-backend-staging
```

## Step 3: Copy Environment Variables

```bash
# Export production config
heroku config -a trapid-backend --shell > /tmp/prod_config.env

# Review the config file and update any URLs or keys that should be different for staging
# Important: Update FRONTEND_URL to point to staging frontend

# Set staging config (you'll need to do this for each variable)
# Example:
heroku config:set ONEDRIVE_CLIENT_ID="..." -a trapid-backend-staging
heroku config:set ONEDRIVE_CLIENT_SECRET="..." -a trapid-backend-staging
# ... etc for all config vars

# Or use this helper script to set all at once:
while IFS='=' read -r key value; do
  # Skip FRONTEND_URL, we'll set it manually
  if [ "$key" != "FRONTEND_URL" ]; then
    heroku config:set "$key=$value" -a trapid-backend-staging
  fi
done < /tmp/prod_config.env

# Set staging-specific FRONTEND_URL
heroku config:set FRONTEND_URL=https://trapid-staging.vercel.app -a trapid-backend-staging
```

## Step 4: Add Heroku Remote to Git

```bash
# From the trapid repository root
cd /path/to/trapid

# Add staging remote
heroku git:remote -a trapid-backend-staging -r heroku-staging

# Verify remotes
git remote -v
# Should show:
# heroku-staging  https://git.heroku.com/trapid-backend-staging.git
```

## Step 5: Deploy to Staging

```bash
# Deploy backend to staging
git subtree push --prefix backend heroku-staging main

# Or if that fails, use force push:
git push heroku-staging `git subtree split --prefix backend HEAD`:main --force
```

## Step 6: Verify Staging Backend

```bash
# Check if app is running
heroku ps -a trapid-backend-staging

# View logs
heroku logs --tail -a trapid-backend-staging

# Test the API
curl https://trapid-backend-staging.herokuapp.com/

# Check database
heroku pg:info -a trapid-backend-staging
```

## Step 7: Configure GitHub Actions

After creating the staging app, you need to add the Heroku API key to GitHub secrets:

1. Get your Heroku API key:
   ```bash
   heroku auth:token
   ```

2. Add to GitHub repository secrets:
   - Go to: https://github.com/abodable-dev/trapid/settings/secrets/actions
   - Add secret: `HEROKU_API_KEY` with your Heroku auth token
   - **Note:** The secret might already exist if production deployment is working

3. Update the workflow file to use `trapid-backend-staging` app name

## Step 8: Update Frontend Staging Environment

Configure the staging frontend to point to the new staging backend:

1. Go to Vercel staging project settings:
   - Navigate to: https://vercel.com/[your-team]/trapid-staging/settings/environment-variables
   - Or find your staging project in Vercel dashboard

2. Add or update the environment variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://trapid-backend-staging.herokuapp.com`
   - **Environment:** Select "Production" (Vercel's production for the staging project)

3. Redeploy the staging frontend:
   ```bash
   # Trigger a redeployment by pushing to rob branch
   git push origin rob

   # Or manually redeploy from Vercel dashboard
   ```

4. Verify the connection:
   - Visit: https://trapid-staging.vercel.app
   - Check browser console - API calls should go to `trapid-backend-staging.herokuapp.com`
   - Test login or any API functionality

## Ongoing: Refresh Staging Database

To reset staging database from production data (useful periodically):

```bash
# Capture fresh production backup
heroku pg:backups:capture -a trapid-backend

# Get backup URL
BACKUP_URL=$(heroku pg:backups:url -a trapid-backend)

# Restore to staging (overwrites staging data!)
heroku pg:backups:restore "$BACKUP_URL" DATABASE_URL -a trapid-backend-staging --confirm trapid-backend-staging
```

**WARNING:** This will completely replace staging data with production data!

## Troubleshooting

### Database copy fails
```bash
# Check production database size
heroku pg:info -a trapid-backend

# Ensure staging database plan can handle the size
heroku addons:upgrade heroku-postgresql:standard-0 -a trapid-backend-staging
```

### Deployment fails
```bash
# Check build logs
heroku logs --tail -a trapid-backend-staging

# Ensure all buildpacks are set
heroku buildpacks -a trapid-backend-staging
heroku buildpacks:add heroku/ruby -a trapid-backend-staging
```

### Environment variables missing
```bash
# Compare production vs staging config
diff <(heroku config -a trapid-backend | sort) <(heroku config -a trapid-backend-staging | sort)
```

## Summary

After completion, you'll have:

- ✅ `trapid-backend` (production) at https://trapid-backend-447058022b51.herokuapp.com
- ✅ `trapid-backend-staging` at https://trapid-backend-staging.herokuapp.com
- ✅ `rob` branch deploys to staging backend
- ✅ `main` branch deploys to production backend
- ✅ Staging frontend at https://trapid-staging.vercel.app connected to staging backend

## Next Steps

Once staging is set up, Rob can:
1. Push changes to `rob` branch
2. Frontend auto-deploys to Vercel staging
3. Backend auto-deploys to Heroku staging
4. Test everything in staging environment
5. Create PR to merge to `main` for production deployment
