class CreateBankAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :bank_accounts do |t|
      t.references :company, null: false, foreign_key: true, index: true
      t.string :account_name, null: false
      t.string :bank_name, null: false
      t.string :bsb, null: false
      t.string :account_number, null: false
      t.string :account_type
      t.boolean :is_primary, default: false
      t.text :notes

      t.timestamps
    end

    add_index :bank_accounts, [:company_id, :is_primary], unique: true, where: "is_primary = true"
  end
end
