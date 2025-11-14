class RemoveUnusedColumnsFromSamQuickEstItems < ActiveRecord::Migration[8.0]
  def change
    remove_column :sam_quick_est_items, :brand, :string
    remove_column :sam_quick_est_items, :notes, :text
    remove_column :sam_quick_est_items, :needs_pricing_review, :boolean
    remove_column :sam_quick_est_items, :image_url, :string
    remove_column :sam_quick_est_items, :image_source, :string
  end
end
