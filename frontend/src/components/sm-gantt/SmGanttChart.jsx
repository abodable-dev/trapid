import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon } from '@heroicons/react/24/outline'

// Helper to format date
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
}

// Helper to get days between dates
const daysBetween = (start, end) => {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
}

// Helper to get date range for timeline
const getDateRange = (tasks) => {
  if (!tasks || tasks.length === 0) {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 7)
    const end = new Date(today)
    end.setDate(end.getDate() + 30)
    return { start, end }
  }

  let minDate = new Date(tasks[0].start_date)
  let maxDate = new Date(tasks[0].end_date)

  tasks.forEach(task => {
    const taskStart = new Date(task.start_date)
    const taskEnd = new Date(task.end_date)
    if (taskStart < minDate) minDate = taskStart
    if (taskEnd > maxDate) maxDate = taskEnd
  })

  // Add padding
  minDate.setDate(minDate.getDate() - 3)
  maxDate.setDate(maxDate.getDate() + 7)

  return { start: minDate, end: maxDate }
}

// Generate array of dates for timeline header
const generateDateColumns = (start, end) => {
  const dates = []
  const current = new Date(start)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// Task bar component
const TaskBar = ({ task, startOffset, width, dayWidth, onClick }) => {
  const getBarColor = () => {
    if (task.is_hold_task) return 'bg-red-500'
    if (task.status === 'completed') return 'bg-green-500'
    if (task.status === 'started') return 'bg-blue-500'
    if (task.locked) {
      if (task.lock_type === 'supplier_confirm') return 'bg-purple-500'
      if (task.lock_type === 'confirm') return 'bg-indigo-500'
    }
    return 'bg-gray-400'
  }

  const getProgressWidth = () => {
    if (task.status === 'completed') return '100%'
    return `${task.progress_percentage || 0}%`
  }

  return (
    <div
      className="absolute h-6 rounded cursor-pointer group transition-all hover:brightness-110"
      style={{
        left: `${startOffset * dayWidth}px`,
        width: `${Math.max(width * dayWidth, dayWidth)}px`,
        top: '4px',
      }}
      onClick={() => onClick?.(task)}
      title={`${task.name}\n${task.start_date} - ${task.end_date}\nStatus: ${task.status}`}
    >
      {/* Background bar */}
      <div className={`absolute inset-0 rounded ${getBarColor()} opacity-30`} />

      {/* Progress fill */}
      <div
        className={`absolute inset-y-0 left-0 rounded-l ${getBarColor()}`}
        style={{ width: getProgressWidth() }}
      />

      {/* Task label */}
      <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
        {task.is_hold_task && <PauseIcon className="h-3 w-3 text-white mr-1 flex-shrink-0" />}
        <span className="text-xs text-white font-medium truncate drop-shadow-sm">
          {task.task_number}. {task.name}
        </span>
      </div>

      {/* Lock indicator */}
      {task.locked && (
        <div className="absolute -right-1 -top-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
      )}
    </div>
  )
}

// Dependency line component
const DependencyLine = ({ fromTask, toTask, tasks, dateRange, dayWidth, rowHeight }) => {
  // Find task positions
  const fromIndex = tasks.findIndex(t => t.id === fromTask.id)
  const toIndex = tasks.findIndex(t => t.id === toTask.id)

  if (fromIndex === -1 || toIndex === -1) return null

  const fromEndOffset = daysBetween(dateRange.start, new Date(fromTask.end_date))
  const toStartOffset = daysBetween(dateRange.start, new Date(toTask.start_date)) - 1

  const fromX = fromEndOffset * dayWidth
  const toX = toStartOffset * dayWidth
  const fromY = fromIndex * rowHeight + rowHeight / 2
  const toY = toIndex * rowHeight + rowHeight / 2

  // Simple right-angle path
  const midX = (fromX + toX) / 2

  return (
    <path
      d={`M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`}
      fill="none"
      stroke="#6B7280"
      strokeWidth="1.5"
      markerEnd="url(#arrowhead)"
      className="pointer-events-none"
    />
  )
}

export default function SmGanttChart({ tasks = [], dependencies = [], onTaskClick, onTaskUpdate }) {
  const containerRef = useRef(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dayWidth, setDayWidth] = useState(40)
  const rowHeight = 34

  const dateRange = useMemo(() => getDateRange(tasks), [tasks])
  const dateColumns = useMemo(() => generateDateColumns(dateRange.start, dateRange.end), [dateRange])

  // Scroll to today on mount
  useEffect(() => {
    if (containerRef.current) {
      const today = new Date()
      const daysFromStart = daysBetween(dateRange.start, today)
      const scrollTo = Math.max(0, (daysFromStart - 5) * dayWidth)
      containerRef.current.scrollLeft = scrollTo
    }
  }, [dateRange, dayWidth])

  const handleZoomIn = () => setDayWidth(prev => Math.min(prev + 10, 100))
  const handleZoomOut = () => setDayWidth(prev => Math.max(prev - 10, 20))

  const totalWidth = dateColumns.length * dayWidth
  const totalHeight = tasks.length * rowHeight

  // Group dates by month for header
  const monthGroups = useMemo(() => {
    const groups = []
    let currentMonth = null
    let currentGroup = null

    dateColumns.forEach((date, index) => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      if (monthKey !== currentMonth) {
        if (currentGroup) groups.push(currentGroup)
        currentMonth = monthKey
        currentGroup = {
          label: date.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
          startIndex: index,
          count: 1
        }
      } else {
        currentGroup.count++
      }
    })
    if (currentGroup) groups.push(currentGroup)
    return groups
  }, [dateColumns])

  if (!tasks || tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No tasks to display</p>
          <p className="text-sm mt-2">Create tasks to see them on the Gantt chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.length} tasks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom out"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[40px] text-center">{dayWidth}px</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom in"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task names column (fixed) */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header spacer */}
          <div className="h-[52px] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center px-3">
            <span className="text-xs font-medium text-gray-500 uppercase">Task Name</span>
          </div>
          {/* Task names */}
          <div className="overflow-y-auto" style={{ height: `calc(100% - 52px)` }}>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`flex items-center px-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  task.is_hold_task ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}
                style={{ height: `${rowHeight}px` }}
                onClick={() => onTaskClick?.(task)}
              >
                <span className="text-xs text-gray-400 w-6">{task.task_number}</span>
                <span className={`text-sm truncate ${task.is_hold_task ? 'text-red-600 font-medium' : 'text-gray-900 dark:text-gray-100'}`}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline area (scrollable) */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto"
          onScroll={(e) => setScrollLeft(e.target.scrollLeft)}
        >
          {/* Timeline header */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {/* Month row */}
            <div className="flex h-6 border-b border-gray-200 dark:border-gray-700" style={{ width: `${totalWidth}px` }}>
              {monthGroups.map((group, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700"
                  style={{ width: `${group.count * dayWidth}px` }}
                >
                  {group.label}
                </div>
              ))}
            </div>
            {/* Day row */}
            <div className="flex h-6" style={{ width: `${totalWidth}px` }}>
              {dateColumns.map((date, i) => {
                const isToday = date.toDateString() === new Date().toDateString()
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-xs border-r border-gray-200 dark:border-gray-700 ${
                      isToday ? 'bg-blue-100 dark:bg-blue-900/30 font-bold text-blue-600' :
                      isWeekend ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' :
                      'text-gray-500'
                    }`}
                    style={{ width: `${dayWidth}px` }}
                  >
                    {date.getDate()}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task bars area */}
          <div className="relative" style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}>
            {/* Grid lines */}
            {dateColumns.map((date, i) => {
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              const isToday = date.toDateString() === new Date().toDateString()
              return (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 border-r ${
                    isToday ? 'border-blue-400 border-dashed' :
                    isWeekend ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' :
                    'border-gray-100 dark:border-gray-800'
                  }`}
                  style={{ left: `${i * dayWidth}px`, width: `${dayWidth}px` }}
                />
              )
            })}

            {/* Row backgrounds */}
            {tasks.map((task, i) => (
              <div
                key={task.id}
                className={`absolute left-0 right-0 border-b border-gray-100 dark:border-gray-800 ${
                  task.is_hold_task ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                }`}
                style={{ top: `${i * rowHeight}px`, height: `${rowHeight}px` }}
              />
            ))}

            {/* Dependency lines SVG */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#6B7280" />
                </marker>
              </defs>
              {dependencies.map((dep, i) => {
                const fromTask = tasks.find(t => t.id === dep.source)
                const toTask = tasks.find(t => t.id === dep.target)
                if (!fromTask || !toTask) return null
                return (
                  <DependencyLine
                    key={i}
                    fromTask={fromTask}
                    toTask={toTask}
                    tasks={tasks}
                    dateRange={dateRange}
                    dayWidth={dayWidth}
                    rowHeight={rowHeight}
                  />
                )
              })}
            </svg>

            {/* Task bars */}
            {tasks.map((task, index) => {
              const taskStart = new Date(task.start_date)
              const taskEnd = new Date(task.end_date)
              const startOffset = daysBetween(dateRange.start, taskStart) - 1
              const duration = daysBetween(taskStart, taskEnd)

              return (
                <div
                  key={task.id}
                  className="absolute left-0 right-0"
                  style={{ top: `${index * rowHeight}px`, height: `${rowHeight}px` }}
                >
                  <TaskBar
                    task={task}
                    startOffset={startOffset}
                    width={duration}
                    dayWidth={dayWidth}
                    onClick={onTaskClick}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
