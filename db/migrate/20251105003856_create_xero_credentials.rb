class CreateXeroCredentials < ActiveRecord::Migration[8.0]
  def change
    create_table :xero_credentials do |t|
      t.string :access_token, null: false
      t.string :refresh_token, null: false
      t.datetime :expires_at, null: false
      t.string :tenant_id, null: false
      t.string :tenant_name
      t.string :tenant_type
      t.timestamps
    end

    add_index :xero_credentials, :tenant_id
  end
end
