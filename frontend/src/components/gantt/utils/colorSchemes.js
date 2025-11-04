/**
 * Color schemes for Gantt chart using Tailwind badge colors
 */

export const AVAILABLE_COLORS = {
  gray: {
    name: 'Gray',
    bg: '#F9FAFB',
    text: '#4B5563',
    bar: '#9CA3AF',
    ring: 'ring-gray-500/10',
    badge: 'bg-gray-50 text-gray-600 ring-gray-500/10',
  },
  red: {
    name: 'Red',
    bg: '#FEF2F2',
    text: '#B91C1C',
    bar: '#EF4444',
    ring: 'ring-red-600/10',
    badge: 'bg-red-50 text-red-700 ring-red-600/10',
  },
  yellow: {
    name: 'Yellow',
    bg: '#FEFCE8',
    text: '#A16207',
    bar: '#EAB308',
    ring: 'ring-yellow-600/20',
    badge: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  },
  green: {
    name: 'Green',
    bg: '#F0FDF4',
    text: '#15803D',
    bar: '#22C55E',
    ring: 'ring-green-600/20',
    badge: 'bg-green-50 text-green-700 ring-green-600/20',
  },
  blue: {
    name: 'Blue',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    bar: '#3B82F6',
    ring: 'ring-blue-700/10',
    badge: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  },
  indigo: {
    name: 'Indigo',
    bg: '#EEF2FF',
    text: '#4338CA',
    bar: '#6366F1',
    ring: 'ring-indigo-700/10',
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
  },
  purple: {
    name: 'Purple',
    bg: '#FAF5FF',
    text: '#7C3AED',
    bar: '#A855F7',
    ring: 'ring-purple-700/10',
    badge: 'bg-purple-50 text-purple-700 ring-purple-700/10',
  },
  pink: {
    name: 'Pink',
    bg: '#FDF2F8',
    text: '#BE185D',
    bar: '#EC4899',
    ring: 'ring-pink-700/10',
    badge: 'bg-pink-50 text-pink-700 ring-pink-700/10',
  },
}

// Default color mappings for statuses
export const DEFAULT_STATUS_COLORS = {
  not_started: 'gray',
  in_progress: 'blue',
  complete: 'green',
  blocked: 'red',
  on_hold: 'yellow',
}

// Default color mappings for categories
export const DEFAULT_CATEGORY_COLORS = {
  procurement: 'green',
  construction: 'indigo',
  inspection: 'blue',
  administration: 'purple',
  finishing: 'pink',
}

/**
 * Get color configuration from localStorage or use defaults
 */
export const getStoredColorConfig = () => {
  try {
    const stored = localStorage.getItem('gantt_color_config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load color config:', e)
  }

  return {
    statusColors: DEFAULT_STATUS_COLORS,
    categoryColors: DEFAULT_CATEGORY_COLORS,
  }
}

/**
 * Save color configuration to localStorage
 */
export const saveColorConfig = (config) => {
  try {
    localStorage.setItem('gantt_color_config', JSON.stringify(config))
  } catch (e) {
    console.error('Failed to save color config:', e)
  }
}

/**
 * Get color for a status
 */
export const getStatusColor = (status, colorConfig) => {
  const colorKey = colorConfig?.statusColors?.[status] || DEFAULT_STATUS_COLORS[status] || 'gray'
  return AVAILABLE_COLORS[colorKey]
}

/**
 * Get color for a category
 */
export const getCategoryColor = (category, colorConfig) => {
  const colorKey = colorConfig?.categoryColors?.[category] || DEFAULT_CATEGORY_COLORS[category] || 'blue'
  return AVAILABLE_COLORS[colorKey]
}

/**
 * Get all unique statuses from tasks
 */
export const getUniqueStatuses = (tasks) => {
  const statuses = new Set()
  tasks.forEach(task => {
    if (task.status) statuses.add(task.status)
  })
  return Array.from(statuses)
}

/**
 * Get all unique categories from tasks
 */
export const getUniqueCategories = (tasks) => {
  const categories = new Set()
  tasks.forEach(task => {
    if (task.category) categories.add(task.category)
  })
  return Array.from(categories)
}
