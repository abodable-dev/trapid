class AddUserTrackingToTrinity < ActiveRecord::Migration[8.0]
  def change
    add_column :trinity, :created_by, :string
    add_column :trinity, :updated_by, :string
  end
end
