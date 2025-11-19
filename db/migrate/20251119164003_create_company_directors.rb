class CreateCompanyDirectors < ActiveRecord::Migration[8.0]
  def change
    create_table :company_directors do |t|
      t.references :company, null: false, foreign_key: true
      t.references :contact, null: false, foreign_key: true
      t.string :position
      t.date :appointment_date
      t.date :resignation_date
      t.boolean :is_current, default: true

      t.timestamps
    end

    add_index :company_directors, [:company_id, :contact_id], unique: true, where: "is_current = true"
    add_index :company_directors, :is_current
  end
end
