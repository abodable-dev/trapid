#!/bin/bash

# API Key and Secret Detection Script
# This script scans the codebase for accidentally committed API keys, tokens, and credentials
# Run before every deployment to prevent secrets from being pushed to production

set -e

echo "🔍 Scanning for leaked API keys and secrets..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SECRETS_FOUND=0

# Patterns to detect (regex patterns for common API keys and secrets)
PATTERNS=(
  # API Keys
  "api[_-]?key['\"]?\s*[:=]\s*['\"][a-zA-Z0-9_-]{20,}['\"]"
  "apikey['\"]?\s*[:=]\s*['\"][a-zA-Z0-9_-]{20,}['\"]"

  # AWS
  "AKIA[0-9A-Z]{16}"
  "aws[_-]?secret[_-]?access[_-]?key"

  # Generic secrets
  "secret[_-]?key['\"]?\s*[:=]\s*['\"][a-zA-Z0-9_-]{20,}['\"]"
  "password['\"]?\s*[:=]\s*['\"][^'\"]{8,}['\"]"
  "private[_-]?key['\"]?\s*[:=]"

  # Tokens
  "bearer\s+[a-zA-Z0-9_-]{20,}"
  "token['\"]?\s*[:=]\s*['\"][a-zA-Z0-9_-]{20,}['\"]"
  "access[_-]?token['\"]?\s*[:=]"

  # OAuth
  "client[_-]?secret['\"]?\s*[:=]"
  "oauth[_-]?token"

  # Database URLs with passwords
  "postgres://[^:]+:[^@]+@"
  "mysql://[^:]+:[^@]+@"

  # Stripe
  "sk_live_[a-zA-Z0-9]{24,}"
  "pk_live_[a-zA-Z0-9]{24,}"

  # GitHub
  "gh[pousr]_[a-zA-Z0-9]{36,}"

  # Heroku
  "heroku.*api.*key"

  # Generic base64 encoded secrets (common pattern)
  "secret.*['\"]?:\s*['\"][A-Za-z0-9+/]{40,}={0,2}['\"]"
)

# Files and directories to exclude
EXCLUDES=(
  ".git"
  "node_modules"
  "vendor"
  "tmp"
  "log"
  "coverage"
  "public/assets"
  "public/packs"
  "*.log"
  "*.min.js"
  "*.bundle.js"
  "check_for_secrets.sh"  # Don't flag ourselves!
  "*.sample"  # Sample files are safe
  ".kamal/secrets"  # Kamal secrets management file
  "*.example"  # Example files are safe
)

# Build the grep exclude arguments
EXCLUDE_ARGS=""
for exclude in "${EXCLUDES[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=$exclude --exclude=$exclude"
done

# Check each pattern
for pattern in "${PATTERNS[@]}"; do
  # Search for the pattern in tracked git files
  if matches=$(git grep -iE "$pattern" -- \
    ':(exclude)*.md' \
    ':(exclude)scripts/check_for_secrets.sh' \
    ':(exclude)*.sample' \
    ':(exclude)*.example' \
    ':(exclude).kamal/secrets' \
    ':(exclude)config/database.yml' 2>/dev/null); then

    # Filter out lines that are comments or use ENV variables correctly
    filtered_matches=$(echo "$matches" | grep -v "ENV\[" | grep -v "ENV\.fetch" | grep -v "^\s*#")

    if [ -n "$filtered_matches" ]; then
      echo -e "${RED}❌ POTENTIAL SECRET FOUND:${NC}"
      echo "$filtered_matches"
      echo "---"
      SECRETS_FOUND=1
    fi
  fi
done

# Also check for common secret file names
SECRET_FILES=(
  ".env.production"
  ".env.local"
  "credentials.yml"
  "secrets.yml"
  "master.key"
  "id_rsa"
  "id_dsa"
  ".ssh/id_rsa"
)

for file in "${SECRET_FILES[@]}"; do
  if git ls-files --error-unmatch "$file" 2>/dev/null; then
    echo -e "${RED}❌ SECRET FILE TRACKED:${NC} $file"
    SECRETS_FOUND=1
  fi
done

# Check for hardcoded credentials in common files
echo ""
echo "🔎 Checking common configuration files..."

# Check for hardcoded values in database.yml
if [ -f "config/database.yml" ]; then
  if grep -qiE "password:\s+['\"]?[^'\"<]+['\"]?" config/database.yml | grep -v "<%="; then
    if grep -iE "password:\s+['\"]?[^'\"<]+['\"]?" config/database.yml | grep -vq "<%=\|password:\s*$\|password:\s*['\"]?$"; then
      echo -e "${YELLOW}⚠️  WARNING: Possible hardcoded password in config/database.yml${NC}"
      echo "Make sure all passwords use ENV variables like: <%= ENV['DATABASE_PASSWORD'] %>"
    fi
  fi
fi

# Final result
echo ""
echo "================================================"
if [ $SECRETS_FOUND -eq 1 ]; then
  echo -e "${RED}❌ DEPLOYMENT BLOCKED: Secrets detected!${NC}"
  echo ""
  echo "Action required:"
  echo "1. Remove all hardcoded API keys, tokens, and credentials"
  echo "2. Move secrets to environment variables"
  echo "3. Update .gitignore to exclude sensitive files"
  echo "4. If false positive, update this script's exclusions"
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ No secrets detected - safe to deploy${NC}"
  echo ""
  exit 0
fi
