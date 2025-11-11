class Design < ApplicationRecord
  # Associations
  has_many :constructions, dependent: :nullify

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :size, numericality: { greater_than: 0, allow_nil: true }
  validates :frontage_required, numericality: { greater_than: 0, allow_nil: true }

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :by_name, -> { order(:name) }
  scope :by_size, -> { order(:size) }

  # Before callbacks
  before_destroy :check_constructions

  private

  def check_constructions
    if constructions.any?
      errors.add(:base, "Cannot delete design that is assigned to constructions")
      throw :abort
    end
  end
end
