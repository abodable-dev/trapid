class AddBrokenPredecessorIdsToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :broken_predecessor_ids, :jsonb, default: [], null: false
  end
end
