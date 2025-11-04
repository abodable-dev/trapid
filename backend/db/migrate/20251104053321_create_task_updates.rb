class CreateTaskUpdates < ActiveRecord::Migration[8.0]
  def change
    create_table :task_updates do |t|
      t.references :project_task, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      # Track status changes
      t.string :status_before
      t.string :status_after

      # Track progress changes
      t.integer :progress_before
      t.integer :progress_after

      # Notes and photos
      t.text :notes
      t.text :photo_urls, array: true, default: []

      # When the update was made
      t.date :update_date, null: false, default: -> { 'CURRENT_DATE' }

      t.timestamps
    end

    # t.references already creates project_task_id index
    add_index :task_updates, :update_date
  end
end
