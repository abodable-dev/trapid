class CreateAssetInsurance < ActiveRecord::Migration[8.0]
  def change
    create_table :asset_insurance do |t|
      t.references :asset, null: false, foreign_key: true

      t.string :policy_number
      t.string :insurer_name
      t.string :broker_name
      t.string :broker_contact_name
      t.string :broker_email
      t.string :broker_phone

      t.date :start_date
      t.date :renewal_date
      t.string :payment_frequency  # monthly, annual
      t.decimal :premium_amount, precision: 10, scale: 2
      t.decimal :coverage_amount, precision: 15, scale: 2
      t.decimal :excess_amount, precision: 10, scale: 2

      t.string :status, default: 'active'  # active, expired

      t.timestamps
    end

    add_index :asset_insurance, :renewal_date
    add_index :asset_insurance, :status
  end
end
