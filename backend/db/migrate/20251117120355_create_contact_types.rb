class CreateContactTypes < ActiveRecord::Migration[8.0]
  def change
    create_table :contact_types do |t|
      t.string :name, null: false
      t.string :display_name, null: false
      t.string :tab_label
      t.text :description
      t.boolean :active, default: true, null: false
      t.integer :position, null: false

      t.timestamps
    end

    add_index :contact_types, :name, unique: true
    add_index :contact_types, :position

    # Seed initial contact types
    reversible do |dir|
      dir.up do
        execute <<~SQL
          INSERT INTO contact_types (name, display_name, tab_label, description, active, position, created_at, updated_at)
          VALUES
            ('customer', 'Customer', 'Customer', 'Customer contacts', true, 1, NOW(), NOW()),
            ('supplier', 'Supplier', 'Supplier', 'Supplier contacts', true, 2, NOW(), NOW()),
            ('sales', 'Sales', 'Sales', 'Sales team contacts', true, 3, NOW(), NOW()),
            ('land_agent', 'Land Agent', 'Land Agent', 'Land agent contacts', true, 4, NOW(), NOW())
        SQL
      end
    end
  end
end
