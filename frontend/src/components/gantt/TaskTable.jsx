import { useState, useMemo } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'
import { getStatusColor, getCategoryColor, getTypeColor } from './utils/colorSchemes'

/**
 * TaskTable - Inline editing table view for tasks
 * Inspired by Monday.com and Airtable's spreadsheet-like interface
 * Redesigned to match ActiveJobsPage styling with sorting and multi-select
 */
export default function TaskTable({ tasks = [], onTaskUpdate, colorConfig, colorBy = 'status', saving = false }) {
 const [editingCell, setEditingCell] = useState(null)
 const [editValue, setEditValue] = useState('')
 const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

 // Sorting logic
 const sortedTasks = useMemo(() => {
 if (!sortConfig.key || !sortConfig.direction) {
 return tasks
 }

 const sorted = [...tasks].sort((a, b) => {
 let aValue = a[sortConfig.key]
 let bValue = b[sortConfig.key]

 // Handle different field types
 if (sortConfig.key === 'start_date' || sortConfig.key === 'end_date') {
 aValue = aValue ? new Date(aValue).getTime() : 0
 bValue = bValue ? new Date(bValue).getTime() : 0
 } else if (sortConfig.key === 'duration' || sortConfig.key === 'progress') {
 aValue = aValue || 0
 bValue = bValue || 0
 } else if (typeof aValue === 'string') {
 aValue = aValue?.toLowerCase() || ''
 bValue = bValue?.toLowerCase() || ''
 }

 if (aValue < bValue) {
 return sortConfig.direction === 'asc' ? -1 : 1
 }
 if (aValue > bValue) {
 return sortConfig.direction === 'asc' ? 1 : -1
 }
 return 0
 })

 return sorted
 }, [tasks, sortConfig])

 const handleSort = (key) => {
 let direction = 'asc'

 if (sortConfig.key === key) {
 if (sortConfig.direction === 'asc') {
 direction = 'desc'
 } else if (sortConfig.direction === 'desc') {
 // Third click removes sort
 setSortConfig({ key: null, direction: null })
 return
 }
 }

 setSortConfig({ key, direction })
 }

 const SortableHeader = ({ field, children, align = 'left' }) => {
 const isSorted = sortConfig.key === field
 const isAsc = isSorted && sortConfig.direction === 'asc'
 const isDesc = isSorted && sortConfig.direction === 'desc'

 return (
 <th
 onClick={() => handleSort(field)}
 className={`px-3 py-2 text-${align} text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group`}
 >
 <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
 <span>{children}</span>
 <span className="relative w-4 h-4">
 {!isSorted && (
 <div className="opacity-0 group-hover:opacity-40 transition-opacity">
 <ChevronUpIcon className="h-3 w-3 absolute top-0 text-gray-400" />
 <ChevronDownIcon className="h-3 w-3 absolute bottom-0 text-gray-400" />
 </div>
 )}
 {isAsc && <ChevronUpIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />}
 {isDesc && <ChevronDownIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />}
 </span>
 </div>
 </th>
 )
 }

 const startEditing = (taskId, field, currentValue) => {
 if (saving) return // Don't allow editing while saving
 setEditingCell({ taskId, field })

 // Convert date to YYYY-MM-DD format for date inputs
 if (field.includes('date') && currentValue) {
 const date = new Date(currentValue)
 const formattedDate = date.toISOString().split('T')[0]
 setEditValue(formattedDate)
 } else {
 setEditValue(currentValue || '')
 }
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

 // Team members with avatars
 const teamMembers = [
 { name: 'Rob Harder', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
 { name: 'Andrew Clement', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
 { name: 'Sam Harder', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
 { name: 'Sophie Harder', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
 { name: 'Jake Baird', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
 ]

 // Get unique suppliers from all tasks
 const uniqueSuppliers = [...new Set(tasks.map(t => t.supplier).filter(Boolean))]

 const EditableDateCell = ({ task, field, value }) => {
 const editing = isEditing(task.id, field)

 if (editing) {
 return (
 <input
 type="date"
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onBlur={() => saveEdit(task.id, field)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') saveEdit(task.id, field)
 if (e.key === 'Escape') cancelEdit()
 }}
 className="w-full px-2 py-1 text-sm border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
 disabled={saving}
 autoFocus
 />
 )
 }

 return (
 <div
 onClick={() => startEditing(task.id, field, value)}
 className={`px-2 py-1 text-sm text-gray-900 dark:text-white transition-colors ${saving ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'}`}
 >
 {formatDate(value)}
 </div>
 )
 }

 const EditableNumberCell = ({ task, field, value, min = 0, max = 100, suffix = '' }) => {
 const editing = isEditing(task.id, field)

 if (editing) {
 return (
 <input
 type="number"
 value={editValue}
 min={min}
 max={max}
 onChange={(e) => setEditValue(e.target.value)}
 onBlur={() => saveEdit(task.id, field)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') saveEdit(task.id, field)
 if (e.key === 'Escape') cancelEdit()
 }}
 className="w-full px-2 py-1 text-sm border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
 disabled={saving}
 autoFocus
 />
 )
 }

 return (
 <div
 onClick={() => startEditing(task.id, field, value)}
 className={`px-2 py-1 text-sm text-gray-900 dark:text-white transition-colors ${saving ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'}`}
 >
 {value !== null && value !== undefined ? `${value}${suffix}` : '-'}
 </div>
 )
 }

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
 className="w-full px-2 py-1 text-sm border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
 disabled={saving}
 autoFocus
 />
 )
 }

 return (
 <div
 onClick={() => startEditing(task.id, field, value)}
 className={`px-2 py-1 text-sm text-gray-900 dark:text-white transition-colors ${saving ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'}`}
 >
 {value || '-'}
 </div>
 )
 }

 const AssignedUserDropdown = ({ task }) => {
 // Find the selected team member based on task.assigned_to
 const findSelectedMember = (assignedName) => {
 if (!assignedName) return null
 return teamMembers.find(member => member.name === assignedName) || null
 }

 const [selected, setSelected] = useState(findSelectedMember(task.assigned_to))

 const handleChange = (member) => {
 setSelected(member)
 if (onTaskUpdate) {
 onTaskUpdate(task.id, 'assigned_to', member ? member.name : null)
 }
 }

 return (
 <Listbox value={selected} onChange={handleChange}>
 <div className="relative">
 <ListboxButton className="relative w-full cursor-pointer bg-white dark:bg-gray-800 py-1.5 pl-3 pr-8 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent shadow-sm">
 {selected === null ? (
 <span className="block truncate text-gray-500 dark:text-gray-400">Unassigned</span>
 ) : (
 <span className="flex items-center gap-2">
 <img
 alt={selected.name}
 src={selected.avatar}
 className="h-5 w-5 flex-shrink-0 rounded-full"
 />
 <span className="block truncate">{selected.name}</span>
 </span>
 )}
 <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
 <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
 </span>
 </ListboxButton>
 <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full min-w-[200px] overflow-auto bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
 <ListboxOption
 value={null}
 className="group relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white dark:text-white"
 >
 <div className="flex items-center gap-2">
 <span className="block truncate font-normal group-data-[selected]:font-semibold text-gray-500 dark:text-gray-400 group-data-[focus]:text-white">
 Unassigned
 </span>
 </div>
 <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
 <CheckIcon aria-hidden="true" className="h-5 w-5" />
 </span>
 </ListboxOption>
 {teamMembers.map((member) => (
 <ListboxOption
 key={member.name}
 value={member}
 className="group relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white dark:text-white"
 >
 <div className="flex items-center gap-2">
 <img
 alt={member.name}
 src={member.avatar}
 className="h-5 w-5 flex-shrink-0 rounded-full"
 />
 <span className="block truncate font-normal group-data-[selected]:font-semibold">
 {member.name}
 </span>
 </div>
 <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
 <CheckIcon aria-hidden="true" className="h-5 w-5" />
 </span>
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
 <ListboxButton className="relative w-full cursor-pointer bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
 <span className="block truncate">{selected || 'No supplier'}</span>
 <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
 <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
 </span>
 </ListboxButton>
 <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
 <ListboxOption
 value={null}
 className={({ active }) =>
 `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
 active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
 }`
 }
 >
 {({ selected, active }) => (
 <>
 <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
 No supplier
 </span>
 {selected && (
 <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
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
 active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
 }`
 }
 >
 {({ selected, active }) => (
 <>
 <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
 {supplier}
 </span>
 {selected && (
 <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
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
 <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
 <div className="text-center">
 <p className="text-sm text-gray-500 dark:text-gray-400">No tasks to display</p>
 </div>
 </div>
 )
 }

 return (
 <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
 <div className="overflow-x-auto overflow-y-auto flex-1">
 <table className="min-w-full">
 {/* ActiveJobsPage-inspired header styling */}
 <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
 <tr>
 <SortableHeader field="name">
 Task Name
 </SortableHeader>
 <SortableHeader field="status">
 Status
 </SortableHeader>
 <SortableHeader field="category">
 Category
 </SortableHeader>
 <SortableHeader field="start_date">
 Start Date
 </SortableHeader>
 <SortableHeader field="end_date">
 End Date
 </SortableHeader>
 <SortableHeader field="duration">
 Duration
 </SortableHeader>
 <SortableHeader field="progress">
 Progress
 </SortableHeader>
 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
 Assigned To
 </th>
 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
 Supplier
 </th>
 <SortableHeader field="task_type">
 Type
 </SortableHeader>
 </tr>
 </thead>
 {/* ActiveJobsPage-inspired row styling with gradient hover */}
 <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
 {sortedTasks.map((task, index) => (
 <tr
 key={task.id}
 className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-150"
 >
 {/* Task Name */}
 <td className="px-3 py-3">
 <div className="flex items-center gap-2">
 <EditableCell task={task} field="name" value={task.name} />
 {task.is_milestone && (
 <span className="inline-flex items-center bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-400/10 dark:text-purple-400">
 M
 </span>
 )}
 {task.is_critical_path && (
 <span className="inline-flex items-center bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-400/10 dark:text-red-400">
 Critical
 </span>
 )}
 </div>
 </td>

 {/* Status */}
 <td className="px-3 py-3 whitespace-nowrap">
 {colorBy === 'status' ? (
 <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getBadgeStyle(task)}`}>
 {task.status ? task.status.replace('_', ' ') : 'Not Started'}
 </span>
 ) : (
 <span className="text-sm text-gray-900 dark:text-white">
 {task.status ? task.status.replace('_', ' ') : 'Not Started'}
 </span>
 )}
 </td>

 {/* Category */}
 <td className="px-3 py-3 whitespace-nowrap">
 {colorBy === 'category' ? (
 <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getBadgeStyle(task)}`}>
 {task.category || '-'}
 </span>
 ) : (
 <span className="text-sm text-gray-900 dark:text-white">
 {task.category || '-'}
 </span>
 )}
 </td>

 {/* Start Date */}
 <td className="px-3 py-3 whitespace-nowrap">
 <EditableDateCell task={task} field="planned_start_date" value={task.start_date} />
 </td>

 {/* End Date */}
 <td className="px-3 py-3 whitespace-nowrap">
 <EditableDateCell task={task} field="planned_end_date" value={task.end_date} />
 </td>

 {/* Duration */}
 <td className="px-3 py-3 whitespace-nowrap">
 <EditableNumberCell task={task} field="duration_days" value={task.duration} min={1} max={365} suffix=" days" />
 </td>

 {/* Progress */}
 <td className="px-3 py-3 whitespace-nowrap">
 <div className="flex items-center gap-2">
 <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
 <div
 className="h-2 rounded-full transition-all"
 style={{
 width: `${task.progress || 0}%`,
 backgroundColor: getProgressBarColor(task),
 }}
 />
 </div>
 <div className="min-w-[60px]">
 <EditableNumberCell task={task} field="progress_percentage" value={task.progress} min={0} max={100} suffix="%" />
 </div>
 </div>
 </td>

 {/* Assigned To */}
 <td className="px-3 py-3 whitespace-nowrap">
 <AssignedUserDropdown task={task} />
 </td>

 {/* Supplier */}
 <td className="px-3 py-3 whitespace-nowrap">
 <SupplierListbox task={task} />
 </td>

 {/* Type */}
 <td className="px-3 py-3 whitespace-nowrap">
 {colorBy === 'type' ? (
 <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getBadgeStyle(task)}`}>
 {task.task_type || '-'}
 </span>
 ) : (
 <span className="text-sm text-gray-900 dark:text-white">
 {task.task_type || '-'}
 </span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Table Footer - ActiveJobsPage inspired */}
 <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
 <div className="flex items-center justify-between">
 <p className="text-sm text-gray-700 dark:text-gray-300">
 Showing <span className="font-medium">{sortedTasks.length}</span> task{sortedTasks.length !== 1 ? 's' : ''}
 {sortConfig.key && (
 <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
 (sorted by {sortConfig.key})
 </span>
 )}
 </p>
 <div className="flex items-center gap-2">
 {saving && (
 <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
 <span className="loading loading-xs"></span>
 Saving...
 </div>
 )}
 <p className="text-xs text-gray-500 dark:text-gray-400">
 Click any field to edit • Click headers to sort
 </p>
 </div>
 </div>
 </div>
 </div>
 )
}
