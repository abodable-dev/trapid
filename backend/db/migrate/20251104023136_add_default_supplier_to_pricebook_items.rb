class AddDefaultSupplierToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :default_supplier_id, :bigint
    add_foreign_key :pricebook_items, :suppliers, column: :default_supplier_id
    add_index :pricebook_items, :default_supplier_id
  end
end
