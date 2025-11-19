class AddNewColumnsToGoldStandard < ActiveRecord::Migration[8.0]
  def change
    add_column :gold_standard_items, :start_date, :date
    add_column :gold_standard_items, :location_coords, :string
    add_column :gold_standard_items, :file_attachment, :text
    add_column :gold_standard_items, :color_code, :string
  end
end
