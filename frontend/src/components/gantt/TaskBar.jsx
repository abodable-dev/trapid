import { getStatusColor, getCategoryColor } from './utils/dateCalculations'

/**
 * TaskBar - Individual task bar in timeline
 * Inspired by Monday.com's clean, minimal design
 */
export default function TaskBar({ task, left, width, pixelsPerDay, colorBy = 'status' }) {
  const backgroundColor = colorBy === 'status'
    ? getStatusColor(task.status)
    : getCategoryColor(task.category)

  const progressWidth = task.progress ? `${task.progress}%` : '0%'

  return (
    <div
      className="absolute top-2 rounded group cursor-pointer transition-all hover:shadow-lg"
      style={{
        left: `${left}px`,
        width: `${width}px`,
        height: '28px',
        backgroundColor,
        opacity: task.status === 'complete' ? 0.7 : 0.9,
      }}
      title={`${task.name} (${task.progress || 0}%)`}
    >
      {/* Progress indicator */}
      {task.progress > 0 && (
        <div
          className="h-full rounded-l transition-all"
          style={{
            width: progressWidth,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
        />
      )}

      {/* Task label (shows on hover or if bar is wide enough) */}
      {width > 100 && (
        <div className="absolute inset-0 flex items-center px-2">
          <span className="text-xs font-medium text-white truncate">
            {task.name}
          </span>
        </div>
      )}

      {/* Milestone indicator (diamond shape) */}
      {task.is_milestone && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
          style={{
            backgroundColor: '#000',
            border: '2px solid #fff',
          }}
        />
      )}

      {/* Critical path indicator */}
      {task.is_critical_path && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </div>
  )
}
