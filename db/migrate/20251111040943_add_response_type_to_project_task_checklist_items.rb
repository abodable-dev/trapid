class AddResponseTypeToProjectTaskChecklistItems < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:project_task_checklist_items, :response_type)
      add_column :project_task_checklist_items, :response_type, :string, default: 'checkbox'
    end
    unless column_exists?(:project_task_checklist_items, :response_note)
      add_column :project_task_checklist_items, :response_note, :text
    end
    unless column_exists?(:project_task_checklist_items, :response_photo_url)
      add_column :project_task_checklist_items, :response_photo_url, :string
    end
  end
end
