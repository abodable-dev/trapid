class AddAssignedUserToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_reference :schedule_template_rows, :assigned_user, foreign_key: { to_table: :users }, null: true
  end
end
