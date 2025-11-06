class CreateDocumentCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :document_categories do |t|
      t.string :name, null: false
      t.text :description
      t.integer :display_order, default: 0
      t.string :icon
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :document_categories, :name, unique: true
    add_index :document_categories, :display_order
    add_index :document_categories, :is_active
  end
end
