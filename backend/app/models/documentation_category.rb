class DocumentationCategory < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :sequence_order, presence: true

  scope :active, -> { where(is_active: true) }
  scope :ordered, -> { order(:sequence_order) }

  before_validation :set_default_sequence_order, on: :create

  private

  def set_default_sequence_order
    return if sequence_order.present?

    max_order = DocumentationCategory.maximum(:sequence_order) || 0
    self.sequence_order = max_order + 1
  end
end
