# frozen_string_literal: true

class DocumentedBug < ApplicationRecord
  # Constants
  KNOWLEDGE_TYPES = %w[bug architecture test performance dev_note common_issue].freeze
  STATUSES = %w[open fixed by_design wont_fix monitoring].freeze
  SEVERITIES = %w[critical high medium low].freeze

  # Validations
  validates :chapter_number, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 18 }
  validates :chapter_name, presence: true
  validates :bug_title, presence: true
  validates :knowledge_type, inclusion: { in: KNOWLEDGE_TYPES }

  # Bug-specific validations (only required when knowledge_type = 'bug')
  validates :status, inclusion: { in: STATUSES }, if: -> { knowledge_type == 'bug' }
  validates :severity, inclusion: { in: SEVERITIES }, if: -> { knowledge_type == 'bug' }

  # Callbacks
  before_save :update_search_text

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_chapter, ->(chapter) { where(chapter_number: chapter) }
  scope :by_type, ->(type) { where(knowledge_type: type) }
  scope :by_status, ->(status) { where(status: status) }
  scope :by_severity, ->(severity) { where(severity: severity) }

  # Convenience scopes
  scope :bugs, -> { where(knowledge_type: 'bug') }
  scope :architecture, -> { where(knowledge_type: 'architecture') }
  scope :tests, -> { where(knowledge_type: 'test') }
  scope :performance, -> { where(knowledge_type: 'performance') }
  scope :dev_notes, -> { where(knowledge_type: 'dev_note') }
  scope :common_issues, -> { where(knowledge_type: 'common_issue') }

  scope :open_bugs, -> { bugs.where(status: 'open') }
  scope :fixed_bugs, -> { bugs.where(status: 'fixed') }
  scope :critical_bugs, -> { bugs.where(severity: 'critical') }

  # Search
  def self.search(query)
    return all if query.blank?

    where("search_text ILIKE ?", "%#{sanitize_sql_like(query)}%")
      .or(where("bug_title ILIKE ?", "%#{sanitize_sql_like(query)}%"))
  end

  # Display methods
  def type_emoji
    case knowledge_type
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
    else
      '📝'
    end
  end

  def status_emoji
    return nil unless knowledge_type == 'bug'

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
    return nil unless knowledge_type == 'bug'

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

  def status_display
    return nil unless knowledge_type == 'bug' && status.present?
    "#{status_emoji} #{status.upcase}"
  end

  def severity_display
    return nil unless knowledge_type == 'bug' && severity.present?
    "#{severity_emoji} #{severity.capitalize}"
  end

  def type_display
    "#{type_emoji} #{knowledge_type.titleize}"
  end

  private

  def update_search_text
    self.search_text = [
      bug_title,
      component,
      knowledge_type,
      # Old fields (for bugs)
      scenario,
      root_cause,
      solution,
      prevention,
      # New universal fields
      description,
      details,
      examples,
      recommendations
    ].compact.join(' ')
  end
end
