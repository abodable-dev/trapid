class CreateCompanyDocuments < ActiveRecord::Migration[8.0]
  def change
    create_table :company_documents do |t|
      t.references :company, null: false, foreign_key: true, index: true
      t.string :title, null: false
      t.text :description
      t.string :document_type, null: false
      t.date :document_date
      t.string :file_url
      t.string :file_name
      t.integer :file_size
      t.datetime :uploaded_at

      t.timestamps
    end

    add_index :company_documents, :document_type
    add_index :company_documents, :document_date
  end
end
