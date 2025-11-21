class CompanyXeroAccount < ApplicationRecord
  # Associations
  belongs_to :company_xero_connection

  # Validations
  validates :xero_account_id, presence: true
  validates :account_code, presence: true

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :by_type, ->(type) { where(account_type: type) }
  scope :for_connection, ->(connection_id) { where(company_xero_connection_id: connection_id) }
end
