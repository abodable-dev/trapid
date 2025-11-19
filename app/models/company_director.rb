class CompanyDirector < ApplicationRecord
  # Associations
  belongs_to :company
  belongs_to :contact

  # Validations
  validates :company_id, uniqueness: { scope: :contact_id, conditions: -> { where(is_current: true) },
                                       message: "already has this director" }
  validates :position, presence: true
  validates :appointment_date, presence: true

  # Scopes
  scope :current, -> { where(is_current: true) }
  scope :historical, -> { where(is_current: false) }

  # Callbacks
  after_create :mark_contact_as_director

  private

  def mark_contact_as_director
    contact.update(is_director: true) unless contact.is_director?
  end
end
