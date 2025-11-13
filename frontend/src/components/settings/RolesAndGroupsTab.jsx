import { useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import UserManagementTab from './UserManagementTab'
import RolesManagement from './RolesManagement'
import GroupsManagement from './GroupsManagement'
import ContactRolesManagement from './ContactRolesManagement'

export default function RolesAndGroupsTab() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
      <TabList className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
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
          User Roles
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
          Groups
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
          Contact Roles
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <UserManagementTab />
        </TabPanel>
        <TabPanel>
          <RolesManagement />
        </TabPanel>
        <TabPanel>
          <GroupsManagement />
        </TabPanel>
        <TabPanel>
          <ContactRolesManagement />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  )
}
