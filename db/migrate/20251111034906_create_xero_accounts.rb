class CreateXeroAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :xero_accounts do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.string :account_type
      t.string :tax_type
      t.text :description
      t.boolean :active, default: true
      t.string :account_class
      t.boolean :system_account, default: false
      t.boolean :enable_payments_to_account, default: false
      t.boolean :show_in_expense_claims, default: false

      t.timestamps
    end

    add_index :xero_accounts, :code, unique: true
    add_index :xero_accounts, :active
    add_index :xero_accounts, :account_type
  end
end
