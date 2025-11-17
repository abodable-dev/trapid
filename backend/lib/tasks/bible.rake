# frozen_string_literal: true

namespace :trapid do
  desc "Import Bible rules from TRAPID_BIBLE.md into database"
  task import_bible: :environment do
    bible_path = Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_BIBLE.md')

    unless File.exist?(bible_path)
      puts "❌ Error: TRAPID_BIBLE.md not found at #{bible_path}"
      exit 1
    end

    content = File.read(bible_path)

    # Chapter name mapping
    chapter_names = {
      0 => "System-Wide Rules",
      1 => "Authentication",
      2 => "System Admin",
      3 => "Contacts",
      4 => "Price Books",
      5 => "Jobs",
      6 => "Estimates",
      7 => "AI Plan Review",
      8 => "Purchase Orders",
      9 => "Gantt",
      10 => "Tasks",
      11 => "Weather",
      12 => "OneDrive",
      13 => "Outlook",
      14 => "Chat",
      15 => "Xero",
      16 => "Payments",
      17 => "Workflows",
      18 => "Custom Tables",
      19 => "UI/UX",
      20 => "Agents"
    }

    imported_count = 0
    skipped_count = 0
    current_chapter = 0

    puts "\n📖 Importing Bible rules from TRAPID_BIBLE.md..."
    puts "=" * 60

    # Find all rules with their content
    content.scan(/^## RULE #([\d.A-Z]+):\s*(.+?)$\n(.*?)(?=^## RULE #|^# Chapter \d+:|^---\n\n#|\z)/m) do |rule_number, title, body|
      # Determine chapter number from rule_number (e.g., "19.1" -> 19, "0" -> 0)
      chapter_num = if rule_number.include?('.')
                      rule_number.split('.').first.to_i
                    elsif rule_number == 'X.Y' || rule_number.match?(/[A-Z]/)
                      next  # Skip template rules
                    else
                      rule_number.to_i
                    end

      # Check if we have a mapping for this chapter
      unless chapter_names.key?(chapter_num)
        puts "  ⚠️  Warning: Unknown chapter #{chapter_num} for RULE ##{rule_number}, skipping"
        next
      end

      # Update current chapter tracker
      if current_chapter != chapter_num
        current_chapter = chapter_num
        puts "\n📍 Processing Chapter #{chapter_num}: #{chapter_names[chapter_num]}"
      end

      title = title.strip
      body = body.strip

      # Extract rule type from body
      rule_type = nil
      if body.match?(/✅.*MUST/)
        rule_type = 'MUST'
      elsif body.match?(/❌.*NEVER/)
        rule_type = 'NEVER'
      elsif body.match?(/🔄.*ALWAYS/)
        rule_type = 'ALWAYS'
      elsif body.match?(/🔒.*PROTECTED/)
        rule_type = 'PROTECTED'
      elsif body.match?(/⚙️.*CONFIG/)
        rule_type = 'CONFIG'
      end

      # Extract code examples (triple backtick blocks)
      code_examples = body.scan(/```[\w]*\n(.*?)```/m).flatten.join("\n\n---\n\n")

      # Extract cross-references
      cross_refs = body.scan(/(?:See|Ref|Reference):\s*(.+?)$/m).flatten.join("\n")

      # Clean description (remove code blocks for main description)
      description = body.gsub(/```[\w]*\n.*?```/m, '[Code example - see code_example field]').strip

      # Check if rule already exists
      existing_rule = BibleRule.find_by(chapter_number: chapter_num, rule_number: rule_number)

      if existing_rule
        puts "  ⏭️  Skipping RULE ##{rule_number} (already exists)"
        skipped_count += 1
      else
        begin
          BibleRule.create!(
            chapter_number: chapter_num,
            chapter_name: chapter_names[chapter_num],
            rule_number: rule_number,
            title: title,
            rule_type: rule_type,
            description: description,
            code_example: code_examples.presence,
            cross_references: cross_refs.presence,
            sort_order: imported_count
          )
          puts "  ✅ Imported RULE ##{rule_number}: #{title.truncate(60)}"
          imported_count += 1
        rescue ActiveRecord::RecordInvalid => e
          puts "  ❌ Error importing RULE ##{rule_number}: #{e.message}"
        end
      end
    end

    puts "\n" + "=" * 60
    puts "✅ Import complete!"
    puts "   Imported: #{imported_count} rules"
    puts "   Skipped:  #{skipped_count} rules (already existed)"
    puts "   Total:    #{BibleRule.count} rules in database"
    puts "=" * 60
  end

  desc "Export Bible rules from database to TRAPID_BIBLE.md"
  task export_bible: :environment do
    bible_path = Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_BIBLE.md')

    puts "\n📖 Exporting Bible rules to TRAPID_BIBLE.md..."
    puts "=" * 60

    # Generate markdown content
    content = <<~HEADER
      # TRAPID BIBLE - Development Rules

      **Version:** 2.0.0
      **Last Updated:** #{Time.current.strftime("%Y-%m-%d %H:%M %Z")}
      **Authority Level:** ABSOLUTE
      **Audience:** Claude Code + Human Developers
      **Source of Truth:** Database table `bible_rules` (this file is auto-generated)

      ---

      ## 🔴 CRITICAL: Read This First

      ### This Document is "The Bible"

      This file is the **absolute authority** for all Trapid development where chapters exist.

      **This Bible Contains RULES ONLY:**
      - ✅ MUST do this
      - ❌ NEVER do that
      - 🔄 ALWAYS check X before Y
      - 🔒 Protected code patterns
      - ⚙️ Configuration values that must match

      **This file is AUTO-GENERATED from the database.**
      - **DO NOT edit this file directly**
      - Update rules via Trapid app → Documentation page → 📖 Bible
      - Export to markdown via: `bin/rails trapid:export_bible`

      **For IMPLEMENTATION PATTERNS (code examples, how-to guides):**
      - 🔧 See [TRAPID_TEACHER.md](TRAPID_TEACHER.md)

      **For KNOWLEDGE (how things work, bug history, why we chose X):**
      - 📕 See [TRAPID_LEXICON.md](TRAPID_LEXICON.md)

      **For USER GUIDES (how to use features):**
      - 📘 See [TRAPID_USER_MANUAL.md](TRAPID_USER_MANUAL.md)

      ---

    HEADER

    # Group rules by chapter
    (0..20).each do |chapter_num|
      rules = BibleRule.by_chapter(chapter_num).ordered
      next if rules.empty?

      chapter_name = rules.first.chapter_name

      puts "📍 Exporting Chapter #{chapter_num}: #{chapter_name}"

      content += <<~CHAPTER
        # Chapter #{chapter_num}: #{chapter_name}

        ┌─────────────────────────────────────────────────┐
        │ 🔧 TEACHER (HOW):     TRAPID_TEACHER.md Ch#{chapter_num}    │
        │ 📕 LEXICON (BUGS):    TRAPID_LEXICON.md Ch#{chapter_num}    │
        │ 📘 USER MANUAL (USE): TRAPID_USER_MANUAL.md Ch#{chapter_num} │
        └─────────────────────────────────────────────────┘

        **Last Updated:** #{rules.maximum(:updated_at).strftime("%Y-%m-%d %H:%M %Z")}

      CHAPTER

      rules.each do |rule|
        content += "## RULE ##{rule.rule_number}: #{rule.title}\n\n"
        content += "#{rule.type_display}\n\n" if rule.rule_type.present?
        content += "#{rule.description}\n\n"

        if rule.code_example.present?
          content += "### Code Example\n\n"
          content += "```\n#{rule.code_example}\n```\n\n"
        end

        if rule.cross_references.present?
          content += "### Cross-References\n\n"
          content += "#{rule.cross_references}\n\n"
        end

        content += "---\n\n"
      end
    end

    # Write to file
    File.write(bible_path, content)

    puts "\n" + "=" * 60
    puts "✅ Export complete!"
    puts "   File: #{bible_path}"
    puts "   Rules exported: #{BibleRule.count}"
    puts "=" * 60
  end

  desc "Clear all Bible rules from database (WARNING: destructive)"
  task clear_bible: :environment do
    print "⚠️  WARNING: This will delete ALL Bible rules from the database. Continue? (y/N): "
    confirmation = STDIN.gets.chomp

    if confirmation.downcase == 'y'
      count = BibleRule.count
      BibleRule.destroy_all
      puts "✅ Deleted #{count} Bible rules"
    else
      puts "❌ Cancelled"
    end
  end
end
