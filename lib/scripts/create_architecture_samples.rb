# frozen_string_literal: true

# Create sample architecture entries
DocumentedBug.create!([
  {
    chapter_number: 1,
    chapter_name: "Authentication & Users",
    bug_title: "JWT vs Session-Based Auth (Design Decision)",
    knowledge_type: "architecture",
    description: "Stateless authentication using JWT tokens instead of session cookies for API-friendly architecture",
    details: "**Why JWT?**\n- Stateless: No server-side session storage\n- API-friendly: Works well with React SPA\n- Mobile-ready\n\n**Trade-offs:**\n- Cannot revoke tokens\n- Larger size than session ID",
    component: "Authentication"
  },
  {
    chapter_number: 1,
    chapter_name: "Authentication & Users",
    bug_title: "Role System Architecture",
    knowledge_type: "architecture",
    description: "Hardcoded enum roles in User model for security and performance",
    details: "Roles are hardcoded rather than database-driven to prevent privilege escalation via API exploits.",
    component: "Authorization"
  },
  {
    chapter_number: 3,
    chapter_name: "Contacts & Relationships",
    bug_title: "Contact Type System",
    knowledge_type: "architecture",
    description: "PostgreSQL array column for contact_types to support hybrid entities",
    details: "Uses varchar[] to allow contacts to be both customers and suppliers simultaneously. GIN indexes provide fast querying.",
    component: "Contact"
  }
])

puts "✅ Created 3 architecture entries"
puts "📊 Total by type: #{DocumentedBug.group(:knowledge_type).count}"
