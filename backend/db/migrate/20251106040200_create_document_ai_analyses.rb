class CreateDocumentAiAnalyses < ActiveRecord::Migration[8.0]
  def change
    create_table :document_ai_analyses do |t|
      t.references :job_document, null: false, foreign_key: true
      t.references :construction, null: false, foreign_key: true

      t.string :analysis_type, null: false
      t.string :status, default: "pending"

      t.jsonb :extracted_data, default: {}
      t.jsonb :discrepancies, default: []
      t.jsonb :suggestions, default: []
      t.text :summary
      t.decimal :confidence_score, precision: 5, scale: 2

      t.text :error_message
      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end

    add_index :document_ai_analyses, :job_document_id
    add_index :document_ai_analyses, :construction_id
    add_index :document_ai_analyses, :analysis_type
    add_index :document_ai_analyses, :status
    add_index :document_ai_analyses, :extracted_data, using: :gin
    add_index :document_ai_analyses, :discrepancies, using: :gin
  end
end
