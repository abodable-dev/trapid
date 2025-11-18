class AddWholeNumberToGoldStandardItems < ActiveRecord::Migration[8.0]
  def change
    add_column :gold_standard_items, :whole_number, :integer
  end
end
