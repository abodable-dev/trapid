# Price History Export/Import Feature

## Overview

This feature allows users to export and import price history data for pricebook items in Excel format. Users can filter by supplier and/or category when exporting, edit the exported data in Excel, and re-import the changes.

## Files Created

### Services
- `/app/services/price_history_export_service.rb` - Generates Excel files with price history data
- `/app/services/price_history_import_service.rb` - Parses Excel files and updates price history records

### Controller Updates
- `/app/controllers/api/v1/pricebook_items_controller.rb` - Added two new endpoints:
  - `export_price_history` (GET)
  - `import_price_history` (POST)

### Routes
- `/config/routes.rb` - Added routes for the new endpoints

## API Endpoints

### Export Price History

**Endpoint:** `GET /api/v1/pricebook/export_price_history`

**Query Parameters:**
- `supplier_id` (optional) - Filter by supplier ID
- `category` (optional) - Filter by category name

**Example Requests:**
```bash
# Export all price history
curl -X GET "http://localhost:3000/api/v1/pricebook/export_price_history" \
  -o price_history.xlsx

# Export for specific supplier
curl -X GET "http://localhost:3000/api/v1/pricebook/export_price_history?supplier_id=1" \
  -o price_history_supplier_1.xlsx

# Export for specific category
curl -X GET "http://localhost:3000/api/v1/pricebook/export_price_history?category=ELECTRICAL" \
  -o price_history_electrical.xlsx

# Export for supplier AND category
curl -X GET "http://localhost:3000/api/v1/pricebook/export_price_history?supplier_id=1&category=ELECTRICAL" \
  -o price_history_supplier_1_electrical.xlsx
```

**Response:**
- Success: Downloads Excel file (.xlsx)
- Error: JSON with error messages

### Import Price History

**Endpoint:** `POST /api/v1/pricebook/import_price_history`

**Parameters:**
- `file` (required) - The Excel file to import (multipart/form-data)

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/pricebook/import_price_history" \
  -F "file=@/path/to/price_history.xlsx"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_rows": 100,
    "processed": 100,
    "created": 50,
    "updated": 45,
    "skipped": 3,
    "errors": 2
  },
  "warnings": [
    "Row 10: Item ID 999 not found - skipping",
    "Created new supplier: New Supplier Name"
  ]
}
```

## Excel File Format

The exported Excel file contains the following columns:

| Column Name | Description | Required for Import | Editable |
|------------|-------------|---------------------|----------|
| Item ID | Database ID of pricebook item | Yes | No |
| Item Code | Item code/SKU | No | No |
| Item Name | Item name | No | No |
| Category | Item category | No | No |
| Unit of Measure | Item UoM | No | No |
| Current Price | Current price of item | No | No |
| Default Supplier | Default supplier name | No | No |
| Price History ID | Database ID of price history record | No* | No |
| Historical Price | The price for this history entry | Yes | Yes |
| Previous Price | Previous price before this change | No | Yes |
| Price Date | When this record was created | No | No |
| Date Effective | When this price became effective | No | Yes |
| Supplier | Supplier for this price | No | Yes |
| LGA | Local government area | No | Yes |
| Change Reason | Reason for price change | No | Yes |
| Quote Reference | Reference number for quote | No | Yes |
| Notes | Item notes | No | No |

*Note: Price History ID is only required when updating existing records. Leave blank for new entries.

## Valid LGA Values

The following LGA values are accepted (case-insensitive):
- Toowoomba Regional Council
- Lockyer Valley Regional Council
- City of Gold Coast
- Brisbane City Council
- Sunshine Coast Regional Council
- Redland City Council
- Scenic Rim Regional Council

## Import Behavior

### Creating New Price History Records
1. Leave "Price History ID" column empty
2. Provide "Item ID" and "Historical Price" (required)
3. All other fields are optional

### Updating Existing Price History Records
1. Include the "Price History ID" value from export
2. Update any editable fields
3. The import will update the existing record

### Supplier Handling
- If supplier name exists in database, it will be linked
- If supplier name doesn't exist, a new supplier will be created
- Invalid supplier names will be ignored with a warning

### Error Handling
- The import uses database transactions (all-or-nothing)
- If any critical error occurs, all changes are rolled back
- Row-level errors are collected and returned in the response
- Non-critical issues generate warnings but don't stop the import

## Use Cases

### Use Case 1: Export supplier-specific prices
1. User filters pricebook by supplier "ACME Supplies"
2. User clicks "Export to Excel" button
3. System generates `price_history_ACME_Supplies_20250106.xlsx`
4. File contains all items and their price history for ACME

### Use Case 2: Bulk update historical prices
1. User exports price history
2. User opens Excel and updates several "Historical Price" values
3. User saves the file
4. User uploads the file back to the system
5. System updates price_history table with new values

### Use Case 3: Add new price records
1. User exports current price history
2. User duplicates a row and changes:
   - Clears "Price History ID"
   - Updates "Historical Price" to new value
   - Updates "Date Effective" to new date
   - Updates "Supplier" if needed
3. User uploads the file
4. System creates new price history record

### Use Case 4: Regional pricing updates
1. User exports price history for category "PLUMBING"
2. User adds LGA values to records (e.g., "Brisbane City Council")
3. User updates prices for specific regions
4. User uploads the file
5. System records regional pricing variations

## Testing Instructions

### Manual Testing Steps

1. **Start Rails Server**
   ```bash
   cd backend
   bin/rails server
   ```

2. **Test Export (No Filters)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/pricebook/export_price_history" \
     -o test_export_all.xlsx

   # Verify file was downloaded
   ls -lh test_export_all.xlsx
   ```

