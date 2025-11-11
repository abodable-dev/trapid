class CreateWorkflowSteps < ActiveRecord::Migration[8.0]
  def change
    create_table :workflow_steps do |t|
      t.references :workflow_instance, null: false, foreign_key: true
      t.string :step_name
      t.string :status
      t.references :assigned_to, polymorphic: true, null: false
      t.datetime :started_at
      t.datetime :completed_at
      t.jsonb :data
      t.text :comment

      t.timestamps
    end
  end
end
