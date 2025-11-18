import { useState, useEffect } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
  { key: 'audit', label: 'Date/Time', resizable: true, sortable: true, filterable: false, width: 180, tooltip: 'Date/time field - Last updated timestamp' },
  { key: 'content', label: 'Multi Line Text', resizable: true, sortable: false, filterable: true, filterType: 'text', width: 300, tooltip: 'Multi-line text field - Notes and comments' }
]

// Sample price book data
const SAMPLE_DATA = [
  {
    id: 'description',
    section: '👇 CODE',
    email: 'EMAIL@DOMAIN',
    phone: '(03) 9123 4567',
    mobile: '0407 397 541',
    title: '👇 This table shows Price Book column types and features',
    type: 'CATEGORY',
    is_active: true,
    discount: 0,
    component: 'SUPPLIER',
    status: 'STATUS',
    price: 0,
    quantity: 0,
    updated_at: new Date().toISOString(),
    unit: 'UNIT',
    severity: 'RISK',
    content: 'Hover over column headers to see tooltips. The "Computed" column auto-calculates (price × quantity). Can also do lookups to other tables in formulas.',
    _isDescriptionRow: true
  },
  {
    id: 1,
    section: 'CONC-001',
    email: 'sales@boral.com.au',
    phone: '1300 134 002',
    mobile: '0412 345 678',
    title: '25MPa Concrete Mix',
    type: 'Concrete',
    is_active: true,
    discount: 5,
    component: 'Boral',
    status: 'active',
    price: 285.00,
    quantity: 15,
    updated_at: '2024-11-18T10:05:00.000Z',
    updated_by: 'Rob',
    unit: 'm³',
    severity: 'low',
    content: 'Standard 25MPa concrete mix for slabs and footings',
    history: [
      { date: '2024-11-18T10:05:00.000Z', user: 'Rob', field: 'price', old_value: 275.00, new_value: 285.00, change: '+$10.00' },
      { date: '2024-11-17T09:15:00.000Z', user: 'System', field: 'quantity', old_value: 12, new_value: 15, change: '+3' },
      { date: '2024-11-16T14:30:00.000Z', user: 'Claude', field: 'discount', old_value: 0, new_value: 5, change: '+5%' },
      { date: '2024-11-15T11:00:00.000Z', user: 'Rob', field: 'created', old_value: null, new_value: 'CONC-001', change: 'Created' }
    ]
  },
  {
    id: 2,
    section: 'CONC-002',
    email: 'sales@boral.com.au',
    phone: '1300 134 002',
    title: '32MPa Concrete Mix',
    type: 'Concrete',
    is_active: true,
    discount: 7.5,
    component: 'Boral',
    status: 'active',
    price: 315.00,
    quantity: 8,
    updated_at: '2024-11-17T14:20:00.000Z',
    updated_by: 'Rob',
    unit: 'm³',
    severity: 'low',
    content: 'High strength concrete for structural elements'
  },
  {
    id: 3,
    section: 'TIMB-001',
    email: 'orders@bunnings.com.au',
    phone: '1300 366 852',
    title: '90x45 MGP10 Pine',
    type: 'Timber',
    is_active: true,
    discount: 0,
    component: 'Bunnings',
    status: 'active',
    price: 12.50,
    quantity: 250,
    updated_at: '2024-11-16T09:30:00.000Z',
    updated_by: 'System',
    unit: 'lm',
    severity: 'medium',
    content: 'Standard framing timber - price fluctuates with market'
  },
  {
    id: 4,
    section: 'TIMB-002',
    title: '140x45 MGP10 Pine',
    type: 'Timber',
    component: 'Bunnings',
    status: 'active',
    price: 18.90,
    quantity: 180,
    updated_at: '2024-11-16T09:30:00.000Z',
    updated_by: 'System',
    unit: 'lm',
    severity: 'medium',
    content: 'Larger framing timber for bearers and joists'
  },
  {
    id: 5,
    section: 'STEEL-001',
    title: '150UC30 Universal Column',
    type: 'Steel',
    component: 'OneSteel',
    status: 'active',
    price: 2450.00,
    quantity: 2,
    updated_at: '2024-11-15T16:45:00.000Z',
    updated_by: 'Claude',
    unit: 'tonne',
    severity: 'high',
    content: 'Structural steel - HIGH VOLATILITY - lock in prices ASAP'
  },
  {
    id: 6,
    section: 'STEEL-002',
    title: 'N12 Reinforcing Bar',
    type: 'Steel',
    component: 'OneSteel',
    price: 1850.00,
    unit: 'tonne',
    status: 'active',
    severity: 'high',
    content: 'Rebar for concrete reinforcement - volatile pricing',
    audit: 'Claude - 2024-11-15 16:45'
  },
  {
    id: 7,
    section: 'GYPS-001',
    title: '13mm Gyprock Plasterboard',
    type: 'Plasterboard',
    component: 'CSR',
    price: 18.50,
    unit: 'sheet',
    status: 'active',
    severity: 'low',
    content: 'Standard internal wall lining 2400x1200mm',
    audit: 'Rob - 2024-11-14 11:00'
  },
  {
    id: 8,
    section: 'GYPS-002',
    title: '16mm Moisture Resistant Gyprock',
    type: 'Plasterboard',
    component: 'CSR',
    price: 24.90,
    unit: 'sheet',
    status: 'active',
    severity: 'low',
    content: 'Green board for wet areas 2400x1200mm',
    audit: 'Rob - 2024-11-14 11:00'
  },
  {
    id: 9,
    section: 'INSUL-001',
    title: 'R2.5 Ceiling Batts',
    type: 'Insulation',
    component: 'CSR',
    price: 45.00,
    unit: 'pack',
    status: 'active',
    severity: 'low',
    content: 'Pink batts for ceiling insulation - 10m² coverage',
    audit: 'System - 2024-11-13 15:30'
  },
  {
    id: 10,
    section: 'INSUL-002',
    title: 'R1.5 Wall Batts',
    type: 'Insulation',
    component: 'CSR',
    price: 38.00,
    unit: 'pack',
    status: 'active',
    severity: 'low',
    content: 'Pink batts for wall insulation - 8.6m² coverage',
    audit: 'System - 2024-11-13 15:30'
  },
  {
    id: 11,
    section: 'TILE-001',
    title: '600x600 Porcelain Tile White',
    type: 'Tiles',
    component: 'Beaumont',
    price: 42.00,
    unit: 'm²',
    status: 'active',
    severity: 'medium',
    content: 'Discontinued line - limited stock remaining',
    audit: 'Rob - 2024-11-12 10:15'
  },
  {
    id: 12,
    section: 'TILE-002',
    title: '300x300 Ceramic Floor Tile Grey',
    type: 'Tiles',
    component: 'Beaumont',
    price: 28.50,
    unit: 'm²',
    status: 'active',
    severity: 'low',
    content: 'Popular grey floor tile for bathrooms and laundries',
    audit: 'Rob - 2024-11-12 10:15'
  },
  {
    id: 13,
    section: 'PAINT-001',
    title: 'Dulux Wash&Wear Low Sheen White',
    type: 'Paint',
    component: 'Dulux',
    price: 89.00,
    unit: '10L',
    status: 'active',
    severity: 'low',
    content: 'Premium interior paint - most popular choice',
    audit: 'System - 2024-11-11 09:45'
  },
  {
    id: 14,
    section: 'PAINT-002',
    title: 'Dulux Weathershield Exterior White',
    type: 'Paint',
    component: 'Dulux',
    price: 115.00,
    unit: '10L',
    status: 'active',
    severity: 'low',
    content: 'Exterior paint with UV protection',
    audit: 'System - 2024-11-11 09:45'
  },
  {
    id: 15,
    section: 'ROOF-001',
    title: 'Colorbond Roofing Surfmist',
    type: 'Roofing',
    component: 'BlueScope',
    price: 18.50,
    unit: 'lm',
    status: 'active',
    severity: 'medium',
    content: 'Most popular roof color - stock levels vary',
    audit: 'Claude - 2024-11-10 14:30'
  },
  {
    id: 16,
    section: 'ROOF-002',
    title: 'Terracotta Roof Tiles',
    type: 'Roofing',
    component: 'Monier',
    price: 65.00,
    unit: 'm²',
    status: 'inactive',
    severity: 'critical',
    content: 'DISCONTINUED - supplier no longer producing',
    audit: 'Rob - 2024-11-09 16:00'
  },
  {
    id: 17,
    section: 'ELEC-001',
    title: '2.5mm² Twin & Earth Cable',
    type: 'Electrical',
    component: 'Clipsal',
    price: 3.80,
    unit: 'lm',
    status: 'active',
    severity: 'high',
    content: 'Copper wire - price sensitive to commodity markets',
    audit: 'System - 2024-11-08 11:20'
  },
  {
    id: 18,
    section: 'PLUMB-001',
    title: '20mm Copper Pipe',
    type: 'Plumbing',
    component: 'Reece',
    price: 12.50,
    unit: 'lm',
    status: 'active',
    severity: 'high',
    content: 'Hot water pipe - volatile copper pricing',
    audit: 'System - 2024-11-07 15:50'
  },
  {
    id: 19,
    section: 'PLUMB-002',
    title: '90mm PVC Stormwater Pipe',
    type: 'Plumbing',
    component: 'Reece',
    price: 8.90,
    unit: 'lm',
    status: 'active',
    severity: 'low',
    content: 'Standard stormwater drainage pipe',
    audit: 'Rob - 2024-11-06 09:15'
  },
  {
    id: 20,
    section: 'SAND-001',
    title: 'Bricklayers Sand',
    type: 'Landscaping',
    component: 'Local Quarry',
    price: 45.00,
    unit: 'tonne',
    status: 'active',
    severity: 'low',
    content: 'Fine sand for bricklaying and paving',
    audit: 'Rob - 2024-11-05 13:40'
  }
]

export default function GoldStandardTableTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
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
      setError(null)
    } catch (err) {
      console.error('Error fetching gold standard items:', err)
      setError(err.message)
      // Fallback to sample data if API fails
      setData(SAMPLE_DATA)
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
          Trapid Table View - All Column Types
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This table demonstrates all Trapid Table View column types for Price Books - showing all features,
          filtering options, and table features using realistic construction material pricing data.
        </p>

        {error && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Note:</strong> Using sample data due to API error: {error}
            </p>
          </div>
        )}

        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Features to Test:
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
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
        </div>
      </div>

      <TrapidTableView
        category="price_book_gold_standard"
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
