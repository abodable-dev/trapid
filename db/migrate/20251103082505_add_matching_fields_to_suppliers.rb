class AddMatchingFieldsToSuppliers < ActiveRecord::Migration[8.0]
  def change
    add_column :suppliers, :contact_id, :integer
    add_column :suppliers, :confidence_score, :decimal, precision: 5, scale: 4
    add_column :suppliers, :match_type, :string # exact, high, fuzzy, manual, unmatched
    add_column :suppliers, :is_verified, :boolean, default: false
    add_column :suppliers, :original_name, :string # Original name from price book

    add_index :suppliers, :contact_id
    add_index :suppliers, :is_verified
    add_index :suppliers, :match_type
  end
end
