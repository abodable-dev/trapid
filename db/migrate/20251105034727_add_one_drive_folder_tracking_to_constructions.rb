class AddOneDriveFolderTrackingToConstructions < ActiveRecord::Migration[8.0]
  def change
    add_column :constructions, :onedrive_folders_created_at, :datetime
    add_column :constructions, :onedrive_folder_creation_status, :string, default: 'not_requested'
    add_index :constructions, :onedrive_folder_creation_status
  end
end
