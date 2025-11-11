namespace :constructions do
  desc "Backfill live_profit and profit_percentage for all constructions"
  task backfill_profits: :environment do
    puts "Backfilling profit calculations for all constructions..."
    puts "=" * 50

    total = Construction.count
    updated = 0

    Construction.find_each.with_index do |construction, index|
      old_profit = construction.read_attribute(:live_profit)
      old_percentage = construction.read_attribute(:profit_percentage)

      construction.calculate_and_update_profit!

      new_profit = construction.read_attribute(:live_profit)
      new_percentage = construction.read_attribute(:profit_percentage)

      if old_profit != new_profit || old_percentage != new_percentage
        puts "Updated: #{construction.title}"
        puts "  Profit: $#{old_profit} -> $#{new_profit}"
        puts "  Percentage: #{old_percentage}% -> #{new_percentage}%"
        updated += 1
      end

      print "\rProcessed: #{index + 1}/#{total}" if (index + 1) % 10 == 0
    end

    puts "\n" + "=" * 50
    puts "Completed! Updated #{updated} out of #{total} constructions."
  end
end
