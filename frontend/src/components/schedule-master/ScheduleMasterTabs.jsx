import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import ScheduleTemplateEditor from './ScheduleTemplateEditor'
import BugHunterTests from '../settings/BugHunterTests'
import NewFeaturesTab from './NewFeaturesTab'

export default function ScheduleMasterTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  // Map sub-tab names to indices
  const subTabs = ['setup', 'bug-hunter', 'new-features']

  // Get initial tab index from URL query parameter
  const getInitialTabIndex = () => {
    const params = new URLSearchParams(location.search)
    const subTab = params.get('subtab')
    const index = subTabs.indexOf(subTab)
    return index >= 0 ? index : 0
  }

  const [selectedIndex, setSelectedIndex] = useState(getInitialTabIndex())

  // Update URL when sub-tab changes
  const handleTabChange = (index) => {
    setSelectedIndex(index)
    const params = new URLSearchParams(location.search)
    params.set('subtab', subTabs[index])
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
  }

  // Update selected tab when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newIndex = getInitialTabIndex()
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  return (
    <div className="h-full flex flex-col">
      <TabGroup selectedIndex={selectedIndex} onChange={handleTabChange} className="h-full flex flex-col">
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
                New Features
              </Tab>
            </TabList>
          </div>
        </div>

        <TabPanels className="flex-1 overflow-auto">
          {/* Schedule Master Setup Tab */}
          <TabPanel className="h-full">
            <ScheduleTemplateEditor />
          </TabPanel>

          {/* Bug Hunter Tests Tab */}
          <TabPanel className="h-full overflow-auto">
            <BugHunterTests />
          </TabPanel>

          {/* New Features Tab */}
          <TabPanel className="h-full">
            <NewFeaturesTab />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}