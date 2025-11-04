class Construction < ApplicationRecord
  # Associations
  has_many :purchase_orders, dependent: :destroy

  # Validations
  validates :title, presence: true
  validates :status, presence: true

  # Scopes
  scope :active, -> { where(status: 'Active') }
end
