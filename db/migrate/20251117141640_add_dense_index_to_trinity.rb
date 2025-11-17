class AddDenseIndexToTrinity < ActiveRecord::Migration[8.0]
  def change
    add_column :trinity, :dense_index, :text
    # Use btree index for ILIKE searches (GIN requires tsvector for text)
    add_index :trinity, :dense_index
  end
end
