# Gantt Developer Setup & Enforcement

This document explains how to set up and enforce the Gantt onboarding process for all developers.

---

## 🎯 Goals

1. Ensure all developers read the Gantt Bible before modifying code
2. Prevent reintroduction of bugs that took 8+ iterations to fix
3. Maintain code quality through automated checks
4. Create a culture of documentation-first development

---

## 📚 Documentation Structure

```
trapid/
├── GANTT_SCHEDULE_RULES.md          ← The Bible (development rules)
├── GANTT_BIBLE_COLUMNS.md           ← Column implementation reference
├── GANTT_BUGS_AND_FIXES.md          ← Bug history and Bug Hunter
├── GANTT_ONBOARDING_CHECKLIST.md    ← Mandatory onboarding checklist
├── GANTT_DEVELOPER_SETUP.md         ← This file
└── scripts/
    └── check-gantt-onboarding.sh    ← Pre-commit hook
```

All documentation is also available in `/frontend/public/` for the UI "Gantt Bible" button.

---

## 🚀 Setup for New Developers

### Step 1: Install Pre-Commit Hook

```bash
# Navigate to project root
cd /Users/rob/Projects/trapid

# Make the script executable
chmod +x scripts/check-gantt-onboarding.sh

# Install the hook
cp scripts/check-gantt-onboarding.sh .git/hooks/pre-commit

# Make the hook executable
chmod +x .git/hooks/pre-commit
```

### Step 2: Complete Onboarding

New developers must complete the onboarding checklist:

```bash
# Open the checklist
open GANTT_ONBOARDING_CHECKLIST.md

# Follow all steps:
# 1. Read GANTT_SCHEDULE_RULES.md (focus on 🚨 CRITICAL section)
# 2. Read GANTT_BIBLE_COLUMNS.md
# 3. Read GANTT_BUGS_AND_FIXES.md
# 4. Answer all questions in the checklist
# 5. Get checklist reviewed and signed by senior dev
```

**Estimated time:** 45-60 minutes

### Step 3: Verify Setup

Try to commit a change to Gantt code:

```bash
# Make a test change
echo "// test" >> frontend/src/components/schedule-master/DHtmlxGanttView.jsx

# Try to commit (should trigger the check)
git add .
git commit -m "test"

# You should see the onboarding warning
# If checklist is not signed, commit will be blocked
```

---

## 🛡️ Enforcement Mechanisms

### 1. Pre-Commit Hook (Automated)

**What it does:**
- Detects when Gantt/Schedule files are modified
- Checks if onboarding checklist has been completed (signed)
- Blocks commits if checklist not signed
- Shows reminders even after onboarding completed

**Files that trigger the check:**
- `frontend/src/components/schedule-master/DHtmlxGanttView.jsx`
- `frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx`
- `frontend/src/components/schedule-master/CascadeDependenciesModal.jsx`
- `frontend/src/utils/ganttDebugger.js`
- `backend/app/services/schedule_cascade_service.rb`
- `backend/app/controllers/api/v1/schedule_template_rows_controller.rb`
- `backend/app/models/schedule_template_row.rb`

**Bypass (NOT RECOMMENDED):**
```bash
git commit --no-verify  # Skips the hook
```

### 2. Code Review Checklist (Manual)

During code reviews, reviewers must verify:

- [ ] Developer has completed onboarding (check signature in checklist)
- [ ] Bug Hunter tests pass (screenshot in PR)
- [ ] No Protected Code Patterns modified without justification
- [ ] Changes documented if they affect The Bible

**Template for PR description:**
```markdown
## Gantt Changes

- [ ] Onboarding completed: ✅ Signed by [Name] on [Date]
- [ ] Bug Hunter status: ✅ All tests passing (see screenshot)
- [ ] Protected patterns: ✅ Not modified OR ✅ Approved by [Name]
- [ ] Bible updated: ✅ Yes OR ⬜ N/A (no architectural changes)

### Bug Hunter Results
[Paste screenshot or output from `window.printBugHunterReport()`]

### Changes Summary
[Describe what you changed and why]
```

### 3. CI/CD Integration (Optional)

Add to your CI pipeline (`.github/workflows/` or similar):

```yaml
- name: Check Gantt Bug Hunter Tests
  run: |
    cd frontend
    npm run test:e2e -- gantt-cascade.spec.js
```

### 4. Slack/Teams Bot (Optional)

Create a bot that:
- Posts reminder when Gantt PR is opened
- Links to onboarding checklist
- Requires Bug Hunter screenshot before approval

---

## 👥 Onboarding Process for Teams

### For New Hires

1. **Week 1:** General codebase onboarding
2. **Week 2:** Complete Gantt onboarding checklist
3. **Week 3:** Pair with senior dev on small Gantt fix
4. **Week 4:** Independent Gantt work with code review

### For External Contractors

**Before starting work:**
1. Send GANTT_SCHEDULE_RULES.md, GANTT_BIBLE_COLUMNS.md
2. Schedule 30-minute video call to walk through critical sections
3. Require signed onboarding checklist before granting repo access
4. First 3 Gantt PRs require senior dev approval

### For Senior Developers

Even senior devs should:
1. Re-read 🚨 CRITICAL section before working on Gantt
2. Run Bug Hunter before and after changes
3. Update The Bible when discovering new patterns

---

## 📊 Tracking Onboarding Completion

### Onboarding Log

Maintain a log in your team wiki or project management tool:

| Developer | Start Date | Completion Date | Reviewer | Status |
|-----------|------------|-----------------|----------|--------|
| Alice Dev | 2025-11-10 | 2025-11-10 | Bob Senior | ✅ Complete |
| Charlie   | 2025-11-12 | Pending | - | 🟡 In Progress |

