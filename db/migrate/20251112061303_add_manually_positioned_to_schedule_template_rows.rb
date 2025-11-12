class AddManuallyPositionedToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :manually_positioned, :boolean, default: false, null: false
  end
end
