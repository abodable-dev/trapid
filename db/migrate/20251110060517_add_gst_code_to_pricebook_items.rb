class AddGstCodeToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :gst_code, :string
  end
end
