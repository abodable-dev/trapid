# frozen_string_literal: true

namespace :trapid do
  desc 'Export Lexicon database to TRAPID_LEXICON.md'
  task export_lexicon: :environment do
    puts '📕 Exporting Lexicon database to markdown...'

    # Build markdown content
    content = []

    # Header
    content << '# TRAPID LEXICON - Bug History & Knowledge Base'
    content << ''
    content << '**Version:** 1.0.0'
    content << "**Last Updated:** #{Time.current.strftime('%Y-%m-%d %H:%M %Z')}"
    content << '**Authority Level:** Reference (supplements Bible)'
    content << '**Audience:** Claude Code + Human Developers'
    content << ''
    content << '---'
    content << ''
    content << '## 🔴 CRITICAL: Read This First'
    content << ''
    content << '### This Document is "The Lexicon"'
    content << ''
    content << 'This file is the **knowledge base** for all Trapid development.'
    content << ''
    content << '**This Lexicon Contains KNOWLEDGE ONLY:**'
    content << '- 🐛 Bug history (what went wrong, how we fixed it)'
    content << '- 🏛️ Architecture decisions (why we chose X over Y)'
    content << '- 📊 Test catalog (what tests exist, what\'s missing)'
    content << '- 🔍 Known gaps (what needs to be built)'
    content << ''
    content << '**For RULES (MUST/NEVER/ALWAYS):**'
    content << '- 📖 See [TRAPID_BIBLE.md](TRAPID_BIBLE.md)'
    content << ''
    content << '**For USER GUIDES (how to use features):**'
    content << '- 📘 See [TRAPID_USER_MANUAL.md](TRAPID_USER_MANUAL.md)'
    content << ''
    content << '---'
    content << ''
    content << '## 💾 Database-Driven Lexicon'
    content << ''
    content << '**IMPORTANT:** This file is auto-generated from the `documented_bugs` database table.'
    content << ''
    content << '**To edit entries:**'
    content << '1. Go to Documentation page in Trapid'
    content << '2. Click "📕 TRAPID Lexicon"'
    content << '3. Use the UI to add/edit/delete entries'
    content << '4. Run `rake trapid:export_lexicon` to update this file'
    content << ''
    content << '**Single Source of Truth:** Database (not this file)'
    content << ''
    content << '---'
    content << ''
    content << '## Table of Contents'
    content << ''

    # Get all chapters
    chapters = DocumentedBug.select(:chapter_number, :chapter_name)
                            .distinct
                            .order(:chapter_number)

    chapters.each do |chapter|
      content << "- [Chapter #{chapter.chapter_number}: #{chapter.chapter_name}](#chapter-#{chapter.chapter_number}-#{chapter.chapter_name.downcase.gsub(/[^a-z0-9]+/, '-')})"
    end

    content << ''
    content << '---'
    content << ''

    # Generate content for each chapter
    chapters.each do |chapter|
      content << ''
      content << "# Chapter #{chapter.chapter_number}: #{chapter.chapter_name}"
      content << ''
      content << '┌─────────────────────────────────────────────────┐'
      content << "│ 📖 BIBLE (RULES):     Chapter #{chapter.chapter_number.to_s.rjust(2)}               │"
      content << "│ 📘 USER MANUAL (HOW): Chapter #{chapter.chapter_number.to_s.rjust(2)}               │"
      content << '└─────────────────────────────────────────────────┘'
      content << ''
      content << '**Audience:** Claude Code + Human Developers'
      content << '**Purpose:** Bug history, architecture decisions, and test catalog'
      content << "**Last Updated:** #{Time.current.strftime('%Y-%m-%d')}"
      content << ''
      content << '---'
      content << ''

      # Get entries for this chapter
      entries = DocumentedBug.where(chapter_number: chapter.chapter_number)
                             .order(:knowledge_type, :created_at)

      # Group by knowledge_type
      bugs = entries.where(knowledge_type: 'bug')
      architecture = entries.where(knowledge_type: 'architecture')
      tests = entries.where(knowledge_type: 'test')
      performance = entries.where(knowledge_type: 'performance')
      dev_notes = entries.where(knowledge_type: 'dev_note')
      common_issues = entries.where(knowledge_type: 'common_issue')

      # Bug Hunter section
      if bugs.any?
        content << '## 🐛 Bug Hunter'
        content << ''

        bugs.each do |bug|
          status_emoji = case bug.status
                        when 'active' then '🔴'
                        when 'resolved' then '✅'
                        when 'monitoring' then '🔄'
                        when 'by_design' then '⚠️'
                        else '⚡'
                        end

          content << "### #{status_emoji} #{bug.bug_title}"
          content << ''
          content << "**Status:** #{status_emoji} #{bug.status&.upcase || 'UNKNOWN'}"
          content << "**First Reported:** #{bug.first_reported || 'Unknown'}"
          content << "**Last Occurred:** #{bug.last_occurred}" if bug.last_occurred
          content << "**Fixed Date:** #{bug.fixed_date}" if bug.fixed_date
          content << "**Severity:** #{bug.severity&.capitalize || 'Unknown'}"
          content << ''

          if bug.description.present?
            content << '#### Summary'
            content << bug.description
            content << ''
          end

          if bug.scenario.present?
            content << '#### Scenario'
            content << bug.scenario
            content << ''
          end

          if bug.root_cause.present?
            content << '#### Root Cause'
            content << bug.root_cause
            content << ''
          end

          if bug.solution.present?
            content << '#### Solution'
            content << bug.solution
            content << ''
          end

          if bug.prevention.present?
            content << '#### Prevention'
            content << bug.prevention
            content << ''
          end

          if bug.component.present?
            content << "**Component:** #{bug.component}"
            content << ''
          end

          content << '---'
          content << ''
        end
      end

      # Architecture section
      if architecture.any?
        content << '## 🏛️ Architecture'
        content << ''
        content << '### Design Decisions & Rationale'
        content << ''

        architecture.each_with_index do |arch, index|
          content << "### #{index + 1}. #{arch.bug_title}"
          content << ''

          if arch.description.present?
            content << "**Decision:** #{arch.description}"
            content << ''
          end

          if arch.details.present?
            content << "**Details:**"
            content << arch.details
            content << ''
          end

          if arch.root_cause.present?
            content << "**Rationale:**"
            content << arch.root_cause
            content << ''
          end

          if arch.solution.present?
            content << "**Implementation:**"
            content << arch.solution
            content << ''
          end

          if arch.recommendations.present?
            content << "**Trade-offs:**"
            content << arch.recommendations
            content << ''
          end

          content << '---'
          content << ''
        end
      end

      # Test Catalog section
      if tests.any?
        content << '## 📊 Test Catalog'
        content << ''

        tests.each do |test|
          content << "### #{test.bug_title}"
          content << ''

          if test.description.present?
            content << test.description
            content << ''
          end

          if test.solution.present?
            content << '**Tests:**'
            content << test.solution
            content << ''
          end

          content << '---'
          content << ''
        end
      end

      # Performance section
      if performance.any?
        content << '## 📈 Performance'
        content << ''

        performance.each do |perf|
          content << "### #{perf.bug_title}"
          content << ''
          content << perf.description if perf.description.present?
          content << ''
          content << perf.solution if perf.solution.present?
          content << ''
          content << '---'
          content << ''
        end
      end

      # Dev Notes section
      if dev_notes.any?
        content << '## 🎓 Developer Notes'
        content << ''

        dev_notes.each do |note|
          content << "### #{note.bug_title}"
          content << ''
          content << note.description if note.description.present?
          content << ''
          content << '---'
          content << ''
        end
      end

      # Common Issues section
      if common_issues.any?
        content << '## 🔍 Common Issues'
        content << ''

        common_issues.each do |issue|
          content << "### #{issue.bug_title}"
          content << ''
          content << issue.description if issue.description.present?
          content << ''
          content << '---'
          content << ''
        end
      end

      # Related chapters
      content << '## 📚 Related Chapters'
      content << ''
      content << '_Links to related chapters will be added as cross-references are identified._'
      content << ''
      content << '---'
      content << ''
    end

    # Footer
    content << ''
    content << "**Last Generated:** #{Time.current.strftime('%Y-%m-%d %H:%M %Z')}"
    content << '**Generated By:** `rake trapid:export_lexicon`'
    content << '**Maintained By:** Development Team via Database UI'
    content << '**Review Schedule:** After each bug fix or knowledge entry'

    # Write to file
    file_path = Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_LEXICON.md')
    File.write(file_path, content.join("\n"))

    total_entries = DocumentedBug.count
    puts "✅ Exported #{total_entries} entries across #{chapters.count} chapters"
    puts "📄 File: #{file_path}"
    puts ''
    puts '💡 Next steps:'
    puts '  1. Review the generated file'
    puts '  2. Commit to git: git add TRAPID_DOCS/TRAPID_LEXICON.md'
    puts '  3. Git commit message: "docs: Update Lexicon from database export"'
  end
end
