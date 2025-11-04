import { generateTimelineDates, formatDate, isToday, calculateTaskPosition } from './utils/dateCalculations'

/**
 * GanttHeader - Timeline header with dates
 * Shows weeks/months based on zoom level
 */
export default function GanttHeader({ projectStartDate, projectEndDate, pixelsPerDay, zoomLevel = 'weeks' }) {
  const dates = generateTimelineDates(projectStartDate, projectEndDate, zoomLevel)

  return (
    <div className="grid grid-cols-[300px_1fr] border-b-2 border-gray-300 bg-gray-50 sticky top-0 z-10">
      {/* Left: Column Header */}
      <div className="px-4 py-3 border-r border-gray-300">
        <span className="text-sm font-semibold text-gray-700">Task Name</span>
      </div>

      {/* Right: Timeline Dates */}
      <div className="relative overflow-x-auto">
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
                className={`flex-shrink-0 px-2 py-3 border-r border-gray-200 ${
                  today ? 'bg-blue-100' : ''
                }`}
                style={{ width: `${columnWidth}px` }}
              >
                <div className="text-xs font-medium text-gray-700 text-center">
                  {zoomLevel === 'days' ? formatDate(date, 'short') :
                   zoomLevel === 'weeks' ? `Week ${index + 1}` :
                   formatDate(date, 'month')}
                </div>
                {zoomLevel === 'weeks' && (
                  <div className="text-xs text-gray-500 text-center mt-0.5">
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
