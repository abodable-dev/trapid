import { useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import ScheduleTemplateEditor from './ScheduleTemplateEditor'
import BugHunterTests from '../settings/BugHunterTests'

export default function ScheduleMasterTabs() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="h-full">
      <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <TabList className="flex space-x-8 -mb-px">
              <Tab
                className={({ selected }) =>
                  `py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none transition-colors
                  ${
                    selected
                      ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`
                }
              >
                Schedule Master Setup
              </Tab>
              <Tab
                className={({ selected }) =>
                  `py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none transition-colors
                  ${
                    selected
                      ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`
                }
              >
                Bug Hunter Tests
              </Tab>
            </TabList>
          </div>
        </div>

        <TabPanels>
          {/* Schedule Master Setup Tab */}
          <TabPanel>
            <ScheduleTemplateEditor />
          </TabPanel>

          {/* Bug Hunter Tests Tab */}
          <TabPanel>
            <BugHunterTests />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}