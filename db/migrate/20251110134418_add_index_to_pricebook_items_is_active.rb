class AddIndexToPricebookItemsIsActive < ActiveRecord::Migration[8.0]
  def change
    add_index :pricebook_items, :is_active, if_not_exists: true
  end
end
