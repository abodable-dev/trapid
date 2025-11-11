class AddRecipientUserIdToChatMessages < ActiveRecord::Migration[8.0]
  def change
    add_column :chat_messages, :recipient_user_id, :integer
  end
end
