class AddProgressToImportSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :import_sessions, :status, :string, default: 'pending'
    add_column :import_sessions, :progress, :decimal, default: 0.0, precision: 5, scale: 2
    add_column :import_sessions, :total_rows, :integer, default: 0
    add_column :import_sessions, :processed_rows, :integer, default: 0
    add_column :import_sessions, :completed_at, :datetime
    add_column :import_sessions, :error_message, :text
    add_column :import_sessions, :result, :json
    add_column :import_sessions, :table_id, :integer

    add_index :import_sessions, :status
    add_index :import_sessions, :table_id
  end
end
