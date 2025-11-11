# Xero Contact Sync - Complete Implementation Summary

## Overview

This implementation adds comprehensive Xero Contact sync support to Trapid, including all missing fields and nested structures (ContactPersons, Addresses, ContactGroups).

---

## ✅ COMPLETED: Backend Implementation

### 1. Database Migrations (All Run Successfully)

**Created Tables:**
- `contact_persons` - Multiple people per contact
- `contact_addresses` - Structured addresses (STREET, POBOX, DELIVERY)
- `contact_groups` - Xero contact groups
- `contact_group_memberships` - Join table for contact-group relationships

**Added Fields to contacts table:**
- `fax_phone` - FAX phone number
- `xero_contact_number` - Xero's contact number
- `xero_contact_status` - ACTIVE/ARCHIVED status
- `xero_account_number` - Account reference number
- `company_number` - Company registration number
- `default_sales_account` - Default sales account code
- `default_discount` - Default discount percentage
- `sales_due_day` - Sales payment due day
- `sales_due_type` - Sales payment type
- `accounts_receivable_outstanding` - AR balance (read-only)
- `accounts_receivable_overdue` - AR overdue (read-only)
- `accounts_payable_outstanding` - AP balance (read-only)
- `accounts_payable_overdue` - AP overdue (read-only)

### 2. Models Created

**Files:**
- `backend/app/models/contact_person.rb` - ✅
- `backend/app/models/contact_address.rb` - ✅
- `backend/app/models/contact_group.rb` - ✅
- `backend/app/models/contact_group_membership.rb` - ✅

**Updated:**
- `backend/app/models/contact.rb` - Added associations and accepts_nested_attributes_for

### 3. Xero Sync Job Updated

**File:** `backend/app/jobs/xero_contact_sync_job.rb`

**Changes:**
- ✅ Added sync for all new scalar fields (fax, discount, account numbers, etc.)
- ✅ Added `sync_contact_persons_from_xero()` method
- ✅ Added `sync_contact_addresses_from_xero()` method
- ✅ Added `sync_contact_groups_from_xero()` method
- ✅ Updated `update_trapid_from_xero()` to call nested sync methods
- ✅ Updated `create_trapid_contact_from_xero()` to sync nested data
- ✅ Updated `build_xero_contact_payload()` to include nested data when syncing TO Xero

**Sync Behavior:**
- Creates/updates/deletes nested records based on Xero data
- Matches addresses by `address_type` (STREET, POBOX, DELIVERY)
- Matches contact persons by `xero_contact_person_id`
- Auto-creates ContactGroup records from Xero
- Manages memberships automatically

### 4. API Controller Updated

**File:** `backend/app/controllers/api/v1/contacts_controller.rb`

**Changes:**
- ✅ Added all new fields to `contact_params`
- ✅ Added nested attributes: `contact_persons_attributes`, `contact_addresses_attributes`
- ✅ Updated `show` method to include nested data in JSON response

---

## 🚧 IN PROGRESS: Frontend Implementation

### Completed

✅ **ContactPersonsSection Component**
- File: `frontend/src/components/contacts/ContactPersonsSection.jsx`
- Full CRUD for contact persons
- Primary contact toggle
- Include in emails checkbox
- Inline editing UI
- Syncs with Xero indicator

### Remaining Work

See [FRONTEND_IMPLEMENTATION_STATUS.md](./FRONTEND_IMPLEMENTATION_STATUS.md) for detailed guide.

**Key Tasks:**
1. Create `ContactAddressesSection.jsx` component (similar pattern to ContactPersonsSection)
2. Update `ContactDetailPage.jsx` to:
   - Import new components
   - Add state for nested data
   - Add handler functions for updates
   - Insert components after Contact Information section
   - Add new scalar fields using existing inline editing pattern
   - Add read-only sections for balances and groups

**Estimated Time:** 3-4 hours

---

## Field Mapping: Trapid ↔ Xero

### Contact Persons
| Trapid Field | Xero Field | Sync Direction |
|--------------|------------|----------------|
| first_name | FirstName | Bidirectional |
| last_name | LastName | Bidirectional |
| email | EmailAddress | Bidirectional |
| include_in_emails | IncludeInEmails | Bidirectional |
| xero_contact_person_id | ContactPersonID | From Xero only |

### Addresses
| Trapid Field | Xero Field | Sync Direction |
|--------------|------------|----------------|
| address_type | AddressType | Bidirectional |
| line1 | AddressLine1 | Bidirectional |
| line2 | AddressLine2 | Bidirectional |
| line3 | AddressLine3 | Bidirectional |
| line4 | AddressLine4 | Bidirectional |
| city | City | Bidirectional |
| region | Region | Bidirectional |
| postal_code | PostalCode | Bidirectional |
| country | Country | Bidirectional |
| attention_to | AttentionTo | Bidirectional |

