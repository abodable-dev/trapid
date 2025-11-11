import { useState, useEffect, useMemo, useCallback } from 'react'
import { Gantt, ContextMenu, Willow } from '@svar-ui/react-gantt'
import '@svar-ui/react-gantt/style.css'
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'
import TaskDependencyEditor from './TaskDependencyEditor'

/**
 * GanttView - Visualize schedule template tasks with dependencies using SVAR Gantt
 * Shows task names, durations, and predecessor relationships in an interactive timeline
 */

export default function GanttView({ isOpen, onClose, tasks, onUpdateTask }) {
  const [ganttData, setGanttData] = useState({ data: [], links: [] })
  const [publicHolidays, setPublicHolidays] = useState([])
  const [ganttApi, setGanttApi] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  // Fetch public holidays from API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoading(true)
        const currentYear = new Date().getFullYear()
        const response = await api.get(`/api/v1/public_holidays/dates?region=QLD&year_start=${currentYear}&year_end=${currentYear + 2}`)
        setPublicHolidays(response.dates || [])
      } catch (error) {
        console.error('Failed to fetch public holidays:', error)
        // Fallback to empty array if fetch fails
        setPublicHolidays([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHolidays()
  }, [])

  // Check if a date is a weekend
  const isWeekend = (date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  // Check if a date is a public holiday
  const isPublicHoliday = (dateStr) => {
    return publicHolidays.includes(dateStr)
  }

  // Check if a date is a working day
  const isWorkingDay = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return !isWeekend(date) && !isPublicHoliday(dateStr)
  }

  // Calculate end date from start date and business days duration
  const addBusinessDays = (startDate, days) => {
    let current = new Date(startDate)
    let remainingDays = days

    while (remainingDays > 0) {
      current.setDate(current.getDate() + 1)
      if (isWorkingDay(current)) {
        remainingDays--
      }
    }

    return current
  }

  // Handle task click to open editor
  const handleTaskClick = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setShowEditor(true)
    }
  }, [tasks])

  // Handle saving task dependencies
  const handleSaveDependencies = (taskId, predecessors) => {
    console.log('GanttView: Saving dependencies for task', taskId, ':', predecessors)
    onUpdateTask(taskId, { predecessor_ids: predecessors })
    setShowEditor(false)
    setSelectedTask(null)
  }

  // Memoize columns configuration to prevent re-renders
  const columns = useMemo(() => [
    { id: 'taskNumber', header: '#', width: 60, align: 'center' },
    { id: 'text', header: 'Task Name', width: 250 },
    {
      id: 'predecessors',
      header: 'Predecessors',
      width: 150,
      template: (value, row) => {
        return value || '-'
      }
    }
  ], [])

  // Function to determine if a date should be styled as a holiday
  const dayStyle = useCallback((date) => {
    const dateStr = date.toISOString().split('T')[0]

    // Check if weekend or holiday - return class for identification
    if (isWeekend(date) || publicHolidays.includes(dateStr)) {
      return 'weekend-day'
    }

    return ''
  }, [publicHolidays])

  // Memoize scales configuration to prevent re-renders
  const scales = useMemo(() => [
    { unit: 'month', step: 1, format: 'MMMM yyyy' },
    { unit: 'day', step: 1, format: 'd', css: dayStyle }
  ], [dayStyle])

  const cellWidth = 30

  // Convert tasks to Gantt format whenever tasks change
  useEffect(() => {
    console.log('GanttView: useEffect triggered. isOpen:', isOpen, 'tasks:', tasks?.length)
    if (isOpen && tasks) {
      // Calculate start dates based on dependencies
      const taskStartDates = new Map()
      const projectStartDate = new Date()

      // Function to calculate task start date based on predecessors
      const calculateStartDate = (task) => {
        if (taskStartDates.has(task.id)) {
          return taskStartDates.get(task.id)
        }

        // If no predecessors, start from project start date
        if (!task.predecessor_ids || task.predecessor_ids.length === 0) {
          taskStartDates.set(task.id, projectStartDate)
          return projectStartDate
        }

        // Find the latest end date of all predecessors
        let latestDate = projectStartDate
        task.predecessor_ids.forEach(pred => {
          const predData = typeof pred === 'object' ? pred : { id: pred, type: 'FS', lag: 0 }
          const predTask = tasks[predData.id - 1] // Task numbers are 1-indexed

          if (predTask) {
            // Recursively calculate predecessor's start date
            const predStart = calculateStartDate(predTask)
            const predDuration = predTask.duration || 5
            const predEnd = addBusinessDays(predStart, predDuration)

            // For FS (Finish-to-Start), task starts after predecessor finishes
            if (predData.type === 'FS' || !predData.type) {
              const taskStart = addBusinessDays(predEnd, predData.lag || 0)
              if (taskStart > latestDate) {
                latestDate = taskStart
              }
            }
          }
        })

        taskStartDates.set(task.id, latestDate)
        return latestDate
      }

      // Convert tasks to Gantt format
      const ganttTasks = tasks.map((task, index) => {
        // Use task duration or default to 5 business days
        const duration = task.duration || 5
        const startDate = calculateStartDate(task, index)
        const endDate = addBusinessDays(startDate, duration)

        // Format predecessors for display
        const formatPredecessor = (pred) => {
          if (typeof pred === 'object') {
            const type = pred.type || 'FS'
            const lag = pred.lag || 0
            let result = `${pred.id}${type}`
            if (lag !== 0) {
              result += lag > 0 ? `+${lag}` : lag
            }
            return result
          }
          return `${pred}FS`
        }

        const predecessorDisplay = task.predecessor_ids && task.predecessor_ids.length > 0
          ? task.predecessor_ids.map(formatPredecessor).join(', ')
          : ''

        return {
          id: task.id,
          text: task.name,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          duration: duration,
          progress: 0,
          type: 'task',
          // Store original task data
          taskNumber: index + 1,
          supplier: task.supplier_name || task.assigned_role || '',
          predecessors: predecessorDisplay,
          originalTask: task
        }
      })

      // Convert predecessors to Gantt links
      const ganttLinks = []
      tasks.forEach((task, index) => {
        if (task.predecessor_ids && task.predecessor_ids.length > 0) {
          task.predecessor_ids.forEach(pred => {
            const predData = typeof pred === 'object' ? pred : { id: pred, type: 'FS', lag: 0 }

            // Find the predecessor task
            const predTask = tasks[predData.id - 1] // Task numbers are 1-indexed
            if (predTask) {
              ganttLinks.push({
                id: `${predTask.id}-${task.id}`,
                source: predTask.id,
                target: task.id,
                type: getLinkType(predData.type || 'FS')
              })
            }
          })
        }
      })

      console.log('Gantt Tasks:', ganttTasks.slice(0, 2)) // Log first 2 tasks to see structure
      console.log('Gantt Links:', ganttLinks)

      // Calculate the overall date range to fit all tasks
      let minDate = projectStartDate
      let maxDate = projectStartDate

      ganttTasks.forEach(task => {
        const taskStart = new Date(task.start)
        const taskEnd = new Date(task.end)
        if (taskStart < minDate) minDate = taskStart
        if (taskEnd > maxDate) maxDate = taskEnd
      })

      // Add padding only at the end (2 weeks after)
      const paddedEnd = new Date(maxDate)
      paddedEnd.setDate(paddedEnd.getDate() + 14)

      // Generate holidays array (weekends and public holidays)
      const holidays = []
      const current = new Date(minDate)
      while (current <= paddedEnd) {
        const dateStr = current.toISOString().split('T')[0]

        // Check if weekend
        if (isWeekend(current)) {
          holidays.push(dateStr)
        }
        // Check if public holiday
        else if (publicHolidays.includes(dateStr)) {
          holidays.push(dateStr)
        }

        current.setDate(current.getDate() + 1)
      }

      setGanttData({
        data: ganttTasks,
        links: ganttLinks,
        start: minDate,
        end: paddedEnd,
        holidays: holidays
      })

      console.log('Gantt data updated with tasks:', ganttTasks.length)
      console.log('Date range:', minDate.toISOString().split('T')[0], 'to', paddedEnd.toISOString().split('T')[0])
      console.log('Holidays count:', holidays.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tasks, publicHolidays.length])

  // Convert dependency type to Gantt link type
  const getLinkType = (depType) => {
    switch (depType) {
      case 'FS': return 0 // Finish to Start
      case 'SS': return 1 // Start to Start
      case 'FF': return 2 // Finish to Finish
      case 'SF': return 3 // Start to Finish
      default: return 0
    }
  }

  // Convert Gantt link type to dependency type
  const getDepType = (linkType) => {
    switch (linkType) {
      case 0: return 'FS'
      case 1: return 'SS'
      case 2: return 'FF'
      case 3: return 'SF'
      default: return 'FS'
    }
  }

  const handleLinkAdd = (link) => {
    // When a new link is added in the Gantt chart
    const sourceTask = tasks.find(t => t.id === link.source)
    const targetTask = tasks.find(t => t.id === link.target)

    if (sourceTask && targetTask) {
      const sourceTaskNumber = tasks.findIndex(t => t.id === sourceTask.id) + 1
      const depType = getDepType(link.type)

      // Update the target task's predecessors
      const currentPreds = targetTask.predecessor_ids || []
      const newPred = {
        id: sourceTaskNumber,
        type: depType,
        lag: 0
      }

      // Check if this predecessor already exists
      const exists = currentPreds.some(p => {
        const predId = typeof p === 'object' ? p.id : p
        return predId === sourceTaskNumber
      })

      if (!exists) {
        const updatedPreds = [...currentPreds, newPred]
        onUpdateTask(targetTask.id, { predecessor_ids: updatedPreds })
      }
    }
  }

  const handleLinkDelete = (link) => {
    // When a link is deleted in the Gantt chart
    const sourceTask = tasks.find(t => t.id === link.source)
    const targetTask = tasks.find(t => t.id === link.target)

    if (sourceTask && targetTask) {
      const sourceTaskNumber = tasks.findIndex(t => t.id === sourceTask.id) + 1

      // Remove the predecessor from the target task
      const currentPreds = targetTask.predecessor_ids || []
      const updatedPreds = currentPreds.filter(p => {
        const predId = typeof p === 'object' ? p.id : p
        return predId !== sourceTaskNumber
      })

      onUpdateTask(targetTask.id, { predecessor_ids: updatedPreds })
    }
  }

  // Add click handler for edit buttons with better event delegation
  useEffect(() => {
    const handleEditClick = (e) => {
      const button = e.target.closest('.gantt-edit-btn')
      if (button) {
        console.log('Document click handler: Edit button clicked')
        e.preventDefault()
        e.stopPropagation()
        const taskId = parseInt(button.dataset.taskId)
        console.log('Document click handler: taskId:', taskId)
        handleTaskClick(taskId)
      }
    }

    // Add listener with capture phase to ensure we catch it
    document.addEventListener('click', handleEditClick, true)
    return () => document.removeEventListener('click', handleEditClick, true)
  }, [tasks, handleTaskClick])

  // Apply weekend styling using overlay divs - only in the chart area, not the header
  useEffect(() => {
    if (ganttApi && ganttData.data.length > 0 && ganttData.start) {
      setTimeout(() => {
        const ganttElement = document.querySelector('.wx-gantt')
        if (ganttElement) {
          // Remove any existing weekend overlays
          const existingOverlays = ganttElement.querySelectorAll('.weekend-overlay, .holiday-overlay')
          existingOverlays.forEach(overlay => overlay.remove())

          // Find the day scale row (the second scale row with day numbers)
          const scaleRows = ganttElement.querySelectorAll('[class*="wx-scale"]')
          const dayScaleRow = scaleRows[scaleRows.length - 1] // Last scale row is the day scale

          if (!dayScaleRow) return

          // Get all cells in the day scale row
          const allDayCells = Array.from(dayScaleRow.querySelectorAll('.wx-cell'))
          console.log('Total day cells:', allDayCells.length)

          // Find cells with weekend-day class
          const weekendCells = allDayCells.filter(c => c.classList.contains('weekend-day'))
          console.log('Found weekend/holiday scale cells:', weekendCells.length)

          // Get the header height to position overlay below it
          const scaleElement = ganttElement.querySelector('[class*="wx-scale"]')
          const headerHeight = scaleElement ? scaleElement.parentElement.getBoundingClientRect().height : 0

          // Build a map of dates by calculating from the start date
          const startDate = new Date(ganttData.start)

          // For each weekend/holiday header cell, create an overlay div in the chart area
          weekendCells.forEach((cell) => {
            const rect = cell.getBoundingClientRect()
            const ganttRect = ganttElement.getBoundingClientRect()

            // Find the index of this cell in ALL day cells
            const cellIndex = allDayCells.indexOf(cell)

            if (cellIndex >= 0) {
              // Calculate the date for this cell
              const cellDate = new Date(startDate)
              cellDate.setDate(cellDate.getDate() + cellIndex)
              const cellDateStr = cellDate.toISOString().split('T')[0]

              // Check if this is a public holiday (not just a weekend)
              const isPublicHoliday = publicHolidays.includes(cellDateStr) && !isWeekend(cellDate)

              // Create overlay div
              const overlay = document.createElement('div')
              overlay.className = isPublicHoliday ? 'holiday-overlay' : 'weekend-overlay'
              overlay.style.position = 'absolute'
              overlay.style.left = `${rect.left - ganttRect.left}px`
              overlay.style.top = `${headerHeight}px`
              overlay.style.width = `${rect.width}px`
              overlay.style.height = `calc(100% - ${headerHeight}px)`
              overlay.style.backgroundColor = isPublicHoliday ? '#d1d5db' : '#f3f4f6' // Darker grey for holidays
              overlay.style.opacity = '0.5'
              overlay.style.pointerEvents = 'none'
              overlay.style.zIndex = '1'

              ganttElement.appendChild(overlay)
              console.log(`Created ${isPublicHoliday ? 'holiday' : 'weekend'} overlay for ${cellDateStr} (index ${cellIndex}) at left: ${rect.left - ganttRect.left}px`)
            }
          })
        }
      }, 1500)
    }
  }, [ganttApi, ganttData.data.length, ganttData.start, publicHolidays, isWeekend])

  if (!isOpen) return null

  return (
    <>
      <style>
        {`
          /* Weekend overlay styling - grey columns in chart area only, not header */

          /* Make weekend columns narrower */
          .wx-cell.weekend-day {
            width: 20px !important;
            min-width: 20px !important;
            max-width: 20px !important;
          }

          /* Hide text in weekend cells */
          .wx-cell.weekend-day {
            font-size: 0 !important;
            color: transparent !important;
            background-color: transparent !important;
            background: none !important;
          }

          .wx-cell.weekend-day * {
            font-size: 0 !important;
            color: transparent !important;
            visibility: hidden !important;
          }

          /* Remove any background from weekend header cells - make them match the header */
          .wx-scale .wx-cell.weekend-day,
          [class*="wx-scale"] .wx-cell.weekend-day {
            background-color: #2c3e50 !important;
            background: #2c3e50 !important;
          }

          /* Match SVAR website styling */
          .wx-gantt {
            --wx-gantt-header-background: #2c3e50;
            --wx-gantt-header-color: #ffffff;
            --wx-gantt-border-color: #dee2e6;
            --wx-gantt-row-background: #ffffff;
            --wx-gantt-row-alt-background: #f8f9fa;
            --wx-gantt-task-background: #3498db;
            --wx-gantt-task-progress-background: #2980b9;
            --wx-gantt-link-color: #95a5a6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }

          /* Header styling to match SVAR website */
          .wx-gantt .wx-gantt-scale-cell {
            font-weight: 500;
            border-right: 1px solid #dee2e6;
          }

          /* Grid styling */
          .wx-gantt .wx-gantt-grid-head-cell {
            background-color: #2c3e50 !important;
            color: #ffffff !important;
            font-weight: 500;
            padding: 12px 8px;
          }

          /* Gantt container - enable horizontal scrolling */
          .wx-gantt {
            width: 100%;
            height: 100%;
          }

          .wx-gantt-chart {
            overflow-x: auto;
          }

          /* Enhanced Context Menu Styling */
          .wx-menu {
            background: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            padding: 0.5rem !important;
            min-width: 180px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }

          .wx-menu-item {
            padding: 0.5rem 0.75rem !important;
            margin: 0.125rem 0 !important;
            border-radius: 0.375rem !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
            color: #374151 !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.5rem !important;
          }

          .wx-menu-item:hover {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
          }

          .wx-menu-item:active {
            background-color: #e5e7eb !important;
          }

          .wx-menu-item[disabled] {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
          }

          .wx-menu-item[disabled]:hover {
            background-color: transparent !important;
            color: #374151 !important;
          }

          /* Menu item icons */
          .wx-menu-item svg,
          .wx-menu-item .wx-icon {
            width: 1rem !important;
            height: 1rem !important;
            opacity: 0.7 !important;
          }

          .wx-menu-item:hover svg,
          .wx-menu-item:hover .wx-icon {
            opacity: 1 !important;
          }

          /* Menu item with keyboard shortcut */
          .wx-menu-item-hotkey {
            margin-left: auto !important;
            font-size: 0.75rem !important;
            color: #9ca3af !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          }

          /* Submenu arrow */
          .wx-menu-item-arrow {
            margin-left: auto !important;
            opacity: 0.5 !important;
          }

          /* Menu separator */
          .wx-menu-separator {
            height: 1px !important;
            background-color: #e5e7eb !important;
            margin: 0.375rem 0 !important;
            border: none !important;
          }

          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .wx-menu {
              background: #1f2937 !important;
              border-color: #374151 !important;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2) !important;
            }

            .wx-menu-item {
              color: #e5e7eb !important;
            }

            .wx-menu-item:hover {
              background-color: #374151 !important;
              color: #f9fafb !important;
            }

            .wx-menu-item:active {
              background-color: #4b5563 !important;
            }

            .wx-menu-item[disabled] {
              color: #6b7280 !important;
            }

            .wx-menu-item-hotkey {
              color: #6b7280 !important;
            }

            .wx-menu-separator {
              background-color: #374151 !important;
            }
          }

          /* Edit button styling */
          .gantt-edit-btn {
            background: transparent;
            border: none;
            padding: 4px 8px;
            cursor: pointer;
            color: #6b7280;
            border-radius: 4px;
            transition: all 0.15s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .gantt-edit-btn:hover {
            background-color: #f3f4f6;
            color: #4f46e5;
          }

          .gantt-edit-btn:active {
            background-color: #e5e7eb;
          }

          @media (prefers-color-scheme: dark) {
            .gantt-edit-btn {
              color: #9ca3af;
            }

            .gantt-edit-btn:hover {
              background-color: #374151;
              color: #818cf8;
            }

            .gantt-edit-btn:active {
              background-color: #4b5563;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col" style={{ zIndex: 2147483647 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gantt Chart <span className="text-sm text-gray-500">(Cell Width: {cellWidth}px)</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Drag and drop on task bars to create dependency links
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 overflow-auto">
          <div className="h-full w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading Gantt chart...</p>
                </div>
              </div>
            ) : ganttData.data.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">No tasks available</p>
                </div>
              </div>
            ) : (
              <Willow>
                <ContextMenu api={ganttApi}>
                  <Gantt
                    init={setGanttApi}
                    tasks={ganttData.data}
                    links={ganttData.links}
                    scales={scales}
                    columns={columns}
                    cellHeight={44}
                    cellWidth={cellWidth}
                    start={ganttData.start}
                    end={ganttData.end}
                    holidays={ganttData.holidays}
                    readonly={false}
                    onAdd={handleLinkAdd}
                    onUpdate={(task) => {
                      // Handle task updates if needed
                      console.log('Task updated:', task)
                    }}
                    onDelete={handleLinkDelete}
                    onCellClick={(ev) => {
                      console.log('onCellClick triggered:', ev)
                      // Open editor when Actions column is clicked
                      if (ev.columnId === 'actions') {
                        console.log('Actions column clicked, taskId:', ev.id)
                        handleTaskClick(ev.id)
                      }
                    }}
                  />
                </ContextMenu>
              </Willow>
            )}
          </div>
        </div>
      </div>

    {/* Task Dependency Editor */}
    {showEditor && selectedTask && (
      <TaskDependencyEditor
        task={selectedTask}
        tasks={tasks}
        onSave={handleSaveDependencies}
        onClose={() => {
          setShowEditor(false)
          setSelectedTask(null)
        }}
      />
    )}
    </>
  )
}
