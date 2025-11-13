namespace :sam_quick_est do
  desc "Copy honeycomb items from pricebook to Sam Quick Est"
  task copy_honeycomb: :environment do
    puts "Searching for items with 'honeycomb' in item_name..."

    honeycomb_items = PricebookItem.active.where('LOWER(item_name) LIKE ?', '%honeycomb%')

    puts "Found #{honeycomb_items.count} honeycomb items in pricebook"

    if honeycomb_items.count == 0
      puts "No honeycomb items found. Exiting."
      exit 0
    end

    puts "\nStarting copy process..."

    copied = 0
    skipped = 0
    errors = []

    honeycomb_items.find_each.with_index do |item, index|
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

        # Progress indicator every 10 items
        if (index + 1) % 10 == 0
          print "."
        end

        # Progress summary every 100 items
        if (index + 1) % 100 == 0
          puts " #{index + 1}/#{honeycomb_items.count}"
        end

      rescue => e
        errors << {
          item_code: item.item_code,
          item_name: item.item_name,
          error: e.message
        }
      end
    end

    puts "\n\n" + "="*60
    puts "COPY COMPLETE"
    puts "="*60
    puts "  Successfully copied: #{copied} items"
    puts "  Skipped (already exist): #{skipped} items"
    puts "  Errors: #{errors.count}"
    puts ""
    puts "  Sam Quick Est now has #{SamQuickEstItem.active.count} total items"
    puts "="*60

    if errors.any?
      puts "\nErrors encountered:"
      errors.first(10).each do |err|
        puts "  - #{err[:item_code]}: #{err[:error]}"
      end
      if errors.count > 10
        puts "  ... and #{errors.count - 10} more errors"
      end
    end

    puts "\nDone!"
  end
end
