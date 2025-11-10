class CreateScheduleTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :schedule_templates do |t|
      t.string :name, null: false
      t.text :description
      t.boolean :is_default, default: false, null: false
      t.references :created_by, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :schedule_templates, :name
    add_index :schedule_templates, :is_default
  end
end
