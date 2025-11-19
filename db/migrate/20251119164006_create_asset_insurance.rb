class CreateAssetInsurance < ActiveRecord::Migration[8.0]
  def change
    create_table :asset_insurance do |t|
      t.references :asset, null: false, foreign_key: true, index: true
      t.string :insurance_company, null: false
      t.string :policy_number, null: false
      t.string :insurance_type
      t.date :start_date, null: false
      t.date :expiry_date, null: false
      t.decimal :premium_amount, precision: 10, scale: 2
      t.string :premium_frequency
      t.decimal :coverage_amount, precision: 12, scale: 2
      t.text :notes

      t.timestamps
    end

    add_index :asset_insurance, :expiry_date
    add_index :asset_insurance, :policy_number
  end
end
