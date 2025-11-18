class AddDependenciesBrokenToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :dependencies_broken, :boolean, default: false, null: false
  end
end
