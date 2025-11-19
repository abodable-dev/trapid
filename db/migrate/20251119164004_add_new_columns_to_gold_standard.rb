class AddNewColumnsToGoldStandard < ActiveRecord::Migration[8.0]
  def change
    # Add missing columns from Gold Standard column types
    add_column :gold_standard_items, :item_code, :string, limit: 255 unless column_exists?(:gold_standard_items, :item_code)
    add_column :gold_standard_items, :start_date, :date unless column_exists?(:gold_standard_items, :start_date)
    add_column :gold_standard_items, :location_coords, :string, limit: 100 unless column_exists?(:gold_standard_items, :location_coords)
    add_column :gold_standard_items, :color_code, :string, limit: 7 unless column_exists?(:gold_standard_items, :color_code)
    add_column :gold_standard_items, :file_attachment, :text unless column_exists?(:gold_standard_items, :file_attachment)
    add_column :gold_standard_items, :notes, :text unless column_exists?(:gold_standard_items, :notes)
  end
end
