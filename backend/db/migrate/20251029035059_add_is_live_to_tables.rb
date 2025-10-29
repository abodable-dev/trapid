class AddIsLiveToTables < ActiveRecord::Migration[8.0]
  def change
    add_column :tables, :is_live, :boolean, default: false, null: false
  end
end
