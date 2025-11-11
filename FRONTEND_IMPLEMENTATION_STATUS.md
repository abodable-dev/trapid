# Frontend Implementation Status

## ✅ Completed

### Backend
- ✅ All database migrations created and run
- ✅ ContactPerson, ContactAddress, ContactGroup, ContactGroupMembership models created
- ✅ Contact model updated with associations
- ✅ XeroContactSyncJob fully updated to sync all fields including nested structures
- ✅ contacts_controller.rb updated with nested attributes
- ✅ Contact serialization includes nested data

### Frontend
- ✅ ContactPersonsSection component created at `frontend/src/components/contacts/ContactPersonsSection.jsx`

## 🚧 Remaining Frontend Work

### 1. Create ContactAddressesSection Component
File: `frontend/src/components/contacts/ContactAddressesSection.jsx`

Similar to ContactPersonsSection but for addresses with fields:
- address_type (STREET, POBOX, DELIVERY)
- line1, line2, line3, line4
- city, region, postal_code, country
- attention_to
- is_primary checkbox

### 2. Update ContactDetailPage.jsx

**Import new components:**
```javascript
import ContactPersonsSection from '../components/contacts/ContactPersonsSection'
import ContactAddressesSection from '../components/contacts/ContactAddressesSection'
```

**Add new state for nested data:**
```javascript
const [contactPersons, setContactPersons] = useState([])
const [contactAddresses, setContactAddresses] = useState([])
```

**In loadContact(), extract nested data:**
```javascript
setContactPersons(contactData.contact_persons || [])
setContactAddresses(contactData.contact_addresses || [])
```

**Add handler functions:**
```javascript
const handleContactPersonsUpdate = async (updatedPersons) => {
  // Send PATCH request with contact_persons_attributes
}

const handleContactAddressesUpdate = async (updatedAddresses) => {
  // Send PATCH request with contact_addresses_attributes
}
```

**Add new sections in JSX (after Contact Information section):**
```jsx
<ContactPersonsSection
  contactPersons={contactPersons}
  onUpdate={handleContactPersonsUpdate}
  isEditMode={isPageEditMode}
  contactId={id}
/>

<ContactAddressesSection
  contactAddresses={contactAddresses}
  onUpdate={handleContactAddressesUpdate}
  isEditMode={isPageEditMode}
  contactId={id}
/>
```

**Add new Xero fields to Purchase & Payment Settings section:**
- fax_phone (inline editable)
- sales_due_day, sales_due_type (inline editable)
- default_sales_account (inline editable)
- default_discount (inline editable)
- company_number (inline editable)
- xero_contact_number (read-only display)
- xero_account_number (inline editable)

**Add Account Balances section (read-only display):**
```jsx
{contact.accounts_receivable_outstanding && (
  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6">
    <h3>Account Balances (From Xero)</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p>Accounts Receivable Outstanding: ${contact.accounts_receivable_outstanding}</p>
        <p>Accounts Receivable Overdue: ${contact.accounts_receivable_overdue}</p>
      </div>
      <div>
        <p>Accounts Payable Outstanding: ${contact.accounts_payable_outstanding}</p>
        <p>Accounts Payable Overdue: ${contact.accounts_payable_overdue}</p>
      </div>
    </div>
  </div>
)}
```

**Add Contact Groups display (read-only):**
```jsx
{contact.contact_groups && contact.contact_groups.length > 0 && (
  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6">
    <h3>Xero Contact Groups</h3>
    <div className="flex flex-wrap gap-2">
      {contact.contact_groups.map(group => (
        <span key={group.id} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm">
          {group.name}
        </span>
      ))}
    </div>
  </div>
)}
```

## Testing Checklist

1. Test Xero sync with contact that has multiple contact persons
2. Test Xero sync with contact that has multiple addresses
3. Test adding/editing/deleting contact persons in UI
4. Test adding/editing/deleting addresses in UI
5. Test all new inline editable fields
6. Test that sync status indicators work for nested data
7. Test primary person/address toggle
8. Verify data persists after page reload
9. Test with contacts that have no nested data (empty arrays)
10. Test contact groups display

## Quick Implementation Guide

Due to the large size of ContactDetailPage.jsx, the easiest approach is:

1. Create ContactAddressesSection component (similar to ContactPersonsSection)
2. Import both new components into ContactDetailPage
3. Add state and handlers for nested data
4. Insert the two new section components after the Contact Information section
5. Add new scalar fields to existing sections using the same inline editing pattern
6. Add read-only sections for balances and groups

The inline editing pattern is already established in the file - just follow the same pattern for new fields.
