# Trapid Price Book - Production Deployment Guide

## Summary

Successfully imported and linked all EasyBuild data:
- **209 suppliers**
- **5,285 price book items**
- **3,626 price history records**

All data is properly linked and ready for production deployment.

## What Changed

### Database Model
- Updated `PricebookItem` to allow negative prices (for rebates/credits)
- Migration already exists on production

### New Features
1. **Data Conversion Script** (`backend/lib/tasks/convert_easybuild_data.rake`)
   - Converts EasyBuild CSV exports to import format
   - Handles suppliers, items, and price histories
   - Groups price histories chronologically

2. **Import Script** (`backend/lib/tasks/pricebook.rake`)
   - Clears existing data
   - Imports suppliers, items, and price histories
   - Links all data correctly

3. **Price History Empty State** (Frontend)
   - Shows helpful message when no price history exists
   - Will display actual history once data is imported

## Deployment Steps

### 1. Deploy Backend Changes (Already Done ✓)

The backend code is already deployed since it auto-deploys from GitHub.

### 2. Upload CSV Files to Production

You have three options:

#### Option A: Using Heroku Run (Recommended)

```bash
# Start a Heroku bash session
heroku run bash --app trapid-backend

# Create CSV files by copying content
cat > tmp/suppliers.csv << 'EOF'
[Paste content from backend/tmp/suppliers.csv]
EOF

cat > tmp/pricebook_items.csv << 'EOF'
[Paste content from backend/tmp/pricebook_items.csv]
EOF

cat > tmp/price_history.csv << 'EOF'
[Paste content from backend/tmp/price_history.csv]
EOF

# Run the import
bundle exec rails pricebook:import_clean

# Exit
exit
```

####  Option B: Copy Files Directly

The CSV files are already generated in `backend/tmp/`:
- `backend/tmp/suppliers.csv` (209 suppliers)
- `backend/tmp/pricebook_items.csv` (5,285 items)
- `backend/tmp/price_history.csv` (3,626 records)

You can copy these files to production using scp, S3, or any file transfer method.

#### Option C: Re-run Conversion on Production

If you prefer to upload the original EasyBuild CSVs:

```bash
# Upload the three original CSVs to the root directory on Heroku
# Then run:
heroku run bash --app trapid-backend
bundle exec rails pricebook:convert_easybuild
bundle exec rails pricebook:import_clean
exit
```

### 3. Verify Data

After import, verify the data:

```bash
heroku run rails runner "puts 'Suppliers: ' + Supplier.count.to_s; puts 'Items: ' + PricebookItem.count.to_s; puts 'Histories: ' + PriceHistory.count.to_s" --app trapid-backend
```

Expected output:
```
Suppliers: 209
Items: 5285
Histories: 3626
```

### 4. Frontend is Already Deployed ✓

The frontend auto-deploys from GitHub to Vercel, so the price history empty state fix is already live.

## Important Notes

### Data Cleared on Import
The `pricebook:import_clean` task **deletes all existing** suppliers, price book items, and price histories before importing. Make sure you want to do this!

### Negative Prices
The data includes some negative prices (e.g., "Rebate" items at -$25). This is intentional and now supported.

### Price History
Price histories are sorted chronologically and include old_price and new_price to show actual price changes over time.

### Suppliers
All suppliers are imported with default ratings (3/5) since the EasyBuild export doesn't include detailed supplier information. You can update these later.

## Testing Locally

The import has been tested locally and successfully loaded:
- All 209 suppliers
- All 5,285 items with proper supplier links
- All 3,626 price history records with chronological ordering

You can test locally again with:
```bash
cd backend
bundle exec rails pricebook:import_clean
```

## Files Reference

**Conversion Script:**
- `backend/lib/tasks/convert_easybuild_data.rake`

**Import Script:**
- `backend/lib/tasks/pricebook.rake`

**Documentation:**
- `backend/PRICEBOOK_IMPORT.md` - Detailed CSV format documentation

**Converted CSV Files (ready to import):**
- `backend/tmp/suppliers.csv`
- `backend/tmp/pricebook_items.csv`
- `backend/tmp/price_history.csv`

**Original EasyBuild Exports:**
- `easybuildapp development Price Books.csv`
- `easybuildapp development Price Histories.csv`
- `easybuildapp development Contacts-1.csv`

## Next Steps

1. Choose deployment option (A, B, or C above)
2. Run the import on production
3. Verify data counts
4. Check the price books page on trapid.vercel.app
5. Click on an item to see the detail page with price history

The price history section will now show either:
- The actual price history table (if there are records)
- A helpful empty state message (if no records yet)

Once you import the data, all 3,626 price history records will be displayed on their respective item detail pages!
