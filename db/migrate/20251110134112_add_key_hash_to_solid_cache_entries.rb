class AddKeyHashToSolidCacheEntries < ActiveRecord::Migration[8.0]
  def change
    # Skip if solid_cache_entries table doesn't exist
    return unless table_exists?(:solid_cache_entries)

    # Add key_hash column if it doesn't exist
    add_column :solid_cache_entries, :key_hash, :string, if_not_exists: true

    # Add unique index on key_hash
    add_index :solid_cache_entries, :key_hash, unique: true, if_not_exists: true
  end
end
