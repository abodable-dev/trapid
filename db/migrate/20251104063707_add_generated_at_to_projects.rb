class AddGeneratedAtToProjects < ActiveRecord::Migration[8.0]
  def change
    add_column :projects, :generated_at, :datetime
  end
end
