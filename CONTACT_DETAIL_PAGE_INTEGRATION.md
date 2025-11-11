# ContactDetailPage.jsx Integration Guide

## Step-by-Step Implementation

### 1. Add Imports (at the top of the file)

Add these imports after the existing import statements:

```javascript
import ContactPersonsSection from '../components/contacts/ContactPersonsSection'
import ContactAddressesSection from '../components/contacts/ContactAddressesSection'
```

### 2. Add State Variables

Find the existing `useState` declarations (around line 60-70) and add:

```javascript
const [contactPersons, setContactPersons] = useState([])
const [contactAddresses, setContactAddresses] = useState([])
const [contactGroups, setContactGroups] = useState([])
```

### 3. Update loadContact() Function

Find the `loadContact` function and after setting the contact data, add:

```javascript
const loadContact = async () => {
  try {
    const response = await api.get(`/api/v1/contacts/${id}`)
    if (response.success) {
      const contactData = response.contact
      setContact(contactData)

      // ADD THESE LINES:
      setContactPersons(contactData.contact_persons || [])
      setContactAddresses(contactData.contact_addresses || [])
      setContactGroups(contactData.contact_groups || [])

      // ... rest of existing code
    }
  } catch (error) {
    console.error('Failed to load contact:', error)
  } finally {
    setLoading(false)
  }
}
```

### 4. Add Handler Functions

Add these two new handler functions (after the existing handler functions):

```javascript
const handleContactPersonsUpdate = async (updatedPersons) => {
  try {
    // Build nested attributes payload
    const contact_persons_attributes = updatedPersons.map(person => {
      if (person.id) {
        // Existing person
        return {
          id: person.id,
          first_name: person.first_name,
          last_name: person.last_name,
          email: person.email,
          include_in_emails: person.include_in_emails,
          is_primary: person.is_primary
        }
      } else {
        // New person
        return {
          first_name: person.first_name,
          last_name: person.last_name,
          email: person.email,
          include_in_emails: person.include_in_emails,
          is_primary: person.is_primary
        }
      }
    })

    const response = await api.patch(`/api/v1/contacts/${id}`, {
      contact: { contact_persons_attributes }
    })

    if (response.success) {
      await loadContact() // Reload to get updated data with IDs
    }
  } catch (error) {
    console.error('Failed to update contact persons:', error)
    alert('Failed to update contact persons')
  }
}

const handleContactAddressesUpdate = async (updatedAddresses) => {
  try {
    // Build nested attributes payload
    const contact_addresses_attributes = updatedAddresses.map(address => {
      if (address.id) {
        // Existing address
        return {
          id: address.id,
          address_type: address.address_type,
          line1: address.line1,
          line2: address.line2,
          line3: address.line3,
          line4: address.line4,
          city: address.city,
          region: address.region,
          postal_code: address.postal_code,
          country: address.country,
          attention_to: address.attention_to,
          is_primary: address.is_primary
        }
      } else {
        // New address
        return {
          address_type: address.address_type,
          line1: address.line1,
          line2: address.line2,
          line3: address.line3,
          line4: address.line4,
          city: address.city,
          region: address.region,
          postal_code: address.postal_code,
          country: address.country,
          attention_to: address.attention_to,
          is_primary: address.is_primary
        }
      }
    })

    const response = await api.patch(`/api/v1/contacts/${id}`, {
      contact: { contact_addresses_attributes }
    })

    if (response.success) {
      await loadContact() // Reload to get updated data with IDs
    }
  } catch (error) {
    console.error('Failed to update contact addresses:', error)
    alert('Failed to update contact addresses')
  }
}
```

### 5. Insert New Sections in JSX

Find the "Contact Information" section (search for "Contact Information") and AFTER it ends (after its closing `</div>`), insert:

```jsx
{/* Contact Persons Section */}
<ContactPersonsSection
  contactPersons={contactPersons}
  onUpdate={handleContactPersonsUpdate}
  isEditMode={isPageEditMode}
  contactId={id}
/>

{/* Addresses Section */}
<ContactAddressesSection
  contactAddresses={contactAddresses}
  onUpdate={handleContactAddressesUpdate}
  isEditMode={isPageEditMode}
  contactId={id}
/>
```

### 6. Add New Xero Fields to Existing Sections

#### In Contact Information Section (find the office_phone field and add after it):

