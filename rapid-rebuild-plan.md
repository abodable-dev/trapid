# Rapid Platform Rebuild Plan

## Project Overview

**Goal:** Replace Rapid Platform with a custom-built solution that allows teams to manage construction data through spreadsheet imports and a simple table builder.

**Approach:** Spreadsheet-first migration strategy - upload CSVs/Excel files to auto-generate tables, then layer on custom features.

**Timeline:** 4-6 weeks to operational, then ongoing feature development

---

## Core Philosophy

1. **Get operational FAST** - spreadsheet import gets existing Rapid data migrated immediately
2. **Simple beats complex** - basic CRUD builder, not a full no-code platform
3. **Custom features come later** - estimating, price book, workflows built properly with Claude Code
4. **Data ownership** - all data in your own database, full control

---

## Tech Stack

**Backend:**
- Rails 7
- PostgreSQL
- Active Storage for file uploads

**Frontend:**
- React (with existing UI components from Abodable/stockli.st)
- Tailwind CSS
- Hotwire/Turbo (for some interactions)

**File Processing:**
- Roo gem (for Excel/CSV parsing)
- ActiveStorage for uploads

---

## Phase 1: Spreadsheet Import & Auto-Table Generation (Week 1)

### Features

**1.1 File Upload**
- Support CSV and XLSX files
- Drag-and-drop interface
- File size limits (50MB max)
- Preview first 10 rows before import

**1.2 Smart Type Detection**
Parse uploaded file and detect column types:
- **Text** - default fallback
- **Email** - contains @ symbol
- **Number** - numeric values (integers/decimals)
- **Currency** - $ symbol or decimal values in certain columns
- **Percentage** - % symbol or values 0-100
- **Date** - date formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
- **Date and Time** - datetime formats
- **Boolean** - true/false, yes/no, 1/0

**Detection Logic:**
```
For each column:
1. Sample first 100 non-empty rows
2. Check for patterns:
   - All numeric → Number or Currency
   - Contains @ → Email
   - Date patterns → Date or DateTime
   - true/false patterns → Boolean
   - Everything else → Text
3. Confidence score (if < 80%, default to Text)
```

**1.3 Import Preview & Confirmation**
- Show detected table structure
- Display sample data (first 10 rows)
- Allow user to:
  - Rename table
  - Rename columns
  - Change detected types
  - Set which column is the "title" (display field)
  - Mark columns as unique
  - Exclude columns from import

**1.4 Table & Data Creation**
- Generate database migration dynamically
- Create table with detected schema
- Import all rows from spreadsheet
- Handle errors gracefully (skip bad rows, show report)

### Database Schema

**Tables table:**
```ruby
create_table :tables do |t|
  t.string :name, null: false
  t.string :singular_name
  t.string :plural_name
  t.string :database_table_name, null: false
  t.string :icon
  t.string :title_column
  t.boolean :searchable, default: true
  t.text :description
  t.timestamps
end
```

**Columns table:**
```ruby
create_table :columns do |t|
  t.references :table, null: false, foreign_key: true
  t.string :name, null: false
  t.string :column_name, null: false # database column name
  t.string :column_type, null: false # single_line_text, email, number, etc.
  t.integer :max_length
  t.string :default_value
  t.text :description
  t.boolean :searchable, default: true
  t.boolean :is_title, default: false
  t.boolean :is_unique, default: false
  t.integer :position
  t.timestamps
end
```

**Dynamic Data Tables:**
Create actual PostgreSQL tables based on user-defined schemas. Each user table gets its own database table.

### UI Components Needed

1. **Upload Page**
   - File dropzone
   - Progress indicator
   - Error handling

2. **Preview Page**
   - Table structure preview
   - Column type selectors
   - Sample data grid
   - Confirmation buttons

3. **Success Page**
   - Import summary (X rows imported, Y errors)
   - Link to view the new table
   - Option to import another file

---

## Phase 2: Basic CRUD & Views (Week 2)

### Features

**2.1 Table List View**
- Show all created tables
- Search/filter tables
- Click to view table data

**2.2 Data List View (per table)**
- Display all records in a table
- Columns based on table schema
- Pagination (50 records per page)
- Search across searchable columns
- Sort by column
- Basic filters

**2.3 Record Detail View**
- View single record
- Show all fields
- Edit inline or in modal
- Delete record (with confirmation)

**2.4 Create/Edit Forms**
- Auto-generated forms based on column types
- Field validation based on type
- Required field handling
- Save and continue editing
- Cancel/back options

**2.5 Delete Records**
- Single record delete
- Confirmation modal
- Soft delete option (add deleted_at column)

