class AddContactTypeToContactRoles < ActiveRecord::Migration[8.0]
  def change
    add_column :contact_roles, :contact_type, :string, comment: 'customer, supplier, sales, land_agent, or null for shared roles'
    add_index :contact_roles, :contact_type
  end
end
