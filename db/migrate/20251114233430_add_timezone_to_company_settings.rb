class AddTimezoneToCompanySettings < ActiveRecord::Migration[8.0]
  def change
    add_column :company_settings, :timezone, :string, default: 'Australia/Brisbane'

    # Set timezone for any existing company settings
    reversible do |dir|
      dir.up do
        execute "UPDATE company_settings SET timezone = 'Australia/Brisbane' WHERE timezone IS NULL"
      end
    end
  end
end
