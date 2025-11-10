class CreatePriceBookSystem < ActiveRecord::Migration[8.0]
  def change
    # Suppliers table
    create_table :suppliers do |t|
      t.string :name, null: false
      t.string :contact_person
      t.string :email
      t.string :phone
      t.text :address
      t.integer :rating, default: 0
      t.decimal :response_rate, precision: 5, scale: 2, default: 0
      t.integer :avg_response_time
      t.text :notes
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :suppliers, :name, unique: true
    add_index :suppliers, :is_active

    # Price Book table
    create_table :pricebook_items do |t|
      t.string :item_code, null: false
      t.string :item_name, null: false
      t.string :category
      t.string :unit_of_measure, default: 'Each'
      t.decimal :current_price, precision: 10, scale: 2
      t.references :supplier, foreign_key: true
      t.string :brand
      t.text :notes
      t.boolean :is_active, default: true
      t.boolean :needs_pricing_review, default: false

      t.timestamps
    end

    add_index :pricebook_items, :item_code, unique: true
    add_index :pricebook_items, :category
    add_index :pricebook_items, :needs_pricing_review

    # Add full-text search support
    execute <<-SQL
      ALTER TABLE pricebook_items ADD COLUMN searchable_text tsvector;

      CREATE INDEX idx_pricebook_search ON pricebook_items USING GIN(searchable_text);

      CREATE OR REPLACE FUNCTION pricebook_items_search_trigger() RETURNS trigger AS $$
      begin
        new.searchable_text :=
          setweight(to_tsvector('english', coalesce(new.item_code,'')), 'A') ||
          setweight(to_tsvector('english', coalesce(new.item_name,'')), 'A') ||
          setweight(to_tsvector('english', coalesce(new.category,'')), 'B') ||
          setweight(to_tsvector('english', coalesce(new.brand,'')), 'C') ||
          setweight(to_tsvector('english', coalesce(new.notes,'')), 'D');
        return new;
      end
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
      ON pricebook_items FOR EACH ROW EXECUTE FUNCTION pricebook_items_search_trigger();
    SQL

    # Price History table
    create_table :price_histories do |t|
      t.references :pricebook_item, null: false, foreign_key: true
      t.decimal :old_price, precision: 10, scale: 2
      t.decimal :new_price, precision: 10, scale: 2
      t.string :change_reason
      t.bigint :changed_by_user_id
      t.references :supplier, foreign_key: true
      t.string :quote_reference

      t.timestamps
    end

    add_index :price_histories, :created_at
  end
end
