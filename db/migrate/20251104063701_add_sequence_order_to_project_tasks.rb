class AddSequenceOrderToProjectTasks < ActiveRecord::Migration[8.0]
  def change
    add_column :project_tasks, :sequence_order, :integer
  end
end
