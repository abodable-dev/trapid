import {
  DocumentTextIcon,
  HashtagIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  LinkIcon,
  Bars3BottomLeftIcon,
  UserIcon,
  CalculatorIcon,
  RectangleStackIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'

/**
 * Complete list of all column types supported by the application.
 * Used for column creation and display.
 */
export const COLUMN_TYPES = [
  // Text Fields
  { value: 'single_line_text', label: 'Single line text', icon: DocumentTextIcon, category: 'Text', description: 'Short text (up to 255 characters)' },
  { value: 'multiple_lines_text', label: 'Long text', icon: Bars3BottomLeftIcon, category: 'Text', description: 'Multi-line text field' },
  { value: 'email', label: 'Email', icon: EnvelopeIcon, category: 'Text', description: 'Email address' },
  { value: 'phone', label: 'Phone number', icon: PhoneIcon, category: 'Text', description: 'Phone number' },
  { value: 'url', label: 'URL', icon: LinkIcon, category: 'Text', description: 'Website URL' },

  // Number Fields
  { value: 'number', label: 'Number', icon: HashtagIcon, category: 'Numbers', description: 'Decimal number' },
  { value: 'whole_number', label: 'Whole number', icon: HashtagIcon, category: 'Numbers', description: 'Integer number' },
  { value: 'currency', label: 'Currency', icon: CurrencyDollarIcon, category: 'Numbers', description: 'Money amount' },
  { value: 'percentage', label: 'Percent', icon: HashtagIcon, category: 'Numbers', description: 'Percentage value' },

  // Date & Time
  { value: 'date', label: 'Date', icon: CalendarIcon, category: 'Date & Time', description: 'Date only' },
  { value: 'date_and_time', label: 'Date & Time', icon: ClockIcon, category: 'Date & Time', description: 'Date and time' },

  // Selection & Boolean
  { value: 'boolean', label: 'Checkbox', icon: CheckCircleIcon, category: 'Selection', description: 'True/false value' },
  { value: 'choice', label: 'Single select', icon: RectangleStackIcon, category: 'Selection', description: 'Select one option from a list' },

  // Relationships
  { value: 'lookup', label: 'Link to another record', icon: ArrowsRightLeftIcon, category: 'Relationships', needsConfig: true, description: 'Link to records in another table' },
  { value: 'multiple_lookups', label: 'Link to multiple records', icon: ArrowsRightLeftIcon, category: 'Relationships', needsConfig: true, description: 'Link to multiple records' },
  { value: 'user', label: 'User', icon: UserIcon, category: 'Relationships', description: 'Link to a user' },

  // Computed
  { value: 'computed', label: 'Formula', icon: CalculatorIcon, category: 'Computed', description: 'Calculated value based on other fields' },
]

/**
 * Column types that can be edited after creation.
 * Excludes computed fields and special relationship types that require configuration.
 */
export const EDITABLE_COLUMN_TYPES = COLUMN_TYPES.filter(t =>
  !['computed', 'user', 'lookup', 'multiple_lookups'].includes(t.value)
)

/**
 * Get the display label for a column type value
 * @param {string} value - The column type value (e.g., 'single_line_text')
 * @returns {string} The human-readable label
 */
export const getColumnTypeLabel = (value) => {
  const type = COLUMN_TYPES.find(t => t.value === value)
  return type?.label || value
}

/**
 * Get the icon component for a column type value
 * @param {string} value - The column type value
 * @returns {Component} The icon component
 */
export const getColumnTypeIcon = (value) => {
  const type = COLUMN_TYPES.find(t => t.value === value)
  return type?.icon || DocumentTextIcon
}

/**
 * Get all column types in a specific category
 * @param {string} category - The category name
 * @returns {Array} Array of column types in that category
 */
export const getColumnTypesByCategory = (category) => {
  return COLUMN_TYPES.filter(t => t.category === category)
}

/**
 * Get all unique categories
 * @returns {Array} Array of category names
 */
export const getColumnCategories = () => {
  return [...new Set(COLUMN_TYPES.map(t => t.category))]
}
