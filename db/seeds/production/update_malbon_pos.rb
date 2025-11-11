# Update Malbon Street with all 130 real Purchase Orders
# This replaces the 20 sample POs with the full dataset

puts "🔄 Updating Malbon Street Purchase Orders..."
puts ""

# Find the construction
construction = Construction.find_by(id: 90)
unless construction
  puts "❌ Construction 90 not found"
  exit
end

puts "Found: #{construction.title}"
puts "Current POs: #{construction.purchase_orders.count}"
puts ""

# Clear existing POs for this construction
puts "Clearing existing POs..."
construction.purchase_orders.destroy_all

# Load the PO data
po_data_json = File.read(File.join(__dir__, '../../../tmp/all_pos_export.json'))
po_data = JSON.parse(po_data_json)

puts "Importing #{po_data.count} purchase orders..."
puts ""

imported_count = 0
po_data.each_with_index do |po_info, index|
  # Find or create supplier
  supplier = nil
  if po_info['supplier'].present?
    supplier = Supplier.find_or_create_by!(name: po_info['supplier'])
  end

  # Create PO
  construction.purchase_orders.create!(
    purchase_order_number: po_info['po_number'],
    status: po_info['status'] || 'approved',
    description: po_info['description'],
    supplier: supplier,
    sub_total: po_info['sub_total'] || 0,
    tax: po_info['tax'] || 0,
    total: po_info['total'] || 0,
    task_category: po_info['category'],
    creates_schedule_tasks: po_info['creates_schedule'],
    required_on_site_date: po_info['required_date'] ? Date.parse(po_info['required_date']) : nil
  )

  imported_count += 1
  print "." if (index + 1) % 10 == 0
end

puts ""
puts ""
puts "✅ Import complete!"
puts "  Total POs: #{construction.purchase_orders.count}"
puts "  Schedule POs: #{construction.purchase_orders.where(creates_schedule_tasks: true).count}"
puts "  Total value: $#{construction.purchase_orders.sum(:total).round(2)}"
puts ""

# Regenerate the project schedule with new POs
project = Project.find_by(name: "Malbon Street Master Schedule")
if project
  puts "🔄 Regenerating schedule with all POs..."

  # Clear existing tasks
  project.project_tasks.destroy_all

  # Regenerate
  generator = Schedule::GeneratorService.new(project)
  if generator.generate!
    project.reload

    latest_task = project.project_tasks.order(:planned_end_date).last
    days = latest_task ? (latest_task.planned_end_date - project.start_date).to_i : 0
    weeks = (days / 7.0).round(1)

    puts "✅ Schedule regenerated!"
    puts "  Tasks: #{project.project_tasks.count}"
    puts "  Tasks with POs: #{project.project_tasks.where.not(purchase_order_id: nil).count}"
    puts "  Duration: #{days} days (#{weeks} weeks)"
  else
    puts "❌ Schedule generation failed"
  end
end
