class AddLocationToConstructions < ActiveRecord::Migration[8.0]
  def change
    add_column :constructions, :location, :string
    # latitude and longitude already exist, removed from migration
  end
end
