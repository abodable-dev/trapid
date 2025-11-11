class CreatePublicHolidays < ActiveRecord::Migration[8.0]
  def change
    create_table :public_holidays do |t|
      t.string :name
      t.date :date
      t.string :region

      t.timestamps
    end
  end
end
