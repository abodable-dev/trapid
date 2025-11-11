import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatCurrency, formatPercentage } from '../utils/formatters'
import {
 Plus,
 Briefcase,
 Upload,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import NewJobModal from '../components/jobs/NewJobModal'
import CsvImportJobModal from '../components/jobs/CsvImportJobModal'
import MiddayDataTable from '../components/MiddayDataTable'

export default function ActiveJobsPage() {
 const navigate = useNavigate()
 const [jobs, setJobs] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [editingCell, setEditingCell] = useState(null)
 const [editValue, setEditValue] = useState('')
 const [showNewJobModal, setShowNewJobModal] = useState(false)
 const [showCsvImportModal, setShowCsvImportModal] = useState(false)

 useEffect(() => {
 loadJobs()
 }, [])

 const loadJobs = async () => {
 try {
 setLoading(true)
 const response = await api.get(
 `/api/v1/constructions?status=Active&per_page=1000`
 )
 setJobs(response.constructions || [])
 } catch (err) {
 setError('Failed to load active jobs')
 console.error(err)
 } finally {
 setLoading(false)
 }
 }

 const handleCellClick = (jobId, field, currentValue) => {
 setEditingCell({ jobId, field })
 setEditValue(currentValue || '')
 }

 const handleCellBlur = async () => {
 if (!editingCell) return

 const { jobId, field } = editingCell
 const originalJob = jobs.find(j => j.id === jobId)

 if (editValue !== originalJob[field]) {
 try {
 await api.put(`/api/v1/constructions/${jobId}`, {
 construction: {
 [field]: editValue
 }
 })
 await loadJobs()
 } catch (err) {
 console.error('Failed to update job:', err)
 alert('Failed to update job')
 }
 }

 setEditingCell(null)
 setEditValue('')
 }

 const handleKeyDown = (e) => {
 if (e.key === 'Enter') {
 e.target.blur()
 }
 }

 const handleCreateJob = async (jobData) => {
 try {
 const { createOneDriveFolders, ...constructionData } = jobData

 const response = await api.post('/api/v1/constructions', {
 construction: constructionData,
 create_onedrive_folders: createOneDriveFolders,
 template_id: null
 })

 await loadJobs()

 if (createOneDriveFolders) {
 alert('Job created successfully! OneDrive folders are being created in the background.')
 }

 if (response.construction && response.construction.id) {
 navigate(`/jobs/${response.construction.id}/setup`)
 }
 } catch (err) {
 console.error('Failed to create job:', err)
 throw err
 }
 }

 // Define columns for MiddayDataTable
 const columns = [
 {
 key: 'index',
 label: '#',
 width: 'w-8',
 render: (_, index) => (
 <span className="text-gray-500 dark:text-gray-400 font-mono">
 {index + 1}
 </span>
 )
 },
 {
 key: 'title',
 label: 'Job Title',
 sortable: true,
 render: (job) => {
 if (editingCell?.jobId === job.id && editingCell?.field === 'title') {
 return (
 <input
 type="text"
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onBlur={handleCellBlur}
 onKeyDown={handleKeyDown}
 autoFocus
 className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-900 dark:text-white"
 />
 )
 }
 return (
 <Link
 to={`/jobs/${job.id}`}
 className="text-xs font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 truncate max-w-md"
 title={job.title}
 >
 {job.title || 'Untitled Job'}
 </Link>
 )
 }
 },
 {
 key: 'contract_value',
 label: 'Contract Value',
 align: 'right',
 numeric: true,
 sortable: true,
 render: (job) => {
 if (editingCell?.jobId === job.id && editingCell?.field === 'contract_value') {
 return (
 <input
 type="number"
 step="0.01"
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onBlur={handleCellBlur}
 onKeyDown={handleKeyDown}
 autoFocus
 className="w-full px-2 py-1 text-xs text-right font-mono border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-900 dark:text-white"
 />
 )
 }
 return (
 <div
 onClick={(e) => {
 e.stopPropagation()
 handleCellClick(job.id, 'contract_value', job.contract_value)
 }}
 className="text-gray-900 dark:text-white font-mono cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 px-2 py-1"
 title="Click to edit"
 >
 {job.contract_value ? formatCurrency(job.contract_value, false) : '-'}
 </div>
 )
 }
 },
 {
 key: 'live_profit',
 label: 'Live Profit',
 align: 'right',
 numeric: true,
 sortable: true,
 render: (job) => {
 if (editingCell?.jobId === job.id && editingCell?.field === 'live_profit') {
 return (
 <input
 type="number"
 step="0.01"
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onBlur={handleCellBlur}
 onKeyDown={handleKeyDown}
 autoFocus
 className="w-full px-2 py-1 text-xs text-right font-mono border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-900 dark:text-white"
 />
 )
 }
 return (
 <div
 onClick={(e) => {
 e.stopPropagation()
 handleCellClick(job.id, 'live_profit', job.live_profit)
 }}
 className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 px-2 py-1 font-mono ${
 job.live_profit >= 0
 ? 'text-green-600 dark:text-green-400'
 : 'text-red-600 dark:text-red-400'
 }`}
 title="Click to edit"
 >
 {job.live_profit ? formatCurrency(job.live_profit, false) : '-'}
 </div>
 )
 }
 },
 {
 key: 'profit_percentage',
 label: 'Profit %',
 align: 'right',
 numeric: true,
 sortable: true,
 render: (job) => {
 if (editingCell?.jobId === job.id && editingCell?.field === 'profit_percentage') {
 return (
 <input
 type="number"
 step="0.01"
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onBlur={handleCellBlur}
 onKeyDown={handleKeyDown}
 autoFocus
 className="w-full px-2 py-1 text-xs text-right font-mono border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-900 dark:text-white"
 />
 )
 }
 return (
 <div
 onClick={(e) => {
 e.stopPropagation()
 handleCellClick(job.id, 'profit_percentage', job.profit_percentage)
 }}
 className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 px-2 py-1 font-mono ${
 job.profit_percentage >= 0
 ? 'text-green-600 dark:text-green-400'
 : 'text-red-600 dark:text-red-400'
 }`}
 title="Click to edit"
 >
 {job.profit_percentage ? formatPercentage(job.profit_percentage, 2) : '-'}
 </div>
 )
 }
 },
 {
 key: 'stage',
 label: 'Stage',
 sortable: true,
 render: (job) => {
 if (editingCell?.jobId === job.id && editingCell?.field === 'stage') {
 return (
 <input
 type="text"
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onBlur={handleCellBlur}
 onKeyDown={handleKeyDown}
 autoFocus
 className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-900 dark:text-white"
 />
 )
 }
 return (
 <div
 onClick={(e) => {
 e.stopPropagation()
 handleCellClick(job.id, 'stage', job.stage)
 }}
 className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 px-2 py-1 inline-block"
 title="Click to edit"
 >
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
 {job.stage || 'Not Set'}
 </span>
 </div>
 )
 }
 }
 ]

 if (loading && jobs.length === 0) {
 return (
 <div className="flex h-screen overflow-hidden">
 <div className="flex-1 flex items-center justify-center">
 <span className="loading loading-infinity loading-lg"></span>
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className="flex h-screen overflow-hidden">
 <div className="flex-1 flex items-center justify-center">
 <div className="text-red-600 dark:text-red-400">{error}</div>
 </div>
 </div>
 )
 }

 return (
 <div className="flex h-screen overflow-hidden">
 <div className="flex-1 overflow-auto bg-white dark:bg-black">
 {/* Header */}
 <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
 <div className="px-4 py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Briefcase className="h-4 w-4 text-gray-400" />
 <div>
 <h1 className="text-sm font-medium text-gray-900 dark:text-white">
 Active Jobs
 </h1>
 <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
 {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
 </p>
 </div>
 </div>
 <div className="flex gap-x-2">
 <button
 onClick={() => setShowNewJobModal(true)}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
 >
 <Plus className="h-3.5 w-3.5" />
 New Job
 </button>
 <button
 onClick={() => setShowCsvImportModal(true)}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
 >
 <Upload className="h-3.5 w-3.5" />
 Import CSV
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Table */}
 <MiddayDataTable
 data={jobs}
 columns={columns}
 loading={loading}
 emptyMessage="No active jobs found. Click 'New Job' to create one."
 />

 {/* New Job Modal */}
 <NewJobModal
 isOpen={showNewJobModal}
 onClose={() => setShowNewJobModal(false)}
 onSuccess={handleCreateJob}
 />

 {/* CSV Import Modal */}
 <CsvImportJobModal
 isOpen={showCsvImportModal}
 onClose={() => setShowCsvImportModal(false)}
 onSuccess={() => {
 setShowCsvImportModal(false)
 loadJobs()
 }}
 />
 </div>
 </div>
 )
}
