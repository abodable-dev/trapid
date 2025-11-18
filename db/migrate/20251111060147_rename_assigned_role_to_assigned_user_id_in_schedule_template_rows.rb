class RenameAssignedRoleToAssignedUserIdInScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    # Check if the old column exists before trying to rename it
    if column_exists?(:schedule_template_rows, :assigned_role)
      rename_column :schedule_template_rows, :assigned_role, :assigned_user_id
    end

    # Ensure the target column exists (in case this is a fresh deployment)
    unless column_exists?(:schedule_template_rows, :assigned_user_id)
      add_column :schedule_template_rows, :assigned_user_id, :bigint
      add_index :schedule_template_rows, :assigned_user_id unless index_exists?(:schedule_template_rows, :assigned_user_id)
    end
  end
end