3. **Test Export (With Supplier Filter)**
   ```bash
   # First, get a supplier ID
   curl -X GET "http://localhost:3000/api/v1/suppliers" | jq '.[0].id'

   # Then export for that supplier
   curl -X GET "http://localhost:3000/api/v1/pricebook/export_price_history?supplier_id=1" \
     -o test_export_supplier.xlsx
   ```

4. **Test Export (With Category Filter)**
   ```bash
   # Get available categories
   curl -X GET "http://localhost:3000/api/v1/pricebook" | jq '.filters.categories'

   # Export for a category
   curl -X GET "http://localhost:3000/api/v1/pricebook/export_price_history?category=ELECTRICAL" \
     -o test_export_category.xlsx
   ```

5. **Test Import**
   ```bash
   # Edit the exported file in Excel (change some prices)
   # Then import it back
   curl -X POST "http://localhost:3000/api/v1/pricebook/import_price_history" \
     -F "file=@test_export_all.xlsx"
   ```

6. **Verify Changes**
   ```bash
   # Check a specific item's price history
   curl -X GET "http://localhost:3000/api/v1/pricebook/1/history" | jq '.'
   ```

### Rails Console Testing

```ruby
# Start console
bin/rails console

# Test export service
service = PriceHistoryExportService.new(supplier_id: 1)
result = service.export
puts result[:success] ? "Export successful" : result[:errors]

# Test import service (requires a file)
# First create a test file by running export via curl
service = PriceHistoryImportService.new('/path/to/test_export.xlsx')
result = service.import
puts result
```

## Implementation Details

### PriceHistoryExportService

**Key Features:**
- Filters items by supplier and/or category
- Includes all price history records for each item
- Items without price history are included with empty history fields
- Excel file has styled headers and formatted currency/date columns
- Auto-fit column widths for readability
- Filename includes filters and date for easy organization

**Performance Considerations:**
- Uses `includes()` to eager-load associations (prevents N+1 queries)
- Processes items in memory (suitable for up to ~10,000 items)
- For larger datasets, consider pagination or background job processing

### PriceHistoryImportService

**Key Features:**
- Validates file format (CSV, XLS, XLSX)
- Required column validation
- Row-by-row processing with error collection
- Database transaction for atomicity
- Automatic supplier creation
- LGA validation against allowed values
- Flexible date parsing
- Currency parsing (handles $, commas)

**Validation Rules:**
- Item ID must exist in database
- Historical Price must be provided
- LGA must be in allowed list (if provided)
- Supplier is created if doesn't exist
- Dates are parsed flexibly

**Error Recovery:**
- Transaction rollback on critical errors
- Row-level errors don't stop other rows
- Detailed error messages with row numbers
- Warning messages for non-critical issues

## Frontend Integration

To integrate this feature in the React frontend:

### Export Button

```javascript
const exportPriceHistory = async (supplierId, category) => {
  const params = new URLSearchParams();
  if (supplierId) params.append('supplier_id', supplierId);
  if (category) params.append('category', category);

  const response = await fetch(
    `/api/v1/pricebook/export_price_history?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price_history_${Date.now()}.xlsx`;
    a.click();
  } else {
    const error = await response.json();
    console.error('Export failed:', error);
  }
};
```

### Import Button

```javascript
const importPriceHistory = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/v1/pricebook/import_price_history', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    console.log('Import successful:', result.stats);
    // Show success notification
    // Refresh pricebook data
  } else {
    console.error('Import failed:', result.errors);
    // Show error notification
  }
};
```

## Security Considerations

1. **Authentication**: Endpoints should require authentication (add auth middleware)
2. **Authorization**: Users should only export/import data they have access to
3. **File Size Limits**: Rails has default 10MB upload limit (adjust if needed)
4. **SQL Injection**: Using parameterized queries throughout
5. **XSS Prevention**: Data is validated and sanitized on import

## Future Enhancements

1. **Background Processing**: For large exports/imports, use Solid Queue
2. **Progress Tracking**: Show real-time import progress
3. **Validation Preview**: Show import preview before committing changes
4. **Diff View**: Show what will change before importing
5. **Export Templates**: Pre-filtered export templates for common use cases
6. **Scheduled Exports**: Automatically export and email price history reports
7. **Audit Trail**: Track who exported/imported and when
8. **Undo Import**: Ability to rollback an import operation

## Troubleshooting

### Error: "No items found for the selected filters"
- Check that items exist with the specified supplier/category
- Verify supplier_id is correct
- Check category name matches exactly (case-sensitive)

### Error: "Failed to parse spreadsheet"
- Ensure file is valid Excel (.xlsx, .xls) or CSV format
- Check file is not corrupted
- Verify file size is under limit

### Error: "Missing required columns"
- Excel file must have headers in first row
- Required columns: "Item ID", "Historical Price"
- Check for typos in column headers

### Import creates duplicate suppliers
- This is expected behavior if supplier name doesn't match exactly
- Supplier matching is case-insensitive but must match exactly
- Check for extra spaces or special characters

### Price history not visible after import
- Refresh the pricebook page
- Check that date_effective is set correctly
- Verify item_id matches an existing item

## Support

For issues or questions, contact the development team or create an issue in the project repository.
