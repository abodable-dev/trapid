class RemoveUnusedColumnsFromGoldStandard < ActiveRecord::Migration[8.0]
  def change
    remove_column :gold_standard_items, :category, :string
    remove_column :gold_standard_items, :section, :string
    remove_column :gold_standard_items, :title, :string
    remove_column :gold_standard_items, :component, :string
    remove_column :gold_standard_items, :updated_by, :string
    remove_column :gold_standard_items, :metadata, :jsonb
    remove_column :gold_standard_items, :content, :text
  end
end
