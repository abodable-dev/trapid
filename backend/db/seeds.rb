# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

require 'csv'

puts "Clearing existing construction data..."
Construction.delete_all

puts "Loading construction data from CSV..."

csv_file = File.join(Rails.root, 'db', 'easybuildapp_constructions.csv')

if File.exist?(csv_file)
  csv_text = File.read(csv_file)
  csv_data = CSV.parse(csv_text, headers: true)
  
  csv_data.each do |row|
    Construction.create!(
      title: row['title'],
      contract_value: row['contract_value'].to_f,
      live_profit: row['live_profit'].to_f,
      profit_percentage: row['live'].to_f,
      stage: 'In Progress',
      status: row['status'] || 'Active',
      ted_number: row['ted_number'],
      certifier_job_no: row['certifier_job_no'],
      start_date: row['start_date'].present? ? Date.parse(row['start_date']) : nil
    )
  end
  
  puts "Successfully loaded #{Construction.count} construction records!"
else
  puts "CSV file not found at #{csv_file}"
  puts "Creating sample construction data instead..."
  
  Construction.create!([
    {
      title: "Lot 2 (36) Bowen Road, GLASSHOUSE MOUNTAINS, QLD",
      contract_value: 2398420.00,
      live_profit: 6028.38,
      profit_percentage: 0.28,
      stage: "In Progress",
      status: "Active",
      ted_number: "46 - 79 - 38",
      certifier_job_no: "20244262"
    },
    {
      title: "Lot 513 Hickory Street, GLENEAGLE, QLD",
      contract_value: 375050.00,
      live_profit: -351253.67,
      profit_percentage: -2060.41,
      stage: "Review",
      status: "Active",
      ted_number: "83 - 118 - 50"
    },
    {
      title: "Lot 1 (34) Tristania Street, CORNUBIA, QLD",
      contract_value: 363000.00,
      live_profit: 16820.03,
      profit_percentage: 4.99,
      stage: "Construction",
      status: "Active",
      ted_number: "81 - 116 - 52",
      certifier_job_no: nil
    }
  ])
  
  puts "Created #{Construction.count} sample construction records!"
end

puts "Seed data loaded successfully!"

# Price Book Seed Data
puts "\n" + "="*50
puts "Seeding Price Book data..."

# Create suppliers
tl_supplier = Supplier.find_or_create_by!(name: "TL") do |s|
  s.contact_person = "John Smith"
  s.email = "john@tlsupply.com.au"
  s.phone = "1300 123 456"
  s.rating = 4
  s.response_rate = 85.5
  s.avg_response_time = 24
  s.notes = "Reliable electrical supplier"
end

bunnings = Supplier.find_or_create_by!(name: "Bunnings") do |s|
  s.contact_person = "Trade Desk"
  s.email = "trade@bunnings.com.au"
  s.phone = "1300 BUNNINGS"
  s.rating = 5
  s.response_rate = 95.0
  s.avg_response_time = 12
end

reece = Supplier.find_or_create_by!(name: "Reece Plumbing") do |s|
  s.contact_person = "Sarah Johnson"
  s.email = "sarah@reece.com.au"
  s.phone = "1300 REECE"
  s.rating = 5
  s.response_rate = 90.0
  s.avg_response_time = 18
  s.notes = "Premium plumbing supplies"
end

puts "Created #{Supplier.count} suppliers"

# Create electrical items
electrical_items = [
  { item_code: "DPP", item_name: "Wiring Double Power Point", category: "Electrical", current_price: 51.00, supplier: tl_supplier, unit_of_measure: "Each" },
  { item_code: "SPP", item_name: "Wiring Single Power Point", category: "Electrical", current_price: 50.00, supplier: tl_supplier, unit_of_measure: "Each" },
  { item_code: "ODPP", item_name: "Waterproof Double Power Point", category: "Electrical", current_price: 69.00, supplier: tl_supplier, unit_of_measure: "Each" },
  { item_code: "WEF", item_name: "Wiring Exhaust Fan", category: "Electrical", current_price: nil, supplier: nil, unit_of_measure: "Each", needs_pricing_review: true },
  { item_code: "WLP", item_name: "Wiring Light Point", category: "Electrical", current_price: 45.00, supplier: tl_supplier, unit_of_measure: "Each" },
  { item_code: "LED-DOWN", item_name: "LED Downlight 90mm", category: "Electrical", current_price: 12.50, supplier: bunnings, unit_of_measure: "Each", brand: "Brilliant" },
]

