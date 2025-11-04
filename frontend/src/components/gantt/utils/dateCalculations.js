/**
 * Date calculation utilities for Gantt chart
 * Based on Monday.com Gantt design patterns
 */

/**
 * Calculate the number of days between two dates
 */
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get the project date range (earliest start to latest end)
 */
export const getProjectDateRange = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return { startDate: new Date(), endDate: new Date() }
  }

  const dates = tasks
    .filter(t => t.start_date && t.end_date)
    .flatMap(t => [new Date(t.start_date), new Date(t.end_date)])

  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))

  return { startDate: minDate, endDate: maxDate }
}

/**
 * Calculate the left position of a task bar based on its start date
 */
export const calculateTaskPosition = (taskStartDate, projectStartDate, pixelsPerDay) => {
  const taskStart = new Date(taskStartDate)
  const projectStart = new Date(projectStartDate)
  const daysFromStart = daysBetween(projectStart, taskStart)
  return daysFromStart * pixelsPerDay
}

/**
 * Calculate the width of a task bar based on its duration
 */
export const calculateTaskWidth = (startDate, endDate, pixelsPerDay) => {
  const duration = daysBetween(startDate, endDate)
  return Math.max(duration * pixelsPerDay, 20) // Minimum 20px width
}

/**
 * Generate timeline dates for header
 * Returns array of date objects for rendering timeline
 */
export const generateTimelineDates = (startDate, endDate, zoomLevel = 'weeks') => {
  const dates = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  // Add padding to show some context
  current.setDate(current.getDate() - 7)
  end.setDate(end.getDate() + 7)

  while (current <= end) {
    dates.push(new Date(current))

    if (zoomLevel === 'days') {
      current.setDate(current.getDate() + 1)
    } else if (zoomLevel === 'weeks') {
      current.setDate(current.getDate() + 7)
    } else if (zoomLevel === 'months') {
      current.setMonth(current.getMonth() + 1)
    }
  }

  return dates
}

/**
 * Format date for display
 */
export const formatDate = (date, format = 'short') => {
  const d = new Date(date)

  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } else if (format === 'long') {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } else if (format === 'month') {
    return d.toLocaleDateString('en-US', { month: 'short' })
  }

  return d.toLocaleDateString()
}

/**
 * Check if a date is today
 */
export const isToday = (date) => {
  const today = new Date()
  const compareDate = new Date(date)

  return today.getFullYear() === compareDate.getFullYear() &&
         today.getMonth() === compareDate.getMonth() &&
         today.getDate() === compareDate.getDate()
}

/**
 * Get status color based on task status
 * Following Monday.com color scheme
 */
export const getStatusColor = (status) => {
  const colors = {
    'not_started': '#C4C4C4',    // Gray
    'in_progress': '#579BFC',     // Blue
    'complete': '#00C875',        // Green
    'blocked': '#E44258',         // Red
    'on_hold': '#FDAB3D',         // Orange
  }

  return colors[status] || colors['not_started']
}

/**
 * Get category color
 */
export const getCategoryColor = (category) => {
  const colors = {
    'procurement': '#9CD326',     // Light green
    'construction': '#FF6900',    // Orange
    'inspection': '#0086C0',      // Blue
    'administration': '#784BD1',  // Purple
    'finishing': '#E2445C',       // Red
  }

  return colors[category] || '#579BFC'
}
