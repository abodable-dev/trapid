class AddImageFieldsToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :image_url, :string
    add_column :pricebook_items, :image_source, :string # 'google', 'cloudinary', 'manual', etc.
    add_column :pricebook_items, :image_fetched_at, :datetime
    add_column :pricebook_items, :image_fetch_status, :string # 'pending', 'fetching', 'success', 'failed'

    add_index :pricebook_items, :image_fetch_status
  end
end
