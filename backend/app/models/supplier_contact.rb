class SupplierContact < ApplicationRecord
  belongs_to :supplier
  belongs_to :contact

  validates :supplier_id, uniqueness: { scope: :contact_id }
  validates :is_primary, inclusion: { in: [true, false] }

  scope :primary, -> { where(is_primary: true) }
end
