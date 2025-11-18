# frozen_string_literal: true
# Clean TRAPID_BIBLE.md to contain ONLY rules (MUST/NEVER/ALWAYS)
# Remove all code blocks, implementations, and HOW-TO content
# Add cross-references to TRAPID_TEACHER.md for implementations

bible_path = Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_BIBLE.md')
backup_path = Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_BIBLE.md.backup')
content = File.read(bible_path, encoding: 'UTF-8')

puts "📖 Cleaning TRAPID_BIBLE.md..."
puts "📄 Original size: #{content.length} characters (#{content.lines.count} lines)"
puts ""

# Create backup
File.write(backup_path, content)
puts "💾 Backup created: TRAPID_BIBLE.md.backup"
puts ""

# Clean each RULE section
cleaned_content = content.gsub(/## RULE #(\d+(?:\.\d+)?[A-Z]?): (.+?)\n(.+?)(?=\n## RULE #|\n## 🔒 Protected|\n## API Endpoints|\n---\n\n#|\z)/m) do |match|
  rule_num = $1
  rule_title = $2
  rule_content = $3

  # Keep the rule header
  cleaned_rule = "## RULE ##{rule_num}: #{rule_title}\n"

  # Extract only the directives (MUST/NEVER/ALWAYS lines)
  directives = []

  # Extract ✅ MUST lines
  must_lines = rule_content.scan(/✅ \*\*MUST.*?\n(?:- .+\n)*/)
  directives.concat(must_lines)

  # Extract ❌ NEVER lines
  never_lines = rule_content.scan(/❌ \*\*NEVER.*?\n(?:- .+\n)*/)
  directives.concat(never_lines)

  # Extract ✅ ALWAYS lines
  always_lines = rule_content.scan(/✅ \*\*ALWAYS.*?\n(?:- .+\n)*/)
  directives.concat(always_lines)

  # If we have directives, add them
  if directives.any?
    cleaned_rule += "\n"
    cleaned_rule += directives.join("\n")
    cleaned_rule += "\n"
  end

  # Add cross-reference to Teacher
  cleaned_rule += "**📖 Implementation:** See [TRAPID_TEACHER.md §#{rule_num}](TRAPID_TEACHER.md##{rule_num.downcase.tr('.', '')}-)\n"
  cleaned_rule += "**📕 Bug History:** See [TRAPID_LEXICON.md Chapter #{rule_num.split('.').first}](TRAPID_LEXICON.md)\n"
  cleaned_rule += "\n---\n"

  cleaned_rule
end

# Remove all code blocks
cleaned_content = cleaned_content.gsub(/```\w*\n.+?```/m, '')

# Remove "Implementation:" sections
cleaned_content = cleaned_content.gsub(/\*\*Implementation:\*\*.+?(?=\n##|\n\*\*|---|\z)/m, '')

# Remove "Code location:" sections
cleaned_content = cleaned_content.gsub(/\*\*Code location:\*\*.+?\n/, '')

# Remove "Files:" sections
cleaned_content = cleaned_content.gsub(/\*\*Files:\*\*.+?(?=\n##|\n\*\*|---|\z)/m, '')

# Remove "Pattern:" sections with code
cleaned_content = cleaned_content.gsub(/\*\*Pattern:\*\*.+?(?=\n##|\n\*\*|---|\z)/m, '')

# Remove "Why:" explanation sections (these go in Lexicon)
cleaned_content = cleaned_content.gsub(/\*\*Why:\*\*.+?(?=\n##|\n\*\*|---|\z)/m, '')

# Remove "Example:" sections
cleaned_content = cleaned_content.gsub(/\*\*Example:\*\*.+?(?=\n##|\n\*\*|---|\z)/m, '')

# Remove multiple blank lines
cleaned_content = cleaned_content.gsub(/\n{3,}/, "\n\n")

# Write cleaned version
output_path = Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_BIBLE_CLEAN.md')
File.write(output_path, cleaned_content)

puts "✅ Cleaned Bible written to: TRAPID_BIBLE_CLEAN.md"
puts "📄 New size: #{cleaned_content.length} characters (#{cleaned_content.lines.count} lines)"
puts "📉 Reduction: #{((1 - cleaned_content.length.to_f / content.length) * 100).round(1)}%"
puts ""
puts "⚠️  Review TRAPID_BIBLE_CLEAN.md before replacing original"
puts ""
puts "To apply changes:"
puts "  mv TRAPID_DOCS/TRAPID_BIBLE_CLEAN.md TRAPID_DOCS/TRAPID_BIBLE.md"
