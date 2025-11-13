import { useState } from 'react'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { formatCurrency } from '../../utils/formatters'

function classNames(...classes) {
 return classes.filter(Boolean).join(' ')
}

export default function ProfitSummaryCard({ job, costLineItems = [] }) {
 const [expandedCategories, setExpandedCategories] = useState(new Set())

 const toggleCategory = (category) => {
 const newExpanded = new Set(expandedCategories)
 if (newExpanded.has(category)) {
 newExpanded.delete(category)
 } else {
 newExpanded.add(category)
 }
 setExpandedCategories(newExpanded)
 }

 // Group line items by category and calculate variances
 const categorizedVariances = costLineItems.reduce((acc, item) => {
 if (!item.budget || !item.actual) return acc

 const variance = item.actual - item.budget
 if (variance === 0) return acc // Skip items with no variance

 const category = item.category || 'Uncategorized'
 if (!acc[category]) {
 acc[category] = {
 items: [],
 totalVariance: 0,
 }
 }

 acc[category].items.push({
 name: item.name,
 variance,
 budget: item.budget,
 actual: item.actual,
 })
 acc[category].totalVariance += variance

 return acc
 }, {})

 // Separate into savings (negative variance) and overruns (positive variance)
 const categories = Object.entries(categorizedVariances).map(([name, data]) => ({
 name,
 ...data,
 }))

 const savingsCategories = categories.filter(cat => cat.totalVariance < 0)
 const overrunCategories = categories.filter(cat => cat.totalVariance > 0)

 const totalSavings = savingsCategories.reduce((sum, cat) => sum + Math.abs(cat.totalVariance), 0)
 const totalOverruns = overrunCategories.reduce((sum, cat) => sum + cat.totalVariance, 0)

 return (
 <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
 {/* Live Profit Header */}
 <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
 <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
 Live Profit
 </h3>
 <p className={classNames(
 'text-3xl font-bold',
 job.live_profit >= 0
 ? 'text-green-600 dark:text-green-400'
 : 'text-red-600 dark:text-red-400'
 )}>
 {formatCurrency(job.live_profit || 0, false)}
 </p>
 {job.profit_percentage !== null && (
 <p className={classNames(
 'text-sm font-medium mt-1',
 job.profit_percentage >= 0
 ? 'text-green-600 dark:text-green-400'
 : 'text-red-600 dark:text-red-400'
 )}>
 {job.profit_percentage.toFixed(2)}% margin
 </p>
 )}
 </div>

 {/* Cost Savings Section */}
 {savingsCategories.length > 0 && (
 <div className="mb-6">
 <div className="flex items-center justify-between mb-3">
 <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
 Cost Savings
 </h4>
 <span className="text-sm font-bold text-green-600 dark:text-green-400">
 {formatCurrency(totalSavings, false)}
 </span>
 </div>
 <div className="space-y-2">
 {savingsCategories.map((category) => (
 <div key={category.name} className="text-sm">
 <button
 onClick={() => toggleCategory(category.name)}
 className="w-full flex items-center justify-between p-2 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
 >
 <div className="flex items-center gap-2">
 {expandedCategories.has(category.name) ? (
 <ChevronDownIcon className="h-4 w-4 text-gray-400" />
 ) : (
 <ChevronRightIcon className="h-4 w-4 text-gray-400" />
 )}
 <span className="font-medium text-gray-900 dark:text-white">
 {category.name}
 </span>
 </div>
 <span className="font-semibold text-green-600 dark:text-green-400">
 {formatCurrency(Math.abs(category.totalVariance), false)}
 </span>
 </button>
 {expandedCategories.has(category.name) && (
 <div className="ml-6 mt-1 space-y-1">
 {category.items.map((item, idx) => (
 <div
 key={idx}
 className="flex items-center justify-between py-1 text-xs text-gray-600 dark:text-gray-400"
 >
 <span>{item.name}</span>
 <span className="font-medium text-green-600 dark:text-green-400">
 {formatCurrency(Math.abs(item.variance), false)}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Cost Overruns Section */}
 {overrunCategories.length > 0 && (
 <div>
 <div className="flex items-center justify-between mb-3">
 <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
 Cost Overruns
 </h4>
 <span className="text-sm font-bold text-red-600 dark:text-red-400">
 {formatCurrency(totalOverruns, false)}
 </span>
 </div>
 <div className="space-y-2">
 {overrunCategories.map((category) => (
 <div key={category.name} className="text-sm">
 <button
 onClick={() => toggleCategory(category.name)}
 className="w-full flex items-center justify-between p-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
 >
 <div className="flex items-center gap-2">
 {expandedCategories.has(category.name) ? (
 <ChevronDownIcon className="h-4 w-4 text-gray-400" />
 ) : (
 <ChevronRightIcon className="h-4 w-4 text-gray-400" />
 )}
 <span className="font-medium text-gray-900 dark:text-white">
 {category.name}
 </span>
 </div>
 <span className="font-semibold text-red-600 dark:text-red-400">
 {formatCurrency(category.totalVariance, false)}
 </span>
 </button>
 {expandedCategories.has(category.name) && (
 <div className="ml-6 mt-1 space-y-1">
 {category.items.map((item, idx) => (
 <div
 key={idx}
 className="flex items-center justify-between py-1 text-xs text-gray-600 dark:text-gray-400"
 >
 <span>{item.name}</span>
 <span className="font-medium text-red-600 dark:text-red-400">
 {formatCurrency(item.variance, false)}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Empty state */}
 {savingsCategories.length === 0 && overrunCategories.length === 0 && (
 <div className="text-center py-8">
 <p className="text-sm text-gray-500 dark:text-gray-400">
 No cost variances to display
 </p>
 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
 Add budget and actual costs to track savings and overruns
 </p>
 </div>
 )}
 </div>
 )
}
