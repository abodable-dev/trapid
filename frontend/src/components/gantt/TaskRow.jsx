import { useState } from 'react'
import TaskBar from './TaskBar'
import { calculateTaskPosition, calculateTaskWidth, formatDate } from './utils/dateCalculations'

/**
 * TaskRow - Single row in Gantt chart (task info + timeline bar)
 * Implements Monday.com's hover highlight pattern
 */
export default function TaskRow({ task, projectStartDate, projectEndDate, pixelsPerDay, colorBy }) {
  const [isHovered, setIsHovered] = useState(false)

  const left = calculateTaskPosition(task.start_date, projectStartDate, pixelsPerDay)
  const width = calculateTaskWidth(task.start_date, task.end_date, pixelsPerDay)

  return (
    <div
      className={`grid grid-cols-[300px_1fr] border-b border-gray-200 transition-colors ${
        isHovered ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: '48px' }}
    >
      {/* Left: Task Info */}
      <div className="px-4 py-2 flex items-center border-r border-gray-200">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">
              {task.name}
            </span>
            {task.is_milestone && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                Milestone
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {formatDate(task.start_date)} - {formatDate(task.end_date)}
          </div>
        </div>
      </div>

      {/* Right: Timeline */}
      <div className="relative">
        <TaskBar
          task={task}
          left={left}
          width={width}
          pixelsPerDay={pixelsPerDay}
          colorBy={colorBy}
        />
      </div>
    </div>
  )
}
