#!/bin/bash

################################################################################
# Trapid Development Environment Setup Script for macOS
################################################################################
# This script will:
# - Install all development tools (Homebrew, PostgreSQL, Ruby, Node.js, etc.)
# - Clone the Trapid repository from GitHub
# - Set up the database
# - Install all dependencies (backend and frontend)
# - Install VS Code and extensions (including Claude Code)
# - Open the project in VS Code
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/abodable-dev/trapid/main/trapid-mac-setup.sh)
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emoji for better UX
CHECK_MARK="✅"
CROSS_MARK="❌"
ROCKET="🚀"
WRENCH="🔧"
PACKAGE="📦"
DATABASE="🗄️"
FOLDER="📁"
COMPUTER="💻"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}${WRENCH} $1${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECK_MARK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS_MARK} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

wait_for_user() {
    echo ""
    read -p "Press ENTER to continue..."
    echo ""
}

################################################################################
# Pre-flight Checks
################################################################################

print_header "${ROCKET} TRAPID DEVELOPMENT ENVIRONMENT SETUP"

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only."
    print_info "Detected OS: $OSTYPE"
    exit 1
fi

print_success "Running on macOS"

# Get user confirmation
echo -e "${CYAN}This script will install:${NC}"
echo "  • Homebrew (package manager)"
echo "  • PostgreSQL 14 (database)"
echo "  • rbenv + Ruby 3.3.0 (backend language)"
echo "  • Node.js 20 (frontend tooling)"
echo "  • GitHub CLI (gh)"
echo "  • Visual Studio Code (editor)"
echo "  • VS Code extensions (including Claude Code)"
echo "  • Trapid repository and dependencies"
echo ""
print_warning "This may take 15-30 minutes depending on your internet speed."
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Setup cancelled."
    exit 0
fi

################################################################################
# 1. Install Homebrew
################################################################################

print_header "${PACKAGE} INSTALLING HOMEBREW"

if command_exists brew; then
    print_success "Homebrew already installed"
    print_step "Updating Homebrew..."
    brew update
else
    print_step "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi

    print_success "Homebrew installed"
fi

################################################################################
# 2. Install PostgreSQL
################################################################################

print_header "${DATABASE} INSTALLING POSTGRESQL"

if command_exists psql; then
    print_success "PostgreSQL already installed"
else
    print_step "Installing PostgreSQL 14..."
    brew install postgresql@14
    brew services start postgresql@14

    # Add to PATH
    echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"

    print_success "PostgreSQL 14 installed and started"
fi

################################################################################
# 3. Install Ruby via rbenv
################################################################################

print_header "${WRENCH} INSTALLING RUBY"

if command_exists rbenv; then
    print_success "rbenv already installed"
else
    print_step "Installing rbenv and ruby-build..."
    brew install rbenv ruby-build

    # Add rbenv to shell
    echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
    eval "$(rbenv init - zsh)"

    print_success "rbenv installed"
fi

# Install Ruby 3.3.0 if not present
if rbenv versions | grep -q "3.3.0"; then
    print_success "Ruby 3.3.0 already installed"
else
    print_step "Installing Ruby 3.3.0 (this may take a few minutes)..."
    rbenv install 3.3.0
    print_success "Ruby 3.3.0 installed"
fi

rbenv global 3.3.0
print_success "Ruby 3.3.0 set as global version"

################################################################################
# 4. Install Node.js
################################################################################

print_header "${PACKAGE} INSTALLING NODE.JS"

if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js already installed (${NODE_VERSION})"
else
    print_step "Installing Node.js 20..."
    brew install node@20

    # Add to PATH
    echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

    print_success "Node.js 20 installed"
fi

################################################################################
# 5. Install GitHub CLI
################################################################################

print_header "${COMPUTER} INSTALLING GITHUB CLI"

if command_exists gh; then
    print_success "GitHub CLI already installed"
else
    print_step "Installing GitHub CLI..."
    brew install gh
    print_success "GitHub CLI installed"
fi

# Authenticate with GitHub
if gh auth status >/dev/null 2>&1; then
    print_success "Already authenticated with GitHub"
else
    print_step "Authenticating with GitHub..."
    print_info "Please follow the prompts to authenticate with your GitHub account."
    gh auth login
    print_success "GitHub authentication complete"
fi

################################################################################
# 6. Install Visual Studio Code
################################################################################

print_header "${COMPUTER} INSTALLING VISUAL STUDIO CODE"

if command_exists code; then
    print_success "VS Code already installed"
else
    print_step "Installing Visual Studio Code..."
    brew install --cask visual-studio-code
    print_success "VS Code installed"
fi

################################################################################
# 7. Clone Trapid Repository
################################################################################

print_header "${FOLDER} CLONING TRAPID REPOSITORY"

# Ask where to clone
DEFAULT_DIR="$HOME/Projects/trapid"
echo ""
read -p "Where should we clone the repository? [${DEFAULT_DIR}] " CLONE_DIR
CLONE_DIR=${CLONE_DIR:-$DEFAULT_DIR}

# Create parent directory if needed
PARENT_DIR=$(dirname "$CLONE_DIR")
if [[ ! -d "$PARENT_DIR" ]]; then
    print_step "Creating directory: $PARENT_DIR"
    mkdir -p "$PARENT_DIR"
