class AddPrimaryContactTypeToContacts < ActiveRecord::Migration[7.0]
  def change
    add_column :contacts, :primary_contact_type, :string
    add_index :contacts, :primary_contact_type

    # Set primary_contact_type to first type in contact_types array for existing records
    reversible do |dir|
      dir.up do
        Contact.reset_column_information
        Contact.find_each do |contact|
          if contact.contact_types.present?
            contact.update_column(:primary_contact_type, contact.contact_types.first)
          end
        end
      end
    end
  end
end
