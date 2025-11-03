class Supplier < ApplicationRecord
  # Associations
  has_many :pricebook_items, dependent: :nullify
  has_many :price_histories, dependent: :nullify

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }
  validates :rating, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5, allow_nil: true }
  validates :response_rate, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100, allow_nil: true }
  validates :avg_response_time, numericality: { only_integer: true, greater_than_or_equal_to: 0, allow_nil: true }

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :by_rating, -> { order(rating: :desc) }
  scope :by_response_rate, -> { order(response_rate: :desc) }

  # Class methods
  def self.find_or_create_by_name(name)
    return nil if name.blank?
    find_or_create_by(name: name.strip)
  end

  # Instance methods
  def display_name
    name
  end

  def rating_stars
    return "No rating" if rating.nil? || rating.zero?
    "★" * rating + "☆" * (5 - rating)
  end

  def response_rate_percentage
    return "0%" if response_rate.nil? || response_rate.zero?
    "#{response_rate.round(1)}%"
  end

  def avg_response_time_formatted
    return "N/A" if avg_response_time.nil? || avg_response_time.zero?
    hours = avg_response_time
    if hours < 24
      "#{hours}h"
    else
      days = (hours / 24.0).round(1)
      "#{days}d"
    end
  end
end
