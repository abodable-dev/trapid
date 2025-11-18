class DropBibleRulesTable < ActiveRecord::Migration[8.0]
  def change
    drop_table :bible_rules do |t|
      t.integer :chapter_number, null: false
      t.string :chapter_name, null: false
      t.string :rule_number, null: false
      t.string :title, null: false
      t.string :rule_type
      t.text :description
      t.text :code_example
      t.text :cross_references
      t.integer :sort_order
      t.text :search_text
      t.text :related_docs

      t.timestamps
    end
  end
end
