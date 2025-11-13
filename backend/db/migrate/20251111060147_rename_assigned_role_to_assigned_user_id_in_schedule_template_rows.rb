class RenameAssignedRoleToAssignedUserIdInScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    rename_column :schedule_template_rows, :assigned_role, :assigned_user_id
  end
end
