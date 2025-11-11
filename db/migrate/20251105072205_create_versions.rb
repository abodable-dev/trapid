class CreateVersions < ActiveRecord::Migration[8.0]
  def change
    create_table :versions do |t|
      t.integer :current_version, null: false, default: 101

      t.timestamps
    end

    # Create initial version record
    reversible do |dir|
      dir.up do
        execute "INSERT INTO versions (current_version, created_at, updated_at) VALUES (101, NOW(), NOW())"
      end
    end
  end
end
