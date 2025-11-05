class AddPurchaseOrdersCountToSuppliers < ActiveRecord::Migration[8.0]
  def change
    add_column :suppliers, :purchase_orders_count, :integer, default: 0, null: false

    # Backfill existing counts
    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE suppliers
          SET purchase_orders_count = (
            SELECT COUNT(*)
            FROM purchase_orders
            WHERE purchase_orders.supplier_id = suppliers.id
          )
        SQL
      end
    end
  end
end
