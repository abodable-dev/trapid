import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, ArrowPathIcon, ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { api } from '../api'

export default function HealthPage() {
  const [loading, setLoading] = useState(true)
  const [healthChecks, setHealthChecks] = useState({
    totalPricebookItems: 0,
    itemsWithoutDefaultSupplier: {
      count: 0,
      items: []
    },
    suppliersWithIncompleteCategoryPricing: {
      count: 0,
      suppliersWithIssuesCount: 0,
      totalSuppliers: 0,
      suppliers: []
    },
    itemsWithDefaultSupplierButNoPriceHistory: {
      count: 0,
      items: []
    },
    itemsRequiringPhotoWithoutImage: {
      count: 0,
      items: []
    }
  })
  const [priceHealthCheck, setPriceHealthCheck] = useState({
    total_items_checked: 0,
    issues_found: 0,
    issues: []
  })
  const [expandedSupplierCategory, setExpandedSupplierCategory] = useState(null)
  const [loadingMissingItems, setLoadingMissingItems] = useState(false)
  const [missingItems, setMissingItems] = useState({})
  const [expandedSections, setExpandedSections] = useState({
    itemsWithoutDefaultSupplier: false,
    suppliersWithIncompleteCategoryPricing: false,
    itemsWithDefaultSupplierButNoPriceHistory: false,
    itemsRequiringPhotoWithoutImage: false,
    priceMismatches: false
  })
  const [searchQueries, setSearchQueries] = useState({
    itemsWithoutDefaultSupplier: '',
    suppliersWithIncompleteCategoryPricing: '',
    itemsWithDefaultSupplierButNoPriceHistory: '',
    itemsRequiringPhotoWithoutImage: '',
    priceMismatches: ''
  })

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const updateSearchQuery = (sectionName, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [sectionName]: value
    }))
  }

  const filterItems = (items, sectionName) => {
    const query = searchQueries[sectionName]
    if (!query.trim()) return items

    const queryLower = query.toLowerCase()
    return items.filter(item =>
      item.item_code?.toLowerCase().includes(queryLower) ||
      item.item_name?.toLowerCase().includes(queryLower) ||
      item.category?.toLowerCase().includes(queryLower)
    )
  }

  const filterSuppliers = (suppliers) => {
    const query = searchQueries.suppliersWithIncompleteCategoryPricing
    if (!query.trim()) return suppliers

    const queryLower = query.toLowerCase()
    return suppliers.filter(entry =>
      entry.supplier?.name?.toLowerCase().includes(queryLower) ||
      entry.category?.toLowerCase().includes(queryLower)
    )
  }

  useEffect(() => {
    loadHealthData()
    loadPriceHealthCheck()
  }, [])

  const loadHealthData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/health/pricebook')
      setHealthChecks(response)
    } catch (error) {
      console.error('Failed to load health data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPriceHealthCheck = async () => {
    try {
      const response = await api.get('/api/v1/pricebook/price_health_check')
      setPriceHealthCheck(response)
    } catch (error) {
      console.error('Failed to load price health check:', error)
    }
  }

  const toggleSupplierCategory = async (supplierId, category) => {
    const key = `${supplierId}-${category}`

    if (expandedSupplierCategory === key) {
      // Collapse if already expanded
      setExpandedSupplierCategory(null)
      return
    }

    // Expand and load missing items if not already loaded
    setExpandedSupplierCategory(key)

    if (!missingItems[key]) {
      try {
        setLoadingMissingItems(true)
        const response = await api.get(`/api/v1/health/pricebook/missing_items?supplier_id=${supplierId}&category=${encodeURIComponent(category)}`)
        setMissingItems(prev => ({ ...prev, [key]: response.items }))
      } catch (error) {
        console.error('Failed to load missing items:', error)
      } finally {
        setLoadingMissingItems(false)
      }
    }
  }

  // Calculate health percentage for each health check
  // Returns the percentage of items that are HEALTHY (correct)
  const calculateHealthPercentage = (issueCount, totalItems) => {
    if (totalItems === 0) return 100 // No items = 100% healthy
    if (issueCount === 0) return 100 // No issues = 100% healthy

    const healthyCount = totalItems - issueCount
    const percentage = (healthyCount / totalItems) * 100

    // If there's at least one issue, cap at 99% (never show 100%)
    return Math.min(99, Math.round(percentage))
  }

  // Use the real total from the backend
  const totalPricebookItems = healthChecks.totalPricebookItems || 0

  // Calculate individual health percentages
  const itemsWithoutDefaultSupplierPct = calculateHealthPercentage(
    healthChecks.itemsWithoutDefaultSupplier.count,
    totalPricebookItems
  )

  const itemsWithDefaultSupplierButNoPriceHistoryPct = calculateHealthPercentage(
    healthChecks.itemsWithDefaultSupplierButNoPriceHistory.count,
    totalPricebookItems
  )

  const itemsRequiringPhotoWithoutImagePct = calculateHealthPercentage(
    healthChecks.itemsRequiringPhotoWithoutImage.count,
    totalPricebookItems
  )

  const priceMismatchesPct = calculateHealthPercentage(
    priceHealthCheck.issues_found,
    priceHealthCheck.total_items_checked
  )

  // Suppliers percentage - calculate health percentage for suppliers
  // Based on unique suppliers with issues vs total suppliers
  const suppliersHealthPct = calculateHealthPercentage(
    healthChecks.suppliersWithIncompleteCategoryPricing.suppliersWithIssuesCount || 0,
    healthChecks.suppliersWithIncompleteCategoryPricing.totalSuppliers || 0
  )

  // Overall health is the average of all health percentages
  const overallHealthPercentage = Math.round(
    (itemsWithoutDefaultSupplierPct +
     suppliersHealthPct +
     itemsWithDefaultSupplierButNoPriceHistoryPct +
     itemsRequiringPhotoWithoutImagePct +
     priceMismatchesPct) / 5
  )

  const getHealthColor = (percentage) => {
    if (percentage === 100) return 'green'
    if (percentage >= 75) return 'orange'
    return 'red'
  }


  const healthPercentage = overallHealthPercentage
  const healthColor = getHealthColor(healthPercentage)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <PlusIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                System Health
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Monitor data quality and system integrity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Health Percentage Display */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overall Health
                </div>
                <div className={`text-3xl font-bold ${
                  healthColor === 'green' ? 'text-green-600 dark:text-green-400' :
                  healthColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                  healthColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {healthPercentage}%
                </div>
              </div>
              <div className="w-16 h-16">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={`${(healthPercentage / 100) * 264} 264`}
                    strokeLinecap="round"
                    className={
                      healthColor === 'green' ? 'text-green-600 dark:text-green-400' :
                      healthColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      healthColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={loadHealthData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Pricebook Health Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pricebook Data Quality
              </h2>
            </div>

            <div className="p-6 space-y-8">
              {/* Items Without Default Supplier */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 p-2 -ml-2">
                    <button
                      onClick={() => toggleSection('itemsWithoutDefaultSupplier')}
                      className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        getHealthColor(itemsWithoutDefaultSupplierPct) === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        getHealthColor(itemsWithoutDefaultSupplierPct) === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          getHealthColor(itemsWithoutDefaultSupplierPct) === 'green' ? 'text-green-600 dark:text-green-400' :
                          getHealthColor(itemsWithoutDefaultSupplierPct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {healthChecks.itemsWithoutDefaultSupplier.count}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          Items Without Default Supplier
                          <span className={`text-sm font-bold ${
                            getHealthColor(itemsWithoutDefaultSupplierPct) === 'green' ? 'text-green-600 dark:text-green-400' :
                            getHealthColor(itemsWithoutDefaultSupplierPct) === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                            getHealthColor(itemsWithoutDefaultSupplierPct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            ({itemsWithoutDefaultSupplierPct}%)
                          </span>
                          {healthChecks.itemsWithoutDefaultSupplier.count > 0 && (
                            expandedSections.itemsWithoutDefaultSupplier ? (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            )
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Pricebook items that don't have a default supplier assigned
                        </p>
                      </div>
                    </button>
                    {healthChecks.itemsWithoutDefaultSupplier.count > 0 && (
                      <div className="relative flex-1 max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQueries.itemsWithoutDefaultSupplier}
                          onChange={(e) => updateSearchQuery('itemsWithoutDefaultSupplier', e.target.value)}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!expandedSections.itemsWithoutDefaultSupplier) {
                              toggleSection('itemsWithoutDefaultSupplier')
                            }
                          }}
                          className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Item List */}
                  {healthChecks.itemsWithoutDefaultSupplier.count > 0 && expandedSections.itemsWithoutDefaultSupplier && (
                    <div className="mt-4 ml-15">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Current Price
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filterItems(healthChecks.itemsWithoutDefaultSupplier.items, 'itemsWithoutDefaultSupplier').slice(0, 10).map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                  <Link
                                    to={`/price-books/${item.id}`}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                                  >
                                    {item.item_code}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {item.item_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.category || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.current_price ? `$${parseFloat(item.current_price).toFixed(2)}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {healthChecks.itemsWithoutDefaultSupplier.count > 10 && (
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 text-center">
                            Showing 10 of {healthChecks.itemsWithoutDefaultSupplier.count} items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {healthChecks.itemsWithoutDefaultSupplier.count === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Healthy
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                      Needs Attention
                    </span>
                  )}
                </div>
              </div>

              {/* Suppliers with Incomplete Category Pricing */}
              <div className="flex items-start justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <div className="flex items-start gap-3 p-2 -ml-2">
                    <button
                      onClick={() => toggleSection('suppliersWithIncompleteCategoryPricing')}
                      className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        getHealthColor(suppliersHealthPct) === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        getHealthColor(suppliersHealthPct) === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          getHealthColor(suppliersHealthPct) === 'green' ? 'text-green-600 dark:text-green-400' :
                          getHealthColor(suppliersHealthPct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {healthChecks.suppliersWithIncompleteCategoryPricing.count}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          Suppliers with Incomplete Category Pricing
                          <span className={`text-sm font-bold ${
                            getHealthColor(suppliersHealthPct) === 'green' ? 'text-green-600 dark:text-green-400' :
                            getHealthColor(suppliersHealthPct) === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                            getHealthColor(suppliersHealthPct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            ({suppliersHealthPct}%)
                          </span>
                          {healthChecks.suppliersWithIncompleteCategoryPricing.count > 0 && (
                            expandedSections.suppliersWithIncompleteCategoryPricing ? (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            )
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Suppliers who have price history for some items in a category but not all
                        </p>
                      </div>
                    </button>
                    {healthChecks.suppliersWithIncompleteCategoryPricing.count > 0 && (
                      <div className="relative flex-1 max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQueries.suppliersWithIncompleteCategoryPricing}
                          onChange={(e) => updateSearchQuery('suppliersWithIncompleteCategoryPricing', e.target.value)}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!expandedSections.suppliersWithIncompleteCategoryPricing) {
                              toggleSection('suppliersWithIncompleteCategoryPricing')
                            }
                          }}
                          className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Supplier List */}
                  {healthChecks.suppliersWithIncompleteCategoryPricing.count > 0 && expandedSections.suppliersWithIncompleteCategoryPricing && (
                    <div className="mt-4 ml-15">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Supplier
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Coverage
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Items Priced
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Missing Prices
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800">
                            {filterSuppliers(healthChecks.suppliersWithIncompleteCategoryPricing.suppliers).slice(0, 15).map((entry, idx) => {
                              const key = `${entry.supplier.id}-${entry.category}`
                              const isExpanded = expandedSupplierCategory === key
                              const items = missingItems[key] || []

                              return (
                                <>
                                  <tr
                                    key={idx}
                                    onClick={() => toggleSupplierCategory(entry.supplier.id, entry.category)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-t border-gray-200 dark:border-gray-700"
                                  >
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                      <div className="flex items-center gap-2">
                                        {isExpanded ? (
                                          <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        ) : (
                                          <ChevronRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        )}
                                        {entry.supplier.name}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                      {entry.category}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full ${
                                              entry.coverage_percentage >= 75
                                                ? 'bg-green-500'
                                                : entry.coverage_percentage >= 50
                                                  ? 'bg-yellow-500'
                                                  : 'bg-orange-500'
                                            }`}
                                            style={{ width: `${entry.coverage_percentage}%` }}
                                          />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                                          {entry.coverage_percentage}%
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                                      {entry.items_with_pricing} / {entry.total_items_in_category}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400">
                                        {entry.missing_items_count}
                                      </span>
                                    </td>
                                  </tr>
                                  {isExpanded && (
                                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                                      <td colSpan="5" className="px-4 py-4">
                                        {loadingMissingItems ? (
                                          <div className="flex items-center justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading missing items...</span>
                                          </div>
                                        ) : items.length > 0 ? (
                                          <div className="space-y-2">
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                                              Missing Items for {entry.supplier.name} in {entry.category}:
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                              {items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs">
                                                  <span className="font-mono text-gray-500 dark:text-gray-400">{item.item_code}</span>
                                                  <span className="text-gray-900 dark:text-white truncate">{item.item_name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                            No missing items found
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </>
                              )
                            })}
                          </tbody>
                        </table>
                        {healthChecks.suppliersWithIncompleteCategoryPricing.count > 15 && (
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 text-center">
                            Showing 15 of {healthChecks.suppliersWithIncompleteCategoryPricing.count} supplier-category combinations
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {healthChecks.suppliersWithIncompleteCategoryPricing.count === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Healthy
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400">
                      Needs Attention
                    </span>
                  )}
                </div>
              </div>

              {/* Items with Default Supplier but No Price History */}
              <div className="flex items-start justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <div className="flex items-start gap-3 p-2 -ml-2">
                    <button
                      onClick={() => toggleSection('itemsWithDefaultSupplierButNoPriceHistory')}
                      className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        getHealthColor(itemsWithDefaultSupplierButNoPriceHistoryPct) === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        getHealthColor(itemsWithDefaultSupplierButNoPriceHistoryPct) === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          getHealthColor(itemsWithDefaultSupplierButNoPriceHistoryPct) === 'green' ? 'text-green-600 dark:text-green-400' :
                          getHealthColor(itemsWithDefaultSupplierButNoPriceHistoryPct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {healthChecks.itemsWithDefaultSupplierButNoPriceHistory.count}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          Items with Default Supplier but No Price History
                          <span className={`text-sm font-bold ${
                            getHealthColor(itemsWithDefaultSupplierButNoPriceHistoryPct) === 'green' ? 'text-green-600 dark:text-green-400' :
                            getHealthColor(itemsWithDefaultSupplierButNoPriceHistoryPct) === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                            getHealthColor(itemsWithDefaultSupplierButNoPriceHistoryPct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            ({itemsWithDefaultSupplierButNoPriceHistoryPct}%)
                          </span>
                          {healthChecks.itemsWithDefaultSupplierButNoPriceHistory.count > 0 && (
                            expandedSections.itemsWithDefaultSupplierButNoPriceHistory ? (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            )
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Items have a default supplier set but no corresponding price history entry
                        </p>
                      </div>
                    </button>
                    {healthChecks.itemsWithDefaultSupplierButNoPriceHistory.count > 0 && (
                      <div className="relative flex-1 max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQueries.itemsWithDefaultSupplierButNoPriceHistory}
                          onChange={(e) => updateSearchQuery('itemsWithDefaultSupplierButNoPriceHistory', e.target.value)}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!expandedSections.itemsWithDefaultSupplierButNoPriceHistory) {
                              toggleSection('itemsWithDefaultSupplierButNoPriceHistory')
                            }
                          }}
                          className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Item List */}
                  {healthChecks.itemsWithDefaultSupplierButNoPriceHistory.count > 0 && expandedSections.itemsWithDefaultSupplierButNoPriceHistory && (
                    <div className="mt-4 ml-15">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Default Supplier
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Current Price
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-y-gray-200 dark:divide-gray-700">
                            {filterItems(healthChecks.itemsWithDefaultSupplierButNoPriceHistory.items, 'itemsWithDefaultSupplierButNoPriceHistory').slice(0, 15).map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                  <Link
                                    to={`/price-books/${item.id}`}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                                  >
                                    {item.item_code}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {item.item_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.category || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.default_supplier?.name || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.current_price ? `$${parseFloat(item.current_price).toFixed(2)}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {healthChecks.itemsWithDefaultSupplierButNoPriceHistory.count > 15 && (
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 text-center">
                            Showing 15 of {healthChecks.itemsWithDefaultSupplierButNoPriceHistory.count} items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {healthChecks.itemsWithDefaultSupplierButNoPriceHistory.count === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Healthy
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                      Needs Attention
                    </span>
                  )}
                </div>
              </div>

              {/* Items Requiring Photo Without Image */}
              <div className="flex items-start justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <div className="flex items-start gap-3 p-2 -ml-2">
                    <button
                      onClick={() => toggleSection('itemsRequiringPhotoWithoutImage')}
                      className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        getHealthColor(itemsRequiringPhotoWithoutImagePct) === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        getHealthColor(itemsRequiringPhotoWithoutImagePct) === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          getHealthColor(itemsRequiringPhotoWithoutImagePct) === 'green' ? 'text-green-600 dark:text-green-400' :
                          getHealthColor(itemsRequiringPhotoWithoutImagePct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {healthChecks.itemsRequiringPhotoWithoutImage.count}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          Items Requiring Photo Without Image
                          <span className={`text-sm font-bold ${
                            getHealthColor(itemsRequiringPhotoWithoutImagePct) === 'green' ? 'text-green-600 dark:text-green-400' :
                            getHealthColor(itemsRequiringPhotoWithoutImagePct) === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                            getHealthColor(itemsRequiringPhotoWithoutImagePct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            ({itemsRequiringPhotoWithoutImagePct}%)
                          </span>
                          {healthChecks.itemsRequiringPhotoWithoutImage.count > 0 && (
                            expandedSections.itemsRequiringPhotoWithoutImage ? (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            )
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Items marked as requiring a photo but have no image attached
                        </p>
                      </div>
                    </button>
                    {healthChecks.itemsRequiringPhotoWithoutImage.count > 0 && (
                      <div className="relative flex-1 max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQueries.itemsRequiringPhotoWithoutImage}
                          onChange={(e) => updateSearchQuery('itemsRequiringPhotoWithoutImage', e.target.value)}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!expandedSections.itemsRequiringPhotoWithoutImage) {
                              toggleSection('itemsRequiringPhotoWithoutImage')
                            }
                          }}
                          className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Item List */}
                  {healthChecks.itemsRequiringPhotoWithoutImage.count > 0 && expandedSections.itemsRequiringPhotoWithoutImage && (
                    <div className="mt-4 ml-15">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Current Price
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filterItems(healthChecks.itemsRequiringPhotoWithoutImage.items, 'itemsRequiringPhotoWithoutImage').slice(0, 10).map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                  <Link
                                    to={`/price-books/${item.id}`}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                                  >
                                    {item.item_code}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {item.item_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.category || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.current_price ? `$${parseFloat(item.current_price).toFixed(2)}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {healthChecks.itemsRequiringPhotoWithoutImage.count > 10 && (
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 text-center">
                            Showing 10 of {healthChecks.itemsRequiringPhotoWithoutImage.count} items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {healthChecks.itemsRequiringPhotoWithoutImage.count === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Healthy
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                      Needs Attention
                    </span>
                  )}
                </div>
              </div>

              {/* Price Mismatches */}
              <div className="flex items-start justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <div className="flex items-start gap-3 p-2 -ml-2">
                    <button
                      onClick={() => toggleSection('priceMismatches')}
                      className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        getHealthColor(priceMismatchesPct) === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        getHealthColor(priceMismatchesPct) === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          getHealthColor(priceMismatchesPct) === 'green' ? 'text-green-600 dark:text-green-400' :
                          getHealthColor(priceMismatchesPct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {priceHealthCheck.issues_found}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          Price Mismatches (Active vs Current)
                          <span className={`text-sm font-bold ${
                            getHealthColor(priceMismatchesPct) === 'green' ? 'text-green-600 dark:text-green-400' :
                            getHealthColor(priceMismatchesPct) === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                            getHealthColor(priceMismatchesPct) === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            ({priceMismatchesPct}%)
                          </span>
                          {priceHealthCheck.issues_found > 0 && (
                            expandedSections.priceMismatches ? (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            )
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Items where the active price from default supplier doesn't match the item's current price
                        </p>
                      </div>
                    </button>
                    {priceHealthCheck.issues_found > 0 && (
                      <div className="relative flex-1 max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQueries.priceMismatches}
                          onChange={(e) => updateSearchQuery('priceMismatches', e.target.value)}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!expandedSections.priceMismatches) {
                              toggleSection('priceMismatches')
                            }
                          }}
                          className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Item List */}
                  {priceHealthCheck.issues_found > 0 && expandedSections.priceMismatches && (
                    <div className="mt-4 ml-15">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Default Supplier
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Current Price
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Active Price
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Difference
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {(() => {
                              const query = searchQueries.priceMismatches.toLowerCase()
                              const filtered = priceHealthCheck.issues.filter(issue =>
                                !query.trim() ||
                                issue.item_code?.toLowerCase().includes(query) ||
                                issue.item_name?.toLowerCase().includes(query) ||
                                issue.default_supplier_name?.toLowerCase().includes(query)
                              )
                              return filtered.slice(0, 15).map((issue) => (
                                <tr key={issue.item_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                    <Link
                                      to={`/price-books/${issue.item_id}`}
                                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                                    >
                                      {issue.item_code}
                                    </Link>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    {issue.item_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {issue.default_supplier_name || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                                    {issue.item_current_price ? `$${parseFloat(issue.item_current_price).toFixed(2)}` : '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                                    {issue.active_price_value ? `$${parseFloat(issue.active_price_value).toFixed(2)}` : '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    {issue.difference !== null && issue.difference !== undefined ? (
                                      <span className={`font-medium ${
                                        issue.difference > 0 ? 'text-red-600 dark:text-red-400' :
                                        issue.difference < 0 ? 'text-green-600 dark:text-green-400' :
                                        'text-gray-600 dark:text-gray-400'
                                      }`}>
                                        {issue.difference > 0 ? '+' : ''}{issue.difference < 0 ? '-' : ''}${Math.abs(issue.difference).toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-600 dark:text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            })()}
                          </tbody>
                        </table>
                        {priceHealthCheck.issues_found > 15 && (
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 text-center">
                            Showing 15 of {priceHealthCheck.issues_found} items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {priceHealthCheck.issues_found === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Healthy
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                      Needs Attention
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
