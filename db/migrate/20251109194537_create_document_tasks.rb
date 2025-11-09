class CreateDocumentTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :document_tasks do |t|
      t.references :construction, null: false, foreign_key: true
      t.string :category
      t.string :name
      t.text :description
      t.boolean :required
      t.boolean :has_document
      t.boolean :is_validated
      t.datetime :uploaded_at
      t.string :uploaded_by
      t.datetime :validated_at
      t.string :validated_by

      t.timestamps
    end
  end
end
