class AddDesignToConstructions < ActiveRecord::Migration[8.0]
  def change
    add_reference :constructions, :design, foreign_key: true, index: true
    add_column :constructions, :design_name, :string

    add_index :constructions, :design_name
  end
end
