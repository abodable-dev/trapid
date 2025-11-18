class ChangePlanTypeToRequired < ActiveRecord::Migration[8.0]
  def change
    # Only remove if columns exist
    remove_column :schedule_template_rows, :plan_type, :string if column_exists?(:schedule_template_rows, :plan_type)
    remove_column :project_tasks, :plan_type, :string if column_exists?(:project_tasks, :plan_type)

    # Only add if columns don't exist
    add_column :schedule_template_rows, :plan_required, :boolean, default: false, null: false unless column_exists?(:schedule_template_rows, :plan_required)
    add_column :project_tasks, :plan_required, :boolean, default: false, null: false unless column_exists?(:project_tasks, :plan_required)
  end
end
