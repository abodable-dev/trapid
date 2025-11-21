class CompanyComplianceItem < ApplicationRecord
  # Associations
  belongs_to :company

  # Validations
  validates :title, presence: true
  validates :due_date, presence: true
  validates :item_type, presence: true, inclusion: { in: %w[asic_review tax_return financial_statements agm other] }

  # Scopes
  scope :pending, -> { where(completed: false) }
  scope :completed, -> { where(completed: true) }
  scope :due_soon, ->(days = 30) { pending.where('due_date BETWEEN ? AND ?', Date.today, days.days.from_now) }
  scope :overdue, -> { pending.where('due_date < ?', Date.today) }
  scope :by_type, ->(type) { where(item_type: type) }

  # Instance methods
  def mark_complete!
    update(completed: true, completed_at: Time.current)
  end

  def is_overdue
    !completed && due_date < Date.today
  end

  def days_until_due
    return nil if completed
    (due_date - Date.today).to_i
  end

  def reminder_days_array
    return [] unless reminder_days
    reminder_days.split(',').map(&:to_i).sort.reverse
  end

  def should_send_reminder?
    return false if completed
    return false if last_reminder_sent_at && last_reminder_sent_at > 1.day.ago

    days = days_until_due
    reminder_days_array.any? { |reminder_day| days == reminder_day }
  end
end
