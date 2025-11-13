class AddResponseTypeToProjectTaskChecklistItems < ActiveRecord::Migration[8.0]
  def change
    add_column :project_task_checklist_items, :response_type, :string
  end
end
