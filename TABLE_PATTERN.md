# Unified Table Pattern - Trapid Application

This document defines the standard pattern for all table components in the Trapid application.

## Overview

All tables (ContactsPage, PriceBooksPage, POTable, etc.) should follow this unified pattern for consistency, maintainability, and better UX.

## Column Configuration Structure

```javascript
const defaultColumnConfig = {
  columnKey: {
    key: 'columnKey',           // Unique identifier (matches object key)
    label: 'Column Name',        // Display name in header
    visible: true,               // Show/hide column
    minWidth: '150px',           // Minimum column width
    order: 0,                    // Display order (0, 1, 2, ...)
    sortable: true,              // Enable sorting via ColumnHeaderMenu
    searchable: true,            // Enable filtering via ColumnHeaderMenu
    filterType: 'search'         // 'search' | 'select' | 'price-range' | 'boolean'
  }
}
```

## State Management

### 1. Column Order with localStorage Persistence

```javascript
const [columnOrder, setColumnOrder] = useState(() => {
  const saved = localStorage.getItem('tableName_columnOrder')
  return saved ? JSON.parse(saved) : ['column1', 'column2', 'column3', 'actions']
})

// Auto-save to localStorage whenever order changes
useEffect(() => {
  localStorage.setItem('tableName_columnOrder', JSON.stringify(columnOrder))
}, [columnOrder])
```

### 2. Column Widths with localStorage Persistence

```javascript
const [columnWidths, setColumnWidths] = useState(() => {
  const saved = localStorage.getItem('tableName_columnWidths')
  return saved ? JSON.parse(saved) : {
    column1: 200,
    column2: 150,
    column3: 250,
    actions: 100
  }
})

// Auto-save to localStorage whenever widths change
useEffect(() => {
  localStorage.setItem('tableName_columnWidths', JSON.stringify(columnWidths))
}, [columnWidths])
```

### 3. Other State Variables

```javascript
const [draggedColumn, setDraggedColumn] = useState(null)
const [sortBy, setSortBy] = useState('default_column')
const [sortDirection, setSortDirection] = useState('asc')
const [secondarySortBy, setSecondarySortBy] = useState('secondary_column')
const [secondarySortDirection, setSecondarySortDirection] = useState('asc')
const [columnFilters, setColumnFilters] = useState({})
const [showColumnSettings, setShowColumnSettings] = useState(false)
const [selectedItems, setSelectedItems] = useState(new Set())

// Column resize state
const [resizingColumn, setResizingColumn] = useState(null)
const [resizeStartX, setResizeStartX] = useState(0)
const [resizeStartWidth, setResizeStartWidth] = useState(0)
```

## Helper Functions

### Get Sorted Columns

```javascript
const getSortedColumns = () => {
  return Object.entries(columnConfig)
    .sort(([, a], [, b]) => a.order - b.order)
    .filter(([, config]) => config.visible)
}
```

### Column Visibility Toggle

```javascript
const toggleColumnVisibility = (columnKey) => {
  setColumnConfig(prev => ({
    ...prev,
    [columnKey]: {
      ...prev[columnKey],
      visible: !prev[columnKey].visible
    }
  }))
}
```

### Drag and Drop Handlers

```javascript
const handleDragStart = (e, columnKey) => {
  setDraggedColumn(columnKey)
  e.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const handleDrop = (e, targetColumnKey) => {
  e.preventDefault()

  if (!draggedColumn || draggedColumn === targetColumnKey) {
    setDraggedColumn(null)
    return
  }

  const draggedOrder = columnConfig[draggedColumn].order
  const targetOrder = columnConfig[targetColumnKey].order

  const newConfig = { ...columnConfig }

  // Swap orders
  Object.keys(newConfig).forEach(key => {
    if (key === draggedColumn) {
      newConfig[key] = { ...newConfig[key], order: targetOrder }
    } else if (key === targetColumnKey) {
      newConfig[key] = { ...newConfig[key], order: draggedOrder }
    }
  })

  setColumnConfig(newConfig)
  setDraggedColumn(null)
}
```

### Sort Handler

