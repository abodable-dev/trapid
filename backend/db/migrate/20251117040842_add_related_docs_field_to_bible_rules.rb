class AddRelatedDocsFieldToBibleRules < ActiveRecord::Migration[8.0]
  def change
    add_column :bible_rules, :related_docs, :text
  end
end
