#!/bin/bash

################################################################################
# Install VS Code Extensions for Trapid Development
################################################################################
# This script installs essential VS Code extensions including Claude Code
#
# Usage:
#   bash install-vscode-extensions.sh
################################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Installing VS Code Extensions for Trapid${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if 'code' command is available
if ! command -v code &> /dev/null; then
    echo -e "${RED}❌ VS Code 'code' command not found!${NC}"
    echo ""
    echo "To fix this:"
    echo "1. Open Visual Studio Code"
    echo "2. Press Cmd+Shift+P (Command Palette)"
    echo "3. Type: 'Shell Command: Install code command in PATH'"
    echo "4. Press Enter"
    echo "5. Then run this script again"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ VS Code command-line tool found${NC}"
echo ""

# List of extensions to install
declare -a extensions=(
    "Anthropic.claude-code"          # Claude Code - AI pair programming
    "rebornix.Ruby"                  # Ruby language support
    "Shopify.ruby-lsp"               # Ruby LSP - fast IntelliSense
    "esbenp.prettier-vscode"         # Prettier - code formatter
    "dbaeumer.vscode-eslint"         # ESLint - JavaScript linting
    "bradlc.vscode-tailwindcss"      # Tailwind CSS IntelliSense
    "dsznajder.es7-react-js-snippets" # React snippets
    "eamodio.gitlens"                # GitLens - Git supercharged
    "GitHub.copilot"                 # GitHub Copilot (optional, requires subscription)
    "ms-azuretools.vscode-docker"    # Docker support
    "ritwickdey.LiveServer"          # Live Server for quick previews
)

echo -e "${CYAN}Installing ${#extensions[@]} extensions...${NC}"
echo ""

installed_count=0
skipped_count=0
failed_count=0

for ext in "${extensions[@]}"; do
    # Check if extension is already installed
    if code --list-extensions | grep -qi "^${ext}$"; then
        echo -e "${YELLOW}⏭️  ${ext} - already installed${NC}"
        ((skipped_count++))
    else
        echo -e "${CYAN}📦 Installing ${ext}...${NC}"
        if code --install-extension "$ext" --force > /dev/null 2>&1; then
            echo -e "${GREEN}✅ ${ext} - installed successfully${NC}"
            ((installed_count++))
        else
            echo -e "${RED}❌ ${ext} - installation failed${NC}"
            ((failed_count++))
        fi
    fi
done

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Installation Summary:${NC}"
echo -e "  ✅ Newly installed: ${installed_count}"
echo -e "  ⏭️  Already installed: ${skipped_count}"
if [ $failed_count -gt 0 ]; then
    echo -e "  ${RED}❌ Failed: ${failed_count}${NC}"
fi
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Create workspace settings
echo -e "${CYAN}📝 Creating VS Code workspace settings...${NC}"

mkdir -p .vscode

cat > .vscode/settings.json <<'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[ruby]": {
    "editor.defaultFormatter": "Shopify.ruby-lsp",
    "editor.formatOnSave": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.associations": {
    "*.jsx": "javascriptreact"
  },
  "ruby.lsp.enabled": true,
  "ruby.format": "rubocop",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "git.autofetch": true,
  "editor.minimap.enabled": false,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/tmp": true,
    "**/log": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/tmp": true,
    "**/log": true,
    "**/dist": true
  }
}
EOF

echo -e "${GREEN}✅ Workspace settings created${NC}"
echo ""

# Create recommended extensions file
cat > .vscode/extensions.json <<'EOF'
{
  "recommendations": [
    "Anthropic.claude-code",
    "rebornix.Ruby",
    "Shopify.ruby-lsp",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "eamodio.gitlens"
  ]
}
EOF

echo -e "${GREEN}✅ Extension recommendations created${NC}"
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo ""
echo "1. Open the project in VS Code:"
echo "   ${YELLOW}code ~/Projects/trapid${NC}"
echo ""
echo "2. Start using Claude Code:"
echo "   - Press: ${YELLOW}Cmd+Shift+P${NC}"
echo "   - Type: ${YELLOW}Claude Code: Open${NC}"
echo "   - Or look for the Claude icon in the sidebar"
echo ""
echo "3. Reload VS Code if extensions don't appear:"
echo "   - Press: ${YELLOW}Cmd+Shift+P${NC}"
echo "   - Type: ${YELLOW}Developer: Reload Window${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
