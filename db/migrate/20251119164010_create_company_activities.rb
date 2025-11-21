class CreateCompanyActivities < ActiveRecord::Migration[8.0]
  def change
    create_table :company_activities do |t|
      t.references :company, null: false, foreign_key: true, index: true
      t.references :user, null: true, foreign_key: true, index: true
      t.string :activity_type, null: false
      t.text :description
      t.jsonb :changes, default: {}
      t.string :related_type
      t.bigint :related_id

      t.timestamps
    end

    add_index :company_activities, :activity_type
    add_index :company_activities, [:related_type, :related_id]
    add_index :company_activities, :created_at
  end
end
