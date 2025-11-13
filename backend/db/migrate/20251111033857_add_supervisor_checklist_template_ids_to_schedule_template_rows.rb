class AddSupervisorChecklistTemplateIdsToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :supervisor_checklist_template_ids, :integer, array: true, default: []
    add_index :schedule_template_rows, :supervisor_checklist_template_ids, using: :gin
  end
end
