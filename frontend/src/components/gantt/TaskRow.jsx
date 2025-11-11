import { useState } from 'react'
import TaskBar from './TaskBar'
import { calculateTaskPosition, calculateTaskWidth, formatDate } from './utils/dateCalculations'

/**
 * TaskRow - Single row in Gantt chart (task info + timeline bar)
 * Enhanced with Tailwind UI styling and dark mode support
 */
export default function TaskRow({ task, projectStartDate, projectEndDate, pixelsPerDay, colorBy, colorConfig }) {
 const [isHovered, setIsHovered] = useState(false)

 const left = calculateTaskPosition(task.start_date, projectStartDate, pixelsPerDay)
 const width = calculateTaskWidth(task.start_date, task.end_date, pixelsPerDay)

 return (
 <div
 className={`grid grid-cols-[300px_1fr] border-b border-gray-100 dark:border-white/5 transition-colors ${
 isHovered
 ? 'bg-indigo-50 dark:bg-indigo-900/10'
 : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50'
 }`}
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 style={{ minHeight: '48px' }}
 >
 {/* Left: Task Info */}
 <div className="px-4 py-2 flex items-center border-r border-gray-100 dark:border-white/5">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
 {task.name}
 </span>
 {task.is_milestone && (
 <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10 dark:ring-purple-400/20">
 Milestone
 </span>
 )}
 {task.is_critical_path && (
 <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-700/10 dark:ring-red-400/20">
 Critical
 </span>
 )}
 </div>
 <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
 {formatDate(task.start_date)} - {formatDate(task.end_date)}
 </div>
 </div>
 </div>

 {/* Right: Timeline */}
 <div className="relative bg-white dark:bg-gray-900">
 <TaskBar
 task={task}
 left={left}
 width={width}
 pixelsPerDay={pixelsPerDay}
 colorBy={colorBy}
 colorConfig={colorConfig}
 />
 </div>
 </div>
 )
}
