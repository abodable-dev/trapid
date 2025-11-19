class CreateTableProtections < ActiveRecord::Migration[8.0]
  def change
    create_table :table_protections do |t|
      t.string :table_name, null: false
      t.boolean :is_protected, default: true, null: false
      t.text :description

      t.timestamps
    end
    add_index :table_protections, :table_name, unique: true

    # Seed protected tables
    reversible do |dir|
      dir.up do
        TableProtection.create!([
          { table_name: 'trinity', is_protected: true, description: 'Trinity documentation system - protected from schema modifications' },
          { table_name: 'users', is_protected: true, description: 'User authentication table - protected from schema modifications' }
        ])
      end
    end
  end
end
