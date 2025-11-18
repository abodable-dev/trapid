class CreateGoldStandardItems < ActiveRecord::Migration[8.0]
  def change
    create_table :gold_standard_items do |t|
      t.string :category
      t.string :section
      t.string :email
      t.string :phone
      t.boolean :is_active
      t.decimal :discount
      t.decimal :price
      t.integer :quantity
      t.text :content
      t.string :component
      t.string :status
      t.string :updated_by
      t.jsonb :metadata

      t.timestamps
    end
  end
end
