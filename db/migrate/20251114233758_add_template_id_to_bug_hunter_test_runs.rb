class AddTemplateIdToBugHunterTestRuns < ActiveRecord::Migration[8.0]
  def change
    add_column :bug_hunter_test_runs, :template_id, :integer
  end
end
