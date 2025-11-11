import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'
import { formatCurrency } from '../../utils/formatters'

export default function XeroInvoiceMatcher({ isOpen, onClose, purchaseOrder, onSuccess }) {
 const [invoices, setInvoices] = useState([])
 const [filteredInvoices, setFilteredInvoices] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [searchTerm, setSearchTerm] = useState('')
 const [matching, setMatching] = useState(null)

 useEffect(() => {
 if (isOpen) {
 loadInvoices()
 }
 }, [isOpen])

 useEffect(() => {
 if (searchTerm) {
 const filtered = invoices.filter(invoice =>
 invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 invoice.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 invoice.reference?.toLowerCase().includes(searchTerm.toLowerCase())
 )
 setFilteredInvoices(filtered)
 } else {
 setFilteredInvoices(invoices)
 }
 }, [searchTerm, invoices])

 const loadInvoices = async () => {
 try {
 setLoading(true)
 setError(null)
 const data = await api.xero.getInvoices()
 setInvoices(data.invoices || [])
 setFilteredInvoices(data.invoices || [])
 } catch (err) {
 console.error('Failed to load invoices:', err)
 setError(err.message || 'Failed to load invoices. Please ensure Xero is connected.')
 } finally {
 setLoading(false)
 }
 }

 const handleMatch = async (invoice) => {
 if (!window.confirm(`Match invoice ${invoice.invoice_number} to PO #${purchaseOrder.purchase_order_number}?`)) {
 return
 }

 try {
 setMatching(invoice.invoice_id)
 await api.xero.matchInvoice(invoice.invoice_id, purchaseOrder.id)

 // Show success message
 alert(`Successfully matched invoice ${invoice.invoice_number} to PO #${purchaseOrder.purchase_order_number}`)

 // Close modal and trigger refresh
 onSuccess()
 onClose()
 } catch (err) {
 console.error('Failed to match invoice:', err)
 alert('Failed to match invoice. Please try again.')
 } finally {
 setMatching(null)
 }
 }

 const formatDate = (dateString) => {
 if (!dateString) return '-'
 return new Date(dateString).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric'
 })
 }

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
 <div className="flex min-h-full items-center justify-center p-4 text-center">
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0 scale-95"
 enterTo="opacity-100 scale-100"
 leave="ease-in duration-200"
 leaveFrom="opacity-100 scale-100"
 leaveTo="opacity-0 scale-95"
 >
 <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
 <div>
 <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
 Match Xero Invoice
 </Dialog.Title>
 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
 Select an invoice to match with PO #{purchaseOrder?.purchase_order_number}
 </p>
 </div>
 <button
 onClick={onClose}
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 >
 <XMarkIcon className="h-6 w-6" />
 </button>
 </div>

 {/* Search Bar */}
 <div className="px-6 pt-4">
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
 </div>
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search by invoice number, supplier, or reference..."
 className="block w-full border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm"
 />
 </div>
 </div>

 {/* Content */}
 <div className="px-6 py-4 max-h-96 overflow-y-auto">
 {loading ? (
 <div className="flex items-center justify-center py-12">
 <span className="loading loading-infinity loading-lg"></span>
 </div>
 ) : error ? (
 <div className="bg-red-50 dark:bg-red-900/20 p-4">
 <div className="flex">
 <div className="ml-3">
 <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
 <div className="mt-2 text-sm text-red-700 dark:text-red-300">
 {error}
 </div>
 </div>
 </div>
 </div>
 ) : filteredInvoices.length === 0 ? (
 <div className="text-center py-12">
 <p className="text-sm text-gray-500 dark:text-gray-400">
 {searchTerm ? 'No invoices match your search.' : 'No invoices found in Xero.'}
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {filteredInvoices.map((invoice) => (
 <div
 key={invoice.invoice_id}
 className="border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
 >
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3">
 <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
 {invoice.invoice_number}
 </h4>
 <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${
 invoice.status === 'PAID'
 ? 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400'
 : invoice.status === 'AUTHORISED'
 ? 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400'
 : 'bg-gray-100 text-gray-700 dark:bg-gray-400/10 dark:text-gray-400'
 }`}>
 {invoice.status}
 </span>
 </div>
 <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
 <div>
 <span className="font-medium">Supplier:</span> {invoice.contact?.name || '-'}
 </div>
 <div>
 <span className="font-medium">Date:</span> {formatDate(invoice.date)}
 </div>
 <div>
 <span className="font-medium">Amount:</span> {formatCurrency(invoice.total)}
 </div>
 {invoice.reference && (
 <div>
 <span className="font-medium">Reference:</span> {invoice.reference}
 </div>
 )}
 </div>
 </div>
 <button
 onClick={() => handleMatch(invoice)}
 disabled={matching === invoice.invoice_id}
 className="ml-4 inline-flex items-center bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {matching === invoice.invoice_id ? (
 <>
 <span className="loading loading-sm mr-2"></span>
 Matching...
 </>
 ) : (
 'Match to PO'
 )}
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
 <button
 onClick={onClose}
 className="bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
 >
 Cancel
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
