class AddTwilioToCompanySettings < ActiveRecord::Migration[8.0]
  def change
    add_column :company_settings, :twilio_account_sid, :string
    add_column :company_settings, :twilio_auth_token, :string
    add_column :company_settings, :twilio_phone_number, :string
    add_column :company_settings, :twilio_enabled, :boolean, default: false
  end
end
