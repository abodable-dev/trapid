class AddAssignedUserToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :assigned_role, :string, null: true
  end
end
