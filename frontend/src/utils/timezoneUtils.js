/**
 * Timezone Utilities
 *
 * Provides timezone-aware date/time functions that respect the company timezone setting.
 * All functions use the company timezone from Settings → Company → Timezone.
 */

// Cache for company timezone (loaded from API)
let companyTimezone = 'Australia/Brisbane' // Default
let companySettings = null

/**
 * Set the company timezone (call this after loading company settings)
 * @param {string} timezone - IANA timezone string (e.g., 'Australia/Brisbane')
 */
export function setCompanyTimezone(timezone) {
  if (timezone && Intl.supportedValuesOf('timeZone').includes(timezone)) {
    companyTimezone = timezone
  } else {
    console.warn(`Invalid timezone: ${timezone}, using default: Australia/Brisbane`)
  }
}

/**
 * Set the full company settings object (includes timezone and working_days)
 * @param {Object} settings - Company settings object
 */
export function setCompanySettings(settings) {
  companySettings = settings
  if (settings?.timezone) {
    setCompanyTimezone(settings.timezone)
  }
}

/**
 * Get the current company timezone
 * @returns {string} IANA timezone string
 */
export function getCompanyTimezone() {
  return companyTimezone
}

/**
 * Get today's date in the company timezone
 * @returns {Date} Today's date at midnight in company timezone
 */
export function getTodayInCompanyTimezone() {
  const now = new Date()

  // Get the current date/time in the company timezone
  const dateInTZ = new Date(now.toLocaleString('en-US', { timeZone: companyTimezone }))

  // Reset to midnight
  dateInTZ.setHours(0, 0, 0, 0)

  return dateInTZ
}

/**
 * Get current date-time in the company timezone
 * @returns {Date} Current date-time in company timezone
 */
export function getNowInCompanyTimezone() {
  const now = new Date()
  return new Date(now.toLocaleString('en-US', { timeZone: companyTimezone }))
}

/**
 * Format a date in the company timezone
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDateInCompanyTimezone(date, options = {}) {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('en-AU', {
    timeZone: companyTimezone,
    ...options
  }).format(dateObj)
}

/**
 * Get today's date as YYYY-MM-DD string in company timezone
 * @returns {string} Date in YYYY-MM-DD format
 */
export function getTodayAsString() {
  return formatDateInCompanyTimezone(getTodayInCompanyTimezone(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-')
}

/**
 * Convert a Date to YYYY-MM-DD string in company timezone
 * @param {Date} date - Date to convert
 * @returns {string} Date in YYYY-MM-DD format
 */
export function toDateString(date) {
  return formatDateInCompanyTimezone(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-')
}

/**
 * Check if a date is a working day according to company settings
 * @param {Date} date - Date to check
 * @returns {boolean} True if working day
 */
export function isWorkingDay(date) {
  if (!companySettings?.working_days) {
    // Default working days: Mon-Fri + Sunday
    const day = date.getDay() // 0=Sunday, 6=Saturday
    return day !== 6 // Not Saturday
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = days[date.getDay()]

  return companySettings.working_days[dayName] === true
}

/**
 * Check if a date is a public holiday
 * @param {Date} date - Date to check
 * @param {Array} holidays - Array of holiday objects with {date, name} from API
 * @returns {boolean} True if public holiday
 */
export function isPublicHoliday(date, holidays = []) {
  const dateStr = toDateString(date)
  return holidays.some(holiday => holiday.date === dateStr)
}

/**
 * Check if a date is a business day (working day AND not a holiday)
 * @param {Date} date - Date to check
 * @param {Array} holidays - Array of holiday objects
 * @returns {boolean} True if business day
 */
export function isBusinessDay(date, holidays = []) {
  return isWorkingDay(date) && !isPublicHoliday(date, holidays)
}

/**
 * Get the next business day after a given date
 * @param {Date} date - Starting date
 * @param {Array} holidays - Array of holiday objects
 * @returns {Date} Next business day
 */
export function getNextBusinessDay(date, holidays = []) {
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)

  while (!isBusinessDay(nextDay, holidays)) {
    nextDay.setDate(nextDay.getDate() + 1)
  }

  return nextDay
}

/**
 * Add business days to a date (skipping weekends and holidays)
 * @param {Date} date - Starting date
 * @param {number} days - Number of business days to add
 * @param {Array} holidays - Array of holiday objects
 * @returns {Date} Resulting date
 */
export function addBusinessDays(date, days, holidays = []) {
  let result = new Date(date)
  let remaining = days

  while (remaining > 0) {
    result = getNextBusinessDay(result, holidays)
    remaining--
  }

  return result
}

/**
 * Format a date for display (respects company timezone)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date like "15 Nov 2025"
 */
export function formatDateDisplay(date) {
  return formatDateInCompanyTimezone(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format a date-time for display (respects company timezone)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date-time like "15 Nov 2025, 2:30 PM"
 */
export function formatDateTimeDisplay(date) {
  return formatDateInCompanyTimezone(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * Uses company timezone for calculations
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  const now = getNowInCompanyTimezone()
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const diffMs = dateObj - now
  const diffSec = Math.floor(Math.abs(diffMs) / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  const past = diffMs < 0
  const prefix = past ? '' : 'in '
  const suffix = past ? ' ago' : ''

  if (diffSec < 60) return past ? 'just now' : 'in a moment'
  if (diffMin < 60) return `${prefix}${diffMin} minute${diffMin !== 1 ? 's' : ''}${suffix}`
  if (diffHour < 24) return `${prefix}${diffHour} hour${diffHour !== 1 ? 's' : ''}${suffix}`
  if (diffDay < 30) return `${prefix}${diffDay} day${diffDay !== 1 ? 's' : ''}${suffix}`

  return formatDateDisplay(dateObj)
}

export default {
  setCompanyTimezone,
  setCompanySettings,
  getCompanyTimezone,
  getTodayInCompanyTimezone,
  getNowInCompanyTimezone,
  formatDateInCompanyTimezone,
  getTodayAsString,
  toDateString,
  isWorkingDay,
  isPublicHoliday,
  isBusinessDay,
  getNextBusinessDay,
  addBusinessDays,
  formatDateDisplay,
  formatDateTimeDisplay,
  getRelativeTime
}
