class UpdateGoldStandardColumnTypes < ActiveRecord::Migration[8.0]
  def change
    # Update phone/mobile column lengths
    if column_exists?(:gold_standard_items, :phone)
      change_column :gold_standard_items, :phone, :string, limit: 20
    end

    if column_exists?(:gold_standard_items, :mobile)
      change_column :gold_standard_items, :mobile, :string, limit: 20
    end

    # Update category_type (already VARCHAR(255), no change needed)

    # Update discount to match DECIMAL(5,2)
    if column_exists?(:gold_standard_items, :discount)
      change_column :gold_standard_items, :discount, :decimal, precision: 5, scale: 2
    end

    # Update status
    if column_exists?(:gold_standard_items, :status)
      change_column :gold_standard_items, :status, :string, limit: 50
    end

    # Update price to match DECIMAL(10,2)
    if column_exists?(:gold_standard_items, :price)
      change_column :gold_standard_items, :price, :decimal, precision: 10, scale: 2
    end

    # Update quantity to INTEGER (from decimal if needed)
    if column_exists?(:gold_standard_items, :quantity)
      change_column :gold_standard_items, :quantity, :integer
    end

    # Update whole_number to INTEGER (should already be)
    if column_exists?(:gold_standard_items, :whole_number)
      change_column :gold_standard_items, :whole_number, :integer
    end

    # Update document_link to VARCHAR(500)
    if column_exists?(:gold_standard_items, :document_link)
      change_column :gold_standard_items, :document_link, :string, limit: 500
    end

    # Update location_coords to VARCHAR(100) (only if it exists from previous migration)
    if column_exists?(:gold_standard_items, :location_coords)
      change_column :gold_standard_items, :location_coords, :string, limit: 100
    end

    # Update color_code to VARCHAR(7) (only if it exists from previous migration)
    if column_exists?(:gold_standard_items, :color_code)
      change_column :gold_standard_items, :color_code, :string, limit: 7
    end
  end
end
