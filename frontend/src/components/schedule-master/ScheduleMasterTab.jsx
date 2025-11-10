import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'
import ScheduleImporter from './ScheduleImporter'
import ScheduleStats from './ScheduleStats'
import ScheduleTaskList from './ScheduleTaskList'
import ScheduleGanttChart from './ScheduleGanttChart'
import TaskMatchModal from './TaskMatchModal'
import AddScheduleTaskModal from './AddScheduleTaskModal'
import Toast from '../Toast'

export default function ScheduleMasterTab({ constructionId }) {
  const [scheduleTasks, setScheduleTasks] = useState([])
  const [matchedCount, setMatchedCount] = useState(0)
  const [unmatchedCount, setUnmatchedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [toast, setToast] = useState(null)
  const [ganttData, setGanttData] = useState(null)

  // Load schedule tasks on mount
  useEffect(() => {
    loadScheduleTasks()
  }, [constructionId])

  // Load gantt data when matched count changes
  useEffect(() => {
    if (matchedCount > 0) {
      loadGanttData()
    }
  }, [matchedCount])

  const loadScheduleTasks = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/constructions/${constructionId}/schedule_tasks`)
      setScheduleTasks(response.schedule_tasks || [])
      setMatchedCount(response.matched_count || 0)
      setUnmatchedCount(response.unmatched_count || 0)
      setTotalCount(response.total_count || 0)
    } catch (err) {
      console.error('Failed to load schedule tasks:', err)
      showToast('Failed to load schedule tasks', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadGanttData = async () => {
    try {
      const response = await api.get(`/api/v1/constructions/${constructionId}/schedule_tasks/gantt_data`)
      setGanttData(response)
    } catch (err) {
      console.error('Failed to load gantt data:', err)
    }
  }

  const handleImportSuccess = async () => {
    showToast('Schedule imported successfully!', 'success')
    await loadScheduleTasks()
  }

  const handleMatchTask = (task) => {
    setSelectedTask(task)
    setShowMatchModal(true)
  }

  const handleMatchConfirm = async (purchaseOrderId) => {
    try {
      await api.patch(`/api/v1/schedule_tasks/${selectedTask.id}/match_po`, {
        purchase_order_id: purchaseOrderId
      })
      showToast('Task matched to purchase order', 'success')
      await loadScheduleTasks()
      setShowMatchModal(false)
      setSelectedTask(null)
    } catch (err) {
      console.error('Failed to match task:', err)
      showToast('Failed to match task to purchase order', 'error')
    }
  }

  const handleUnmatch = async (taskId) => {
    if (!confirm('Are you sure you want to unmatch this task?')) return

    try {
      await api.delete(`/api/v1/schedule_tasks/${taskId}/unmatch_po`)
      showToast('Task unmatched from purchase order', 'success')
      await loadScheduleTasks()
    } catch (err) {
      console.error('Failed to unmatch task:', err)
      showToast('Failed to unmatch task', 'error')
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      await api.post(`/api/v1/constructions/${constructionId}/schedule_tasks`, {
        schedule_task: taskData
      })
      showToast('Task added successfully!', 'success')
      await loadScheduleTasks()
      setShowAddTaskModal(false)
    } catch (err) {
      console.error('Failed to add task:', err)
      throw err
    }
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Empty state - no schedule imported yet
  if (!loading && totalCount === 0) {
    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Schedule Master</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Import tasks from a spreadsheet or add them manually
            </p>
          </div>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>
        <ScheduleImporter
          constructionId={constructionId}
          onImportSuccess={handleImportSuccess}
        />

        {/* Add Task Modal */}
        <AddScheduleTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onSave={handleAddTask}
          constructionId={constructionId}
        />

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <ScheduleStats
        matchedCount={matchedCount}
        unmatchedCount={unmatchedCount}
        totalCount={totalCount}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowAddTaskModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Task
        </button>
        <ScheduleImporter
          constructionId={constructionId}
          onImportSuccess={handleImportSuccess}
          compact
        />
      </div>

      {/* Task List with Matching */}
      <ScheduleTaskList
        tasks={scheduleTasks}
        loading={loading}
        onMatchTask={handleMatchTask}
        onUnmatch={handleUnmatch}
      />

      {/* Gantt Chart (only show if tasks are matched) */}
      {matchedCount > 0 && ganttData && (
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timeline View
            </h3>
            <ScheduleGanttChart ganttData={ganttData} />
          </div>
        </div>
      )}

      {/* Match Modal */}
      {showMatchModal && selectedTask && (
        <TaskMatchModal
          isOpen={showMatchModal}
          onClose={() => {
            setShowMatchModal(false)
            setSelectedTask(null)
          }}
          onConfirm={handleMatchConfirm}
          task={selectedTask}
          constructionId={constructionId}
        />
      )}

      {/* Add Task Modal */}
      <AddScheduleTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSave={handleAddTask}
        constructionId={constructionId}
      />

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
