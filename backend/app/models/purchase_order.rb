class PurchaseOrder < ApplicationRecord
  # Associations
  belongs_to :construction, counter_cache: true
  belongs_to :supplier, optional: true
  has_many :line_items, class_name: 'PurchaseOrderLineItem', dependent: :destroy

  # Nested attributes
  accepts_nested_attributes_for :line_items, allow_destroy: true

  # Validations
  validates :po_number, presence: true, uniqueness: true
  validates :construction_id, presence: true
  validates :status, presence: true, inclusion: {
    in: %w[draft pending approved sent received invoiced paid cancelled]
  }

  # Status enum
  enum :status, {
    draft: 'draft',
    pending: 'pending',
    approved: 'approved',
    sent: 'sent',
    received: 'received',
    invoiced: 'invoiced',
    paid: 'paid',
    cancelled: 'cancelled'
  }

  # Callbacks
  before_validation :generate_po_number, if: :new_record?
  before_save :calculate_totals

  # Scopes
  scope :by_status, ->(status) { where(status: status) if status.present? }
  scope :by_construction, ->(construction_id) { where(construction_id: construction_id) if construction_id.present? }
  scope :recent, -> { order(created_at: :desc) }
  scope :overdue, -> { where('required_date < ? AND status NOT IN (?)', Date.today, ['received', 'cancelled']) }
  scope :pending_approval, -> { where(status: 'pending') }

  # Instance methods
  def calculate_totals
    self.sub_total = line_items.sum { |item| item.quantity * item.unit_price }
    self.tax_amount = line_items.sum(&:tax_amount)
    self.total_amount = sub_total + tax_amount
  end

  def approve!(user_id = nil)
    update(
      status: 'approved',
      approved_by_id: user_id,
      approved_at: Time.current
    )
  end

  def send_to_supplier!
    update(status: 'sent', ordered_date: Date.today)
  end

  def mark_received!
    update(status: 'received', received_date: Date.today)
  end

  def can_edit?
    %w[draft pending].include?(status)
  end

  def can_approve?
    status == 'pending'
  end

  def can_cancel?
    !%w[paid cancelled].include?(status)
  end

  private

  def generate_po_number
    return if po_number.present?

    last_po = PurchaseOrder.order(created_at: :desc).first
    next_number = if last_po && last_po.po_number =~ /PO-(\d+)/
      $1.to_i + 1
    else
      1
    end

    self.po_number = "PO-#{next_number.to_s.rjust(6, '0')}"
  end
end
