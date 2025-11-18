class AddAdditionalXeroFieldsToContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :contacts, :xero_contact_number, :string
    add_column :contacts, :xero_contact_status, :string
    add_column :contacts, :xero_account_number, :string
    add_column :contacts, :company_number, :string
    add_column :contacts, :fax_phone, :string
    add_column :contacts, :default_sales_account, :string
    add_column :contacts, :default_discount, :decimal, precision: 5, scale: 2
    add_column :contacts, :sales_due_day, :integer
    add_column :contacts, :sales_due_type, :string

    # Balances (read-only from Xero)
    add_column :contacts, :accounts_receivable_outstanding, :decimal, precision: 15, scale: 2
    add_column :contacts, :accounts_receivable_overdue, :decimal, precision: 15, scale: 2
    add_column :contacts, :accounts_payable_outstanding, :decimal, precision: 15, scale: 2
    add_column :contacts, :accounts_payable_overdue, :decimal, precision: 15, scale: 2

    add_index :contacts, :xero_contact_number
    add_index :contacts, :xero_contact_status
  end
end
