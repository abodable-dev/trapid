class UpdateContactRolesUniqueIndex < ActiveRecord::Migration[8.0]
  def change
    # Remove the old unique index on name only
    remove_index :contact_roles, :name, unique: true

    # Add a new composite unique index on [name, contact_type]
    # This allows the same role name for different contact types
    add_index :contact_roles, [:name, :contact_type], unique: true, name: 'index_contact_roles_on_name_and_type'
  end
end
