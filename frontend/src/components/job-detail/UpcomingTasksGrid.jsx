import UserAvatar from '../UserAvatar'
import { CalendarIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
 return classes.filter(Boolean).join(' ')
}

function getStatusBadge(status) {
 switch (status?.toLowerCase()) {
 case 'overdue':
 return {
 bg: 'bg-red-100 dark:bg-red-900/30',
 text: 'text-red-700 dark:text-red-400',
 ring: 'ring-red-600/20 dark:ring-red-400/30',
 label: 'Overdue',
 }
 case 'complete':
 case 'completed':
 return {
 bg: 'bg-green-100 dark:bg-green-900/30',
 text: 'text-green-700 dark:text-green-400',
 ring: 'ring-green-600/20 dark:ring-green-400/30',
 label: 'Complete',
 }
 case 'underway':
 case 'in_progress':
 return {
 bg: 'bg-yellow-100 dark:bg-yellow-900/30',
 text: 'text-yellow-700 dark:text-yellow-400',
 ring: 'ring-yellow-600/20 dark:ring-yellow-400/30',
 label: 'Underway',
 }
 case 'pending':
 default:
 return {
 bg: 'bg-gray-100 dark:bg-gray-900/30',
 text: 'text-gray-700 dark:text-gray-400',
 ring: 'ring-gray-600/20 dark:ring-gray-400/30',
 label: 'Pending',
 }
 }
}

function formatDueDate(date) {
 if (!date) return null

 const dueDate = new Date(date)
 const now = new Date()
 const diffMs = dueDate - now
 const diffDays = Math.ceil(diffMs / 86400000)

 if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
 if (diffDays === 0) return 'Due today'
 if (diffDays === 1) return 'Due tomorrow'
 if (diffDays < 7) return `Due in ${diffDays} days`
 return dueDate.toLocaleDateString()
}

export default function UpcomingTasksGrid({ tasks = [] }) {
 if (tasks.length === 0) {
 return (
 <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
 <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
 What's Coming Up
 </h3>
 <div className="text-center py-8">
 <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
 <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
 No upcoming tasks
 </p>
 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
 Tasks and milestones will appear here
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
 <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
 What's Coming Up
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {tasks.map((task) => {
 const badge = getStatusBadge(task.status)
 const dueDateText = formatDueDate(task.due_date)

 return (
 <div
 key={task.id}
 className="relative flex items-start space-x-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
 >
 <div className="flex-shrink-0">
 <UserAvatar user={task.assigned_to} size="md" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="focus:outline-none">
 <p className="text-sm font-medium text-gray-900 dark:text-white">
 {task.name || task.title}
 </p>
 {task.description && (
 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
 {task.description}
 </p>
 )}
 <div className="mt-2 flex items-center gap-2 flex-wrap">
 <span
 className={classNames(
 'inline-flex items-center px-2 py-1 text-xs font-medium ring-1 ring-inset',
 badge.bg,
 badge.text,
 badge.ring
 )}
 >
 {badge.label}
 </span>
 {dueDateText && (
 <span className="text-xs text-gray-500 dark:text-gray-400">
 {dueDateText}
 </span>
 )}
 </div>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>
 )
}
