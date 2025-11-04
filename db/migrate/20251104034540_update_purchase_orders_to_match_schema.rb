class UpdatePurchaseOrdersToMatchSchema < ActiveRecord::Migration[8.0]
  def change
    # Rename columns to match exact schema
    rename_column :purchase_orders, :po_number, :purchase_order_number
    rename_column :purchase_orders, :tax_amount, :tax
    rename_column :purchase_orders, :total_amount, :total
    rename_column :purchase_orders, :budget_allocation, :budget

    # Add new financial tracking fields
    add_column :purchase_orders, :amount_still_to_be_invoiced, :decimal, precision: 15, scale: 2, default: 0.0
    add_column :purchase_orders, :total_with_allowance, :decimal, precision: 15, scale: 2, default: 0.0

    # Add task and estimation fields
    add_column :purchase_orders, :ted_task, :text
    add_column :purchase_orders, :estimation_check, :boolean, default: false
    add_column :purchase_orders, :part_payment, :boolean, default: false

    # Add comprehensive Xero integration fields
    add_column :purchase_orders, :xero_supplier, :string
    add_column :purchase_orders, :xero_complete, :boolean, default: false
    add_column :purchase_orders, :xero_still_to_be_paid, :decimal, precision: 15, scale: 2, default: 0.0
    add_column :purchase_orders, :xero_budget_diff, :decimal, precision: 15, scale: 2, default: 0.0
    add_column :purchase_orders, :xero_paid_date, :date
    add_column :purchase_orders, :xero_total_with_allowance, :decimal, precision: 15, scale: 2, default: 0.0
    add_column :purchase_orders, :xero_amount_paid_exc_gst, :decimal, precision: 15, scale: 2, default: 0.0
    add_column :purchase_orders, :total_allowance_xero_paid, :decimal, precision: 15, scale: 2, default: 0.0

    # Add calculated/variance fields
    add_column :purchase_orders, :diff_po_with_allowance_versus_budget, :decimal, precision: 15, scale: 2, default: 0.0
    add_column :purchase_orders, :diff_xero_and_total_but_not_complete, :decimal, precision: 15, scale: 2, default: 0.0
  end
end
