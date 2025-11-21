class CreateCompanies < ActiveRecord::Migration[8.0]
  def change
    create_table :companies do |t|
      t.string :name, null: false
      t.string :company_group
      t.string :acn
      t.string :abn
      t.string :tfn
      t.string :status, default: 'active'
      t.date :date_incorporated
      t.text :registered_office_address
      t.text :principal_place_of_business
      t.boolean :is_trustee, default: false
      t.string :trust_name
      t.string :gst_registration_status
      t.string :asic_username
      t.string :asic_password
      t.string :asic_recovery_question
      t.string :asic_recovery_answer
      t.date :asic_last_review_date
      t.date :asic_next_review_date
      t.text :notes
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :companies, :acn, unique: true, where: "acn IS NOT NULL"
    add_index :companies, :abn, unique: true, where: "abn IS NOT NULL"
    add_index :companies, :company_group
    add_index :companies, :status
    add_index :companies, :name
  end
end
