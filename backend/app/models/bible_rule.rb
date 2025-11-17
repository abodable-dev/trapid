# frozen_string_literal: true

class BibleRule < ApplicationRecord
  # Constants
  RULE_TYPES = %w[MUST NEVER ALWAYS PROTECTED CONFIG].freeze

  # Validations
  validates :chapter_number, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 20 }
  validates :chapter_name, presence: true
  validates :rule_number, presence: true, uniqueness: { scope: :chapter_number }
  validates :title, presence: true
  validates :description, presence: true
  validates :rule_type, inclusion: { in: RULE_TYPES }, allow_nil: true

  # Rule number format validation (e.g., "19.1", "9.3A")
  validates :rule_number, format: { with: /\A\d+\.\d+[A-Z]?\z/, message: "must be in format X.Y or X.YA (e.g., 19.1 or 9.3A)" }

  # Callbacks
  before_save :update_search_text

  # Scopes
  scope :by_chapter, ->(chapter) { where(chapter_number: chapter) }
  scope :by_rule_type, ->(type) { where(rule_type: type) }
  scope :ordered, -> { order(:chapter_number, :sort_order, :rule_number) }
  scope :recent, -> { order(created_at: :desc) }

  # Rule type scopes
  scope :must_rules, -> { where(rule_type: 'MUST') }
  scope :never_rules, -> { where(rule_type: 'NEVER') }
  scope :always_rules, -> { where(rule_type: 'ALWAYS') }
  scope :protected_rules, -> { where(rule_type: 'PROTECTED') }
  scope :config_rules, -> { where(rule_type: 'CONFIG') }

  # Search
  def self.search(query)
    return all if query.blank?

    where("search_text ILIKE ?", "%#{sanitize_sql_like(query)}%")
      .or(where("title ILIKE ?", "%#{sanitize_sql_like(query)}%"))
  end

  # Display methods
  def type_emoji
    case rule_type
    when 'MUST'
      '✅'
    when 'NEVER'
      '❌'
    when 'ALWAYS'
      '🔄'
    when 'PROTECTED'
      '🔒'
    when 'CONFIG'
      '⚙️'
    else
      '📖'
    end
  end

  def rule_display
    "RULE ##{rule_number}"
  end

  def full_title
    "#{rule_display}: #{title}"
  end

  def type_display
    return nil unless rule_type.present?
    "#{type_emoji} #{rule_type}"
  end

  private

  def update_search_text
    self.search_text = [
      rule_number,
      title,
      description,
      code_example,
      cross_references
    ].compact.join(' ')
  end
end
