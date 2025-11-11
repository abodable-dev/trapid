class CreateTaskTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :task_templates do |t|
      t.string :name, null: false
      t.string :task_type, null: false # ORDER, DO, GET, CLAIM, CERTIFICATE, PHOTO, FIT
      t.string :category, null: false # ADMIN, CARPENTER, ELECTRICAL, PLUMBER, etc.
      t.integer :default_duration_days, default: 1
      t.integer :sequence_order, default: 0
      t.integer :predecessor_template_codes, array: true, default: []
      t.text :description
      t.boolean :is_milestone, default: false
      t.boolean :requires_photo, default: false
      t.boolean :is_standard, default: true

      t.timestamps
    end

    add_index :task_templates, :task_type
    add_index :task_templates, :category
    add_index :task_templates, :sequence_order
  end
end
