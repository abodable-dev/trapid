# frozen_string_literal: true

class DocumentedBug < ApplicationRecord
  # Constants
  STATUSES = %w[open fixed by_design wont_fix monitoring].freeze
  SEVERITIES = %w[critical high medium low].freeze

  # Validations
  validates :chapter_number, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 18 }
  validates :chapter_name, presence: true
  validates :bug_title, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :severity, inclusion: { in: SEVERITIES }

  # Callbacks
  before_save :update_search_text

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_chapter, ->(chapter) { where(chapter_number: chapter) }
  scope :by_status, ->(status) { where(status: status) }
  scope :by_severity, ->(severity) { where(severity: severity) }
  scope :open_bugs, -> { where(status: 'open') }
  scope :fixed_bugs, -> { where(status: 'fixed') }
  scope :critical_bugs, -> { where(severity: 'critical') }

  # Search
  def self.search(query)
    return all if query.blank?

    where("search_text ILIKE ?", "%#{sanitize_sql_like(query)}%")
      .or(where("bug_title ILIKE ?", "%#{sanitize_sql_like(query)}%"))
  end

  # Display methods
  def status_emoji
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
    "#{status_emoji} #{status.upcase}"
  end

  def severity_display
    "#{severity_emoji} #{severity.capitalize}"
  end

  private

  def update_search_text
    self.search_text = [
      bug_title,
      component,
      scenario,
      root_cause,
      solution,
      prevention
    ].compact.join(' ')
  end
end