electrical_items.each do |item_data|
  PricebookItem.find_or_create_by!(item_code: item_data[:item_code]) do |item|
    item.assign_attributes(item_data)
  end
end

# Create plumbing items
plumbing_items = [
  { item_code: "TAP-KIT", item_name: "Kitchen Mixer Tap", category: "Plumbing", current_price: 285.00, supplier: reece, unit_of_measure: "Each", brand: "Phoenix" },
  { item_code: "TOILET-STD", item_name: "Standard Toilet Suite", category: "Plumbing", current_price: 395.00, supplier: reece, unit_of_measure: "Each", brand: "Caroma" },
  { item_code: "SHOWER-HEAD", item_name: "Rain Shower Head 250mm", category: "Plumbing", current_price: 165.00, supplier: reece, unit_of_measure: "Each", brand: "Methven" },
]

plumbing_items.each do |item_data|
  PricebookItem.find_or_create_by!(item_code: item_data[:item_code]) do |item|
    item.assign_attributes(item_data)
  end
end

# Create carpentry items
carpentry_items = [
  { item_code: "TIMBER-90x45", item_name: "Pine Framing Timber 90x45mm", category: "Carpentry", current_price: 8.50, supplier: bunnings, unit_of_measure: "Linear Metre", brand: "Treated Pine" },
  { item_code: "PLYWOOD-17", item_name: "Structural Plywood 17mm", category: "Carpentry", current_price: 65.00, supplier: bunnings, unit_of_measure: "Sheet" },
  { item_code: "DOOR-STD", item_name: "Standard Internal Door 2040x820mm", category: "Carpentry", current_price: 125.00, supplier: bunnings, unit_of_measure: "Each", brand: "Corinthian" },
]

carpentry_items.each do |item_data|
  PricebookItem.find_or_create_by!(item_code: item_data[:item_code]) do |item|
    item.assign_attributes(item_data)
  end
end

puts "Created #{PricebookItem.count} price book items"
puts "Items by category:"
PricebookItem.categories.each do |category|
  count = PricebookItem.by_category(category).count
  puts "  - #{category}: #{count}"
end
puts "Items needing pricing review: #{PricebookItem.needs_pricing.count}"
puts "Price Book seed complete!"

# Designs Seed Data
puts "\n" + "="*50
puts "Seeding Designs library..."

designs_data = [
  {
    name: "The Hampton 250",
    size: 250.0,
    frontage_required: 12.5,
    description: "Classic family home with 4 bedrooms, 2 bathrooms. Open plan living with modern kitchen.",
    floor_plan_url: nil,
    is_active: true
  },
  {
    name: "The Madison 280",
    size: 280.0,
    frontage_required: 14.0,
    description: "Spacious 4 bedroom home with master suite, media room, and generous outdoor alfresco.",
    floor_plan_url: nil,
    is_active: true
  },
  {
    name: "The Riverside 320",
    size: 320.0,
    frontage_required: 16.0,
    description: "Executive home with 5 bedrooms, 3 bathrooms, home office, and large entertaining areas.",
    floor_plan_url: nil,
    is_active: true
  },
  {
    name: "The Coastal 210",
    size: 210.0,
    frontage_required: 11.0,
    description: "Compact yet functional 3 bedroom home perfect for narrow blocks. Light and airy design.",
    floor_plan_url: nil,
    is_active: true
  },
  {
    name: "The Parkview 380",
    size: 380.0,
    frontage_required: 18.0,
    description: "Luxury double-storey design with 5 bedrooms, 4 bathrooms, theatre room, and grand living spaces.",
    floor_plan_url: nil,
    is_active: true
  }
]

designs_data.each do |design_data|
  Design.find_or_create_by!(name: design_data[:name]) do |design|
    design.assign_attributes(design_data)
  end
end

puts "Created #{Design.count} designs"
puts "Designs seed complete!"

# Folder Templates Seed Data
puts "\n" + "="*50
puts "Seeding Folder Templates..."

FolderTemplate.seed_defaults

puts "Created #{FolderTemplate.count} folder templates"
puts "Folder Templates seed complete!"

# Unreal Variables Seed Data
puts "\n" + "="*50
puts "Seeding Unreal Variables..."

