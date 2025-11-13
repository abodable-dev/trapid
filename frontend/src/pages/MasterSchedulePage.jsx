import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChartBarIcon, TableCellsIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import DHtmlxGanttView from '../components/schedule-master/DHtmlxGanttView'
import TaskTable from '../components/gantt/TaskTable'
import Toast from '../components/Toast'

export default function MasterSchedulePage() {
  const { id } = useParams() // Get job/construction ID from URL
  const [construction, setConstruction] = useState(null)
  const [project, setProject] = useState(null)
  const [scheduleData, setScheduleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('gantt') // 'gantt' or 'table'
  const [showGanttView, setShowGanttView] = useState(false)
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadConstructionAndSchedule()
  }, [id])

  const loadConstructionAndSchedule = async () => {
    try {
      setLoading(true)

      // Load construction/job details
      const constructionResponse = await api.get(`/api/v1/constructions/${id}`)
      setConstruction(constructionResponse.construction)

      // Find the project for this construction
      const projectsResponse = await api.get('/api/v1/projects')
      const jobProject = projectsResponse.projects?.find(p => p.construction_id === parseInt(id))

      if (jobProject) {
        setProject(jobProject)

        // Load the Gantt schedule for this project
        const scheduleResponse = await api.get(`/api/v1/projects/${jobProject.id}/gantt`)
        setScheduleData(scheduleResponse)
      } else {
        setError('No schedule found for this job')
      }
    } catch (err) {
      console.error('Failed to load schedule:', err)
      setError('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId, field, value) => {
    if (!project || saving) return

    // Store original data for rollback
    const originalTasks = [...scheduleData.tasks]

    // Optimistic update - update UI immediately
    const updatedTasks = scheduleData.tasks.map(task => {
      if (task.id === taskId) {
        // Map frontend field names to backend field names if needed
        const fieldMapping = {
          'planned_start_date': 'start_date',
          'planned_end_date': 'end_date',
          'duration_days': 'duration',
          'progress_percentage': 'progress',
          'assigned_to': 'assigned_to',
          'supplier': 'supplier'
        }

        const displayField = fieldMapping[field] || field
        return { ...task, [displayField]: value }
      }
      return task
    })

    setScheduleData({ ...scheduleData, tasks: updatedTasks })

    try {
      setSaving(true)

      // Make API call
      const response = await api.patch(`/api/v1/projects/${project.id}/tasks/${taskId}`, {
        project_task: { [field]: value }
      })

      if (response.success) {
        // Show success toast
        setToast({ type: 'success', message: 'Task updated successfully' })

        // Re-fetch the schedule to ensure consistency
        const scheduleResponse = await api.get(`/api/v1/projects/${project.id}/gantt`)
        setScheduleData(scheduleResponse)
      } else {
        throw new Error(response.errors?.join(', ') || 'Update failed')
      }
    } catch (err) {
      console.error('Failed to update task:', err)

      // Rollback on error
      setScheduleData({ ...scheduleData, tasks: originalTasks })

      // Show error toast
      setToast({
        type: 'error',
        message: err.message || 'Failed to update task. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading schedule...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="py-6">
        <header>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 transition-colors"
                title="Back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-900">
                  Master Schedule
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="px-4 sm:px-6 lg:px-8">
            {/* View Toggle */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewMode('gantt')
                    setShowGanttView(true)
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    viewMode === 'gantt'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5" />
                  Gantt Chart
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <TableCellsIcon className="h-5 w-5" />
                  Table View
                </button>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                  {scheduleData?.tasks?.length || 0} tasks
                </p>
              </div>
            </div>

            {/* Table View */}
            <div className="mt-4">
              {scheduleData && scheduleData.tasks && viewMode === 'table' && (
                <TaskTable
                  tasks={scheduleData.tasks}
                  onTaskUpdate={handleTaskUpdate}
                  saving={saving}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* DHtmlx Gantt View Modal */}
      {showGanttView && scheduleData && scheduleData.tasks && (
        <DHtmlxGanttView
          isOpen={showGanttView}
          onClose={() => {
            setShowGanttView(false)
            setViewMode('table')
          }}
          tasks={scheduleData.tasks}
          onUpdateTask={async (taskId, updates) => {
            // Handle task updates from Gantt
            for (const [field, value] of Object.entries(updates)) {
              await handleTaskUpdate(taskId, field, value)
            }
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
