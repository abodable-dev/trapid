import { useState, useMemo } from 'react'
import { Menu } from '@headlessui/react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import GanttHeader from './GanttHeader'
import GanttGrid from './GanttGrid'
import TaskRow from './TaskRow'
import { getProjectDateRange } from './utils/dateCalculations'

/**
 * GanttChart - Main Gantt chart container
 * Implements Tailwind UI calendar design patterns with Monday.com's grid-based layout
 */
export default function GanttChart({ tasks = [], projectInfo = {}, colorBy = 'status', colorConfig = {} }) {
  const [zoomLevel, setZoomLevel] = useState('weeks') // days, weeks, months
  const [showWeekends, setShowWeekends] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate pixels per day based on zoom level
  const pixelsPerDay = useMemo(() => {
    return zoomLevel === 'days' ? 40 :
           zoomLevel === 'weeks' ? 6 :
           2 // months
  }, [zoomLevel])

  // Get project date range
  const { startDate: projectStartDate, endDate: projectEndDate } = useMemo(() => {
    if (projectInfo.start_date && projectInfo.end_date) {
      return {
        startDate: new Date(projectInfo.start_date),
        endDate: new Date(projectInfo.end_date)
      }
    }
    return getProjectDateRange(tasks)
  }, [tasks, projectInfo])

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500">
            This project doesn't have any tasks yet.
          </p>
        </div>
      </div>
    )
  }

  // Navigation functions
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate)
    if (zoomLevel === 'days') {
      newDate.setDate(newDate.getDate() - 7)
    } else if (zoomLevel === 'weeks') {
      newDate.setDate(newDate.getDate() - 28)
    } else {
      newDate.setMonth(newDate.getMonth() - 3)
    }
    setCurrentDate(newDate)
  }

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate)
    if (zoomLevel === 'days') {
      newDate.setDate(newDate.getDate() + 7)
    } else if (zoomLevel === 'weeks') {
      newDate.setDate(newDate.getDate() + 28)
    } else {
      newDate.setMonth(newDate.getMonth() + 3)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Epic Toolbar - Inspired by Tailwind UI Calendar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousPeriod}
              className="flex items-center justify-center rounded-md p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Previous period"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goToNextPeriod}
              className="flex items-center justify-center rounded-md p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Next period"
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Task Count */}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher with Headless UI Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {zoomLevel === 'days' ? 'Day view' : zoomLevel === 'weeks' ? 'Week view' : 'Month view'}
              <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setZoomLevel('days')}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } ${
                        zoomLevel === 'days' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-900 dark:text-gray-100'
                      } block w-full px-4 py-2 text-left text-sm transition-colors`}
                    >
                      Day view
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setZoomLevel('weeks')}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } ${
                        zoomLevel === 'weeks' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-900 dark:text-gray-100'
                      } block w-full px-4 py-2 text-left text-sm transition-colors`}
                    >
                      Week view
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setZoomLevel('months')}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } ${
                        zoomLevel === 'months' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-900 dark:text-gray-100'
                      } block w-full px-4 py-2 text-left text-sm transition-colors`}
                    >
                      Month view
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>

      {/* Gantt Chart Content */}
      <div className="overflow-auto" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
        {/* Header */}
        <GanttHeader
          projectStartDate={projectStartDate}
          projectEndDate={projectEndDate}
          pixelsPerDay={pixelsPerDay}
          zoomLevel={zoomLevel}
        />

        {/* Task Rows with Grid */}
        <div className="relative">
          <GanttGrid
            projectStartDate={projectStartDate}
            projectEndDate={projectEndDate}
            pixelsPerDay={pixelsPerDay}
            zoomLevel={zoomLevel}
            taskCount={tasks.length}
          />

          {/* Tasks */}
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              projectStartDate={projectStartDate}
              projectEndDate={projectEndDate}
              pixelsPerDay={pixelsPerDay}
              colorBy={colorBy}
              colorConfig={colorConfig}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-6 text-xs">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#C4C4C4' }} />
            <span className="text-gray-600 dark:text-gray-400">Not Started</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#579BFC' }} />
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#00C875' }} />
            <span className="text-gray-600 dark:text-gray-400">Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#E44258' }} />
            <span className="text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  )
}
