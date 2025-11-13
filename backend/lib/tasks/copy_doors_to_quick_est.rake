namespace :sam_quick_est do
  desc "Copy internal door items from pricebook to Sam Quick Est"
  task copy_internal_doors: :environment do
    # Search patterns for internal doors
    door_patterns = [
      '%internal%door%',
      '%door%internal%',
      '%interior%door%',
      '%door%interior%'
    ]

    # Find items by category or name
    door_items = PricebookItem.active.where(
      door_patterns.map { |pattern|
        "LOWER(category) LIKE '#{pattern}' OR LOWER(item_name) LIKE '#{pattern}'"
      }.join(' OR ')
    )

    puts "Found #{door_items.count} internal door items in pricebook"

    if door_items.count == 0
      puts "\nSearching all items with 'door' in name or category..."
      door_items = PricebookItem.active.where(
        "LOWER(category) LIKE ? OR LOWER(item_name) LIKE ?",
        '%door%', '%door%'
      )
      puts "Found #{door_items.count} door-related items"

      # Show categories for review
      if door_items.any?
        puts "\nCategories found:"
        door_items.pluck(:category).compact.uniq.sort.each do |cat|
          count = door_items.where(category: cat).count
          puts "  - #{cat} (#{count} items)"
        end
      end
    end

    return if door_items.count == 0

    puts "\nCopying items to Sam Quick Est..."

    copied = 0
    skipped = 0
    errors = []

    door_items.find_each do |item|
      begin
        # Check if item already exists in Sam Quick Est
        existing = SamQuickEstItem.find_by(item_code: item.item_code)

        if existing
          skipped += 1
          next
        end

        # Copy the item
        SamQuickEstItem.create!(
          item_code: item.item_code,
          item_name: item.item_name,
          category: item.category,
          unit_of_measure: item.unit_of_measure,
          current_price: item.current_price,
          supplier_id: item.supplier_id,
          default_supplier_id: item.default_supplier_id,
          brand: item.brand,
          notes: item.notes,
          price_last_updated_at: item.price_last_updated_at,
          image_url: item.image_url,
          image_source: item.image_source,
          image_fetched_at: item.image_fetched_at,
          image_fetch_status: item.image_fetch_status,
          qr_code_url: item.qr_code_url,
          requires_photo: item.requires_photo,
          requires_spec: item.requires_spec,
          spec_url: item.spec_url,
          gst_code: item.gst_code,
          photo_attached: item.photo_attached,
          spec_attached: item.spec_attached,
          image_file_id: item.image_file_id,
          spec_file_id: item.spec_file_id,
          qr_code_file_id: item.qr_code_file_id,
          is_active: true,
          needs_pricing_review: item.needs_pricing_review
        )

        copied += 1
        print "." if copied % 10 == 0
      rescue => e
        errors << "#{item.item_code}: #{e.message}"
      end
    end

    puts "\n\nSummary:"
    puts "  Copied: #{copied} items"
    puts "  Skipped (already exist): #{skipped} items"
    puts "  Errors: #{errors.count}"

    if errors.any?
      puts "\nErrors:"
      errors.first(10).each { |error| puts "  - #{error}" }
      puts "  ... and #{errors.count - 10} more" if errors.count > 10
    end

    puts "\nDone! Sam Quick Est now has #{SamQuickEstItem.active.count} items."
  end

  desc "Copy specific categories from pricebook to Sam Quick Est"
  task :copy_by_category, [:categories] => :environment do |t, args|
    categories = args[:categories].split(',').map(&:strip)

    puts "Copying items from categories: #{categories.join(', ')}"

    items = PricebookItem.active.where(category: categories)
    puts "Found #{items.count} items"

    return if items.count == 0

    copied = 0
    skipped = 0

    items.find_each do |item|
      existing = SamQuickEstItem.find_by(item_code: item.item_code)

      if existing
        skipped += 1
        next
      end

      SamQuickEstItem.create!(
        item_code: item.item_code,
        item_name: item.item_name,
        category: item.category,
        unit_of_measure: item.unit_of_measure,
        current_price: item.current_price,
        supplier_id: item.supplier_id,
        default_supplier_id: item.default_supplier_id,
        brand: item.brand,
        notes: item.notes,
        price_last_updated_at: item.price_last_updated_at,
        is_active: true
      )

      copied += 1
    end

    puts "\nCopied: #{copied} items"
    puts "Skipped: #{skipped} items"
  end
end
