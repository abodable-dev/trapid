import { useState, useMemo } from 'react'
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
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

const DEFAULT_COLUMNS = {
  poNumber: { visible: true, label: 'PO Number' },
  supplier: { visible: true, label: 'Supplier' },
  description: { visible: true, label: 'Description' },
  requiredDate: { visible: true, label: 'Required Date' },
  status: { visible: true, label: 'Status' },
  total: { visible: true, label: 'Total' }
}

export default function POTable({ purchaseOrders, onEdit, onDelete, onApprove, onSend }) {
  const [expandedPO, setExpandedPO] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const navigate = useNavigate()

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
      [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible }
    }))
  }

  // Filter purchase orders based on search query
  const filteredPOs = useMemo(() => {
    if (!searchQuery.trim()) return purchaseOrders

    const query = searchQuery.toLowerCase()
    return purchaseOrders.filter(po => {
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
  }, [purchaseOrders, searchQuery])

  const visibleColumnCount = Object.values(visibleColumns).filter(col => col.visible).length

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
            className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Show/Hide Columns
              </div>
              {Object.entries(visibleColumns).map(([key, column]) => (
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
                        checked={column.visible}
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
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <tr>
              {visibleColumns.poNumber.visible && (
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  PO Number
                </th>
              )}
              {visibleColumns.supplier.visible && (
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Supplier
                </th>
              )}
              {visibleColumns.description.visible && (
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Description
                </th>
              )}
              {visibleColumns.requiredDate.visible && (
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Required Date
                </th>
              )}
              {visibleColumns.status.visible && (
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
              )}
              {visibleColumns.total.visible && (
                <th className="px-3 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total
                </th>
              )}
              <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {filteredPOs.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnCount + 1} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? `No purchase orders found matching "${searchQuery}"`
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
                  {visibleColumns.poNumber.visible && (
                    <td className="px-4 py-5 text-sm font-medium text-gray-900 dark:text-white">
                      {po.purchase_order_number}
                    </td>
                  )}
                  {visibleColumns.supplier.visible && (
                    <td className="px-4 py-5 text-sm text-gray-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
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
                  )}
                  {visibleColumns.description.visible && (
                    <td className="px-4 py-5 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                      {po.description || '-'}
                    </td>
                  )}
                  {visibleColumns.requiredDate.visible && (
                    <td className="px-4 py-5 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(po.required_date)}
                    </td>
                  )}
                  {visibleColumns.status.visible && (
                    <td className="px-4 py-5 text-sm">
                      <POStatusBadge status={po.status} />
                    </td>
                  )}
                  {visibleColumns.total.visible && (
                    <td className="px-4 py-5 text-sm text-right text-gray-900 dark:text-white font-medium">
                      {formatCurrency(po.total, false)}
                    </td>
                  )}
                  <td className="px-4 py-5 text-sm text-center" onClick={(e) => e.stopPropagation()}>
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <span className="sr-only">Open options</span>
                        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                      </MenuButton>

                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
