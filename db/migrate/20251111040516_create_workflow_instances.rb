class CreateWorkflowInstances < ActiveRecord::Migration[8.0]
  def change
    create_table :workflow_instances do |t|
      t.references :workflow_definition, null: false, foreign_key: true
      t.references :subject, polymorphic: true, null: false
      t.string :status
      t.string :current_step
      t.datetime :started_at
      t.datetime :completed_at
      t.jsonb :metadata

      t.timestamps
    end
  end
end
