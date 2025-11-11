# Sync Status Badges Implementation Guide

## Status Logic

For each Xero-synced field, determine status based on:

```javascript
const getSyncStatus = (contact) => {
  if (!contact.sync_with_xero) {
    return 'not_enabled' // Gray badge or no badge
  }

  if (contact.xero_sync_error) {
    return 'failed' // Red badge with X icon
  }

  if (contact.last_synced_at && contact.xero_id) {
    return 'synced' // Green badge with check icon
  }

  if (contact.sync_with_xero && !contact.xero_id) {
    return 'pending' // Yellow badge
  }

  return 'unknown'
}
```

## Badge Components

### Helper Function (add to ContactDetailPage.jsx):

```javascript
const renderSyncStatusBadge = () => {
  if (!contact.sync_with_xero) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Not Syncing
      </span>
    )
  }

  if (contact.xero_sync_error) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
        <XCircleIcon className="h-3 w-3" />
        Sync Failed
      </span>
    )
  }

  if (contact.last_synced_at && contact.xero_id) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
        <CheckCircleIcon className="h-3 w-3" />
        Synced
      </span>
    )
  }

  if (contact.sync_with_xero && !contact.xero_id) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Pending Sync
      </span>
    )
  }

  return null
}
```

## Where to Display Badges

### 1. Next to Section Titles

For sections that sync with Xero (Bank Account Details, Purchase & Payment Settings):

```jsx
<div className="flex items-center gap-2 mb-4">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
    Bank Account Details
  </h3>
  <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24" title="Syncs with Xero">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
  {renderSyncStatusBadge()}
</div>
```

### 2. In Contact Information Section (Top)

Add a prominent sync status indicator at the top of the page:

```jsx
{contact.sync_with_xero && (
  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-4 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Xero Integration</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {contact.last_synced_at
              ? `Last synced: ${new Date(contact.last_synced_at).toLocaleString()}`
              : 'Not yet synced'
            }
          </p>
        </div>
      </div>
      {renderSyncStatusBadge()}
    </div>

    {contact.xero_sync_error && (
      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
        <p className="text-sm text-red-800 dark:text-red-200 font-medium">Sync Error:</p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{contact.xero_sync_error}</p>
      </div>
    )}

    {contact.xero_id && (
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Xero ID: {contact.xero_id}
      </div>
    )}
  </div>
)}
```

## Example with Bank Account Details Section

```jsx
<div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Bank Account Details
      </h3>
      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24" title="Syncs with Xero">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
    {renderSyncStatusBadge()}
  </div>

  {/* Field content here */}
</div>
```

## Status Badge Colors

| Status | Background | Text | Icon |
|--------|------------|------|------|
| Synced | Green (`bg-green-100`) | Dark Green | CheckCircleIcon ✓ |
| Failed | Red (`bg-red-100`) | Dark Red | XCircleIcon ✗ |
| Pending | Yellow (`bg-yellow-100`) | Dark Yellow | Clock/Info icon |
| Not Syncing | Gray (`bg-gray-100`) | Gray | Info icon |

## Testing the Badges

To test different states:

### 1. Enable Xero Sync (Pending State):
```bash
curl -X PATCH http://localhost:3001/api/v1/contacts/382 \
  -H "Content-Type: application/json" \
  -d '{"contact": {"sync_with_xero": true}}'
```

### 2. Run Xero Sync (Synced State):
```bash
bin/rails runner "XeroContactSyncJob.perform_now"
```

### 3. Simulate Error (Failed State):
```bash
# Manually set error in Rails console
Contact.find(382).update(xero_sync_error: "Failed to connect to Xero API")
```

### 4. Disable Sync (Not Syncing State):
```bash
curl -X PATCH http://localhost:3001/api/v1/contacts/382 \
  -H "Content-Type: application/json" \
  -d '{"contact": {"sync_with_xero": false}}'
```

## Import Required Icons

Make sure these are imported at the top of ContactDetailPage.jsx:

```javascript
import {
  CheckCircleIcon,
  XCircleIcon,
  // ... other icons
} from '@heroicons/react/24/outline'
```

## Summary

The sync status badges will:
- ✅ Show green check when successfully synced
- ✅ Show red X when sync failed with error message
- ✅ Show yellow pending when enabled but not yet synced
- ✅ Show gray "not syncing" when sync_with_xero is false/null
- ✅ Display last sync time when available
- ✅ Display Xero ID when linked
- ✅ Display error details when sync fails
