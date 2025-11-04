import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import GanttChart from '../components/gantt/GanttChart'
import TaskTable from '../components/gantt/TaskTable'

export default function MasterSchedulePage() {
  const { id } = useParams() // Get job/construction ID from URL
  const [construction, setConstruction] = useState(null)
  const [project, setProject] = useState(null)
  const [scheduleData, setScheduleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('gantt') // 'gantt' or 'table'
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
            onClick={() => navigate(`/jobs/${id}`)}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Back to Job
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                  Master Schedule
                </h1>
                {construction && (
                  <p className="mt-1 text-sm text-gray-500">{construction.title}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate(`/jobs/${id}`)}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Back to Job
              </button>
            </div>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Project Info */}
            {project && (
              <div className="mt-6 bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {project.name}
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Project Code: {project.project_code}</p>
                    <p>Start Date: {project.start_date}</p>
                    <p>End Date: {project.planned_end_date || 'Not set'}</p>
                    <p>Status: <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{project.status}</span></p>
                    {scheduleData && (
                      <p className="mt-2">Tasks: {scheduleData.tasks?.length || 0}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View Toggle */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('gantt')}
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
              <p className="text-sm text-gray-500">
                {scheduleData?.tasks?.length || 0} tasks
              </p>
            </div>

            {/* Gantt Chart or Table View */}
            <div className="mt-4">
              {scheduleData && scheduleData.tasks && (
                <>
                  {viewMode === 'gantt' && (
                    <GanttChart
                      tasks={scheduleData.tasks}
                      projectInfo={scheduleData.project}
                    />
                  )}
                  {viewMode === 'table' && (
                    <TaskTable
                      tasks={scheduleData.tasks}
                      colorConfig={{}}
                      onTaskUpdate={(taskId, field, value) => {
                        console.log('Update task:', taskId, field, value)
                        // Will implement API update in Phase 2
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
