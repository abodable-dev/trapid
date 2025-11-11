class ConstructionDocumentationTab < ApplicationRecord
  belongs_to :construction

  validates :name, presence: true, uniqueness: { scope: :construction_id }
  validates :sequence_order, presence: true

  scope :active, -> { where(is_active: true) }
  scope :ordered, -> { order(:sequence_order) }
end
