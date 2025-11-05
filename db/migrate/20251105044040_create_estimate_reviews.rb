class CreateEstimateReviews < ActiveRecord::Migration[8.0]
  def change
    create_table :estimate_reviews do |t|
      t.references :estimate, null: false, foreign_key: true
      t.string :status, null: false, default: 'pending'
      t.text :ai_findings # JSON of Claude's analysis
      t.text :discrepancies # JSON of identified issues
      t.integer :items_matched, default: 0 # Count of items that match
      t.integer :items_mismatched, default: 0 # Count of quantity mismatches
      t.integer :items_missing, default: 0 # Items in plans not in estimate
      t.integer :items_extra, default: 0 # Items in estimate not in plans
      t.decimal :confidence_score, precision: 5, scale: 2 # 0-100
      t.datetime :reviewed_at
      t.timestamps
    end

    add_index :estimate_reviews, :status
    add_index :estimate_reviews, :reviewed_at
  end
end
