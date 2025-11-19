class UpdateGoldStandardColumnTypes < ActiveRecord::Migration[8.0]
  def change
    # Update phone/mobile column lengths
    change_column :gold_standard_items, :phone, :string, limit: 20
    change_column :gold_standard_items, :mobile, :string, limit: 20

    # Update category_type (already VARCHAR(255), no change needed)

    # Update discount to match DECIMAL(5,2)
    change_column :gold_standard_items, :discount, :decimal, precision: 5, scale: 2

    # Update status
    change_column :gold_standard_items, :status, :string, limit: 50

    # Update price to match DECIMAL(10,2)
    change_column :gold_standard_items, :price, :decimal, precision: 10, scale: 2

    # Update quantity to INTEGER (from decimal if needed)
    change_column :gold_standard_items, :quantity, :integer

    # Update whole_number to INTEGER (should already be)
    change_column :gold_standard_items, :whole_number, :integer

    # Update document_link to VARCHAR(500)
    change_column :gold_standard_items, :document_link, :string, limit: 500

    # Update location_coords to VARCHAR(100)
    change_column :gold_standard_items, :location_coords, :string, limit: 100

    # Update color_code to VARCHAR(7)
    change_column :gold_standard_items, :color_code, :string, limit: 7
  end
end
