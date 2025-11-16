# Trapid Documentation - Master Index

**Last Updated:** 2025-11-16
**Version:** 1.0.0

Welcome to the Trapid documentation system. This index helps you find the right documentation quickly.

---

## 📚 The Trinity - Core Documents

These three documents share **mirrored chapters** - same chapter number = same feature across all docs.

### 📖 [TRAPID_BIBLE.md](../TRAPID_BIBLE.md)
**Audience:** Claude Code + Human Developers
**Content:** RULES, protected patterns, MUST/NEVER/ALWAYS directives
**Authority:** ABSOLUTE for covered features
**Chapters:** 0-18 (workflow-based)

### 📕 [TRAPID_LEXICON.md](../TRAPID_LEXICON.md)
**Audience:** Claude Code + Human Developers
**Content:** Bug history, edge cases, lessons learned
**Authority:** Reference (supplements Bible)
**Chapters:** 0-18 (matches Bible)

### 📘 [TRAPID_USER_MANUAL.md](../TRAPID_USER_MANUAL.md)
**Audience:** End Users (non-technical)
**Content:** How to use features, tutorials, workflows
**Authority:** User-facing only
**Chapters:** 0-18 (matches Bible)

---

## 🔍 Quick Find

### By Audience

**I'm an AI Agent (Claude Code):**
1. Read [CLAUDE.md](../SUPPLEMENTARY/CLAUDE.md) for meta-instructions
2. Check [CHAPTER_GUIDE.md](./CHAPTER_GUIDE.md) for feature → chapter mapping
3. Read relevant Bible chapter for RULES
4. Consult Lexicon chapter for bug history

**I'm a Developer:**
1. Start with [GETTING_STARTED.md](../SUPPLEMENTARY/GETTING_STARTED.md)
2. Read [CONTRIBUTING.md](../SUPPLEMENTARY/CONTRIBUTING.md) for workflow
3. Check Bible for feature-specific rules
4. Consult Lexicon for known issues

**I'm an End User:**
1. Start with [User Manual Chapter 0](../TRAPID_USER_MANUAL.md#chapter-0-overview--getting-started)
2. Jump to relevant chapter for your task
3. Follow step-by-step tutorials

**I'm an Admin:**
1. See [ARCHITECTURE.md](../SUPPLEMENTARY/ARCHITECTURE.md) for system design
2. See [DEPLOYMENT.md](../SUPPLEMENTARY/DEPLOYMENT.md) for deployment
3. See Bible Chapter 2 for System Administration rules

---

## 📋 Chapter Quick Reference

| Ch# | Feature | Bible | Lexicon | Manual |
|-----|---------|-------|---------|--------|
| 0 | Overview & Getting Started | ✅ | ✅ | ✅ |
| 1 | Authentication & Users | ✅ | ✅ | ✅ |
| 2 | System Administration | ✅ | ✅ | ✅ |
| 3 | Contacts & Relationships | ✅ | ✅ | ✅ |
| 4 | Price Books & Suppliers | ✅ | ✅ | ✅ |
| 5 | Jobs & Construction | ✅ | ✅ | ✅ |
| 6 | Estimates & Quoting | ✅ | ✅ | ✅ |
| 7 | AI Plan Review | ✅ | ✅ | ✅ |
| 8 | Purchase Orders | ✅ | ✅ | ✅ |
| 9 | Gantt & Schedule Master | ✅ | ✅ | ✅ |
| 10 | Project Tasks & Checklists | ✅ | ✅ | ✅ |
| 11 | Weather & Public Holidays | ✅ | ✅ | ✅ |
| 12 | OneDrive Integration | ✅ | ✅ | ✅ |
| 13 | Outlook/Email Integration | ✅ | ✅ | ✅ |
| 14 | Chat & Communications | ✅ | ✅ | ✅ |
| 15 | Xero Accounting | ✅ | ✅ | ✅ |
| 16 | Payments & Financials | ✅ | ✅ | ✅ |
| 17 | Workflows & Automation | ✅ | ✅ | ✅ |
| 18 | Custom Tables & Formulas | ✅ | ✅ | ✅ |

**Pro Tip:** Chapter 9 = Gantt everywhere. Chapter 15 = Xero everywhere. Easy!

---

## 📁 Supplementary Documentation

### For Claude Code
- [CLAUDE.md](../SUPPLEMENTARY/CLAUDE.md) - Meta-instructions for AI agents
- [AGENT_USAGE.md](../SUPPLEMENTARY/AGENT_USAGE.md) - When to use which agent

### For Developers
- [GETTING_STARTED.md](../SUPPLEMENTARY/GETTING_STARTED.md) - Environment setup
- [CONTRIBUTING.md](../SUPPLEMENTARY/CONTRIBUTING.md) - Git workflow, PRs
- [ARCHITECTURE.md](../SUPPLEMENTARY/ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](../SUPPLEMENTARY/DEPLOYMENT.md) - Deployment guide
- [API_REFERENCE.md](../SUPPLEMENTARY/API_REFERENCE.md) - API endpoints

---

## 🔑 Documentation Authority

When documents conflict, follow this hierarchy:

### For AI Agents & Developers:
1. **TRAPID_BIBLE.md** - ABSOLUTE authority for covered features
2. **CLAUDE.md** - General AI instructions (defers to Bible)
3. **TRAPID_LEXICON.md** - Knowledge reference (doesn't override)

### For Human Developers:
1. **CONTRIBUTING.md** - Development workflow
2. **TRAPID_BIBLE.md** - Protected patterns and rules
3. **Feature-specific docs** - Deep dives

### For End Users:
1. **TRAPID_USER_MANUAL.md** - How to use Trapid
2. **FAQ/Troubleshooting** - Quick fixes

**See:** [DOCUMENTATION_AUTHORITY.md](./DOCUMENTATION_AUTHORITY.md) for details

---

## 🔄 Version Control

**Bible Versioning:**
- Major (X.0.0): Breaking rule changes
- Minor (1.X.0): New rules added
- Patch (1.0.X): Clarifications, typos

**Lexicon & Manual:**
- Updated continuously with Last Updated timestamp

**Change Tracking:**
- Bible: See [VERSION_HISTORY.md](./VERSION_HISTORY.md)
- Lexicon: See update logs within each chapter
- Manual: See changelog at end of document

---

## 🆘 Getting Help

**Can't find what you need?**
1. Check [CHAPTER_GUIDE.md](./CHAPTER_GUIDE.md) - Quick feature lookup
2. Search Trinity docs for keywords
3. Check [DOCUMENTATION_AUTHORITY.md](./DOCUMENTATION_AUTHORITY.md) - Which doc is authoritative
4. Ask in team chat

**Found an issue with docs?**
- Bible: Update rule + sync to Lexicon if needed
- Lexicon: Add bug entry
- Manual: Update relevant chapter
- Always update timestamps!

---

**Documentation Maintained By:** Development Team
**Review Schedule:** Continuous updates as features evolve
**Questions?** Check Chapter Guide or ask in team chat
