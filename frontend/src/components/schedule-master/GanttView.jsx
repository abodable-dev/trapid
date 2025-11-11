import { useState, useEffect, useRef } from 'react'
import { Gantt, ContextMenu } from '@svar-ui/react-gantt'
import '@svar-ui/react-gantt/style.css'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

/**
 * GanttView - Visualize schedule template tasks with dependencies using SVAR Gantt
 * Shows task names, durations, and predecessor relationships in an interactive timeline
 */

export default function GanttView({ isOpen, onClose, tasks, onUpdateTask }) {
  const [ganttData, setGanttData] = useState({ data: [], links: [] })
  const [publicHolidays, setPublicHolidays] = useState([])
  const [ganttApi, setGanttApi] = useState(null)

  // Fetch public holidays from API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const currentYear = new Date().getFullYear()
        const response = await api.get(`/api/v1/public_holidays/dates?region=QLD&year_start=${currentYear}&year_end=${currentYear + 2}`)
        setPublicHolidays(response.dates || [])
      } catch (error) {
        console.error('Failed to fetch public holidays:', error)
        // Fallback to empty array if fetch fails
        setPublicHolidays([])
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

  // CSS function for highlighting weekends and holidays in the timeline
  const dayStyle = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    if (isPublicHoliday(dateStr)) {
      return 'gantt-holiday'
    }
    if (isWeekend(date)) {
      return 'gantt-weekend'
    }
    return ''
  }

  useEffect(() => {
    if (isOpen && tasks) {
      // Convert tasks to Gantt format
      const ganttTasks = tasks.map((task, index) => {
        // Use task duration or default to 5 business days
        const duration = task.duration || 5
        const startDate = new Date()
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

      setGanttData({
        data: ganttTasks,
        links: ganttLinks
      })
    }
  }, [isOpen, tasks, publicHolidays])

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

  if (!isOpen) return null

  return (
    <>
      <style>
        {`
          /* Weekend highlighting - apply to entire column */
          .wx-gantt .gantt-weekend,
          .wx-gantt .wx-gantt-cell.gantt-weekend,
          .wx-gantt-scale-cell.gantt-weekend {
            background-color: #f8f9fa !important;
          }

          /* Holiday highlighting - apply to entire column */
          .wx-gantt .gantt-holiday,
          .wx-gantt .wx-gantt-cell.gantt-holiday,
          .wx-gantt-scale-cell.gantt-holiday {
            background-color: #fff5f5 !important;
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
        `}
      </style>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 2147483647 }}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gantt Chart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            {ganttData.data.length > 0 && (
              <ContextMenu api={ganttApi}>
                <Gantt
                  init={setGanttApi}
                  tasks={ganttData.data}
                  links={ganttData.links}
                  scales={[
                    { unit: 'month', step: 1, format: 'MMMM yyyy' },
                    { unit: 'day', step: 1, format: 'd', css: dayStyle }
                  ]}
                  columns={[
                    { id: 'taskNumber', header: '#', width: 60, align: 'center' },
                    { id: 'text', header: 'Task Name', width: 250 },
                    { id: 'duration', header: 'Duration', width: 80, align: 'center' }
                  ]}
                  cellHeight={44}
                  readonly={false}
                  onAdd={handleLinkAdd}
                  onUpdate={(task) => {
                    // Handle task updates if needed
                    console.log('Task updated:', task)
                  }}
                  onDelete={handleLinkDelete}
                />
              </ContextMenu>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
