import { useState, useEffect } from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'
import api from '../../api'

export default function CompanyActivityTab({ company }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [company.id])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/companies/${company.id}/activities`)
      setActivities(response.activities || [])
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (activityType) => {
    return ClockIcon
  }

  const formatActivityDescription = (activity) => {
    // Parse the changes JSON if available
    if (activity.changes) {
      const changes = typeof activity.changes === 'string'
        ? JSON.parse(activity.changes)
        : activity.changes

      const changeDescriptions = Object.entries(changes).map(([key, [oldValue, newValue]]) => {
        return `${key} changed from "${oldValue}" to "${newValue}"`
      })

      if (changeDescriptions.length > 0) {
        return changeDescriptions.join(', ')
      }
    }

    return activity.description || 'No description available'
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading activity...</div>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Activity History</h3>

      {activities.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No activity</h3>
          <p className="mt-1 text-sm text-gray-500">No activity has been recorded for this company yet.</p>
        </div>
      ) : (
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {activities.map((activity, activityIdx) => {
              const Icon = getActivityIcon(activity.activity_type)

              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.activity_type?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {formatActivityDescription(activity)}
                          </p>
                          {activity.user && (
                            <p className="mt-0.5 text-xs text-gray-400">
                              by {activity.user.full_name || activity.user.email}
                            </p>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <time dateTime={activity.created_at}>
                            {new Date(activity.created_at).toLocaleDateString()}
                          </time>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
