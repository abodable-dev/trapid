class PricebookItem < ApplicationRecord
  # Associations
  belongs_to :supplier, optional: true
  has_many :price_histories, dependent: :destroy

  # Validations
  validates :item_code, presence: true, uniqueness: true
  validates :item_name, presence: true
  validates :current_price, numericality: { greater_than_or_equal_to: 0, allow_nil: true }
  validates :unit_of_measure, presence: true

  # Callbacks
  before_save :check_pricing_review_status
  after_update :track_price_change, if: :saved_change_to_current_price?

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :needs_pricing, -> { where(needs_pricing_review: true) }
  scope :by_category, ->(category) { where(category: category) if category.present? }
  scope :by_supplier, ->(supplier_id) { where(supplier_id: supplier_id) if supplier_id.present? }
  scope :price_range, ->(min_price, max_price) {
    query = all
    query = query.where("current_price >= ?", min_price) if min_price.present?
    query = query.where("current_price <= ?", max_price) if max_price.present?
    query
  }

  # Full-text search
  scope :search, ->(query) {
    return all if query.blank?

    where(
      "searchable_text @@ plainto_tsquery('english', ?)",
      query
    ).order(
      Arel.sql("ts_rank(searchable_text, plainto_tsquery('english', '#{sanitize_sql(query)}')) DESC")
    )
  }

  # Class methods
  def self.categories
    where.not(category: nil).distinct.pluck(:category).sort
  end

  def self.units_of_measure
    distinct.pluck(:unit_of_measure).compact.sort
  end

  # Instance methods
  def display_price
    return "No price" if current_price.nil?
    "$#{'%.2f' % current_price}"
  end

  def price_with_unit
    return "#{display_price} per #{unit_of_measure}"
  end

  def has_supplier?
    supplier_id.present?
  end

  def supplier_name
    supplier&.name || "No supplier"
  end

  def latest_price_change
    price_histories.order(created_at: :desc).first
  end

  def price_trend(days: 90)
    histories = price_histories
      .where("created_at >= ?", days.days.ago)
      .order(created_at: :asc)

    return nil if histories.empty?

    first_price = histories.first.old_price || 0
    last_price = histories.last.new_price || current_price || 0

    return 0 if first_price.zero?

    ((last_price - first_price) / first_price * 100).round(2)
  end

  private

  def check_pricing_review_status
    # Flag items without prices for review
    if current_price.nil? || current_price.zero?
      self.needs_pricing_review = true
    elsif needs_pricing_review && current_price.present? && current_price.positive?
      # Unflag if price is now set
      self.needs_pricing_review = false
    end
  end

  def track_price_change
    old_price = saved_change_to_current_price[0]
    new_price = saved_change_to_current_price[1]

    price_histories.create!(
      old_price: old_price,
      new_price: new_price,
      change_reason: "manual_edit",
      supplier_id: supplier_id
    )
  end
end
