class CompanyActivity < ApplicationRecord
  # Associations
  belongs_to :company
  belongs_to :user, optional: true
  belongs_to :related, polymorphic: true, optional: true

  # Validations
  validates :activity_type, presence: true

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(activity_type: type) }
  scope :for_company, ->(company_id) { where(company_id: company_id) }
end
