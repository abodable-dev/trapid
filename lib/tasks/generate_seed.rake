namespace :pricebook do
  desc "Generate seed file from converted CSV data"
  task generate_seed: :environment do
    require 'csv'

    suppliers_file = Rails.root.join('tmp', 'suppliers.csv')
    items_file = Rails.root.join('tmp', 'pricebook_items.csv')
    history_file = Rails.root.join('tmp', 'price_history.csv')

    output_file = Rails.root.join('db', 'seeds_pricebook.rb')

    File.open(output_file, 'w') do |f|
      f.puts "# Price Book Seed Data"
      f.puts "# Generated from EasyBuild export"
      f.puts "# Total: 209 suppliers, 5285 items, 3626 price histories"
      f.puts ""
      f.puts "puts 'Seeding Price Book data...'"
      f.puts "puts ''"
      f.puts ""
      f.puts "# Clear existing data"
      f.puts "puts 'Clearing existing data...'"
      f.puts "PriceHistory.delete_all"
      f.puts "PricebookItem.delete_all"
      f.puts "Supplier.delete_all"
      f.puts "puts '  ✓ Cleared'"
      f.puts ""
      f.puts "# Create suppliers"
      f.puts "puts 'Creating suppliers...'"
      f.puts "suppliers = {}"
      f.puts ""

      # Read and write suppliers
      CSV.foreach(suppliers_file, headers: true) do |row|
        name = row['name']
        safe_name = name.gsub("'", "\\\\'")

        f.puts "suppliers['#{safe_name}'] = Supplier.create!("
        f.puts "  name: '#{safe_name}',"
        f.puts "  contact_person: '#{row['contact_person']}',"
        f.puts "  email: '#{row['email']}',"
        f.puts "  phone: '#{row['phone']}',"
        f.puts "  address: '#{row['address']}',"
        f.puts "  rating: #{row['rating']},"
        f.puts "  response_rate: #{row['response_rate']},"
        f.puts "  avg_response_time: #{row['avg_response_time']},"
        f.puts "  notes: '#{row['notes']&.gsub("'", "\\\\'")}',\"
        f.puts "  is_active: #{row['is_active']}"
        f.puts ")"
        f.puts ""
      end

      f.puts "puts \"  ✓ Created \#{Supplier.count} suppliers\""
      f.puts ""
      f.puts "# Create price book items"
      f.puts "puts 'Creating price book items...'"
      f.puts "items = {}"
      f.puts ""

      # Read and write items
      CSV.foreach(items_file, headers: true) do |row|
        item_code = row['item_code']
        item_name = row['item_name']&.gsub("'", "\\\\'")
        supplier_name = row['supplier_name']&.gsub("'", "\\\\'")
        category = row['category']&.gsub("'", "\\\\'")
        brand = row['brand']&.gsub("'", "\\\\'")
        notes = row['notes']&.gsub("'", "\\\\'")
        current_price = row['current_price'].present? && !row['current_price'].empty? ? row['current_price'] : 'nil'

        f.puts "items['#{item_code}'] = PricebookItem.create!("
        f.puts "  item_code: '#{item_code}',"
        f.puts "  item_name: '#{item_name}',"
        f.puts "  category: #{category.present? ? "'#{category}'" : 'nil'},"
        f.puts "  unit_of_measure: '#{row['unit_of_measure']}',"
        f.puts "  current_price: #{current_price},"
        f.puts "  supplier: #{supplier_name.present? ? "suppliers['#{supplier_name}']" : 'nil'},"
        f.puts "  brand: #{brand.present? ? "'#{brand}'" : 'nil'},"
        f.puts "  notes: #{notes.present? ? "'#{notes}'" : 'nil'},"
        f.puts "  is_active: #{row['is_active']},"
        f.puts "  needs_pricing_review: #{row['needs_pricing_review']},"
        f.puts "  price_last_updated_at: #{row['price_last_updated_at'].present? ? "Time.parse('#{row['price_last_updated_at']}')" : 'nil'}"
        f.puts ")"
        f.puts ""
      end

      f.puts "puts \"  ✓ Created \#{PricebookItem.count} price book items\""
      f.puts ""
      f.puts "# Create price histories"
      f.puts "puts 'Creating price histories...'"
      f.puts ""

      # Read and write price histories
      CSV.foreach(history_file, headers: true) do |row|
        item_code = row['item_code']
        supplier_name = row['supplier_name']&.gsub("'", "\\\\'")
        old_price = row['old_price'].present? && !row['old_price'].empty? ? row['old_price'] : 'nil'
        new_price = row['new_price'].present? && !row['new_price'].empty? ? row['new_price'] : 'nil'

        f.puts "PriceHistory.create!("
        f.puts "  pricebook_item: items['#{item_code}'],"
        f.puts "  old_price: #{old_price},"
        f.puts "  new_price: #{new_price},"
        f.puts "  change_reason: '#{row['change_reason']}',"
        f.puts "  supplier: #{supplier_name.present? ? "suppliers['#{supplier_name}']" : 'nil'},"
        f.puts "  quote_reference: '#{row['quote_reference']}',"
        f.puts "  created_at: Time.parse('#{row['created_at']}')"
        f.puts ")"
        f.puts ""
      end

      f.puts "puts \"  ✓ Created \#{PriceHistory.count} price histories\""
      f.puts ""
      f.puts "puts ''"
      f.puts "puts 'Price Book seed complete!'"
      f.puts "puts \"Suppliers: \#{Supplier.count}\""
      f.puts "puts \"Items: \#{PricebookItem.count}\""
      f.puts "puts \"Histories: \#{PriceHistory.count}\""
    end

    puts "Generated seed file: #{output_file}"
    puts "File size: #{File.size(output_file) / 1024}KB"
    puts ""
    puts "To run locally:"
    puts "  bundle exec rails runner db/seeds_pricebook.rb"
    puts ""
    puts "To run on production:"
    puts "  heroku run rails runner db/seeds_pricebook.rb --app trapid-backend"
  end
end