### UI Components Needed

1. **Table Dashboard**
   - Grid of tables with icons
   - Quick stats (record count)

2. **Data Table Component**
   - Sortable columns
   - Searchable
   - Pagination controls
   - Action buttons (edit, delete)

3. **Form Builder**
   - Dynamic form generation based on column types
   - Validation messages
   - Success/error states

4. **Record Detail Modal**
   - Clean layout
   - Edit mode toggle
   - Related records section (placeholder)

---

## Phase 3: Relationships & Lookups (Week 3)

### Features

**3.1 Define Relationships**
- Add "Lookup" column type to existing tables
- Select which table to link to
- Choose display field from related table
- One-to-many relationships

**3.2 Multiple Lookups**
- Many-to-many relationships
- Junction table creation
- Multi-select interface

**3.3 Related Record Display**
- Show related records on detail view
- Quick add related records
- Navigate between related records

**3.4 Lookup Fields in Forms**
- Dropdown/select for single lookup
- Multi-select for multiple lookups
- Search/filter options in selectors

### Database Changes

**Add to Columns table:**
```ruby
add_column :columns, :lookup_table_id, :integer
add_column :columns, :lookup_display_column, :string
add_column :columns, :is_multiple, :boolean, default: false
```

**Junction Tables:**
Create dynamically for many-to-many relationships:
```ruby
create_table :table_a_table_b do |t|
  t.references :table_a, foreign_key: true
  t.references :table_b, foreign_key: true
  t.timestamps
end
```

---

## Phase 4: Manual Table/Column Builder (Week 4)

### Features

**4.1 Create Table Manually**
- Form to create new table (not from spreadsheet)
- Set name, icon, options
- Start with empty table

**4.2 Add Columns to Existing Tables**
- Add new column to any table
- All column types supported
- Set validation rules
- Default values

**4.3 Edit Table Structure**
- Rename tables
- Change icons
- Modify table options
- Reorder columns

**4.4 Edit Columns**
- Rename columns
- Change types (with data migration warnings)
- Modify constraints
- Delete columns (with confirmation)

**4.5 Bulk Data Import to Existing Tables**
- Upload CSV to add rows to existing table
- Map CSV columns to table columns
- Append or replace data

### UI Components Needed

1. **Table Builder Form**
   - Similar to Rapid's "Create Table" modal
   - Icon picker
   - Options checkboxes

2. **Column Builder Form**
   - Type selector (like we saw in Rapid)
   - Conditional fields based on type
   - Validation rules

3. **Schema Editor**
   - Drag-to-reorder columns
   - Inline edit column properties
   - Quick delete/duplicate

---

## Phase 5: Advanced Features (Weeks 5-6)

### Features

**5.1 Computed Columns**
- Formula-based calculated fields
- Reference other columns
- Basic math operations
- String concatenation

**5.2 Choice Fields**
- Dropdown with predefined options
- Radio buttons
- Checkboxes (multiple choice)
- Color-coded options

**5.3 User/Team Management**
- User accounts
- Basic roles (Admin, Editor, Viewer)
- Table-level permissions (future)

**5.4 Search & Filter**
- Global search across all tables
- Advanced filters per table
- Save filter views

**5.5 Bulk Operations**
- Select multiple records
- Bulk edit
- Bulk delete
- Export to CSV

**5.6 Data Export**
- Export any table to CSV
- Export all tables (backup)
- Scheduled exports (future)

---

## Phase 6: Custom Tekna Features (Ongoing)

These are the specialized features for construction management that will be built properly with Claude Code, not genericized.

### 6.1 Price Book Intelligence
- Specialized price book table structure
- Unit rates by category
- Supplier pricing
- Historical cost tracking
- Margin calculations
- Cost escalation tracking

### 6.2 Estimating Workflows
- Project estimates linked to price book
- Line item estimating
- Quantity takeoffs
- Labor + material breakdowns
- Markup calculations
- Quote generation

### 6.3 Construction Job Management
- Job tracking
- Stage/milestone management
- Budget vs actual
- Variations/change orders
- Payment schedules

### 6.4 Reporting & Dashboards
- Custom reports
- Project profitability
- Cost analytics
- Supplier spend analysis

### 6.5 Integrations
- Accounting software (Xero/MYOB)
- Email notifications
- Document generation (PDFs)
- Calendar integration

---

## Column Type Specifications

Full list of supported column types and their properties:

### Single Line of Text
- Max length: configurable (default 255)
- Searchable
- Can be title column
- Can be unique

### Email
- Email validation
- Max length: 255
- Searchable
- Can be unique

