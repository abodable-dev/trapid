class CreateEstimates < ActiveRecord::Migration[8.0]
  def change
    create_table :estimates do |t|
      t.references :construction, foreign_key: true, null: true
      t.string :source, default: 'unreal_engine', null: false
      t.string :estimator_name
      t.string :job_name_from_source, null: false
      t.boolean :matched_automatically, default: false
      t.decimal :match_confidence_score, precision: 5, scale: 2
      t.string :status, default: 'pending', null: false
      t.integer :total_items, default: 0
      t.datetime :imported_at

      t.timestamps
    end

    add_index :estimates, :status
    add_index :estimates, :source
    add_index :estimates, :imported_at
  end
end
