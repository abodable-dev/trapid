class AddPortalFieldsToPurchaseOrders < ActiveRecord::Migration[8.0]
  def change
    add_column :purchase_orders, :visible_to_supplier, :boolean, default: false
    add_column :purchase_orders, :payment_schedule, :jsonb  # Array of payment milestones

    add_index :purchase_orders, :visible_to_supplier
  end
end
