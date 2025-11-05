class BackfillContactTypes < ActiveRecord::Migration[8.0]
  def up
    # Contacts linked to suppliers should be marked as suppliers
    # All other contacts default to customers (already set by column default)

    # Find contacts that are linked to suppliers via supplier_contacts
    supplier_contact_ids = execute(<<-SQL).values.flatten
      SELECT DISTINCT contact_id FROM supplier_contacts
    SQL

    if supplier_contact_ids.any?
      # Update these contacts to 'supplier' type
      Contact.where(id: supplier_contact_ids).update_all(contact_type: 'supplier')

      puts "Backfilled #{supplier_contact_ids.count} contacts as suppliers"
    end

    # All other contacts will remain as 'customer' (the default)
    customer_count = Contact.where(contact_type: 'customer').count
    puts "#{customer_count} contacts marked as customers"
  end

  def down
    # Reversible - reset all to customer
    Contact.update_all(contact_type: 'customer')
  end
end
