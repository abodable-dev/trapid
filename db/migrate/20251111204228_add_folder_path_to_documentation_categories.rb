class AddFolderPathToDocumentationCategories < ActiveRecord::Migration[8.0]
  def change
    add_column :documentation_categories, :folder_path, :string
  end
end
