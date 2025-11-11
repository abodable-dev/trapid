import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
 DocumentTextIcon,
 ChevronDownIcon,
 ChevronUpIcon,
 TrashIcon,
 EyeIcon,
 SparklesIcon
} from '@heroicons/react/24/outline'
import { api } from '../../api'
import EstimateStatusBadge from './EstimateStatusBadge'
import AiReviewModal from './AiReviewModal'

export default function EstimatesTab({ jobId }) {
 const navigate = useNavigate()
 const [estimates, setEstimates] = useState([])
 const [loading, setLoading] = useState(true)
 const [expandedEstimate, setExpandedEstimate] = useState(null)
 const [generatingPOs, setGeneratingPOs] = useState(null)
 const [error, setError] = useState(null)
 const [showAiReviewModal, setShowAiReviewModal] = useState(false)
 const [selectedEstimateForReview, setSelectedEstimateForReview] = useState(null)

 useEffect(() => {
 loadEstimates()
 }, [jobId])

 const loadEstimates = async () => {
 try {
 setLoading(true)
 setError(null)
 const response = await api.get(`/api/v1/estimates?construction_id=${jobId}`)
 setEstimates(response.estimates || [])
 } catch (err) {
 console.error('Failed to load estimates:', err)
 setError('Failed to load estimates. Please try again.')
 } finally {
 setLoading(false)
 }
 }

 const loadEstimateDetails = async (estimateId) => {
 try {
 const response = await api.get(`/api/v1/estimates/${estimateId}`)
 // Update the estimate in our local state with the line items
 setEstimates(prev =>
 prev.map(est =>
 est.id === estimateId
 ? { ...est, estimate_line_items: response.estimate.estimate_line_items }
 : est
 )
 )
 setExpandedEstimate(estimateId)
 } catch (err) {
 console.error('Failed to load estimate details:', err)
 alert('Failed to load estimate details')
 }
 }

 const handleToggleExpand = async (estimateId) => {
 if (expandedEstimate === estimateId) {
 setExpandedEstimate(null)
 } else {
 // Load details if not already loaded
 const estimate = estimates.find(e => e.id === estimateId)
 if (!estimate.estimate_line_items) {
 await loadEstimateDetails(estimateId)
 } else {
 setExpandedEstimate(estimateId)
 }
 }
 }

 const handleGeneratePOs = async (estimateId) => {
 if (!confirm('Generate purchase orders from this estimate? This will create POs for all line items.')) {
 return
 }

 try {
 setGeneratingPOs(estimateId)
 setError(null)
 const response = await api.post(`/api/v1/estimates/${estimateId}/generate_purchase_orders`)

 // Show success message with warnings if any
 let message = `Successfully created ${response.purchase_orders_created} purchase order(s).`
 if (response.warnings && response.warnings.length > 0) {
 message += '\n\nWarnings:\n' + response.warnings.join('\n')
 }
 alert(message)

 // Reload estimates to update status
 await loadEstimates()

 // Navigate to Purchase Orders tab after a short delay
 setTimeout(() => {
 const poTab = document.querySelector('button[class*="border-b-2"]:has-text("Purchase Orders")')
 if (poTab) {
 poTab.click()
 }
 }, 1000)
 } catch (err) {
 console.error('Failed to generate purchase orders:', err)
 const errorMsg = err.response?.data?.error || 'Failed to generate purchase orders. Please try again.'
 alert(errorMsg)
 } finally {
 setGeneratingPOs(null)
 }
 }

 const handleDeleteEstimate = async (estimateId) => {
 if (!confirm('Are you sure you want to delete this estimate? This cannot be undone.')) {
 return
 }

 try {
 await api.delete(`/api/v1/estimates/${estimateId}`)
 await loadEstimates()
 } catch (err) {
 console.error('Failed to delete estimate:', err)
 alert('Failed to delete estimate. Please try again.')
 }
 }

 const handleAiReview = (estimate) => {
 setSelectedEstimateForReview(estimate)
 setShowAiReviewModal(true)
 }

 const handleCloseAiReview = () => {
 setShowAiReviewModal(false)
 setSelectedEstimateForReview(null)
 }

 const formatDate = (dateString) => {
 if (!dateString) return '-'
 return new Date(dateString).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })
 }

 if (loading) {
 return (
 <div className="flex items-center justify-center py-12">
 <span className="loading loading-infinity loading-lg"></span>
 </div>
 )
 }

 if (error) {
 return (
 <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-6">
 <div className="flex">
 <div className="flex-shrink-0">
 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
 </svg>
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error Loading Estimates</h3>
 <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
 <button
 onClick={loadEstimates}
 className="mt-4 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
 >
 Try Again
 </button>
 </div>
 </div>
 </div>
 )
 }

 if (estimates.length === 0) {
 return (
 <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
 <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
 <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Estimates</h3>
 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
 No estimates have been imported for this job yet.
 </p>
 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
 Import estimates from Unreal Engine or other sources to get started.
 </p>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h3 className="text-base font-semibold text-gray-900 dark:text-white">
 Estimates
 </h3>
 <span className="text-sm text-gray-500 dark:text-gray-400">
 {estimates.length} estimate{estimates.length !== 1 ? 's' : ''}
 </span>
 </div>

 <div className="space-y-4">
 {estimates.map((estimate) => {
 const isExpanded = expandedEstimate === estimate.id
 const canGeneratePOs = estimate.status === 'matched'
 const hasGeneratedPOs = estimate.status === 'imported'

 return (
 <div
 key={estimate.id}
 className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
 >
 {/* Estimate Header */}
 <div className="px-6 py-4">
 <div className="flex items-start justify-between">
 <div className="flex items-start space-x-4 flex-1">
 <div className="flex-shrink-0">
 <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
 <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
 </div>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-3">
 <h4 className="text-sm font-medium text-gray-900 dark:text-white">
 {estimate.source === 'unreal_engine' ? 'Unreal Engine Estimate' : 'Estimate'} #{estimate.id}
 </h4>
 <EstimateStatusBadge status={estimate.status} />
 </div>
 <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
 <span>By: {estimate.estimator_name || 'Unknown'}</span>
 <span>•</span>
 <span>Imported: {formatDate(estimate.imported_at)}</span>
 <span>•</span>
 <span>{estimate.total_items} item{estimate.total_items !== 1 ? 's' : ''}</span>
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center space-x-2 ml-4">
 {canGeneratePOs && (
 <>
 <button
 onClick={() => handleAiReview(estimate)}
 disabled={estimate.has_review}
 className="inline-flex items-center px-3 py-1.5 border border-indigo-600 dark:border-indigo-500 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 title={estimate.has_review ? 'Review already exists' : 'Analyze estimate against construction plans using AI'}
 >
 <SparklesIcon className="h-4 w-4 mr-1.5" />
 AI Review
 </button>
 <button
 onClick={() => handleGeneratePOs(estimate.id)}
 disabled={generatingPOs === estimate.id}
 className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <SparklesIcon className="h-4 w-4 mr-1.5" />
 {generatingPOs === estimate.id ? 'Generating...' : 'Generate POs'}
 </button>
 </>
 )}

 {hasGeneratedPOs && (
 <button
 onClick={() => {
 // Navigate to Purchase Orders tab
 const poTab = document.querySelector('button:has-text("Purchase Orders")')
 if (poTab) poTab.click()
 }}
 className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
 >
 <EyeIcon className="h-4 w-4 mr-1.5" />
 View POs
 </button>
 )}

 <button
 onClick={() => handleToggleExpand(estimate.id)}
 className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
 >
 {isExpanded ? (
 <>
 <ChevronUpIcon className="h-4 w-4 mr-1.5" />
 Hide Items
 </>
 ) : (
 <>
 <ChevronDownIcon className="h-4 w-4 mr-1.5" />
 Show Items
 </>
 )}
 </button>

 {['pending', 'matched'].includes(estimate.status) && (
 <button
 onClick={() => handleDeleteEstimate(estimate.id)}
 className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
 >
 <TrashIcon className="h-4 w-4" />
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Line Items (Expanded) */}
 {isExpanded && estimate.estimate_line_items && (
 <div className="border-t border-gray-200 dark:border-gray-700">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
 <thead className="bg-gray-50 dark:bg-gray-800/50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Category
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Item Description
 </th>
 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Quantity
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Unit
 </th>
 </tr>
 </thead>
 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
 {estimate.estimate_line_items.length === 0 ? (
 <tr>
 <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
 No line items found
 </td>
 </tr>
 ) : (
 estimate.estimate_line_items.map((item) => (
 <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
 {item.category || '-'}
 </td>
 <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
 {item.item_description || '-'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
 {item.quantity || 0}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
 {item.unit || '-'}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 )
 })}
 </div>

 {/* AI Review Modal */}
 <AiReviewModal
 isOpen={showAiReviewModal}
 onClose={handleCloseAiReview}
 estimateId={selectedEstimateForReview?.id}
 estimateName={selectedEstimateForReview ? `Estimate #${selectedEstimateForReview.id}` : ''}
 />
 </div>
 )
}
