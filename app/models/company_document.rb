class CompanyDocument < ApplicationRecord
  # Associations
  belongs_to :company
  has_one_attached :file

  # Validations
  validates :title, presence: true
  validates :document_type, presence: true, inclusion: {
    in: %w[constitution agm_minutes director_resolution share_certificate tax_return financial_statements asic_extract other]
  }

  # Scopes
  scope :by_type, ->(type) { where(document_type: type) }
  scope :recent, -> { order(created_at: :desc) }

  # Callbacks
  before_save :set_file_metadata, if: -> { file.attached? }

  private

  def set_file_metadata
    self.file_name = file.filename.to_s
    self.file_size = file.byte_size
    self.uploaded_at = Time.current if uploaded_at.nil?
  end
end
