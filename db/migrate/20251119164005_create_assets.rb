class CreateAssets < ActiveRecord::Migration[8.0]
  def change
    create_table :assets do |t|
      t.references :company, null: false, foreign_key: true, index: true
      t.string :description, null: false
      t.string :asset_type, null: false
      t.string :make
      t.string :model
      t.integer :year
      t.string :vin
      t.string :registration
      t.date :purchase_date
      t.decimal :purchase_price, precision: 12, scale: 2
      t.decimal :current_value, precision: 12, scale: 2
      t.decimal :depreciation_rate, precision: 5, scale: 2
      t.string :status, default: 'active'
      t.date :disposal_date
      t.decimal :disposal_value, precision: 12, scale: 2
      t.text :notes
      t.string :photo_url
      t.boolean :needs_attention, default: false

      t.timestamps
    end

    add_index :assets, :asset_type
    add_index :assets, :status
    add_index :assets, :registration, unique: true, where: "registration IS NOT NULL"
    add_index :assets, :needs_attention
  end
end
