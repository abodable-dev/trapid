import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import api from '../api'

export default function CompaniesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(searchParams.get('group') || 'all')
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all')

  const groups = ['all', 'tekna', 'team_harder', 'promise', 'charity', 'other']
  const statuses = ['all', 'active', 'struck_off', 'in_liquidation', 'dormant']

  useEffect(() => {
    loadCompanies()
  }, [selectedGroup, selectedStatus])

  const loadCompanies = async () => {
    try {
      setLoading(true)

      const params = {}
      if (selectedGroup !== 'all') params.group = selectedGroup
      if (selectedStatus !== 'all') params.status = selectedStatus
      if (searchQuery) params.search = searchQuery

      const response = await api.get('/api/v1/companies', { params })
      setCompanies(response.companies || [])
    } catch (error) {
      console.error('Failed to load companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadCompanies()
  }

  const handleGroupChange = (group) => {
    setSelectedGroup(group)
    if (group === 'all') {
      searchParams.delete('group')
    } else {
      searchParams.set('group', group)
    }
    setSearchParams(searchParams)
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
    if (status === 'all') {
      searchParams.delete('status')
    } else {
      searchParams.set('status', status)
    }
    setSearchParams(searchParams)
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'struck_off':
        return 'bg-red-100 text-red-800'
      case 'in_liquidation':
        return 'bg-yellow-100 text-yellow-800'
      case 'dormant':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatGroup = (group) => {
    if (!group) return ''
    return group.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all corporate entities
          </p>
        </div>
        <div className="mt-3 sm:ml-4 sm:mt-0">
          <button
            onClick={() => navigate('/corporate/companies/new')}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Add Company
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Search */}
          <div className="sm:col-span-1">
            <form onSubmit={handleSearch} className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </form>
          </div>

          {/* Group Filter */}
          <div className="sm:col-span-1">
            <select
              value={selectedGroup}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group === 'all' ? 'All Groups' : formatGroup(group)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-1">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading companies...</div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No companies</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new company.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/corporate/companies/new')}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Add Company
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {companies.map((company) => (
              <li key={company.id}>
                <div
                  onClick={() => navigate(`/corporate/companies/${company.id}`)}
                  className="block hover:bg-gray-50 cursor-pointer"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="truncate text-sm font-medium text-indigo-600">
                          {company.name}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-shrink-0">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(company.status)}`}>
                          {company.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex space-x-6">
                        {company.formatted_acn && (
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium mr-1">ACN:</span> {company.formatted_acn}
                          </p>
                        )}
                        {company.formatted_abn && (
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium mr-1">ABN:</span> {company.formatted_abn}
                          </p>
                        )}
                        {company.company_group && (
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium mr-1">Group:</span> {formatGroup(company.company_group)}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        {company.current_directors && company.current_directors.length > 0 && (
                          <p>
                            {company.current_directors.length} Director{company.current_directors.length !== 1 ? 's' : ''}
                          </p>
                        )}
                        {company.has_xero_connection && (
                          <span className="ml-4 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Xero Connected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Results count */}
      {!loading && companies.length > 0 && (
        <div className="text-sm text-gray-700">
          Showing {companies.length} {companies.length === 1 ? 'company' : 'companies'}
        </div>
      )}
    </div>
  )
}
