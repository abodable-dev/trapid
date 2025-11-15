# Gantt & Schedule Master Documentation

**Complete documentation system for Gantt and Schedule Master features**

---

## 🚨 STOP! Read This First

**Are you about to modify Gantt or Schedule code?**

👉 **YOU MUST complete the onboarding checklist FIRST:** [GANTT_ONBOARDING_CHECKLIST.md](GANTT_ONBOARDING_CHECKLIST.md)

**Why?** This code has subtle patterns that took **8+ iterations** to get right. Skip onboarding = hours of debugging bugs we've already fixed.

---

## 📚 Documentation Files

### 1. The Bible (Development Rules)
**File:** [GANTT_SCHEDULE_RULES.md](GANTT_SCHEDULE_RULES.md) (114KB, 3715 lines)

**What it contains:**
- 🚨 **CRITICAL section** - Must-read before touching code (15 min)
- Protected Code Patterns (do NOT modify)
- Complete development rules
- Performance patterns
- Anti-loop mechanisms

**When to read:**
- Before making ANY changes to Gantt code
- When debugging Gantt issues
- Before code reviews

**Start here:** Line 161 - "🚨 CRITICAL: Read Before Touching Gantt Code"

---

### 2. Column Reference
**File:** [GANTT_BIBLE_COLUMNS.md](GANTT_BIBLE_COLUMNS.md) (25KB)

**What it contains:**
- All 33 Schedule Master table columns
- All 11 Gantt modal columns
- Implementation details (file:line references)
- Database field mappings
- Active/Inactive status
- Lock hierarchy and priorities
- Test coverage map

**When to read:**
- Adding or modifying column functionality
- Understanding what a column does
- Finding which service processes a column

---

### 3. Bug Tracking & Bug Hunter
**File:** [GANTT_BUGS_AND_FIXES.md](frontend/public/GANTT_BUGS_AND_FIXES.md) (23KB)

**What it contains:**
- All resolved bugs with case studies
- BUG-001: Drag Flickering (8 iterations to fix!)
- Bug Hunter diagnostic tool usage
- 10 automated test descriptions
- Test results history

**When to read:**
- Debugging Gantt issues
- Running performance diagnostics
- Understanding why code is written a certain way

---

### 4. Onboarding Checklist
**File:** [GANTT_ONBOARDING_CHECKLIST.md](GANTT_ONBOARDING_CHECKLIST.md) (6.3KB)

**What it contains:**
- Step-by-step onboarding process
- Questions to test comprehension
- Hands-on exercises
- Sign-off section for accountability

**When to complete:**
- Before your first Gantt code change
- When onboarding new team members
- As a refresher (re-read critical sections)

**Time required:** 45-60 minutes

---

### 5. Developer Setup & Enforcement
**File:** [GANTT_DEVELOPER_SETUP.md](GANTT_DEVELOPER_SETUP.md) (11KB)

**What it contains:**
- How to install pre-commit hooks
- Enforcement mechanisms
- Team onboarding process
- Tracking metrics
- Support & escalation paths

**When to read:**
- Setting up a new developer
- Configuring CI/CD
- Team lead responsibilities

---

## 🚀 Quick Start

### For New Developers

```bash
# 1. Read the Critical section (15 min)
open GANTT_SCHEDULE_RULES.md
# → Jump to line 161: "🚨 CRITICAL: Read Before Touching Gantt Code"

# 2. Install pre-commit hook
chmod +x scripts/check-gantt-onboarding.sh
cp scripts/check-gantt-onboarding.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 3. Complete onboarding checklist
open GANTT_ONBOARDING_CHECKLIST.md
# → Answer all questions, get it reviewed and signed

# 4. Verify Bug Hunter works
# Open app, go to Schedule Master, click "Gantt Bible"
# In browser console: window.printBugHunterReport()
```

### For Quick Reference

**Looking for a specific topic?**

| Topic | File | Section |
|-------|------|---------|
| Predecessor ID bug | GANTT_SCHEDULE_RULES.md | Line 163 |
| Infinite render loops | GANTT_SCHEDULE_RULES.md | Line 206 |
| useRef anti-loop flags | GANTT_SCHEDULE_RULES.md | Line 276 |
| Lock hierarchy | GANTT_SCHEDULE_RULES.md | Line 352 |
| Column details | GANTT_BIBLE_COLUMNS.md | All columns listed |
| Bug Hunter usage | GANTT_BUGS_AND_FIXES.md | Line 58 |
| Common gotchas | GANTT_SCHEDULE_RULES.md | Line 524 |

---

## 🔍 Bug Hunter Quick Reference

**In browser console:**

```javascript
// Generate diagnostic report
window.printBugHunterReport()

// Enable debug categories
window.enableGanttDebug(['drag', 'api', 'cascade'])

// Export report for bug ticket
window.exportBugHunterReport()

// Reset for new test
window.resetBugHunter()
```

**10 Automated Tests:**
1. Duplicate API Call Detection (≤ 2 per task)
2. Excessive Gantt Reload Detection (≤ 5 per drag)
3. Slow Drag Operation Detection (< 5000ms)
4. API Call Pattern Analysis
5. Cascade Event Tracking
6. State Update Batching (≤ 3 per drag)
7. Lock State Monitoring
8. Performance Timing Analysis
9. Health Status Assessment
10. Actionable Recommendations

---

## 🏗️ Architecture Overview

