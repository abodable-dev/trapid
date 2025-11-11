class AddScheduleFieldsToPurchaseOrders < ActiveRecord::Migration[8.0]
  def change
    add_column :purchase_orders, :required_on_site_date, :date
    add_column :purchase_orders, :creates_schedule_tasks, :boolean, default: true
    add_column :purchase_orders, :task_category, :string

    add_index :purchase_orders, :required_on_site_date
    add_index :purchase_orders, :creates_schedule_tasks
  end
end
