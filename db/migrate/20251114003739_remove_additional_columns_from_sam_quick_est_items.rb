class RemoveAdditionalColumnsFromSamQuickEstItems < ActiveRecord::Migration[8.0]
  def change
    remove_column :sam_quick_est_items, :category, :string
    remove_column :sam_quick_est_items, :unit_of_measure, :string
    remove_column :sam_quick_est_items, :current_price, :decimal
    remove_column :sam_quick_est_items, :supplier_id, :bigint
    remove_column :sam_quick_est_items, :is_active, :boolean
    remove_column :sam_quick_est_items, :price_last_updated_at, :datetime
    remove_column :sam_quick_est_items, :image_fetched_at, :datetime
    remove_column :sam_quick_est_items, :image_fetch_status, :string
    remove_column :sam_quick_est_items, :default_supplier_id, :bigint
    remove_column :sam_quick_est_items, :qr_code_url, :string
    remove_column :sam_quick_est_items, :requires_photo, :boolean
    remove_column :sam_quick_est_items, :requires_spec, :boolean
    remove_column :sam_quick_est_items, :spec_url, :string
    remove_column :sam_quick_est_items, :gst_code, :string
    remove_column :sam_quick_est_items, :photo_attached, :boolean
    remove_column :sam_quick_est_items, :spec_attached, :boolean
    remove_column :sam_quick_est_items, :image_file_id, :string
    remove_column :sam_quick_est_items, :spec_file_id, :string
    remove_column :sam_quick_est_items, :qr_code_file_id, :string
    remove_column :sam_quick_est_items, :searchable_text, :tsvector
  end
end
