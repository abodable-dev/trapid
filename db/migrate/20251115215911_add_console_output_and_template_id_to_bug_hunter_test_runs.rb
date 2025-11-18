class AddConsoleOutputAndTemplateIdToBugHunterTestRuns < ActiveRecord::Migration[8.0]
  def change
    add_column :bug_hunter_test_runs, :console_output, :text unless column_exists?(:bug_hunter_test_runs, :console_output)
    add_column :bug_hunter_test_runs, :template_id, :integer unless column_exists?(:bug_hunter_test_runs, :template_id)
  end
end
