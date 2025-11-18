class CreatePermissions < ActiveRecord::Migration[8.0]
  def change
    unless table_exists?(:permissions)
      create_table :permissions do |t|
        t.string :name, null: false
        t.text :description
        t.string :category
        t.boolean :enabled, default: true, null: false

        t.timestamps
      end

      add_index :permissions, :name, unique: true
      add_index :permissions, :category
    end
  end
end
