class UnrealVariable < ApplicationRecord
  # Scopes
  scope :active, -> { where(is_active: true) }

  # Validations
  validates :variable_name, presence: true

  # Search
  scope :search, ->(query) {
    where('LOWER(variable_name) LIKE ?', "%#{query.downcase}%")
  }
end
