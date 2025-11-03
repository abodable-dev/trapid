import { useState, useEffect, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { api } from '../api'
import { formatCurrency, formatPercentage } from '../utils/formatters'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Active Jobs', href: '/active-jobs', icon: BriefcaseIcon },
  { name: 'Tables', href: '/dashboard', icon: FolderIcon },
]

const tabs = [
  { name: 'Overview', href: '#overview', current: true },
  { name: 'Activity', href: '#activity', current: false },
  { name: 'Budget', href: '#budget', current: false },
  { name: 'Schedule', href: '#schedule', current: false },
  { name: 'Documents', href: '#documents', current: false },
  { name: 'Team', href: '#team', current: false },
  { name: 'Settings', href: '#settings', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex h-screen items-center justify-center">
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
    <>
      <div>
        {/* Mobile sidebar */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Trapid</span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                            >
                              <item.icon aria-hidden="true" className="size-6 shrink-0" />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Trapid</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                        >
                          <item.icon aria-hidden="true" className="size-6 shrink-0" />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-400 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            {/* Separator */}
            <div aria-hidden="true" className="h-6 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form action="#" method="GET" className="flex flex-1">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full">
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  />
                  <input
                    id="search-field"
                    name="search"
                    type="search"
                    placeholder="Search..."
                    className="block size-full border-0 py-0 pl-8 pr-0 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm bg-transparent"
                  />
                </div>
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                </button>

                <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-800" />

                <div className="relative">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                    <span className="text-sm font-medium text-white">U</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-8">
                <div className="flex items-center gap-x-3 mb-4">
                  <button
                    onClick={() => navigate('/active-jobs')}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    ← Back to Active Jobs
                  </button>
                </div>
                <div className="flex items-center gap-x-4">
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
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-800">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
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

              {/* Content */}
              <div className="mt-8">
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
          </main>
        </div>
      </div>
    </>
  )
}
