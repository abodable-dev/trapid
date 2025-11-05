import { generateTimelineDates, formatDate, isToday, calculateTaskPosition } from './utils/dateCalculations'

/**
 * GanttHeader - Timeline header with dates
 * Enhanced with Tailwind UI calendar styling, sticky positioning, and dark mode
 */
export default function GanttHeader({ projectStartDate, projectEndDate, pixelsPerDay, zoomLevel = 'weeks' }) {
  const dates = generateTimelineDates(projectStartDate, projectEndDate, zoomLevel)

  return (
    <div className="grid grid-cols-[300px_1fr] border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
      {/* Left: Column Header */}
      <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Task Name</span>
      </div>

      {/* Right: Timeline Dates */}
      <div className="relative overflow-x-auto bg-gray-50 dark:bg-gray-800/50">
        <div className="flex h-full">
          {dates.map((date, index) => {
            const left = calculateTaskPosition(date, projectStartDate, pixelsPerDay)
            const columnWidth = zoomLevel === 'days' ? pixelsPerDay :
                               zoomLevel === 'weeks' ? pixelsPerDay * 7 :
                               pixelsPerDay * 30

            const today = isToday(date)

            return (
              <div
                key={index}
                className={`flex-shrink-0 px-2 py-3 border-r border-gray-100 dark:border-white/5 transition-colors ${
                  today
                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800/70'
                }`}
                style={{ width: `${columnWidth}px` }}
              >
                <div className={`text-xs font-semibold text-center ${
                  today
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {zoomLevel === 'days' ? formatDate(date, 'short') :
                   zoomLevel === 'weeks' ? `Week ${index + 1}` :
                   formatDate(date, 'month')}
                </div>
                {zoomLevel === 'weeks' && (
                  <div className={`text-xs text-center mt-0.5 ${
                    today
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {formatDate(date, 'short')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
