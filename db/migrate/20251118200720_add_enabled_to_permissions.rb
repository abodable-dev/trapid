class AddEnabledToPermissions < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:permissions, :enabled)
      add_column :permissions, :enabled, :boolean, default: true, null: false
    end
  end
end
