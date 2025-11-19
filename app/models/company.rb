class Company < ApplicationRecord
  # Associations
  has_many :company_directors, dependent: :destroy
  has_many :directors, through: :company_directors, source: :contact
  has_many :current_directors, -> { where(company_directors: { is_current: true }) },
           through: :company_directors, source: :contact
  has_many :bank_accounts, dependent: :destroy
  has_many :assets, dependent: :destroy
  has_many :compliance_items, class_name: 'CompanyComplianceItem', dependent: :destroy
  has_many :documents, class_name: 'CompanyDocument', dependent: :destroy
  has_many :activities, class_name: 'CompanyActivity', dependent: :destroy
  has_one :xero_connection, class_name: 'CompanyXeroConnection', dependent: :destroy

  # Encryptions
  encrypts :tfn, deterministic: true
  encrypts :asic_password
  encrypts :asic_recovery_answer

  # Validations
  validates :name, presence: true
  validates :company_group, inclusion: { in: %w[tekna team_harder promise charity other], allow_nil: true }
  validates :status, inclusion: { in: %w[active struck_off in_liquidation dormant] }
  validates :acn, format: { with: /\A\d{9}\z/, message: "must be 9 digits" }, allow_blank: true, uniqueness: true
  validates :abn, format: { with: /\A\d{11}\z/, message: "must be 11 digits" }, allow_blank: true, uniqueness: true
  validates :tfn, format: { with: /\A\d{9}\z/, message: "must be 9 digits" }, allow_blank: true

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :by_group, ->(group) { where(company_group: group) }
  scope :with_directors, -> { includes(:current_directors) }

  # Callbacks
  after_create :create_initial_activity
  after_update :create_update_activity

  # Instance methods
  def formatted_acn
    return nil unless acn
    acn.gsub(/(\d{3})(\d{3})(\d{3})/, '\1 \2 \3')
  end

  def formatted_abn
    return nil unless abn
    abn.gsub(/(\d{2})(\d{3})(\d{3})(\d{3})/, '\1 \2 \3 \4')
  end

  def has_xero_connection
    xero_connection&.connected?
  end

  private

  def create_initial_activity
    activities.create(
      activity_type: 'created',
      description: "Company #{name} was created"
    )
  end

  def create_update_activity
    return unless saved_changes.any?

    activities.create(
      activity_type: 'updated',
      description: "Company #{name} was updated",
      changes: saved_changes
    )
  end
end
