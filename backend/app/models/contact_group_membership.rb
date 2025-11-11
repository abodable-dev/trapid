class ContactGroupMembership < ApplicationRecord
  belongs_to :contact
  belongs_to :contact_group

  validates :contact_id, uniqueness: { scope: :contact_group_id }
end
