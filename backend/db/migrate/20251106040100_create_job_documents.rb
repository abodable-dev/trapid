class CreateJobDocuments < ActiveRecord::Migration[8.0]
  def change
    create_table :job_documents do |t|
      t.references :construction, null: false, foreign_key: true
      t.references :document_category, null: false, foreign_key: true
      t.references :uploaded_by, foreign_key: { to_table: :users }

      t.string :title, null: false
      t.text :description
      t.string :file_name, null: false
      t.string :file_path, null: false
      t.string :file_type
      t.integer :file_size
      t.string :onedrive_file_id
      t.string :onedrive_web_url

      t.string :version, default: "1.0"
      t.boolean :is_latest_version, default: true
      t.references :previous_version, foreign_key: { to_table: :job_documents }

      t.string :status, default: "active"
      t.boolean :requires_approval, default: false
      t.references :approved_by, foreign_key: { to_table: :users }
      t.datetime :approved_at

      t.jsonb :metadata, default: {}
      t.string :tags, array: true, default: []

      t.timestamps
    end

    add_index :job_documents, :construction_id
    add_index :job_documents, :document_category_id
    add_index :job_documents, :onedrive_file_id
    add_index :job_documents, :status
    add_index :job_documents, :is_latest_version
    add_index :job_documents, :tags, using: :gin
    add_index :job_documents, :metadata, using: :gin
  end
end
