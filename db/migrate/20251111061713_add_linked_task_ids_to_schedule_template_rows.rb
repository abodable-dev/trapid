class AddLinkedTaskIdsToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :linked_task_ids, :text, default: '[]'
    add_column :schedule_template_rows, :linked_template_id, :integer, null: true
  end
end
