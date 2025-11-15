import { formatCurrency } from '../../utils/formatters'
import { getNowInCompanyTimezone, getTodayAsString, getRelativeTime } from '../../utils/timezoneUtils'
import {
  DocumentTextIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function getActivityIcon(type) {
  switch (type) {
    case 'po_created':
      return DocumentTextIcon
    case 'po_approved':
      return CheckCircleIcon
    case 'po_updated':
      return PencilSquareIcon
    case 'po_cancelled':
      return XCircleIcon
    default:
      return DocumentTextIcon
  }
}

function getActivityColor(type) {
  switch (type) {
    case 'po_created':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    case 'po_approved':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    case 'po_updated':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
    case 'po_cancelled':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
  }
}

function formatActivityTime(date) {
  const now = new Date()
  const activityDate = new Date(date)
  const diffMs = now - activityDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return activityDate.toLocaleDateString()
}

export default function RecentActivityList({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No recent activity
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Activity will appear here as changes are made
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {activities.map((activity, activityIdx) => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type)

            return (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className={classNames(
                        'h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800',
                        colorClass
                      )}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {formatActivityTime(activity.created_at)}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {activity.description}
                      </div>
                      {activity.amount && (
                        <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(activity.amount, false)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
