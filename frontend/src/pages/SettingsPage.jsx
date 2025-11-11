import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { RocketLaunchIcon } from '@heroicons/react/24/outline'
import AccountsLayout from '../components/layout/AccountsLayout'
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

export default function SettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Map tab names to indices
  const tabs = ['integrations', 'users', 'folder-templates', 'schedule-master', 'documentation', 'supervisor-checklist', 'xero', 'tables', 'schema', 'deployment']

  // Get initial tab index from URL query parameter
  const getInitialTabIndex = () => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    const index = tabs.indexOf(tab)
    return index >= 0 ? index : 0
  }

  const [selectedIndex, setSelectedIndex] = useState(getInitialTabIndex())

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

              <div className="md:col-span-2">
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
