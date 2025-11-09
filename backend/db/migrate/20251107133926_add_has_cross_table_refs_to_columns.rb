class AddHasCrossTableRefsToColumns < ActiveRecord::Migration[8.0]
  def change
    add_column :columns, :has_cross_table_refs, :boolean, default: false, null: false
    add_index :columns, :has_cross_table_refs
  end
end
