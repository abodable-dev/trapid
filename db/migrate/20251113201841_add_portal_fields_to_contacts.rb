class AddPortalFieldsToContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :contacts, :portal_enabled, :boolean, default: false
    add_column :contacts, :portal_welcome_sent_at, :datetime
    add_column :contacts, :trapid_rating, :decimal, precision: 3, scale: 2  # Calculated average
    add_column :contacts, :total_ratings_count, :integer, default: 0

    add_index :contacts, :portal_enabled
    add_index :contacts, :trapid_rating
  end
end
