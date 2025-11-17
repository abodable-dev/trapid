# Export Documentation to Markdown

Export the database-backed documentation to markdown files.

**Unified Documentation System:**
All documentation is stored in the `documentation_entries` table and can be exported to markdown.

**Export Commands:**
```bash
# Export Bible (RULES)
bin/rails trapid:export_bible
# Creates: TRAPID_DOCS/TRAPID_BIBLE.md

# Export Lexicon (KNOWLEDGE)
bin/rails trapid:export_lexicon
# Creates: TRAPID_DOCS/TRAPID_LEXICON.md

# Export Teacher (HOW-TO)
bin/rails trapid:export_teacher
# Creates: TRAPID_DOCS/TRAPID_TEACHER.md
```

**Or use the UI:**
- Go to Documentation page
- Click the category tab (📖 Bible, 📕 Lexicon, or 🔧 Teacher)
- Click "Export" button

**Note:** Exports are for git version control and offline reference. The database API is always the source of truth.