```jsx
{/* Fax Phone with inline editing */}
<div className="flex items-start gap-3">
  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
  <div className="flex-1">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fax Phone</p>
    {editingXeroFields['fax_phone'] ? (
      <div className="flex items-center gap-2">
        <input
          type="tel"
          value={xeroFieldValues['fax_phone'] || ''}
          onChange={(e) => handleXeroFieldChange('fax_phone', e.target.value)}
          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          autoFocus
        />
        <button onClick={() => saveXeroField('fax_phone')} className="text-green-600 hover:text-green-700 dark:text-green-400">
          <CheckCircleIcon className="h-5 w-5" />
        </button>
        <button onClick={() => cancelEditingXeroField('fax_phone')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2 group">
        {contact.fax_phone ? (
          <a href={`tel:${contact.fax_phone}`} className="text-gray-900 dark:text-white flex-1">
            {contact.fax_phone}
          </a>
        ) : (
          <p className="text-gray-900 dark:text-white flex-1">-</p>
        )}
        {isPageEditMode && (
          <button onClick={() => startEditingXeroField('fax_phone')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    )}
  </div>
</div>

{/* Company Number with inline editing */}
<div className="flex items-start gap-3">
  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
  <div className="flex-1">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Company Number</p>
    {editingXeroFields['company_number'] ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={xeroFieldValues['company_number'] || ''}
          onChange={(e) => handleXeroFieldChange('company_number', e.target.value)}
          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          autoFocus
        />
        <button onClick={() => saveXeroField('company_number')} className="text-green-600 hover:text-green-700 dark:text-green-400">
          <CheckCircleIcon className="h-5 w-5" />
        </button>
        <button onClick={() => cancelEditingXeroField('company_number')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2 group">
        <p className="text-gray-900 dark:text-white flex-1">{contact.company_number || '-'}</p>
        {isPageEditMode && contact.sync_with_xero && (
          <button onClick={() => startEditingXeroField('company_number')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    )}
  </div>
</div>
```

Note: You'll need to add `BuildingOfficeIcon` to the imports if not already there.

#### In Purchase & Payment Settings Section (add at the end before closing `</div>`):

```jsx
{/* Sales Payment Terms */}
<div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sales Due Day</p>
    {editingXeroFields['sales_due_day'] ? (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={xeroFieldValues['sales_due_day'] || ''}
          onChange={(e) => handleXeroFieldChange('sales_due_day', e.target.value)}
          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          autoFocus
        />
        <button onClick={() => saveXeroField('sales_due_day')} className="text-green-600">
          <CheckCircleIcon className="h-5 w-5" />
        </button>
        <button onClick={() => cancelEditingXeroField('sales_due_day')} className="text-gray-600">
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2 group">
        <p className="text-gray-900 dark:text-white flex-1">{contact.sales_due_day || '-'}</p>
        {isPageEditMode && contact.sync_with_xero && (
          <button onClick={() => startEditingXeroField('sales_due_day')} className="opacity-0 group-hover:opacity-100 text-indigo-600">
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    )}
  </div>

  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sales Due Type</p>
    {editingXeroFields['sales_due_type'] ? (
      <div className="flex items-center gap-2">
        <select
          value={xeroFieldValues['sales_due_type'] || ''}
          onChange={(e) => handleXeroFieldChange('sales_due_type', e.target.value)}
          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          autoFocus
        >
          <option value="">Select type</option>
          <option value="DAYSAFTERBILLDATE">Days After Bill Date</option>
          <option value="DAYSAFTERBILLMONTH">Days After Bill Month</option>
          <option value="OFCURRENTMONTH">Of Current Month</option>
          <option value="OFFOLLOWINGMONTH">Of Following Month</option>
        </select>
        <button onClick={() => saveXeroField('sales_due_type')} className="text-green-600">
          <CheckCircleIcon className="h-5 w-5" />
        </button>
        <button onClick={() => cancelEditingXeroField('sales_due_type')} className="text-gray-600">
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2 group">
        <p className="text-gray-900 dark:text-white flex-1">{contact.sales_due_type || '-'}</p>
        {isPageEditMode && contact.sync_with_xero && (
          <button onClick={() => startEditingXeroField('sales_due_type')} className="opacity-0 group-hover:opacity-100 text-indigo-600">
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    )}
  </div>
</div>

{/* Default Sales Account */}
<div className="pt-4">
  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Default Sales Account</p>
  {editingXeroFields['default_sales_account'] ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={xeroFieldValues['default_sales_account'] || ''}
        onChange={(e) => handleXeroFieldChange('default_sales_account', e.target.value)}
        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        autoFocus
      />
      <button onClick={() => saveXeroField('default_sales_account')} className="text-green-600">
        <CheckCircleIcon className="h-5 w-5" />
      </button>
      <button onClick={() => cancelEditingXeroField('default_sales_account')} className="text-gray-600">
        <XCircleIcon className="h-5 w-5" />
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2 group">
      <p className="text-gray-900 dark:text-white flex-1">{contact.default_sales_account || '-'}</p>
      {isPageEditMode && contact.sync_with_xero && (
        <button onClick={() => startEditingXeroField('default_sales_account')} className="opacity-0 group-hover:opacity-100 text-indigo-600">
          <PencilIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )}
</div>

{/* Default Discount */}
<div className="pt-4">
  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Default Discount (%)</p>
  {editingXeroFields['default_discount'] ? (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        value={xeroFieldValues['default_discount'] || ''}
        onChange={(e) => handleXeroFieldChange('default_discount', e.target.value)}
        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        autoFocus
      />
      <button onClick={() => saveXeroField('default_discount')} className="text-green-600">
        <CheckCircleIcon className="h-5 w-5" />
      </button>
      <button onClick={() => cancelEditingXeroField('default_discount')} className="text-gray-600">
        <XCircleIcon className="h-5 w-5" />
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2 group">
      <p className="text-gray-900 dark:text-white flex-1">
        {contact.default_discount ? `${contact.default_discount}%` : '-'}
      </p>
      {isPageEditMode && contact.sync_with_xero && (
        <button onClick={() => startEditingXeroField('default_discount')} className="opacity-0 group-hover:opacity-100 text-indigo-600">
          <PencilIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )}
</div>
```

