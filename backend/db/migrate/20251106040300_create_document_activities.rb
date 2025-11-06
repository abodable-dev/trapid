class CreateDocumentActivities < ActiveRecord::Migration[8.0]
  def change
    create_table :document_activities do |t|
      t.references :job_document, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.string :action, null: false
      t.text :description
      t.jsonb :changes, default: {}
      t.string :ip_address
      t.string :user_agent

      t.timestamps
    end

    add_index :document_activities, :job_document_id
    add_index :document_activities, :user_id
    add_index :document_activities, :action
    add_index :document_activities, :created_at
    add_index :document_activities, :changes, using: :gin
  end
end
