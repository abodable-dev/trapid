class UserPermission < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :permission

  # Validations
  validates :user_id, uniqueness: { scope: :permission_id }
  validates :granted, inclusion: { in: [true, false] }
end
