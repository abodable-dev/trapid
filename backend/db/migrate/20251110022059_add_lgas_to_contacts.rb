class AddLgasToContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :contacts, :lgas, :text, array: true, default: []
  end
end
