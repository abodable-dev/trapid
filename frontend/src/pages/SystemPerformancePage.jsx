import { useState, useEffect } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, ServerIcon, CpuChipIcon, CircleStackIcon } from '@heroicons/react/24/outline'
import { api } from '../api'

export default function SystemPerformancePage() {
  const [health, setHealth] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadAllData()

    if (autoRefresh) {
      const interval = setInterval(loadAllData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadAllData = async () => {
    try {
      const [healthRes, perfRes, metricsRes] = await Promise.all([
        api.get('/api/v1/system/health'),
        api.get('/api/v1/system/performance'),
        api.get('/api/v1/system/metrics')
      ])

      setHealth(healthRes.data || healthRes)
      setPerformance(perfRes.data || perfRes)
      setMetrics(metricsRes.data || metricsRes)
    } catch (err) {
      console.error('Failed to load system data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'healthy' || status === 'connected') {
      return (
        <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircleIcon className="h-4 w-4" />
          Healthy
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-x-1.5 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
        <ExclamationTriangleIcon className="h-4 w-4" />
        Issue
      </span>
    )
  }

  const formatBytes = (mb) => {
    if (mb < 1024) return `${mb.toFixed(2)} MB`
    return `${(mb / 1024).toFixed(2)} GB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">System Performance</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Monitor system health, performance metrics, and resource usage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Health Status */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ServerIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Overall Status
                    </dt>
                    <dd className="mt-1">
                      {getStatusBadge(health?.status)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CircleStackIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Database
                    </dt>
                    <dd className="mt-1">
                      {getStatusBadge(health?.database?.status)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CpuChipIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Memory Usage
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {health?.memory?.used_mb ? formatBytes(health.memory.used_mb) : 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ServerIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Tmp Files
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {health?.storage?.tmp_files?.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Info */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Server Information</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Ruby Version</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{performance?.server?.ruby_version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Rails Version</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{performance?.server?.rails_version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Environment</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white capitalize">{performance?.server?.environment}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Active Threads</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{performance?.server?.threads}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Uptime</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {performance?.server?.uptime_seconds ?
                    `${Math.floor(performance.server.uptime_seconds / 3600)}h ${Math.floor((performance.server.uptime_seconds % 3600) / 60)}m`
                    : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Database Connection Pool</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {performance?.database?.connected ? 'Connected' : 'Disconnected'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Pool Size</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{performance?.database?.pool_size}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Active Connections</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{performance?.database?.active_connections}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Memory (RSS)</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {performance?.memory?.rss_mb ? formatBytes(performance.memory.rss_mb) : 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Log Size</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {performance?.cache?.log_size_mb ? formatBytes(performance.cache.log_size_mb) : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Application Metrics */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Application Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {metrics?.records?.constructions?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Constructions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics?.records?.contacts?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Contacts</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics?.records?.purchase_orders?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Purchase Orders</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics?.records?.estimates?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Estimates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  )
}
