import { getStatusColor, getCategoryColor, getTypeColor } from './utils/colorSchemes'

/**
 * TaskBar - Individual task bar in timeline
 * Enhanced with Tailwind UI calendar event styling
 */
export default function TaskBar({ task, left, width, pixelsPerDay, colorBy = 'status', colorConfig }) {
 const colorObj = colorBy === 'status'
 ? getStatusColor(task.status, colorConfig)
 : colorBy === 'category'
 ? getCategoryColor(task.category, colorConfig)
 : getTypeColor(task.task_type, colorConfig)

 const backgroundColor = colorObj.bar
 const progressWidth = task.progress ? `${task.progress}%` : '0%'

 // Get lighter background color for calendar-style events
 const getLightBg = (hexColor) => {
 // Convert hex to RGB and create a lighter version
 const r = parseInt(hexColor.slice(1, 3), 16)
 const g = parseInt(hexColor.slice(3, 5), 16)
 const b = parseInt(hexColor.slice(5, 7), 16)
 return `rgba(${r}, ${g}, ${b}, 0.15)`
 }

 const getDarkBg = (hexColor) => {
 const r = parseInt(hexColor.slice(1, 3), 16)
 const g = parseInt(hexColor.slice(3, 5), 16)
 const b = parseInt(hexColor.slice(5, 7), 16)
 return `rgba(${r}, ${g}, ${b}, 0.3)`
 }

 return (
 <div
 className="absolute top-2 group cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-indigo-500 dark:hover:ring-indigo-400 hover:shadow-md"
 style={{
 left: `${left}px`,
 width: `${width}px`,
 height: '32px',
 backgroundColor: getLightBg(backgroundColor),
 borderLeft: `4px solid ${backgroundColor}`,
 }}
 title={`${task.name} (${task.progress || 0}%)`}
 >
 {/* Progress indicator - Tailwind calendar style */}
 {task.progress > 0 && (
 <div
 className="absolute inset-0 transition-all"
 style={{
 width: progressWidth,
 backgroundColor: getDarkBg(backgroundColor),
 }}
 />
 )}

 {/* Task label - Always visible with better typography */}
 <div className="absolute inset-0 flex items-center px-2 py-1">
 <div className="flex items-center gap-2 min-w-0 flex-1">
 {/* Milestone indicator */}
 {task.is_milestone && (
 <div
 className="flex-shrink-0 w-2 h-2 rotate-45 border-2"
 style={{
 backgroundColor: backgroundColor,
 borderColor: backgroundColor,
 }}
 />
 )}

 {/* Task name */}
 <span
 className="text-xs font-medium truncate"
 style={{ color: backgroundColor }}
 >
 {task.name}
 </span>

 {/* Progress percentage */}
 {task.progress > 0 && width > 150 && (
 <span
 className="text-xs font-semibold ml-auto flex-shrink-0"
 style={{ color: backgroundColor }}
 >
 {task.progress}%
 </span>
 )}
 </div>
 </div>

 {/* Critical path indicator - Red dot badge */}
 {task.is_critical_path && (
 <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5">
 <div className="w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
 </div>
 )}

 {/* Hover tooltip enhancement */}
 <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-30 pointer-events-none">
 <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs shadow-lg py-2 px-3 whitespace-nowrap">
 <div className="font-semibold">{task.name}</div>
 {task.start_date && task.end_date && (
 <div className="text-gray-300 dark:text-gray-400 mt-0.5">
 {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
 </div>
 )}
 {task.progress > 0 && (
 <div className="text-gray-300 dark:text-gray-400 mt-0.5">
 Progress: {task.progress}%
 </div>
 )}
 </div>
 </div>
 </div>
 )
}
