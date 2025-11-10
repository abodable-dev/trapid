class AddXeroFieldsToContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :contacts, :bank_bsb, :string
    add_column :contacts, :bank_account_number, :string
    add_column :contacts, :bank_account_name, :string
    add_column :contacts, :default_purchase_account, :string
    add_column :contacts, :bill_due_day, :integer
    add_column :contacts, :bill_due_type, :string
  end
end
