class AddPriceLastUpdatedAtToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :price_last_updated_at, :datetime

    # Set initial values based on updated_at for existing records
    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE pricebook_items
          SET price_last_updated_at = updated_at
          WHERE current_price IS NOT NULL
        SQL
      end
    end

    add_index :pricebook_items, :price_last_updated_at
  end
end
