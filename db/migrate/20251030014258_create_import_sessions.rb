class CreateImportSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :import_sessions do |t|
      t.string :session_key
      t.string :file_path
      t.string :original_filename
      t.integer :file_size
      t.datetime :expires_at

      t.timestamps
    end
    add_index :import_sessions, :session_key, unique: true
  end
end