### Frontend (React)
- **DHtmlxGanttView.jsx** (5276 lines) - Main Gantt component
- **ScheduleTemplateEditor.jsx** (2500+ lines) - Schedule editor
- **CascadeDependenciesModal.jsx** - User cascade choices
- **ganttDebugger.js** - Bug Hunter diagnostic tool

### Backend (Ruby on Rails)
- **ScheduleCascadeService** - Dependency cascade logic
- **ScheduleTemplateRowsController** - API endpoints
- **ScheduleTemplateRow** (model) - With after_update cascade callback

### Key Patterns
- **Predecessor IDs:** 1-based (UI) vs 0-based (sequence_order)
- **Anti-Loop Flags:** `isDragging`, `isLoadingData`, `isSaving`
- **Lock Priority:** supplier_confirm > confirm > start > complete > manually_positioned
- **API Pattern:** Single update + cascade response (not N calls)

---

## ⚠️ The Two Killer Bugs

### #1: Predecessor ID Mismatch

**Problem:** Predecessor IDs are 1-based but sequence_order is 0-based

**Fix:** Always convert with `+ 1`:
```javascript
const predecessorId = task.sequence_order + 1
```

**Impact:** Wrong tasks cascade, hours of debugging

### #2: Infinite Render Loops

**Problem:** `gantt.parse()` fires spurious drag events

**Fix:** Three useRef flags with 500ms timeout:
```javascript
const isDragging = useRef(false)
const isLoadingData = useRef(false)  // Reset by useEffect only!
const isSaving = useRef(false)
```

**Impact:** Screen flickering, 8-16 reloads per drag

---

## 📋 Before Every Commit Checklist

- [ ] Re-read 🚨 CRITICAL section of The Bible
- [ ] DIAGNOSTIC_MODE enabled during testing
- [ ] Bug Hunter run: `window.printBugHunterReport()`
- [ ] All 10 Bug Hunter tests pass
- [ ] Test #2 passes (≤ 5 reloads per drag)
- [ ] No screen flickering
- [ ] Tested with locked AND unlocked tasks
- [ ] Tested 3+ levels of dependencies
- [ ] Did NOT modify Protected Code Patterns

---

## 🆘 Getting Help

### Level 1: Check The Docs
- **GANTT_SCHEDULE_RULES.md** - Development patterns
- **GANTT_BUGS_AND_FIXES.md** - Known issues
- **GANTT_BIBLE_COLUMNS.md** - Column reference

### Level 2: Run Diagnostics
```javascript
window.printBugHunterReport()
```

### Level 3: Ask Team
- Check which specific test is failing (1-10)
- Cross-reference test # to documentation
- Share Bug Hunter output in team chat

### Level 4: Escalate
- Schedule pairing with Gantt expert
- Review historical bugs for similar issues
- Consider if Bible needs updating

---

## 📊 File Sizes

| File | Size | Lines | Purpose |
|------|------|-------|---------|
| GANTT_SCHEDULE_RULES.md | 114KB | 3715 | The Bible - all rules |
| GANTT_BIBLE_COLUMNS.md | 25KB | - | Column reference |
| GANTT_BUGS_AND_FIXES.md | 23KB | - | Bug history |
| GANTT_ONBOARDING_CHECKLIST.md | 6.3KB | - | Onboarding steps |
| GANTT_DEVELOPER_SETUP.md | 11KB | - | Setup & enforcement |
| check-gantt-onboarding.sh | 6.7KB | - | Pre-commit hook |

**Total documentation:** ~186KB

**Time investment:**
- Initial reading: 45-60 minutes
- Time saved: Hours of debugging per developer

---

## 🎯 Success Metrics

**Goals:**
- ✅ Zero reintroduced bugs
- ✅ 100% onboarding completion
- ✅ < 1 hour onboarding time
- ✅ > 95% Bug Hunter pass rate

**Current Status:** [Track in your project management tool]

---

## 🔄 Keeping Documentation Updated

**When to update:**
- New bug discovered and fixed
- New Protected Code Pattern identified
- Architecture changes
- Performance optimizations
- New column added

**How to update:**
1. Make code changes
2. Update relevant documentation file(s)
3. Increment version number in The Bible
4. Update timestamp
5. Add changelog entry
6. Sync to `/frontend/public/` if needed

**Update process:** See GANTT_SCHEDULE_RULES.md lines 30-98

---

## ✅ Installation Complete?

Verify your setup:

```bash
# Check all files exist
ls -lh GANTT*.md scripts/check-gantt-onboarding.sh

# Check hook is installed
ls -lh .git/hooks/pre-commit

# Test the hook
echo "// test" >> frontend/src/components/schedule-master/DHtmlxGanttView.jsx
git add .
git commit -m "test"
# Should show onboarding warning

# Revert test change
git reset HEAD~1
git checkout -- frontend/src/components/schedule-master/DHtmlxGanttView.jsx
```

---

## 📞 Questions?

1. Read GANTT_SCHEDULE_RULES.md (probably already answered)
2. Check GANTT_BUGS_AND_FIXES.md (historical context)
3. Ask in team chat
4. Schedule time with team lead

**Remember:** The goal is preventing bugs, not creating bureaucracy. If something isn't working, let's improve it together!

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-15 | 1.0 | Initial comprehensive documentation system created |

---

**Last Updated:** November 15, 2025
**Maintained By:** Development Team
**Contact:** [Your team's contact info]
