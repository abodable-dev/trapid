class AddMissingColumnsToGoldStandardItems < ActiveRecord::Migration[8.0]
  def change
    add_column :gold_standard_items, :mobile, :string
    add_column :gold_standard_items, :title, :string
    add_column :gold_standard_items, :category_type, :string
  end
end
