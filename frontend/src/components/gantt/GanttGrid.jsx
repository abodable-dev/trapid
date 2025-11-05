import { generateTimelineDates, calculateTaskPosition, isToday } from './utils/dateCalculations'

/**
 * GanttGrid - Background grid lines for timeline
 * Enhanced with Tailwind UI calendar styling and dark mode
 */
export default function GanttGrid({ projectStartDate, projectEndDate, pixelsPerDay, zoomLevel = 'weeks', taskCount }) {
  const dates = generateTimelineDates(projectStartDate, projectEndDate, zoomLevel)
  const gridHeight = taskCount * 48 // 48px per row

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Vertical grid lines - Subtle borders inspired by Tailwind UI */}
      {dates.map((date, index) => {
        const left = calculateTaskPosition(date, projectStartDate, pixelsPerDay)
        const today = isToday(date)

        return (
          <div
            key={index}
            className={`absolute top-0 ${
              today
                ? 'bg-indigo-500 dark:bg-indigo-400 w-0.5 z-20 shadow-sm'
                : 'bg-gray-100 dark:bg-white/5 w-px'
            }`}
            style={{
              left: `${left}px`,
              height: `${gridHeight}px`,
            }}
          >
            {today && (
              <div className="absolute top-2 -left-10 bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg">
                Today
              </div>
            )}
          </div>
        )
      })}

      {/* Weekend shading - Softer with dark mode support */}
      {zoomLevel === 'days' && dates.map((date, index) => {
        const day = new Date(date).getDay()
        const isWeekend = day === 0 || day === 6

        if (!isWeekend) return null

        const left = calculateTaskPosition(date, projectStartDate, pixelsPerDay)

        return (
          <div
            key={`weekend-${index}`}
            className="absolute top-0 bg-gray-50 dark:bg-gray-800/30 opacity-60"
            style={{
              left: `${left}px`,
              width: `${pixelsPerDay}px`,
              height: `${gridHeight}px`,
            }}
          />
        )
      })}
    </div>
  )
}
