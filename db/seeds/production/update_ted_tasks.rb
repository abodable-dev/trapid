require 'csv'

# Update purchase orders with ted_task values from CSV
puts "🔄 Updating PO ted_task fields from CSV..."

# Find the CSV file
csv_path = if File.exist?(Rails.root.join('easybuildapp development Purchase Orders-3.csv'))
  Rails.root.join('easybuildapp development Purchase Orders-3.csv')
else
  Rails.root.join('..', 'easybuildapp development Purchase Orders-3.csv')
end

unless File.exist?(csv_path)
  puts "❌ CSV file not found"
  exit
end

# Parse CSV and update POs
csv_data = CSV.read(csv_path, headers: true)
updated_count = 0

csv_data.each do |row|
  next if row['purchase_order_number'].blank?

  po = PurchaseOrder.find_by(purchase_order_number: row['purchase_order_number'])
  next unless po

  ted_task = row['ted_task']
  next if ted_task.blank?

  po.update_column(:ted_task, ted_task)
  updated_count += 1
  print "." if updated_count % 10 == 0
end

puts ""
puts "✅ Updated #{updated_count} POs with ted_task values"
