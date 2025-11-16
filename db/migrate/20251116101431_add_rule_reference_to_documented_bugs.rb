class AddRuleReferenceToDocumentedBugs < ActiveRecord::Migration[8.0]
  def change
    add_column :documented_bugs, :rule_reference, :string
  end
end
