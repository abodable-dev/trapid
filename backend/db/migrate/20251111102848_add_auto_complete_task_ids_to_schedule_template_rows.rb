class AddAutoCompleteTaskIdsToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :auto_complete_task_ids, :jsonb, default: [], null: false
    add_column :project_tasks, :auto_complete_task_ids, :jsonb, default: [], null: false
  end
end
