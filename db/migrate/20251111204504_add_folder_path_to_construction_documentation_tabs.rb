class AddFolderPathToConstructionDocumentationTabs < ActiveRecord::Migration[8.0]
  def change
    add_column :construction_documentation_tabs, :folder_path, :string
  end
end
