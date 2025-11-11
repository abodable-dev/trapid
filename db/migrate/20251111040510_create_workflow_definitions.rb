class CreateWorkflowDefinitions < ActiveRecord::Migration[8.0]
  def change
    create_table :workflow_definitions do |t|
      t.string :name
      t.text :description
      t.string :workflow_type
      t.jsonb :config
      t.boolean :active

      t.timestamps
    end
  end
end
