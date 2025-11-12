class AddCoordinatesToJobs < ActiveRecord::Migration[8.0]
  def change
    add_column :constructions, :latitude, :decimal, precision: 10, scale: 6
    add_column :constructions, :longitude, :decimal, precision: 10, scale: 6
  end
end
