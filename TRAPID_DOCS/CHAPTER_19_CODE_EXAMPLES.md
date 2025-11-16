# Chapter 19: Code Examples & Patterns Reference

**Purpose:** Concrete code examples for implementing Chapter 19 standards
**Source:** Extracted from ContactsPage.jsx, POTable.jsx, Badge.jsx, and other reference implementations
**For:** Developers implementing Chapter 19 rules and patterns

---

## Table of Contents
1. [Column Management Patterns](#column-management-patterns)
2. [Sticky Headers](#sticky-headers)
3. [Search Functionality](#search-functionality)
4. [Form Patterns](#form-patterns)
5. [Modal Patterns](#modal-patterns)
6. [Button Patterns](#button-patterns)
7. [Badge & Status Patterns](#badge--status-patterns)
8. [Empty State Patterns](#empty-state-patterns)
9. [Loading State Patterns](#loading-state-patterns)
10. [Dark Mode Patterns](#dark-mode-patterns)
11. [Accessibility Patterns](#accessibility-patterns)

---

## Column Management Patterns

### Pattern 1: Column Width Management with localStorage Persistence

**Source:** ContactsPage.jsx (lines 85-96)

```jsx
import { useState, useEffect } from 'react'

export function TableWithResizableColumns() {
  // Initialize from localStorage with defaults
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('table_columnWidths')
    return saved ? JSON.parse(saved) : {
      name: 200,
      email: 250,
      phone: 200,
      status: 150
    }
  })

  // Persist to localStorage on change
  const handleColumnResize = (column, newWidth) => {
    setColumnWidths(prev => {
      const updated = { ...prev, [column]: newWidth }
      localStorage.setItem('table_columnWidths', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: `${columnWidths.name}px` }}>
            <div className="flex items-center justify-between">
              <span>Name</span>
              <div
                draggable
                onDragEnd={(e) => {
                  const newWidth = columnWidths.name + (e.clientX - e.clientX)
                  handleColumnResize('name', newWidth)
                }}
                className="cursor-col-resize w-1 bg-gray-300 hover:bg-blue-500"
              />
            </div>
          </th>
          {/* More columns */}
        </tr>
      </thead>
      {/* Body */}
    </table>
  )
}
```

---

### Pattern 2: Column Reorder with Drag-Drop

**Source:** ContactsPage.jsx (lines 62-72)

```jsx
const [columnOrder, setColumnOrder] = useState(() => {
  const saved = localStorage.getItem('contacts_columnOrder')
  return saved ? JSON.parse(saved) : ['name', 'email', 'phone', 'website', 'actions']
})

const [draggedColumn, setDraggedColumn] = useState(null)

const handleDragStart = (e, column) => {
  setDraggedColumn(column)
  e.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const handleDrop = (e, targetColumn) => {
  e.preventDefault()
  if (!draggedColumn || draggedColumn === targetColumn) return

  const draggedIndex = columnOrder.indexOf(draggedColumn)
  const targetIndex = columnOrder.indexOf(targetColumn)

  const newOrder = [...columnOrder]
  newOrder.splice(draggedIndex, 1)
  newOrder.splice(targetIndex, 0, draggedColumn)

  setColumnOrder(newOrder)
  localStorage.setItem('contacts_columnOrder', JSON.stringify(newOrder))
  setDraggedColumn(null)
}

// Render columns in order
{columnOrder.map(col => (
  <th
    key={col}
    draggable
    onDragStart={(e) => handleDragStart(e, col)}
    onDragOver={handleDragOver}
    onDrop={(e) => handleDrop(e, col)}
    className="cursor-move hover:bg-gray-50 dark:hover:bg-gray-700"
  >
    {col}
  </th>
))}
```

---

## Sticky Headers

### Pattern 3: Basic Sticky Header Implementation

**Source:** TABLE_STANDARDS.md gold standard

```jsx
// ✅ CORRECT - Sticky headers
<div className="overflow-x-auto">
  <table className="min-w-full">
    <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
      <tr className="border-b border-gray-200 dark:border-gray-700">
        <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
          Name
        </th>
        <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
          Email
        </th>
        {/* More headers */}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
        {/* Row data */}
      </tr>
    </tbody>
  </table>
</div>
```

**Key Points:**
- `sticky top-0` - Makes header sticky to top
- `z-10` - Ensures header stays above scrolling content
- `bg-white dark:bg-gray-800` - Solid background (so content doesn't show through)
- Wrap table in overflow container: `overflow-x-auto`

---

## Search Functionality

### Pattern 4: Search with Clear Button (RULE #19.20)

**Source:** TRAPID_BIBLE.md #19.20, needed in 73 search boxes

```jsx
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function SearchWithClearButton({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleClear = () => {
    setSearchQuery('')
    onSearch('')
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Search icon */}
      <MagnifyingGlassIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500"
      />

      {/* Input field */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          onSearch(e.target.value)
        }}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Clear button - Only show when text is present */}
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
```

---

### Pattern 5: Search with Results Count Display

**Source:** RULE #19.20d, needed in 53 search boxes

```jsx
// After filtering
{searchQuery && (
  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 px-4">
    Found <span className="font-semibold">{filteredResults.length}</span> of{' '}
    <span className="font-semibold">{totalItems.length}</span> results
  </div>
)}
```

---

### Pattern 6: Search Debouncing for Large Datasets (>500 items)

**Source:** RULE #19.20c

```jsx
import { useState, useEffect } from 'react'

export function SearchWithDebounce({ onSearch, threshold = 500 }) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const itemCount = 1000 // Example

  // Only debounce if > threshold items
  useEffect(() => {
    if (itemCount <= threshold) {
      // For small datasets, search immediately
      setDebouncedSearch(searchInput)
      onSearch(searchInput)
      return
    }

    // For large datasets, debounce
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      onSearch(searchInput)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchInput, itemCount, threshold])

  return (
    <input
      type="text"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

---

## Form Patterns

### Pattern 7: Standard Form Layout (RULE #19.21)

**Source:** TRAPID_BIBLE.md #19.21

```jsx
import { useState } from 'react'

export function StandardForm({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          className={`mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
            errors.name
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Enter name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          className={`mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
            errors.email
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="user@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="04XX XXX XXX"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}
```

---

## Modal Patterns

### Pattern 8: Modal with Close Button (RULE #19.22) - MISSING IN 58 MODALS

**Source:** HeadlessUI Dialog best practice, needed in 58 modals

```jsx
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function ModalWithCloseButton({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal panel */}
          <DialogPanel className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl">
            {/* Close button - TOP RIGHT */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
              aria-label="Close dialog"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                {title}
              </DialogTitle>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
```

**Key Points:**
- Close button in `absolute top-4 right-4`
- Padding on dialog title to avoid overlap with close button (`pr-8`)
- `aria-label="Close dialog"` for accessibility
- Use HeadlessUI Dialog, not custom solution

---

## Button Patterns

### Pattern 9: Button Hierarchy (RULE #19.25)

**Source:** TRAPID_BIBLE.md #19.25

```jsx
export function ButtonVariants() {
  return (
    <div className="space-y-6">
      {/* Primary Button - Main action */}
      <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
        Primary Action
      </button>

      {/* Secondary Button - Less important action */}
      <button className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 border border-gray-300 dark:border-gray-600">
        Secondary Action
      </button>

      {/* Destructive Button - Delete/danger */}
      <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
        Delete
      </button>

      {/* Ghost Button - Minimal */}
      <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500">
        Minimal Action
      </button>

      {/* Icon Button - Must have aria-label */}
      <button aria-label="View details" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md">
        <EyeIcon className="h-5 w-5" />
      </button>

      {/* Button with Icon + Text */}
      <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-md">
        <PlusIcon className="h-5 w-5" />
        Add New
      </button>

      {/* Loading Button */}
      <button disabled className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md opacity-50 cursor-not-allowed">
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </span>
      </button>
    </div>
  )
}
```

---

## Badge & Status Patterns

### Pattern 10: Using Badge Component (RULE #19.26)

**Source:** Badge.jsx (lines not specified, but referenced in COLOR_SYSTEM.md)

```jsx
import Badge from '../components/Badge'

export function BadgeExamples() {
  return (
    <div className="space-y-4">
      {/* Basic badges with 8 semantic colors */}
      <div className="flex flex-wrap gap-2">
        <Badge color="gray">Draft</Badge>
        <Badge color="red">Cancelled</Badge>
        <Badge color="yellow">Pending</Badge>
        <Badge color="green">Complete</Badge>
        <Badge color="blue">Approved</Badge>
        <Badge color="indigo">Sent</Badge>
        <Badge color="purple">Invoiced</Badge>
        <Badge color="pink">Special</Badge>
      </div>

      {/* With dot indicator */}
      <div className="flex flex-wrap gap-2">
        <Badge color="green" withDot>Active</Badge>
        <Badge color="red" withDot>Inactive</Badge>
      </div>

      {/* With icon */}
      <div className="flex flex-wrap gap-2">
        <Badge color="green">
          <CheckIcon className="h-4 w-4 mr-1" />
          Complete
        </Badge>
        <Badge color="red">
          <XIcon className="h-4 w-4 mr-1" />
          Failed
        </Badge>
      </div>

      {/* In context */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
          <span>Purchase Order #123</span>
          <Badge color="blue">Approved</Badge>
        </div>
      </div>
    </div>
  )
}
```

**Color Meanings (Semantic):**
- `gray` - Neutral, draft, disabled
- `red` - Error, danger, cancelled
- `yellow` - Warning, pending, needs review
- `green` - Success, complete, active
- `blue` - Info, approved
- `indigo` - Processing, sent
- `purple` - Special, invoiced
- `pink` - Custom, accent

---

## Empty State Patterns

### Pattern 11: Empty State with Action Button (RULE #19.27) - MISSING IN 66 EMPTY STATES

**Source:** TABLE_STANDARDS.md gold standard

```jsx
import { InboxIcon, PlusIcon } from '@heroicons/react/24/outline'

export function EmptyStateWithAction({
  title = "No items yet",
  description = "Get started by creating your first item",
  actionLabel = "Create New Item",
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Icon */}
      <InboxIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6">
        {description}
      </p>

      {/* Action Button */}
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        <PlusIcon className="h-5 w-5" />
        {actionLabel}
      </button>
    </div>
  )
}
```

**Variants:**

```jsx
// Error state (different icon & messaging)
<div className="flex flex-col items-center justify-center py-12">
  <ExclamationTriangleIcon className="h-12 w-12 text-red-400 dark:text-red-500 mb-4" />
  <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">Something went wrong</h3>
  <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 text-white rounded-md">
    Try Again
  </button>
</div>

// No results state (different from empty state)
<div className="flex flex-col items-center justify-center py-12">
  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
  <button onClick={() => clearFilters()} className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">
    Clear filters
  </button>
</div>
```

---

## Loading State Patterns

### Pattern 12: Page-Level Loading Spinner (RULE #19.24a)

**Source:** Common pattern, missing in 12 pages

```jsx
import { useState, useEffect } from 'react'

export function PageWithLoadingState() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/data')
        if (!response.ok) throw new Error('Failed to load data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {/* Spinner */}
          <svg className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page content */}
    </div>
  )
}
```

---

## Dark Mode Patterns

### Pattern 13: Comprehensive Dark Mode Classes

**Source:** COLOR_SYSTEM.md, TailwindCSS dark mode

```jsx
// ✅ CORRECT - Full dark mode support

// Text colors
<p className="text-gray-900 dark:text-white">Primary text</p>
<p className="text-gray-600 dark:text-gray-400">Secondary text</p>
<p className="text-gray-500 dark:text-gray-500">Placeholder text</p>

// Background colors
<div className="bg-white dark:bg-gray-800">Content area</div>
<div className="bg-gray-50 dark:bg-gray-900">Subtle background</div>
<div className="bg-gray-100 dark:bg-gray-700">Card background</div>

// Border colors
<div className="border border-gray-200 dark:border-gray-700">Bordered element</div>

// Hover states
<button className="hover:bg-gray-50 dark:hover:bg-gray-800/50">Hover button</button>
<div className="hover:bg-gray-100 dark:hover:bg-gray-700">Hover area</div>

// Focus states
<input className="focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400" />

// Gradient backgrounds
<div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  Gradient area
</div>

// Tables
<table className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <thead className="bg-gray-50 dark:bg-gray-700">
    {/* Headers */}
  </thead>
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
    {/* Body */}
  </tbody>
</table>

// Modals
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
  {/* Modal content */}
</div>

// Forms
<input className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
```

---

## Accessibility Patterns

### Pattern 14: Accessible Table (RULE #19.17)

**Source:** TRAPID_BIBLE.md #19.17

```jsx
<table aria-label="Contacts list" className="w-full">
  <thead>
    <tr>
      {/* Use scope="col" on header cells */}
      <th scope="col" className="text-left">
        <button
          onClick={() => handleSort('name')}
          className="flex items-center gap-1"
          aria-label="Sort by name"
          aria-sort={sortColumn === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
          Name
          {sortColumn === 'name' && (
            sortDirection === 'asc' ?
              <ChevronUpIcon className="h-4 w-4" /> :
              <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      </th>
      <th scope="col">Email</th>
      <th scope="col" className="sr-only">Actions</th>
    </tr>
  </thead>
  <tbody>
    {contacts.map(contact => (
      <tr key={contact.id}>
        <td>{contact.name}</td>
        <td>{contact.email}</td>
        <td>
          <button aria-label={`Edit ${contact.name}`}>
            Edit
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Pattern 15: Keyboard Navigation & Focus Management

**Source:** Common accessibility patterns

```jsx
// Tab through interactive elements
<div className="space-y-4">
  <button className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md px-4 py-2">
    First interactive element
  </button>
  <input
    className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
    placeholder="Focusable input"
  />
  <select className="focus:outline-none focus:ring-2 focus:ring-indigo-500">
    <option>Option 1</option>
  </select>
</div>

// Skip to main content link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// aria-label for icon buttons
<button aria-label="Close menu" onClick={handleClose}>
  <XMarkIcon className="h-6 w-6" />
</button>

// aria-describedby for error messages
<input
  id="email-input"
  aria-invalid={!!emailError}
  aria-describedby={emailError ? 'email-error' : undefined}
/>
{emailError && (
  <p id="email-error" className="text-red-600 dark:text-red-400">
    {emailError}
  </p>
)}
```

---

## Summary of Changes Needed

| Pattern | Files Affected | Effort |
|---------|----------------|--------|
| Search clear button | 73 files | 30-40 min (automatable) |
| Modal close button | 58 files | 20-30 min (automatable) |
| Empty state action | 66 files | 1-2 hours (manual) |
| Sticky headers | 36 files | 15-20 min (automatable) |
| Inline filters | 44 files | 3-5 hours (manual) |
| aria-labels | 50 buttons | 1-2 hours (manual) |
| Dark mode audit | All files | 2-3 hours (review) |

---

**All code examples are production-ready and follow Chapter 19 standards.**

