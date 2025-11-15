#!/bin/bash

# Pre-commit hook to enforce Gantt onboarding checklist
# Install: cp scripts/check-gantt-onboarding.sh .git/hooks/pre-commit
# Make executable: chmod +x .git/hooks/pre-commit

# ANSI color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Files that trigger the check
GANTT_FRONTEND_FILES=(
  "frontend/src/components/schedule-master/DHtmlxGanttView.jsx"
  "frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx"
  "frontend/src/components/schedule-master/CascadeDependenciesModal.jsx"
  "frontend/src/utils/ganttDebugger.js"
)

GANTT_BACKEND_FILES=(
  "backend/app/services/schedule_cascade_service.rb"
  "backend/app/controllers/api/v1/schedule_template_rows_controller.rb"
  "backend/app/models/schedule_template_row.rb"
)

# Check if any Gantt files are being modified
modified_gantt_files=()

for file in "${GANTT_FRONTEND_FILES[@]}" "${GANTT_BACKEND_FILES[@]}"; do
  if git diff --cached --name-only | grep -q "$file"; then
    modified_gantt_files+=("$file")
  fi
done

# If no Gantt files modified, allow commit
if [ ${#modified_gantt_files[@]} -eq 0 ]; then
  exit 0
fi

# Gantt files are being modified - show warning
echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}                    ⚠️  GANTT CODE MODIFICATION DETECTED  ⚠️${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}You are modifying Gantt/Schedule code:${NC}"
for file in "${modified_gantt_files[@]}"; do
  echo -e "  ${YELLOW}→${NC} $file"
done
echo ""

# Check if onboarding checklist exists and has been completed
CHECKLIST_FILE="GANTT_ONBOARDING_CHECKLIST.md"

if [ ! -f "$CHECKLIST_FILE" ]; then
  echo -e "${RED}❌ FATAL: Onboarding checklist not found!${NC}"
  echo -e "   Expected: $CHECKLIST_FILE"
  exit 1
fi

# Check if the checklist has been signed (contains a signature)
if ! grep -q "Developer Name:.*[A-Za-z]" "$CHECKLIST_FILE"; then
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}                      ⛔ ONBOARDING NOT COMPLETED ⛔${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${RED}You MUST complete the Gantt onboarding checklist before modifying Gantt code.${NC}"
  echo ""
  echo -e "${BLUE}Required Steps:${NC}"
  echo -e "  ${GREEN}1.${NC} Read ${YELLOW}GANTT_SCHEDULE_RULES.md${NC} (The Bible) - Focus on 🚨 CRITICAL section"
  echo -e "  ${GREEN}2.${NC} Read ${YELLOW}GANTT_BIBLE_COLUMNS.md${NC} - Column implementation reference"
  echo -e "  ${GREEN}3.${NC} Read ${YELLOW}GANTT_BUGS_AND_FIXES.md${NC} - Bug history and patterns"
  echo -e "  ${GREEN}4.${NC} Complete ${YELLOW}GANTT_ONBOARDING_CHECKLIST.md${NC} - Answer all questions"
  echo -e "  ${GREEN}5.${NC} Get checklist reviewed and signed by senior developer"
  echo ""
  echo -e "${YELLOW}Why This Matters:${NC}"
  echo -e "  • Gantt code has subtle patterns that took 8+ iterations to fix"
  echo -e "  • Predecessor ID mismatch bug causes HOURS of debugging"
  echo -e "  • Infinite render loops cause severe UI flickering"
  echo -e "  • Anti-loop flags must NOT be 'optimized' away"
  echo ""
  echo -e "${RED}Estimated time to complete onboarding: 45 minutes${NC}"
  echo ""
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}To bypass this check (NOT RECOMMENDED):${NC}"
  echo -e "  ${BLUE}git commit --no-verify${NC}"
  echo ""
  exit 1
fi

# Checklist is signed - show reminder
echo -e "${GREEN}✅ Onboarding checklist completed${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                         GANTT CODE REMINDER${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Before committing, verify:${NC}"
echo ""
echo -e "  ${GREEN}□${NC} Re-read 🚨 CRITICAL section of GANTT_SCHEDULE_RULES.md"
echo -e "  ${GREEN}□${NC} DIAGNOSTIC_MODE enabled during testing"
echo -e "  ${GREEN}□${NC} Bug Hunter run before and after changes: ${BLUE}window.printBugHunterReport()${NC}"
echo -e "  ${GREEN}□${NC} All 10 Bug Hunter tests pass"
echo -e "  ${GREEN}□${NC} Test #1 passes: ≤ 2 API calls per task"
echo -e "  ${GREEN}□${NC} Test #2 passes: ≤ 5 reloads per drag"
echo -e "  ${GREEN}□${NC} No screen flickering during drag operations"
echo -e "  ${GREEN}□${NC} Tested with locked AND unlocked tasks"
echo -e "  ${GREEN}□${NC} Tested cascade with 3+ levels of dependencies"
echo -e "  ${GREEN}□${NC} Did NOT modify Protected Code Patterns without approval"
echo ""
echo -e "${YELLOW}Critical Bugs to Avoid:${NC}"
echo -e "  ${RED}✗${NC} Predecessor ID mismatch (1-based vs 0-based)"
echo -e "  ${RED}✗${NC} Resetting isLoadingData flag in drag handler"
echo -e "  ${RED}✗${NC} Reducing 500ms timeout (tested value)"
echo -e "  ${RED}✗${NC} Forgetting to preserve predecessor_ids in API calls"
echo -e "  ${RED}✗${NC} Checking only one lock type instead of all 5"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Prompt user to confirm they've done the checks
read -p "$(echo -e ${YELLOW}Have you completed all the checks above? [y/N]${NC} )" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${RED}Commit cancelled. Please complete the checks and try again.${NC}"
  echo ""
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Proceeding with commit...${NC}"
echo ""

exit 0
