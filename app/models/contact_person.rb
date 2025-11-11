class ContactPerson < ApplicationRecord
  self.table_name = 'contact_persons'

  belongs_to :contact

  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }
  validate :only_one_primary_per_contact, if: :is_primary?

  scope :primary, -> { where(is_primary: true) }
  scope :secondary, -> { where(is_primary: false) }

  def display_name
    [first_name, last_name].compact.join(' ').presence || email || "Contact Person ##{id}"
  end

  private

  def only_one_primary_per_contact
    if contact && contact.contact_persons.where(is_primary: true).where.not(id: id).exists?
      errors.add(:is_primary, 'can only have one primary contact person')
    end
  end
end
