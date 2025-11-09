class AddQrCodeUrlToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :qr_code_url, :string
  end
end
