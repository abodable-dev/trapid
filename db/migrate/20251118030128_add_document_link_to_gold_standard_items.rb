class AddDocumentLinkToGoldStandardItems < ActiveRecord::Migration[8.0]
  def change
    add_column :gold_standard_items, :document_link, :string
  end
end
