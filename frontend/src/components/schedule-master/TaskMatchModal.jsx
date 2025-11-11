import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'
import Badge from '../Badge'

export default function TaskMatchModal({ isOpen, onClose, onConfirm, task, constructionId }) {
 const [purchaseOrders, setPurchaseOrders] = useState([])
 const [loading, setLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedPO, setSelectedPO] = useState(null)

 useEffect(() => {
 if (isOpen) {
 loadPurchaseOrders()
 }
 }, [isOpen, constructionId])

 const loadPurchaseOrders = async () => {
 try {
 setLoading(true)
 const response = await api.get('/api/v1/purchase_orders', {
 params: { construction_id: constructionId }
 })
 setPurchaseOrders(response.purchase_orders || [])
 } catch (err) {
 console.error('Failed to load purchase orders:', err)
 } finally {
 setLoading(false)
 }
 }

 const handleConfirm = () => {
 if (selectedPO) {
 onConfirm(selectedPO.id)
 }
 }

 // Filter POs based on search term
 const filteredPOs = purchaseOrders.filter(po => {
 const searchLower = searchTerm.toLowerCase()
 return (
 po.po_number?.toLowerCase().includes(searchLower) ||
 po.supplier_name?.toLowerCase().includes(searchLower) ||
 po.category?.toLowerCase().includes(searchLower)
 )
 })

 // Suggested POs (from task.suggested_purchase_orders)
 const suggestedPOs = task.suggested_purchase_orders || []
 const suggestedPOIds = new Set(suggestedPOs.map(po => po.id))

 // Split into suggested and other POs
 const suggested = filteredPOs.filter(po => suggestedPOIds.has(po.id))
 const others = filteredPOs.filter(po => !suggestedPOIds.has(po.id))

 return (
 <Transition appear show={isOpen} as={Fragment}>
 <Dialog as="div" className="relative z-50" onClose={onClose}>
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0"
 enterTo="opacity-100"
 leave="ease-in duration-200"
 leaveFrom="opacity-100"
 leaveTo="opacity-0"
 >
 <div className="fixed inset-0 bg-black/30 dark:bg-black/50" />
 </Transition.Child>

 <div className="fixed inset-0 overflow-y-auto">
 <div className="flex min-h-full items-center justify-center p-4">
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0 scale-95"
 enterTo="opacity-100 scale-100"
 leave="ease-in duration-200"
 leaveFrom="opacity-100 scale-100"
 leaveTo="opacity-0 scale-95"
 >
 <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden bg-white dark:bg-gray-800 shadow-xl transition-all">
 {/* Header */}
 <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
 <div className="flex items-center justify-between">
 <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
 Match Task to Purchase Order
 </Dialog.Title>
 <button
 type="button"
 onClick={onClose}
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 >
 <XMarkIcon className="h-6 w-6" />
 </button>
 </div>
 <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
 Task: <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
 </p>
 {task.supplier_category && (
 <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
 Supplier Category: <span className="font-medium">{task.supplier_category}</span>
 </p>
 )}
 </div>

 {/* Search */}
 <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
 </div>
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search by PO number, supplier, or category..."
 className="block w-full border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
 />
 </div>
 </div>

 {/* Purchase Orders List */}
 <div className="px-6 py-4 max-h-96 overflow-y-auto">
 {loading ? (
 <div className="flex items-center justify-center py-8">
 <span className="loading loading-infinity loading-lg"></span>
 </div>
 ) : (
 <div className="space-y-6">
 {/* Suggested Purchase Orders */}
 {suggested.length > 0 && (
 <div>
 <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
 Suggested Matches
 </h3>
 <div className="space-y-2">
 {suggested.map((po) => (
 <POCard
 key={po.id}
 po={po}
 isSelected={selectedPO?.id === po.id}
 onSelect={() => setSelectedPO(po)}
 isSuggested
 />
 ))}
 </div>
 </div>
 )}

 {/* Other Purchase Orders */}
 {others.length > 0 && (
 <div>
 <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
 {suggested.length > 0 ? 'Other Purchase Orders' : 'All Purchase Orders'}
 </h3>
 <div className="space-y-2">
 {others.map((po) => (
 <POCard
 key={po.id}
 po={po}
 isSelected={selectedPO?.id === po.id}
 onSelect={() => setSelectedPO(po)}
 />
 ))}
 </div>
 </div>
 )}

 {/* No results */}
 {filteredPOs.length === 0 && (
 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
 No purchase orders found
 </div>
 )}
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={handleConfirm}
 disabled={!selectedPO}
 className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <CheckIcon className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
 Confirm Match
 </button>
 </div>
 </Dialog.Panel>
 </Transition.Child>
 </div>
 </div>
 </Dialog>
 </Transition>
 )
}

function POCard({ po, isSelected, onSelect, isSuggested = false }) {
 return (
 <div
 onClick={onSelect}
 className={`
 relative border p-4 cursor-pointer transition-all
 ${
 isSelected
 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500'
 : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
 }
 `}
 >
 {/* Selected Indicator */}
 {isSelected && (
 <div className="absolute top-3 right-3">
 <div className="rounded-full bg-indigo-600 p-1">
 <CheckIcon className="h-4 w-4 text-white" />
 </div>
 </div>
 )}

 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0 pr-4">
 <div className="flex items-center gap-2 mb-2">
 <span className="font-medium text-gray-900 dark:text-white">
 PO #{po.po_number}
 </span>
 {isSuggested && (
 <Badge color="blue">Suggested</Badge>
 )}
 {po.status && (
 <Badge color={getPOStatusColor(po.status)}>
 {po.status}
 </Badge>
 )}
 </div>

 <div className="space-y-1 text-sm">
 <div className="text-gray-600 dark:text-gray-400">
 <span className="font-medium">Supplier:</span> {po.supplier_name || 'N/A'}
 </div>
 {po.category && (
 <div className="text-gray-600 dark:text-gray-400">
 <span className="font-medium">Category:</span> {po.category}
 </div>
 )}
 {po.total_amount && (
 <div className="text-gray-600 dark:text-gray-400">
 <span className="font-medium">Amount:</span> ${parseFloat(po.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )
}

function getPOStatusColor(status) {
 const statusLower = status?.toLowerCase() || ''

 if (statusLower === 'approved' || statusLower === 'sent') {
 return 'green'
 }
 if (statusLower === 'draft') {
 return 'gray'
 }
 if (statusLower === 'pending') {
 return 'yellow'
 }

 return 'gray'
}
