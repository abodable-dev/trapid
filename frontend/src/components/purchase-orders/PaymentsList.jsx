import { useState } from 'react'
import { BanknotesIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../utils/formatters'

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const paymentMethodLabels = {
  bank_transfer: 'Bank Transfer',
  check: 'Check',
  credit_card: 'Credit Card',
  cash: 'Cash',
  eft: 'EFT',
  other: 'Other'
}

export default function PaymentsList({ payments, summary, onDelete }) {
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return
    }

    setDeletingId(paymentId)
    try {
      await onDelete(paymentId)
    } finally {
      setDeletingId(null)
    }
  }

  const getPaymentStatusBadge = (payment) => {
    if (payment.synced_to_xero) {
      return (
        <span className="inline-flex items-center gap-x-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30">
          <CheckCircleIcon className="h-3 w-3" />
          Synced to Xero
        </span>
      )
    } else if (payment.xero_sync_error) {
      return (
        <span className="inline-flex items-center gap-x-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30">
          <ExclamationTriangleIcon className="h-3 w-3" />
          Sync Failed
        </span>
      )
    }
    return (
      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/30">
        Not Synced
      </span>
    )
  }

  const getPaymentStatusClass = (status) => {
    const classes = {
      pending: 'bg-yellow-50 text-yellow-600 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/30',
      part_payment: 'bg-blue-50 text-blue-600 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-500 dark:ring-blue-500/30',
      complete: 'bg-green-50 text-green-600 ring-green-600/20 dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/30',
      manual_review: 'bg-red-50 text-red-600 ring-red-600/20 dark:bg-red-500/10 dark:text-red-500 dark:ring-red-500/30',
    }
    return classes[status] || classes.pending
  }

  const formatPaymentStatus = (status) => {
    const labels = {
      pending: 'Pending',
      part_payment: 'Partial Payment',
      complete: 'Complete',
      manual_review: 'Manual Review',
    }
    return labels[status] || status
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12">
        <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No payments recorded</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by recording a payment for this purchase order.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      {summary && (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">PO Total</dt>
              <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                {formatCurrency(summary.po_total || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Total Paid</dt>
              <dd className="mt-1 font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(summary.total_paid || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Remaining</dt>
              <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                {formatCurrency(summary.remaining || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Payment Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPaymentStatusClass(summary.payment_status)}`}>
                  {formatPaymentStatus(summary.payment_status)}
                </span>
              </dd>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {payments.map((payment, paymentIdx) => (
            <li key={payment.id}>
              <div className="relative pb-8">
                {paymentIdx !== payments.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-green-100 ring-8 ring-white dark:bg-green-500/10 dark:ring-gray-900">
                      <BanknotesIcon aria-hidden="true" className="size-5 text-green-600 dark:text-green-500" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-x-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </p>
                        {getPaymentStatusBadge(payment)}
                      </div>
                      {payment.payment_method && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                        </p>
                      )}
                      {payment.reference_number && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                      {payment.notes && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          {payment.notes}
                        </p>
                      )}
                      {payment.xero_sync_error && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          Error: {payment.xero_sync_error}
                        </p>
                      )}
                      {payment.created_by && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Recorded by {payment.created_by}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm">
                      <time dateTime={payment.payment_date} className="text-gray-500 dark:text-gray-400">
                        {formatDate(payment.payment_date)}
                      </time>
                      <button
                        onClick={() => handleDelete(payment.id)}
                        disabled={deletingId === payment.id}
                        className="ml-4 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingId === payment.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
