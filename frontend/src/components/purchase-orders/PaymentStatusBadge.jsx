import Badge from '../Badge'

export default function PaymentStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      color: 'gray',
      icon: '⏳',
      label: 'Pending'
    },
    part_payment: {
      color: 'yellow',
      icon: '🔶',
      label: 'Part Payment'
    },
    complete: {
      color: 'green',
      icon: '✅',
      label: 'Complete'
    },
    manual_review: {
      color: 'red',
      icon: '⚠️',
      label: 'Manual Review'
    }
  }

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending

  return (
    <Badge color={config.color}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  )
}
