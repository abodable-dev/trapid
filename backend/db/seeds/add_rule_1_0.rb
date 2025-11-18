# Add RULE #1.0: Read Dense Index First
# Run with: rails runner db/seeds/add_rule_1_0.rb

Trinity.find_or_create_by!(
  category: 'bible',
  chapter_number: 1,
  section_number: '1.0'
) do |rule|
  rule.chapter_name = 'Overview & System-Wide Rules'
  rule.entry_type = 'ALWAYS'
  rule.severity = 'critical'
  rule.title = 'Read Dense Index First, Then Full Content of Relevant Rules Only'
  rule.description = <<~DESC
    **ALWAYS read the Bible using this efficient 3-step pattern:**

    ## What is the Dense Index?

    The **dense_index** field is an AI-optimized ultra-lean summary automatically generated for each rule:

    **What it contains (from Trinity model line 279-321):**
    - Section number (no dots): "b0109"
    - Title keywords (no spaces): "predecessoridconversion"
    - Entry type: "never"
    - Category: "bible"
    - Component: "gantt"
    - Key content terms: 20 most meaningful words (3+ chars)
    - Total size: ~50-100 characters vs. 500-5000 chars in full description

    **What it does NOT contain:**
    - Full rule explanations
    - Code examples
    - "Why this matters" reasoning
    - Related rule references
    - Specific formulas or values

    ## Step 1: Read Dense Index for ALL Rules
    ```ruby
    # Fetch all bible rules with ONLY dense_index field
    GET /api/v1/trinity?category=bible&fields=dense_index,title,chapter_number
    ```

    - Scan ~350 rules in <30 seconds
    - Identify keywords matching your task
    - Note which rules are potentially relevant
    - Example: Task = "add meetings" → Keywords: "construction", "user", "task", "workflow", "modal"

    ## Step 2: Read Chapter 1 Dense Index + Full Content
    ```ruby
    # Get full content for Chapter 1 only
    GET /api/v1/trinity?category=bible&chapter=1
    ```

    - ALWAYS read Chapter 1 completely for ANY task
    - Contains universal rules (API format, migrations, timezone, auth)
    - ~200 lines, ~15 rules
    - Takes ~3 minutes to read thoroughly

    ## Step 3: Read Full Content of Relevant Rules ONLY
    ```ruby
    # Get full content for specific chapters identified in Step 1
    GET /api/v1/trinity?category=bible&chapter=10  # Gantt rules
    GET /api/v1/trinity?category=bible&chapter=20  # UI patterns
    ```

    - Read FULL description, code examples, reasoning
    - Don't skip the "Why this matters" sections
    - Note related rule references
    - Example: Chapter 10 has `sequence_order + 1` formula (not in dense_index)

    ## Why Dense Index First?

    **Efficiency:**
    - Bible: 2,600 lines, 350+ rules across 21 chapters
    - Dense index scan: 350 rules × 80 chars = 28,000 chars (~7,000 tokens)
    - Full Bible read: 2,600 lines × 80 chars = 208,000 chars (~52,000 tokens)
    - Relevant chapters: 3 chapters × 200 lines = 600 lines (~15,000 tokens)
    - **Savings: 37,000 tokens (71% reduction)**

    **Accuracy:**
    - Dense index shows what exists (fast filtering)
    - Full content shows how to implement (correct application)
    - Best of both worlds: fast discovery + deep understanding

    ## What NOT to Do

    ❌ **NEVER read just rule titles/dense_index without full content**
    - Dense index: "predecessoridconversion never sequenceorder gantt"
    - This tells you a rule exists about predecessor ID conversion in Gantt
    - It does NOT tell you the formula: `predecessor_id = sequence_order + 1`
    - You MUST read full description to get the actual rule

    ❌ **NEVER read ALL 21 chapters for every task**
    - Wastes 37,000 tokens
    - Takes 20+ minutes
    - 90% of rules won't apply to your task

    ❌ **NEVER skip Chapter 1 (System-Wide Rules)**
    - Chapter 1 applies to EVERY feature
    - Most violations come from skipping Chapter 1
    - Only ~15 rules, takes 3 minutes

    ## Chapter → Feature Mapping (Quick Reference)
    - **Chapter 1**: System-Wide (read for ANY task)
    - **Chapter 2**: Authentication & Users
    - **Chapter 3**: System Administration
    - **Chapter 4**: Contacts & Relationships
    - **Chapter 5**: Price Books & Suppliers
    - **Chapter 6**: Jobs & Construction Management
    - **Chapter 7**: Estimates & Quoting
    - **Chapter 8**: AI Plan Review
    - **Chapter 9**: Purchase Orders
    - **Chapter 10**: Gantt & Schedule Master
    - **Chapter 11**: Project Tasks & Checklists
    - **Chapter 12**: Weather & Public Holidays
    - **Chapter 13**: OneDrive Integration
    - **Chapter 14**: Outlook/Email Integration
    - **Chapter 15**: Chat & Communications
    - **Chapter 16**: Xero Accounting Integration
    - **Chapter 17**: Payments & Financials
    - **Chapter 18**: Workflows & Automation
    - **Chapter 19**: Custom Tables & Formulas
    - **Chapter 20**: UI/UX Standards & Patterns
    - **Chapter 21**: Agent System & Automation

    ## Example Workflow

    **Task:** "Add meeting management system"

    **Step 1 - Read Dense Index (ALL 350 rules):**
    ```ruby
    # Scan dense_index field for all bible rules
    GET /api/v1/trinity?category=bible&fields=dense_index,title,chapter_number

    # Filter by keywords: "meeting", "construction", "user", "task", "workflow", "modal"
    # Results:
    - b0103: "apiformatsuccessdataerror" (Chapter 1)
    - b0104: "migrationrollbackindexforeign" (Chapter 1)
    - b0302: "timezonecompanysetting" (Chapter 3)
    - b0601: "constructioncontactvalidation" (Chapter 6)
    - b1101: "taskstatusautomaticdate" (Chapter 11)
    - b1801: "solidqueuebackgroundjob" (Chapter 18)
    - b2001: "tablepatterncheckboxlocked" (Chapter 20)

    # Identified relevant chapters: 1, 3, 6, 11, 18, 20
    ```

    **Step 2 - Read Chapter 1 Full Content:**
    ```ruby
    GET /api/v1/trinity?category=bible&chapter=1

    # Learn exact rules:
    - RULE #1.3: API format MUST be {success: true, data: {...}}
    - RULE #1.4: MUST create migrations, test rollback, add indexes
    - RULE #1.13: Single source of truth (database as authority)
    ```

    **Step 3 - Read Relevant Chapters Full Content:**
    ```ruby
    GET /api/v1/trinity?category=bible&chapter=3  # Timezone
    GET /api/v1/trinity?category=bible&chapter=6  # Construction
    GET /api/v1/trinity?category=bible&chapter=11 # Tasks
    GET /api/v1/trinity?category=bible&chapter=18 # Workflows
    GET /api/v1/trinity?category=bible&chapter=20 # UI

    # Learn implementation details:
    - Chapter 3: Use CompanySetting.timezone methods, Time.use_zone context
    - Chapter 6: Meetings belong_to :construction, validate has_one_contact
    - Chapter 11: Link tasks via meeting_id, action items from agenda
    - Chapter 18: Use Solid Queue for emails, make jobs idempotent
    - Chapter 20: Use Headless UI modals, follow table patterns
    ```

    **Result:**
    - Scanned: 350 rules via dense_index (7,000 tokens)
    - Read fully: 6 chapters, ~80 rules (15,000 tokens)
    - **Total: 22,000 tokens vs. 52,000 for full Bible (58% savings)**
    - Know all relevant rules ✅
    - Build compliant feature ✅
    - Avoided reading 15 irrelevant chapters ✅

    ## This is RULE #1.0 Because

    Reading efficiently MUST happen BEFORE you can follow other rules.
    - You cannot follow rules you haven't read
    - But reading EVERYTHING wastes time and tokens
    - Dense index = AI-optimized discovery layer
    - Full content = implementation details
    - Dense index → relevant chapters = optimal pattern

    ## Technical Implementation

    **Dense Index Generation (Trinity model line 279-321):**
    ```ruby
    def update_dense_index
      tokens = []
      tokens << section_number.downcase.gsub('.', '')  # b0109
      tokens << title.downcase.gsub(/[^a-z0-9]/, '')   # predecessoridconversion
      tokens << entry_type.downcase                     # never
      tokens << category                                # bible
      tokens << component.downcase if component.present?

      # Extract 20 key terms (3+ chars) from content
      key_terms = content_text
        .downcase
        .gsub(/[*#\-_`]/, '')  # Remove markdown
        .gsub(/must|never|always|should|will|can/, '')  # Remove common words
        .scan(/\b[a-z]{3,}\b/)  # Extract meaningful words
        .uniq
        .first(20)

      tokens.concat(key_terms)
      self.dense_index = tokens.join(' ')  # Space-separated for text search
    end
    ```

    **Search Pattern:**
    ```ruby
    # Find rules about "timezone" and "working days"
    Trinity.bible_entries.where("dense_index ILIKE ?", "%timezone%")
    Trinity.bible_entries.where("dense_index ILIKE ?", "%workingdays%")
    ```
  DESC
end

puts "✅ RULE #1.0 created successfully!"
puts "📖 Run: rails trapid:export_bible"
puts "📝 Then commit TRAPID_BIBLE.md"
