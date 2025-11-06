class DocumentActivity < ApplicationRecord
  # Associations
  belongs_to :job_document
  belongs_to :user

  # Validations
  validates :action, presence: true, inclusion: {
    in: %w[created updated deleted viewed downloaded approved rejected archived restored shared]
  }

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_action, ->(action) { where(action: action) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :by_document, ->(document_id) { where(job_document_id: document_id) }
  scope :in_date_range, ->(start_date, end_date) { where(created_at: start_date..end_date) }

  # Class methods
  def self.log_activity(document:, user:, action:, description: nil, changes: {}, request: nil)
    create(
      job_document: document,
      user: user,
      action: action,
      description: description || "#{action.humanize} document",
      changes: changes,
      ip_address: request&.remote_ip,
      user_agent: request&.user_agent
    )
  end

  # Instance methods
  def action_label
    action.humanize
  end

  def formatted_timestamp
    created_at.strftime("%B %d, %Y at %I:%M %p")
  end

  def as_json(options = {})
    super(options.merge(
      include: { user: { only: [:id, :email, :first_name, :last_name] } },
      methods: [:action_label, :formatted_timestamp]
    ))
  end
end
