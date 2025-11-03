namespace :pricebook do
  desc "Import price book items from CSV file"
  task :import, [:file_path] => :environment do |t, args|
    require 'csv'

    # Default to the cleaned CSV in db directory
    file_path = args[:file_path] || File.join(Rails.root, 'db', 'pricebook_cleaned.csv')

    unless File.exist?(file_path)
      puts "Error: File not found at #{file_path}"
      exit 1
    end

    puts "="*60
    puts "Price Book Import"
    puts "="*60
    puts "File: #{file_path}"
    puts "Current database: #{PricebookItem.count} items, #{Supplier.count} suppliers"
    puts ""

    # Run import
    service = PricebookImportService.new(file_path, {
      skip_missing_prices: false,
      create_suppliers: true,
      create_categories: true,
      update_existing: ENV['UPDATE_EXISTING'] == 'true'
    })

    puts "Starting import..."
    result = service.import

    puts ""
    puts "="*60
    puts "Import Results"
    puts "="*60
    puts "Success: #{result[:success] ? '✓' : '✗'}"
    puts ""
    puts "Statistics:"
    puts "  Total rows processed: #{result[:stats][:total_rows]}"
    puts "  Items imported: #{result[:stats][:imported_count]}"
    puts "  Items updated: #{result[:stats][:updated_count]}"
    puts "  Items skipped: #{result[:stats][:skipped_count]}"
    puts "  Errors: #{result[:stats][:error_count]}"
    puts "  Suppliers created: #{result[:stats][:suppliers_created]}"
    puts "  Categories found: #{result[:stats][:categories_created]}"
    puts ""

    if result[:errors].any?
      puts "Errors (first 10):"
      result[:errors].first(10).each do |error|
        puts "  Row #{error[:row]} (#{error[:item_code]}): #{error[:error]}"
      end
      puts ""
    end

    if result[:warnings].any?
      puts "Warnings (first 10 of #{result[:warnings].length}):"
      result[:warnings].first(10).each { |w| puts "  #{w}" }
      puts ""
    end

    puts "Final database: #{PricebookItem.count} items, #{Supplier.count} suppliers"
    puts "="*60
  end

  desc "Show price book statistics"
  task stats: :environment do
    puts "="*60
    puts "Price Book Statistics"
    puts "="*60
    puts "Total items: #{PricebookItem.count}"
    puts "Active items: #{PricebookItem.active.count}"
    puts "Items needing pricing: #{PricebookItem.needs_pricing.count}"
    puts ""
    puts "Categories (#{PricebookItem.categories.length}):"
    PricebookItem.categories.each do |category|
      count = PricebookItem.by_category(category).count
      puts "  #{category}: #{count}"
    end
    puts ""
    puts "Suppliers (#{Supplier.count}):"
    Supplier.order(:name).limit(20).each do |supplier|
      count = supplier.pricebook_items.count
      puts "  #{supplier.name}: #{count} items"
    end
    if Supplier.count > 20
      puts "  ... and #{Supplier.count - 20} more"
    end
    puts "="*60
  end

  desc "Clear all price book data (use with caution!)"
  task clear: :environment do
    print "Are you sure you want to delete all price book data? (yes/no): "
    confirmation = STDIN.gets.chomp

    if confirmation.downcase == 'yes'
      puts "Deleting all price book data..."
      PricebookItem.delete_all
      PriceHistory.delete_all
      Supplier.delete_all
      puts "Done. Database cleared."
    else
      puts "Cancelled."
    end
  end
end
