class AddStartDateToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :start_date, :integer, default: 0, null: false
  end
end
