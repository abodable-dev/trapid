class AddLocationToConstructions < ActiveRecord::Migration[8.0]
  def change
    add_column :constructions, :location, :string unless column_exists?(:constructions, :location)
    # latitude and longitude already exist, removed from migration
  end
end
