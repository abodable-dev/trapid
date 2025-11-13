import { useState, useEffect } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, ServerIcon, CpuChipIcon, CircleStackIcon, DevicePhoneMobileIcon, SignalIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import performanceMonitor from '../utils/performanceMonitor'

export default function SystemPerformancePage() {
  const [health, setHealth] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [clientMetrics, setClientMetrics] = useState(performanceMonitor.getMetrics())
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadAllData()

    if (autoRefresh) {
      const interval = setInterval(loadAllData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Subscribe to client-side performance updates
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      setClientMetrics(newMetrics)
    })
    return unsubscribe
  }, [])

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

  const getWebVitalBadge = (rating) => {
    if (rating === 'good') {
      return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
    } else if (rating === 'needs-improvement') {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
    }
    return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
  }

  const formatWebVitalValue = (metric) => {
    if (!metric) return 'N/A'
    const value = metric.value
    if (metric.name.includes('Paint') || metric.name.includes('Byte')) {
      return value > 1000 ? `${(value / 1000).toFixed(2)}s` : `${value.toFixed(0)}ms`
    }
    if (metric.name.includes('Delay') || metric.name.includes('Next Paint')) {
      return `${value.toFixed(0)}ms`
    }
    return value.toFixed(3)
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

      {/* Client-Side Performance */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DevicePhoneMobileIcon className="h-6 w-6" />
          Client-Side Performance
        </h2>

        {/* Web Vitals */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Web Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(clientMetrics.webVitals).map(([key, metric]) => (
                <div key={key} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mb-2 ${getWebVitalBadge(metric.rating)}`}>
                    {key.toUpperCase()}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatWebVitalValue(metric)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Browser Memory */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Browser Memory Usage</h3>
              {clientMetrics.memory.supported === false ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{clientMetrics.memory.message}</p>
              ) : (
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">JS Heap Used</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{clientMetrics.memory.usedMB} MB</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">JS Heap Total</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{clientMetrics.memory.totalMB} MB</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">JS Heap Limit</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{clientMetrics.memory.limitMB} MB</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Percent Used</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      <span className={clientMetrics.memory.percentUsed > 80 ? 'text-red-600 dark:text-red-400' : clientMetrics.memory.percentUsed > 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}>
                        {clientMetrics.memory.percentUsed}%
                      </span>
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>

          {/* Bundle Performance */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Bundle Performance</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">JavaScript Files</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{clientMetrics.bundle.jsFiles}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">CSS Files</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{clientMetrics.bundle.cssFiles}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Total JS Size</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{clientMetrics.bundle.totalJS}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Total CSS Size</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{clientMetrics.bundle.totalCSS}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Total Size</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{clientMetrics.bundle.totalSize}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Network Performance */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <SignalIcon className="h-5 w-5" />
              Network Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{clientMetrics.network.dnsLookup || 0}ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">DNS Lookup</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{clientMetrics.network.tcpConnection || 0}ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">TCP Connection</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{clientMetrics.network.requestTime || 0}ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Request Time</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{clientMetrics.network.responseTime || 0}ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Response Time</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{clientMetrics.network.domLoad || 0}ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">DOM Load</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{clientMetrics.network.pageLoad || 0}ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Page Load</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{clientMetrics.network.totalLoadTime || 0}ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Load</div>
              </div>
            </div>
          </div>
        </div>

        {/* React Performance */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">React Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Renders</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{clientMetrics.react.renderCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Slow Renders (&gt;16ms)</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{clientMetrics.react.slowRenders.length}</div>
              </div>
            </div>
            {clientMetrics.react.slowRenders.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Slow Renders:</h4>
                <div className="space-y-1">
                  {clientMetrics.react.slowRenders.slice(-5).map((render, i) => (
                    <div key={i} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                      <span>{render.component}</span>
                      <span className="text-yellow-600 dark:text-yellow-400">{render.duration}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Recommendations */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Performance Recommendations</h3>
            <div className="space-y-3">
              {performanceMonitor.getRecommendations().map((rec, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    rec.type === 'error'
                      ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
                      : rec.type === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20'
                      : 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {rec.type === 'error' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : rec.type === 'warning' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-medium ${
                            rec.type === 'error'
                              ? 'text-red-800 dark:text-red-300'
                              : rec.type === 'warning'
                              ? 'text-yellow-800 dark:text-yellow-300'
                              : 'text-green-800 dark:text-green-300'
                          }`}
                        >
                          {rec.metric}
                        </h4>
                        <span
                          className={`text-xs font-mono ${
                            rec.type === 'error'
                              ? 'text-red-700 dark:text-red-400'
                              : rec.type === 'warning'
                              ? 'text-yellow-700 dark:text-yellow-400'
                              : 'text-green-700 dark:text-green-400'
                          }`}
                        >
                          {rec.value}
                        </span>
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          rec.type === 'error'
                            ? 'text-red-700 dark:text-red-300'
                            : rec.type === 'warning'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}
                      >
                        {rec.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
