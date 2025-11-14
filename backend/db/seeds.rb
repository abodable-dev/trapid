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
  '#WindowActuator', '#WindowsLintels', '#WirShelves', '#WireTie', '#ZbarSales'
]

# Non-# prefixed local variables
non_hash_variables = [
  'ACSPLITS', 'ALFRESCO', 'Alfresco', 'AlfrescoArea', 'Alfresco_Area', 'AllWallTilesM2', 'AllWallTiles_M2', 'Appliances', 'Architraves', 'Automations',
  'AxonLm', 'Axon_Lm', 'BASIC_CEILING', 'Back_To_Wall_Toilet', 'Balcony', 'BalconyArea', 'Balcony_Area', 'BasinMixer', 'Basin_Mixer', 'Basin_paco',
  'BathFloorTilesM2', 'BathFloorTiles_M2', 'BathWallTilesM2', 'BathWallTiles_M2', 'BlindAutomation', 'Blinds', 'Bottles', 'Bottom_Slab', 'Bricks', 'BricksLM',
  'BricksLm', 'Bricks_Lm', 'Bulkhead', 'Butlers_bench', 'Canopy', 'Care_single_bowl', 'CarpetM2', 'Carpet_M2', 'CaulkingLm', 'Caulking_Lm',
  'Cavity', 'CavitySlider1020', 'CavitySlider720', 'CavitySlider820', 'CavitySlider870', 'CavitySlider920', 'CeilDecimals', 'CeilingFan', 'CeilingHeight', 'CeilingInsulation',
  'Ceiling_R1_5', 'Ceiling_R2_5', 'Ceiling_R3', 'Ceiling_R5', 'CementExternalCorners', 'CementExternalCorners1', 'CementInternalCorners', 'CementInternalCorners1', 'CementSheetGableM2', 'CementSheetLm',
  'CementSheet_GableM2', 'CementSheet_Lm', 'Cladding', 'CladdingLm', 'Cladding_Lm', 'Closest_Mass', 'Completed', 'Concrete', 'ConcreteM2', 'Concrete_M2',
  'Contains', 'Cooktop', 'Cooktop_Width', 'Cooktops', 'Courtyard', 'Covercrete', 'CovercreteM2', 'Covercrete_M2', 'Cupboard', 'CupboardShelvingLM',
  'CupboardShelvingLM1', 'DGPO', 'DRAWERS', 'DataPoints', 'Decimals', 'Default', 'DefaultValue', 'DeskTopsm2', 'DeskTopsm21', 'DgpoUSB',
  'DisabledBasins', 'DisabledShower', 'DisabledToilets', 'Disabled_WC', 'Dishwasher', 'Dishwashers', 'DoorBool', 'DoorBool2', 'DoorFurniture', 'DoorOpenerExt',
  'DoorOpenerInt', 'DoorSize', 'Doors', 'Doors1820', 'Doors2040', 'Doors2340', 'Doors2740', 'DoubleGPO', 'DoubleSpotlights', 'DoubleSpotlightsSensor',
  'DoubleTowelRail', 'DoubleWGPO', 'Downlights', 'Downpipe', 'Downpipes', 'DownpipesQTY', 'Downstairs', 'Drain', 'Drains', 'Drawers',
  'DrawersAppliance', 'DrawersAppliance1', 'DuctedAC', 'ENTRY', 'EX_RES_', 'Ensuite', 'EnsuiteFloorTilesM2', 'EnsuiteWallTilesM2', 'Ensuite_FloorTilesM2', 'Ensuite_WallTilesM2',
  'Excavation', 'ExhaustFan', 'ExhaustFans', 'ExhaustFans1', 'External', 'ExternalCorner', 'ExternalCorners', 'ExternalCorners1', 'ExternalDoors', 'ExternalDoorsWet',
  'ExternalWallLights', 'External_Door', 'External_Walls', 'External_Walls_Heigh', 'External_Walls_Perimeter', 'External_Walls_m2', 'FCM2', 'FC_M2', 'FCQTY', 'FC_QTY',
  'FALSE', 'FALSE_17_E81881F5469A5F5A0CCE3E8585E0472C', 'FRIDGE', 'FX_COVE_LIGHT', 'FX_FAN_LIGHT', 'FX_PEND_LIGHT', 'FanLights', 'FanLights1', 'FirstUndoCount', 'FloorBoards',
  'FloorLamp', 'FloorTiles', 'FloorTilesM2', 'FloorTiles_M2', 'Floors', 'For_tiling', 'Footing', 'FootingM3', 'Footing_M3', 'Freezer',
  'Fridge', 'Fridges', 'Furniture', 'GARAGE', 'GAS_HOT_WATER', 'GENERAL_CEILING', 'GPO', 'GYM', 'Gable', 'GableM2',
  'GableTotM2', 'Gable_Area_M2', 'Gable_M2', 'Garage', 'Garages', 'GasHWS', 'GasMeterBox', 'GasPoint', 'GasPoints', 'GasPoints1',
  'GasRange', 'Glazing_qty', 'GroundFloor', 'Gutter', 'Gutters', 'HRG', 'HYDRONIC', 'HWC', 'HWC_Qty', 'HWC_qty',
  'HWS', 'HandRails', 'HeatedTowelRails', 'Hinges1020', 'Hinges620', 'Hinges720', 'Hinges820', 'Hinges870', 'Hinges920', 'Hobless_Shower',
  'IncludeDrains', 'InsetBaths', 'InsideLintels', 'Insulation', 'InternalCorner', 'InternalCorners', 'InternalCorners1', 'InternalDoors', 'InternalWallLights', 'Internal_Walls',
  'Internal_Walls_Heigh', 'Internal_Walls_Perimeter', 'Internal_Walls_m2', 'KitchenFloorTilesM2', 'KitchenSink', 'KitchenWallTilesM2', 'Kitchen_FloorTilesM2', 'Kitchen_WallTilesM2', 'LIBRARY', 'LIFT',
  'LIVING_DINING', 'LEFT_HAND_DOORS', 'LH1020', 'LH1020Doors', 'LH112JAMBS', 'LH2340112JAMBS', 'LH241020Doors', 'LH24620Doors', 'LH24720Doors', 'LH24820Doors',
  'LH24870Doors', 'LH24920Doors', 'LH24LO1020Doors', 'LH620', 'LH620Doors', 'LH720', 'LH720Doors', 'LH820', 'LH820Doors', 'LH820GarageDoors',
  'LH870', 'LH870Doors', 'LH920', 'LH920Doors', 'LHCareKitchenSink', 'LHDoors', 'LHGrabRail', 'LHKitchenSink', 'LHLO1020Doors', 'LHLO24720Doors',
  'LHLO24820Doors', 'LHLO24870Doors', 'LHLO24920Doors', 'LHLO720Doors', 'LHLO820Doors', 'LHLO870Doors', 'LHLO920Doors', 'LaundryFloorTilesM2', 'LaundryWallTilesM2', 'Laundry_FloorTilesM2',
  'Laundry_WallTilesM2', 'LdyTubs', 'LightPoints', 'Lights', 'LightsQty', 'Lights_Qty', 'Lintel', 'Lintels', 'Locks1020', 'Locks620',
  'Locks720', 'Locks820', 'Locks870', 'Locks920', 'LoungeArea', 'Lounge_Area', 'MAIN_SWITCH', 'MBSuite', 'MEDIA', 'MICROCAVE',
  'MICROWAVE', 'MIRROR', 'MB_FloorTilesM2', 'MB_WallTilesM2', 'MasterBedroom', 'MediaRoom', 'MeshSquaresSales', 'Microwave', 'Microwaves', 'MultiFunctOven',
  'MultiFunctOven1', 'NDISDoubleGPO', 'NDISDoubleGPOUSB', 'NDISSingleGPO', 'NTRLSHADE', 'NdisRollInRobes', 'NotificationText', 'OOARobe', 'OVEN', 'Openings',
  'OutletBoxes', 'OutletBoxesM2', 'OutletBoxes_M2', 'PATIO', 'PEND_QTY', 'PORCH', 'PSGDR', 'PWRRM', 'PassageHandles', 'Passage_Hinges',
  'Passage_Hinges1', 'Passage_Locks', 'Passage_Locks1', 'Patio', 'PatioArea', 'Patio_Area', 'Pavilion', 'Pavilions', 'PavilionsArea', 'Pavilions_Area',
  'Pendant', 'PendantQty', 'Pendant_Qty', 'Pendants', 'Penetrations', 'Perimeter', 'PhonePoints', 'Piers', 'PiersQTY', 'PiersQty',
  'Piers_QTY', 'Piers_Qty', 'Plinths', 'PowderFloorTilesM2', 'PowderWallTilesM2', 'Powder_FloorTilesM2', 'Powder_WallTilesM2', 'PowerPoints', 'PowrOutlet', 'PrivacyHandles',
  'Privacy_Hinges', 'Privacy_Locks', 'Privacy_Locks1', 'Qty_Downpipes', 'R1_5', 'R2_5', 'R3', 'R5', 'RANGEHOOD',
  'RH1020', 'RH1020Doors', 'RH112JAMBS', 'RH2340112JAMBS', 'RH241020Doors', 'RH24620Doors', 'RH24720Doors', 'RH24820Doors', 'RH24870Doors', 'RH24920Doors',
  'RH620', 'RH620Doors', 'RH720', 'RH720Doors', 'RH820', 'RH820Doors', 'RH820GarageDoors', 'RH870', 'RH870Doors', 'RH920',
  'RH920Doors', 'RHCareKitchenSink', 'RHDoors', 'RHGrabRail', 'RHKitchenSink', 'RHLO1020Doors', 'RHLO241020Doors', 'RHLO24720Doors', 'RHLO24820Doors', 'RHLO24870Doors',
  'RHLO24920Doors', 'RHLO720Doors', 'RHLO820Doors', 'RHLO870Doors', 'RHLO920Doors', 'RIGHT_HAND_DOORS', 'RMPUS', 'ROBE', 'STUDY', 'Rangehood',
  'Rangehoods', 'RecessedVanityBasins', 'Reveal', 'RevealLm', 'Reveal_Lm', 'RobeCount', 'RobeDoors', 'RobePosts', 'RobeShelvingLM', 'RobeShelvingLM1',
  'Robes', 'RockHanging', 'Rocks', 'RoomName', 'SALARY', 'SERVERY', 'SINK', 'SITTING', 'SHED', 'SHWR',
  'SINGLE_BASIN', 'STAIRS', 'STOREAGE', 'SCOOP', 'SPLT', 'Sarking', 'SarkingM2', 'Sarking_M2', 'Sensors', 'Shelves',
  'Shower', 'ShowerRails', 'ShowerScreen', 'ShowerScreenLM', 'ShowerScreenLm', 'ShowerScreen_LM', 'ShowerScreen_Lm', 'Showers', 'Silicone_Shower_Qty', 'Sill_Flush',
  'SingleBasin', 'SingleGPO', 'SingleGPORoof', 'SingleSpotlights', 'SingleSpotlightsSensor', 'SingleWGPO', 'SinkMixer', 'Sinks', 'Skirting', 'SkirtingLM',
  'SkirtingLM1', 'SkirtingLm', 'Skirting_LM', 'Skirting_Lm', 'SlabArea', 'SlabArea1', 'SlabGroundSpacersSales', 'Slab_Base', 'Slab_Qty', 'Slab_Thickener',
  'Slab_Thickener_Qty', 'SmokeDet', 'SmokeDetectors', 'SolarPanels', 'SplashbackLm', 'Splashback_Lm', 'Splashback_Qty', 'SplitSystemQty', 'Split_System_Qty', 'Spotlight',
  'SpotlightQty', 'Spotlights', 'Spotlights1', 'Spotlight_Qty', 'StairDecimals', 'StairRiseTread', 'StairsRiser', 'StairsTread', 'StairswayDecimals', 'StairswayWidth',
  'StandAloneTubs', 'StepBeam', 'StepBeamLM', 'StepBeamLm', 'StepBeam_LM', 'StepBeam_Lm', 'StoneBenchLM', 'StoneBenchLm', 'StoneBench_LM', 'StoneBench_Lm',
  'StorageArea', 'Storage_Area', 'SuperValue', 'TVPoints', 'THEATRE', 'TOILET', 'TRUE', 'TapeSlab', 'Tiles', 'TilesM2',
  'Tiles_M2', 'ToiletRollHolders', 'Toilets', 'TotalGableArea', 'TotalWallArea', 'TotalWallLength', 'TotalWallTilesM2', 'TotalWallTiles_M2', 'TotalWindowsLintels', 'TotalnM2',
  'TrenchMesh3TM', 'TrenchMeshSupportSales', 'Truss_M2', 'Undercroft', 'UndercroftArea', 'Undercroft_Area', 'UndermountSink', 'Upstairs', 'VanityBasins', 'Vanity_Tops',
  'Verandah', 'VerandahArea', 'Verandah_Area', 'WC_Qty', 'WETBAR', 'WINDOWS', 'WINEPANTRY', 'WIR', 'WMSinks', 'WRCQTY',
  'WRQTY', 'WWS', 'WallHeight', 'WallLength', 'WallMountedBasin', 'WallOvenCab', 'WallTiles', 'WallTilesM2', 'WallTiles_M2', 'Wall_Mixer',
  'Wall_Oven', 'Wall_height', 'Wardrobe', 'Watertank', 'Watertank10000L', 'Watertank2000L', 'Watertank3000L', 'Watertank4000L', 'Watertank5000L', 'Watertank_Type',
  'WcWallTiles_M2', 'WeatherboardGableM2', 'Weatherboard_GableM2', 'WetAreaM2', 'WetArea_M2', 'WetSealLM', 'WetSeal_LM', 'Window', 'WindowActuator', 'WindowSales',
  'WindowsLintels', 'Windows_', 'WirShelves', 'Wr_Qty', 'Wrc_Qty'
]

# Combine all variables
all_variables = variables + non_hash_variables

all_variables.each do |variable_name|
  UnrealVariable.find_or_create_by!(variable_name: variable_name) do |var|
    var.claude_value = 0
  end
end

puts "Created #{UnrealVariable.count} unreal variables"
puts "  - Variables with #: #{variables.length}"
puts "  - Variables without #: #{non_hash_variables.length}"
puts "Unreal Variables seed complete!"
