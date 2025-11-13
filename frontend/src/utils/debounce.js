/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce(func, wait = 300) {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Creates a debounced localStorage setter
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {function} Debounced setter function
 */
export function createDebouncedStorageSetter(delay = 500) {
  const debouncedSet = debounce((key, value) => {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, delay)

  return debouncedSet
}
