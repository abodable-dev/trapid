import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'
import POStatusBadge from './POStatusBadge'
import { PencilIcon, TrashIcon, CheckIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

export default function POTable({ purchaseOrders, onEdit, onDelete, onApprove, onSend }) {
  const [expandedPO, setExpandedPO] = useState(null)

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const handleRowClick = (poId) => {
    setExpandedPO(expandedPO === poId ? null : poId)
  }

  return (
    <div className="overflow-x-auto border-l border-r border-b border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              PO Number
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Supplier
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Description
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Required Date
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Status
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
              Total
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {purchaseOrders.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No purchase orders found. Click "New Purchase Order" to create one.
              </td>
            </tr>
          ) : (
            purchaseOrders.map((po) => (
              <tr
                key={po.id}
                onClick={() => handleRowClick(po.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {po.purchase_order_number}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {po.supplier?.name || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                  {po.description || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(po.required_date)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <POStatusBadge status={po.status} />
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                  {formatCurrency(po.total, false)}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {po.status === 'pending' && onApprove && (
                      <button
                        onClick={() => onApprove(po.id)}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        title="Approve"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    {po.status === 'approved' && onSend && (
                      <button
                        onClick={() => onSend(po.id)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Send to Supplier"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                    )}
                    {['draft', 'pending'].includes(po.status) && onEdit && (
                      <button
                        onClick={() => onEdit(po)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    {po.status !== 'paid' && onDelete && (
                      <button
                        onClick={() => onDelete(po.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
