class Contact < ApplicationRecord
  # Associations
  has_many :suppliers, dependent: :nullify  # Legacy association
  has_many :supplier_contacts, dependent: :destroy
  has_many :linked_suppliers, through: :supplier_contacts, source: :supplier

  # Enums
  enum :contact_type, {
    customer: 'customer',
    supplier: 'supplier',
    both: 'both'
  }, prefix: :is

  # Validations
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }

  # Scopes
  scope :with_email, -> { where.not(email: [nil, '']) }
  scope :with_phone, -> { where.not(mobile_phone: [nil, '']).or(where.not(office_phone: [nil, ''])) }
  scope :customers, -> { where(contact_type: ['customer', 'both']) }
  scope :suppliers, -> { where(contact_type: ['supplier', 'both']) }

  # Instance methods
  def display_name
    full_name.presence || "#{first_name} #{last_name}".strip.presence || email || "Contact ##{id}"
  end

  def primary_phone
    mobile_phone.presence || office_phone
  end

  def has_contact_info?
    email.present? || mobile_phone.present? || office_phone.present?
  end
end
