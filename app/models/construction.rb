class Construction < ApplicationRecord
  # Associations
  has_many :purchase_orders, dependent: :destroy
  has_one :project, dependent: :destroy

  # Validations
  validates :title, presence: true
  validates :status, presence: true

  # Scopes
  scope :active, -> { where(status: 'Active') }

  # Methods
  def create_project!(project_manager:, name: nil)
    create_project(
      name: name || "#{title} - Master Schedule",
      project_code: "PROJ-#{id}",
      project_manager: project_manager,
      status: 'planning',
      start_date: Date.current
    )
  end

  def schedule_ready?
    purchase_orders.for_schedule.any?
  end
end
