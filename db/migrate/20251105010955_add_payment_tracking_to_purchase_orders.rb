class AddPaymentTrackingToPurchaseOrders < ActiveRecord::Migration[8.0]
  def change
    add_column :purchase_orders, :payment_status, :string, default: 'pending', null: false
    add_column :purchase_orders, :invoiced_amount, :decimal, precision: 15, scale: 2, default: 0.0
    add_column :purchase_orders, :invoice_date, :date
    add_column :purchase_orders, :invoice_reference, :string

    # Add index on payment_status for efficient queries
    add_index :purchase_orders, :payment_status
  end
end
