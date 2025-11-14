class CreateBugHunterTests < ActiveRecord::Migration[8.0]
  def change
    # Test run history table
    create_table :bug_hunter_test_runs do |t|
      t.string :test_id, null: false
      t.string :status, null: false  # 'pass', 'fail', 'error'
      t.text :message
      t.float :duration

      t.timestamps
    end

    add_index :bug_hunter_test_runs, :test_id
    add_index :bug_hunter_test_runs, :created_at
  end
end
