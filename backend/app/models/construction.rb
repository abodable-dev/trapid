class Construction < ApplicationRecord
  validates :title, presence: true
  validates :status, presence: true

  scope :active, -> { where(status: 'Active') }
end
