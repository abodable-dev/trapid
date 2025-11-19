class CreateCompanyComplianceItems < ActiveRecord::Migration[8.0]
  def change
    create_table :company_compliance_items do |t|
      t.references :company, null: false, foreign_key: true, index: true
      t.string :title, null: false
      t.text :description
      t.string :item_type, null: false
      t.date :due_date, null: false
      t.boolean :completed, default: false
      t.datetime :completed_at
      t.string :reminder_days
      t.datetime :last_reminder_sent_at

      t.timestamps
    end

    add_index :company_compliance_items, :due_date
    add_index :company_compliance_items, :completed
    add_index :company_compliance_items, :item_type
    add_index :company_compliance_items, [:company_id, :due_date, :completed]
  end
end
