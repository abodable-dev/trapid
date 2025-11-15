# Gantt Development Onboarding Checklist

**⚠️ MANDATORY: Complete this checklist before making any changes to Gantt/Schedule code**

## Why This Checklist Exists

The Gantt and Schedule Master codebase contains subtle patterns that took **8+ iterations and many hours** to get right. This checklist ensures you understand these patterns before introducing bugs that we've already fixed.

---

## Step 1: Read The Documentation

Read these files IN ORDER (estimated time: 45 minutes):

- [ ] **GANTT_SCHEDULE_RULES.md (The Bible)** - Start with the "🚨 CRITICAL" section
  - [ ] Understand Predecessor ID Mismatch (1-based vs 0-based)
  - [ ] Understand Infinite Render Loop prevention
  - [ ] Know all 3 useRef anti-loop flags (isDragging, isLoadingData, isSaving)
  - [ ] Know all 5 lock types and their priority order
  - [ ] Read all "Common Gotchas" section

- [ ] **GANTT_BIBLE_COLUMNS.md** - Column implementation reference
  - [ ] Understand which columns are Active vs Inactive
  - [ ] Know where each column is implemented (file:line)
  - [ ] Understand lock hierarchy

- [ ] **GANTT_BUGS_AND_FIXES.md** - Bug history and Bug Hunter
  - [ ] Read BUG-001 (Drag Flickering) case study
  - [ ] Understand why each fix attempt failed
  - [ ] Know how to use Bug Hunter diagnostic tool

---

## Step 2: Understand The Architecture

Answer these questions (write your answers, they will be checked):

### Backend Questions

**Q1:** Why are predecessor IDs 1-based but sequence_order is 0-based?

**Your Answer:**
```
[Write answer here]
```

**Q2:** Why does `ScheduleCascadeService` use `update_column()` instead of `update()`?

**Your Answer:**
```
[Write answer here]
```

**Q3:** Which tasks does the cascade service skip? Why?

**Your Answer:**
```
[Write answer here]
```

### Frontend Questions

**Q4:** What triggers spurious `onAfterTaskDrag` events in DHtmlx Gantt?

**Your Answer:**
```
[Write answer here]
```

**Q5:** Why must `isLoadingData` timeout be exactly 500ms (not less)?

**Your Answer:**
```
[Write answer here]
```

**Q6:** Name all 5 lock types in priority order (highest to lowest):

**Your Answer:**
```
1.
2.
3.
4.
5.
```

---

## Step 3: Set Up Your Environment

Complete these setup tasks:

- [ ] Enable DIAGNOSTIC_MODE in DHtmlxGanttView.jsx line 26
- [ ] Open browser DevTools console
- [ ] Run `window.printBugHunterReport()` to verify Bug Hunter works
- [ ] Verify you can see diagnostic emoji logs (🔵 📊 ✅ ❌)

---

## Step 4: Practice With The Code

Complete these hands-on exercises:

### Exercise 1: Predecessor ID Conversion

- [ ] Open `schedule_cascade_service.rb`
- [ ] Find line 88: `predecessor_id = predecessor_task.sequence_order + 1`
- [ ] Explain why the `+ 1` is necessary:
```
[Write answer here]
```

### Exercise 2: Anti-Loop Flags

- [ ] Open `DHtmlxGanttView.jsx`
- [ ] Find line 1357: `isDragging.current = true`
- [ ] Find line 3477: `if (isLoadingData.current) return`
- [ ] Explain what would happen if line 3477 was removed:
```
[Write answer here]
```

### Exercise 3: Lock Checking

- [ ] Open `DHtmlxGanttView.jsx`
- [ ] Find the cascade modal logic around line 1700
- [ ] Write the correct code to check if a task is locked:
```javascript
const isLocked = (task) => {
  // Write your code here


}
```

---

## Step 5: Run The Tests

Before making any changes:

- [ ] Run backend tests: `cd backend && bundle exec rspec spec/services/schedule_cascade_service_spec.rb`
- [ ] Run E2E tests: `cd frontend && npm run test:e2e -- gantt-cascade.spec.js`
- [ ] Verify Bug Hunter reports HEALTHY status
- [ ] Verify all 10 Bug Hunter tests pass

---

## Step 6: Make A Small Test Change

Practice the workflow with a safe change:

- [ ] Add a console.log to DHtmlxGanttView.jsx in handleTaskUpdate
- [ ] Drag a task in the Gantt chart
- [ ] Verify your log appears exactly ONCE (not multiple times)
- [ ] Run `window.printBugHunterReport()` and verify:
  - [ ] Test #1 passes (≤ 2 API calls per task)
  - [ ] Test #2 passes (≤ 5 reloads per drag)
- [ ] Remove your console.log

---

## Step 7: Verify Comprehension

Have a senior developer review your answers to the questions above.

**Reviewer Name:** ________________

**Review Date:** ________________

**Reviewer Signature:** ________________

---

## Step 8: Sign The Pledge

By signing below, I certify that:

1. I have read and understood GANTT_SCHEDULE_RULES.md (The Bible)
2. I understand the Predecessor ID Mismatch bug and how to avoid it
3. I understand the useRef anti-loop flags and will not "optimize" them away
4. I will run Bug Hunter after every change to Gantt code
5. I will not remove or modify Protected Code Patterns without explicit approval
6. If I don't understand something, I will ask BEFORE making changes

**Developer Name:** ________________

**Date Completed:** ________________

**Signature:** ________________

---

## Emergency Contacts

If you encounter issues or have questions:

1. **Check The Bible First:** GANTT_SCHEDULE_RULES.md has the answer
2. **Run Bug Hunter:** `window.printBugHunterReport()` for diagnostics
3. **Check Bug History:** GANTT_BUGS_AND_FIXES.md may have your answer
4. **Ask Senior Dev:** [Your team's escalation process here]

---

## After Onboarding

**Every time you work on Gantt code:**

- [ ] Re-read the "🚨 CRITICAL" section of The Bible
- [ ] Enable DIAGNOSTIC_MODE
- [ ] Run Bug Hunter before and after your changes
- [ ] Verify all 10 tests still pass
- [ ] Update The Bible if you discover new patterns or gotchas

---

## Onboarding Record

**Developer:** ________________
**Start Date:** ________________
**Completion Date:** ________________
**Time Spent:** _______ hours
**Reviewer:** ________________
**Status:** [ ] In Progress  [ ] Completed  [ ] Needs Revision

---

## Common Onboarding Mistakes

After completing this checklist, developers commonly make these mistakes:

1. **"I'll just make a quick fix"** - No such thing with Gantt code. Read The Bible first.
2. **"This code looks messy, I'll clean it up"** - Every line exists for a reason. Ask first.
3. **"500ms is too long, I'll optimize to 100ms"** - Tested value. Don't change it.
4. **"I don't need to run Bug Hunter, it's a small change"** - Bug Hunter catches issues you can't see.
5. **"I understand loops, I don't need to read about the flags"** - The loops are NOT obvious.

**If you skip this checklist and introduce a bug, you will spend HOURS debugging issues that are already documented here.**
