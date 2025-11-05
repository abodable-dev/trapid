import { useState, useRef, useEffect } from 'react'

/**
 * Inline-editable property component inspired by Notion
 * Supports text, number, date, and select inputs
 * Auto-saves on blur, Enter key, or when value changes
 */
export default function Property({
  label,
  value,
  type = 'text',
  placeholder = 'Click to add...',
  onSave,
  formatValue,
  options = [],
  className = '',
  badge = null,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (type === 'text' || type === 'number') {
        inputRef.current.select()
      }
    }
  }, [isEditing, type])

  const handleClick = () => {
    setEditValue(value || '')
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    try {
      setIsSaving(true)
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
      // Revert on error
      setEditValue(value || '')
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value || '')
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    handleSave()
  }

  const displayValue = formatValue ? formatValue(value) : value

  return (
    <div className={`group ${className}`}>
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </dt>
      <dd className="text-sm">
        {isEditing ? (
          <>
            {type === 'select' ? (
              <select
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select...</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                ref={inputRef}
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={placeholder}
              />
            )}
          </>
        ) : (
          <button
            onClick={handleClick}
            className="text-left w-full rounded-md px-2 py-1.5 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
          >
            {displayValue ? (
              <>
                {badge ? badge(displayValue) : displayValue}
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic">
                {placeholder}
              </span>
            )}
          </button>
        )}
      </dd>
    </div>
  )
}
