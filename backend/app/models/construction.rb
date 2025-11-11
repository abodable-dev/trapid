class Construction < ApplicationRecord
  # Associations
  has_many :purchase_orders, dependent: :destroy
  has_many :schedule_tasks, dependent: :destroy
  has_one :project, dependent: :destroy
  has_one :one_drive_credential, dependent: :destroy
  belongs_to :design, optional: true
  has_many :chat_messages, dependent: :nullify
  has_many :documentation_tabs, dependent: :destroy
  has_many :emails, dependent: :nullify

  # Enums
  enum :onedrive_folder_creation_status, {
    not_requested: 'not_requested',
    pending: 'pending',
    processing: 'processing',
    completed: 'completed',
    failed: 'failed'
  }, prefix: :folders, default: :not_requested

  # Validations
  validates :title, presence: true
  validates :status, presence: true
  validates :site_supervisor_name, presence: true

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

  # Calculate live profit based on contract value minus all PO totals
  def calculate_live_profit
    contract = contract_value || 0
    po_total = purchase_orders.sum(:total) || 0
    contract - po_total
  end

  # Calculate profit percentage
  def calculate_profit_percentage
    return 0 if contract_value.nil? || contract_value.zero?
    ((calculate_live_profit / contract_value) * 100).round(2)
  end

  # Update live_profit and profit_percentage fields in database
  def calculate_and_update_profit!
    update_columns(
      live_profit: calculate_live_profit,
      profit_percentage: calculate_profit_percentage
    )
  end

  # Override getters to always return calculated values
  # This ensures values are always fresh even if DB is stale
  def live_profit
    calculate_live_profit
  end

  def profit_percentage
    calculate_profit_percentage
  end

  # Site supervisor info for prepopulating POs
  def site_supervisor_info
    {
      name: site_supervisor_name,
      email: site_supervisor_email,
      phone: site_supervisor_phone
    }
  end

  # Check if OneDrive folders have not been requested yet
  def folders_not_requested?
    onedrive_folder_creation_status == 'not_requested'
  end

  # Trigger OneDrive folder creation if not already created
  def create_folders_if_needed!(template_id = nil)
    return unless folders_not_requested?

    update!(onedrive_folder_creation_status: 'pending')
    CreateJobFoldersJob.perform_later(id, template_id)
  end
end
