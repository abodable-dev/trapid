import { useState, useEffect } from 'react'
import { BeakerIcon, PlusIcon, TrashIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import UnrealVariablesTab from '../components/xest/UnrealVariablesTab'

export default function XestPage() {
  const [activeTab, setActiveTab] = useState('estimate')
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [pricebookItems, setPricebookItems] = useState([])
  const [scheduleTemplates, setScheduleTemplates] = useState([])

  // Current form state
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedRange, setSelectedRange] = useState('')
  const [selectedColour, setSelectedColour] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [linkedScheduleItem, setLinkedScheduleItem] = useState(null)

  // Estimate items
  const [estimateItems, setEstimateItems] = useState([])

  // Modal for linking schedule items
  const [showScheduleLinkModal, setShowScheduleLinkModal] = useState(false)
  const [linkingItemIndex, setLinkingItemIndex] = useState(null)

  const [loading, setLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    loadCategories()
    loadScheduleTemplates()
  }, [])

  // Load brands when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadBrands(selectedCategory)
    } else {
      setBrands([])
    }
  }, [selectedCategory])

  // Load items when brand changes
  useEffect(() => {
    if (selectedCategory && selectedBrand) {
      loadPricebookItems(selectedCategory, selectedBrand)
    } else {
      setPricebookItems([])
    }
  }, [selectedCategory, selectedBrand])

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/v1/pricebook', {
        params: { per_page: 1000 }
      })
      const uniqueCategories = [...new Set(
        response.items
          ?.filter(item => item.category)
          .map(item => item.category)
      )].sort()
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadBrands = async (category) => {
    try {
      const response = await api.get('/api/v1/pricebook', {
        params: { category, per_page: 1000 }
      })
      const uniqueBrands = [...new Set(
        response.items
          ?.filter(item => item.brand)
          .map(item => item.brand)
      )].sort()
      setBrands(uniqueBrands)
    } catch (error) {
      console.error('Failed to load brands:', error)
    }
  }

  const loadPricebookItems = async (category, brand) => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/pricebook', {
        params: { category, per_page: 1000 }
      })
      const filteredItems = response.items?.filter(item =>
        item.brand === brand && item.current_price
      ) || []
      setPricebookItems(filteredItems)
    } catch (error) {
      console.error('Failed to load pricebook items:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadScheduleTemplates = async () => {
    try {
      const response = await api.get('/api/v1/schedule_templates')
      setScheduleTemplates(response.schedule_templates || [])
    } catch (error) {
      console.error('Failed to load schedule templates:', error)
    }
  }

  // Extract range and colour from item name (customize based on your naming convention)
  const extractRangeAndColour = (itemName) => {
    // This is a simple example - adjust based on your item naming convention
    const parts = itemName.split(' - ')
    return {
      range: parts[1] || '',
      colour: parts[2] || ''
    }
  }

  const getRanges = () => {
    const ranges = [...new Set(
      pricebookItems.map(item => extractRangeAndColour(item.item_name).range)
    )].filter(Boolean).sort()
    return ranges
  }

  const getColours = (range) => {
    const colours = [...new Set(
      pricebookItems
        .filter(item => extractRangeAndColour(item.item_name).range === range)
        .map(item => extractRangeAndColour(item.item_name).colour)
    )].filter(Boolean).sort()
    return colours
  }

  const getFilteredItems = () => {
    return pricebookItems.filter(item => {
      const { range, colour } = extractRangeAndColour(item.item_name)
      if (selectedRange && range !== selectedRange) return false
      if (selectedColour && colour !== selectedColour) return false
      return true
    })
  }

  const addToEstimate = () => {
    if (!selectedItem || quantity <= 0) return

    const newItem = {
      id: Date.now(),
      pricebookItem: selectedItem,
      quantity: parseFloat(quantity),
      unitPrice: selectedItem.current_price,
      totalPrice: selectedItem.current_price * parseFloat(quantity),
      scheduleItem: linkedScheduleItem,
      category: selectedCategory,
      brand: selectedBrand,
      range: selectedRange,
      colour: selectedColour
    }

    setEstimateItems([...estimateItems, newItem])

    // Reset form
    setSelectedItem(null)
    setQuantity(1)
    setLinkedScheduleItem(null)
    setSelectedRange('')
    setSelectedColour('')
  }

  const removeFromEstimate = (itemId) => {
    setEstimateItems(estimateItems.filter(item => item.id !== itemId))
  }

  const openScheduleLinkModal = (index) => {
    setLinkingItemIndex(index)
    setShowScheduleLinkModal(true)
  }

  const linkScheduleItem = (scheduleItem) => {
    if (linkingItemIndex !== null) {
      const updatedItems = [...estimateItems]
      updatedItems[linkingItemIndex].scheduleItem = scheduleItem
      setEstimateItems(updatedItems)
    } else {
      setLinkedScheduleItem(scheduleItem)
    }
    setShowScheduleLinkModal(false)
    setLinkingItemIndex(null)
  }

  const getTotalEstimate = () => {
    return estimateItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BeakerIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Estimate Tool</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create fast estimates with cascade product selection</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('estimate')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'estimate'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Quick Estimate
          </button>
          <button
            onClick={() => setActiveTab('unreal')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'unreal'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Unreal Variables
          </button>
        </nav>
      </div>

      {activeTab === 'estimate' && (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Add Items Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Item</h2>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedBrand('')
                setSelectedRange('')
                setSelectedColour('')
                setSelectedItem(null)
              }}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Category...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Brand Selection */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value)
                  setSelectedRange('')
                  setSelectedColour('')
                  setSelectedItem(null)
                }}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Brand...</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          )}

          {/* Range Selection */}
          {selectedBrand && getRanges().length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Range
              </label>
              <select
                value={selectedRange}
                onChange={(e) => {
                  setSelectedRange(e.target.value)
                  setSelectedColour('')
                  setSelectedItem(null)
                }}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Range...</option>
                {getRanges().map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          )}

          {/* Colour Selection */}
          {selectedRange && getColours(selectedRange).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Colour
              </label>
              <select
                value={selectedColour}
                onChange={(e) => {
                  setSelectedColour(e.target.value)
                  setSelectedItem(null)
                }}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Colour...</option>
                {getColours(selectedRange).map(colour => (
                  <option key={colour} value={colour}>{colour}</option>
                ))}
              </select>
            </div>
          )}

          {/* Item Selection */}
          {selectedBrand && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Item ({getFilteredItems().length} available)
              </label>
              <select
                value={selectedItem?.id || ''}
                onChange={(e) => {
                  const item = pricebookItems.find(i => i.id === parseInt(e.target.value))
                  setSelectedItem(item)
                }}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={loading}
              >
                <option value="">Select Item...</option>
                {getFilteredItems().map(item => (
                  <option key={item.id} value={item.id}>
                    {item.item_name} - ${item.current_price?.toFixed(2)} / {item.unit_of_measure}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          {selectedItem && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Link to Schedule Item */}
          {selectedItem && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link to Schedule Item (Optional)
              </label>
              <button
                onClick={() => openScheduleLinkModal(null)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <LinkIcon className="h-5 w-5" />
                {linkedScheduleItem ? linkedScheduleItem.name : 'Link Schedule Item'}
              </button>
              {linkedScheduleItem && (
                <button
                  onClick={() => setLinkedScheduleItem(null)}
                  className="mt-2 w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700"
                >
                  Clear Link
                </button>
              )}
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={addToEstimate}
            disabled={!selectedItem || quantity <= 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-5 w-5" />
            Add to Estimate
          </button>
        </div>

        {/* Right Column - Estimate Summary */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estimate Items ({estimateItems.length})
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {estimateItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No items added yet. Start by selecting a category.
              </p>
            ) : (
              estimateItems.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.pricebookItem.item_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.category} › {item.brand}
                        {item.range && ` › ${item.range}`}
                        {item.colour && ` › ${item.colour}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromEstimate(item.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-medium">
                        {item.quantity} {item.pricebookItem.unit_of_measure}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Unit Price:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-medium">
                        ${item.unitPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Total: ${item.totalPrice.toFixed(2)}
                    </span>
                    {item.scheduleItem ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <LinkIcon className="h-4 w-4" />
                          {item.scheduleItem.name}
                        </span>
                        <button
                          onClick={() => openScheduleLinkModal(index)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openScheduleLinkModal(index)}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Link Schedule
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total */}
          {estimateItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Total Estimate:
                </span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${getTotalEstimate().toFixed(2)}
                </span>
              </div>

              <button
                className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Estimate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Link Modal  */}
      {showScheduleLinkModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Link to Schedule Item
              </h3>
              <button
                onClick={() => {
                  setShowScheduleLinkModal(false)
                  setLinkingItemIndex(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-2">
              {scheduleTemplates.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No schedule templates found.
                </p>
              ) : (
                scheduleTemplates.map(template => (
                  <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h4>
                    <div className="space-y-1 ml-4">
                      {template.rows?.map(row => (
                        <button
                          key={row.id}
                          onClick={() => linkScheduleItem(row)}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {row.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'unreal' && <UnrealVariablesTab />}
    </div>
  )
}
