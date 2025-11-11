class AddEstimateIdToPurchaseOrders < ActiveRecord::Migration[8.0]
  def change
    add_reference :purchase_orders, :estimate, null: true, foreign_key: true
  end
end
