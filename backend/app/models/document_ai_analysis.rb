class DocumentAiAnalysis < ApplicationRecord
  # Associations
  belongs_to :job_document
  belongs_to :construction

  # Validations
  validates :analysis_type, presence: true, inclusion: {
    in: %w[plan_review invoice_extraction rfi_analysis scope_comparison material_takeoff]
  }
  validates :status, inclusion: { in: %w[pending processing completed failed] }

  # Callbacks
  after_create :enqueue_analysis_job
  before_update :set_completion_time, if: -> { status_changed? && %w[completed failed].include?(status) }

  # Scopes
  scope :pending, -> { where(status: "pending") }
  scope :processing, -> { where(status: "processing") }
  scope :completed, -> { where(status: "completed") }
  scope :failed, -> { where(status: "failed") }
  scope :by_type, ->(type) { where(analysis_type: type) }
  scope :recent, -> { order(created_at: :desc) }
  scope :high_confidence, -> { where("confidence_score >= ?", 80.0) }
  scope :with_discrepancies, -> { where("jsonb_array_length(discrepancies) > 0") }

  # Instance methods
  def start_processing!
    update(
      status: "processing",
      started_at: Time.current
    )
  end

  def complete!(data = {})
    update(
      status: "completed",
      extracted_data: data[:extracted_data] || {},
      discrepancies: data[:discrepancies] || [],
      suggestions: data[:suggestions] || [],
      summary: data[:summary],
      confidence_score: data[:confidence_score]
    )
  end

  def fail!(error_message)
    update(
      status: "failed",
      error_message: error_message
    )
  end

  def has_discrepancies?
    discrepancies.present? && discrepancies.any?
  end

  def discrepancy_count
    discrepancies&.length || 0
  end

  def processing_duration
    return nil unless completed_at && started_at
    ((completed_at - started_at) / 1.minute).round(2)
  end

  def as_json(options = {})
    super(options.merge(
      methods: [:has_discrepancies?, :discrepancy_count, :processing_duration]
    ))
  end

  private

  def enqueue_analysis_job
    # Queue background job for AI analysis
    # DocumentAiAnalysisJob.perform_later(id)
    Rails.logger.info "DocumentAiAnalysis #{id} created - job queuing not implemented yet"
  end

  def set_completion_time
    self.completed_at = Time.current if status.in?(%w[completed failed])
  end
end
