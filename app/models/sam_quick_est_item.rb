class SamQuickEstItem < ApplicationRecord
  # Validations
  validates :item_code, presence: true, uniqueness: true
  validates :item_name, presence: true

  # Search
  scope :search, ->(query) {
    where('LOWER(item_name) LIKE ? OR LOWER(item_code) LIKE ?', "%#{query.downcase}%", "%#{query.downcase}%")
  }
end
