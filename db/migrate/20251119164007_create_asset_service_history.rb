class CreateAssetServiceHistory < ActiveRecord::Migration[8.0]
  def change
    create_table :asset_service_history do |t|
      t.references :asset, null: false, foreign_key: true, index: true
      t.string :service_type, null: false
      t.date :service_date, null: false
      t.string :service_provider
      t.text :description
      t.decimal :cost, precision: 10, scale: 2
      t.integer :odometer_reading
      t.date :next_service_date
      t.integer :next_service_odometer
      t.text :notes

      t.timestamps
    end

    add_index :asset_service_history, :service_date
    add_index :asset_service_history, :next_service_date
  end
end
