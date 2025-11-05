class CreateOrganizationOneDriveCredential < ActiveRecord::Migration[8.0]
  def change
    create_table :organization_one_drive_credentials do |t|
      t.timestamps
    end
  end
end
