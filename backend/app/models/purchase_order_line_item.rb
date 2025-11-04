class PurchaseOrderLineItem < ApplicationRecord
  # Associations
  belongs_to :purchase_order
  belongs_to :pricebook_item, optional: true

  # Validations
  validates :description, presence: true
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :line_number, presence: true, numericality: { only_integer: true, greater_than: 0 }

  # Callbacks
  before_validation :set_line_number, if: :new_record?
  before_validation :set_description_from_pricebook_item, if: -> { pricebook_item.present? && description.blank? }
  before_save :calculate_totals

  # Scopes
  scope :ordered, -> { order(:line_number) }

  # Instance methods
  def calculate_totals
    line_subtotal = (quantity || 0) * (unit_price || 0)
    # Calculate tax (10% GST by default, can be customized)
    self.tax_amount = (line_subtotal * 0.10).round(2)
    self.total_amount = (line_subtotal + tax_amount).round(2)
  end

  private

  def set_line_number
    return if line_number.present?

    max_line = purchase_order&.line_items&.maximum(:line_number) || 0
    self.line_number = max_line + 1
  end

  def set_description_from_pricebook_item
    self.description = pricebook_item.item_name if pricebook_item
    self.unit_price = pricebook_item.current_price if pricebook_item && unit_price.zero?
  end
end