### Multiple Lines of Text
- Max length: configurable (default 5000)
- Text area input
- Searchable
- Not for title column

### Date
- Date picker input
- ISO format storage
- Display format configurable

### Date and Time
- DateTime picker
- Timezone aware
- ISO format storage

### Choice
- Predefined options list
- Single select
- Can be searchable
- Color coding (future)

### Lookup
- References another table
- Display field from related table
- Dropdown selector
- Creates foreign key

### Boolean
- True/False checkbox
- Yes/No display
- Default value option

### Number
- Decimal precision configurable
- Min/max values optional
- Searchable

### Percentage
- Number 0-100
- Display with % symbol
- Decimal precision

### Currency
- Decimal (2 places default)
- Currency symbol configurable
- Formatted display

### Whole Number
- Integer only
- Min/max values optional

### Computed
- Formula-based
- References other columns
- Read-only
- Calculated on read

### User
- References user table
- Current user default option
- Dropdown selector

### Subquery
- Advanced: filter records from related table
- For power users
- Phase 2 feature

### Multiple Lookups
- Many-to-many relationship
- Multi-select interface
- Junction table creation

---

## Data Migration Strategy

### Exporting from Rapid Platform

1. **Export all tables to CSV/Excel**
   - One file per table
   - Include all columns
   - Export relationships as IDs (we'll reconnect later)

2. **Document relationships**
   - List which tables link to which
   - What the lookup columns are
   - Create a relationship map

3. **Export in order**
   - Parent tables first (Contacts, Accounts)
   - Child tables second (Projects, Estimates)
   - Junction tables last

### Importing to New System

**Phase 1: Import core tables (no relationships)**
1. Upload Contacts CSV → auto-create Contacts table
2. Upload Accounts CSV → auto-create Accounts table
3. Upload Projects CSV → auto-create Projects table
4. etc.

**Phase 2: Add relationships**
1. Edit Projects table → add Lookup column to Contacts
2. Edit Projects table → add Lookup column to Accounts
3. Map the ID columns from CSVs to new lookups

**Phase 3: Verify data**
1. Spot check records
2. Verify relationships work
3. Test critical workflows

---

## UI/UX Design Guidelines

### Design System (from Abodable)
- **Colors:** Purple theme (#151740, #5b21b6, #8b5cf6)
- **Typography:** Sofia Pro
- **Components:** Use existing UI components from Abodable/stockli.st
- **Layout:** Clean, spacious, professional

### Key UI Patterns

**Navigation:**
- Left sidebar with table list
- Collapsible sections
- Search/filter at top
- User menu in top-right

**Tables/Lists:**
- Clean grid layout
- Hover states on rows
- Action buttons on right
- Pagination at bottom

**Forms:**
- Single column layout
- Clear labels above fields
- Inline validation
- Action buttons at bottom (Save, Cancel)

**Modals:**
- Centered overlay
- Max width 600px
- Close button top-right
- Dark backdrop

---

## Technical Implementation Notes

### Dynamic Table Creation

**Challenge:** Creating actual database tables at runtime based on user input.

**Solution:**
```ruby
class TableBuilder
  def create_table(table_definition)
    # Generate migration
    migration_code = generate_migration(table_definition)
    
    # Execute migration
    ActiveRecord::Migration.execute(migration_code)
    
    # Create dynamic model
    create_model_class(table_definition)
  end
  
  def generate_migration(table_def)
    columns = table_def.columns.map do |col|
      "t.#{column_type_to_db_type(col.type)} :#{col.name}"
    end.join("\n")
    
    <<-RUBY
      create_table :#{table_def.database_name} do |t|
        #{columns}
        t.timestamps
      end
    RUBY
  end
  
  def column_type_to_db_type(type)
    {
      'single_line_text' => 'string',
      'email' => 'string',
      'multiple_lines_text' => 'text',
      'date' => 'date',
      'date_and_time' => 'datetime',
      'number' => 'decimal',
      'percentage' => 'decimal',
      'currency' => 'decimal',
      'whole_number' => 'integer',
      'boolean' => 'boolean',
      'lookup' => 'integer' # foreign key
    }[type]
  end
  
  def create_model_class(table_def)
    # Dynamically create ActiveRecord model
    class_name = table_def.name.classify
    
    Object.const_set(class_name, Class.new(ApplicationRecord) do
      self.table_name = table_def.database_name
      
      # Add associations based on lookup columns
      table_def.columns.where(column_type: 'lookup').each do |col|
        belongs_to col.name.to_sym, 
                   class_name: col.lookup_table.name.classify,
                   optional: true
      end
    end)
  end
end
```

### Type Detection Algorithm

```ruby
class TypeDetector
  def detect_column_type(values)
    non_empty = values.compact.reject(&:blank?)
    return 'single_line_text' if non_empty.empty?
    
    # Check for email
    return 'email' if non_empty.all? { |v| v.match?(/@/) }
    
    # Check for boolean
    bool_values = ['true', 'false', 'yes', 'no', '1', '0', 't', 'f']
    return 'boolean' if non_empty.all? { |v| bool_values.include?(v.to_s.downcase) }
    
    # Check for numbers
    if non_empty.all? { |v| v.to_s.match?(/^\d+$/) }
      return 'whole_number'
    elsif non_empty.all? { |v| v.to_s.match?(/^\d+\.?\d*$/) }
      return 'number'
    end
    
    # Check for currency
    return 'currency' if non_empty.any? { |v| v.to_s.match?(/^\$/) }
    
    # Check for percentage
    return 'percentage' if non_empty.any? { |v| v.to_s.match?(/%$/) }
    
    # Check for dates
    if non_empty.all? { |v| parseable_as_date?(v) }
      return 'date'
    elsif non_empty.all? { |v| parseable_as_datetime?(v) }
      return 'date_and_time'
    end
    
    # Default to text
    'single_line_text'
  end
  
  def parseable_as_date?(value)
    Date.parse(value.to_s)
    true
  rescue ArgumentError
    false
  end
  
  def parseable_as_datetime?(value)
    DateTime.parse(value.to_s)
    true
  rescue ArgumentError
    false
  end
end
```

---

## File Structure

```
app/
├── controllers/
│   ├── tables_controller.rb          # CRUD for table definitions
│   ├── columns_controller.rb         # CRUD for column definitions
│   ├── imports_controller.rb         # Spreadsheet upload & import
│   ├── records_controller.rb         # Dynamic record CRUD
│   └── relationships_controller.rb   # Managing lookups
├── models/
│   ├── table.rb                      # Table definition model
│   ├── column.rb                     # Column definition model
│   ├── import.rb                     # Import job tracking
│   └── concerns/
│       └── dynamic_model.rb          # Dynamic AR model creation
├── services/
│   ├── table_builder.rb              # Creates actual DB tables
│   ├── type_detector.rb              # Detects column types from data
│   ├── spreadsheet_parser.rb         # Parses CSV/XLSX files
│   └── data_importer.rb              # Imports rows into tables
├── views/
│   ├── tables/
│   │   ├── index.html.erb            # List of all tables
│   │   ├── show.html.erb             # Table detail/settings
│   │   └── new.html.erb              # Create table manually
│   ├── imports/
│   │   ├── new.html.erb              # Upload spreadsheet
│   │   ├── preview.html.erb          # Preview & configure import
│   │   └── result.html.erb           # Import results
│   └── records/
│       ├── index.html.erb            # List records in a table
│       ├── show.html.erb             # Record detail
│       └── _form.html.erb            # Dynamic form partial
└── javascript/
    ├── components/
    │   ├── TableList.jsx             # React component for table grid
    │   ├── DataTable.jsx             # React component for record list
    │   ├── DynamicForm.jsx           # React component for forms
    │   ├── TypeDetector.jsx          # UI for type detection preview
    │   └── FileUploader.jsx          # Drag-drop upload component
    └── utils/
        └── api.js                    # API client for backend
```

---

## Testing Strategy

### Critical Paths to Test

1. **Spreadsheet Import Flow**
   - Upload CSV with various column types
   - Verify type detection accuracy
   - Confirm table creation
   - Validate data import

2. **CRUD Operations**
   - Create records
   - Read/list records
   - Update records
   - Delete records

3. **Relationships**
   - Create lookup column
   - Link records
   - Display related records
   - Navigate relationships

4. **Edge Cases**
   - Empty spreadsheets
   - Invalid data types
   - Duplicate column names
   - Very large files (10k+ rows)
   - Special characters in names
   - SQL injection attempts

---

## Security Considerations

1. **File Upload**
   - Validate file types (CSV, XLSX only)
   - Scan for malware
   - Size limits
   - Rate limiting

2. **Dynamic SQL**
   - Sanitize all table/column names
   - Use parameterized queries
   - Whitelist allowed characters
   - Prevent SQL injection

3. **User Permissions**
   - Authentication required
   - Role-based access (future)
   - Audit logs (future)

4. **Data Privacy**
   - Secure database
   - Encrypted backups
   - HTTPS only
   - No data sharing

---

## Deployment Strategy

### Development Environment
- Local Rails server
- PostgreSQL database
- Hot reload for React components

### Staging Environment
- Heroku or similar
- Production-like data
- Team testing

### Production Environment
- Heroku/AWS/DigitalOcean
- Automated backups
- Monitoring (Sentry/Rollbar)
- SSL certificate

---

## Success Metrics

### Phase 1 Success (Week 1)
- ✅ Can upload a CSV and auto-create a table
- ✅ Type detection works for 90%+ of columns
- ✅ Data imports completely and accurately
- ✅ Can view the imported data in a list

### Phase 2 Success (Week 2)
- ✅ Can view all tables
- ✅ Can view records in any table
- ✅ Can create new records
- ✅ Can edit existing records
- ✅ Can delete records
- ✅ Basic search works

### Phase 3 Success (Week 3)
- ✅ Can create lookup relationships
- ✅ Related records display correctly
- ✅ Can navigate between related records
- ✅ Multi-select lookups work

### Phase 4 Success (Week 4)
- ✅ Can manually create tables
- ✅ Can add columns to existing tables
- ✅ Can edit table/column definitions
- ✅ Can import additional data to existing tables

### Go-Live Criteria
- ✅ All Rapid data successfully migrated
- ✅ Team can perform daily tasks
- ✅ No critical bugs
- ✅ Performance acceptable (< 2s page loads)
- ✅ Team trained on new system

---

## Questions for Team

Before starting development, clarify:

1. **Rapid shutdown date** - exact deadline?
2. **Critical tables** - which 5-10 tables are absolutely essential?
3. **Data volume** - how many records in largest tables?
4. **Relationships** - how many tables are interconnected?
5. **Custom workflows** - what processes are unique to Tekna?
6. **User count** - how many people will use this?
7. **Hosting preference** - Heroku, AWS, self-hosted?

---

## Next Steps

1. **Review this plan** - get team feedback
2. **Prioritize features** - cut anything non-essential for go-live
3. **Set up Rails app** - initialize project with correct gems
4. **Build Phase 1** - spreadsheet import (this is the critical path)
5. **Test with real data** - export one table from Rapid, import to new system
6. **Iterate** - fix issues, improve UX
7. **Build remaining phases** - CRUD, relationships, etc.
8. **Migrate all data** - complete Rapid exodus
9. **Go live** - switch team to new system
10. **Build custom features** - estimating, price book, etc.

---

## Resources Needed

### Development
- Claude Code for implementation
- Access to Rapid Platform for testing/export
- Sample data from Tekna's Rapid instance

### Design
- Existing Abodable UI components
- Tailwind CSS setup
- Icon library (Heroicons or similar)

### Infrastructure
- GitHub repo for code
- Staging server for testing
- Production server for go-live
- Database backups

---

## Budget Considerations

**Zero external costs approach:**
- Self-development (your time + Claude Code)
- Use existing UI components (no design costs)
- Open source gems/libraries
- Heroku free tier for staging (or DigitalOcean $5/mo droplet)
- Production hosting: ~$20-50/mo

**Total estimated cost:** $50-100/mo for hosting, $0 for development

---

## Risk Mitigation

### Risk: Rapid shuts down before migration complete
**Mitigation:** 
- Export ALL data immediately (this week)
- Store in version control
- Have spreadsheets as backup

### Risk: Data loss during migration
**Mitigation:**
- Test import process thoroughly on staging
- Keep Rapid exports as backup
- Don't delete from Rapid until verified

### Risk: Missing critical features
**Mitigation:**
- Start with spreadsheet import (gets data safe)
- Build CRUD next (basic functionality)
- Custom features can wait

### Risk: Team adoption issues
**Mitigation:**
- Involve team in testing
- Keep UI similar to Rapid where possible
- Training sessions before go-live

---

## Future Enhancements (Post-Launch)

Once operational, consider:

1. **Mobile app** - React Native for field use
2. **Offline mode** - PWA with local storage
3. **Advanced reporting** - Custom charts/dashboards
4. **Workflow automation** - Zapier-like automations
5. **Email integration** - Send emails from system
6. **Document templates** - Generate PDFs from data
7. **Calendar integration** - Sync schedules
8. **Photo attachments** - Site photos on records
9. **GPS tracking** - Location data on jobs
10. **Time tracking** - Labor hours per job

---

## Conclusion

This plan provides a clear path from Rapid Platform to a custom solution in 4-6 weeks, with immediate data safety through spreadsheet imports and incremental feature building.

**The key insight:** By focusing on spreadsheet imports first, we solve the migration problem AND provide a superior user experience (upload spreadsheet vs manually rebuilding tables).

**Ready to build!** Start with Phase 1 in Claude Code.
