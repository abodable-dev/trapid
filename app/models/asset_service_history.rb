class AssetServiceHistory < ApplicationRecord
  # Associations
  belongs_to :asset

  # Validations
  validates :service_type, presence: true
  validates :service_date, presence: true

  # Scopes
  scope :recent, -> { order(service_date: :desc) }
  scope :for_asset, ->(asset_id) { where(asset_id: asset_id) }

  # Instance methods
  def service_due?
    return false unless next_service_date
    next_service_date <= Date.today
  end

  def days_until_next_service
    return nil unless next_service_date
    (next_service_date - Date.today).to_i
  end
end
