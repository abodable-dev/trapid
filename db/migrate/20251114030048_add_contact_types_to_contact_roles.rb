class AddContactTypesToContactRoles < ActiveRecord::Migration[8.0]
  def change
    # Add contact_types as an array column (skip if already exists)
    # Empty array = universal/shared role (available for all contact types)
    # Non-empty array = type-specific role (only for specified types)
    unless column_exists?(:contact_roles, :contact_types)
      add_column :contact_roles, :contact_types, :string, array: true, default: [],
                 comment: 'Array of contact types: customer, supplier, sales, land_agent. Empty array = shared/universal role'
    end

    # Add GIN index for efficient array queries (skip if already exists)
    unless index_exists?(:contact_roles, :contact_types)
      add_index :contact_roles, :contact_types, using: 'gin'
    end
  end
end
