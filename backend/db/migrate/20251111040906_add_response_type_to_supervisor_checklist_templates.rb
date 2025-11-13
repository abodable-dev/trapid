class AddResponseTypeToSupervisorChecklistTemplates < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:supervisor_checklist_templates, :response_type)
      add_column :supervisor_checklist_templates, :response_type, :string, default: 'checkbox'
    end
    # Response types: 'checkbox' (yes/no), 'photo' (requires photo upload), 'note' (requires text note), 'photo_and_note' (both required)
  end
end
