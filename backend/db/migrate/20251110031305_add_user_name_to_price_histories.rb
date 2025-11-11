class AddUserNameToPriceHistories < ActiveRecord::Migration[8.0]
  def change
    add_column :price_histories, :user_name, :string
  end
end
