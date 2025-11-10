class AddRequiredOnSiteDateToProjectTasks < ActiveRecord::Migration[8.0]
  def change
    add_column :project_tasks, :required_on_site_date, :date
  end
end
