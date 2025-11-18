class AddIsActiveToUnrealVariables < ActiveRecord::Migration[8.0]
  def change
    add_column :unreal_variables, :is_active, :boolean, default: true
  end
end
