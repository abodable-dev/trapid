class CreateUnrealVariables < ActiveRecord::Migration[8.0]
  def change
    create_table :unreal_variables do |t|
      t.string :variable_name, null: false
      t.decimal :claude_value, precision: 10, scale: 2, default: 0

      t.timestamps
    end

    add_index :unreal_variables, :variable_name, unique: true
  end
end
