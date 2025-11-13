class AddResponseTypeToSupervisorChecklistTemplates < ActiveRecord::Migration[8.0]
  def change
    add_column :supervisor_checklist_templates, :response_type, :string
  end
end
