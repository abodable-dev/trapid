class CreateCompanySettings < ActiveRecord::Migration[8.0]
  def change
    create_table :company_settings do |t|
      t.string :company_name
      t.string :abn
      t.string :gst_number
      t.string :email
      t.string :phone
      t.text :address
      t.string :logo_url

      t.timestamps
    end
  end
end
