class AddSearchTextToBibleRules < ActiveRecord::Migration[8.0]
  def change
    add_column :bible_rules, :search_text, :text
  end
end
