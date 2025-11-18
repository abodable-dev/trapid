class User < ApplicationRecord
  has_secure_password

  has_many :grok_plans, dependent: :destroy
  has_many :chat_messages, dependent: :destroy
  has_many :user_permissions, dependent: :destroy
  has_many :permissions, through: :user_permissions

  # Role constants
  ROLES = %w[user admin product_owner estimator supervisor builder].freeze

  # Group/team assignment options (matches ScheduleTemplateRow::ASSIGNABLE_ROLES)
  ASSIGNABLE_ROLES = %w[admin sales site supervisor builder estimator].freeze

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :password, length: { minimum: 12 }, if: -> { new_record? || !password.nil? }
  validate :password_complexity, if: -> { new_record? || !password.nil? }
  validates :role, inclusion: { in: ROLES }
  validates :assigned_role, inclusion: { in: ASSIGNABLE_ROLES }, allow_nil: true

  # Role helper methods
  def admin?
    role == 'admin'
  end

  def user?
    role == 'user'
  end

  def product_owner?
    role == 'product_owner'
  end

  def estimator?
    role == 'estimator'
  end

  def supervisor?
    role == 'supervisor'
  end

  def builder?
    role == 'builder'
  end

  # Permission checks for schedule features
  def can_create_templates?
    admin? || product_owner?
  end

  def can_edit_schedule?
    admin? || product_owner? || estimator?
  end

  def can_view_supervisor_tasks?
    admin? || supervisor?
  end

  def can_view_builder_tasks?
    admin? || builder?
  end

  # ===================================================================
  # PERMISSION SYSTEM
  # ===================================================================

  # Main permission check method
  # Usage: user.can?(:view_gantt) or user.can?('edit_projects')
  def can?(permission_name)
    # In dev mode with bypass enabled, grant all permissions
    if ENV['DEV_MODE_AUTH_BYPASS'] == 'true'
      return true
    end

    permission_name = permission_name.to_s

    # Check user-specific override first
    user_perm = user_permissions.joins(:permission).find_by(permissions: { name: permission_name })
    return user_perm.granted if user_perm.present?

    # Fall back to role-based permission
    RolePermission.joins(:permission)
                  .where(role: role, permissions: { name: permission_name, enabled: true })
                  .exists?
  end

  # Check multiple permissions at once (user must have ALL)
  def can_all?(*permission_names)
    permission_names.all? { |perm| can?(perm) }
  end

  # Check if user has ANY of the given permissions
  def can_any?(*permission_names)
    permission_names.any? { |perm| can?(perm) }
  end

  # Get all permissions for this user (role + overrides)
  def all_permissions
    # In dev mode, return all permissions
    if ENV['DEV_MODE_AUTH_BYPASS'] == 'true'
      return Permission.enabled.pluck(:name)
    end

    # Get role permissions
    role_perms = RolePermission.joins(:permission)
                               .where(role: role, permissions: { enabled: true })
                               .pluck('permissions.name')

    # Apply user overrides
    user_permissions.joins(:permission).each do |up|
      if up.granted
        role_perms << up.permission.name unless role_perms.include?(up.permission.name)
      else
        role_perms.delete(up.permission.name)
      end
    end

    role_perms.uniq
  end

  private

  def password_complexity
    return if password.blank?

    # Check for at least one uppercase letter
    unless password.match?(/[A-Z]/)
      errors.add :password, 'must contain at least one uppercase letter'
    end

    # Check for at least one lowercase letter
    unless password.match?(/[a-z]/)
      errors.add :password, 'must contain at least one lowercase letter'
    end

    # Check for at least one digit
    unless password.match?(/\d/)
      errors.add :password, 'must contain at least one number'
    end

    # Check for at least one special character
    unless password.match?(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
      errors.add :password, 'must contain at least one special character'
    end
  end
end
