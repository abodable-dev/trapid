import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChartBarIcon, TableCellsIcon, ArrowLeftIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import Toast from '../components/Toast'

// Placeholder for future components
const SmGanttChart = ({ tasks, dependencies, onTaskUpdate }) => (
  <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="text-center text-gray-500 dark:text-gray-400">
      <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium">SM Gantt Chart</p>
      <p className="text-sm mt-2">Phase 1.4 - Coming Soon</p>
      <p className="text-xs mt-1">{tasks?.length || 0} tasks loaded</p>
    </div>
  </div>
)

const SmTaskList = ({ tasks, onTaskClick, onStatusChange }) => (
  <div className="h-full overflow-auto">
    {tasks?.length > 0 ? (
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lock</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map(task => (
            <tr
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                task.is_hold_task ? 'bg-red-50 dark:bg-red-900/20' : ''
              }`}
            >
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{task.task_number}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <div className="flex items-center gap-2">
                  {task.is_hold_task && <PauseIcon className="h-4 w-4 text-red-500" />}
                  <span className={task.is_hold_task ? 'text-red-600 font-medium' : ''}>
                    {task.name}
                  </span>
                </div>
                {task.hold_reason && (
                  <div className="text-xs text-red-500 mt-0.5">{task.hold_reason}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  task.status === 'started' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {task.status?.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{task.start_date}</td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{task.end_date}</td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{task.duration_days}d</td>
              <td className="px-4 py-3">
                {task.locked && (
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    task.lock_type === 'supplier_confirm' ? 'bg-purple-100 text-purple-800' :
                    task.lock_type === 'confirm' ? 'bg-blue-100 text-blue-800' :
                    task.lock_type === 'started' ? 'bg-yellow-100 text-yellow-800' :
                    task.lock_type === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.lock_type?.replace('_', ' ')}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <TableCellsIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tasks found</p>
          <p className="text-sm mt-2">Create tasks from a schedule template</p>
        </div>
      </div>
    )}
  </div>
)

export default function SmGanttPage() {
  const { id } = useParams() // Get job/construction ID from URL
  const navigate = useNavigate()
  const [construction, setConstruction] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'gantt' or 'table'
  const [toast, setToast] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load construction details
      const constructionResponse = await api.get(`/api/v1/constructions/${id}`)
      setConstruction(constructionResponse.construction)

      // Load SM tasks
      const tasksResponse = await api.get(`/api/v1/constructions/${id}/sm_tasks`)
      setTasks(tasksResponse.sm_tasks || [])
    } catch (err) {
      console.error('Failed to load SM Gantt data:', err)
      setError('Failed to load schedule data')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    // Future: Open task detail modal
  }

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await api.patch(`/api/v1/sm_tasks/${taskId}`, { sm_task: updates })
      setToast({ type: 'success', message: 'Task updated' })
      loadData() // Refresh
    } catch (err) {
      console.error('Failed to update task:', err)
      setToast({ type: 'error', message: 'Failed to update task' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                SM Gantt - {construction?.title || 'Loading...'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Schedule Master v2 - {tasks.length} tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <TableCellsIcon className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'gantt'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ChartBarIcon className="h-4 w-4" />
                Gantt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4">
        {viewMode === 'gantt' ? (
          <SmGanttChart
            tasks={tasks}
            dependencies={[]}
            onTaskUpdate={handleTaskUpdate}
          />
        ) : (
          <SmTaskList
            tasks={tasks}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
