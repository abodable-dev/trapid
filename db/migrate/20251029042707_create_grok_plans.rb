class CreateGrokPlans < ActiveRecord::Migration[8.0]
  def change
    create_table :grok_plans do |t|
      t.string :title
      t.text :description
      t.jsonb :conversation, default: []
      t.string :status, default: 'planning'
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
