class CreateTables < ActiveRecord::Migration[8.0]
  def change
    create_table :tables do |t|
      t.string :name, null: false
      t.string :singular_name
      t.string :plural_name
      t.string :database_table_name, null: false
      t.string :icon
      t.string :title_column
      t.boolean :searchable, default: true
      t.text :description

      t.timestamps
    end

    add_index :tables, :database_table_name, unique: true
  end
end
