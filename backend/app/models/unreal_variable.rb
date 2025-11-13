class UnrealVariable < ApplicationRecord
  validates :variable_name, presence: true, uniqueness: true

  # Search scope
  scope :search, ->(query) {
    where("variable_name ILIKE ?", "%#{query}%")
  }
end
