class CreateCompanies < ActiveRecord::Migration[8.0]
  def change
    create_table :companies do |t|
      # Basic Information
      t.string :name, null: false
      t.string :company_group  # Tekna, Team Harder, Promise, Charity
      t.string :acn
      t.string :abn
      t.string :tfn
      t.date :date_incorporated
      t.text :purpose
      t.string :status, default: 'active'  # active, struck_off, in_liquidation

      # Registration Details
      t.string :registered_office_address
      t.string :principal_place_of_business
      t.boolean :is_trustee, default: false
      t.string :trust_name

      # ASIC/Integration
      t.string :corporate_key
      t.string :asic_username
      t.text :encrypted_asic_password
      t.text :recovery_question
      t.text :encrypted_recovery_answer

      # Compliance
      t.date :review_date  # Next ASIC review
      t.string :gst_registration_status  # registered, not_registered
      t.string :accounting_method  # cash, accrual

      # Financial
      t.integer :shares_on_issue
      t.decimal :carry_forward_losses, precision: 15, scale: 2
      t.decimal :franking_balance, precision: 15, scale: 2
      t.decimal :amount_owing, precision: 15, scale: 2

      # Metadata
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :companies, :name
    add_index :companies, :company_group
    add_index :companies, :acn, unique: true, where: "acn IS NOT NULL"
    add_index :companies, :abn, unique: true, where: "abn IS NOT NULL"
    add_index :companies, :status
    add_index :companies, :review_date
  end
end
