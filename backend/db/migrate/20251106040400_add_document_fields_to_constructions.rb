class AddDocumentFieldsToConstructions < ActiveRecord::Migration[8.0]
  def change
    add_column :constructions, :site_address, :text
    add_column :constructions, :job_type, :string
    add_column :constructions, :onedrive_folder_id, :string
    add_column :constructions, :onedrive_folder_url, :string
    add_column :constructions, :document_count, :integer, default: 0

    add_index :constructions, :job_type
    add_index :constructions, :onedrive_folder_id
  end
end
