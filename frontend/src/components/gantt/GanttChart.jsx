import { useState, useMemo } from 'react'
import GanttHeader from './GanttHeader'
import GanttGrid from './GanttGrid'
import TaskRow from './TaskRow'
import { getProjectDateRange } from './utils/dateCalculations'

/**
 * GanttChart - Main Gantt chart container
 * Implements Monday.com's grid-based layout with synchronized scrolling
 */
export default function GanttChart({ tasks = [], projectInfo = {} }) {
  const [zoomLevel, setZoomLevel] = useState('weeks') // days, weeks, months
  const [colorBy, setColorBy] = useState('status') // status or category
  const [showWeekends, setShowWeekends] = useState(false)

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Gantt Chart ({tasks.length} tasks)
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel('days')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                zoomLevel === 'days'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Days
            </button>
            <button
              onClick={() => setZoomLevel('weeks')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                zoomLevel === 'weeks'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Weeks
            </button>
            <button
              onClick={() => setZoomLevel('months')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                zoomLevel === 'months'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Months
            </button>
          </div>

          {/* Color By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Color by:</span>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value)}
              className="text-xs border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="status">Status</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gantt Chart Content */}
      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
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
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-6 text-xs">
          <span className="font-medium text-gray-700">Status:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#C4C4C4' }} />
            <span className="text-gray-600">Not Started</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#579BFC' }} />
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00C875' }} />
            <span className="text-gray-600">Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E44258' }} />
            <span className="text-gray-600">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  )
}
