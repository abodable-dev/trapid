class AddTeamFieldsToConstructions < ActiveRecord::Migration[8.0]
  def change
    add_column :constructions, :site_supervisor_name, :string, default: "Andrew Clement"
    add_column :constructions, :site_supervisor_email, :string
    add_column :constructions, :site_supervisor_phone, :string

    # Backfill existing records
    reversible do |dir|
      dir.up do
        Construction.update_all(site_supervisor_name: "Andrew Clement")
      end
    end
  end
end
