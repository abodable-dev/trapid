class AddRemainingColumnsToGoldStandardItems < ActiveRecord::Migration[8.0]
  def change
    add_column :gold_standard_items, :item_code, :string
    add_column :gold_standard_items, :notes, :text
    add_column :gold_standard_items, :start_date, :date
    add_column :gold_standard_items, :location_coords, :string
    add_column :gold_standard_items, :color_code, :string
    add_column :gold_standard_items, :file_attachment, :text
    add_column :gold_standard_items, :user_id, :integer
    add_column :gold_standard_items, :multiple_category_ids, :text
  end
end
