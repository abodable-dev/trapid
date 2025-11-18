class CreateMeetingTypes < ActiveRecord::Migration[8.0]
  def change
    create_table :meeting_types do |t|
      t.string :name, null: false
      t.text :description
      t.string :category # sales, construction, board, team, safety, etc.
      t.string :icon # heroicon name
      t.string :color # for UI display

      # Duration settings
      t.integer :default_duration_minutes, default: 60

      # Participant rules (stored as JSON)
      t.text :required_participant_types # ["client", "project_manager", "supervisor"]
      t.text :optional_participant_types # ["architect", "engineer"]
      t.integer :minimum_participants
      t.integer :maximum_participants

      # Agenda template (stored as JSON array)
      t.text :default_agenda_items # [{title: "Welcome", duration: 5}, {title: "Review", duration: 20}]

      # Field requirements (stored as JSON)
      t.text :required_fields # ["location", "construction_id", "video_url"]
      t.text :optional_fields # ["notes", "documents"]
      t.text :custom_fields # [{name: "safety_checklist", type: "checkbox", label: "Safety Review Complete"}]

      # Document requirements
      t.text :required_documents # ["agenda", "minutes"]

      # Notification settings (stored as JSON)
      t.text :notification_settings # {send_reminder: true, reminder_hours: 24}

      # Status
      t.boolean :is_active, default: true
      t.boolean :is_system_default, default: false # Cannot be deleted if true

      t.timestamps
    end

    add_index :meeting_types, :name, unique: true
    add_index :meeting_types, :category
    add_index :meeting_types, :is_active
  end
end
