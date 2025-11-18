class CreateWorkflowDefinitions < ActiveRecord::Migration[8.0]
  def change
    create_table :workflow_definitions do |t|
      t.string :name, null: false
      t.text :description
      t.string :workflow_type, null: false
      t.jsonb :config, default: {}, null: false
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :workflow_definitions, :workflow_type
    add_index :workflow_definitions, :active
  end
end
