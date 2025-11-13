class CreateUnrealVariables < ActiveRecord::Migration[8.0]
  def change
    create_table :unreal_variables do |t|
      t.string :variable_name
      t.decimal :claude_value, precision: 10, scale: 2
      t.boolean :is_active, default: true

      t.timestamps
    end
  end
end
