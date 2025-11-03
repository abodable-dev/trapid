import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
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
  DocumentIcon,
  PaperClipIcon,
  Bars3BottomLeftIcon,
  UserIcon,
  StarIcon,
  CalculatorIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline'

const COLUMN_TYPES = [
  // Standard Fields
  { value: 'lookup', label: 'Link to another record', icon: LinkIcon, category: 'Standard fields' },
  { value: 'single_line_text', label: 'Single line text', icon: DocumentTextIcon, category: 'Standard fields' },
  { value: 'multi_line_text', label: 'Long text', icon: Bars3BottomLeftIcon, category: 'Standard fields' },
  { value: 'attachment', label: 'Attachment', icon: PaperClipIcon, category: 'Standard fields' },
  { value: 'boolean', label: 'Checkbox', icon: CheckCircleIcon, category: 'Standard fields' },
  { value: 'multiple_select', label: 'Multiple select', icon: RectangleStackIcon, category: 'Standard fields' },
  { value: 'single_select', label: 'Single select', icon: RectangleStackIcon, category: 'Standard fields' },
  { value: 'user', label: 'User', icon: UserIcon, category: 'Standard fields' },
  { value: 'date', label: 'Date', icon: CalendarIcon, category: 'Standard fields' },
  { value: 'phone', label: 'Phone number', icon: PhoneIcon, category: 'Standard fields' },
  { value: 'email', label: 'Email', icon: EnvelopeIcon, category: 'Standard fields' },
  { value: 'url', label: 'URL', icon: LinkIcon, category: 'Standard fields' },
  { value: 'number', label: 'Number', icon: HashtagIcon, category: 'Standard fields' },
  { value: 'currency', label: 'Currency', icon: CurrencyDollarIcon, category: 'Standard fields' },
  { value: 'percentage', label: 'Percent', icon: HashtagIcon, category: 'Standard fields' },
  { value: 'duration', label: 'Duration', icon: ClockIcon, category: 'Standard fields' },
  { value: 'rating', label: 'Rating', icon: StarIcon, category: 'Standard fields' },
  { value: 'formula', label: 'Formula', icon: CalculatorIcon, category: 'Standard fields' },
  { value: 'rollup', label: 'Rollup', icon: ArrowPathIcon, category: 'Standard fields' },
  { value: 'count', label: 'Count', icon: HashtagIcon, category: 'Standard fields' },
  { value: 'lookup_field', label: 'Lookup', icon: MagnifyingGlassIcon, category: 'Standard fields' },
  { value: 'created_time', label: 'Created time', icon: ClockIcon, category: 'Standard fields' },
  { value: 'last_modified_time', label: 'Last modified time', icon: ClockIcon, category: 'Standard fields' },
  { value: 'created_by', label: 'Created by', icon: UserIcon, category: 'Standard fields' },
  { value: 'last_modified_by', label: 'Last modified by', icon: UserIcon, category: 'Standard fields' },
  { value: 'autonumber', label: 'Autonumber', icon: HashtagIcon, category: 'Standard fields' },
]

export default function AddColumnModal({ isOpen, onClose, onAdd }) {
  const [columnName, setColumnName] = useState('')
  const [columnType, setColumnType] = useState('single_line_text')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setColumnName('')
      setColumnType('single_line_text')
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!columnName.trim() || isSubmitting) return

    setIsSubmitting(true)
    await onAdd({ name: columnName.trim(), column_type: columnType })
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Column
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Column Name */}
            <div>
              <label htmlFor="column-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Column Name
              </label>
              <input
                type="text"
                id="column-name"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="Enter column name"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Column Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Column Type
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-80 overflow-y-auto">
                {/* Category Header */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Standard fields
                  </span>
                </div>

                {/* Column Type Options */}
                {COLUMN_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = columnType === type.value

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setColumnType(type.value)}
                      className={`w-full flex items-center gap-x-3 px-3 py-2.5 text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <span className="text-left">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!columnName.trim() || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Column'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
