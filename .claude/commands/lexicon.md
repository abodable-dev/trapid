# Search Lexicon

Search the Lexicon database for bug history, architecture decisions, and known issues.

**Usage:** After running this command, specify what to search for.

**Example searches:**
- "Search Lexicon for Gantt cascade bugs"
- "Search Lexicon for Xero sync issues"
- "Search Lexicon for timezone problems"

**API Endpoint:** `https://trapid-backend-447058022b51.herokuapp.com/api/v1/documentation_entries?category=lexicon`

**Filter by chapter:** Add `&chapter_number=X` to narrow search
**Filter by type:** Add `&entry_type=bug` (or architecture, test, performance, dev_note, common_issue)

**Note:** The Lexicon is now database-backed. Always fetch from the API to get the latest entries, NOT from `TRAPID_LEXICON.md` (which is an auto-generated export).

You can also open the Documentation page and click "📕 TRAPID Lexicon" to browse all entries.