### Metrics to Track

- **Time to complete onboarding:** Target < 1 hour
- **Gantt bugs introduced:** Target = 0 in first 90 days
- **Bug Hunter test failures:** Target < 5% of commits
- **Documentation updates:** Target = 1 per month

---

## 🔧 Maintaining The System

### Monthly Review

Once per month:
- Review all Gantt-related PRs from past month
- Check if any bugs were reintroduced
- Update The Bible with new patterns discovered
- Review onboarding times and adjust checklist if needed

### Updating The Hook

If you add new Gantt files, update the hook:

```bash
# Edit scripts/check-gantt-onboarding.sh
# Add new files to GANTT_FRONTEND_FILES or GANTT_BACKEND_FILES arrays

# Reinstall
cp scripts/check-gantt-onboarding.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### When Onboarding Takes Too Long

If developers report onboarding takes > 1 hour:
- Review the checklist for unnecessary steps
- Create a video walkthrough of critical sections (15 min)
- Add more examples/diagrams
- Consider splitting into "Essential" and "Advanced" checklists

---

## 🚨 Handling Violations

### First Offense

**Scenario:** Developer commits Gantt code without completing onboarding

**Action:**
1. Politely point to GANTT_ONBOARDING_CHECKLIST.md
2. Ask them to complete it before next Gantt change
3. Review their changes for common bugs
4. Add their name to onboarding log as "Pending"

### Repeated Offenses

**Scenario:** Developer repeatedly bypasses onboarding or introduces known bugs

**Action:**
1. Schedule 1-on-1 meeting to understand blockers
2. Pair with senior dev for next 3 Gantt changes
3. Restrict Gantt file access until onboarding complete
4. Consider adding mandatory PR template

### Critical Bug Introduced

**Scenario:** Developer reintroduces a bug from GANTT_BUGS_AND_FIXES.md

**Action:**
1. Immediate rollback if in production
2. Root cause analysis: Did they read The Bible?
3. Update The Bible to make that section more prominent
4. Consider adding that bug to the pre-commit hook check
5. All-hands meeting to review the incident

---

## 📞 Support & Escalation

### When Developers Get Stuck

**"The Bible is too long, I don't have time"**
- Direct them to 🚨 CRITICAL section only (15 minutes)
- Offer to schedule 15-minute walkthrough
- Emphasize time savings: 15 min reading vs 2+ hours debugging

**"I don't understand the predecessor ID mismatch"**
- Point to GANTT_SCHEDULE_RULES.md line 161 (example code)
- Show them backend: schedule_cascade_service.rb:88
- Pair program: Make a test change together

**"Bug Hunter is failing but I don't know why"**
- Run `window.printBugHunterReport()` in browser console
- Check which specific test is failing (1-10)
- Cross-reference test # to GANTT_BIBLE_COLUMNS.md

### Escalation Path

1. **Level 1:** Check The Bible (GANTT_SCHEDULE_RULES.md)
2. **Level 2:** Run Bug Hunter diagnostics
3. **Level 3:** Check bug history (GANTT_BUGS_AND_FIXES.md)
4. **Level 4:** Ask in team chat #gantt-help
5. **Level 5:** Schedule pairing session with Gantt expert

---

## 🎓 Advanced: Creating Training Materials

### Video Walkthrough (Recommended)

Create a 15-minute video covering:
- **Minute 0-5:** Why this onboarding exists (8 iterations story)
- **Minute 5-10:** The #1 and #2 killer bugs with examples
- **Minute 10-15:** How to use Bug Hunter and verify your changes

### Interactive Workshop (Optional)

Host a 1-hour workshop:
- **0-15 min:** Overview of Gantt architecture
- **15-30 min:** Live demo of common bugs
- **30-45 min:** Hands-on: Each dev makes a test change
- **45-60 min:** Code review simulation

### Quiz/Certification (Optional)

Create a 10-question quiz:
- Predecessor ID conversion question
- Lock hierarchy ordering
- useRef flag purposes
- Bug Hunter interpretation
- Require 90% to pass

---

## 📈 Success Metrics

Track these KPIs to measure onboarding effectiveness:

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Bugs reintroduced | 0 | - | - |
| Onboarding time | < 60 min | - | - |
| Bug Hunter pass rate | > 95% | - | - |
| Time to first Gantt commit | < 2 weeks | - | - |
| Developer satisfaction | > 4/5 | - | - |

---

## 🔄 Feedback Loop

**Monthly developer feedback survey:**

1. Was the onboarding helpful? (1-5 scale)
2. What section was most valuable?
3. What was confusing or could be improved?
4. How long did onboarding take?
5. Have you reintroduced any bugs? Which ones?

**Use feedback to:**
- Update The Bible with better examples
- Revise checklist questions
- Create additional training materials
- Identify knowledge gaps

---

## ✅ Setup Verification

Run this checklist to verify your setup:

- [ ] Pre-commit hook installed in `.git/hooks/pre-commit`
- [ ] Hook is executable (`chmod +x`)
- [ ] All 4 documentation files exist and are up to date
- [ ] Onboarding checklist has template for new devs
- [ ] Team has been notified about new onboarding process
- [ ] At least one senior dev familiar with The Bible
- [ ] Bug Hunter accessible via UI (Gantt Bible button)
- [ ] Process documented in team wiki
- [ ] Metrics tracking set up (optional)

---

## 📞 Questions?

If you have questions about this setup:

1. Read GANTT_SCHEDULE_RULES.md (might already be answered)
2. Check GANTT_BUGS_AND_FIXES.md for historical context
3. Open an issue or discussion in your team's process
4. Schedule time with the team lead

**Remember:** The goal is to prevent bugs, not to create bureaucracy. If something isn't working, let's improve it together!
