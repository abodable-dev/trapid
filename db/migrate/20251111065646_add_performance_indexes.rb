class AddPerformanceIndexes < ActiveRecord::Migration[8.0]
  def change
    # Emails table indexes
    add_index :emails, :user_id, if_not_exists: true unless index_exists?(:emails, :user_id)
    add_index :emails, :received_at, if_not_exists: true unless index_exists?(:emails, :received_at)
    add_index :emails, :construction_id, if_not_exists: true unless index_exists?(:emails, :construction_id)

    # Purchase orders table indexes
    add_index :purchase_orders, :required_date, if_not_exists: true unless index_exists?(:purchase_orders, :required_date)
    add_index :purchase_orders, :payment_status, if_not_exists: true unless index_exists?(:purchase_orders, :payment_status)
    add_index :purchase_orders, :construction_id, if_not_exists: true unless index_exists?(:purchase_orders, :construction_id)
    add_index :purchase_orders, :supplier_id, if_not_exists: true unless index_exists?(:purchase_orders, :supplier_id)

    # Contacts table indexes
    add_index :contacts, :email, if_not_exists: true unless index_exists?(:contacts, :email)
    add_index :contacts, [:xero_id, :last_synced_at], name: 'index_contacts_on_xero_id_and_last_synced_at', if_not_exists: true unless index_exists?(:contacts, [:xero_id, :last_synced_at])

    # Schedule tasks table indexes
    add_index :schedule_tasks, :construction_id, if_not_exists: true unless index_exists?(:schedule_tasks, :construction_id)
    add_index :schedule_tasks, :start_date, if_not_exists: true unless index_exists?(:schedule_tasks, :start_date)
    add_index :schedule_tasks, :end_date, if_not_exists: true unless index_exists?(:schedule_tasks, :end_date)
    add_index :schedule_tasks, :status, if_not_exists: true unless index_exists?(:schedule_tasks, :status)

    # Constructions table indexes
    add_index :constructions, :status, if_not_exists: true unless index_exists?(:constructions, :status)
    add_index :constructions, :created_at, if_not_exists: true unless index_exists?(:constructions, :created_at)

    # Price histories table indexes (for pricebook performance)
    add_index :price_histories, :pricebook_item_id, if_not_exists: true unless index_exists?(:price_histories, :pricebook_item_id)
    add_index :price_histories, :contact_id, if_not_exists: true unless index_exists?(:price_histories, :contact_id)
    add_index :price_histories, :effective_date, if_not_exists: true unless index_exists?(:price_histories, :effective_date)

    # Chat messages table indexes
    add_index :chat_messages, :user_id, if_not_exists: true unless index_exists?(:chat_messages, :user_id)
    add_index :chat_messages, :created_at, if_not_exists: true unless index_exists?(:chat_messages, :created_at)
    add_index :chat_messages, :unread, if_not_exists: true unless index_exists?(:chat_messages, :unread)
  end
end
