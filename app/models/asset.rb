class Asset < ApplicationRecord
  # Associations
  belongs_to :company
  has_many :insurance_policies, class_name: 'AssetInsurance', dependent: :destroy
  has_many :service_records, class_name: 'AssetServiceHistory', dependent: :destroy
  has_one :current_insurance, -> { where('expiry_date >= ?', Date.today).order(expiry_date: :asc) },
          class_name: 'AssetInsurance'

  # Validations
  validates :description, presence: true
  validates :asset_type, presence: true, inclusion: { in: %w[vehicle equipment property other] }
  validates :status, inclusion: { in: %w[active disposed sold written_off] }
  validates :registration, uniqueness: true, allow_blank: true

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :by_type, ->(type) { where(asset_type: type) }
  scope :needs_attention, -> { where(needs_attention: true) }
  scope :for_company, ->(company_id) { where(company_id: company_id) }

  # Callbacks
  after_save :check_attention_needed

  # Instance methods
  def vehicle?
    asset_type == 'vehicle'
  end

  def expiring_insurance?
    return false unless current_insurance
    current_insurance.expiry_date <= 30.days.from_now
  end

  def service_due?
    return false unless service_records.any?
    last_service = service_records.order(service_date: :desc).first
    return false unless last_service&.next_service_date
    last_service.next_service_date <= 7.days.from_now
  end

  private

  def check_attention_needed
    self.needs_attention = expiring_insurance? || service_due?
    update_column(:needs_attention, needs_attention) if needs_attention_changed?
  end
end
