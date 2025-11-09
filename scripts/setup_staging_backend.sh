#!/bin/bash

# =============================================================================
# Trapid Staging Backend Setup Script
# =============================================================================
# This script automates the creation of a staging Heroku backend environment
#
# Prerequisites:
# - Heroku CLI installed: brew install heroku/brew/heroku
# - Authenticated with Heroku: heroku auth:login
# - Access to trapid-backend production app
#
# Usage:
#   cd /path/to/trapid
#   chmod +x scripts/setup_staging_backend.sh
#   ./scripts/setup_staging_backend.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Trapid Staging Backend Setup${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v heroku &> /dev/null; then
    echo -e "${RED}Error: Heroku CLI not found${NC}"
    echo "Install with: brew install heroku/brew/heroku"
    exit 1
fi

if ! heroku auth:whoami &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with Heroku${NC}"
    echo "Run: heroku auth:login"
    exit 1
fi

echo -e "${GREEN}✓ Heroku CLI found and authenticated${NC}"
echo ""

# Step 1: Create staging app
echo -e "${BLUE}Step 1: Creating Heroku staging app...${NC}"
if heroku apps:info -a trapid-backend-staging &> /dev/null; then
    echo -e "${YELLOW}App 'trapid-backend-staging' already exists. Skipping...${NC}"
else
    heroku create trapid-backend-staging
    echo -e "${GREEN}✓ Created trapid-backend-staging${NC}"
fi
echo ""

# Step 2: Add PostgreSQL
echo -e "${BLUE}Step 2: Adding PostgreSQL database...${NC}"
if heroku addons:info heroku-postgresql -a trapid-backend-staging &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL already exists. Skipping...${NC}"
else
    heroku addons:create heroku-postgresql:essential-0 -a trapid-backend-staging
    echo -e "${GREEN}✓ PostgreSQL database added${NC}"
    echo -e "${YELLOW}Waiting for database to provision...${NC}"
    heroku pg:wait -a trapid-backend-staging
    echo -e "${GREEN}✓ Database ready${NC}"
fi
echo ""

# Step 3: Copy production database
echo -e "${BLUE}Step 3: Copying production database to staging...${NC}"
read -p "This will overwrite staging database with production data. Continue? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Capturing production backup...${NC}"
    heroku pg:backups:capture -a trapid-backend

    echo -e "${YELLOW}Getting backup URL...${NC}"
    BACKUP_URL=$(heroku pg:backups:url -a trapid-backend)

    echo -e "${YELLOW}Restoring to staging...${NC}"
    heroku pg:backups:restore "$BACKUP_URL" DATABASE_URL -a trapid-backend-staging --confirm trapid-backend-staging

    echo -e "${GREEN}✓ Database copied from production to staging${NC}"
else
    echo -e "${YELLOW}Skipping database copy${NC}"
fi
echo ""

# Step 4: Copy environment variables
echo -e "${BLUE}Step 4: Copying environment variables...${NC}"
echo -e "${YELLOW}Fetching production config...${NC}"

# Get production config
heroku config -a trapid-backend --shell > /tmp/trapid_prod_config.env

# Read production config and set on staging
echo -e "${YELLOW}Setting config vars on staging...${NC}"
while IFS='=' read -r key value; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" =~ ^# ]] && continue

    # Update FRONTEND_URL to point to staging
    if [ "$key" = "FRONTEND_URL" ]; then
        echo -e "${BLUE}  Setting FRONTEND_URL=https://trapid-staging.vercel.app${NC}"
        heroku config:set FRONTEND_URL=https://trapid-staging.vercel.app -a trapid-backend-staging
    else
        # Set other config vars as-is
        echo -e "${BLUE}  Setting $key${NC}"
        heroku config:set "$key=$value" -a trapid-backend-staging
    fi
done < /tmp/trapid_prod_config.env

# Clean up
rm /tmp/trapid_prod_config.env

echo -e "${GREEN}✓ Environment variables copied and configured${NC}"
echo ""

# Step 5: Add git remote
echo -e "${BLUE}Step 5: Adding Heroku git remote...${NC}"
if git remote get-url heroku-staging &> /dev/null; then
    echo -e "${YELLOW}Remote 'heroku-staging' already exists. Removing and re-adding...${NC}"
    git remote remove heroku-staging
fi

heroku git:remote -a trapid-backend-staging -r heroku-staging
echo -e "${GREEN}✓ Git remote added${NC}"
echo ""

# Step 6: Deploy to staging
echo -e "${BLUE}Step 6: Deploying backend to staging...${NC}"
read -p "Deploy now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deploying backend subdirectory...${NC}"

    # Try git subtree push, fall back to force push if it fails
    if ! git subtree push --prefix backend heroku-staging main; then
        echo -e "${YELLOW}Standard push failed, trying force push...${NC}"
        git push heroku-staging `git subtree split --prefix backend HEAD`:main --force
    fi

    echo -e "${GREEN}✓ Backend deployed to staging${NC}"
else
    echo -e "${YELLOW}Skipping deployment${NC}"
    echo -e "${BLUE}To deploy later, run:${NC}"
    echo -e "  git subtree push --prefix backend heroku-staging main"
fi
echo ""

# Step 7: Verify setup
echo -e "${BLUE}Step 7: Verifying setup...${NC}"
echo -e "${YELLOW}App status:${NC}"
heroku ps -a trapid-backend-staging

echo ""
echo -e "${YELLOW}Database info:${NC}"
heroku pg:info -a trapid-backend-staging

echo ""
echo -e "${YELLOW}Environment variables (first 5):${NC}"
heroku config -a trapid-backend-staging | head -6

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Setup Complete! 🎉${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}Staging Backend:${NC} https://trapid-backend-staging.herokuapp.com"
echo -e "${BLUE}Staging Frontend:${NC} https://trapid-staging.vercel.app"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure Vercel staging environment variable:"
echo "   - Go to Vercel staging project settings"
echo "   - Set VITE_API_URL=https://trapid-backend-staging.herokuapp.com"
echo ""
echo "2. Test the staging backend:"
echo "   curl https://trapid-backend-staging.herokuapp.com/"
echo ""
echo "3. Push to 'rob' branch to trigger automatic deployments:"
echo "   git checkout rob"
echo "   git push origin rob"
echo ""
echo -e "${GREEN}Done!${NC}"
