class ChangeConstructionProfitPercentagePrecision < ActiveRecord::Migration[8.0]
  def change
    change_column :constructions, :profit_percentage, :decimal, precision: 10, scale: 2
  end
end
