import { useState } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'
import { getStatusColor, getCategoryColor, getTypeColor } from './utils/colorSchemes'

/**
 * TaskTable - Inline editing table view for tasks
 * Inspired by Monday.com and Airtable's spreadsheet-like interface
 */
export default function TaskTable({ tasks = [], onTaskUpdate, colorConfig, colorBy = 'status' }) {
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startEditing = (taskId, field, currentValue) => {
    setEditingCell({ taskId, field })
    setEditValue(currentValue || '')
  }

  const saveEdit = (taskId, field) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskId, field, editValue)
    }
    setEditingCell(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const isEditing = (taskId, field) => {
    return editingCell?.taskId === taskId && editingCell?.field === field
  }

  const getBadgeStyle = (task) => {
    if (colorBy === 'status') {
      const colorObj = getStatusColor(task.status, colorConfig)
      return colorObj.badge
    } else if (colorBy === 'category') {
      const colorObj = getCategoryColor(task.category, colorConfig)
      return colorObj.badge
    } else {
      const colorObj = getTypeColor(task.task_type, colorConfig)
      return colorObj.badge
    }
  }

  const getProgressBarColor = (task) => {
    if (colorBy === 'status') {
      return getStatusColor(task.status, colorConfig).bar
    } else if (colorBy === 'category') {
      return getCategoryColor(task.category, colorConfig).bar
    } else {
      return getTypeColor(task.task_type, colorConfig).bar
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get unique assigned users from all tasks
  const uniqueAssignedUsers = [...new Set(tasks.map(t => t.assigned_to).filter(Boolean))]

  // Get unique suppliers from all tasks
  const uniqueSuppliers = [...new Set(tasks.map(t => t.supplier).filter(Boolean))]

  const EditableCell = ({ task, field, value, type = 'text' }) => {
    const editing = isEditing(task.id, field)

    if (editing) {
      return (
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => saveEdit(task.id, field)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit(task.id, field)
            if (e.key === 'Escape') cancelEdit()
          }}
          className="w-full px-2 py-1 text-sm border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoFocus
        />
      )
    }

    return (
      <div
        onClick={() => startEditing(task.id, field, value)}
        className="px-2 py-1 text-sm text-gray-900 cursor-pointer hover:bg-gray-100 rounded transition-colors"
      >
        {value || '-'}
      </div>
    )
  }

  const AssignedToListbox = ({ task }) => {
    const [selected, setSelected] = useState(task.assigned_to || null)

    const handleChange = (value) => {
      setSelected(value)
      if (onTaskUpdate) {
        onTaskUpdate(task.id, 'assigned_to', value)
      }
    }

    return (
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative">
          <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="block truncate">{selected || 'Unassigned'}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <ListboxOption
              value={null}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                }`
              }
            >
              {({ selected, active }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                    Unassigned
                  </span>
                  {selected && (
                    <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-white' : 'text-indigo-600'}`}>
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </ListboxOption>
            {uniqueAssignedUsers.map((user) => (
              <ListboxOption
                key={user}
                value={user}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  }`
                }
              >
                {({ selected, active }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                      {user}
                    </span>
                    {selected && (
                      <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-white' : 'text-indigo-600'}`}>
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    )
  }

  const SupplierListbox = ({ task }) => {
    const [selected, setSelected] = useState(task.supplier || null)

    const handleChange = (value) => {
      setSelected(value)
      if (onTaskUpdate) {
        onTaskUpdate(task.id, 'supplier', value)
      }
    }

    return (
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative">
          <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="block truncate">{selected || 'No supplier'}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <ListboxOption
              value={null}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                }`
              }
            >
              {({ selected, active }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                    No supplier
                  </span>
                  {selected && (
                    <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-white' : 'text-indigo-600'}`}>
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </ListboxOption>
            {uniqueSuppliers.map((supplier) => (
              <ListboxOption
                key={supplier}
                value={supplier}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  }`
                }
              >
                {({ selected, active }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                      {supplier}
                    </span>
                    {selected && (
                      <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-white' : 'text-indigo-600'}`}>
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-sm text-gray-500">No tasks to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                Task Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task, index) => (
              <tr
                key={task.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Task Name - Sticky */}
                <td className="sticky left-0 z-10 bg-white px-4 py-3 border-r border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <EditableCell task={task} field="name" value={task.name} />
                    {task.is_milestone && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        M
                      </span>
                    )}
                    {task.is_critical_path && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Critical
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {colorBy === 'status' ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${getBadgeStyle(task)}`}>
                      {task.status ? task.status.replace('_', ' ') : 'Not Started'}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-900">
                      {task.status ? task.status.replace('_', ' ') : 'Not Started'}
                    </span>
                  )}
                </td>

                {/* Category */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {colorBy === 'category' ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${getBadgeStyle(task)}`}>
                      {task.category || '-'}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-900">
                      {task.category || '-'}
                    </span>
                  )}
                </td>

                {/* Start Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {formatDate(task.start_date)}
                  </span>
                </td>

                {/* End Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {formatDate(task.end_date)}
                  </span>
                </td>

                {/* Duration */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {task.duration ? `${task.duration} days` : '-'}
                  </span>
                </td>

                {/* Progress */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${task.progress || 0}%`,
                          backgroundColor: getProgressBarColor(task),
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 min-w-[35px]">
                      {task.progress || 0}%
                    </span>
                  </div>
                </td>

                {/* Assigned To */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <AssignedToListbox task={task} />
                </td>

                {/* Supplier */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <SupplierListbox task={task} />
                </td>

                {/* Type */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {colorBy === 'type' ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${getBadgeStyle(task)}`}>
                      {task.task_type || '-'}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-900">
                      {task.task_type || '-'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{tasks.length}</span> task{tasks.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500">
            Click any cell to edit (Phase 2 feature)
          </p>
        </div>
      </div>
    </div>
  )
}
