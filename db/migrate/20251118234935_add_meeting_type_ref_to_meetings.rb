class AddMeetingTypeRefToMeetings < ActiveRecord::Migration[8.0]
  def change
    add_reference :meetings, :meeting_type, null: false, foreign_key: true
  end
end
