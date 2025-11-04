class AddLgaAndDateEffectiveToPriceHistories < ActiveRecord::Migration[8.0]
  def change
    add_column :price_histories, :lga, :string
    add_column :price_histories, :date_effective, :date
  end
end
