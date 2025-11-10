class AddXeroSyncFieldsToContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :contacts, :last_synced_at, :datetime
    add_column :contacts, :xero_sync_error, :text
  end
end