```javascript
const handleSort = (column) => {
  if (sortBy === column) {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  } else {
    setSortBy(column)
    setSortDirection('asc')
  }
}
```

### Column Resize Handlers

```javascript
const handleResizeStart = (e, columnKey) => {
  e.preventDefault()
  e.stopPropagation()
  setResizingColumn(columnKey)
  setResizeStartX(e.clientX)
  setResizeStartWidth(columnWidths[columnKey])
}

const handleResizeMove = (e) => {
  if (!resizingColumn) return
  const diff = e.clientX - resizeStartX
  const newWidth = Math.max(100, resizeStartWidth + diff)
  setColumnWidths(prev => ({
    ...prev,
    [resizingColumn]: newWidth
  }))
}

const handleResizeEnd = () => {
  setResizingColumn(null)
}

// Add mouse move and mouse up listeners for column resizing
useEffect(() => {
  if (resizingColumn) {
    window.addEventListener('mousemove', handleResizeMove)
    window.addEventListener('mouseup', handleResizeEnd)
    return () => {
      window.removeEventListener('mousemove', handleResizeMove)
      window.removeEventListener('mouseup', handleResizeEnd)
    }
  }
}, [resizingColumn, resizeStartX, resizeStartWidth])
```

### Filter Handler

```javascript
const handleColumnFilter = (column, value) => {
  setColumnFilters(prev => ({
    ...prev,
    [column]: value
  }))
}
```

### Reset to Defaults

```javascript
const resetColumnSettings = () => {
  setColumnConfig(defaultColumnConfig)
  localStorage.removeItem('tableName_columnConfig')
}
```

## Table Header Structure

