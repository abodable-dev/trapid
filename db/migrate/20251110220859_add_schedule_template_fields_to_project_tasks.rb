class AddScheduleTemplateFieldsToProjectTasks < ActiveRecord::Migration[8.0]
  def change
    # Link to schedule template row that spawned this task
    add_reference :project_tasks, :schedule_template_row, foreign_key: true

    # Track if this is a spawned task (photo, certificate, subtask)
    add_column :project_tasks, :spawned_type, :string  # null = normal, 'photo', 'certificate', 'subtask'
    add_reference :project_tasks, :parent_task, foreign_key: { to_table: :project_tasks }

    # Supervisor check-in fields
    add_column :project_tasks, :requires_supervisor_check, :boolean, default: false, null: false
    add_column :project_tasks, :supervisor_checked_at, :datetime
    add_reference :project_tasks, :supervisor_checked_by, foreign_key: { to_table: :users }

    # Photo and certificate tracking
    add_column :project_tasks, :photo_uploaded_at, :datetime
    add_column :project_tasks, :certificate_uploaded_at, :datetime

    # Tags for filtering (stored as JSONB array)
    add_column :project_tasks, :tags, :jsonb, default: [], null: false

    # Critical PO flag (from template)
    add_column :project_tasks, :critical_po, :boolean, default: false, null: false

    # Auto-completion of predecessors
    add_column :project_tasks, :auto_complete_predecessors, :boolean, default: false, null: false

    # Add indexes for common queries
    add_index :project_tasks, :spawned_type
    add_index :project_tasks, :requires_supervisor_check
    add_index :project_tasks, :tags, using: :gin
  end
end
