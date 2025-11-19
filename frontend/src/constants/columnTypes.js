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
 * Includes SQL types, validation rules, examples, and usage information from Gold Standard.
 */
export const COLUMN_TYPES = [
  // Text Fields
  {
    value: 'single_line_text',
    label: 'Single line text',
    icon: DocumentTextIcon,
    category: 'Text',
    description: 'Short text (up to 255 characters)',
    sqlType: 'VARCHAR(255)',
    validationRules: 'Optional text field, max 255 characters, alphanumeric',
    example: 'CONC-001, STL-042A',
    usedFor: 'Unique identifier code for inventory'
  },
  {
    value: 'multiple_lines_text',
    label: 'Long text',
    icon: Bars3BottomLeftIcon,
    category: 'Text',
    description: 'Multi-line text field',
    sqlType: 'TEXT',
    validationRules: 'Optional text field, supports line breaks',
    example: 'Additional notes\nSecond line\nThird line',
    usedFor: 'Notes, comments, multi-line descriptions'
  },
  {
    value: 'email',
    label: 'Email',
    icon: EnvelopeIcon,
    category: 'Text',
    description: 'Email address',
    sqlType: 'VARCHAR(255)',
    validationRules: 'Must contain @ symbol, valid email format',
    example: 'supplier@example.com, contact@business.com.au',
    usedFor: 'Email addresses for contacts'
  },
  {
    value: 'phone',
    label: 'Phone number',
    icon: PhoneIcon,
    category: 'Text',
    description: 'Phone number',
    sqlType: 'VARCHAR(20)',
    validationRules: 'Format: (03) 9123 4567 or 1300 numbers',
    example: '(03) 9123 4567, 1300 123 456',
    usedFor: 'Landline phone numbers'
  },
  {
    value: 'mobile',
    label: 'Mobile',
    icon: PhoneIcon,
    category: 'Text',
    description: 'Mobile phone number',
    sqlType: 'VARCHAR(20)',
    validationRules: 'Format: 0407 397 541, starts with 04',
    example: '0407 397 541, 0412 345 678',
    usedFor: 'Mobile phone numbers'
  },
  {
    value: 'url',
    label: 'URL',
    icon: LinkIcon,
    category: 'Text',
    description: 'Website URL',
    sqlType: 'VARCHAR(500)',
    validationRules: 'Valid URL format, clickable in table',
    example: 'https://example.com/doc.pdf',
    usedFor: 'Links to external documents or files'
  },

  // Number Fields
  {
    value: 'number',
    label: 'Number',
    icon: HashtagIcon,
    category: 'Numbers',
    description: 'Decimal number',
    sqlType: 'INTEGER',
    validationRules: 'Positive integers, shows sum in footer',
    example: '10, 250, 15',
    usedFor: 'Quantity of items'
  },
  {
    value: 'whole_number',
    label: 'Whole number',
    icon: HashtagIcon,
    category: 'Numbers',
    description: 'Integer number',
    sqlType: 'INTEGER',
    validationRules: 'Integers only (no decimals), shows sum',
    example: '5, 100, 42',
    usedFor: 'Counts, units, days - no fractional values'
  },
  {
    value: 'currency',
    label: 'Currency',
    icon: CurrencyDollarIcon,
    category: 'Numbers',
    description: 'Money amount',
    sqlType: 'DECIMAL(10,2)',
    validationRules: 'Positive numbers, 2 decimal places, shows sum in footer',
    example: '$125.50, $1,234.99',
    usedFor: 'Price in Australian dollars'
  },
  {
    value: 'percentage',
    label: 'Percent',
    icon: HashtagIcon,
    category: 'Numbers',
    description: 'Percentage value',
    sqlType: 'DECIMAL(5,2)',
    validationRules: '0-100, displayed with % symbol',
    example: '10.5%, 25%, 0%',
    usedFor: 'Discount percentage for pricing'
  },

  // Date & Time
  {
    value: 'date',
    label: 'Date',
    icon: CalendarIcon,
    category: 'Date & Time',
    description: 'Date only',
    sqlType: 'DATE',
    validationRules: 'Format: YYYY-MM-DD, no time component',
    example: '2025-11-19, 1990-01-15',
    usedFor: 'Date values without time, for contracts, events, start dates'
  },
  {
    value: 'date_and_time',
    label: 'Date & Time',
    icon: ClockIcon,
    category: 'Date & Time',
    description: 'Date and time',
    sqlType: 'DATETIME',
    validationRules: 'Auto-populated on creation, not editable',
    example: '19/11/2024 14:30',
    usedFor: 'Record creation timestamp'
  },

  // Special Types
  {
    value: 'gps_coordinates',
    label: 'GPS Coordinates',
    icon: LinkIcon,
    category: 'Special',
    description: 'Latitude and Longitude',
    sqlType: 'VARCHAR(100)',
    validationRules: 'Latitude, Longitude format',
    example: '-33.8688, 151.2093 (Sydney)',
    usedFor: 'GPS coordinates for job sites, delivery addresses, asset tracking'
  },
  {
    value: 'color_picker',
    label: 'Color Picker',
    icon: LinkIcon,
    category: 'Special',
    description: 'Hex color code',
    sqlType: 'VARCHAR(7)',
    validationRules: 'Hex color format (#RRGGBB)',
    example: '#FF5733, #3498DB, #000000',
    usedFor: 'Visual categorization, status indicators, UI customization'
  },
  {
    value: 'file_upload',
    label: 'File Upload',
    icon: LinkIcon,
    category: 'Special',
    description: 'File attachment reference',
    sqlType: 'TEXT',
    validationRules: 'File path or URL to uploaded file',
    example: '/uploads/doc.pdf, https://example.com/file.png',
    usedFor: 'File references, document links, image paths'
  },

  // Selection & Boolean
  {
    value: 'boolean',
    label: 'Checkbox',
    icon: CheckCircleIcon,
    category: 'Selection',
    description: 'True/false value',
    sqlType: 'BOOLEAN',
    validationRules: 'True or False only',
    example: 'true, false',
    usedFor: 'Active/inactive status flag'
  },
  {
    value: 'choice',
    label: 'Single select',
    icon: RectangleStackIcon,
    category: 'Selection',
    description: 'Select one option from a list',
    sqlType: 'VARCHAR(50)',
    validationRules: 'Limited options: active, inactive (with colored badges)',
    example: 'active (green), inactive (red)',
    usedFor: 'Status with visual indicators'
  },

  // Relationships
  {
    value: 'lookup',
    label: 'Link to another record',
    icon: ArrowsRightLeftIcon,
    category: 'Relationships',
    needsConfig: true,
    description: 'Link to records in another table',
    sqlType: 'VARCHAR(255)',
    validationRules: 'Must match predefined category list',
    example: 'Concrete, Timber, Steel, Plasterboard',
    usedFor: 'Material type classification'
  },
  {
    value: 'multiple_lookups',
    label: 'Link to multiple records',
    icon: ArrowsRightLeftIcon,
    category: 'Relationships',
    needsConfig: true,
    description: 'Link to multiple records',
    sqlType: 'TEXT',
    validationRules: 'Array of IDs stored as JSON',
    example: '[1, 5, 12]',
    usedFor: 'Multiple relationships to other records'
  },
  {
    value: 'user',
    label: 'User',
    icon: UserIcon,
    category: 'Relationships',
    description: 'Link to a user',
    sqlType: 'INTEGER',
    validationRules: 'Must reference valid user ID',
    example: 'User #7, User #1',
    usedFor: 'Assignment to users, ownership tracking'
  },

  // Computed
  {
    value: 'computed',
    label: 'Formula',
    icon: CalculatorIcon,
    category: 'Computed',
    description: 'Calculated value based on other fields',
    sqlType: 'COMPUTED',
    validationRules: 'Formula: price × quantity, read-only, shows sum',
    example: '$1,255.00 (from $125.50 × 10)',
    usedFor: 'Automatic calculations from other columns'
  },
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
