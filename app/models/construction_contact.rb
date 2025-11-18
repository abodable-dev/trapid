class ConstructionContact < ApplicationRecord
  belongs_to :construction
  belongs_to :contact

  validates :construction_id, presence: true
  validates :contact_id, presence: true
  validates :contact_id, uniqueness: { scope: :construction_id, message: "is already associated with this job" }

  # Ensure only one primary contact per construction
  validates :primary, uniqueness: { scope: :construction_id, message: "contact already exists for this job" }, if: :primary?

  # Scope for primary contact
  scope :primary, -> { where(primary: true) }
end
