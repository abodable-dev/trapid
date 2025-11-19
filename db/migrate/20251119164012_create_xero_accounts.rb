class CreateXeroAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :xero_accounts do |t|
      t.references :company_xero_connection, null: false, foreign_key: true

      t.string :xero_account_id, null: false
      t.string :account_code
      t.string :account_name, null: false
      t.string :account_type  # REVENUE, EXPENSE, ASSET, LIABILITY, EQUITY
      t.string :account_class  # REVENUE, EXPENSE, ASSET, LIABILITY, EQUITY
      t.string :tax_type
      t.text :description
      t.boolean :enable_payments_to_account, default: false
      t.boolean :show_in_expense_claims, default: false
      t.string :status  # ACTIVE, ARCHIVED, DELETED
      t.decimal :reporting_code_value, precision: 15, scale: 2

      # Mapping for consolidation (Phase 2)
      t.string :consolidated_account_code
      t.string :consolidated_account_name

      t.timestamps
    end

    add_index :xero_accounts, :xero_account_id, unique: true
    add_index :xero_accounts, :account_code
    add_index :xero_accounts, :account_type
    add_index :xero_accounts, :status
    add_index :xero_accounts, [:company_xero_connection_id, :status]
  end
end
