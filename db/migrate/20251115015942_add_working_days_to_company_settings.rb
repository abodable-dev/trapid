class AddWorkingDaysToCompanySettings < ActiveRecord::Migration[8.0]
  def change
    add_column :company_settings, :working_days, :jsonb, default: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: true
    }
  end
end
