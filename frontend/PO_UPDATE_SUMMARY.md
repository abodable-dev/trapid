# Purchase Order Template Update Summary

## Overview
Updated `/Users/jakebaird/trapid/frontend/src/pages/PurchaseOrderDetailPage.jsx` to match real-world PO structure while maintaining the Midday aesthetic (dark mode, minimal, clean design).

## Changes Made

### 1. Header Section Enhancement
**Before:** Basic company name and contact info
**After:** Complete header with:
- Company name with subtitle/description
- PO Number (prominent, monospaced)
- QBCC Number (Queensland Building and Construction Commission license)
- ABN (Australian Business Number)
- Proposed Delivery Date

**Layout:** 4-column grid that's responsive (collapses on mobile)

### 2. Three-Column Info Section
**Replaced:** Simple 2-column "From/To" section
**New Structure:**

#### Column 1 - Delivery Address
- Job/project address
- Latitude/Longitude coordinates (when available)
- MapPin icon for visual clarity

#### Column 2 - Supplier
- Supplier company name
- Contact person
- Email (clickable mailto link)
- Phone (clickable tel link)
- Building2 icon for company

#### Column 3 - Project Contacts
- Supervisor name
- Estimator name
- Area Manager name
- WHS Officer name
- User icons for each contact

**Responsive:** Collapses from 3 columns to single column on mobile

### 3. Enhanced Line Items Table
**New Columns:**
- QTY (moved to first column)
- DESCRIPTION (with optional notes below)
- **CODE** (product/item code) - NEW
- RATE (unit price)
- **TAX** (GST/Tax-Free indicator as badge) - NEW
- AMOUNT (total)

**Improvements:**
- Horizontal scroll on mobile
- Better column ordering (quantity first, like real POs)
- Tax status displayed as subtle badges
- Monospaced fonts for all numbers

### 4. Notes Section
Added dedicated notes section below line items:
- Displays `special_instructions` field
- Styled as subtle gray box with border
- Shows "COLOUR: As per colour selection" type notes
- Only appears if notes exist

### 5. Remittance Section
New section with payment information:
- **Invoice To:** Company details for invoicing
- **Payment Terms:**
  - 7-day accounts (invoiced weekly)
  - 14-day accounts (invoiced fortnightly)
  - 30-day accounts (invoiced end of month)
- Tax invoice requirements reminder
- 2-column grid layout (responsive)

### 6. Conditions of Acceptance
New comprehensive terms section:
- 8 standard terms and conditions
- Bullet list format
- Professional legal language
- Covers:
  - Order verification
  - Invoice requirements
  - Order acceptance
  - Material standards
  - Variations process
  - Delivery requirements
  - Risk transfer
  - Payment terms

### 7. Removed Sections
- Removed redundant "Metadata" section (Issue Date, Required By, Construction Job)
- Data moved to header or maintained in existing sections
- Cleaner, more compact layout

## Backend Fields Required

### Existing Fields (Already Working)
✅ `purchase_order_number`
✅ `description`
✅ `required_date`
✅ `delivery_address`
✅ `special_instructions`
✅ `company_setting.company_name`
✅ `company_setting.address`
✅ `company_setting.abn`
✅ `supplier.name`
✅ `supplier.contact_person`
✅ `supplier.email`
✅ `supplier.phone`
✅ `line_items[].description`
✅ `line_items[].quantity`
✅ `line_items[].unit_price`
✅ `line_items[].notes`

### New Fields Needed in Backend API

#### CompanySetting Model
```ruby
# Add to company_settings table
add_column :company_settings, :qbcc_number, :string
add_column :company_settings, :phone, :string
add_column :company_settings, :email, :string
```