### New Scalar Fields
| Trapid Field | Xero Field | Sync Direction |
|--------------|------------|----------------|
| fax_phone | Phones[FAX] | Bidirectional |
| xero_contact_number | ContactNumber | From Xero |
| xero_contact_status | ContactStatus | From Xero |
| xero_account_number | AccountNumber | Bidirectional |
| company_number | CompanyNumber | Bidirectional |
| default_sales_account | SalesDetails.AccountCode | Bidirectional |
| default_discount | Discount | Bidirectional |
| sales_due_day | PaymentTerms.Sales.Day | Bidirectional |
| sales_due_type | PaymentTerms.Sales.Type | Bidirectional |
| accounts_receivable_outstanding | Balances.AccountsReceivable.Outstanding | From Xero (read-only) |
| accounts_receivable_overdue | Balances.AccountsReceivable.Overdue | From Xero (read-only) |
| accounts_payable_outstanding | Balances.AccountsPayable.Outstanding | From Xero (read-only) |
| accounts_payable_overdue | Balances.AccountsPayable.Overdue | From Xero (read-only) |

### Contact Groups
| Trapid Field | Xero Field | Sync Direction |
|--------------|------------|----------------|
| xero_contact_group_id | ContactGroupID | From Xero |
| name | Name | From Xero |
| status | Status | From Xero |

---

## Testing the Implementation

### Backend Testing

```bash
# Run Xero sync job
bin/rails runner "XeroContactSyncJob.perform_now"

# Check that nested data is created
bin/rails console
contact = Contact.find_by(xero_id: 'YOUR_XERO_ID')
contact.contact_persons
contact.contact_addresses
contact.contact_groups
```

### API Testing

```bash
# Get contact with nested data
curl http://localhost:3000/api/v1/contacts/382

# Update with nested data
curl -X PATCH http://localhost:3000/api/v1/contacts/382 \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "contact_persons_attributes": [
        {"first_name": "John", "last_name": "Doe", "email": "john@example.com"}
      ]
    }
  }'
```

### Frontend Testing (after completion)

1. Open contact detail page: `http://localhost:5173/contacts/382`
2. Click "Edit" button to unlock page
3. Test adding/editing/deleting contact persons
4. Test adding/editing/deleting addresses
5. Test inline editing for all new fields
6. Click "Save & Lock" to lock page
7. Verify changes persisted after page reload
8. Run Xero sync and verify data updates from Xero

---

## Migration from Old to New

### Old `address` Field Migration

The old text `address` field still exists. To migrate existing addresses:

```ruby
# Migration script (run once)
Contact.where.not(address: [nil, '']).find_each do |contact|
  next if contact.contact_addresses.any?

  contact.contact_addresses.create!(
    address_type: 'STREET',
    line1: contact.address,
    is_primary: true
  )
end
```

---

## Architecture Decisions

### Why Three Separate Tables?

1. **contact_persons**: Xero allows multiple people per contact
2. **contact_addresses**: Xero supports multiple typed addresses (STREET, POBOX, DELIVERY)
3. **contact_groups**: Xero groups can contain many contacts (many-to-many)

### Sync Strategy

- **FROM Xero**: Full sync - creates, updates, and deletes based on Xero data
- **TO Xero**: Incremental sync - only sends Trapid changes to Xero
- **Conflict Resolution**: Xero is source of truth (Xero data overwrites Trapid)

### Primary Contact Person/Address

- Only ONE person can be primary
- Only ONE address can be primary
- Validation in models prevents multiple primaries
- Auto-sets first record as primary if none specified

---

## Documentation

- **Analysis**: [docs/XERO_CONTACT_SYNC_ANALYSIS.md](./docs/XERO_CONTACT_SYNC_ANALYSIS.md)
- **Frontend Guide**: [FRONTEND_IMPLEMENTATION_STATUS.md](./FRONTEND_IMPLEMENTATION_STATUS.md)
- **This Summary**: [XERO_SYNC_IMPLEMENTATION_COMPLETE.md](./XERO_SYNC_IMPLEMENTATION_COMPLETE.md)

---

## Next Steps

1. Complete frontend implementation (see FRONTEND_IMPLEMENTATION_STATUS.md)
2. Test with real Xero data
3. Address any sync issues that arise
4. Consider adding webhooks for real-time sync
5. Add UI for triggering manual sync
6. Add sync status/history tracking

---

## Questions or Issues?

Refer to:
- Xero API Docs: https://developer.xero.com/documentation/api/accounting/contacts
- Backend sync job: `backend/app/jobs/xero_contact_sync_job.rb`
- Models: `backend/app/models/contact*.rb`
- Frontend component: `frontend/src/components/contacts/ContactPersonsSection.jsx`
