class CreateXeroTaxRates < ActiveRecord::Migration[8.0]
  def change
    create_table :xero_tax_rates do |t|
      t.string :code
      t.string :name
      t.decimal :rate
      t.boolean :active
      t.string :display_rate
      t.string :tax_type

      t.timestamps
    end
  end
end
