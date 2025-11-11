class User < ApplicationRecord
  has_secure_password

  has_many :grok_plans, dependent: :destroy
  has_many :chat_messages, dependent: :destroy

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
