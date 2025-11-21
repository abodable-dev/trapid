class CreateCompanyXeroAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :company_xero_accounts do |t|
      t.references :company_xero_connection, null: false, foreign_key: true
      t.string :xero_account_id, null: false
      t.string :account_code
      t.string :account_name
      t.string :account_type
      t.string :tax_type
      t.string :description
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :company_xero_accounts, :company_xero_connection_id, name: 'index_xero_accounts_on_connection_id'
    add_index :company_xero_accounts, :xero_account_id
    add_index :company_xero_accounts, :account_code
    add_index :company_xero_accounts, :is_active
  end
end
