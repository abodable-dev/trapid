class AddRoleToContactPersons < ActiveRecord::Migration[8.0]
  def change
    add_column :contact_persons, :role, :string
  end
end
