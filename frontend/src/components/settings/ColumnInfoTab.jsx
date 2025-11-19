import { useState, useEffect } from 'react'
import { CheckCircleIcon, InformationCircleIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { COLUMN_TYPES } from '../../constants/columnTypes'

// Convert COLUMN_TYPES to column info format - this is now LIVE and always up-to-date
const getInitialColumns = () => {
  return COLUMN_TYPES.map(type => ({
    columnName: type.value,
    sqlType: type.sqlType || 'UNKNOWN',
    displayType: type.label || type.value,
    validationRules: type.validationRules || 'No validation rules defined',
    example: type.example || 'No example provided',
    usedFor: type.usedFor || 'No usage description'
  }))
}

// Legacy static columns for reference (kept for backwards compatibility)
const LEGACY_COLUMNS = [
  {
    columnName: 'id',
    sqlType: 'INTEGER',
    displayType: 'ID / Primary Key',
    validationRules: 'Auto-increment, unique, not null',
    example: '1, 2, 3, 100',
    usedFor: 'Primary key for identifying records'
  },
  {
    columnName: 'item_code',
    sqlType: 'VARCHAR(255)',
    displayType: 'Single Line Text',
    validationRules: 'Optional text field, max 255 characters, alphanumeric',
    example: 'CONC-001, STL-042A',
    usedFor: 'Unique identifier code for inventory'
  },
  {
    columnName: 'email',
    sqlType: 'VARCHAR(255)',
    displayType: 'Email',
    validationRules: 'Must contain @ symbol, valid email format',
    example: 'supplier@example.com, contact@business.com.au',
    usedFor: 'Email addresses for contacts'
  },
  {
    columnName: 'phone',
    sqlType: 'VARCHAR(20)',
    displayType: 'Phone (Landline)',
    validationRules: 'Format: (03) 9123 4567 or 1300 numbers',
    example: '(03) 9123 4567, 1300 123 456',
    usedFor: 'Landline phone numbers'
  },
  {
    columnName: 'mobile',
    sqlType: 'VARCHAR(20)',
    displayType: 'Phone (Mobile)',
    validationRules: 'Format: 0407 397 541, starts with 04',
    example: '0407 397 541, 0412 345 678',
    usedFor: 'Mobile phone numbers'
  },
  {
    columnName: 'start_date',
    sqlType: 'DATE',
    displayType: 'Date Only',
    validationRules: 'Format: YYYY-MM-DD, no time component',
    example: '2025-11-19, 1990-01-15',
    usedFor: 'Date values without time, for contracts, events, start dates'
  },
  {
    columnName: 'location_coords',
    sqlType: 'VARCHAR(100)',
    displayType: 'GPS Coordinates',
    validationRules: 'Latitude, Longitude format',
    example: '-33.8688, 151.2093 (Sydney)',
    usedFor: 'GPS coordinates for job sites, delivery addresses, asset tracking'
  },
  {
    columnName: 'color_code',
    sqlType: 'VARCHAR(7)',
    displayType: 'Color Picker',
    validationRules: 'Hex color format (#RRGGBB)',
    example: '#FF5733, #3498DB, #000000',
    usedFor: 'Visual categorization, status indicators, UI customization'
  },
  {
    columnName: 'file_attachment',
    sqlType: 'TEXT',
    displayType: 'File Upload',
    validationRules: 'File path or URL to uploaded file',
    example: '/uploads/doc.pdf, https://example.com/file.png',
    usedFor: 'File references, document links, image paths'
  },
  {
    columnName: 'category_type',
    sqlType: 'VARCHAR(255)',
    displayType: 'Lookup / Dropdown',
    validationRules: 'Must match predefined category list',
    example: 'Concrete, Timber, Steel, Plasterboard',
    usedFor: 'Material type classification'
  },
  {
    columnName: 'is_active',
    sqlType: 'BOOLEAN',
    displayType: 'Boolean / Checkbox',
    validationRules: 'True or False only',
    example: 'true, false',
    usedFor: 'Active/inactive status flag'
  },
  {
    columnName: 'discount',
    sqlType: 'DECIMAL(5,2)',
    displayType: 'Percentage',
    validationRules: '0-100, displayed with % symbol',
    example: '10.5%, 25%, 0%',
    usedFor: 'Discount percentage for pricing'
  },
  {
    columnName: 'status',
    sqlType: 'VARCHAR(50)',
    displayType: 'Choice / Badge',
    validationRules: 'Limited options: active, inactive (with colored badges)',
    example: 'active (green), inactive (red)',
    usedFor: 'Status with visual indicators'
  },
  {
    columnName: 'price',
    sqlType: 'DECIMAL(10,2)',
    displayType: 'Currency (AUD)',
    validationRules: 'Positive numbers, 2 decimal places, shows sum in footer',
    example: '$125.50, $1,234.99',
    usedFor: 'Price in Australian dollars'
  },
  {
    columnName: 'quantity',
    sqlType: 'INTEGER',
    displayType: 'Number',
    validationRules: 'Positive integers, shows sum in footer',
    example: '10, 250, 15',
    usedFor: 'Quantity of items'
  },
  {
    columnName: 'whole_number',
    sqlType: 'INTEGER',
    displayType: 'Whole Number',
    validationRules: 'Integers only (no decimals), shows sum',
    example: '5, 100, 42',
    usedFor: 'Counts, units, days - no fractional values'
  },
  {
    columnName: 'total_cost',
    sqlType: 'COMPUTED',
    displayType: 'Computed Field',
    validationRules: 'Formula: price × quantity, read-only, shows sum',
    example: '$1,255.00 (from $125.50 × 10)',
    usedFor: 'Automatic calculations from other columns'
  },
  {
    columnName: 'created_at',
    sqlType: 'DATETIME',
    displayType: 'Date & Time',
    validationRules: 'Auto-populated on creation, not editable',
    example: '19/11/2024 14:30',
    usedFor: 'Record creation timestamp'
  },
  {
    columnName: 'updated_at',
    sqlType: 'DATETIME',
    displayType: 'Date & Time',
    validationRules: 'Auto-updated on any modification',
    example: '19/11/2024 16:45',
    usedFor: 'Last modification timestamp'
  },
  {
    columnName: 'document_link',
    sqlType: 'VARCHAR(500)',
    displayType: 'URL / Link',
    validationRules: 'Valid URL format, clickable in table',
    example: 'https://example.com/doc.pdf',
    usedFor: 'Links to external documents or files'
  },
  {
    columnName: 'notes',
    sqlType: 'TEXT',
    displayType: 'Multi-Line Text',
    validationRules: 'Optional text field, supports line breaks',
    example: 'Additional notes\nSecond line\nThird line',
    usedFor: 'Notes, comments, multi-line descriptions'
  }
]


export default function ColumnInfoTab() {
  const [columns, setColumns] = useState(getInitialColumns())
  const [loading, setLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  // Refresh columns from COLUMN_TYPES constant
  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setColumns(getInitialColumns())
      setLastRefreshed(new Date())
      setLoading(false)
    }, 300)
  }

  // Auto-refresh on mount to get latest from COLUMN_TYPES
  useEffect(() => {
    handleRefresh()
  }, [])

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Column Name (Database)', 'Display Name', 'SQL Type', 'Display Type', 'Validation Rules', 'Example', 'Used For']
    const csvRows = [
      headers.join(','),
      ...columns.map(col => [
        col.columnName,
        `"${col.displayName || col.displayType}"`,
        `"${col.sqlType}"`,
        `"${col.displayType}"`,
        `"${col.validationRules.replace(/"/g, '""')}"`,
        `"${col.example.replace(/"/g, '""')}"`,
        `"${col.usedFor.replace(/"/g, '""')}"`
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'gold_standard_columns.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to JSON
  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      columns: columns,
      statistics: {
        totalColumns: columns.length,
        uniqueSQLTypes: new Set(columns.map(c => c.sqlType)).size
      }
    }

    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'gold_standard_columns.json')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gold Standard Column Reference
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Complete reference of all column types with validation rules and usage guidelines
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Columns</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{columns.length}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4 border border-green-200 dark:border-green-700">
          <div className="text-sm font-medium text-green-800 dark:text-green-400">Unique SQL Types</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
            {new Set(columns.map(c => c.sqlType)).size}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-4 border border-purple-200 dark:border-purple-700">
          <div className="text-sm font-medium text-purple-800 dark:text-purple-400">Last Refreshed</div>
          <div className="text-sm font-bold text-purple-900 dark:text-purple-300 mt-1">
            {lastRefreshed.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Columns Section */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              Column Types ({columns.length})
            </h3>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">🔒 System-Generated Columns (Auto-managed by database)</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Column Name (Database)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Display Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SQL Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Display Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Validation Rules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Example
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Used For
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {columns.map((column, index) => {
                  // Check if this is a system-generated column
                  const isSystemGenerated = ['date_and_time'].includes(column.columnName) ||
                    (column.validationRules && (
                      column.validationRules.includes('Auto-populated') ||
                      column.validationRules.includes('Auto-updated')
                    ))

                  return (
                    <tr
                      key={index}
                      className={`transition-colors ${
                        isSystemGenerated
                          ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className={`text-sm font-mono font-semibold ${
                            isSystemGenerated
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {column.columnName}
                          </code>
                          {isSystemGenerated && <span className="text-sm">🔒</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {column.displayName || column.displayType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${
                          isSystemGenerated
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {column.sqlType}
                        </span>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {column.displayType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {column.validationRules}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-500">
                      <code className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {column.example}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {column.usedFor}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex gap-3">
          <InformationCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white mb-1">Usage Notes:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>All validation rules are enforced at the database and application level</li>
              <li>Computed fields are read-only and calculated automatically</li>
              <li>Timestamp fields (created_at, updated_at) are managed by the database</li>
              <li>Export data as CSV or JSON using the buttons above</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
