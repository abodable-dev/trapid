class CreateAssets < ActiveRecord::Migration[8.0]
  def change
    create_table :assets do |t|
      t.references :company, null: false, foreign_key: true

      # Basic Information
      t.string :name, null: false
      t.string :asset_type  # vehicle, equipment, property
      t.string :make
      t.string :model
      t.string :serial_number
      t.string :registration_number  # For vehicles
      t.text :description

      # Purchase Information
      t.date :purchase_date
      t.decimal :purchase_price, precision: 15, scale: 2
      t.string :location

      # Status
      t.string :status, default: 'active'  # active, disposed, under_repair

      # Current Value (calculated from depreciation)
      t.decimal :current_book_value, precision: 15, scale: 2

      # Metadata
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :assets, :company_id
    add_index :assets, :asset_type
    add_index :assets, :status
    add_index :assets, :registration_number, where: "registration_number IS NOT NULL"
  end
end
