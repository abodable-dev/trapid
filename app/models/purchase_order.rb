class PurchaseOrder < ApplicationRecord
  # Associations
  belongs_to :construction, counter_cache: true
  belongs_to :supplier, optional: true, counter_cache: true
  has_many :line_items, class_name: 'PurchaseOrderLineItem', dependent: :destroy
  has_many :project_tasks, dependent: :nullify

  # Nested attributes
  accepts_nested_attributes_for :line_items, allow_destroy: true

  # Validations
  validates :purchase_order_number, presence: true, uniqueness: true
  validates :construction_id, presence: true
  validates :status, presence: true, inclusion: {
    in: %w[draft pending approved sent received invoiced paid cancelled]
  }
  validates :payment_status, allow_nil: true, inclusion: {
    in: %w[pending part_payment complete manual_review]
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

  # Payment status enum (for Xero invoice matching)
  enum :payment_status, {
    pending: 'pending',
    part_payment: 'part_payment',
    complete: 'complete',
    manual_review: 'manual_review'
  }, prefix: :payment

  # Callbacks
  before_validation :generate_po_number, if: :new_record?
  before_save :calculate_totals
  before_save :calculate_variances

  # Scopes
  scope :by_status, ->(status) { where(status: status) if status.present? }
  scope :by_construction, ->(construction_id) { where(construction_id: construction_id) if construction_id.present? }
  scope :recent, -> { order(created_at: :desc) }
  scope :overdue, -> { where('required_date < ? AND status NOT IN (?)', Date.today, ['received', 'cancelled']) }
  scope :pending_approval, -> { where(status: 'pending') }
  scope :for_schedule, -> { where(creates_schedule_tasks: true) }

  # Instance methods
  def calculate_totals
    self.sub_total = line_items.sum { |item| item.quantity * item.unit_price }
    self.tax = line_items.sum(&:tax_amount)
    self.total = sub_total + tax

    # Calculate amount still to be invoiced
    self.amount_still_to_be_invoiced = total - (amount_invoiced || 0)
  end

  def calculate_variances
    # Calculate total with allowance (can be customized based on business logic)
    self.total_with_allowance = total

    # Calculate budget variance
    if budget.present? && budget > 0
      self.diff_po_with_allowance_versus_budget = total_with_allowance - budget
    end

    # Calculate Xero variances
    if xero_amount_paid.present?
      self.xero_still_to_be_paid = total - xero_amount_paid

      if !xero_complete
        self.diff_xero_and_total_but_not_complete = xero_amount_paid - total
      end

      if budget.present? && budget > 0
        self.xero_budget_diff = xero_amount_paid - budget
      end
    end
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

  # Calculate payment percentage relative to PO total
  def payment_percentage
    return 0 if total.nil? || total.zero?
    return 0 if invoiced_amount.nil? || invoiced_amount.zero?

    (invoiced_amount / total * 100).round(2)
  end

  # Determine payment status based on invoice amount
  # Returns the appropriate payment_status based on invoice amount vs PO total
  def determine_payment_status(invoice_amount)
    return 'pending' if invoice_amount.nil? || invoice_amount.zero?
    return 'manual_review' if total.nil? || total.zero?

    # Check if invoice exceeds PO total by $1 or more FIRST
    if invoice_amount > total && (invoice_amount - total) >= 1.0
      return 'manual_review'
    end

    percentage = (invoice_amount / total * 100).round(2)

    # Within 5% tolerance (95% - 105%)
    if percentage >= 95.0 && percentage <= 105.0
      'complete'
    # Partial payment (less than 95% of total)
    elsif percentage < 95.0
      'part_payment'
    else
      'pending'
    end
  end

  # Apply invoice details to this PO
  # Updates invoiced_amount, invoice_date, invoice_reference, and payment_status
  def apply_invoice!(invoice_amount:, invoice_date:, invoice_reference:)
    new_status = determine_payment_status(invoice_amount)

    update!(
      invoiced_amount: invoice_amount,
      invoice_date: invoice_date,
      invoice_reference: invoice_reference,
      payment_status: new_status
    )

    # Also update xero_invoice_id if invoice_reference looks like Xero ID
    if invoice_reference.present? && invoice_reference.match?(/^[A-Z0-9-]+$/)
      update_column(:xero_invoice_id, invoice_reference)
    end

    new_status
  end

  private

  def generate_po_number
    return if purchase_order_number.present?

    last_po = PurchaseOrder.order(created_at: :desc).first
    next_number = if last_po && last_po.purchase_order_number =~ /PO-(\d+)/
      $1.to_i + 1
    else
      1
    end

    self.purchase_order_number = "PO-#{next_number.to_s.rjust(6, '0')}"
  end
end
