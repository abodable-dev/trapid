class AddDirectorFieldsToContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :contacts, :is_director, :boolean, default: false
    add_column :contacts, :director_tfn, :string
    add_column :contacts, :director_date_of_birth, :date
    add_column :contacts, :director_position, :string
    add_column :contacts, :is_beneficial_owner, :boolean, default: false
    add_column :contacts, :shareholding_percentage, :decimal, precision: 5, scale: 2

    add_index :contacts, :is_director
    add_index :contacts, :is_beneficial_owner
  end
end
