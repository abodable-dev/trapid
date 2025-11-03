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
