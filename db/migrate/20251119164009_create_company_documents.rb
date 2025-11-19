class CreateCompanyDocuments < ActiveRecord::Migration[8.0]
  def change
    create_table :company_documents do |t|
      t.references :company, null: false, foreign_key: true
      t.references :user, foreign_key: true  # Who uploaded

      t.string :document_name, null: false
      t.string :document_type  # constitution, minutes, loan_agreement, security_deed, etc.
      t.text :description
      t.string :file_url  # OneDrive link or file path
      t.string :file_name
      t.integer :file_size
      t.string :mime_type
      t.integer :year  # For categorization
      t.string :period  # For categorization (e.g., "Q1 2024")

      t.timestamps
    end

    add_index :company_documents, :document_type
    add_index :company_documents, [:company_id, :document_type]
    add_index :company_documents, :year
  end
end
