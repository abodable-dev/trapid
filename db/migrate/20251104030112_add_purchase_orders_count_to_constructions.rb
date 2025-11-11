class AddPurchaseOrdersCountToConstructions < ActiveRecord::Migration[8.0]
  def change
    add_column :constructions, :purchase_orders_count, :integer, default: 0, null: false
  end
end
