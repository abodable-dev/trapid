class Supplier < ApplicationRecord
  # Associations
  has_many :pricebook_items, dependent: :nullify
  has_many :price_histories, dependent: :nullify
  belongs_to :contact, optional: true  # Legacy association
  has_many :supplier_contacts, dependent: :destroy
  has_many :contacts, through: :supplier_contacts

  # Helper method to get primary contact
  def primary_contact
    supplier_contacts.primary.first&.contact || contact
  end

  # Helper method to get all contact emails
  def contact_emails
    ([email] + contacts.pluck(:email)).compact.uniq
  end

  # Helper method to get all contact phones
  def contact_phones
    ([phone, contact_number] + contacts.pluck(:mobile_phone, :office_phone).flatten).compact.uniq
  end

  # Serialization
  serialize :trade_categories, coder: JSON
  serialize :is_default_for_trades, coder: JSON

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }
  validates :rating, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5, allow_nil: true }
  validates :response_rate, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100, allow_nil: true }
  validates :avg_response_time, numericality: { only_integer: true, greater_than_or_equal_to: 0, allow_nil: true }
  validates :supplier_code, uniqueness: { allow_blank: true }
  validates :markup_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100, allow_nil: true }

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :by_rating, -> { order(rating: :desc) }
  scope :by_response_rate, -> { order(response_rate: :desc) }
  scope :matched, -> { where.not(contact_id: nil) }
  scope :unmatched, -> { where(contact_id: nil) }
  scope :verified, -> { where(is_verified: true) }
  scope :needs_review, -> { where(is_verified: false).where.not(contact_id: nil) }
  scope :by_match_confidence, -> { order(confidence_score: :desc) }

  # Class methods
  def self.find_or_create_by_name(name)
    return nil if name.blank?
    find_or_create_by(name: name.strip)
  end

  def self.find_by_supplier_code(code)
    return nil if code.blank?
    find_by(supplier_code: code.to_s.upcase)
  end

  def self.default_for_trade(trade_category)
    return nil if trade_category.blank?
    where("is_default_for_trades::jsonb ? :trade", trade: trade_category.to_s.downcase)
      .active
      .order(rating: :desc)
      .first
  end

  def self.for_trade(trade_category)
    return active.all if trade_category.blank?
    where("trade_categories::jsonb ? :trade", trade: trade_category.to_s.downcase)
      .active
      .order(rating: :desc)
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

  # Matching methods
  def matched?
    contact_id.present?
  end

  def match_confidence_label
    return "No match" unless matched?

    case confidence_score
    when 1.0
      "Exact"
    when 0.9..Float::INFINITY
      "High"
    when 0.7..0.9
      "Fuzzy"
    when 0.0
      "Manual"
    else
      "Low"
    end
  end

  def match_status
    return :unmatched unless matched?
    return :verified if is_verified?
    :needs_review
  end
end
