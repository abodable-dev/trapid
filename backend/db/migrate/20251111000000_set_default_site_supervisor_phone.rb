class SetDefaultSiteSupervisorPhone < ActiveRecord::Migration[8.0]
  def up
    # Set default value for new records
    change_column_default :constructions, :site_supervisor_phone, "0407 150 081"

    # Backfill existing records that have null phone numbers
    Construction.where(site_supervisor_phone: nil).update_all(site_supervisor_phone: "0407 150 081")
  end

  def down
    # Remove default value
    change_column_default :constructions, :site_supervisor_phone, nil
  end
end
