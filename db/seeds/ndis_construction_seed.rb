# NDIS Construction Job Seed
# This creates a complete construction job with all purchase orders ready for schedule generation

puts "🏗️  Seeding NDIS Construction Job..."

# Get or create a user to be the project manager
user = User.first
unless user
  puts "❌ No users found. Please create a user first."
  exit
end

# Create the construction job
construction = Construction.create!(
  title: "NDIS SDA Build - 42 Accessibility Lane, Brisbane QLD",
  status: "Active"
)
puts "✓ Construction created: #{construction.title} (ID: #{construction.id})"

# Define all purchase orders with categories that map to NDIS phases
purchase_orders_data = [
  # ADMIN & APPROVALS PHASE
  {
    number: "PO-NDIS-001",
    description: "Soil Testing & Engineering Reports",
    category: "ADMIN",
    required_date: Date.current + 5.days,
    amount: 2500
  },
  {
    number: "PO-NDIS-002",
    description: "Contour Survey Plan",
    category: "ADMIN",
    required_date: Date.current + 5.days,
    amount: 1800
  },

  # SITE PREPARATION PHASE
  {
    number: "PO-NDIS-003",
    description: "Site Cut & Excavation",
    category: "SITE_PREP",
    required_date: Date.current + 14.days,
    amount: 12000
  },
  {
    number: "PO-NDIS-004",
    description: "Surveyor - Site Setout",
    category: "SURVEYOR",
    required_date: Date.current + 16.days,
    amount: 1500
  },

  # UNDERGROUND SERVICES
  {
    number: "PO-NDIS-005",
    description: "Underground Drainage Installation",
    category: "PLUMBER",
    required_date: Date.current + 18.days,
    amount: 8500
  },
  {
    number: "PO-NDIS-006",
    description: "Underground Electrical & NBN",
    category: "ELECTRICAL",
    required_date: Date.current + 20.days,
    amount: 6500
  },
  {
    number: "PO-NDIS-007",
    description: "Temporary Power Connection",
    category: "ELECTRICAL",
    required_date: Date.current + 22.days,
    amount: 1200
  },

  # SLAB PHASE
  {
    number: "PO-NDIS-008",
    description: "Concrete Slab - Complete Pour",
    category: "CONCRETE",
    required_date: Date.current + 25.days,
    amount: 18500
  },
  {
    number: "PO-NDIS-009",
    description: "Termite Protection - Penetrations",
    category: "TERMITE",
    required_date: Date.current + 26.days,
    amount: 2200
  },
  {
    number: "PO-NDIS-010",
    description: "Slab Edge Waterproofing",
    category: "WATERPROOF",
    required_date: Date.current + 27.days,
    amount: 1500
  },

  # FRAME PHASE
  {
    number: "PO-NDIS-011",
    description: "Frame Hardware & Fixings",
    category: "MATERIALS",
    required_date: Date.current + 30.days,
    amount: 4500
  },
  {
    number: "PO-NDIS-012",
    description: "Timber Frame Materials - Ground Floor",
    category: "MATERIALS",
    required_date: Date.current + 30.days,
    amount: 22000
  },
  {
    number: "PO-NDIS-013",
    description: "Carpenter - Ground Floor Framing",
    category: "CARPENTER",
    required_date: Date.current + 32.days,
    amount: 15000
  },
  {
    number: "PO-NDIS-014",
    description: "Termite Protection - Perimeter",
    category: "TERMITE",
    required_date: Date.current + 35.days,
    amount: 2800
  },
  {
    number: "PO-NDIS-015",
    description: "Roof Trusses - Engineered",
    category: "MATERIALS",
    required_date: Date.current + 37.days,
    amount: 12000
  },
  {
    number: "PO-NDIS-016",
    description: "Crane Hire - Truss Installation",
    category: "EQUIPMENT",
    required_date: Date.current + 38.days,
    amount: 2500
  },
  {
    number: "PO-NDIS-017",
    description: "Steel Posts & Beams",
    category: "MATERIALS",
    required_date: Date.current + 38.days,
    amount: 8500
  },

  # ROOF & EXTERNAL PHASE
  {
    number: "PO-NDIS-018",
    description: "Fascia, Gutter & Colorbond Roofing",
    category: "ROOFING",
    required_date: Date.current + 42.days,
    amount: 18000
  },
  {
    number: "PO-NDIS-019",
    description: "External Doors - NDIS Compliant",
    category: "MATERIALS",
    required_date: Date.current + 45.days,
    amount: 6500
  },
  {
    number: "PO-NDIS-020",
    description: "Windows - Wide Access",
    category: "MATERIALS",
    required_date: Date.current + 45.days,
    amount: 12000
  },
  {
    number: "PO-NDIS-021",
    description: "Window Actuators (Automated)",
    category: "MATERIALS",
    required_date: Date.current + 46.days,
    amount: 4500
  },
  {
    number: "PO-NDIS-022",
    description: "Carpenter - Window & Door Installation",
    category: "CARPENTER",
    required_date: Date.current + 47.days,
    amount: 8500
  },

  # SERVICES ROUGH-IN
  {
    number: "PO-NDIS-023",
    description: "Wall Insulation",
    category: "MATERIALS",
    required_date: Date.current + 50.days,
    amount: 3500
  },
  {
    number: "PO-NDIS-024",
    description: "Solar Panel System - Rough In",
    category: "ELECTRICAL",
    required_date: Date.current + 52.days,
    amount: 12000
  },
  {
    number: "PO-NDIS-025",
    description: "Air Conditioning - Rough In",
    category: "AIRCON",
    required_date: Date.current + 52.days,
    amount: 8500
  },
  {
    number: "PO-NDIS-026",
    description: "Electrician - Pre-wire & Rough In",
    category: "ELECTRICAL",
    required_date: Date.current + 53.days,
    amount: 11000
  },
  {
    number: "PO-NDIS-027",
    description: "Plumber - Rough In & Mixer Bodies",
    category: "PLUMBER",
    required_date: Date.current + 53.days,
    amount: 9500
  },

  # INTERNAL FIT-OUT
  {
    number: "PO-NDIS-028",
    description: "Plasterboard & Fixing Materials",
    category: "MATERIALS",
    required_date: Date.current + 58.days,
    amount: 8500
  },
  {
    number: "PO-NDIS-029",
    description: "Plasterer - Installation",
    category: "PLASTERER",
    required_date: Date.current + 59.days,
    amount: 12000
  },
  {
    number: "PO-NDIS-030",
    description: "Internal Doors & Hardware",
    category: "MATERIALS",
    required_date: Date.current + 63.days,
    amount: 5500
  },
  {
    number: "PO-NDIS-031",
    description: "Carpenter - Internal Fixout",
    category: "CARPENTER",
    required_date: Date.current + 64.days,
    amount: 9500
  },
  {
    number: "PO-NDIS-032",
    description: "Accessible Kitchen - Custom Build",
    category: "KITCHEN",
    required_date: Date.current + 67.days,
    amount: 28000
  },
  {
    number: "PO-NDIS-033",
    description: "Bathroom Waterproofing",
    category: "WATERPROOF",
    required_date: Date.current + 68.days,
    amount: 3500
  },
  {
    number: "PO-NDIS-034",
    description: "Floor & Wall Tiles",
    category: "MATERIALS",
    required_date: Date.current + 70.days,
    amount: 7500
  },
  {
    number: "PO-NDIS-035",
    description: "Tiler - Installation",
    category: "TILER",
    required_date: Date.current + 71.days,
    amount: 8500
  },

  # PAINTING
  {
    number: "PO-NDIS-036",
    description: "Paint & Supplies - Internal",
    category: "MATERIALS",
    required_date: Date.current + 75.days,
    amount: 4500
  },
  {
    number: "PO-NDIS-037",
    description: "Painter - Internal",
    category: "PAINTER",
    required_date: Date.current + 76.days,
    amount: 11000
  },
  {
    number: "PO-NDIS-038",
    description: "Painter - External",
    category: "PAINTER",
    required_date: Date.current + 80.days,
    amount: 8500
  },

  # FINAL FITOFF
  {
    number: "PO-NDIS-039",
    description: "Hot Water System - Accessible",
    category: "PLUMBER",
    required_date: Date.current + 82.days,
    amount: 3500
  },
  {
    number: "PO-NDIS-040",
    description: "Plumber - Final Fitoff",
    category: "PLUMBER",
    required_date: Date.current + 83.days,
    amount: 6500
  },
  {
    number: "PO-NDIS-041",
    description: "Shower Screens - Accessible",
    category: "MATERIALS",
    required_date: Date.current + 84.days,
    amount: 4200
  },
  {
    number: "PO-NDIS-042",
    description: "Electrician - Final Fitoff & Testing",
    category: "ELECTRICAL",
    required_date: Date.current + 85.days,
    amount: 7500
  },
  {
    number: "PO-NDIS-043",
    description: "Air Conditioning - Final Installation",
    category: "AIRCON",
    required_date: Date.current + 86.days,
    amount: 5500
  },
  {
    number: "PO-NDIS-044",
    description: "Solar Panels - Commission",
    category: "ELECTRICAL",
    required_date: Date.current + 87.days,
    amount: 2500
  },

  # EXTERNAL WORKS
  {
    number: "PO-NDIS-045",
    description: "Driveway - Concrete Pour",
    category: "CONCRETE",
    required_date: Date.current + 90.days,
    amount: 8500
  },
  {
    number: "PO-NDIS-046",
    description: "Accessible Pathways & Ramps",
    category: "CONCRETE",
    required_date: Date.current + 93.days,
    amount: 12000
  },
  {
    number: "PO-NDIS-047",
    description: "Fencing - Perimeter",
    category: "FENCING",
    required_date: Date.current + 95.days,
    amount: 9500
  },
  {
    number: "PO-NDIS-048",
    description: "Landscaping - Low Maintenance",
    category: "LANDSCAPING",
    required_date: Date.current + 97.days,
    amount: 8500
  },

  # FINAL ITEMS
  {
    number: "PO-NDIS-049",
    description: "Final Inspection & Compliance",
    category: "ADMIN",
    required_date: Date.current + 100.days,
    amount: 2500
  },
  {
    number: "PO-NDIS-050",
    description: "Builders Clean & Handover",
    category: "ADMIN",
    required_date: Date.current + 102.days,
    amount: 3500
  }
]

# Create all purchase orders
purchase_orders_data.each do |po_data|
  po = construction.purchase_orders.create!(
    purchase_order_number: po_data[:number],
    status: 'approved',
    description: po_data[:description],
    task_category: po_data[:category],
    required_on_site_date: po_data[:required_date],
    creates_schedule_tasks: true,
    sub_total: po_data[:amount],
    tax: po_data[:amount] * 0.1,
    total: po_data[:amount] * 1.1
  )
  print "."
end

puts "\n✓ Created #{construction.purchase_orders.count} purchase orders"

# Summary
total_budget = construction.purchase_orders.sum(&:total)
puts "\n📊 Construction Summary:"
puts "  Total POs: #{construction.purchase_orders.count}"
puts "  Total Budget: $#{total_budget.round(2)}"
puts "  Timeline: #{construction.purchase_orders.minimum(:required_on_site_date)} to #{construction.purchase_orders.maximum(:required_on_site_date)}"
puts "  Duration: #{(construction.purchase_orders.maximum(:required_on_site_date) - construction.purchase_orders.minimum(:required_on_site_date)).to_i} days"

puts "\n✅ NDIS Construction job seeded successfully!"
puts "Ready to generate master schedule 🚀"
