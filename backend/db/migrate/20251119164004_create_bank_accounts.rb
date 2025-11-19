class CreateBankAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :bank_accounts do |t|
      t.references :company, null: false, foreign_key: true

      t.string :institution_name  # Bank name
      t.string :bsb
      t.string :account_number
      t.string :account_name
      t.text :description
      t.date :date_opened
      t.date :date_closed
      t.string :status, default: 'active'  # active, closed

      t.timestamps
    end

    add_index :bank_accounts, :status
    add_index :bank_accounts, [:company_id, :status]
  end
end
