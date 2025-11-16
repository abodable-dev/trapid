# Export Lexicon to Markdown

Export the Lexicon database to TRAPID_LEXICON.md file.

**Process:**
1. Run `bundle exec rake trapid:export_lexicon`
2. Review generated file at `TRAPID_DOCS/TRAPID_LEXICON.md`
3. Commit to git if needed

**Or use the UI:**
- Go to Documentation page
- Click "📕 TRAPID Lexicon"
- Click "Export" button

This exports all bug history, architecture decisions, tests, and terminology from the database to markdown format.