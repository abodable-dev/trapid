class AddFileDataToImportSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :import_sessions, :file_data, :text
  end
end
