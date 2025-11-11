class ChangePlanTypeToRequired < ActiveRecord::Migration[8.0]
  def change
    remove_column :schedule_template_rows, :plan_type, :string
    remove_column :project_tasks, :plan_type, :string

    add_column :schedule_template_rows, :plan_required, :boolean, default: false, null: false
    add_column :project_tasks, :plan_required, :boolean, default: false, null: false
  end
end
