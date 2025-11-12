import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { formatCurrency } from '../../utils/formatters'
import POStatusBadge from './POStatusBadge'
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

// Column configuration with searchable and filterType properties
const columnConfig = {
  poNumber: {
    key: 'poNumber',
    label: 'PO Number',
    searchable: true,
    filterType: 'search',
    minWidth: '150px'
  },
  supplier: {
    key: 'supplier',
    label: 'Supplier',
    searchable: true,
    filterType: 'search',
    minWidth: '200px'
  },
  description: {
    key: 'description',
    label: 'Description',
    searchable: true,
    filterType: 'search',
    minWidth: '250px'
  },
  requiredDate: {
    key: 'requiredDate',
    label: 'Required Date',
    searchable: false,
    minWidth: '150px'
  },
  status: {
    key: 'status',
    label: 'Status',
    searchable: true,
    filterType: 'dropdown',
    minWidth: '150px'
  },
  total: {
    key: 'total',
    label: 'Total',
    searchable: false,
    minWidth: '150px'
  },
  actions: {
    key: 'actions',
    label: 'Actions',
    searchable: false,
    minWidth: '100px'
  }
}

export default function POTable({ purchaseOrders, onEdit, onDelete, onApprove, onSend }) {
  const [expandedPO, setExpandedPO] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // Column order state with localStorage persistence
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('po_table_columnOrder')
    return saved ? JSON.parse(saved) : ['poNumber', 'supplier', 'description', 'requiredDate', 'status', 'total', 'actions']
  })

  // Column widths state with localStorage persistence
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('po_table_columnWidths')
    return saved ? JSON.parse(saved) : {
      poNumber: 150,
      supplier: 200,
      description: 250,
      requiredDate: 150,
      status: 150,
      total: 150,
      actions: 100
    }
  })

  // Sort state (primary and secondary)
  const [sortBy, setSortBy] = useState('poNumber')
  const [sortDirection, setSortDirection] = useState('desc')
  const [secondarySortBy, setSecondarySortBy] = useState('supplier')
  const [secondarySortDirection, setSecondarySortDirection] = useState('asc')

  // Column resize state
  const [resizingColumn, setResizingColumn] = useState(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  // Column filter state
  const [columnFilters, setColumnFilters] = useState({})

  // Drag and drop state
  const [draggedColumn, setDraggedColumn] = useState(null)

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    poNumber: true,
    supplier: true,
    description: true,
    requiredDate: true,
    status: true,
    total: true,
    actions: true
  })

  // Persist column order to localStorage
  useEffect(() => {
    localStorage.setItem('po_table_columnOrder', JSON.stringify(columnOrder))
  }, [columnOrder])

  // Persist column widths to localStorage
  useEffect(() => {
    localStorage.setItem('po_table_columnWidths', JSON.stringify(columnWidths))
  }, [columnWidths])

  // Column resize handlers
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

  // Drag and drop handlers
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

    const draggedIndex = columnOrder.indexOf(draggedColumn)
    const targetIndex = columnOrder.indexOf(targetColumnKey)

    const newOrder = [...columnOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedColumn)

    setColumnOrder(newOrder)
    setDraggedColumn(null)
  }

  // Sort handler
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(columnKey)
      setSortDirection('asc')
    }
  }

  // Column filter handler
  const handleColumnFilter = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const handleRowClick = (poId) => {
    setExpandedPO(expandedPO === poId ? null : poId)
  }

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  // Helper function to get sort value for a PO by column key
  const getSortValue = (po, columnKey) => {
    switch (columnKey) {
      case 'poNumber':
        return po.purchase_order_number?.toLowerCase() || ''
      case 'supplier':
        return po.supplier?.name?.toLowerCase() || ''
      case 'description':
        return po.description?.toLowerCase() || ''
      case 'requiredDate':
        return po.required_date || ''
      case 'status':
        return po.status?.toLowerCase() || ''
      case 'total':
        return po.total || 0
      default:
        return ''
    }
  }

  // Apply column filters to purchase orders
  const applyColumnFilters = (items) => {
    if (Object.keys(columnFilters).length === 0) return items

    return items.filter(po => {
      return Object.entries(columnFilters).every(([key, filterValue]) => {
        if (!filterValue || filterValue.trim() === '') return true

        const lowerFilter = filterValue.toLowerCase()

        switch (key) {
          case 'poNumber':
            return po.purchase_order_number?.toLowerCase().includes(lowerFilter)
          case 'supplier':
            return po.supplier?.name?.toLowerCase().includes(lowerFilter)
          case 'description':
            return po.description?.toLowerCase().includes(lowerFilter)
          case 'status':
            return po.status?.toLowerCase().includes(lowerFilter)
          default:
            return true
        }
      })
    })
  }

  // Filter purchase orders based on search query and column filters, then sort
  const filteredPOs = useMemo(() => {
    let filtered = purchaseOrders

    // Apply global search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(po => {
        const searchableFields = [
          po.purchase_order_number,
          po.supplier?.name,
          po.description,
          po.status,
          po.total?.toString()
        ].filter(Boolean)

        return searchableFields.some(field =>
          field.toLowerCase().includes(query)
        )
      })
    }

    // Apply column filters
    filtered = applyColumnFilters(filtered)

    // Sort by primary and secondary sort columns
    return filtered.sort((a, b) => {
      // Primary sort
      const aPrimaryVal = getSortValue(a, sortBy)
      const bPrimaryVal = getSortValue(b, sortBy)

      if (aPrimaryVal !== bPrimaryVal) {
        if (aPrimaryVal < bPrimaryVal) return sortDirection === 'asc' ? -1 : 1
        if (aPrimaryVal > bPrimaryVal) return sortDirection === 'asc' ? 1 : -1
      }

      // Secondary sort (if primary values are equal)
      const aSecondaryVal = getSortValue(a, secondarySortBy)
      const bSecondaryVal = getSortValue(b, secondarySortBy)

      if (aSecondaryVal < bSecondaryVal) return secondarySortDirection === 'asc' ? -1 : 1
      if (aSecondaryVal > bSecondaryVal) return secondarySortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [purchaseOrders, searchQuery, columnFilters, sortBy, sortDirection, secondarySortBy, secondarySortDirection])

  const visibleColumnCount = Object.values(visibleColumns).filter(col => col).length

  // Get columns in order
  const orderedColumns = columnOrder.map(key => columnConfig[key]).filter(col => visibleColumns[col.key])

  return (
    <div className="space-y-3">
      {/* Search and Column Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search purchase orders..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Clear search</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Column Visibility Dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Columns
          </MenuButton>

          <MenuItems
            transition
            className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Show/Hide Columns
              </div>
              {Object.entries(columnConfig).map(([key, column]) => (
                <MenuItem key={key}>
                  {({ focus }) => (
                    <button
                      onClick={() => toggleColumn(key)}
                      className={`${
                        focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[key]}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 mr-3"
                      />
                      {column.label}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Found {filteredPOs.length} of {purchaseOrders.length} purchase orders
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border-l border-r border-b border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <tr>
              {orderedColumns.map((column) => {
                const width = columnWidths[column.key]
                const isSortable = column.key !== 'actions'
                const isSorted = sortBy === column.key

                return (
                  <th
                    key={column.key}
                    style={{ width: `${width}px`, minWidth: `${width}px`, position: 'relative' }}
                    className={`px-3 py-2 border-r border-gray-200 dark:border-gray-700 ${
                      column.key === 'actions' || column.key === 'total' ? 'text-right' : 'text-left'
                    } ${draggedColumn === column.key ? 'bg-indigo-100 dark:bg-indigo-900/20' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.key)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.key)}
                  >
                    <div
                      className={`flex items-center gap-2 ${isSortable ? 'cursor-pointer' : 'cursor-move'} ${
                        column.key === 'actions' || column.key === 'total' ? 'justify-end' : ''
                      }`}
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
                      column.filterType === 'dropdown' && column.key === 'status' ? (
                        <select
                          value={columnFilters[column.key] || ''}
                          onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All Statuses</option>
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="sent">Sent</option>
                          <option value="received">Received</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
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
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {filteredPOs.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnCount} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || Object.keys(columnFilters).some(key => columnFilters[key])
                    ? `No purchase orders found matching your filters`
                    : 'No purchase orders found. Click "New Purchase Order" to create one.'}
                </td>
              </tr>
            ) : (
              filteredPOs.map((po) => (
                <tr
                  key={po.id}
                  onClick={() => handleRowClick(po.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  {orderedColumns.map((column) => {
                    const width = columnWidths[column.key]
                    const cellStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }

                    switch (column.key) {
                      case 'poNumber':
                        return (
                          <td key="poNumber" style={cellStyle} className="px-4 py-5 text-sm font-medium text-gray-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/purchase-orders/${po.id}`)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:underline"
                            >
                              {po.purchase_order_number}
                            </button>
                          </td>
                        )

                      case 'supplier':
                        return (
                          <td key="supplier" style={cellStyle} className="px-4 py-5 text-sm text-gray-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
                            {po.supplier ? (
                              <button
                                onClick={() => navigate(`/suppliers/${po.supplier.id}`)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:underline"
                              >
                                {po.supplier.name}
                              </button>
                            ) : (
                              '-'
                            )}
                          </td>
                        )

                      case 'description':
                        return (
                          <td key="description" style={cellStyle} className="px-4 py-5 text-sm text-gray-600 dark:text-gray-400 truncate">
                            {po.description || '-'}
                          </td>
                        )

                      case 'requiredDate':
                        return (
                          <td key="requiredDate" style={cellStyle} className="px-4 py-5 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(po.required_date)}
                          </td>
                        )

                      case 'status':
                        return (
                          <td key="status" style={cellStyle} className="px-4 py-5 text-sm">
                            <POStatusBadge status={po.status} />
                          </td>
                        )

                      case 'total':
                        return (
                          <td key="total" style={cellStyle} className="px-4 py-5 text-sm text-right text-gray-900 dark:text-white font-medium">
                            {formatCurrency(po.total, false)}
                          </td>
                        )

                      case 'actions':
                        return (
                          <td key="actions" style={cellStyle} className="px-4 py-5 text-sm text-right" onClick={(e) => e.stopPropagation()}>
                            <Menu as="div" className="relative inline-block text-left">
                              <MenuButton className="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                                <span className="sr-only">Open options</span>
                                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                              </MenuButton>

                              <MenuItems
                                transition
                                className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                              >
                                <div className="py-1">
                                  <MenuItem>
                                    {({ focus }) => (
                                      <button
                                        onClick={() => navigate(`/purchase-orders/${po.id}`)}
                                        className={`${
                                          focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                      >
                                        <EyeIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" aria-hidden="true" />
                                        View
                                      </button>
                                    )}
                                  </MenuItem>
                                  <MenuItem>
                                    {({ focus }) => (
                                      <button
                                        onClick={() => navigate(`/purchase-orders/${po.id}/edit`)}
                                        className={`${
                                          focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                      >
                                        <PencilIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" aria-hidden="true" />
                                        Edit
                                      </button>
                                    )}
                                  </MenuItem>
                                  {po.status !== 'paid' && onDelete && (
                                    <MenuItem>
                                      {({ focus }) => (
                                        <button
                                          onClick={() => onDelete(po.id)}
                                          className={`${
                                            focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                                          } group flex w-full items-center px-4 py-2 text-sm text-red-700 dark:text-red-400`}
                                        >
                                          <TrashIcon className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300" aria-hidden="true" />
                                          Delete
                                        </button>
                                      )}
                                    </MenuItem>
                                  )}
                                </div>
                              </MenuItems>
                            </Menu>
                          </td>
                        )

                      default:
                        return null
                    }
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
