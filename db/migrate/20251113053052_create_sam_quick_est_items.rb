class CreateSamQuickEstItems < ActiveRecord::Migration[8.0]
  def change
    create_table :sam_quick_est_items do |t|
      t.string :item_code, null: false
      t.string :item_name, null: false
      t.string :category
      t.string :unit_of_measure, default: "Each"
      t.decimal :current_price, precision: 10, scale: 2
      t.bigint :supplier_id
      t.string :brand
      t.text :notes
      t.boolean :is_active, default: true
      t.boolean :needs_pricing_review, default: false
      t.datetime :price_last_updated_at
      t.string :image_url
      t.string :image_source
      t.datetime :image_fetched_at
      t.string :image_fetch_status
      t.bigint :default_supplier_id
      t.string :qr_code_url
      t.boolean :requires_photo, default: false
      t.boolean :requires_spec, default: false
      t.string :spec_url
      t.string :gst_code
      t.boolean :photo_attached, default: false
      t.boolean :spec_attached, default: false
      t.string :image_file_id
      t.string :spec_file_id
      t.string :qr_code_file_id

      t.timestamps
    end

    add_index :sam_quick_est_items, :item_code, unique: true
    add_index :sam_quick_est_items, :category
    add_index :sam_quick_est_items, :supplier_id
    add_index :sam_quick_est_items, :default_supplier_id
    add_index :sam_quick_est_items, :is_active
    add_index :sam_quick_est_items, :needs_pricing_review
    add_index :sam_quick_est_items, :price_last_updated_at
    add_index :sam_quick_est_items, :image_fetch_status

    # Add full-text search support
    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE sam_quick_est_items ADD COLUMN searchable_text tsvector;
          CREATE INDEX idx_sam_quick_est_search ON sam_quick_est_items USING gin(searchable_text);

          CREATE OR REPLACE FUNCTION sam_quick_est_items_search_trigger() RETURNS trigger AS $$
          begin
            new.searchable_text :=
              setweight(to_tsvector('english', coalesce(new.item_code, '')), 'A') ||
              setweight(to_tsvector('english', coalesce(new.item_name, '')), 'B') ||
              setweight(to_tsvector('english', coalesce(new.category, '')), 'C') ||
              setweight(to_tsvector('english', coalesce(new.brand, '')), 'C');
            return new;
          end
          $$ LANGUAGE plpgsql;

          CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
          ON sam_quick_est_items FOR EACH ROW EXECUTE FUNCTION sam_quick_est_items_search_trigger();
        SQL
      end

      dir.down do
        execute <<-SQL
          DROP TRIGGER IF EXISTS tsvectorupdate ON sam_quick_est_items;
          DROP FUNCTION IF EXISTS sam_quick_est_items_search_trigger();
          DROP INDEX IF EXISTS idx_sam_quick_est_search;
        SQL
      end
    end

    # Add foreign key constraints
    add_foreign_key :sam_quick_est_items, :contacts, column: :supplier_id
    add_foreign_key :sam_quick_est_items, :contacts, column: :default_supplier_id
  end
end
