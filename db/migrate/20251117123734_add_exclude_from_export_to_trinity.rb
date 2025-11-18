class AddExcludeFromExportToTrinity < ActiveRecord::Migration[8.0]
  def change
    add_column :trinity, :exclude_from_export, :boolean, default: false, null: false
    add_index :trinity, :exclude_from_export
  end
end
