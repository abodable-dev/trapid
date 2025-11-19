class CreateCompanyComplianceItems < ActiveRecord::Migration[8.0]
  def change
    create_table :company_compliance_items do |t|
      t.references :company, null: false, foreign_key: true

      t.string :compliance_type  # asic_review, tax_return, agm, insurance_renewal
      t.string :title, null: false
      t.text :description
      t.date :due_date, null: false
      t.date :completed_date
      t.string :status, default: 'pending'  # pending, completed, overdue

      # Reminder settings
      t.boolean :reminder_90_days, default: true
      t.boolean :reminder_60_days, default: true
      t.boolean :reminder_30_days, default: true
      t.boolean :reminder_7_days, default: true

      # Notification recipients (comma-separated emails)
      t.text :notification_recipients

      # Recurring
      t.boolean :is_recurring, default: false
      t.string :recurrence_frequency  # annual, quarterly, monthly

      t.timestamps
    end

    add_index :company_compliance_items, :due_date
    add_index :company_compliance_items, :status
    add_index :company_compliance_items, [:company_id, :status]
    add_index :company_compliance_items, [:company_id, :due_date]
  end
end
