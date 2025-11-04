class AddContactFieldsToSuppliers < ActiveRecord::Migration[8.0]
  def change
    add_column :suppliers, :contact_name, :string
    add_column :suppliers, :contact_number, :string
  end
end