fi

# Clone repository
if [[ -d "$CLONE_DIR" ]]; then
    print_warning "Directory already exists: $CLONE_DIR"
    read -p "Use existing directory? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Setup cancelled. Please specify a different directory."
        exit 1
    fi
else
    print_step "Cloning repository to: $CLONE_DIR"
    gh repo clone abodable-dev/trapid "$CLONE_DIR"
    print_success "Repository cloned"
fi

cd "$CLONE_DIR"

################################################################################
# 8. Setup Backend
################################################################################

print_header "${WRENCH} SETTING UP BACKEND"

cd backend

# Install bundler
print_step "Installing bundler..."
gem install bundler

# Install gems
print_step "Installing Ruby gems (this may take a few minutes)..."
bundle install
print_success "Backend dependencies installed"

# Create .env file
if [[ ! -f .env ]]; then
    print_step "Creating .env file from template..."
    cp .env.example .env

    # Generate SECRET_KEY_BASE
    print_step "Generating SECRET_KEY_BASE..."
    SECRET_KEY=$(bundle exec rails secret)
    echo "" >> .env
    echo "# Generated on $(date)" >> .env
    echo "SECRET_KEY_BASE=$SECRET_KEY" >> .env

    print_success ".env file created"
    print_warning "IMPORTANT: Edit backend/.env and add your API keys for:"
    echo "  - Cloudinary (image storage)"
    echo "  - OneDrive (document storage)"
    echo "  - Xero (accounting integration)"
    echo "  - Anthropic Claude (AI features)"
    print_info "See docs/CONFIG_VARS.md for details"
else
    print_success ".env file already exists"
fi

# Setup database
print_step "Creating database..."
bundle exec rails db:create || print_warning "Database may already exist"

print_step "Running migrations..."
bundle exec rails db:migrate

print_step "Loading seed data..."
bundle exec rails db:seed || print_warning "Seed data may already be loaded"

print_success "Backend setup complete"

cd ..

################################################################################
# 9. Setup Frontend
################################################################################

print_header "${PACKAGE} SETTING UP FRONTEND"

cd frontend

# Create .env file
if [[ ! -f .env ]]; then
    print_step "Creating .env file from template..."
    cp .env.example .env
    print_success ".env file created"
else
    print_success ".env file already exists"
fi

# Install npm packages
print_step "Installing npm packages (this may take a few minutes)..."
npm install
print_success "Frontend dependencies installed"

cd ..

################################################################################
# 10. Install VS Code Extensions
################################################################################

print_header "${COMPUTER} INSTALLING VS CODE EXTENSIONS"

print_step "Installing essential VS Code extensions..."

# List of extensions to install
extensions=(
    "Anthropic.claude-code"          # Claude Code
    "rebornix.Ruby"                  # Ruby
    "Shopify.ruby-lsp"               # Ruby LSP
    "esbenp.prettier-vscode"         # Prettier
    "dbaeumer.vscode-eslint"         # ESLint
    "bradlc.vscode-tailwindcss"      # Tailwind CSS
    "rangav.vscode-thunder-client"   # API testing
    "eamodio.gitlens"                # GitLens
)

for ext in "${extensions[@]}"; do
    if code --list-extensions | grep -q "$ext"; then
        print_success "$ext already installed"
    else
        print_step "Installing $ext..."
        code --install-extension "$ext" --force
    fi
done

print_success "VS Code extensions installed"

################################################################################
# 11. Create VS Code workspace settings
################################################################################

print_step "Creating VS Code workspace settings..."

mkdir -p .vscode

cat > .vscode/settings.json <<'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[ruby]": {
    "editor.defaultFormatter": "Shopify.ruby-lsp"
  },
  "files.associations": {
    "*.jsx": "javascriptreact"
  },
  "ruby.lsp.enabled": true,
  "ruby.format": "rubocop"
}
EOF

print_success "VS Code settings configured"

################################################################################
# Final Instructions
################################################################################

print_header "${ROCKET} SETUP COMPLETE!"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Trapid development environment is ready!                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

print_info "Project location: ${CLONE_DIR}"
echo ""

echo -e "${CYAN}Next steps:${NC}"
echo ""
echo -e "${YELLOW}1. Configure environment variables:${NC}"
echo "   Edit backend/.env and add your API keys"
echo "   See: docs/CONFIG_VARS.md for complete guide"
echo ""
echo -e "${YELLOW}2. Start the development servers:${NC}"
echo ""
echo "   ${BLUE}Terminal 1 - Backend:${NC}"
echo "   cd ${CLONE_DIR}/backend"
echo "   bundle exec rails server"
echo ""
echo "   ${BLUE}Terminal 2 - Frontend:${NC}"
echo "   cd ${CLONE_DIR}/frontend"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}3. Access the application:${NC}"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""

# Offer to open VS Code
echo ""
read -p "Open project in VS Code now? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Opening VS Code..."
    code "$CLONE_DIR"
    print_success "VS Code opened"
else
    print_info "You can open VS Code later with: code ${CLONE_DIR}"
fi

echo ""
print_success "Happy coding! ${ROCKET}"
echo ""
