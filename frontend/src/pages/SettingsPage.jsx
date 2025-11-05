import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import AccountsLayout from '../components/layout/AccountsLayout'
import XeroConnection from '../components/settings/XeroConnection'
import OneDriveConnection from '../components/settings/OneDriveConnection'
import FolderTemplatesTab from '../components/settings/FolderTemplatesTab'

export default function SettingsPage() {
  return (
    <AccountsLayout>
      <TabGroup>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <TabList className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 max-w-md">
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
              Folder Templates
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
              </div>
            </div>
          </TabPanel>

          {/* Folder Templates Tab */}
          <TabPanel>
            <div className="px-4 sm:px-6 lg:px-8 py-10">
              <FolderTemplatesTab />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </AccountsLayout>
  )
}
