import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

/**
 * MiddayDataTable - Standardized table component for Trapid
 *
 * This is the OFFICIAL standard table for ALL data tables in Trapid.
 * Inspired by Midday.ai's minimalist, data-dense aesthetic.
 *
 * Design Principles:
 * - Pure black background (bg-black)
 * - Minimal padding (py-2.5 cells, py-2 headers)
 * - Subtle borders (border-gray-800)
 * - Small text (text-xs)
 * - Font-mono for numeric columns
 * - Tiny icons (w-3.5 h-3.5)
 * - Subtle hover states
 * - Compact, data-dense layout
 *
 * @example
 * ```jsx
 * <MiddayDataTable
 * data={jobs}
 * columns={[
 * {
 * key: 'id',
 * label: '#',
 * width: 'w-8',
 * render: (row, index) => <span className="text-gray-500 font-mono">{index + 1}</span>
 * },
 * {
 * key: 'title',
 * label: 'Job Title',
 * sortable: true,
 * render: (row) => (
 * <button onClick={() => navigate(`/jobs/${row.id}`)} className="text-white hover:text-gray-300">
 * {row.title}
 * </button>
 * )
 * },
 * {
 * key: 'contract_value',
 * label: 'Contract Value',
 * align: 'right',
 * sortable: true,
 * numeric: true,
 * render: (row) => <span className="font-mono">{formatCurrency(row.contract_value)}</span>
 * }
 * ]}
 * onRowClick={(row) => navigate(`/jobs/${row.id}`)}
 * emptyMessage="No jobs found"
 * />
 * ```
 */
