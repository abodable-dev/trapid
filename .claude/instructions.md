# Project Instructions for Claude Code

## 🚨 CRITICAL: Gantt & Schedule Master Development

### Before Working on ANY Gantt/Schedule Code

**You MUST read the Gantt Bible at the start of EVERY session:**

1. **Read:** `/Users/rob/Projects/trapid/GANTT_SCHEDULE_RULES.md`
2. **Follow:** ALL rules without exception
3. **Never:** Modify Protected Code Patterns
4. **Update:** Bible when discovering new rules
5. **Update:** Lexicon when fixing bugs

### The Two-Document System

This project uses exactly TWO documentation files for Gantt:

1. **📖 GANTT_SCHEDULE_RULES.md** - "The Bible" (RULES ONLY)
   - Contains: MUST/NEVER/ALWAYS directives
   - Contains: Protected code patterns
   - Contains: Configuration values that must match
   - Size: ~18KB (667 lines of pure rules)

2. **📕 GANTT_BUGS_AND_FIXES.md** - "Bug Hunter Lexicon" (KNOWLEDGE ONLY)
   - Contains: Bug history (BUG-001, BUG-002, etc.)
   - Contains: How things work (architecture explanations)
   - Contains: Why we chose certain patterns
   - Contains: Investigation timelines and learnings

### When to Read the Bible

**ALWAYS read the Bible when:**
- User mentions: "Gantt", "Schedule Master", "cascade", "dependencies"
- Working on files: `DHtmlxGanttView.jsx`, `schedule_cascade_service.rb`
- User reports a bug in drag/drop or task scheduling
- Modifying any code in `frontend/src/components/schedule-master/`
- Modifying any code in `backend/app/services/schedule_cascade_service.rb`

### Identifying Gantt-Related Work

**These keywords trigger Bible reading requirement:**
- gantt, schedule, cascade, predecessor, dependency
- drag, flicker, lock, working days, task height
- isLoadingData, isDragging, useRef flags
- Company Settings (in context of schedule)

### What You CANNOT Do (Without Reading Bible First)

❌ **NEVER:**
- Modify `DHtmlxGanttView.jsx` without reading Bible
- Change timeout values (500ms, 5000ms) without reading Bible
- Modify `schedule_cascade_service.rb` without reading Bible
- "Optimize" or "simplify" Gantt code without reading Bible
- Change useRef flag timing without reading Bible
- Modify Protected Code Patterns

### Documentation Maintenance Rules

**When you discover a new rule (MUST/NEVER/ALWAYS):**
1. Add to Bible (GANTT_SCHEDULE_RULES.md)
2. Update version number
3. Update timestamp
4. Sync to frontend/public/

**When you fix a bug:**
1. Document in Lexicon (GANTT_BUGS_AND_FIXES.md) as BUG-XXX
2. If bug creates a new RULE → Also add to Bible
3. Update timestamp
4. Sync to frontend/public/

### File Sync (CRITICAL)

After editing Bible or Lexicon, ALWAYS run:
```bash
cp /Users/rob/Projects/trapid/GANTT_SCHEDULE_RULES.md \
   /Users/rob/Projects/trapid/frontend/public/GANTT_SCHEDULE_RULES.md

cp /Users/rob/Projects/trapid/GANTT_BUGS_AND_FIXES.md \
   /Users/rob/Projects/trapid/frontend/public/GANTT_BUGS_AND_FIXES.md
```

### Quick Reference: Rules vs Knowledge

**RULE (goes in Bible):**
- "You MUST do X"
- "NEVER do Y"
- "ALWAYS check Z before W"

**KNOWLEDGE (goes in Lexicon):**
- "This is how X works"
- "We discovered Y after 8 iterations"
- "Here's why we chose Z"

---

## Other Project Guidelines

### General Development
- Read relevant documentation before making changes
- Follow existing code patterns
- Test changes before committing
- Update documentation when changing behavior

### Git Workflow
- Create meaningful commit messages
- Reference issue numbers when applicable
- Don't commit commented-out code without explanation

---

**Last Updated:** November 15, 2025
**Authority:** These instructions are mandatory for all Claude Code sessions
