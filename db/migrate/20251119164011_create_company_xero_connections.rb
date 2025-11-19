class CreateCompanyXeroConnections < ActiveRecord::Migration[8.0]
  def change
    create_table :company_xero_connections do |t|
      t.references :company, null: false, foreign_key: true, index: { unique: true }
      t.string :tenant_id, null: false
      t.string :tenant_name
      t.text :access_token
      t.text :refresh_token
      t.datetime :token_expires_at
      t.datetime :last_sync_at
      t.boolean :connected, default: true

      t.timestamps
    end

    add_index :company_xero_connections, :tenant_id
    add_index :company_xero_connections, :connected
  end
end
