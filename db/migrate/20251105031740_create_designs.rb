class CreateDesigns < ActiveRecord::Migration[8.0]
  def change
    create_table :designs do |t|
      t.string :name, null: false
      t.decimal :size, precision: 10, scale: 2
      t.decimal :frontage_required, precision: 10, scale: 2
      t.string :floor_plan_url
      t.text :description
      t.boolean :is_active, default: true, null: false

      t.timestamps
    end

    add_index :designs, :name, unique: true
    add_index :designs, :is_active
  end
end
