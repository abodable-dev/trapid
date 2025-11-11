class SupervisorChecklistTemplate < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :sequence_order, presence: true

  scope :active, -> { where(is_active: true) }
  scope :ordered, -> { order(:sequence_order) }
  scope :by_category, ->(category) { where(category: category) }

  before_validation :set_default_sequence_order, on: :create

  # Helper to get all unique categories
  def self.categories
    where.not(category: nil).distinct.pluck(:category).sort
  end

  private

  def set_default_sequence_order
    return if sequence_order.present?

    max_order = SupervisorChecklistTemplate.maximum(:sequence_order) || 0
    self.sequence_order = max_order + 1
  end
end
