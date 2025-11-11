class AddNewFieldsToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :manual_task, :boolean, default: false, null: false
    add_column :schedule_template_rows, :allow_multiple_instances, :boolean, default: false, null: false
    add_column :schedule_template_rows, :order_required, :boolean, default: false, null: false
    add_column :schedule_template_rows, :call_up_required, :boolean, default: false, null: false
    add_column :schedule_template_rows, :plan_required, :boolean, default: false, null: false

    add_column :project_tasks, :manual_task, :boolean, default: false, null: false
    add_column :project_tasks, :allow_multiple_instances, :boolean, default: false, null: false
    add_column :project_tasks, :order_required, :boolean, default: false, null: false
    add_column :project_tasks, :call_up_required, :boolean, default: false, null: false
    add_column :project_tasks, :plan_required, :boolean, default: false, null: false
  end
end
