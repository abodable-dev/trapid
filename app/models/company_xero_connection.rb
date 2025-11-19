class CompanyXeroConnection < ApplicationRecord
  # Associations
  belongs_to :company
  has_many :company_xero_accounts, dependent: :destroy

  # Validations
  validates :tenant_id, presence: true
  validates :company_id, uniqueness: true

  # Scopes
  scope :connected, -> { where(connected: true) }
  scope :expired, -> { where('token_expires_at < ?', Time.current) }
  scope :needs_refresh, -> { where('token_expires_at < ?', 1.hour.from_now) }

  # Instance methods
  def token_expired?
    token_expires_at && token_expires_at < Time.current
  end

  def needs_token_refresh?
    token_expires_at && token_expires_at < 1.hour.from_now
  end

  def connected?
    connected && !token_expired?
  end

  def disconnect!
    update(connected: false, access_token: nil, refresh_token: nil)
  end
end
