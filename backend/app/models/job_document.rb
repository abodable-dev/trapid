class JobDocument < ApplicationRecord
  # Associations
  belongs_to :construction
  belongs_to :document_category
  belongs_to :uploaded_by, class_name: "User", optional: true
  belongs_to :approved_by, class_name: "User", optional: true
  belongs_to :previous_version, class_name: "JobDocument", optional: true

  has_many :newer_versions, class_name: "JobDocument", foreign_key: :previous_version_id, dependent: :nullify
  has_many :document_ai_analyses, dependent: :destroy
  has_many :document_activities, dependent: :destroy

  # File attachment (fallback if OneDrive unavailable)
  has_one_attached :file

  # Validations
  validates :title, presence: true
  validates :file_name, presence: true
  validates :file_path, presence: true
  validates :status, inclusion: { in: %w[active archived deleted] }

  # Callbacks
  after_create :log_creation
  after_update :log_update
  before_save :update_construction_document_count, if: :will_save_change_to_status?

  # Scopes
  scope :active, -> { where(status: "active") }
  scope :archived, -> { where(status: "archived") }
  scope :latest_versions, -> { where(is_latest_version: true) }
  scope :by_category, ->(category_id) { where(document_category_id: category_id) }
  scope :pending_approval, -> { where(requires_approval: true, approved_by_id: nil) }
  scope :approved, -> { where.not(approved_by_id: nil) }
  scope :recent, -> { order(created_at: :desc) }

  # Instance methods
  def approve!(user)
    update(approved_by: user, approved_at: Time.current)
  end

  def archive!
    update(status: "archived")
  end

  def create_new_version(attributes = {})
    new_version = self.class.new(attributes.merge(
      construction: construction,
      document_category: document_category,
      previous_version: self,
      version: increment_version
    ))

    if new_version.save
      update(is_latest_version: false)
      new_version
    else
      nil
    end
  end

  def increment_version
    return "1.0" if version.blank?

    major, minor = version.split(".").map(&:to_i)
    minor ||= 0
    "#{major}.#{minor + 1}"
  end

  def file_extension
    File.extname(file_name).delete(".")
  end

  def file_size_mb
    return 0 unless file_size
    (file_size.to_f / 1024 / 1024).round(2)
  end

  private

  def log_creation
    document_activities.create(
      user: uploaded_by,
      action: "created",
      description: "Document uploaded: #{title}"
    )
  end

  def log_update
    return unless saved_changes.except("updated_at").any?

    document_activities.create(
      user: Current.user,
      action: "updated",
      description: "Document updated",
      changes: saved_changes.except("updated_at")
    )
  end

  def update_construction_document_count
    return unless construction

    construction.update_column(
      :document_count,
      construction.job_documents.active.count
    )
  end
end
