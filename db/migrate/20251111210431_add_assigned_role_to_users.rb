class AddAssignedRoleToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :assigned_role, :string
  end
end
