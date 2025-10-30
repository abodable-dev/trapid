class ImportSession < ApplicationRecord
  validates :session_key, presence: true, uniqueness: true
  validates :file_path, presence: true
  validates :original_filename, presence: true

  # Set expiration to 1 hour from now by default
  before_create :set_expiration
  before_create :generate_session_key

  # Scope to find only valid (non-expired) sessions
  scope :valid, -> { where("expires_at > ?", Time.current) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }

  def expired?
    expires_at <= Time.current
  end

  def file_exists?
    File.exist?(file_path)
  end

  def cleanup_file!
    File.delete(file_path) if file_exists?
    destroy
  end

  # Class method to cleanup expired sessions
  def self.cleanup_expired!
    expired.find_each do |session|
      session.cleanup_file!
    end
  end

  private

  def set_expiration
    self.expires_at ||= 1.hour.from_now
  end

  def generate_session_key
    self.session_key ||= SecureRandom.hex(32)
  end
end
