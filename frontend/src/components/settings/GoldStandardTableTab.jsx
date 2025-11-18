import { useState, useEffect } from 'react'
import { PlusIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import TrapidTableView from '../documentation/TrapidTableView'

// Define price book gold standard columns - showing unique column types only
const GOLD_STANDARD_COLUMNS = [
  { key: 'select', label: '', resizable: false, sortable: false, filterable: false, width: 32, tooltip: 'Checkbox - select rows for bulk actions' },
  { key: 'section', label: 'Single Line Text', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 150, tooltip: 'Single line text field - Item code' },
  { key: 'email', label: 'Email', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 200, tooltip: 'Email field - Must contain @ symbol' },
  { key: 'phone', label: 'Phone', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 150, tooltip: 'Landline Phone - Format: (03) 9123 4567 or 1300 numbers' },
  { key: 'mobile', label: 'Mobile', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 150, tooltip: 'Mobile Phone - Format: 0407 397 541' },
  { key: 'is_active', label: 'Boolean', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 100, tooltip: 'Boolean - True/False checkbox' },
  { key: 'discount', label: 'Percentage', resizable: true, sortable: true, filterable: false, width: 120, tooltip: 'Percentage - Displayed with % symbol' },
  { key: 'status', label: 'Choice', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 140, tooltip: 'Choice - Hardcoded options (active/inactive) with colored badges' },
  { key: 'component', label: 'Multi Lookup (Table)', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 220, tooltip: 'Multi Lookup - Multiple selections from another table (e.g., Suppliers table)' },
  { key: 'price', label: 'Currency', resizable: true, sortable: true, filterable: false, width: 120, showSum: true, sumType: 'currency', tooltip: 'Currency field with sum - Price in AUD' },
  { key: 'quantity', label: 'Number', resizable: true, sortable: true, filterable: false, width: 100, showSum: true, sumType: 'number', tooltip: 'Number field with sum - Quantity' },
  { key: 'whole_number', label: 'Whole Number', resizable: true, sortable: true, filterable: false, width: 120, showSum: true, sumType: 'number', tooltip: 'Whole Number - Integers only (no decimals). Example: Units, Count, Days' },
  { key: 'total_cost', label: 'Computed', resizable: true, sortable: true, filterable: false, width: 140, showSum: true, sumType: 'currency', tooltip: 'Computed - Formula: price × quantity. Can also do lookups to other tables and multiply/add values', isComputed: true, computeFunction: (entry) => (entry.price || 0) * (entry.quantity || 0) },
  { key: 'updated_at', label: 'Date', resizable: true, sortable: true, filterable: false, width: 140, tooltip: 'Date field - Last updated date' },
  { key: 'content', label: 'Multi Line Text', resizable: true, sortable: false, filterable: true, filterType: 'text', width: 300, tooltip: 'Multi-line text field - Notes and comments' }
]

export default function GoldStandardTableTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const [newItem, setNewItem] = useState({
    section: '',
    email: '',
    phone: '',
    mobile: '',
    category_type: '',
    is_active: true,
    discount: 0,
    component: '',
    status: 'active',
    price: 0,
    quantity: 0,
    content: ''
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
      section: '',
      email: '',
      phone: '',
      mobile: '',
      category_type: '',
      is_active: true,
      discount: 0,
      component: '',
      status: 'active',
      price: 0,
      quantity: 0,
      content: ''
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
        entries={data}
        columns={GOLD_STANDARD_COLUMNS}
        onEdit={handleEdit}
        onDelete={handleDelete}
        enableImport={true}
        enableExport={true}
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
                  value={newItem.section}
                  onChange={(e) => setNewItem({ ...newItem, section: e.target.value })}
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

              {/* Suppliers Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Supplier (Multi Lookup)
                </label>
                <select
                  value={newItem.component}
                  onChange={(e) => setNewItem({ ...newItem, component: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a supplier...</option>
                  <option value="Boral">Boral</option>
                  <option value="Bunnings">Bunnings</option>
                  <option value="OneSteel">OneSteel</option>
                  <option value="CSR">CSR</option>
                  <option value="Beaumont">Beaumont</option>
                  <option value="Dulux">Dulux</option>
                  <option value="BlueScope">BlueScope</option>
                  <option value="Monier">Monier</option>
                  <option value="Clipsal">Clipsal</option>
                  <option value="Reece">Reece</option>
                  <option value="Local Quarry">Local Quarry</option>
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

              {/* Price and Quantity */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Multi Line Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes/Description (Multi Line Text)
                </label>
                <textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Enter any notes or description..."
                />
              </div>

              {/* Auto-populated timestamp note */}
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                Date/Time will be auto-populated when the item is created
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
