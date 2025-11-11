class AddRoleToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :role, :string, default: 'user', null: false
    add_index :users, :role

    # Set existing users to admin role
    reversible do |dir|
      dir.up do
        User.update_all(role: 'admin')
      end
    end
  end
end
