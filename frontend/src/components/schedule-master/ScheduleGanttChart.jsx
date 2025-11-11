import { useEffect, useRef, useState } from 'react'
import Gantt from 'frappe-gantt'
import Badge from '../Badge'

export default function ScheduleGanttChart({ ganttData }) {
 const ganttRef = useRef(null)
 const ganttInstance = useRef(null)
 const [viewMode, setViewMode] = useState('Week')
 const [selectedTask, setSelectedTask] = useState(null)

 useEffect(() => {
 if (!ganttRef.current || !ganttData?.gantt_tasks) return

 // Format tasks for Frappe Gantt
 const tasks = ganttData.gantt_tasks.map(task => ({
 id: String(task.id),
 name: task.title,
 start: task.start_date,
 end: task.end_date,
 progress: task.progress || 0,
 dependencies: task.predecessors ? task.predecessors.map(p => String(p)).join(',') : '',
 custom_class: getTaskClass(task.status)
 }))

 // Destroy existing instance
 if (ganttInstance.current) {
 try {
 ganttInstance.current.clear()
 } catch (e) {
 // Ignore errors during cleanup
 }
 }

 // Create new Gantt instance
 try {
 ganttInstance.current = new Gantt(ganttRef.current, tasks, {
 view_mode: viewMode,
 on_click: (task) => {
 const taskData = ganttData.gantt_tasks.find(t => String(t.id) === task.id)
 setSelectedTask(taskData)
 },
 on_date_change: (task, start, end) => {
 console.log('Date changed:', task, start, end)
 // You can implement date change API call here if needed
 },
 on_progress_change: (task, progress) => {
 console.log('Progress changed:', task, progress)
 // You can implement progress change API call here if needed
 },
 on_view_change: (mode) => {
 console.log('View mode changed:', mode)
 },
 custom_popup_html: (task) => {
 const taskData = ganttData.gantt_tasks.find(t => String(t.id) === task.id)
 if (!taskData) return ''

 return `
 <div class="gantt-popup-content">
 <h5>${taskData.title}</h5>
 <p>Status: ${taskData.status || 'N/A'}</p>
 <p>Category: ${taskData.supplier_category || 'N/A'}</p>
 <p>Supplier: ${taskData.supplier_name || 'N/A'}</p>
 <p>PO: #${taskData.purchase_order_number || 'N/A'}</p>
 <p>Duration: ${taskData.duration_days} days</p>
 <p>Progress: ${taskData.progress}%</p>
 </div>
 `
 }
 })
 } catch (error) {
 console.error('Error creating Gantt chart:', error)
 }

 // Cleanup on unmount
 return () => {
 if (ganttInstance.current) {
 try {
 ganttInstance.current.clear()
 } catch (e) {
 // Ignore errors during cleanup
 }
 }
 }
 }, [ganttData, viewMode])

 const handleViewModeChange = (mode) => {
 setViewMode(mode)
 if (ganttInstance.current) {
 ganttInstance.current.change_view_mode(mode)
 }
 }

 if (!ganttData?.gantt_tasks || ganttData.gantt_tasks.length === 0) {
 return (
 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
 No matched tasks to display in Gantt chart
 </div>
 )
 }

 return (
 <div className="space-y-4">
 {/* View Mode Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
 View:
 </span>
 <div className="inline-flex shadow-sm">
 {['Day', 'Week', 'Month'].map((mode) => (
 <button
 key={mode}
 type="button"
 onClick={() => handleViewModeChange(mode)}
 className={`
 px-3 py-1.5 text-sm font-medium
 ${mode === 'Day' ? '' : ''}
 ${mode === 'Month' ? '' : ''}
 ${mode !== 'Day' && mode !== 'Month' ? '-ml-px' : ''}
 ${
 viewMode === mode
 ? 'bg-indigo-600 text-white'
 : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
 }
 `}
 >
 {mode}
 </button>
 ))}
 </div>
 </div>

 {/* Legend */}
 <div className="flex items-center gap-4 text-xs">
 <div className="flex items-center gap-1.5">
 <div className="w-4 h-4 bg-gray-400"></div>
 <span className="text-gray-600 dark:text-gray-400">Not Started</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-4 h-4 bg-blue-500"></div>
 <span className="text-gray-600 dark:text-gray-400">In Progress</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-4 h-4 bg-green-500"></div>
 <span className="text-gray-600 dark:text-gray-400">Completed</span>
 </div>
 </div>
 </div>

 {/* Gantt Chart Container */}
 <div className="gantt-container overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4">
 <svg ref={ganttRef} className="w-full"></svg>
 </div>

 {/* Selected Task Details */}
 {selectedTask && (
 <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4">
 <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
 Task Details
 </h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
 <div>
 <dt className="text-gray-500 dark:text-gray-400 mb-1">Task</dt>
 <dd className="font-medium text-gray-900 dark:text-white">{selectedTask.title}</dd>
 </div>
 <div>
 <dt className="text-gray-500 dark:text-gray-400 mb-1">Status</dt>
 <dd>
 <Badge color={getStatusBadgeColor(selectedTask.status)}>
 {selectedTask.status || 'N/A'}
 </Badge>
 </dd>
 </div>
 <div>
 <dt className="text-gray-500 dark:text-gray-400 mb-1">Category</dt>
 <dd className="font-medium text-gray-900 dark:text-white">
 {selectedTask.supplier_category || 'N/A'}
 </dd>
 </div>
 <div>
 <dt className="text-gray-500 dark:text-gray-400 mb-1">Supplier</dt>
 <dd className="font-medium text-gray-900 dark:text-white">
 {selectedTask.supplier_name || 'N/A'}
 </dd>
 </div>
 <div>
 <dt className="text-gray-500 dark:text-gray-400 mb-1">Purchase Order</dt>
 <dd className="font-medium text-gray-900 dark:text-white">
 {selectedTask.purchase_order_number ? `#${selectedTask.purchase_order_number}` : 'N/A'}
 </dd>
 </div>
 <div>
 <dt className="text-gray-500 dark:text-gray-400 mb-1">Duration</dt>
 <dd className="font-medium text-gray-900 dark:text-white">
 {selectedTask.duration_days} days
 </dd>
 </div>
 <div>
 <dt className="text-gray-500 dark:text-gray-400 mb-1">Start Date</dt>
 <dd className="font-medium text-gray-900 dark:text-white">
 {new Date(selectedTask.start_date).toLocaleDateString()}
 </dd>
 </div>
 <div>
 <dt className="text-gray-500 dark:text-gray-400 mb-1">End Date</dt>
 <dd className="font-medium text-gray-900 dark:text-white">
 {new Date(selectedTask.end_date).toLocaleDateString()}
 </dd>
 </div>
 </div>
 </div>
 )}

 {/* Frappe Gantt CSS Styles */}
 <style>{`
 /* Base Gantt Styles (from frappe-gantt.css) */
 .gantt-container {
 position: relative;
 overflow: auto;
 font-size: 12px;
 font-family: inherit;
 }

 .gantt .grid-background {
 fill: none;
 }

 .gantt .grid-header {
 fill: #ffffff;
 stroke: #e0e0e0;
 stroke-width: 1.4;
 }

 .gantt .grid-row {
 fill: #ffffff;
 }

 .gantt .grid-row:nth-child(even) {
 fill: #f5f5f5;
 }

 .gantt .row-line {
 stroke: #ebeff2;
 }

 .gantt .tick {
 stroke: #e0e0e0;
 stroke-width: 0.2;
 }

 .gantt .tick.thick {
 stroke: #c0c0c0;
 stroke-width: 0.4;
 }

 .gantt .today-highlight {
 fill: #fcf8e3;
 opacity: 0.5;
 }

 .gantt text {
 font-family: inherit;
 font-size: 12px;
 fill: #333;
 -webkit-user-select: none;
 -moz-user-select: none;
 -ms-user-select: none;
 user-select: none;
 }

 .gantt .bar-wrapper {
 cursor: pointer;
 outline: none;
 }

 .gantt .bar-wrapper:hover .bar-progress,
 .gantt .bar-wrapper:hover .bar {
 filter: brightness(0.95);
 }

 .gantt .bar-wrapper:active .bar-progress,
 .gantt .bar-wrapper:active .bar {
 filter: brightness(0.9);
 }

 .gantt .bar-wrapper.active .bar-progress,
 .gantt .bar-wrapper.active .bar {
 filter: brightness(0.9);
 }

 .gantt .bar {
 fill: #6366f1;
 stroke: #5a5ff5;
 stroke-width: 1;
 transition: fill 0.3s ease, stroke 0.3s ease;
 rx: 3;
 ry: 3;
 }

 .gantt .bar.not_started {
 fill: #9ca3af;
 stroke: #8891a0;
 }

 .gantt .bar.in_progress {
 fill: #3b82f6;
 stroke: #2563eb;
 }

 .gantt .bar.completed {
 fill: #10b981;
 stroke: #059669;
 }

 .gantt .bar-progress {
 fill: #4f46e5;
 }

 .gantt .bar-invalid {
 fill: transparent;
 stroke: #8e44ad;
 stroke-width: 1;
 stroke-dasharray: 5;
 }

 .gantt .bar-label {
 fill: #fff;
 dominant-baseline: central;
 text-anchor: middle;
 font-size: 12px;
 font-weight: 500;
 }

 .gantt .bar-label.big {
 fill: #333;
 text-anchor: start;
 }

 .gantt .handle {
 fill: #ddd;
 cursor: ew-resize;
 opacity: 0;
 visibility: hidden;
 transition: opacity 0.3s ease;
 }

 .gantt .bar-wrapper:hover .handle {
 visibility: visible;
 opacity: 1;
 }

 .gantt .handle.left {
 x: -8;
 }

 .gantt .handle.right {
 x: 100%;
 }

 .gantt .arrow {
 fill: none;
 stroke: #666;
 stroke-width: 1.4;
 }

 .gantt .lower-text,
 .gantt .upper-text {
 font-size: 12px;
 text-anchor: middle;
 }

 .gantt .upper-text {
 fill: #555;
 }

 .gantt .lower-text {
 fill: #333;
 }

 .gantt .hide {
 display: none;
 }

 .gantt-popup-wrapper {
 position: absolute;
 top: 0;
 left: 0;
 background: rgba(0, 0, 0, 0.8);
 padding: 0;
 color: #959da5;
 border-radius: 3px;
 box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
 }

 .gantt-popup-wrapper .title {
 border-bottom: 1px solid #e0e0e0;
 padding: 10px;
 background: #f5f5f5;
 border-radius: 3px 3px 0 0;
 }

 .gantt-popup-wrapper .subtitle {
 padding: 10px;
 color: #333;
 }

 .gantt-popup-wrapper .pointer {
 position: absolute;
 height: 5px;
 margin: 0 0 0 -5px;
 border: 5px solid transparent;
 border-top-color: rgba(0, 0, 0, 0.8);
 }

 .gantt-popup-content {
 padding: 12px;
 background: white;
 border-radius: 4px;
 color: #333;
 }

 .gantt-popup-content h5 {
 font-weight: 600;
 margin-bottom: 8px;
 color: #111827;
 font-size: 14px;
 }

 .gantt-popup-content p {
 margin: 4px 0;
 font-size: 12px;
 color: #6b7280;
 }

 /* Dark Mode Support */
 @media (prefers-color-scheme: dark) {
 .gantt .grid-header {
 fill: #374151;
 stroke: #4b5563;
 }

 .gantt .grid-row {
 fill: #1f2937;
 }

 .gantt .grid-row:nth-child(even) {
 fill: #111827;
 }

 .gantt .row-line {
 stroke: #374151;
 }

 .gantt .tick {
 stroke: #4b5563;
 }

 .gantt .tick.thick {
 stroke: #6b7280;
 }

 .gantt .today-highlight {
 fill: #fbbf24;
 opacity: 0.2;
 }

 .gantt text {
 fill: #e5e7eb;
 }

 .gantt .bar-label {
 fill: #fff;
 }

 .gantt .bar-label.big {
 fill: #e5e7eb;
 }

 .gantt .upper-text {
 fill: #9ca3af;
 }

 .gantt .lower-text {
 fill: #d1d5db;
 }

 .gantt-popup-content {
 background: #1f2937;
 color: #e5e7eb;
 }

 .gantt-popup-content h5 {
 color: #f9fafb;
 }

 .gantt-popup-content p {
 color: #9ca3af;
 }
 }
 `}</style>
 </div>
 )
}

function getTaskClass(status) {
 const statusLower = status?.toLowerCase() || ''

 if (statusLower.includes('completed') || statusLower.includes('done')) {
 return 'completed'
 }
 if (statusLower.includes('in progress') || statusLower.includes('active')) {
 return 'in_progress'
 }
 return 'not_started'
}

function getStatusBadgeColor(status) {
 const statusLower = status?.toLowerCase() || ''

 if (statusLower.includes('completed') || statusLower.includes('done')) {
 return 'green'
 }
 if (statusLower.includes('in progress') || statusLower.includes('active')) {
 return 'blue'
 }
 return 'gray'
}
