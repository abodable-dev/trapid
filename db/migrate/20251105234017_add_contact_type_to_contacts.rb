class AddContactTypeToContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :contacts, :contact_type, :string, default: 'customer'
    add_index :contacts, :contact_type
  end
end
