#!/usr/bin/env ruby
# frozen_string_literal: true

require 'net/http'
require 'json'
require 'fileutils'

puts '🔧 Generating Teacher chapter files from API...'

# Fetch data from API
api_url = 'https://trapid-backend-447058022b51.herokuapp.com/api/v1/trinity?category=teacher'
uri = URI(api_url)
response = Net::HTTP.get(uri)
data = JSON.parse(response)

unless data['success']
  puts '❌ Failed to fetch data from API'
  exit 1
end

entries = data['data']
puts "📥 Fetched #{entries.length} Teacher entries from API"

# Group by chapter
chapters = entries.group_by { |e| [e['chapter_number'], e['chapter_name']] }
                   .sort_by { |k, _v| k[0] }

# Ensure TEACHER directory exists
teacher_dir = File.join(__dir__, '..', 'TRAPID_DOCS', 'TEACHER')
FileUtils.mkdir_p(teacher_dir)

generated_files = []
all_chapters = chapters.map { |k, _v| { number: k[0], name: k[1] } }

# Generate a file for each chapter
chapters.each do |(chapter_number, chapter_name), chapter_entries|
  content = []

  # Chapter-specific header
  chapter_name_slug = chapter_name.upcase.gsub(/[^A-Z0-9]+/, '_')
  content << "# TRAPID TEACHER - Chapter #{chapter_number}: #{chapter_name}"
  content << ''
  content << "**Last Updated:** #{Time.now.strftime('%Y-%m-%d %H:%M %Z')}"
  content << '**Authority Level:** Reference (HOW to implement Bible rules)'
  content << '**Audience:** Claude Code + Human Developers'
  content << ''
  content << '---'
  content << ''
  content << '## 📚 Navigation'
  content << ''
  content << '**Other Teacher Chapters:**'
  content << '- [Main Teacher Index](../TRAPID_TEACHER.md)'

  # Add links to adjacent chapters
  if chapter_number > 0
    prev_chapter = all_chapters.find { |c| c[:number] == chapter_number - 1 }
    if prev_chapter
      prev_slug = prev_chapter[:name].upcase.gsub(/[^A-Z0-9]+/, '_')
      content << "- [← Previous: Chapter #{prev_chapter[:number]} - #{prev_chapter[:name]}](CHAPTER_#{prev_chapter[:number].to_s.rjust(2, '0')}_#{prev_slug}.md)"
    end
  end

  next_chapter = all_chapters.find { |c| c[:number] == chapter_number + 1 }
  if next_chapter
    next_slug = next_chapter[:name].upcase.gsub(/[^A-Z0-9]+/, '_')
    content << "- [Next: Chapter #{next_chapter[:number]} - #{next_chapter[:name]} →](CHAPTER_#{next_chapter[:number].to_s.rjust(2, '0')}_#{next_slug}.md)"
  end

  content << ''
  content << '**Related Documentation:**'
  content << '- 📖 [TRAPID Bible (Rules)](../TRAPID_BIBLE.md)'
  content << '- 📕 [TRAPID Lexicon (Bug History)](../TRAPID_LEXICON.md)'
  content << '- 📘 [User Manual](../TRAPID_USER_MANUAL.md)'
  content << ''
  content << '---'
  content << ''
  content << "## Chapter #{chapter_number}: #{chapter_name}"
  content << ''

  # Sort entries by section_number
  sorted_entries = chapter_entries.sort_by { |e| e['section_number'] || '' }

  if sorted_entries.empty?
    content << '*No teaching patterns available for this chapter yet.*'
    content << ''
  else
    sorted_entries.each do |entry|
      # Section header
      section_prefix = entry['section_number'] ? "§#{entry['section_number']}: " : ""
      content << "## #{section_prefix}#{entry['title']}"
      content << ''

      # Type and difficulty badges
      badges = []
      badges << "#{entry['type_emoji']} #{entry['entry_type']&.split('_')&.map(&:capitalize)&.join(' ')}"
      if entry['difficulty']
        difficulty_emoji = case entry['difficulty']
                          when 'beginner' then '🟢'
                          when 'intermediate' then '🟡'
                          when 'advanced' then '🔴'
                          else '⚪'
                          end
        badges << "#{difficulty_emoji} #{entry['difficulty']&.capitalize}"
      end
      content << badges.join(' | ')
      content << ''

      # Related rules
      if entry['related_rules'] && !entry['related_rules'].empty?
        content << "**📖 Related Bible Rules:** #{entry['related_rules']}"
        content << ''
      end

      # Summary
      if entry['summary'] && !entry['summary'].empty?
        content << '### Quick Summary'
        content << entry['summary']
        content << ''
      end

      # Step-by-step guide (using details field)
      if entry['details'] && !entry['details'].empty?
        content << '### Step-by-Step Guide'
        content << entry['details']
        content << ''
      end

      # Code example
      if entry['code_example'] && !entry['code_example'].empty?
        content << '### Code Example'
        content << '```jsx'
        content << entry['code_example']
        content << '```'
        content << ''
      end

      # Common mistakes
      if entry['common_mistakes'] && !entry['common_mistakes'].empty?
        content << '### ⚠️ Common Mistakes'
        content << entry['common_mistakes']
        content << ''
      end

      # Testing strategy
      if entry['testing_strategy'] && !entry['testing_strategy'].empty?
        content << '### 🧪 Testing Strategy'
        content << entry['testing_strategy']
        content << ''
      end

      # Additional universal fields
      if entry['description'] && !entry['description'].empty?
        content << '### Description'
        content << entry['description']
        content << ''
      end

      if entry['examples'] && !entry['examples'].empty?
        content << '### Examples'
        content << entry['examples']
        content << ''
      end

      if entry['recommendations'] && !entry['recommendations'].empty?
        content << '### Recommendations'
        content << entry['recommendations']
        content << ''
      end

      content << ''
    end
  end

  # Footer
  content << ''
  content << '---'
  content << ''
  content << "**Last Generated:** #{Time.now.strftime('%Y-%m-%d %H:%M %Z')}"
  content << '**Generated By:** `scripts/generate_teacher_chapters.rb`'
  content << '**Maintained By:** Development Team via Database UI'

  # Write chapter file
  chapter_filename = "CHAPTER_#{chapter_number.to_s.rjust(2, '0')}_#{chapter_name_slug}.md"
  file_path = File.join(teacher_dir, chapter_filename)
  File.write(file_path, content.join("\n"))
  generated_files << chapter_filename

  puts "  ✅ Chapter #{chapter_number}: #{chapter_name} (#{sorted_entries.count} entries)"
end

puts ''
puts "✅ Generated #{chapters.count} chapter files"
puts "📁 Directory: #{teacher_dir}"
puts ''
puts 'Generated files:'
generated_files.each { |f| puts "  - #{f}" }
puts ''
puts '💡 Next steps:'
puts '  1. Review the generated files in TRAPID_DOCS/TEACHER/'
puts '  2. Commit to git: git add TRAPID_DOCS/TEACHER/'
puts '  3. Git commit message: "docs: Split Teacher into per-chapter files for token efficiency"'
