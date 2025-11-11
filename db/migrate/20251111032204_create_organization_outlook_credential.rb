class CreateOrganizationOutlookCredential < ActiveRecord::Migration[8.0]
  def change
    create_table :organization_outlook_credentials do |t|
      t.text :access_token
      t.text :refresh_token
      t.datetime :expires_at
      t.string :email
      t.string :tenant_id

      t.timestamps
    end
  end
end
