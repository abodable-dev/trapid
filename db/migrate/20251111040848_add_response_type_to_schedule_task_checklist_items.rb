class AddResponseTypeToScheduleTaskChecklistItems < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_task_checklist_items, :response_type, :string
  end
end
