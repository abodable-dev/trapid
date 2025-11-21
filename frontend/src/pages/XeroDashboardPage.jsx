import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LinkIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import api from '../api'

export default function XeroDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState([])
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load companies
      const companiesResponse = await api.get('/api/v1/companies')
      setCompanies(companiesResponse.companies || [])

      // Load Xero connections
      const connectionsResponse = await api.get('/api/v1/company_xero_connections')
      setConnections(connectionsResponse.connections || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectCompany = async (companyId) => {
    try {
      // Initiate OAuth flow
      const response = await api.get('/api/v1/xero/auth_url', {
        params: { company_id: companyId }
      })

      if (response.auth_url) {
        window.location.href = response.auth_url
      }
    } catch (error) {
      console.error('Failed to initiate Xero connection:', error)
      alert('Failed to connect to Xero. Please try again.')
    }
  }

  const handleDisconnect = async (connectionId) => {
    if (!confirm('Are you sure you want to disconnect from Xero? This will remove all synced data.')) {
      return
    }

    try {
      await api.delete(`/api/v1/company_xero_connections/${connectionId}`)
      await loadData()
    } catch (error) {
      console.error('Failed to disconnect:', error)
      alert('Failed to disconnect. Please try again.')
    }
  }

  const handleSync = async (connectionId) => {
    try {
      await api.post(`/api/v1/company_xero_connections/${connectionId}/sync`)
      alert('Sync started successfully')
      await loadData()
    } catch (error) {
      console.error('Failed to sync:', error)
      alert('Failed to sync. Please try again.')
    }
  }

  const getConnectionStatus = (connection) => {
    if (!connection.token_expires_at) return 'unknown'

    const expiresAt = new Date(connection.token_expires_at)
    const now = new Date()

    if (expiresAt < now) return 'expired'
    if (connection.last_sync_at) return 'connected'
    return 'pending'
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircleIcon,
          text: 'Connected'
        }
      case 'expired':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircleIcon,
          text: 'Expired'
        }
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: ExclamationTriangleIcon,
          text: 'Pending Sync'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: ExclamationTriangleIcon,
          text: 'Unknown'
        }
    }
  }

  const connectedCompanyIds = new Set(connections.map(c => c.company_id))
  const unconnectedCompanies = companies.filter(c => !connectedCompanyIds.has(c.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading Xero connections...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Xero Integration</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage Xero connections and sync financial data
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Companies
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {companies.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Connected
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {connections.filter(c => getConnectionStatus(c) === 'connected').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Needs Attention
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {connections.filter(c => getConnectionStatus(c) === 'expired').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Companies */}
      {connections.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Companies</h2>
            <div className="space-y-4">
              {connections.map((connection) => {
                const status = getConnectionStatus(connection)
                const badge = getStatusBadge(status)
                const StatusIcon = badge.icon

                return (
                  <div
                    key={connection.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900">
                              {connection.company?.name || 'Unknown Company'}
                            </h3>
                            <span className={`ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {badge.text}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {connection.tenant_name && (
                              <span>Xero Org: {connection.tenant_name}</span>
                            )}
                            {connection.last_sync_at && (
                              <span className="ml-4">
                                Last synced: {new Date(connection.last_sync_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleSync(connection.id)}
                          disabled={status === 'expired'}
                          className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Sync
                        </button>
                        <button
                          onClick={() => navigate(`/corporate/companies/${connection.company_id}`)}
                          className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          View Company
                        </button>
                        <button
                          onClick={() => handleDisconnect(connection.id)}
                          className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>

                    {status === 'expired' && (
                      <div className="mt-3 bg-red-50 rounded-md p-3">
                        <p className="text-sm text-red-800">
                          This connection has expired. Please reconnect to continue syncing.
                        </p>
                        <button
                          onClick={() => handleConnectCompany(connection.company_id)}
                          className="mt-2 inline-flex items-center rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                        >
                          Reconnect
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Unconnected Companies */}
      {unconnectedCompanies.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Connect More Companies</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unconnectedCompanies.map((company) => (
                <div
                  key={company.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <BuildingOfficeIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {company.name}
                        </h3>
                        {company.formatted_acn && (
                          <p className="text-xs text-gray-500">ACN: {company.formatted_acn}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectCompany(company.id)}
                    className="mt-3 w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Connect to Xero
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {connections.length === 0 && unconnectedCompanies.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No companies</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add companies first before connecting to Xero.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/corporate/companies/new')}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add Company
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