```jsx
<thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
  <tr>
    {/* Checkbox column (if bulk actions enabled) */}
    <th style={{ minWidth: '50px' }} className="px-6 py-3 border-r border-gray-200 dark:border-gray-700 text-left">
      <input
        type="checkbox"
        checked={selectedItems.size === items.length && items.length > 0}
        onChange={(e) => handleSelectAll(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 cursor-pointer"
      />
    </th>

    {/* Dynamic columns */}
    {columns.map((column) => {
      if (!visibleColumns[column.key]) return null
      const width = columnWidths[column.key]
      const isSortable = column.key !== 'actions'
      const isSorted = sortBy === column.key

      return (
        <th
          key={column.key}
          style={{ width: `${width}px`, minWidth: `${width}px`, position: 'relative' }}
          className={`px-6 py-2 border-r border-gray-200 dark:border-gray-700 ${
            column.key === 'actions' ? 'text-right' : 'text-left'
          } ${draggedColumn === column.key ? 'bg-indigo-100 dark:bg-indigo-900/20' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(e, column.key)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.key)}
        >
          <div
            className={`flex items-center gap-2 ${isSortable ? 'cursor-pointer' : 'cursor-move'}`}
            onClick={() => isSortable && handleSort(column.key)}
          >
            {/* Drag handle */}
            <Bars3Icon className="h-4 w-4 text-gray-400 cursor-move" />

            {/* Column label */}
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {column.label}
            </span>

            {/* Sort indicators */}
            {isSortable && isSorted && (
              sortDirection === 'asc' ?
                <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
                <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          {/* Inline filter (search input or dropdown) */}
          {column.searchable && (
            column.filterType === 'dropdown' ? (
              <select
                value={columnFilters[column.key] || ''}
                onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                {/* Dropdown options specific to column */}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Search..."
                value={columnFilters[column.key] || ''}
                onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            )
          )}

          {/* Resize handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
            onMouseDown={(e) => handleResizeStart(e, column.key)}
            onClick={(e) => e.stopPropagation()}
          />
        </th>
      )
    })}
  </tr>
</thead>
```

## Column Settings Button (Toolbar)

```jsx
<button
  onClick={() => setShowColumnSettings(true)}
  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
>
  <AdjustmentsHorizontalIcon className="h-5 w-5" />
  Columns
</button>
```

## Column Settings Modal

```jsx
{showColumnSettings && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/30"
      onClick={() => setShowColumnSettings(false)}
    />

    {/* Modal */}
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 m-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Column Settings
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Toggle column visibility and drag to reorder
      </p>

      {/* Column list */}
      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
        {getSortedColumns(true).map(([key, config]) => (
          <label
            key={key}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={config.visible}
              onChange={() => toggleColumnVisibility(key)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Bars3Icon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white flex-1">
              {config.label}
            </span>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={resetColumnSettings}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Reset to defaults
        </button>
        <button
          onClick={() => setShowColumnSettings(false)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Done
        </button>
      </div>
    </div>
  </div>
)}
```

## Bulk Actions Toolbar Pattern

```jsx
{selectedItems.size > 0 && (
  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-lg p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
    <div className="flex items-center gap-4 flex-1">
      <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
        {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
      </span>

      {/* Bulk action controls (dropdowns, inputs, etc.) */}
    </div>

    <div className="flex items-center gap-2">
      {/* Destructive actions first (red) */}
      <button
        onClick={handleBulkDelete}
        disabled={updating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
      >
        <TrashIcon className="h-5 w-5" />
        Delete
      </button>

      {/* Other actions (orange, indigo, etc.) */}
      <button
        onClick={handleBulkAction}
        disabled={updating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
      >
        {updating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <CheckCircleIcon className="h-5 w-5" />
            Apply
          </>
        )}
      </button>

      {/* Cancel always last */}
      <button
        onClick={() => setSelectedItems(new Set())}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
      >
        Cancel
      </button>
    </div>
  </div>
)}
```

## ColumnHeaderMenu Component

The `ColumnHeaderMenu` component provides integrated sort and filter functionality. It's already implemented in the codebase at:

`/Users/rob/Projects/trapid/frontend/src/components/pricebook/ColumnHeaderMenu.jsx`

**Props:**
- `label` - Column display name
- `column` - Column key for API/sort
- `sortBy` - Current sort column
- `sortDirection` - 'asc' or 'desc'
- `onSort` - Sort handler function (null if not sortable)
- `onFilter` - Filter handler function (null if not searchable)
- `filterValue` - Current filter value
- `filterType` - 'search' | 'select' | 'price-range' | 'boolean'
- `filterOptions` - Array of options for 'select' type: `[{ label, value, count }]`

## Table Wrapper Structure

```jsx
<div className="flex-1 overflow-auto bg-white dark:bg-gray-900" style={{
  scrollbarWidth: 'thin',
  scrollbarColor: '#9CA3AF #E5E7EB'
}}>
  <div className="w-full h-full">
    <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
  </div>
</div>
```

## Benefits of This Pattern

1. **Consistent UX** - Same experience across all tables
2. **Feature-Rich** - Sort, filter, reorder, visibility controls
3. **Persistent** - User preferences saved to localStorage
4. **Discoverable** - Clear settings button, not hidden features
5. **Maintainable** - Single source of truth for column config
6. **Extensible** - Easy to add new columns or features
7. **Mobile-Friendly** - Modal-based settings work better on small screens
8. **Clean Headers** - No cluttered inline inputs
9. **Drag-and-Drop** - Visual feedback during column reordering
10. **Accessible** - Proper keyboard navigation and screen reader support

## Migration Checklist

When migrating an existing table to this pattern:

- [ ] Define `defaultColumnConfig` with all columns
- [ ] Add localStorage state management with persistence
- [ ] Implement `getSortedColumns()` helper
- [ ] Add drag-and-drop handlers
- [ ] Replace table headers with new pattern
- [ ] Add ColumnHeaderMenu for sortable/searchable columns
- [ ] Add "Columns" button to toolbar
- [ ] Implement column settings modal
- [ ] Add bulk actions toolbar (if needed)
- [ ] Update cell rendering to respect column order
- [ ] Test drag-and-drop reordering
- [ ] Test column visibility toggles
- [ ] Test sort and filter functionality
- [ ] Test localStorage persistence
- [ ] Verify reset to defaults works

## Example Implementation

See `ContactsPage.jsx` and `PriceBooksPage.jsx` for reference implementations.
