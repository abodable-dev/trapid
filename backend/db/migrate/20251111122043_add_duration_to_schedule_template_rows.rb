class AddDurationToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :duration, :integer, default: 0, null: false
    add_column :project_tasks, :duration, :integer, default: 0, null: false
  end
end
