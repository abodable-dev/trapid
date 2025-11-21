class AddSettingsToColumns < ActiveRecord::Migration[8.0]
  def change
    add_column :columns, :settings, :jsonb
  end
end
