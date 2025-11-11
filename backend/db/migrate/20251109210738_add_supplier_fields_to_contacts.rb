class AddSupplierFieldsToContacts < ActiveRecord::Migration[8.0]
  def change
    # Add supplier-specific fields to contacts table
    # These fields will only be used when contact_types includes 'supplier'

    add_column :contacts, :rating, :integer, default: 0
    add_column :contacts, :response_rate, :decimal, precision: 5, scale: 2, default: 0.0
    add_column :contacts, :avg_response_time, :integer
    add_column :contacts, :notes, :text
    add_column :contacts, :is_active, :boolean, default: true
    add_column :contacts, :supplier_code, :string
    add_column :contacts, :address, :text

    # Add indexes for performance
    add_index :contacts, :supplier_code, unique: true, where: "supplier_code IS NOT NULL"
    add_index :contacts, :is_active
    add_index :contacts, :rating
  end
end
