class AddKeyHashIndexToSolidQueueJobs < ActiveRecord::Migration[8.0]
  def change
    # Skip if solid_queue_jobs table doesn't exist (e.g., in local dev)
    return unless table_exists?(:solid_queue_jobs)

    # Add key_hash column if it doesn't exist
    add_column :solid_queue_jobs, :key_hash, :string, if_not_exists: true

    # Add unique index on key_hash
    add_index :solid_queue_jobs, :key_hash, unique: true, if_not_exists: true
  end
end
