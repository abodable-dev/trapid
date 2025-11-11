class CreateContacts < ActiveRecord::Migration[8.0]
  def change
    create_table :contacts do |t|
      t.integer :sys_type_id
      t.boolean :deleted
      t.integer :parent_id
      t.string :parent
      t.string :drive_id
      t.string :folder_id
      t.string :tax_number
      t.string :xero_id
      t.string :email
      t.string :office_phone
      t.string :mobile_phone
      t.string :website
      t.string :first_name
      t.string :last_name
      t.string :full_name
      t.boolean :sync_with_xero
      t.integer :contact_region_id
      t.string :contact_region
      t.boolean :branch

      t.timestamps
    end
  end
end
