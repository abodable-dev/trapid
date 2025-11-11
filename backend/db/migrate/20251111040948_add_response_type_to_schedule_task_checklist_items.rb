class AddResponseTypeToScheduleTaskChecklistItems < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:schedule_task_checklist_items, :response_type)
      add_column :schedule_task_checklist_items, :response_type, :string, default: 'checkbox'
    end
    unless column_exists?(:schedule_task_checklist_items, :response_note)
      add_column :schedule_task_checklist_items, :response_note, :text
    end
    unless column_exists?(:schedule_task_checklist_items, :response_photo_url)
      add_column :schedule_task_checklist_items, :response_photo_url, :string
    end
  end
end
