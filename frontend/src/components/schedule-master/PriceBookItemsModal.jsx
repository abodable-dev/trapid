import { useState, useEffect } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'
import { formatCurrency } from '../../utils/formatters'

/**
 * PriceBookItemsModal
 *
 * Modal for selecting price book items to associate with a schedule template row.
 * These items will be automatically included in purchase orders generated for this task.
 *
 * Features:
 * - Search/filter by item code, name, category
 * - Filter by supplier (if task has a supplier assigned)
 * - Multi-select with checkboxes
 * - Shows item details: code, name, price, supplier
 */

export default function PriceBookItemsModal({ isOpen, onClose, currentRow, onSave }) {
  const [priceBookItems, setPriceBookItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [selectedItemIds, setSelectedItemIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBySupplier, setFilterBySupplier] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadPriceBookItems()
      // Initialize selected items from current row
      if (currentRow?.price_book_item_ids) {
        setSelectedItemIds(new Set(currentRow.price_book_item_ids))
      } else {
        setSelectedItemIds(new Set())
      }
      setSearchQuery('')
      setFilterBySupplier(false)
    }
  }, [isOpen, currentRow])

  useEffect(() => {
    // Filter items based on search query and supplier filter
    let filtered = priceBookItems

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.item_code?.toLowerCase().includes(query) ||
        item.item_name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      )
    }

    // Filter by supplier if enabled and supplier is set
    if (filterBySupplier && currentRow?.supplier_id) {
      filtered = filtered.filter(item => item.supplier_id === currentRow.supplier_id)
    }

    setFilteredItems(filtered)
  }, [priceBookItems, searchQuery, filterBySupplier, currentRow])

  const loadPriceBookItems = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/v1/pricebook', {
        params: {
          limit: 1000,
          sort_by: 'item_code',
          sort_direction: 'asc'
        }
      })
      setPriceBookItems(response.items || [])
      setFilteredItems(response.items || [])
    } catch (error) {
      console.error('Failed to load price book items:', error)
      setPriceBookItems([])
      setFilteredItems([])
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = (itemId) => {
    const newSelected = new Set(selectedItemIds)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItemIds(newSelected)
  }

  const toggleAll = () => {
    if (selectedItemIds.size === filteredItems.length) {
      // Deselect all
      setSelectedItemIds(new Set())
    } else {
      // Select all filtered items
      setSelectedItemIds(new Set(filteredItems.map(item => item.id)))
    }
  }

  const handleSave = () => {
    onSave(Array.from(selectedItemIds))
    onClose()
  }

  if (!isOpen) return null

  const supplierName = currentRow?.supplier_name || 'No supplier'
  const canFilterBySupplier = currentRow?.supplier_id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Price Book Items
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Task: {currentRow?.name} | {selectedItemIds.size} item(s) selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search and filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item code, name, or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Supplier filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="filter-supplier"
              checked={filterBySupplier}
              onChange={(e) => setFilterBySupplier(e.target.checked)}
              disabled={!canFilterBySupplier}
              className="h-4 w-4 disabled:opacity-30"
            />
            <label
              htmlFor="filter-supplier"
              className={`text-sm ${!canFilterBySupplier ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Only show items from supplier: <strong>{supplierName}</strong>
              {!canFilterBySupplier && ' (assign a supplier to task first)'}
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500 dark:text-gray-400">Loading price book items...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">No items found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={filteredItems.length > 0 && selectedItemIds.size === filteredItems.length}
                      onChange={toggleAll}
                      className="h-4 w-4"
                      title="Select all filtered items"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                    Item Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {filteredItems.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                      selectedItemIds.has(item.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="h-4 w-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                      {item.item_code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.item_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.category || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.supplier_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                      {item.selling_price_inc_gst ? formatCurrency(item.selling_price_inc_gst) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredItems.length} of {priceBookItems.length} items
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2"
            >
              <CheckIcon className="h-4 w-4" />
              Save Selection ({selectedItemIds.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
