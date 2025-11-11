class CreateSupervisorChecklistTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :supervisor_checklist_templates do |t|
      t.string :name, null: false
      t.text :description
      t.string :category # Optional category for grouping (e.g., "Safety", "Quality", "Pre-Start")
      t.integer :sequence_order, default: 0
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :supervisor_checklist_templates, :sequence_order
    add_index :supervisor_checklist_templates, :category
    add_index :supervisor_checklist_templates, :name, unique: true
  end
end
