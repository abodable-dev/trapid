class ScheduleTemplateRow < ApplicationRecord
  belongs_to :schedule_template
  belongs_to :supplier, optional: true  # Supplier is only required if po_required is true

  # Role/group constants for internal work assignment
  ASSIGNABLE_ROLES = %w[admin sales site supervisor builder estimator].freeze

  # Validations
  validates :name, presence: true
  validates :sequence_order, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :cert_lag_days, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 999 }
  validates :subtask_count, numericality: { only_integer: true, greater_than_or_equal_to: 1 }, if: :has_subtasks?
  validate :supplier_required_if_po_required
  validate :subtask_names_match_count

  # Scopes
  scope :in_sequence, -> { order(sequence_order: :asc) }
  scope :requiring_po, -> { where(po_required: true) }
  scope :auto_create_po, -> { where(create_po_on_job_start: true) }
  scope :with_photos, -> { where(require_photo: true) }
  scope :with_certificates, -> { where(require_certificate: true) }
  scope :supervisor_checks, -> { where(require_supervisor_check: true) }
  scope :with_subtasks, -> { where(has_subtasks: true) }

  # Helper methods
  def predecessor_task_ids
    predecessor_ids || []
  end

  def price_book_items
    return [] if price_book_item_ids.blank?
    PricebookItem.where(id: price_book_item_ids)
  end

  def tag_list
    tags || []
  end

  def subtask_list
    return [] unless has_subtasks?
    subtask_names || []
  end

  # Format predecessors as "2FS+3, 5SS" etc
  def predecessor_display
    return "None" if predecessor_task_ids.empty?
    predecessor_task_ids.map { |pred| format_predecessor(pred) }.join(", ")
  end

  private

  def supplier_required_if_po_required
    if create_po_on_job_start? && supplier_id.blank?
      errors.add(:supplier_id, "must be present when Auto PO is enabled")
    end
  end

  def subtask_names_match_count
    return unless has_subtasks?

    if subtask_count.present? && subtask_names.present?
      if subtask_names.length != subtask_count
        errors.add(:subtask_names, "count (#{subtask_names.length}) must match subtask_count (#{subtask_count})")
      end
    end
  end

  def format_predecessor(pred_data)
    # pred_data format: { id: 2, type: "FS", lag: 3 }
    # Output: "2FS+3" or "2FS-2" or "2FS" if no lag
    if pred_data.is_a?(Hash)
      task_id = pred_data['id'] || pred_data[:id]
      dep_type = pred_data['type'] || pred_data[:type] || 'FS'
      lag = pred_data['lag'] || pred_data[:lag] || 0

      result = "#{task_id}#{dep_type}"
      result += lag >= 0 ? "+#{lag}" : lag.to_s if lag != 0
      result
    else
      # Legacy format: just an integer ID (assume FS with no lag)
      "#{pred_data}FS"
    end
  end
end
