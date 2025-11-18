class CreateContactRoles < ActiveRecord::Migration[8.0]
  def change
    create_table :contact_roles do |t|
      t.string :name, null: false
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :contact_roles, :name, unique: true

    # Seed initial roles
    reversible do |dir|
      dir.up do
        ContactRole.create!([
          { name: 'Sales', active: true },
          { name: 'Owner', active: true },
          { name: 'Accounts', active: true },
          { name: 'Ordering', active: true }
        ])
      end
    end
  end
end
