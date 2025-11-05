class AddFieldsToEstimateReviews < ActiveRecord::Migration[8.0]
  def change
    add_reference :estimate_reviews, :estimate, null: false, foreign_key: true
    add_column :estimate_reviews, :status, :string, null: false, default: 'pending'
    add_column :estimate_reviews, :ai_findings, :text
    add_column :estimate_reviews, :discrepancies, :text
    add_column :estimate_reviews, :items_matched, :integer, default: 0
    add_column :estimate_reviews, :items_mismatched, :integer, default: 0
    add_column :estimate_reviews, :items_missing, :integer, default: 0
    add_column :estimate_reviews, :items_extra, :integer, default: 0
    add_column :estimate_reviews, :confidence_score, :decimal, precision: 5, scale: 2
    add_column :estimate_reviews, :reviewed_at, :datetime

    add_index :estimate_reviews, :status
    add_index :estimate_reviews, :reviewed_at
  end
end
