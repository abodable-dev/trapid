# Updated Inline Editing Pattern

## Remove Double-Layer Editing

Instead of having an "Edit" button AND pencil icons on each field, we should:

1. When page is **locked** (not in edit mode):
   - Show all fields as read-only
   - Show single "Edit" button at top
   - NO pencil icons visible

2. When page is **unlocked** (in edit mode):
   - Add visible border to all editable fields
   - Click directly on field to edit
   - NO pencil icons needed
   - Show "Save & Lock" and "Cancel" buttons at top

## Updated Field Pattern

### OLD Pattern (with pencil icons):
```jsx
{editingXeroFields['email'] ? (
  // Edit mode with input
) : (
  <div className="flex items-center gap-2 group">
    {contact.email}
    {isPageEditMode && (
      <button onClick={() => startEditingXeroField('email')}>
        <PencilIcon className="h-4 w-4" />  ❌ REMOVE THIS
      </button>
    )}
  </div>
)}
```

### NEW Pattern (click to edit with border):
```jsx
{editingXeroFields['email'] ? (
  // Edit mode with input and save/cancel buttons
  <div className="flex items-center gap-2">
    <input
      type="email"
      value={xeroFieldValues['email'] || ''}
      onChange={(e) => handleXeroFieldChange('email', e.target.value)}
      className="flex-1 px-2 py-1 text-sm rounded border border-gray-300"
      autoFocus
    />
    <button onClick={() => saveXeroField('email')}>
      <CheckCircleIcon className="h-5 w-5" />
    </button>
    <button onClick={() => cancelEditingXeroField('email')}>
      <XCircleIcon className="h-5 w-5" />
    </button>
  </div>
) : (
  // Display mode - clickable when unlocked
  <div
    onClick={() => isPageEditMode && startEditingXeroField('email')}
    className={`
      ${isPageEditMode ? 'cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 rounded px-2 py-1' : ''}
    `}
  >
    {contact.email ? (
      <a href={`mailto:${contact.email}`} className="text-blue-600">
        {contact.email}
      </a>
    ) : (
      <span className="text-gray-500">Click to add</span>
    )}
  </div>
)}
```

## Visual Indicator CSS Classes

When `isPageEditMode` is true, add these classes to editable fields:

```jsx
className={`
  ${isPageEditMode
    ? 'cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 rounded px-2 py-1 transition-colors'
    : ''
  }
`}
```

This gives:
- ✅ Dashed blue border indicating "click to edit"
- ✅ Cursor changes to pointer on hover
- ✅ Border highlights on hover
- ✅ No extra pencil icon clutter

## Example Implementation

### Email Field (Complete):

```jsx
<div className="flex items-start gap-3">
  <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
  <div className="flex-1">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
    {editingXeroFields['email'] ? (
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={xeroFieldValues['email'] || ''}
          onChange={(e) => handleXeroFieldChange('email', e.target.value)}
          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          autoFocus
        />
        <button
          onClick={() => saveXeroField('email')}
          className="text-green-600 hover:text-green-700 dark:text-green-400"
        >
          <CheckCircleIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => cancelEditingXeroField('email')}
          className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    ) : (
      <div
        onClick={() => isPageEditMode && startEditingXeroField('email')}
        className={`
          ${isPageEditMode
            ? 'cursor-pointer border-2 border-dashed border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400 rounded px-2 py-1 transition-colors'
            : ''
          }
        `}
      >
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            onClick={(e) => {
              if (isPageEditMode) {
                e.preventDefault() // Prevent email link when in edit mode
              }
            }}
          >
            {contact.email}
          </a>
        ) : (
          <span className="text-gray-400 italic">Click to add email</span>
        )}
      </div>
    )}
  </div>
</div>
```

## Apply to All Editable Fields

Apply this pattern to:
- ✅ email
- ✅ mobile_phone
- ✅ office_phone
- ✅ fax_phone
- ✅ address (text field)
- ✅ tax_number (ABN)
- ✅ company_number
- ✅ bank_bsb
- ✅ bank_account_number
- ✅ bank_account_name
- ✅ default_purchase_account
- ✅ default_sales_account
- ✅ bill_due_day
- ✅ bill_due_type
- ✅ sales_due_day
- ✅ sales_due_type
- ✅ default_discount

## Benefits

1. ✅ Single level of editing (page-level unlock)
2. ✅ Cleaner UI without pencil icon clutter
3. ✅ Visual borders clearly show editable fields
4. ✅ Direct click to edit is more intuitive
5. ✅ Consistent with global edit/lock pattern

## ContactPersonsSection & ContactAddressesSection

These components are already correct! They:
- ✅ Only show edit/delete icons when `isEditMode={true}`
- ✅ No double-layer editing
- ✅ Have "Add Person" / "Add Address" buttons that only appear in edit mode

No changes needed for those components.
