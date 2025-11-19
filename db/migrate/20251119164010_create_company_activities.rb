class CreateCompanyActivities < ActiveRecord::Migration[8.0]
  def change
    create_table :company_activities do |t|
      t.references :company, null: false, foreign_key: true

      t.string :activity_type, null: false  # created, updated, director_added, document_uploaded, etc.
      t.text :description
      t.jsonb :metadata, default: {}  # Store flexible data about the activity

      # Polymorphic performer (who did this action)
      t.string :performed_by_type, null: false
      t.bigint :performed_by_id, null: false

      t.datetime :occurred_at, null: false

      t.timestamps
    end

    add_index :company_activities, [:performed_by_type, :performed_by_id]
    add_index :company_activities, :occurred_at
    add_index :company_activities, [:company_id, :occurred_at]
    add_index :company_activities, :activity_type
  end
end
