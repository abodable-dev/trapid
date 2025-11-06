class CreateFolderTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :folder_templates do |t|
      t.string :name, null: false
      t.text :description
      t.jsonb :structure, null: false, default: {}
      t.boolean :is_active, default: true
      t.boolean :is_default, default: false

      t.timestamps
    end

    add_index :folder_templates, :name, unique: true
    add_index :folder_templates, :is_active
    add_index :folder_templates, :is_default
    add_index :folder_templates, :structure, using: :gin
  end
end
