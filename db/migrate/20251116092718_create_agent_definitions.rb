class CreateAgentDefinitions < ActiveRecord::Migration[8.0]
  def change
    create_table :agent_definitions do |t|
      t.string :agent_id, null: false         # e.g., "backend-developer", "gantt-bug-hunter"
      t.string :name, null: false              # e.g., "Backend Developer", "Gantt Bug Hunter"
      t.string :agent_type, null: false        # e.g., "development", "diagnostic", "deployment"
      t.string :focus, null: false             # e.g., "Rails API Backend Development"
      t.string :model, default: "sonnet"       # Claude model to use
      t.text :purpose                          # Purpose and overview
      t.text :capabilities                     # Capabilities (comma-separated or JSON)
      t.text :when_to_use                      # When to invoke this agent
      t.text :tools_available                  # Tools available to agent
      t.text :success_criteria                 # Success criteria
      t.text :example_invocations              # Example commands
      t.text :important_notes                  # Critical notes and warnings
      t.integer :total_runs, default: 0
      t.integer :successful_runs, default: 0
      t.integer :failed_runs, default: 0
      t.datetime :last_run_at
      t.string :last_status                    # success, failure, error
      t.text :last_message
      t.jsonb :last_run_details, default: {}   # Detailed info about last run
      t.jsonb :metadata, default: {}           # Additional metadata
      t.boolean :active, default: true         # Is agent currently active?
      t.integer :priority, default: 0          # Display order (higher = show first)

      t.timestamps
    end

    add_index :agent_definitions, :agent_id, unique: true
    add_index :agent_definitions, :agent_type
    add_index :agent_definitions, :active
  end
end
