class ExternalIntegration < ApplicationRecord
  # Validations
  validates :name, presence: true, uniqueness: true
  validates :api_key_digest, presence: true

  # Scopes
  scope :active, -> { where(is_active: true) }

  # Class methods
  def self.find_by_api_key(api_key)
    return nil if api_key.blank?

    digest = Digest::SHA256.hexdigest(api_key)
    find_by(api_key_digest: digest, is_active: true)
  end

  def self.create_with_api_key!(name:, api_key:, description: nil)
    digest = Digest::SHA256.hexdigest(api_key)
    create!(
      name: name,
      api_key_digest: digest,
      description: description,
      is_active: true
    )
  end

  # Instance methods
  def verify_api_key(api_key)
    return false if api_key.blank?

    digest = Digest::SHA256.hexdigest(api_key)
    api_key_digest == digest
  end

  def record_usage!
    update_column(:last_used_at, Time.current)
  end
end
