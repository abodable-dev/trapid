class CreateAssetServiceHistory < ActiveRecord::Migration[8.0]
  def change
    create_table :asset_service_history do |t|
      t.references :asset, null: false, foreign_key: true
      t.references :user, foreign_key: true  # Who recorded this

      t.date :service_date, null: false
      t.string :service_type  # regular_service, repair, inspection
      t.string :service_provider
      t.text :description
      t.decimal :cost, precision: 10, scale: 2
      t.integer :odometer_reading
      t.integer :hours_reading
      t.integer :next_service_km
      t.integer :next_service_hours
      t.date :next_service_date

      # Document links
      t.string :invoice_url
      t.string :document_url

      t.timestamps
    end

    add_index :asset_service_history, :service_date
    add_index :asset_service_history, [:asset_id, :service_date]
  end
end
