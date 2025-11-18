class CreateRoles < ActiveRecord::Migration[8.0]
  def change
    create_table :roles do |t|
      t.string :name, null: false
      t.string :display_name, null: false
      t.text :description
      t.boolean :active, default: true, null: false
      t.integer :position, null: false

      t.timestamps
    end

    add_index :roles, :name, unique: true
    add_index :roles, :position

    # Seed initial roles
    reversible do |dir|
      dir.up do
        execute <<~SQL
          INSERT INTO roles (name, display_name, description, active, position, created_at, updated_at)
          VALUES
            ('user', 'User', 'Basic user with view-only access', true, 1, NOW(), NOW()),
            ('builder', 'Builder', 'Can create and edit construction projects', true, 2, NOW(), NOW()),
            ('supervisor', 'Supervisor', 'Can manage teams and oversee projects', true, 3, NOW(), NOW()),
            ('estimator', 'Estimator', 'Can create and manage project estimates', true, 4, NOW(), NOW()),
            ('product_owner', 'Product Owner', 'Can manage products and priorities', true, 5, NOW(), NOW()),
            ('admin', 'Admin', 'Full system access and configuration', true, 6, NOW(), NOW())
        SQL
      end
    end
  end
end
