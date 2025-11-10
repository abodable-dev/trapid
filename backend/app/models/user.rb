class User < ApplicationRecord
  has_secure_password

  has_many :grok_plans, dependent: :destroy

  # Role constants
  ROLES = %w[user admin].freeze

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
end
