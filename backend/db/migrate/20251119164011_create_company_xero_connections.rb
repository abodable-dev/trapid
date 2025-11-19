class CreateCompanyXeroConnections < ActiveRecord::Migration[8.0]
  def change
    create_table :company_xero_connections do |t|
      t.references :company, null: false, foreign_key: true

      t.string :xero_tenant_id, null: false
      t.string :xero_tenant_name
      t.string :xero_tenant_type  # ORGANISATION, PRACTICEMANAGER

      # OAuth credentials (encrypted)
      t.text :encrypted_access_token
      t.text :encrypted_refresh_token
      t.datetime :token_expires_at

      # Connection status
      t.string :connection_status, default: 'connected'  # connected, disconnected, error
      t.datetime :last_sync_at
      t.text :last_sync_error

      # Settings
      t.string :accounting_method  # cash, accrual
      t.date :financial_year_end

      t.timestamps
    end

    add_index :company_xero_connections, :xero_tenant_id, unique: true
    add_index :company_xero_connections, :connection_status
    add_index :company_xero_connections, :last_sync_at
  end
end
