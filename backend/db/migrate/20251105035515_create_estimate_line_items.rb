class CreateEstimateLineItems < ActiveRecord::Migration[8.0]
  def change
    create_table :estimate_line_items do |t|
      t.references :estimate, null: false, foreign_key: true
      t.string :category
      t.string :item_description, null: false
      t.decimal :quantity, precision: 15, scale: 3, default: 1.0
      t.string :unit, default: 'ea'
      t.text :notes

      t.timestamps
    end

    add_index :estimate_line_items, :category
  end
end
