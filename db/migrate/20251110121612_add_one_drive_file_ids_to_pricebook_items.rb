class AddOneDriveFileIdsToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :image_file_id, :string
    add_column :pricebook_items, :spec_file_id, :string
    add_column :pricebook_items, :qr_code_file_id, :string
  end
end
