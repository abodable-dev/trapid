class ScheduleTemplateRowAudit < ApplicationRecord
  belongs_to :schedule_template_row
  belongs_to :user

  validates :field_name, presence: true, inclusion: { in: %w[confirm supplier_confirm start complete] }
  validates :changed_at, presence: true

  # Scopes for querying
  scope :for_row, ->(row_id) { where(schedule_template_row_id: row_id) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :for_field, ->(field) { where(field_name: field) }
  scope :recent, -> { order(changed_at: :desc) }
end
