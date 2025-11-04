class CreatePurchaseOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :purchase_orders do |t|
      t.string :po_number, null: false, index: { unique: true }
      t.references :construction, null: false, foreign_key: true
      t.references :supplier, foreign_key: true
      t.string :status, null: false, default: 'draft'
      t.text :description
      t.text :delivery_address
      t.text :special_instructions

      # Financial fields
      t.decimal :sub_total, precision: 15, scale: 2, default: 0.0
      t.decimal :tax_amount, precision: 15, scale: 2, default: 0.0
      t.decimal :total_amount, precision: 15, scale: 2, default: 0.0
      t.decimal :budget_allocation, precision: 15, scale: 2
      t.decimal :amount_invoiced, precision: 15, scale: 2, default: 0.0
      t.decimal :amount_paid, precision: 15, scale: 2, default: 0.0

      # Xero integration fields
      t.string :xero_invoice_id
      t.decimal :xero_amount_paid, precision: 15, scale: 2, default: 0.0

      # Date tracking
      t.date :required_date
      t.date :ordered_date
      t.date :expected_delivery_date
      t.date :received_date

      # Approval tracking
      t.integer :created_by_id
      t.integer :approved_by_id
      t.datetime :approved_at

      t.timestamps
    end

    add_index :purchase_orders, :status
    add_index :purchase_orders, :required_date
  end
end
