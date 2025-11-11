import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { RocketLaunchIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import AccountsLayout from '../components/layout/AccountsLayout'
import { api } from '../api'
import XeroConnection from '../components/settings/XeroConnection'
import OneDriveConnection from '../components/settings/OneDriveConnection'
import OutlookConnection from '../components/settings/OutlookConnection'
import FolderTemplatesTab from '../components/settings/FolderTemplatesTab'
import ScheduleTemplateEditor from '../components/schedule-master/ScheduleTemplateEditor'
import XeroFieldMappingTab from '../components/settings/XeroFieldMappingTab'
import TablesTab from '../components/settings/TablesTab'
import SchemaPage from './SchemaPage'
import DocumentationCategoriesTab from '../components/settings/DocumentationCategoriesTab'
import UserManagementTab from '../components/settings/UserManagementTab'
import SupervisorChecklistTab from '../components/settings/SupervisorChecklistTab'
import WorkflowAdminPage from './WorkflowAdminPage'

export default function SettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Map tab names to indices
  const tabs = ['integrations', 'users', 'workflows', 'folder-templates', 'schedule-master', 'documentation', 'supervisor-checklist', 'xero', 'tables', 'schema', 'deployment']

  // Get initial tab index from URL query parameter
  const getInitialTabIndex = () => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    const index = tabs.indexOf(tab)
    return index >= 0 ? index : 0
  }

  const [selectedIndex, setSelectedIndex] = useState(getInitialTabIndex())
  const [isPullingData, setIsPullingData] = useState(false)
  const [pullStatus, setPullStatus] = useState(null)
  const [syncingType, setSyncingType] = useState(null) // Track which individual sync is in progress
  const [syncStatus, setSyncStatus] = useState({}) // Track status for each sync type

  // Update URL when tab changes
  const handleTabChange = (index) => {
    setSelectedIndex(index)
    const tabName = tabs[index]
    navigate(`/settings?tab=${tabName}`, { replace: true })
  }

  // Update selected tab when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newIndex = getInitialTabIndex()
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex)
    }
  }, [location.search])

  // Handle pull from local
  const handlePullFromLocal = async () => {
    if (!confirm('This will delete existing documentation categories, supervisor checklists, and schedule templates, and update/create users from your local development environment. Are you sure?')) {
      return
    }

    setIsPullingData(true)
    setPullStatus(null)

    try {
      const response = await api.post('/api/v1/setup/pull_from_local')
      setPullStatus({
        type: 'success',
        message: response.data.message,
        counts: response.data.counts
      })
    } catch (error) {
      console.error('Error pulling setup data:', error)
      setPullStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to pull setup data from local'
      })
    } finally {
      setIsPullingData(false)
    }
  }

  // Handle individual sync
  const handleIndividualSync = async (type, endpoint, confirmMessage) => {
    if (!confirm(confirmMessage)) {
      return
    }

    setSyncingType(type)
    setSyncStatus(prev => ({ ...prev, [type]: null }))

    try {
      const response = await api.post(endpoint)
      setSyncStatus(prev => ({
        ...prev,
        [type]: {
          type: 'success',
          message: response.data.message,
          count: response.data.count || response.data.counts
        }
      }))
    } catch (error) {
      console.error(`Error syncing ${type}:`, error)
      setSyncStatus(prev => ({
        ...prev,
        [type]: {
          type: 'error',
          message: error.response?.data?.error || `Failed to sync ${type}`
        }
      }))
    } finally {
      setSyncingType(null)
    }
  }

  return (
    <AccountsLayout>
      <TabGroup selectedIndex={selectedIndex} onChange={handleTabChange}>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <TabList className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 max-w-2xl">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Integrations
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Users
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Workflows
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Folder Templates
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Schedule Master
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Documentation
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Supervisor Checklist
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Xero
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Tables
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Schema
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              Deployment
            </Tab>
          </TabList>
        </div>

        <TabPanels>
          {/* Integrations Tab */}
          <TabPanel>
            <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
              <div>
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Integrations</h2>
                <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
                  Connect third-party services to sync data and automate workflows.
                </p>
              </div>

              <div className="md:col-span-2 space-y-6">
                <XeroConnection />
                <OneDriveConnection />
                <OutlookConnection />
              </div>
            </div>
          </TabPanel>

          {/* Users Tab */}
          <TabPanel>
            <div className="px-4 sm:px-6 lg:px-8 py-10">
              <UserManagementTab />
            </div>
          </TabPanel>

          {/* Workflows Tab */}
          <TabPanel>
            <div className="px-4 sm:px-6 lg:px-8 py-10">
              <WorkflowAdminPage />
            </div>
          </TabPanel>

          {/* Folder Templates Tab */}
          <TabPanel>
            <div className="px-4 sm:px-6 lg:px-8 py-10">
              <FolderTemplatesTab />
            </div>
          </TabPanel>

          {/* Schedule Master Templates Tab */}
          <TabPanel>
            <ScheduleTemplateEditor />
          </TabPanel>

          {/* Documentation Categories Tab */}
          <TabPanel>
            <DocumentationCategoriesTab />
          </TabPanel>

          {/* Supervisor Checklist Tab */}
          <TabPanel>
            <SupervisorChecklistTab />
          </TabPanel>

          {/* Xero Tab */}
          <TabPanel>
            <XeroFieldMappingTab />
          </TabPanel>

          {/* Tables Tab */}
          <TabPanel>
            <TablesTab />
          </TabPanel>

          {/* Schema Tab */}
          <TabPanel>
            <SchemaPage />
          </TabPanel>

          {/* Deployment Tab */}
          <TabPanel>
            <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
              <div>
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Deployment</h2>
                <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
                  Manage your application deployments and view deployment status.
                </p>
              </div>

              <div className="md:col-span-2 space-y-6">
                {/* Setup Data Sync Card */}
                <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
                  <dl className="flex flex-wrap">
                    <div className="flex-auto pl-6 pt-6">
                      <dt className="text-sm/6 font-semibold text-gray-900 dark:text-white">Setup Data Sync</dt>
                      <dd className="mt-1 text-base/6 font-semibold text-gray-900 dark:text-white">Pull from Local</dd>
                    </div>
                    <div className="flex-none self-end px-6 pt-4">
                      <ArrowDownTrayIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 dark:border-white/10 px-6 pt-6">
                      <dt className="flex-none">
                        <span className="sr-only">Description</span>
                      </dt>
                      <dd className="text-sm/6 text-gray-500 dark:text-gray-400">
                        Sync setup data from your local development environment to staging. This will delete existing documentation categories, supervisor checklists, and schedule templates, and update/create users from local data.
                      </dd>
                    </div>
                    {pullStatus && (
                      <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                        <div className={`rounded-md p-4 w-full ${pullStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                          <div className="flex">
                            <div className="flex-shrink-0">
                              {pullStatus.type === 'success' ? (
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className={`text-sm font-medium ${pullStatus.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                {pullStatus.message}
                              </p>
                              {pullStatus.counts && (
                                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>Users: {pullStatus.counts.users}</li>
                                    <li>Documentation Categories: {pullStatus.counts.documentation_categories}</li>
                                    <li>Supervisor Checklists: {pullStatus.counts.supervisor_checklist_templates}</li>
                                    <li>Schedule Templates: {pullStatus.counts.schedule_templates}</li>
                                    <li>Template Rows: {pullStatus.counts.schedule_template_rows}</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex w-full flex-none gap-x-4 px-6 pb-6">
                      <button
                        onClick={handlePullFromLocal}
                        disabled={isPullingData}
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPullingData ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Pulling Data...
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Pull All Data
                          </>
                        )}
                      </button>
                    </div>
                  </dl>
                </div>

                {/* Individual Sync Cards */}
                <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
                  <div className="px-6 py-6">
                    <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white mb-4">Individual Data Sync</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Sync specific data types individually from your local development environment.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Users Sync */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Users</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update/create users</p>
                          </div>
                        </div>
                        {syncStatus.users && (
                          <div className={`mb-3 text-xs p-2 rounded ${syncStatus.users.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {syncStatus.users.message}
                            {syncStatus.users.count && <span className="ml-1 font-medium">({syncStatus.users.count})</span>}
                          </div>
                        )}
                        <button
                          onClick={() => handleIndividualSync('users', '/api/v1/setup/sync_users', 'This will update existing users and create new ones from local data. Continue?')}
                          disabled={syncingType === 'users'}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {syncingType === 'users' ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Syncing...
                            </>
                          ) : (
                            <>
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              Sync Users
                            </>
                          )}
                        </button>
                      </div>

                      {/* Documentation Categories Sync */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Documentation Categories</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Replace all categories</p>
                          </div>
                        </div>
                        {syncStatus.documentation_categories && (
                          <div className={`mb-3 text-xs p-2 rounded ${syncStatus.documentation_categories.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {syncStatus.documentation_categories.message}
                            {syncStatus.documentation_categories.count && <span className="ml-1 font-medium">({syncStatus.documentation_categories.count})</span>}
                          </div>
                        )}
                        <button
                          onClick={() => handleIndividualSync('documentation_categories', '/api/v1/setup/sync_documentation_categories', 'This will DELETE all existing documentation categories and replace them with local data. Continue?')}
                          disabled={syncingType === 'documentation_categories'}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {syncingType === 'documentation_categories' ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Syncing...
                            </>
                          ) : (
                            <>
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              Sync Categories
                            </>
                          )}
                        </button>
                      </div>

                      {/* Supervisor Checklists Sync */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Supervisor Checklists</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Replace all templates</p>
                          </div>
                        </div>
                        {syncStatus.supervisor_checklists && (
                          <div className={`mb-3 text-xs p-2 rounded ${syncStatus.supervisor_checklists.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {syncStatus.supervisor_checklists.message}
                            {syncStatus.supervisor_checklists.count && <span className="ml-1 font-medium">({syncStatus.supervisor_checklists.count})</span>}
                          </div>
                        )}
                        <button
                          onClick={() => handleIndividualSync('supervisor_checklists', '/api/v1/setup/sync_supervisor_checklists', 'This will DELETE all existing supervisor checklist templates and replace them with local data. Continue?')}
                          disabled={syncingType === 'supervisor_checklists'}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {syncingType === 'supervisor_checklists' ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Syncing...
                            </>
                          ) : (
                            <>
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              Sync Checklists
                            </>
                          )}
                        </button>
                      </div>

                      {/* Schedule Templates Sync */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Schedule Templates</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Replace all templates & rows</p>
                          </div>
                        </div>
                        {syncStatus.schedule_templates && (
                          <div className={`mb-3 text-xs p-2 rounded ${syncStatus.schedule_templates.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {syncStatus.schedule_templates.message}
                            {syncStatus.schedule_templates.count && (
                              <div className="mt-1">
                                {typeof syncStatus.schedule_templates.count === 'object' ? (
                                  <>Templates: {syncStatus.schedule_templates.count.templates}, Rows: {syncStatus.schedule_templates.count.rows}</>
                                ) : (
                                  <span className="ml-1 font-medium">({syncStatus.schedule_templates.count})</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => handleIndividualSync('schedule_templates', '/api/v1/setup/sync_schedule_templates', 'This will DELETE all existing schedule templates and rows and replace them with local data. Continue?')}
                          disabled={syncingType === 'schedule_templates'}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {syncingType === 'schedule_templates' ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Syncing...
                            </>
                          ) : (
                            <>
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              Sync Templates
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vercel Dashboard Card */}
                <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
                  <dl className="flex flex-wrap">
                    <div className="flex-auto pl-6 pt-6">
                      <dt className="text-sm/6 font-semibold text-gray-900 dark:text-white">Vercel Dashboard</dt>
                      <dd className="mt-1 text-base/6 font-semibold text-gray-900 dark:text-white">Frontend Deployment</dd>
                    </div>
                    <div className="flex-none self-end px-6 pt-4">
                      <RocketLaunchIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 dark:border-white/10 px-6 pt-6">
                      <dt className="flex-none">
                        <span className="sr-only">Status</span>
                      </dt>
                      <dd className="text-sm/6 text-gray-500 dark:text-gray-400">
                        View deployment status, build logs, and manage your frontend deployments on Vercel.
                      </dd>
                    </div>
                    <div className="mt-4 flex w-full flex-none gap-x-4 px-6 pb-6">
                      <a
                        href="https://vercel.com/abodable-dev/trapid"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Open Vercel Dashboard
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </AccountsLayout>
  )
}
