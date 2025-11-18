class AddConstructionIdToChatMessages < ActiveRecord::Migration[8.0]
  def change
    add_reference :chat_messages, :construction, null: true, foreign_key: true
    add_column :chat_messages, :saved_to_job, :boolean, default: false
  end
end
