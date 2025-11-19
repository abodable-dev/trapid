class AddDirectorFieldsToContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :contacts, :director_id, :string
    add_column :contacts, :passport_number, :string
    add_column :contacts, :drivers_license_number, :string
    add_column :contacts, :date_of_birth, :date
    add_column :contacts, :place_of_birth, :string
    add_column :contacts, :birth_state, :string
    add_column :contacts, :birth_country, :string
    add_column :contacts, :current_residential_address, :text

    # Indexes for director fields
    add_index :contacts, :director_id, unique: true, where: "director_id IS NOT NULL"
    add_index :contacts, :passport_number, where: "passport_number IS NOT NULL"
  end
end
