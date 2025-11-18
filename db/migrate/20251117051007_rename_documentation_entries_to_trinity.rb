class RenameDocumentationEntriesToTrinity < ActiveRecord::Migration[8.0]
  def change
    rename_table :documentation_entries, :trinity
  end
end
