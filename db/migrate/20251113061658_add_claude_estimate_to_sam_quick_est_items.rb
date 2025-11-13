class AddClaudeEstimateToSamQuickEstItems < ActiveRecord::Migration[8.0]
  def change
    add_column :sam_quick_est_items, :claude_estimate, :decimal, precision: 10, scale: 2
  end
end
