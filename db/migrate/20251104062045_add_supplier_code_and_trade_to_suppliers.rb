class AddSupplierCodeAndTradeToSuppliers < ActiveRecord::Migration[8.0]
  def change
    add_column :suppliers, :supplier_code, :string
    add_column :suppliers, :trade_categories, :text  # JSON array of trade categories this supplier handles
    add_column :suppliers, :is_default_for_trades, :text  # JSON array of trades where this is the default supplier
    add_column :suppliers, :markup_percentage, :decimal, precision: 5, scale: 2, default: 0.0  # Default markup on prices

    add_index :suppliers, :supplier_code, unique: true
  end
end
