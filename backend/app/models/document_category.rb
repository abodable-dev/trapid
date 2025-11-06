class DocumentCategory < ApplicationRecord
  # Associations
  has_many :job_documents, dependent: :restrict_with_error

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :display_order, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :ordered, -> { order(:display_order, :name) }

  # Class methods
  def self.default_categories
    [
      { name: "Plans & Drawings", description: "Architectural and engineering plans", display_order: 1, icon: "blueprint" },
      { name: "Contracts", description: "Contract documents and agreements", display_order: 2, icon: "document-text" },
      { name: "Permits & Approvals", description: "Building permits and regulatory approvals", display_order: 3, icon: "clipboard-check" },
      { name: "Specifications", description: "Technical specifications and requirements", display_order: 4, icon: "list-bullet" },
      { name: "Reports", description: "Site reports, inspections, and assessments", display_order: 5, icon: "document-chart-bar" },
      { name: "Photos", description: "Site photos and progress images", display_order: 6, icon: "camera" },
      { name: "Correspondence", description: "Emails, letters, and communications", display_order: 7, icon: "envelope" },
      { name: "Invoices & Receipts", description: "Financial documents", display_order: 8, icon: "receipt" },
      { name: "Safety Documents", description: "Safety plans, SWMS, and risk assessments", display_order: 9, icon: "shield-check" },
      { name: "Other", description: "Miscellaneous documents", display_order: 99, icon: "folder" }
    ]
  end

  def self.seed_defaults
    default_categories.each do |category_attrs|
      find_or_create_by(name: category_attrs[:name]) do |category|
        category.assign_attributes(category_attrs)
      end
    end
  end
end