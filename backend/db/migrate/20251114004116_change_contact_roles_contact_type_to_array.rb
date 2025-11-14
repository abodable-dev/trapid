class ChangeContactRolesContactTypeToArray < ActiveRecord::Migration[8.0]
  def up
    # Add new column for array of contact types
    add_column :contact_roles, :contact_types, :string, array: true, default: []

    # Migrate existing data from contact_type (singular) to contact_types (array)
    ContactRole.reset_column_information
    ContactRole.find_each do |role|
      if role.contact_type.present?
        role.update_column(:contact_types, [role.contact_type])
      else
        # NULL means shared role - use empty array
        role.update_column(:contact_types, [])
      end
    end

    # Remove old unique index on [name, contact_type]
    remove_index :contact_roles, name: "index_contact_roles_on_name_and_type"

    # Remove old single index on contact_type
    remove_index :contact_roles, name: "index_contact_roles_on_contact_type"

    # Remove old column
    remove_column :contact_roles, :contact_type

    # Add new unique index on just name (since one role can now have multiple types)
    add_index :contact_roles, :name, unique: true

    # Add GIN index for efficient array queries
    add_index :contact_roles, :contact_types, using: 'gin'
  end

  def down
    # Add back old column
    add_column :contact_roles, :contact_type, :string

    # Migrate data back (take first type, or NULL for empty array)
    ContactRole.reset_column_information
    ContactRole.find_each do |role|
      if role.contact_types.present? && role.contact_types.any?
        role.update_column(:contact_type, role.contact_types.first)
      else
        role.update_column(:contact_type, nil)
      end
    end

    # Remove array column indices
    remove_index :contact_roles, :contact_types
    remove_index :contact_roles, :name

    # Remove array column
    remove_column :contact_roles, :contact_types

    # Add back old indices
    add_index :contact_roles, :contact_type
    add_index :contact_roles, [:name, :contact_type], unique: true, name: "index_contact_roles_on_name_and_type"
  end
end
