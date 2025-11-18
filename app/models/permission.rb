class Permission < ApplicationRecord
  # Associations
  has_many :role_permissions, dependent: :destroy
  has_many :user_permissions, dependent: :destroy

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :category, presence: true

  # Scopes
  scope :enabled, -> { where(enabled: true) }
  scope :by_category, ->(category) { where(category: category) }

  # Permission categories
  CATEGORIES = {
    'projects' => 'Project Management',
    'gantt' => 'Gantt Chart & Scheduling',
    'users' => 'User Management',
    'reports' => 'Reports & Analytics',
    'financials' => 'Financial Management',
    'inventory' => 'Inventory & Supplies',
    'documents' => 'Document Management',
    'settings' => 'System Settings'
  }.freeze

  # Check if permission is granted for a specific role
  def granted_to_role?(role)
    role_permissions.exists?(role: role)
  end

  # Check if permission is granted to a specific user (with override)
  def granted_to_user?(user)
    # Check user-specific override first
    user_override = user_permissions.find_by(user: user)
    return user_override.granted if user_override.present?

    # Fall back to role-based permission
    granted_to_role?(user.role)
  end
end
