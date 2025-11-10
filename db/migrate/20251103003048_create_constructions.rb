class CreateConstructions < ActiveRecord::Migration[8.0]
  def change
    create_table :constructions do |t|
      t.string :title
      t.decimal :contract_value, precision: 15, scale: 2
      t.decimal :live_profit, precision: 15, scale: 2
      t.decimal :profit_percentage, precision: 5, scale: 2
      t.string :stage
      t.string :status
      t.string :ted_number
      t.string :certifier_job_no
      t.date :start_date

      t.timestamps
    end

    add_index :constructions, :status
  end
end
