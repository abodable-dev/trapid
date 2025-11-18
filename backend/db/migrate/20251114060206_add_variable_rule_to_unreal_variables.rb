class AddVariableRuleToUnrealVariables < ActiveRecord::Migration[8.0]
  def change
    add_column :unreal_variables, :variable_rule, :text
  end
end
