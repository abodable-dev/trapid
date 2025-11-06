# Trapid Configuration Variables - Complete Reference

**Quick reference guide for all environment variables used in the Trapid project.**

> 📖 For detailed setup instructions, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)

---

## Table of Contents

- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [ML Service Environment Variables](#ml-service-environment-variables)
- [Priority Guide](#priority-guide)
- [Quick Setup Commands](#quick-setup-commands)

---

## Backend Environment Variables

Located in: `backend/.env`

### 🔴 Critical (Required for Basic Operation)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost/trapid_development` | Local: Install PostgreSQL<br>Production: Auto-set by Heroku |
| `RAILS_ENV` | Rails environment | `development` / `production` | Set manually |
| `SECRET_KEY_BASE` | Rails session encryption key | `a1b2c3d4...` | Run: `bin/rails secret` |
| `FRONTEND_URL` | Frontend URL for OAuth redirects | `http://localhost:5173` | Your frontend URL |

### 🟡 Important (Required for Key Features)

#### Microsoft OneDrive Integration
| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `ONEDRIVE_CLIENT_ID` | Azure app client ID | `12345678-1234-1234-1234-123456789012` | [Azure Portal](https://portal.azure.com) → App registrations |
| `ONEDRIVE_CLIENT_SECRET` | Azure app client secret | `abc123~...` | Azure Portal → Certificates & secrets |
| `ONEDRIVE_REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/api/v1/onedrive/callback` | Set to match your backend URL |

#### Xero Accounting Integration
| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `XERO_CLIENT_ID` | Xero app client ID | `ABC123...` | [Xero Developer](https://developer.xero.com/app/manage) |
| `XERO_CLIENT_SECRET` | Xero app client secret | `XYZ789...` | Xero Developer Portal |
| `XERO_REDIRECT_URI` | OAuth callback URL | `http://localhost:5173/settings/xero/callback` | Set to match your frontend URL |

#### Cloudinary Image Storage
| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dtg6d2c7h` | [Cloudinary Dashboard](https://cloudinary.com/console) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `895213223838643` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `Cl1Ufiux0...` | Cloudinary Dashboard |

#### Anthropic Claude AI
| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-api03-...` | [Anthropic Console](https://console.anthropic.com) → API Keys |

### 🟢 Optional (Enhanced Features)

#### xAI Grok (Alternative AI)
| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `XAI_API_KEY` | Grok API key | `xai-...` | [xAI Console](https://x.ai) (currently beta) |

#### Google Search API (Better Image Search)
| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `GOOGLE_SEARCH_API_KEY` | Google API key | `AIzaSy...` | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_SEARCH_CX` | Custom Search Engine ID | `012345678...` | [Programmable Search Engine](https://programmablesearchengine.google.com) |

### ⚙️ Advanced (Auto-configured or Optional)

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `RAILS_MAX_THREADS` | Puma max threads | `5` | Optional performance tuning |
| `RAILS_LOG_TO_STDOUT` | Log to stdout | `enabled` | Set for Heroku/production |
| `WEB_CONCURRENCY` | Puma workers | auto | For production scaling |
| `PIDFILE` | Puma PID file location | auto | Set by deployment platform |
| `SOLID_QUEUE_IN_PUMA` | Run Solid Queue in Puma | false | Advanced: in-process job queue |

---

## Frontend Environment Variables

Located in: `frontend/.env`

### 🔴 Critical (Required)

| Variable | Description | Example | Notes |
|----------|-------------|---------|-------|
| `VITE_API_URL` | Backend API URL | Development: `http://localhost:3000`<br>Production: `https://trapid-backend-447058022b51.herokuapp.com` | Must match backend URL |

### ℹ️ Auto-configured (No Setup Needed)

| Variable | Description | When Set |
|----------|-------------|----------|
| `import.meta.env.MODE` | Vite mode | Auto-set by Vite (`development` or `production`) |
| `import.meta.env.DEV` | Development flag | Auto-set by Vite |
| `import.meta.env.PROD` | Production flag | Auto-set by Vite |

---

## ML Service Environment Variables

Located in: `backend/ml_service/.env`

### 🔴 Required (If Using ML Service)

| Variable | Description | Example | Notes |
|----------|-------------|---------|-------|
| `DATABASE_URL` | PostgreSQL connection (same as Rails) | `postgresql://localhost:5432/trapid_development` | Shares database with Rails |
| `REDIS_URL` | Redis for Celery task queue | `redis://localhost:6379/0` | Optional unless using background tasks |
| `LOG_LEVEL` | Logging verbosity | `INFO` / `DEBUG` | Default: `INFO` |

---

## Priority Guide

### Minimal Setup (Get Started Quickly)

Just need these to run locally:

```bash
# backend/.env
DATABASE_URL=postgresql://localhost/trapid_development
RAILS_ENV=development
SECRET_KEY_BASE=<run: bin/rails secret>
FRONTEND_URL=http://localhost:5173

# frontend/.env
VITE_API_URL=http://localhost:3000
```

### Standard Development Setup

Add integrations one at a time:

1. **Start with basics** ↑
2. **Add Cloudinary** (for image uploads)
3. **Add OneDrive** (for document storage)
4. **Add Xero** (for invoice syncing)
5. **Add Claude AI** (for AI features)
6. **Optional: Add Google Search** (for better image search)

### Production Setup

All variables set via deployment platforms:

- **Backend (Heroku):** Set via `heroku config:set` or Dashboard
- **Frontend (Vercel):** Set via Project Settings → Environment Variables
- **ML Service:** Auto-configured from Heroku add-ons

---

## Quick Setup Commands

### Initial Setup

```bash
# Backend
cd backend
cp .env.example .env
echo "SECRET_KEY_BASE=$(bin/rails secret)" >> .env
# Edit .env and add your API keys

# Frontend
cd frontend
cp .env.example .env
# Edit .env and set VITE_API_URL
```

### Verify Configuration

```bash
# Check what's currently set (backend)
cd backend
cat .env | grep -v '^#' | grep -v '^$'

# Check what's currently set (frontend)
cd frontend
cat .env | grep -v '^#' | grep -v '^$'
```

### Test Integrations

```bash
# Test database connection
cd backend
bin/rails db:migrate:status

# Test Cloudinary
bin/rails console
> Cloudinary::Uploader.upload("https://picsum.photos/200")

# Test API connections
bin/rails server
# Visit: http://localhost:3000
```

### Production Config (Heroku)

```bash
# View all config vars
heroku config --app trapid-backend

# Set a config var
heroku config:set VARIABLE_NAME=value --app trapid-backend

# Set multiple at once
heroku config:set \
  CLOUDINARY_CLOUD_NAME=your_cloud \
  CLOUDINARY_API_KEY=your_key \
  CLOUDINARY_API_SECRET=your_secret \
  --app trapid-backend
```

---

## Environment Files Summary

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `backend/.env.example` | Template with documentation | ✅ Yes |
| `backend/.env` | Your actual secrets | ❌ No (in .gitignore) |
| `frontend/.env.example` | Template with documentation | ✅ Yes |
| `frontend/.env` | Your actual secrets | ❌ No (in .gitignore) |
| `backend/ml_service/.env.example` | ML service template | ✅ Yes |
| `backend/ml_service/.env` | Your actual secrets | ❌ No (in .gitignore) |
| `.env.production` | Production frontend URL only | ✅ Yes (no secrets) |

---

## Usage by Feature

### Which variables are needed for each feature?

| Feature | Required Variables |
|---------|-------------------|
| **Basic app operation** | `DATABASE_URL`, `SECRET_KEY_BASE`, `RAILS_ENV`, `FRONTEND_URL`, `VITE_API_URL` |
| **User authentication** | *(No additional vars needed)* |
| **Product images** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Document storage** | `ONEDRIVE_CLIENT_ID`, `ONEDRIVE_CLIENT_SECRET`, `ONEDRIVE_REDIRECT_URI` |
| **Invoice syncing** | `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_REDIRECT_URI` |
| **AI plan review** | `ANTHROPIC_API_KEY` |
| **AI image selection** | `ANTHROPIC_API_KEY` |
| **Better image search** | `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_CX` *(optional)* |
| **Alternative AI (Grok)** | `XAI_API_KEY` *(optional)* |

---

## Security Checklist

- [ ] Never commit `.env` files (they're in `.gitignore`)
- [ ] Only commit `.env.example` with placeholder values
- [ ] Rotate API keys every 90 days in production
- [ ] Use separate API keys for development and production
- [ ] Set up usage alerts for paid APIs (Anthropic, Google)
- [ ] Monitor Cloudinary storage limits
- [ ] Never share API keys in screenshots or public forums
- [ ] Regenerate keys immediately if compromised

---

## Troubleshooting

### "Missing required environment variable"

1. Check `.env` file exists in correct location
2. Verify variable name is spelled correctly
3. Restart server after changing `.env`
4. No spaces around `=` sign: `KEY=value` not `KEY = value`

### "Invalid API key"

1. Check for extra spaces or newlines in `.env`
2. Verify key hasn't expired
3. Check you're using correct environment (dev vs prod keys)
4. Regenerate key if needed

### "OAuth redirect mismatch"

1. Verify redirect URIs match exactly in:
   - Your `.env` file
   - OAuth provider settings
2. Check for trailing slashes
3. Ensure http vs https matches

---

## Additional Resources

- **Full Setup Guide:** [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
- **Quick Start:** [SETUP.md](SETUP.md)
- **Backend README:** [../backend/README.md](../backend/README.md)
- **Frontend README:** [../frontend/README.md](../frontend/README.md)

---

**Last Updated:** 2025-11-06
**Trapid Version:** v102+
