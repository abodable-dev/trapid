class ContactRole < ApplicationRecord
  CONTACT_TYPES = %w[customer supplier sales land_agent].freeze

  validates :name, presence: true, uniqueness: { scope: :contact_type, case_sensitive: false }
  validates :contact_type, inclusion: { in: CONTACT_TYPES }, allow_nil: true

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:name) }
  scope :for_type, ->(type) { where(contact_type: [type, nil]) } # Returns roles for specific type + shared roles
  scope :shared, -> { where(contact_type: nil) }
  scope :type_specific, -> { where.not(contact_type: nil) }

  before_validation :normalize_name

  def shared?
    contact_type.nil?
  end

  def type_label
    return 'All Types' if shared?
    contact_type.titleize
  end

  private

  def normalize_name
    self.name = name.strip if name.present?
  end
end
