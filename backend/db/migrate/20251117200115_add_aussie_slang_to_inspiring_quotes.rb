class AddAussieSlangToInspiringQuotes < ActiveRecord::Migration[8.0]
  def change
    add_column :inspiring_quotes, :aussie_slang, :text
  end
end
