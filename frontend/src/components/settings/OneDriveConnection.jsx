import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, CloudIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function OneDriveConnection() {
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    driveName: null,
    rootFolderPath: null,
    connectedAt: null,
    connectedBy: null,
    error: null,
  })
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [message, setMessage] = useState(null)

  // Fetch connection status on mount
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }))
      const response = await api.get('/api/v1/organization_onedrive/status')

      setStatus({
        loading: false,
        connected: response.connected,
        driveName: response.drive_name,
        rootFolderPath: response.root_folder_path,
        connectedAt: response.connected_at,
        connectedBy: response.connected_by,
        metadata: response.metadata,
        error: null,
      })
    } catch (err) {
      setStatus({
        loading: false,
        connected: false,
        driveName: null,
        rootFolderPath: null,
        connectedAt: null,
        connectedBy: null,
        error: err.message || 'Failed to fetch connection status',
      })
    }
  }

  const handleConnect = async () => {
    try {
      setConnecting(true)
      setMessage(null)

      // Call the connect endpoint - no user interaction needed!
      const response = await api.post('/api/v1/organization_onedrive/connect')

      setMessage({
        type: 'success',
        text: response.message || 'OneDrive connected successfully!',
      })

      // Refresh status
      await fetchStatus()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to connect OneDrive',
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true)
      await api.delete('/api/v1/organization_onedrive/disconnect')

      setStatus({
        loading: false,
        connected: false,
        driveName: null,
        rootFolderPath: null,
        connectedAt: null,
        connectedBy: null,
        error: null,
      })

      setMessage({
        type: 'success',
        text: 'Successfully disconnected from OneDrive',
      })

      setShowDisconnectDialog(false)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to disconnect from OneDrive',
      })
    } finally {
      setDisconnecting(false)
    }
  }

  if (status.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading connection status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 rounded-md p-4 ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-400/10'
              : 'bg-red-100 dark:bg-red-400/10'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckCircleIcon
                  className="h-5 w-5 text-green-700 dark:text-green-400"
                  aria-hidden="true"
                />
              ) : (
                <XCircleIcon
                  className="h-5 w-5 text-red-700 dark:text-red-400"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm ${
                  message.type === 'success'
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-x-3">
              <CloudIcon className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Microsoft OneDrive</h3>
            </div>

            <div className="mt-4">
              {status.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-x-2">
                    <span
                      className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                    >
                      Connected (Organization-wide)
                    </span>
                  </div>

                  {status.driveName && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Drive</p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {status.driveName}
                      </p>
                    </div>
                  )}

                  {status.rootFolderPath && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Root Folder</p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {status.rootFolderPath}
                      </p>
                    </div>
                  )}

                  {status.connectedBy && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Connected by</p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {status.connectedBy.email}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/10">
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        <strong>All jobs automatically have OneDrive access!</strong> Go to any job's Documents tab to create folder structures and manage files.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDisconnectDialog(true)}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-500 dark:hover:bg-red-400"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-x-2">
                    <span
                      className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
                    >
                      Not Connected
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connect your organization's OneDrive account once, and all jobs will automatically have access to document management.
                  </p>

                  <div className="mt-4 rounded-md bg-gray-50 p-4 dark:bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">How it works:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>Click "Connect OneDrive" below</li>
                      <li>OneDrive will be connected using your Azure app credentials</li>
                      <li>All jobs immediately gain document management capabilities</li>
                      <li>No need to reconnect for individual jobs!</li>
                    </ol>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleConnect}
                      disabled={connecting}
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                      {connecting ? (
                        <span className="flex items-center gap-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Connecting...
                        </span>
                      ) : (
                        'Connect OneDrive'
                      )}
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <strong>Note:</strong> Your Azure app must be configured with Application permissions (not Delegated permissions) for this to work. See setup guide for details.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectDialog} onClose={setShowDisconnectDialog} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 dark:bg-gray-900"
            >
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-500/10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-500" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-white">
                    Disconnect OneDrive
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to disconnect OneDrive? All jobs will lose access to document management. You will need to reconnect to restore access.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 sm:ml-3 sm:w-auto dark:bg-red-500 dark:hover:bg-red-400"
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisconnectDialog(false)}
                  disabled={disconnecting}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
