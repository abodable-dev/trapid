import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { api } from '../api'
import { formatCurrency, formatPercentage } from '../utils/formatters'
import ExplorerSidebar from '../components/layout/ExplorerSidebar'

const tabs = [
  { name: 'Overview' },
  { name: 'Activity' },
  { name: 'Budget' },
  { name: 'Schedule' },
  { name: 'Documents' },
  { name: 'Team' },
  { name: 'Settings' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    loadJob()
  }, [id])

  const loadJob = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/constructions/${id}`)
      setJob(response.construction)
    } catch (err) {
      setError('Failed to load job details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <ExplorerSidebar onUploadClick={() => navigate('/import')} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex h-screen overflow-hidden">
        <ExplorerSidebar onUploadClick={() => navigate('/import')} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Job not found'}</p>
            <button
              onClick={() => navigate('/active-jobs')}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Back to Active Jobs
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Contract Value',
      value: job.contract_value ? formatCurrency(job.contract_value, false) : '$0',
      icon: CurrencyDollarIcon
    },
    {
      name: 'Live Profit',
      value: job.live_profit ? formatCurrency(job.live_profit, false) : '$0',
      icon: ChartBarIcon,
      change: job.profit_percentage ? formatPercentage(job.profit_percentage, 2) : '0%',
      changeType: job.profit_percentage >= 0 ? 'positive' : 'negative'
    },
    {
      name: 'Stage',
      value: job.stage || 'Not Set',
      icon: DocumentTextIcon
    },
    {
      name: 'Status',
      value: job.status || 'Unknown',
      icon: BriefcaseIcon
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <ExplorerSidebar onUploadClick={() => navigate('/import')} />

      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-8 py-6">
            <button
              onClick={() => navigate('/active-jobs')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
            >
              ← Back to Active Jobs
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Construction Job #{job.id}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800 -mb-px">
              <nav aria-label="Tabs" className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={classNames(
                      activeTab === tab.name
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                      'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium'
                    )}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                      {stat.change && (
                        <div
                          className={classNames(
                            stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                            'ml-2 flex items-baseline text-sm font-semibold'
                          )}
                        >
                          {stat.change}
                        </div>
                      )}
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Job Details
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.title || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.status || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stage</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.stage || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract Value</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {job.contract_value ? formatCurrency(job.contract_value, false) : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Live Profit</dt>
                      <dd className={`mt-1 text-sm font-medium ${
                        job.live_profit >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {job.live_profit ? formatCurrency(job.live_profit, false) : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Percentage</dt>
                      <dd className={`mt-1 text-sm font-medium ${
                        job.profit_percentage >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {job.profit_percentage ? formatPercentage(job.profit_percentage, 2) : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Activity' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Activity tracking coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Budget' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Budget Management
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Budget tracking coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Schedule' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Project Schedule
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Schedule management coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Project Documents
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Document management coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Team' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Team Members
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Team management coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Job Settings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Settings management coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
