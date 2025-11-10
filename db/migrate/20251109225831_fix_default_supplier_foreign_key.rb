class FixDefaultSupplierForeignKey < ActiveRecord::Migration[8.0]
  def change
    # Remove the old foreign key pointing to suppliers table
    remove_foreign_key :pricebook_items, column: :default_supplier_id, if_exists: true

    # Add new foreign key pointing to contacts table
    add_foreign_key :pricebook_items, :contacts, column: :default_supplier_id
  end
end
