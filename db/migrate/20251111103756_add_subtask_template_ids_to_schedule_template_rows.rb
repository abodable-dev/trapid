class AddSubtaskTemplateIdsToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :subtask_template_ids, :jsonb, default: [], null: false
    add_column :project_tasks, :subtask_template_ids, :jsonb, default: [], null: false
  end
end
