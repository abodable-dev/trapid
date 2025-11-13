class ContactRole < ApplicationRecord
  validates :name, presence: true, uniqueness: { case_sensitive: false }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:name) }

  before_validation :normalize_name

  private

  def normalize_name
    self.name = name.strip if name.present?
  end
end
