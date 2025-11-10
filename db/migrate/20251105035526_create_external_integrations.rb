class CreateExternalIntegrations < ActiveRecord::Migration[8.0]
  def change
    create_table :external_integrations do |t|
      t.string :name, null: false
      t.string :api_key_digest, null: false
      t.boolean :is_active, default: true
      t.datetime :last_used_at
      t.text :description

      t.timestamps
    end

    add_index :external_integrations, :name, unique: true
    add_index :external_integrations, :is_active
  end
end