### 7. Add New Read-Only Sections

Add these sections anywhere after the Bank Account Details section:

```jsx
{/* Account Balances (Read-only from Xero) */}
{contact.sync_with_xero && (contact.accounts_receivable_outstanding || contact.accounts_payable_outstanding) && (
  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Balances</h3>
      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24" title="From Xero (Read-only)">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span className="text-xs text-gray-500 dark:text-gray-400">(Read-only from Xero)</span>
    </div>
    <div className="grid grid-cols-2 gap-6">
      {(contact.accounts_receivable_outstanding || contact.accounts_receivable_overdue) && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accounts Receivable</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Outstanding: <span className="font-medium text-gray-900 dark:text-white">
                ${Number(contact.accounts_receivable_outstanding || 0).toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overdue: <span className="font-medium text-red-600 dark:text-red-400">
                ${Number(contact.accounts_receivable_overdue || 0).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      )}
      {(contact.accounts_payable_outstanding || contact.accounts_payable_overdue) && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accounts Payable</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Outstanding: <span className="font-medium text-gray-900 dark:text-white">
                ${Number(contact.accounts_payable_outstanding || 0).toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overdue: <span className="font-medium text-red-600 dark:text-red-400">
                ${Number(contact.accounts_payable_overdue || 0).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* Xero Contact Groups (Read-only) */}
{contact.sync_with_xero && contactGroups && contactGroups.length > 0 && (
  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Xero Contact Groups</h3>
      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24" title="From Xero (Read-only)">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span className="text-xs text-gray-500 dark:text-gray-400">(Read-only from Xero)</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {contactGroups.map(group => (
        <span
          key={group.id}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
        >
          {group.name}
          {group.status === 'DELETED' && (
            <span className="ml-1 text-xs">(Deleted)</span>
          )}
        </span>
      ))}
    </div>
  </div>
)}
```

## Summary

After making these changes, your ContactDetailPage will:

1. ✅ Display and edit contact persons (CRUD)
2. ✅ Display and edit addresses (CRUD)
3. ✅ Display contact groups (read-only)
4. ✅ Display account balances (read-only)
5. ✅ Edit all new Xero fields inline
6. ✅ Show sync status for all Xero data
7. ✅ Respect edit/lock mode for all sections

The components handle all the complexity of adding/editing/deleting nested records, and the handler functions properly format the data for the Rails nested attributes API.
