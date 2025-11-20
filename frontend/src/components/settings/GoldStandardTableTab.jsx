import { useState, useEffect } from 'react'
import { PlusIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import TrapidTableView from '../documentation/TrapidTableView'
import { COLUMN_TYPES } from '../../constants/columnTypes'

// Map COLUMN_TYPES (single source of truth) to table column configuration
// This ensures Column Info tab and Gold Standard table always match
const buildGoldStandardColumns = () => {
  // Base columns that always appear
  const baseColumns = [
    { key: 'select', label: '', resizable: false, sortable: false, filterable: false, width: 32, tooltip: 'Checkbox - select rows for bulk actions' },
    { key: 'id', label: 'ID / Primary Key', resizable: true, sortable: true, filterable: false, width: 80, tooltip: 'Primary Key - Auto-increment ID' }
  ]

  // Map each COLUMN_TYPE to its database column and configuration
  const typeToColumnMap = {
    'single_line_text': { key: 'item_code', width: 150, filterable: true, filterType: 'text' },
    'email': { key: 'email', width: 200, filterable: true, filterType: 'text' },
    'phone': { key: 'phone', width: 150, filterable: true, filterType: 'text' },
    'mobile': { key: 'mobile', width: 150, filterable: true, filterType: 'text' },
    'url': { key: 'document_link', width: 180, sortable: false, filterable: false },
    'date': { key: 'start_date', width: 140, filterable: false },
    'gps_coordinates': { key: 'location_coords', width: 180, sortable: false, filterable: false },
    'color_picker': { key: 'color_code', width: 130, sortable: false, filterable: false },
    'file_upload': { key: 'file_attachment', width: 180, sortable: false, filterable: false },
    'action_buttons': { key: 'action_buttons', width: 150, sortable: false, filterable: false },
    'lookup': { key: 'category_type', width: 150, filterable: true, filterType: 'dropdown' },
    'boolean': { key: 'is_active', width: 100, filterable: true, filterType: 'dropdown' },
    'percentage': { key: 'discount', width: 120, filterable: false },
    'choice': { key: 'status', width: 140, filterable: true, filterType: 'dropdown' },
    'currency': { key: 'price', width: 120, filterable: false, showSum: true, sumType: 'currency' },
    'number': { key: 'quantity', width: 100, filterable: false, showSum: true, sumType: 'number' },
    'whole_number': { key: 'whole_number', width: 120, filterable: false, showSum: true, sumType: 'number' },
    'computed': {
      key: 'total_cost',
      width: 140,
      filterable: false,
      showSum: true,
      sumType: 'currency',
      isComputed: true,
      computeFunction: (entry) => (entry.price || 0) * (entry.quantity || 0)
    },
    'date_and_time': { key: 'created_at', width: 180, filterable: false },
    'multiple_lines_text': { key: 'notes', width: 300, sortable: false, filterable: true, filterType: 'text' },
    'multiple_lookups': { key: 'multiple_category_ids', width: 200, sortable: false, filterable: false },
    'user': { key: 'user_id', width: 120, filterable: true, filterType: 'dropdown' }
  }

  // Helper function to build a column from COLUMN_TYPES
  const buildColumn = (typeValue) => {
    const type = COLUMN_TYPES.find(t => t.value === typeValue)
    const config = typeToColumnMap[typeValue]
    if (!type || !config) return null

    return {
      key: config.key,
      label: type.label,
      resizable: true,
      sortable: config.sortable !== false,
      filterable: config.filterable || false,
      filterType: config.filterType,
      width: config.width,
      showSum: config.showSum,
      sumType: config.sumType,
      isComputed: config.isComputed,
      computeFunction: config.computeFunction,
      tooltip: `${type.sqlType} - ${type.usedFor}`
    }
  }

  // Build columns in the EXACT same order as COLUMN_TYPES array
  // This ensures Column Info tab and Gold Standard table match perfectly
  const dynamicColumns = COLUMN_TYPES
    .map(type => buildColumn(type.value))
    .filter(col => col !== null)

  // Add updated_at separately (second date_and_time instance)
  const updatedAtType = COLUMN_TYPES.find(t => t.value === 'date_and_time')
  if (updatedAtType) {
    dynamicColumns.push({
      key: 'updated_at',
      label: 'Date & Time (Updated)',
      resizable: true,
      sortable: true,
      filterable: false,
      width: 180,
      tooltip: `${updatedAtType.sqlType} - When the record was last modified`
    })
  }

  return [...baseColumns, ...dynamicColumns]
}

const GOLD_STANDARD_COLUMNS = buildGoldStandardColumns()

export default function GoldStandardTableTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const [newItem, setNewItem] = useState({
    item_code: '',
    email: '',
    phone: '',
    mobile: '',
    start_date: '',
    location_coords: '',
    color_code: '#000000',
    file_attachment: '',
    action_buttons: '',
    category_type: '',
    is_active: true,
    discount: 0,
    status: 'active',
    price: 0,
    quantity: 0,
    whole_number: 0,
    notes: '',
    document_link: '',
    user_id: null,
    multiple_category_ids: ''
  })

  // Fetch gold standard items from API
  useEffect(() => {
    fetchGoldStandardItems()
  }, [])

  const fetchGoldStandardItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/gold_standard_items')
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      const items = await response.json()
      console.log('Fetched items from API:', items.length)
      setData(items)
    } catch (err) {
      console.error('Error fetching gold standard items:', err)
      // Show empty table if API fails - no fallback to sample data
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (entry) => {
    try {
      const response = await fetch(`/api/v1/gold_standard_items/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gold_standard_item: entry })
      })

      if (!response.ok) throw new Error('Failed to update item')

      const updatedItem = await response.json()
      setData(prevData =>
        prevData.map(item => item.id === updatedItem.id ? updatedItem : item)
      )
      console.log('Updated:', updatedItem)
    } catch (err) {
      console.error('Error updating item:', err)
      alert(`Failed to update item: ${err.message}`)
    }
  }

  const handleDelete = async (entry) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/v1/gold_standard_items/${entry.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')

      setData(prevData =>
        prevData.filter(item => item.id !== entry.id)
      )
      console.log('Deleted:', entry)
    } catch (err) {
      console.error('Error deleting item:', err)
      alert(`Failed to delete item: ${err.message}`)
    }
  }

  const handleAddNew = () => {
    setNewItem({
      item_code: '',
      email: '',
      phone: '',
      mobile: '',
      start_date: '',
      location_coords: '',
      color_code: '#000000',
      file_attachment: '',
      action_buttons: '',
      category_type: '',
      is_active: true,
      discount: 0,
      status: 'active',
      price: 0,
      quantity: 0,
      whole_number: 0,
      notes: '',
      document_link: ''
    })
    setShowAddModal(true)
  }

  const handleSaveNewItem = async () => {
    try {
      const response = await fetch('/api/v1/gold_standard_items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gold_standard_item: newItem })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create item: ${response.status} ${errorText}`)
      }

      const createdItem = await response.json()
      console.log('Created:', createdItem)

      // Close modal first for better UX
      setShowAddModal(false)

      // Reload all items from API to ensure consistency
      await fetchGoldStandardItems()
    } catch (err) {
      console.error('Error creating item:', err)
      alert(`Failed to save item: ${err.message}`)
    }
  }

  const handleImport = () => {
    alert('Import - This would open a file picker to import price book data')
  }

  const handleExport = () => {
    console.log('Export price book data')
    alert('Export functionality - see console for data structure')
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading gold standard items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gold Standard - TrapidTableView Reference
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Live database table demonstrating all TrapidTableView column types and features.
          Use this as a reference standard for implementing tables throughout Trapid.
        </p>

        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
          >
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">
              Features to Test
            </h3>
            {showFeatures ? (
              <ChevronUpIcon className="h-5 w-5 text-blue-900 dark:text-blue-200" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-blue-900 dark:text-blue-200" />
            )}
          </button>
          {showFeatures && (
            <div className="px-4 pb-4 pt-2 grid md:grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
              <div>✓ Column Tooltips - Hover headers</div>
              <div>✓ Column Resize - Drag borders</div>
              <div>✓ Column Reorder - Drag headers</div>
              <div>✓ Show/Hide - Three-dot menu (scrollable!)</div>
              <div>✓ Filters - Click "Filters" button</div>
              <div>✓ Supplier Multi-Select - Filter by multiple suppliers</div>
              <div>✓ Category Dropdown - Single select filter</div>
              <div>✓ Sorting - Click headers (3-state)</div>
              <div>✓ Computed Column - Auto-calc (price × qty)</div>
              <div>✓ Price Sum - See total in footer</div>
              <div>✓ Bulk Actions - Select & delete rows</div>
              <div>✓ Inline Edit - Toggle edit mode</div>
              <div>✓ State Persistence - Reload page</div>
            </div>
          )}
        </div>
      </div>

      <TrapidTableView
        tableId="gold-standard-table"
        tableIdNumeric={166}
        tableName="Gold Standard Reference"
        entries={data}
        columns={GOLD_STANDARD_COLUMNS}
        onEdit={handleEdit}
        onDelete={handleDelete}
        enableImport={true}
        enableExport={true}
        enableSchemaEditor={true}
        onImport={handleImport}
        onExport={handleExport}
        customActions={
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors h-[42px]"
          >
            <PlusIcon className="h-5 w-5" />
            Add Item
          </button>
        }
      />

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Single Line Text (Code) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code (Single Line Text)
                </label>
                <input
                  type="text"
                  value={newItem.item_code}
                  onChange={(e) => setNewItem({ ...newItem, item_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., CONC-001"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newItem.email}
                  onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="supplier@example.com"
                />
              </div>

              {/* Phone & Mobile */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newItem.phone}
                    onChange={(e) => setNewItem({ ...newItem, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="(03) 9123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={newItem.mobile}
                    onChange={(e) => setNewItem({ ...newItem, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0407 397 541"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date (Date only)
                </label>
                <input
                  type="date"
                  value={newItem.start_date}
                  onChange={(e) => setNewItem({ ...newItem, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* GPS Coordinates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GPS Coordinates (Lat, Long)
                </label>
                <input
                  type="text"
                  value={newItem.location_coords}
                  onChange={(e) => setNewItem({ ...newItem, location_coords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="-33.8688, 151.2093"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color Code
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newItem.color_code}
                    onChange={(e) => setNewItem({ ...newItem, color_code: e.target.value })}
                    className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newItem.color_code}
                    onChange={(e) => setNewItem({ ...newItem, color_code: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Attachment (Path/URL)
                </label>
                <input
                  type="text"
                  value={newItem.file_attachment}
                  onChange={(e) => setNewItem({ ...newItem, file_attachment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="/uploads/document.pdf"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category (Lookup)
                </label>
                <select
                  value={newItem.category_type}
                  onChange={(e) => setNewItem({ ...newItem, category_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category...</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Timber">Timber</option>
                  <option value="Steel">Steel</option>
                  <option value="Plasterboard">Plasterboard</option>
                  <option value="Insulation">Insulation</option>
                  <option value="Tiles">Tiles</option>
                  <option value="Paint">Paint</option>
                  <option value="Roofing">Roofing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Landscaping">Landscaping</option>
                </select>
              </div>

              {/* Status with Badges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status (Lookup with Badges)
                </label>
                <select
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Boolean */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newItem.is_active}
                  onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Is Active (Boolean)
                </label>
              </div>

              {/* Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount (Percentage)
                </label>
                <input
                  type="number"
                  value={newItem.discount}
                  onChange={(e) => setNewItem({ ...newItem, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              {/* Price, Quantity, and Whole Number */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (Currency - AUD)
                  </label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity (Number)
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Whole Number
                  </label>
                  <input
                    type="number"
                    value={newItem.whole_number}
                    onChange={(e) => setNewItem({ ...newItem, whole_number: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              {/* Document Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Link (URL)
                </label>
                <input
                  type="url"
                  value={newItem.document_link}
                  onChange={(e) => setNewItem({ ...newItem, document_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/document.pdf"
                />
              </div>

              {/* Multi Line Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes/Description (Multi Line Text)
                </label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Enter any notes or description..."
                />
              </div>

              {/* Auto-populated timestamp note */}
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                ID, Created At, and Updated At will be auto-populated when the item is created
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewItem}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
