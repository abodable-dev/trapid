class CreateCompanyDirectors < ActiveRecord::Migration[8.0]
  def change
    create_table :company_directors do |t|
      t.references :company, null: false, foreign_key: true
      t.references :contact, null: false, foreign_key: true  # Director is a Contact

      t.string :position  # Director, Secretary, etc.
      t.date :appointment_date
      t.date :resignation_date
      t.boolean :is_current, default: true
      t.text :notes

      t.timestamps
    end

    # Unique constraint for active appointments
    add_index :company_directors, [:company_id, :contact_id],
              unique: true,
              where: "is_current = true",
              name: 'index_company_directors_unique_active'

    add_index :company_directors, :is_current
    add_index :company_directors, :appointment_date
  end
end
