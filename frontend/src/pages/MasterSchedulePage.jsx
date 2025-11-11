import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChartBarIcon, TableCellsIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import GanttChart from '../components/gantt/GanttChart'
import TaskTable from '../components/gantt/TaskTable'
import ColorCustomizationMenu from '../components/gantt/ColorCustomizationMenu'
import Toast from '../components/Toast'
import { getStoredColorConfig, saveColorConfig } from '../components/gantt/utils/colorSchemes'

export default function MasterSchedulePage() {
 const { id } = useParams() // Get job/construction ID from URL
 const [construction, setConstruction] = useState(null)
 const [project, setProject] = useState(null)
 const [scheduleData, setScheduleData] = useState(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [viewMode, setViewMode] = useState('gantt') // 'gantt' or 'table'
 const [colorBy, setColorBy] = useState('status') // 'status', 'category', or 'type'
 const [colorConfig, setColorConfig] = useState(getStoredColorConfig())
 const [toast, setToast] = useState(null)
 const [saving, setSaving] = useState(false)
 const navigate = useNavigate()

 // Save color config when it changes
 useEffect(() => {
 saveColorConfig(colorConfig)
 }, [colorConfig])

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
 <span className="loading loading-infinity loading-lg"></span>
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
 className="mt-4 inline-flex items-center bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
 >
 Back to Job
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
 onClick={() => navigate(`/jobs/${id}`)}
 className="inline-flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 transition-colors"
 title="Back to Job"
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
 onClick={() => setViewMode('gantt')}
 className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
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
 className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
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

 {/* Color By Dropdown */}
 <div className="flex items-center gap-2">
 <span className="text-xs text-gray-600">Color by:</span>
 <select
 value={colorBy}
 onChange={(e) => setColorBy(e.target.value)}
 className="text-xs border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
 >
 <option value="status">Status</option>
 <option value="category">Category</option>
 <option value="type">Type</option>
 </select>
 </div>

 {/* Color Customization Menu */}
 {scheduleData && scheduleData.tasks && (
 <ColorCustomizationMenu
 tasks={scheduleData.tasks}
 colorConfig={colorConfig}
 onColorChange={setColorConfig}
 colorBy={colorBy}
 />
 )}
 </div>
 </div>

 {/* Gantt Chart or Table View */}
 <div className="mt-4">
 {scheduleData && scheduleData.tasks && (
 <>
 {viewMode === 'gantt' && (
 <GanttChart
 tasks={scheduleData.tasks}
 projectInfo={scheduleData.project}
 colorBy={colorBy}
 colorConfig={colorConfig}
 />
 )}
 {viewMode === 'table' && (
 <TaskTable
 tasks={scheduleData.tasks}
 colorBy={colorBy}
 colorConfig={colorConfig}
 onTaskUpdate={handleTaskUpdate}
 saving={saving}
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
