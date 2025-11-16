# frozen_string_literal: true

class DocumentationEntry < ApplicationRecord
  # Constants
  ENTRY_TYPES = %w[
    bug architecture test performance dev_note common_issue
    component feature util hook integration optimization
  ].freeze

  LEXICON_TYPES = %w[bug architecture test performance dev_note common_issue].freeze
  TEACHER_TYPES = %w[component feature util hook integration optimization].freeze

  STATUSES = %w[open fixed by_design wont_fix monitoring].freeze
  SEVERITIES = %w[critical high medium low].freeze
  DIFFICULTIES = %w[beginner intermediate advanced].freeze

  # Validations
  validates :chapter_number, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 20 }
  validates :chapter_name, presence: true
  validates :title, presence: true
  validates :entry_type, inclusion: { in: ENTRY_TYPES }

  # Section number optional, but must be formatted if present (allows optional letter suffix like 19.11A)
  validates :section_number, format: { with: /\A\d+\.\d+[A-Z]?\z/, message: "must be in format X.Y or X.YA (e.g., 19.1 or 19.11A)" }, allow_nil: true

  # Bug-specific validations (only when entry_type = 'bug')
  validates :status, inclusion: { in: STATUSES }, if: -> { entry_type == 'bug' }
  validates :severity, inclusion: { in: SEVERITIES }, if: -> { entry_type == 'bug' }

  # Teacher-specific validations
  validates :difficulty, inclusion: { in: DIFFICULTIES }, allow_nil: true

  # Callbacks
  before_save :update_search_text

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_chapter, ->(chapter) { where(chapter_number: chapter) }
  scope :by_section, ->(section) { where(section_number: section) }
  scope :by_type, ->(type) { where(entry_type: type) }
  scope :by_status, ->(status) { where(status: status) }
  scope :by_severity, ->(severity) { where(severity: severity) }
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
  scope :ordered, -> { order(:chapter_number, :section_number, :created_at) }

  # Lexicon vs Teacher scopes
  scope :lexicon_entries, -> { where(entry_type: LEXICON_TYPES) }
  scope :teacher_entries, -> { where(entry_type: TEACHER_TYPES) }

  # Convenience scopes - Lexicon
  scope :bugs, -> { where(entry_type: 'bug') }
  scope :architecture, -> { where(entry_type: 'architecture') }
  scope :tests, -> { where(entry_type: 'test') }
  scope :performance, -> { where(entry_type: 'performance') }
  scope :dev_notes, -> { where(entry_type: 'dev_note') }
  scope :common_issues, -> { where(entry_type: 'common_issue') }

  # Convenience scopes - Teacher
  scope :components, -> { where(entry_type: 'component') }
  scope :features, -> { where(entry_type: 'feature') }
  scope :utils, -> { where(entry_type: 'util') }
  scope :hooks, -> { where(entry_type: 'hook') }
  scope :integrations, -> { where(entry_type: 'integration') }
  scope :optimizations, -> { where(entry_type: 'optimization') }

  # Combined scopes
  scope :open_bugs, -> { bugs.where(status: 'open') }
  scope :fixed_bugs, -> { bugs.where(status: 'fixed') }
  scope :critical_bugs, -> { bugs.where(severity: 'critical') }

  # Search
  def self.search(query)
    return all if query.blank?

    where("search_text ILIKE ?", "%#{sanitize_sql_like(query)}%")
      .or(where("title ILIKE ?", "%#{sanitize_sql_like(query)}%"))
  end

  # Helper methods
  def lexicon_entry?
    LEXICON_TYPES.include?(entry_type)
  end

  def teacher_entry?
    TEACHER_TYPES.include?(entry_type)
  end

  # Display methods
  def type_emoji
    case entry_type
    # Lexicon types
    when 'bug'
      '🐛'
    when 'architecture'
      '🏗️'
    when 'test'
      '📊'
    when 'performance'
      '📈'
    when 'dev_note'
      '🎓'
    when 'common_issue'
      '🔍'
    # Teacher types
    when 'component'
      '🧩'
    when 'feature'
      '✨'
    when 'util'
      '🔧'
    when 'hook'
      '🪝'
    when 'integration'
      '🔌'
    when 'optimization'
      '⚡'
    else
      '📝'
    end
  end

  def status_emoji
    return nil unless entry_type == 'bug'

    case status
    when 'open'
      '🔴'
    when 'fixed'
      '✅'
    when 'by_design'
      '⚠️'
    when 'wont_fix'
      '🚫'
    when 'monitoring'
      '🔄'
    else
      '❓'
    end
  end

  def severity_emoji
    return nil unless entry_type == 'bug'

    case severity
    when 'critical'
      '🔴'
    when 'high'
      '🟠'
    when 'medium'
      '🟡'
    when 'low'
      '🟢'
    else
      '⚪'
    end
  end

  def difficulty_emoji
    return nil unless difficulty.present?

    case difficulty
    when 'beginner'
      '🟢'
    when 'intermediate'
      '🟡'
    when 'advanced'
      '🔴'
    else
      '⚪'
    end
  end

  def status_display
    return nil unless entry_type == 'bug' && status.present?
    "#{status_emoji} #{status.upcase}"
  end

  def severity_display
    return nil unless entry_type == 'bug' && severity.present?
    "#{severity_emoji} #{severity.capitalize}"
  end

  def difficulty_display
    return nil unless difficulty.present?
    "#{difficulty_emoji} #{difficulty.capitalize}"
  end

  def type_display
    "#{type_emoji} #{entry_type.titleize}"
  end

  def section_display
    return nil unless section_number.present?
    "§#{section_number}"
  end

  private

  def update_search_text
    self.search_text = [
      title,
      component,
      entry_type,
      # Lexicon fields
      scenario,
      root_cause,
      solution,
      prevention,
      # Teacher fields
      summary,
      code_example,
      common_mistakes,
      testing_strategy,
      related_rules,
      # Universal fields
      description,
      details,
      examples,
      recommendations
    ].compact.join(' ')
  end
end
