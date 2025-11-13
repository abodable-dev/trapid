import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const COLORS = {
 costs: '#ef4444', // red-500
 profit: '#22c55e', // green-500
 pending: '#f59e0b', // amber-500
}

const DARK_COLORS = {
 costs: '#f87171', // red-400
 profit: '#4ade80', // green-400
 pending: '#fbbf24', // amber-400
}

export default function ProfitAnalysisPieChart({ job, isDark = false }) {
 const contractValue = job.contract_value || 0
 const liveProfit = job.live_profit || 0
 const costs = contractValue - liveProfit // Actual costs incurred

 // Pending is the amount not yet committed
 // This could be refined based on actual PO data vs estimates
 const pending = Math.max(0, contractValue - costs - liveProfit)

 const data = [
 { name: 'Costs', value: costs > 0 ? costs : 0 },
 { name: 'Profit', value: liveProfit > 0 ? liveProfit : 0 },
 { name: 'Pending', value: pending > 0 ? pending : 0 },
 ].filter(item => item.value > 0) // Only show non-zero values

 const colors = isDark ? DARK_COLORS : COLORS

 const CustomTooltip = ({ active, payload }) => {
 if (active && payload && payload.length) {
 const data = payload[0]
 return (
 <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-3">
 <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
 {data.name}
 </p>
 <p className="text-lg font-bold text-gray-900 dark:text-white">
 {formatCurrency(data.value, false)}
 </p>
 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
 {((data.value / contractValue) * 100).toFixed(1)}% of contract
 </p>
 </div>
 )
 }
 return null
 }

 const renderLegend = (props) => {
 const { payload } = props
 return (
 <div className="flex flex-wrap justify-center gap-4 mt-4">
 {payload.map((entry, index) => (
 <div key={`legend-${index}`} className="flex items-center gap-2">
 <div
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: entry.color }}
 />
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
 {entry.value}
 </span>
 <span className="text-sm text-gray-500 dark:text-gray-400">
 {formatCurrency(data[index].value, false)}
 </span>
 </div>
 ))}
 </div>
 )
 }

 if (contractValue === 0) {
 return (
 <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
 <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
 Profit Analysis
 </h3>
 <div className="flex items-center justify-center h-64">
 <div className="text-center">
 <p className="text-sm text-gray-500 dark:text-gray-400">
 No contract value set
 </p>
 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
 Set a contract value to see profit analysis
 </p>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-base font-semibold text-gray-900 dark:text-white">
 Profit Analysis
 </h3>
 <div className="text-right">
 <p className="text-xs text-gray-500 dark:text-gray-400">Contract Value</p>
 <p className="text-lg font-bold text-gray-900 dark:text-white">
 {formatCurrency(contractValue, false)}
 </p>
 </div>
 </div>

 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
 outerRadius={100}
 innerRadius={60}
 fill="#8884d8"
 dataKey="value"
 paddingAngle={2}
 >
 {data.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill={colors[entry.name.toLowerCase()]}
 />
 ))}
 </Pie>
 <Tooltip content={<CustomTooltip />} />
 <Legend content={renderLegend} />
 </PieChart>
 </ResponsiveContainer>

 {/* Summary Stats */}
 <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
 <div className="text-center">
 <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Costs</p>
 <p className="text-sm font-bold text-red-600 dark:text-red-400">
 {formatCurrency(costs, false)}
 </p>
 </div>
 <div className="text-center">
 <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profit</p>
 <p className="text-sm font-bold text-green-600 dark:text-green-400">
 {formatCurrency(liveProfit, false)}
 </p>
 </div>
 <div className="text-center">
 <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending</p>
 <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
 {formatCurrency(pending, false)}
 </p>
 </div>
 </div>
 </div>
 )
}
