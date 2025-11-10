class AddSpecUrlToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :spec_url, :string
  end
end
