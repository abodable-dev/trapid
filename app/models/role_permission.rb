class RolePermission < ApplicationRecord
  # Associations
  belongs_to :permission

  # Validations
  validates :role, presence: true
  validates :permission_id, uniqueness: { scope: :role }

  # Valid roles (matches User::ROLES)
  VALID_ROLES = %w[user admin product_owner estimator supervisor builder].freeze
  validates :role, inclusion: { in: VALID_ROLES }
end