variables = [
  '#AC25', '#AC35', '#AC5', '#AC6', '#AC71', '#ACSPLITS', '#AdjustableBench', '#Basin_Mixer',
  '#Bath', '#BlackPlastic', '#BlindAutomation', '#CeilingFan', '#Cooktops', '#CornerbarSales',
  '#DGPOUSB', '#DataPoints', '#DbarSales', '#DisabledBasins', '#DisabledShower', '#DisabledToilets',
  '#Dishwashers', '#DoorOpenerEXT', '#DoorOpenerINT', '#DoubleGPO', '#DoubleWGPO', '#DoubleSpotlights',
  '#DoubleSpotlightsSensor', '#DoubleTowelRail', '#Downlights', '#Downpipes', '#Drains', '#Drawers',
  '#ExhaustFans', '#ExtCeilingFan', '#ExtWallLights', '#ExternalDoors', '#ExternalDoorsWet',
  '#ExternalSlabs', '#Fridges', '#Garage', '#Garages', '#GasPoints', '#HRG', '#InsetBaths',
  '#IntWallLights', '#KitchenSink', '#LH1020Doors', '#LH112JAMBS', '#LH2340112JAMBS', '#LH241020Doors',
  '#LH24620Doors', '#LH24720Doors', '#LH24820Doors', '#LH24870Doors', '#LH24920Doors', '#LH24LO1020Doors',
  '#LH620Doors', '#LH720Doors', '#LH820Doors', '#LH820GarageDoors', '#LH870Doors', '#LH920Doors',
  '#LHCareKitchenSink', '#LHDoors', '#LHGrabRail', '#LHKitchenSink', '#LHLO1020Doors', '#LHLO24720Doors',
  '#LHLO24820Doors', '#LHLO24870Doors', '#LHLO24920Doors', '#LHLO720Doors', '#LHLO820Doors',
  '#LHLO870Doors', '#LHLO920Doors', '#LdyTubs', '#MeshSquaresSales', '#Microwaves', '#NDISDoubleGPO',
  '#NDISDoubleGPOUSB', '#NDISSingleGPO', '#NdisRollInRobes', '#OOARobe', '#PassageHandles',
  '#Pendants', '#Penetrations', '#PhonePoints', '#Piers', '#Posts', '#PrivacyHandles', '#RH1020Doors',
  '#RH112JAMBS', '#RH2340112JAMBS', '#RH241020Doors', '#RH24620Doors', '#RH24720Doors', '#RH24820Doors',
  '#RH24870Doors', '#RH24920Doors', '#RH620Doors', '#RH720Doors', '#RH820Doors', '#RH820GarageDoors',
  '#RH870Doors', '#RH920Doors', '#RHCareKitchenSink', '#RHDoors', '#RHGrabRail', '#RHKitchenSink',
  '#RHLO1020Doors', '#RHLO241020Doors', '#RHLO24720Doors', '#RHLO24820Doors', '#RHLO24870Doors',
  '#RHLO24920Doors', '#RHLO720Doors', '#RHLO820Doors', '#RHLO870Doors', '#RHLO920Doors', '#Rangehoods',
  '#RecessedVanityBasins', '#RobePosts', '#Robes', '#Sensors', '#ShowerRails', '#Showers',
  '#SingleGPO', '#SingleGPORoof', '#SingleWGPO', '#SingleSpotlights', '#SingleSpotlightsSensor',
  '#SinkMixer', '#SlabGroundSpacersSales', '#SmokeDetectors', '#SolarPanels', '#StandAloneTubs',
  '#TVPoints', '#TapeSlab', '#ToiletRollHolders', '#Toilets', '#TrenchMesh3TM', '#TrenchMeshSupportSales',
  '#UndermountSink', '#VanityBasins', '#WallMountedBasin', '#WallOvenCab', '#Wall_Mixer', '#Watertank',
  '#Watertank10000L', '#Watertank2000L', '#Watertank3000L', '#Watertank4000L', '#Watertank5000L',
  '#WindowActuator', '#WindowsLintels', '#WirShelves', '#WireTie', '#ZbarSales',
  # Non-# prefixed local variables
  'DuctedAC', 'WRCQTY', 'WRQTY'
]

variables.each do |variable_name|
  UnrealVariable.find_or_create_by!(variable_name: variable_name) do |var|
    var.claude_value = 0
  end
end

puts "Created #{UnrealVariable.count} unreal variables"
puts "Unreal Variables seed complete!"
