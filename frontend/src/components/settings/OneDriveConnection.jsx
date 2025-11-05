import { useState, useEffect } from 'react'
import { CloudIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function OneDriveConnection() {
  const [connectedJobs, setConnectedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConnectedJobs()
  }, [])

  const fetchConnectedJobs = async () => {
    try {
      setLoading(true)
      // Fetch all constructions and check their OneDrive status
      const constructions = await api.get('/api/v1/constructions')

      // Check OneDrive status for each construction
      const statusChecks = await Promise.all(
        constructions.map(async (construction) => {
          try {
            const status = await api.get(`/api/v1/onedrive/status?construction_id=${construction.id}`)
            return {
              ...construction,
              onedrive_connected: status.connected,
              onedrive_folder_path: status.folder_path
            }
          } catch (err) {
            return {
              ...construction,
              onedrive_connected: false
            }
          }
        })
      )

      const connected = statusChecks.filter(job => job.onedrive_connected)
      setConnectedJobs(connected)
    } catch (err) {
      console.error('Failed to fetch connected jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading OneDrive connections...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {/* OneDrive Status Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-x-3">
              <CloudIcon className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Microsoft OneDrive</h3>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                OneDrive is connected per-job. Connect OneDrive from individual job pages to sync documents
                and automatically create folder structures.
              </p>

              {connectedJobs.length > 0 ? (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Connected Jobs ({connectedJobs.length})
                  </h4>
                  <ul className="space-y-2">
                    {connectedJobs.map((job) => (
                      <li
                        key={job.id}
                        className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</p>
                          {job.onedrive_folder_path && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {job.onedrive_folder_path}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                          Connected
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/10">
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      No jobs connected yet. Visit a job page and go to the Documents tab to connect OneDrive
                      for that job.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">How it works:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Navigate to a job page</li>
                  <li>Go to the Documents tab</li>
                  <li>Click "Connect OneDrive"</li>
                  <li>Sign in with your Microsoft account</li>
                  <li>Authorize Trapid to access your OneDrive</li>
                  <li>Folder structure will be automatically created</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
