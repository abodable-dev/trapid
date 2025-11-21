class AssetInsurance < ApplicationRecord
  # Associations
  belongs_to :asset

  # Validations
  validates :insurance_company, presence: true
  validates :policy_number, presence: true
  validates :start_date, presence: true
  validates :expiry_date, presence: true
  validates :premium_frequency, inclusion: { in: %w[monthly quarterly semi_annual annual], allow_nil: true }
  validate :expiry_after_start

  # Scopes
  scope :active, -> { where('expiry_date >= ?', Date.today) }
  scope :expiring_soon, ->(days = 30) { where('expiry_date BETWEEN ? AND ?', Date.today, days.days.from_now) }
  scope :expired, -> { where('expiry_date < ?', Date.today) }

  # Instance methods
  def expiring_soon?(days = 30)
    expiry_date.between?(Date.today, days.days.from_now)
  end

  def expired?
    expiry_date < Date.today
  end

  def days_until_expiry
    (expiry_date - Date.today).to_i
  end

  private

  def expiry_after_start
    return unless start_date && expiry_date
    errors.add(:expiry_date, "must be after start date") if expiry_date <= start_date
  end
end
