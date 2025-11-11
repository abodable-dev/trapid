# Import contacts and run supplier matching
require 'csv'

puts "=" * 80
puts "SUPPLIER-CONTACT MATCHING SYSTEM"
puts "=" * 80
puts ""

# Step 1: Import contacts
puts "Step 1: Importing contacts from CSV..."
contacts_file = Rails.root.join('easybuildapp development Contacts.csv')

unless File.exist?(contacts_file)
  puts "ERROR: Contacts CSV file not found at #{contacts_file}"
  exit 1
end

imported_count = 0
skipped_count = 0

CSV.foreach(contacts_file, headers: true) do |row|
  # Skip if no meaningful data
  next if row['full_name'].blank? && row['first_name'].blank? && row['email'].blank?

  # Check if contact already exists
  existing = Contact.find_by(full_name: row['full_name']) if row['full_name'].present?

  if existing
    skipped_count += 1
    next
  end

  Contact.create!(
    sys_type_id: row['sys_type_id'],
    deleted: row['deleted'] == 'true',
    parent_id: row['parent_id'],
    parent: row['parent'],
    drive_id: row['drive_id'],
    folder_id: row['folder_id'],
    tax_number: row['tax_number'],
    xero_id: row['xero_id'],
    email: row['email'],
    office_phone: row['office_phone'],
    mobile_phone: row['mobile_phone'],
    website: row['website'],
    first_name: row['first_name'],
    last_name: row['last_name'],
    full_name: row['full_name'],
    sync_with_xero: row['sync_with_xero'] == 'true',
    contact_region_id: row['contact_region_id'],
    contact_region: row['contact_region'],
    branch: row['branch'] == 'true'
  )

  imported_count += 1
end

puts "✓ Imported #{imported_count} contacts (skipped #{skipped_count} duplicates)"
puts ""

# Step 2: Create suppliers from price book
puts "Step 2: Creating suppliers from price book..."
pricebook_file = Rails.root.join('pricebook_cleaned.csv')

if File.exist?(pricebook_file)
  created_suppliers = 0

  CSV.foreach(pricebook_file, headers: true) do |row|
    supplier_name = row['supplier_name']&.strip
    next if supplier_name.blank?

    # Find or create supplier
    supplier = Supplier.find_or_initialize_by(name: supplier_name)
    if supplier.new_record?
      supplier.original_name = supplier_name
      supplier.save!
      created_suppliers += 1
    end
  end

  puts "✓ Created #{created_suppliers} new suppliers from price book"
else
  puts "⚠ Price book CSV not found"
end
puts ""

# Step 3: Run auto-matching
puts "Step 3: Running automatic matching..."
puts ""

matcher = SupplierMatcher.new
unmatched_count = Supplier.unmatched.count
puts "Suppliers to match: #{unmatched_count}"
puts ""

# High confidence matches
puts "Pass 1: High confidence (>= 0.95)..."
high_count = matcher.auto_apply_matches(threshold: 0.95, verify_exact: true)
puts "✓ Matched #{high_count} suppliers"
puts ""

# Fuzzy matches
puts "Pass 2: Fuzzy matches (>= 0.7)..."
fuzzy_count = matcher.auto_apply_matches(threshold: 0.7, verify_exact: false)
puts "✓ Matched #{fuzzy_count} suppliers"
puts ""

# Results
puts "=" * 80
puts "RESULTS"
puts "=" * 80
puts ""

total = Supplier.count
matched = Supplier.matched.count
verified = Supplier.verified.count
needs_review = Supplier.needs_review.count
unmatched = Supplier.unmatched.count

puts "Total: #{total}"
puts "  ✓ Verified: #{verified}"
puts "  ? Needs Review: #{needs_review}"
puts "  ✗ Unmatched: #{unmatched}"
puts ""
puts "Match Rate: #{(matched.to_f / total * 100).round(1)}%"
puts ""

if needs_review > 0
  puts "Examples needing review:"
  Supplier.needs_review.by_match_confidence.limit(5).each do |s|
    puts "  #{s.name} → #{s.contact.full_name} (#{(s.confidence_score * 100).round(1)}%)"
  end
  puts ""
end

puts "✓ Complete!"
puts ""
