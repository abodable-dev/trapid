class AddDocumentationTabIdsToScheduleTemplateRows < ActiveRecord::Migration[8.0]
  def change
    add_column :schedule_template_rows, :documentation_tab_ids, :integer, array: true, default: []
    add_index :schedule_template_rows, :documentation_tab_ids, using: 'gin'
  end
end
