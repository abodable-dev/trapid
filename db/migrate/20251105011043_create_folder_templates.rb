class CreateFolderTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :folder_templates do |t|
      t.string :name, null: false
      t.string :template_type
      t.boolean :is_system_default, default: false, null: false
      t.boolean :is_active, default: true, null: false
      t.references :created_by, foreign_key: { to_table: :users }, null: true

      t.timestamps
    end

    add_index :folder_templates, :name
    add_index :folder_templates, :template_type
    add_index :folder_templates, :is_system_default
    add_index :folder_templates, :is_active
  end
end
