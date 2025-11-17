class CreateInspiringQuotes < ActiveRecord::Migration[8.0]
  def change
    create_table :inspiring_quotes do |t|
      t.text :quote, null: false
      t.string :author
      t.string :category
      t.boolean :is_active, default: true, null: false
      t.integer :display_order, default: 0

      t.timestamps
    end

    add_index :inspiring_quotes, :is_active
    add_index :inspiring_quotes, :display_order
  end
end
