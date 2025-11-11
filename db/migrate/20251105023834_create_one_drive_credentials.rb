class CreateOneDriveCredentials < ActiveRecord::Migration[8.0]
  def change
    create_table :one_drive_credentials do |t|
      t.references :construction, null: false, foreign_key: true, index: { unique: true }
      t.text :access_token
      t.text :refresh_token
      t.datetime :token_expires_at
      t.string :drive_id
      t.string :root_folder_id
      t.string :folder_path # Full path to job folder in OneDrive
      t.jsonb :metadata, default: {} # Store additional OneDrive info

      t.timestamps
    end

    add_index :one_drive_credentials, :drive_id
    add_index :one_drive_credentials, :token_expires_at
  end
end
