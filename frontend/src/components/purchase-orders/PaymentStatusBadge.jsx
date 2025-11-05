export default function PaymentStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      classes: 'inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-400/10 dark:text-gray-400',
      icon: '⏳',
      label: 'Pending'
    },
    part_payment: {
      classes: 'inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500',
      icon: '🔶',
      label: 'Part Payment'
    },
    complete: {
      classes: 'inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-400/10 dark:text-green-400',
      icon: '✅',
      label: 'Complete'
    },
    manual_review: {
      classes: 'inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-400/10 dark:text-red-400',
      icon: '⚠️',
      label: 'Manual Review'
    }
  }

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending

  return (
    <span className={config.classes}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  )
}
