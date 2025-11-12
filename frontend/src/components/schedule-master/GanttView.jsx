import { useState, useEffect, useMemo, useCallback } from 'react'
import { Gantt, ContextMenu, Willow } from '@svar-ui/react-gantt'
import '@svar-ui/react-gantt/style.css'
import { XMarkIcon, PencilSquareIcon, EyeIcon, EyeSlashIcon, Bars3Icon, CheckIcon } from '@heroicons/react/24/outline'
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
  const [showLeftPanel, setShowLeftPanel] = useState(() => {
    const saved = localStorage.getItem('gantt-show-left-panel')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('gantt-visible-columns')
    return saved ? JSON.parse(saved) : {
      taskName: true,
      predecessors: true,
      supplierGroup: true,
      duration: false,
      startDay: true
    }
  })
  const [showColumnMenu, setShowColumnMenu] = useState(false)

  // Save panel visibility to localStorage
  useEffect(() => {
    localStorage.setItem('gantt-show-left-panel', JSON.stringify(showLeftPanel))
  }, [showLeftPanel])

  // Save column visibility to localStorage
  useEffect(() => {
    localStorage.setItem('gantt-visible-columns', JSON.stringify(visibleColumns))
  }, [visibleColumns])

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
  // The start date counts as day 1, so for a 2-day task starting Wednesday,
  // it ends on Thursday (Wed=day 1, Thu=day 2)
  const addBusinessDays = (startDate, days) => {
    if (days <= 0) return new Date(startDate)

    let current = new Date(startDate)
    let remainingDays = days - 1 // Subtract 1 because start day counts as day 1

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
  const columns = useMemo(() => {
    const allColumns = [
      { id: 'taskNumber', header: '#', width: 60, align: 'center', key: 'taskNumber', alwaysVisible: true },
      { id: 'text', header: 'Task Name', width: 350, key: 'taskName' },
      {
        id: 'predecessors',
        header: 'Predecessors',
        width: 150,
        key: 'predecessors',
        template: (value, row) => {
          return value || '-'
        }
      },
      {
        id: 'supplier',
        header: 'Supplier/Group',
        width: 180,
        key: 'supplierGroup',
        template: (value, row) => {
          return value || '-'
        }
      },
      {
        id: 'duration',
        header: 'Duration',
        width: 100,
        key: 'duration',
        align: 'center',
        template: (value, row) => {
          // Show the task's duration directly from the data
          const duration = row.duration !== undefined && row.duration !== null ? row.duration : value
          if (duration === 0) return '0 days'
          return duration ? `${duration} ${duration === 1 ? 'day' : 'days'}` : '-'
        }
      },
      {
        id: 'start_day',
        header: 'Start Day',
        width: 100,
        key: 'startDay',
        align: 'center',
        template: (value, row) => {
          return value !== undefined && value !== null ? `Day ${value}` : '-'
        }
      }
    ]

    // Filter columns based on visibility settings
    return allColumns.filter(col => col.alwaysVisible || visibleColumns[col.key])
  }, [visibleColumns])

  // Function to determine if a date should be styled as a holiday
  const dayStyle = useCallback((date) => {
    // Don't return any special class - we'll handle styling via overlays only
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
    if (isOpen && tasks) {
      // First, calculate start dates for all tasks
      const taskStartDays = new Map()

      // Function to calculate start day (as integer) based on predecessors
      const calculateStartDay = (task, allTasks) => {
        if (taskStartDays.has(task.id)) {
          return taskStartDays.get(task.id)
        }

        // If no predecessors, start at day 0
        if (!task.predecessor_ids || task.predecessor_ids.length === 0) {
          taskStartDays.set(task.id, 0)
          return 0
        }

        // Find the latest end day of all predecessors
        let latestEnd = 0
        task.predecessor_ids.forEach(pred => {
          const predData = typeof pred === 'object' ? pred : { id: pred, type: 'FS', lag: 0 }
          const predTask = allTasks[predData.id - 1] // Task numbers are 1-indexed

          if (predTask) {
            const predStart = calculateStartDay(predTask, allTasks)
            const predDuration = predTask.duration || 0
            const predEnd = predStart + predDuration

            // For FS (Finish-to-Start), task starts after predecessor finishes
            if (predData.type === 'FS' || !predData.type) {
              const taskStart = predEnd + (predData.lag || 0)
              if (taskStart > latestEnd) {
                latestEnd = taskStart
              }
            }
          }
        })

        taskStartDays.set(task.id, latestEnd)
        return latestEnd
      }

      // Calculate start days for all tasks
      tasks.forEach(task => calculateStartDay(task, tasks))

      // Sort tasks by calculated start day
      const sortedTasks = [...tasks].sort((a, b) => {
        const aStart = taskStartDays.get(a.id) || 0
        const bStart = taskStartDays.get(b.id) || 0
        return aStart - bStart
      })

      // Now convert to Gantt format with actual dates
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
            const predDuration = predTask.duration !== undefined && predTask.duration !== null ? predTask.duration : 1
            const predEnd = addBusinessDays(predStart, predDuration > 0 ? predDuration : 1)

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

      // Convert sorted tasks to Gantt format
      const ganttTasks = sortedTasks.map((task, index) => {
        // Use task duration - handle 0 as valid, default to 1 if undefined/null
        const duration = task.duration !== undefined && task.duration !== null ? task.duration : 1
        const startDate = calculateStartDate(task, index)
        const endDate = addBusinessDays(startDate, duration > 0 ? duration : 1)

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
          start_day: task.start_date || 0,
          originalTask: task
        }
      })

      // Convert predecessors to Gantt links (use original tasks array for ID references)
      const ganttLinks = []
      sortedTasks.forEach((task, index) => {
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

      // Calculate the overall date range to fit all tasks
      let minDate = projectStartDate
      let maxDate = projectStartDate

      ganttTasks.forEach(task => {
        const taskStart = new Date(task.start)
        const taskEnd = new Date(task.end)
        if (taskStart < minDate) minDate = taskStart
        if (taskEnd > maxDate) maxDate = taskEnd
      })

      // Ensure today is visible on the chart
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (today < minDate) {
        minDate = today
      }

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
          // Remove any existing overlays
          const existingOverlays = ganttElement.querySelectorAll('.weekend-overlay, .holiday-overlay, .today-overlay')
          existingOverlays.forEach(overlay => overlay.remove())

          // Find the chart area (where the task bars are displayed)
          const chartArea = ganttElement.querySelector('[class*="chart"]')
          if (!chartArea) return

          // Find the day scale row (the second scale row with day numbers)
          const scaleRows = ganttElement.querySelectorAll('[class*="wx-scale"]')
          const dayScaleRow = scaleRows[scaleRows.length - 1] // Last scale row is the day scale

          if (!dayScaleRow) return

          // Get all cells in the day scale row
          const allDayCells = Array.from(dayScaleRow.querySelectorAll('.wx-cell'))

          // Build a map of dates by calculating from the start date
          const startDate = new Date(ganttData.start)

          // Get today's date for comparison (using local timezone)
          const today = new Date()
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

          // Get the bounding rect of the chart area for alignment
          const chartRect = chartArea.getBoundingClientRect()

          // Track the current date as we iterate through cells
          let currentDate = new Date(startDate)

          // Iterate through ALL cells and create overlays for today, weekends, and holidays
          allDayCells.forEach((cell) => {
            // Read the day number from the cell text
            const dayText = cell.textContent.trim()
            const dayNum = parseInt(dayText)

            // If we can parse a day number, update our current date
            if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
              // If day number is less than previous, we've moved to next month
              if (dayNum < currentDate.getDate() && dayNum < 15) {
                currentDate = new Date(currentDate)
                currentDate.setMonth(currentDate.getMonth() + 1)
                currentDate.setDate(dayNum)
              } else {
                currentDate = new Date(currentDate)
                currentDate.setDate(dayNum)
              }

              // Format cell date using local timezone to match todayStr
              const cellDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`

              // Check if this is today
              const isToday = cellDateStr === todayStr

              // Check if this is a weekend or public holiday
              const isWeekendDay = isWeekend(currentDate)
              const isInPublicHolidays = publicHolidays.includes(cellDateStr)

              // Create overlay for today, weekends, or holidays
              if (isToday || isWeekendDay || isInPublicHolidays) {
                const isPublicHoliday = isInPublicHolidays && !isWeekendDay

                // Get the actual position of this cell relative to the chart area
                const cellRect = cell.getBoundingClientRect()
                const leftOffset = cellRect.left - chartRect.left

                // Create overlay div positioned using actual cell position
                const overlay = document.createElement('div')

                // Determine class and color based on type
                if (isToday) {
                  overlay.className = 'today-overlay'
                  overlay.style.backgroundColor = '#10b981' // Light green for today
                  overlay.style.opacity = '0.2' // More subtle for today
                  overlay.style.zIndex = '2' // Higher z-index so it shows on top of weekend/holiday
                } else if (isPublicHoliday) {
                  overlay.className = 'holiday-overlay'
                  overlay.style.backgroundColor = '#d1d5db' // Darker grey for holidays
                  overlay.style.opacity = '0.5'
                  overlay.style.zIndex = '1'
                } else {
                  overlay.className = 'weekend-overlay'
                  overlay.style.backgroundColor = '#f3f4f6' // Light grey for weekends
                  overlay.style.opacity = '0.5'
                  overlay.style.zIndex = '1'
                }

                overlay.style.position = 'absolute'
                overlay.style.left = `${leftOffset}px`
                overlay.style.top = '0'
                overlay.style.width = `${cellRect.width}px`
                overlay.style.height = '100%'
                overlay.style.pointerEvents = 'none'

                // Ensure chart area allows positioned children
                chartArea.style.position = 'relative'

                chartArea.appendChild(overlay)
              }
            }
          })
        }
      }, 1500)
    }
  }, [ganttApi, ganttData.data.length, ganttData.start, publicHolidays, isWeekend])

  // No need for header styling - weekends/holidays keep default header style
  // Only the chart area gets grey overlays

  if (!isOpen) return null

  return (
    <>
      <style>
        {`
          /* Weekend and holiday styling handled via overlays only */

          /* Match SVAR website styling */
          .wx-gantt {
            --wx-gantt-header-background: #2c3e50;
            --wx-gantt-header-color: #ffffff;
            --wx-gantt-border-color: #dee2e6;
            --wx-gantt-row-background: transparent;
            --wx-gantt-row-alt-background: transparent;
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

          /* Fill empty space below rows with light grey background */
          [class*="wx-chart"] {
            background-color: #f8f9fa !important;
            background-image: repeating-linear-gradient(
              0deg,
              #ffffff 0px,
              #ffffff 44px,
              #f8f9fa 44px,
              #f8f9fa 88px
            ) !important;
            min-height: 100% !important;
            height: 100% !important;
          }

          /* Force background on all row elements */
          .wx-gantt .wx-row {
            background: transparent !important;
          }

          /* Ensure the rows container shows the background */
          .wx-gantt [class*="wx-rows"] {
            background-color: #f8f9fa !important;
            background-image: repeating-linear-gradient(
              0deg,
              #ffffff 0px,
              #ffffff 44px,
              #f8f9fa 44px,
              #f8f9fa 88px
            ) !important;
          }

          /* Make Gantt container fill available height */
          .wx-gantt {
            height: 100% !important;
            background-color: white !important;
          }

          /* Add border to left panel with horizontal stripe pattern */
          .wx-gantt [class*="wx-grid"] {
            border-right: 1px solid #dee2e6 !important;
            height: 100% !important;
            background-color: #f8f9fa !important;
            background-image: repeating-linear-gradient(
              0deg,
              #ffffff 0px,
              #ffffff 44px,
              #f8f9fa 44px,
              #f8f9fa 88px
            ) !important;
          }

          /* Chart area with white background - weekend overlays will be added */
          .wx-gantt [class*="wx-chart-container"],
          .wx-gantt [class*="wx-chart"] {
            background-color: white !important;
            height: 100% !important;
          }

          /* Make grid body transparent to show stripe pattern */
          .wx-gantt [class*="wx-grid"] [class*="wx-data"],
          .wx-gantt [class*="wx-grid"] [class*="body"],
          .wx-gantt [class*="wx-grid"] [class*="viewport"] {
            background-color: transparent !important;
            background-image: none !important;
          }

          /* Ensure grid rows container expands to fill viewport */
          .wx-gantt [class*="wx-grid"] [class*="rows"] {
            min-height: 100% !important;
            background-color: transparent !important;
          }

          /* Ensure chart area is visible */
          .wx-gantt [class*="wx-chart-container"],
          .wx-gantt [class*="chart"] {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          /* Chart area should expand to fill remaining space */
          .wx-layout {
            height: 100% !important;
            min-height: 100% !important;
          }

          .wx-content {
            height: 100% !important;
            min-height: 100% !important;
          }

          .wx-data-area {
            height: 100% !important;
            min-height: 100% !important;
          }

          /* Ensure chart content fills the data area */
          .wx-chart-container {
            height: 100% !important;
            min-height: 100% !important;
          }

          /* Make the chart wrapper fill all available space */
          [class*="wx-chart-wrapper"] {
            height: 100% !important;
            min-height: 100% !important;
          }

          /* Chart areas should be white - weekends will be shown via overlays */
          .wx-gantt [class*="wx-chart"] [class*="wx-data"],
          .wx-gantt [class*="wx-chart"] [class*="body"],
          .wx-gantt [class*="wx-chart"] [class*="viewport"] {
            background-color: white !important;
            background-image: none !important;
          }

          /* Ensure chart rows container expands to fill viewport */
          .wx-gantt [class*="wx-chart"] [class*="rows"] {
            min-height: 100% !important;
            background-color: transparent !important;
          }


          /* Hide left panel (task grid) when toggled off */
          ${!showLeftPanel ? `
            [class*="wx-grid"] {
              display: none !important;
            }
            [class*="wx-scales"] {
              grid-column: 1 / -1 !important;
            }
            [class*="wx-chart-container"] {
              grid-column: 1 / -1 !important;
            }
          ` : ''}

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
          <div className="flex items-center gap-2">
            {/* Column Selector */}
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title="Select columns"
              >
                <Bars3Icon className="h-5 w-5" />
                <span>Columns</span>
              </button>

              {showColumnMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowColumnMenu(false)}
                  />

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Show Columns
                      </div>

                      <label className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.taskName}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, taskName: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Task Name</span>
                        {visibleColumns.taskName && <CheckIcon className="h-4 w-4 text-indigo-600 ml-auto" />}
                      </label>

                      <label className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.predecessors}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, predecessors: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Predecessors</span>
                        {visibleColumns.predecessors && <CheckIcon className="h-4 w-4 text-indigo-600 ml-auto" />}
                      </label>

                      <label className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.supplierGroup}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, supplierGroup: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Supplier/Group</span>
                        {visibleColumns.supplierGroup && <CheckIcon className="h-4 w-4 text-indigo-600 ml-auto" />}
                      </label>

                      <label className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.duration}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, duration: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Duration</span>
                        {visibleColumns.duration && <CheckIcon className="h-4 w-4 text-indigo-600 ml-auto" />}
                      </label>

                      <label className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.startDay}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, startDay: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Start Day</span>
                        {visibleColumns.startDay && <CheckIcon className="h-4 w-4 text-indigo-600 ml-auto" />}
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hide/Show Panel Toggle */}
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              title={showLeftPanel ? 'Hide task list' : 'Show task list'}
            >
              {showLeftPanel ? (
                <>
                  <EyeSlashIcon className="h-5 w-5" />
                  <span>Hide Panel</span>
                </>
              ) : (
                <>
                  <EyeIcon className="h-5 w-5" />
                  <span>Show Panel</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 overflow-hidden relative">
          <div className="relative h-full w-full">
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
                    onUpdate={(updatedTask) => {
                      console.log('Task updated in Gantt:', updatedTask)

                      // Find the original task
                      const originalTask = tasks.find(t => t.id === updatedTask.id)
                      if (!originalTask) return

                      // Use setTimeout to avoid blocking render
                      setTimeout(() => {
                        const updates = {}

                        // If dates changed, recalculate duration as business days
                        if (updatedTask.start && updatedTask.end) {
                          const startDate = new Date(updatedTask.start)
                          const endDate = new Date(updatedTask.end)
                          let businessDays = 0
                          let current = new Date(startDate)

                          // Safely count business days with a max limit to prevent infinite loops
                          let maxIterations = 1000
                          while (current < endDate && maxIterations > 0) {
                            if (isWorkingDay(current)) {
                              businessDays++
                            }
                            current.setDate(current.getDate() + 1)
                            maxIterations--
                          }

                          if (businessDays !== originalTask.duration) {
                            updates.duration = businessDays
                          }
                        }

                        // Only update if there are actual changes
                        if (Object.keys(updates).length > 0) {
                          console.log('Syncing duration update to Schedule Master:', updates)
                          onUpdateTask(originalTask.id, updates)
                        }
                      }, 0)
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