#### PurchaseOrder Model
```ruby
# Add to purchase_orders table
add_column :purchase_orders, :delivery_lat, :decimal, precision: 10, scale: 6
add_column :purchase_orders, :delivery_lng, :decimal, precision: 10, scale: 6
add_column :purchase_orders, :supervisor_name, :string
add_column :purchase_orders, :estimator_name, :string
add_column :purchase_orders, :area_manager_name, :string
add_column :purchase_orders, :whs_officer_name, :string
add_column :purchase_orders, :remittance_email, :string
add_column :purchase_orders, :remittance_phone, :string
```

#### PurchaseOrderLineItem Model
```ruby
# Add to purchase_order_line_items table
add_column :purchase_order_line_items, :item_code, :string
add_column :purchase_order_line_items, :tax_type, :string, default: 'gst'
# tax_type values: 'gst' or 'tax_free'
```

## Fallback Behavior

The frontend gracefully handles missing backend fields:

1. **QBCC Number:** Only shows if present in `company_setting.qbcc_number`
2. **Delivery Coordinates:** Only shows if both lat/lng are present
3. **Project Contacts:** Shows "No contacts assigned" if all are null
4. **Item Code:** Shows '-' if not present
5. **Tax Type:** Defaults to 'GST' badge if field missing
6. **Remittance Info:** Falls back to company_setting email/phone

## Design Consistency

All changes maintain the Midday aesthetic:
- ✅ Pure black background (`bg-black`)
- ✅ Gray-900 cards (`bg-gray-900`)
- ✅ Gray-800 borders (`border-gray-800`)
- ✅ White primary text (`text-white`)
- ✅ Gray-400 secondary text (`text-gray-400`)
- ✅ Monospaced fonts for all numbers (`font-mono`)
- ✅ Subtle hover states
- ✅ Proper spacing (8px grid)
- ✅ Lucide React icons throughout

## Responsive Behavior

### Desktop (1440px+)
- 3-column info section
- Full table with all columns visible
- 2-column remittance section

### Tablet (768px - 1439px)
- 3-column info section maintained
- Table with horizontal scroll if needed
- 2-column remittance section

### Mobile (< 768px)
- Single column info sections (stacked)
- Table with horizontal scroll
- Single column remittance section
- All text remains readable
- Touch-friendly spacing

## Testing Checklist

- [ ] View PO on desktop (verify 3-column layout)
- [ ] View PO on mobile (verify stacking)
- [ ] Verify all monospaced numbers display correctly
- [ ] Test with missing optional fields (QBCC, contacts, etc.)
- [ ] Verify mailto/tel links work
- [ ] Check dark mode contrast ratios
- [ ] Verify table horizontal scroll on narrow screens
- [ ] Test print layout (if printing is needed)

## Next Steps

### For Backend Developer:
1. Review the "New Fields Needed" section above
2. Create migration to add fields to respective tables
3. Update PurchaseOrder API serializer to include new fields
4. Test with sample data
5. Deploy to staging for frontend testing

### Optional Enhancements:
1. **PDF Generation:** Add download PDF button that formats PO properly
2. **Email Preview:** Show how PO will look when emailed to supplier
3. **Editable Contacts:** Allow inline editing of supervisor/estimator/etc
4. **Delivery Tracking:** Add map view using lat/lng coordinates
5. **Customizable Terms:** Allow company to customize conditions of acceptance

## Files Changed

- `/Users/jakebaird/trapid/frontend/src/pages/PurchaseOrderDetailPage.jsx`

## Lines of Code
- Lines added: ~200
- Lines removed: ~50
- Net change: +150 lines

## Screenshots/Visual Description

