class AddStartCompleteToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :start, :boolean, default: false, null: false
    add_column :schedule_template_rows, :complete, :boolean, default: false, null: false
  end
end
