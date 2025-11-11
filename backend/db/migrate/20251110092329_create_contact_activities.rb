class CreateContactActivities < ActiveRecord::Migration[8.0]
  def change
    create_table :contact_activities do |t|
      t.references :contact, null: false, foreign_key: true
      t.string :activity_type
      t.text :description
      t.jsonb :metadata
      t.references :performed_by, polymorphic: true, null: false
      t.datetime :occurred_at

      t.timestamps
    end
  end
end
