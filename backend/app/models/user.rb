class User < ApplicationRecord
  has_secure_password

  has_many :grok_plans, dependent: :destroy
  has_many :chat_messages, dependent: :destroy

  # Role constants
  ROLES = %w[user admin product_owner estimator supervisor builder].freeze

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  validates :role, inclusion: { in: ROLES }

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
end
