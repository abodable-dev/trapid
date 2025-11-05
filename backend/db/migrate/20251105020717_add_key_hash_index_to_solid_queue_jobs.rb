class AddKeyHashIndexToSolidQueueJobs < ActiveRecord::Migration[8.0]
  def change
    add_index :solid_queue_jobs, :key_hash, unique: true, if_not_exists: true
  end
end
