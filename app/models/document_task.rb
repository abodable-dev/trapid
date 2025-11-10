class DocumentTask < ApplicationRecord
  belongs_to :construction
  has_one_attached :document

  validates :name, presence: true
  validates :category, presence: true
  validates :construction_id, presence: true

  scope :for_category, ->(category) { where(category: category) }
  scope :required, -> { where(required: true) }
  scope :with_documents, -> { where(has_document: true) }
  scope :validated, -> { where(is_validated: true) }
end
