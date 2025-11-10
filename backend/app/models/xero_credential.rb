class XeroCredential < ApplicationRecord
  # Encrypt sensitive OAuth tokens
  encrypts :access_token
  encrypts :refresh_token

  validates :access_token, :refresh_token, :expires_at, :tenant_id, presence: true

  # Get the current (latest) active credential
  def self.current
    order(created_at: :desc).first
  end

  # Check if the access token is expired or about to expire (within 5 minutes)
  def expired?
    expires_at <= 5.minutes.from_now
  end

  # Check if Xero is currently connected
  def self.connected?
    current.present?
  end
end