export default function MiddayDataTable({
 // Data props
 data = [],
 columns = [],

 // Row props
 onRowClick,
 rowKey = 'id',

 // Sorting props
 defaultSortKey,
 defaultSortDirection = 'asc',
 onSort,

 // Empty state
 emptyMessage = 'No data',
 emptyState,

 // Loading
 loading = false,

 // Selection
 selectable = false,
 selectedItems = new Set(),
 onSelectItem,
 onSelectAll,

 // Additional classes
 className = '',
}) {
 const [sortConfig, setSortConfig] = useState({
 key: defaultSortKey || null,
 direction: defaultSortDirection,
 })

 // Sort data
 const sortedData = useMemo(() => {
 if (!sortConfig.key || onSort) return data

 const sorted = [...data].sort((a, b) => {
 const column = columns.find(col => col.key === sortConfig.key)

 // Use custom sort function if provided
 if (column?.sortFn) {
 return column.sortFn(a, b, sortConfig.direction)
 }

 // Get values
 let aValue = column?.getValue ? column.getValue(a) : a[sortConfig.key]
 let bValue = column?.getValue ? column.getValue(b) : b[sortConfig.key]

 // Handle null/undefined
 if (aValue == null && bValue == null) return 0
 if (aValue == null) return 1
 if (bValue == null) return -1

 // Handle dates
 if (aValue instanceof Date && bValue instanceof Date) {
 aValue = aValue.getTime()
 bValue = bValue.getTime()
 }

 // Handle strings (case-insensitive)
 if (typeof aValue === 'string' && typeof bValue === 'string') {
 aValue = aValue.toLowerCase()
 bValue = bValue.toLowerCase()
 }

 // Compare
 if (aValue < bValue) {
 return sortConfig.direction === 'asc' ? -1 : 1
 }
 if (aValue > bValue) {
 return sortConfig.direction === 'asc' ? 1 : -1
 }
 return 0
 })

 return sorted
 }, [data, sortConfig, columns, onSort])

 // Handle sort click
 const handleSort = (columnKey) => {
 const column = columns.find(col => col.key === columnKey)
 if (!column?.sortable) return

 setSortConfig(prevConfig => {
 const newConfig = prevConfig.key === columnKey && prevConfig.direction === 'asc'
 ? { key: columnKey, direction: 'desc' }
 : { key: columnKey, direction: 'asc' }

 // Call external sort handler if provided
 if (onSort) {
 onSort(newConfig.key, newConfig.direction)
 }

 return newConfig
 })
 }

 // Loading state
 if (loading) {
 return (
 <div className={`overflow-x-auto ${className}`}>
 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
 {/* Header Skeleton */}
 <thead className="bg-gray-50 dark:bg-gray-900/50">
 <tr>
 {selectable && (
 <th className="px-3 py-2 w-8">
 <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
 </th>
 )}
 {columns.map((column) => (
 <th
 key={column.key}
 className={`px-3 py-2 ${column.width || ''}`}
 >
 <div className={`h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse ${
 column.width === 'w-8' ? 'w-4' : column.width === 'w-20' ? 'w-16' : 'w-24'
 }`} />
 </th>
 ))}
 </tr>
 </thead>
 {/* Body Skeleton - 8 rows */}
 <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
 {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
 <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
 {selectable && (
 <td className="px-3 py-2.5 whitespace-nowrap w-8">
 <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
 </td>
 )}
 {columns.map((column) => (
 <td
 key={column.key}
 className={`px-3 py-2.5 whitespace-nowrap ${column.width || ''}`}
 >
 <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
 column.width === 'w-8' ? 'w-4' : column.width === 'w-20' ? 'w-16' : 'w-32'
 }`} />
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )
 }

 return (
 <div className={`overflow-x-auto ${className}`}>
 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
 {/* Header */}
 <thead className="bg-gray-50 dark:bg-gray-900/50">
 <tr>
 {selectable && (
 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">
 <input
 type="checkbox"
 checked={data.length > 0 && selectedItems.size === data.length}
 onChange={(e) => onSelectAll?.(e.target.checked)}
 className="h-4 w-4 border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
 />
 </th>
 )}
 {columns.map((column) => {
 const isSorted = sortConfig.key === column.key
 const isAsc = isSorted && sortConfig.direction === 'asc'
 const isDesc = isSorted && sortConfig.direction === 'desc'

 return (
 <th
 key={column.key}
 onClick={() => column.sortable && handleSort(column.key)}
 className={`px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
 column.align === 'right' ? 'text-right' :
 column.align === 'center' ? 'text-center' :
 'text-left'
 } ${column.width || ''} ${
 column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none' : ''
 } ${column.headerClassName || ''}`}
 >
 <div className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
 <span>{column.label}</span>
 {column.sortable && (
 <span className="relative w-3.5 h-3.5 flex items-center justify-center">
 {!isSorted && (
 <div className="opacity-0 group-hover:opacity-40 transition-opacity">
 <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
 </div>
 )}
 {isAsc && <ChevronUp className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />}
 {isDesc && <ChevronDown className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />}
 </span>
 )}
 </div>
 </th>
 )
 })}
 </tr>
 </thead>

 {/* Body */}
 <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
 {sortedData.length === 0 ? (
 <tr>
 <td
 colSpan={columns.length + (selectable ? 1 : 0)}
 className="px-3 py-6"
 >
 {emptyState || (
 <div className="text-center text-xs text-gray-500 dark:text-gray-400">
 {emptyMessage}
 </div>
 )}
 </td>
 </tr>
 ) : (
 sortedData.map((row, rowIndex) => (
 <tr
 key={row[rowKey] || rowIndex}
 onClick={() => onRowClick?.(row)}
 className={`transition-colors ${
 onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50' : ''
 } ${selectedItems.has(row[rowKey]) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
 >
 {selectable && (
 <td className="px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
 <input
 type="checkbox"
 checked={selectedItems.has(row[rowKey])}
 onChange={() => onSelectItem?.(row[rowKey])}
 className="h-4 w-4 border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
 />
 </td>
 )}
 {columns.map((column) => (
 <td
 key={column.key}
 className={`px-3 py-2.5 whitespace-nowrap text-xs ${
 column.align === 'right' ? 'text-right' :
 column.align === 'center' ? 'text-center' :
 'text-left'
 } ${column.numeric ? 'font-mono' : ''} ${column.cellClassName || ''}`}
 onClick={(e) => column.onClick?.(row, e)}
 >
 {column.render
 ? column.render(row, rowIndex)
 : row[column.key] != null
 ? String(row[column.key])
 : '-'}
 </td>
 ))}
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 )
}
