class CreateContactGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :contact_groups do |t|
      t.string :xero_contact_group_id, null: false
      t.string :name, null: false
      t.string :status # ACTIVE, DELETED

      t.timestamps
    end

    add_index :contact_groups, :xero_contact_group_id, unique: true
    add_index :contact_groups, :name
    add_index :contact_groups, :status
  end
end