**New Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Back Button]                    [Edit] [Submit] [•••]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PURCHASE ORDER [Draft]                          $12,450.00 │
│  PO #048851                                     Total Amount │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  TEKNA HOMES                     📍 123 Main St       │  │
│  │  Quality Construction            📞 0407 397 541     │  │
│  │                                   ✉ robert@...        │  │
│  │                                                        │  │
│  │  PO: 048851  QBCC: 123456  ABN: 12345  Delivery: ... │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  📍 DELIVERY ADDRESS  │  🏢 SUPPLIER     │ 👤 CONTACTS │  │
│  │  123 Project St      │  Supplier Co     │ Supervisor  │  │
│  │  Brisbane QLD        │  John Smith      │ Estimator   │  │
│  │  -27.xxx, 153.xxx    │  📧 📞           │ Area Mgr    │  │
│  │                      │                  │ WHS Officer │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  QTY │ DESCRIPTION    │ CODE   │ RATE  │ TAX │ AMT   │  │
│  │  ────┼────────────────┼────────┼───────┼─────┼─────  │  │
│  │  10  │ Timber frame   │ TF001  │ $45   │ GST │ $450  │  │
│  │  5   │ Steel beams    │ SB202  │ $200  │ GST │$1000  │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ NOTES: COLOUR: As per colour selection          │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │                              Sub Total:    $11,318.18 │  │
│  │                              GST:           $1,131.82 │  │
│  │                              ─────────────────────── │  │
│  │                              Total:        $12,450.00 │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  REMITTANCE                                           │  │
│  │  Invoice To: Tekna Homes      │  Payment Terms:      │  │
│  │  accounts@tekna.com.au        │  7-day: Weekly       │  │
│  │  0407 397 541                 │  14-day: Fortnightly │  │
│  │                               │  30-day: End of month│  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  CONDITIONS OF ACCEPTANCE                             │  │
│  │  • If PO incorrect, contact office immediately        │  │
│  │  • Correct PO number must be on all invoices          │  │
│  │  • Processing order = acceptance of conditions        │  │
│  │  • Materials must meet Australian Standards           │  │
│  │  • ... (8 conditions total)                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## API Contract Example

**GET /api/v1/purchase_orders/:id Response:**

```json
{
  "id": 1,
  "purchase_order_number": "PO-048851",
  "description": "Frame and truss package for Lot 15",
  "required_date": "2025-12-01",
  "delivery_address": "15 Construction Ave\nBrisbane QLD 4000",
  "delivery_lat": -27.470125,
  "delivery_lng": 153.021072,
  "special_instructions": "COLOUR: As per colour selection",
  "supervisor_name": "John Smith",
  "estimator_name": "Sarah Johnson",
  "area_manager_name": "Mike Brown",
  "whs_officer_name": "Emily Davis",
  "remittance_email": "accounts@tekna.com.au",
  "remittance_phone": "07 1234 5678",
  "sub_total": 11318.18,
  "tax": 1131.82,
  "total": 12450.00,
  "status": "draft",
  "company_setting": {
    "company_name": "Tekna Homes",
    "address": "123 Main St, Brisbane QLD 4000",
    "abn": "12 345 678 901",
    "qbcc_number": "1234567",
    "phone": "0407 397 541",
    "email": "robert@tekna.com.au"
  },
  "supplier": {
    "id": 5,
    "name": "Quality Timber Supplies",
    "contact_person": "David Lee",
    "email": "david@qualitytimber.com.au",
    "phone": "07 9876 5432"
  },
  "construction": {
    "id": 10,
    "title": "Lot 15 - Smith Residence",
    "address": "15 Construction Ave, Brisbane QLD 4000"
  },
  "line_items": [
    {
      "id": 1,
      "description": "90x45 F7 Pine Timber",
      "item_code": "TF-90X45-F7",
      "quantity": 120,
      "unit_price": 8.50,
      "tax_type": "gst",
      "notes": "Treated for external use"
    },
    {
      "id": 2,
      "description": "150x50 F8 Hardwood",
      "item_code": "HW-150X50-F8",
      "quantity": 50,
      "unit_price": 22.00,
      "tax_type": "gst",
      "notes": null
    }
  ]
}
```

---

**Status:** ✅ Frontend complete, awaiting backend API updates
**Estimated Backend Work:** 1-2 hours (migrations + serializer updates)
**Design Review:** Matches Midday aesthetic perfectly
