import Badge from '../Badge'

export default function POStatusBadge({ status }) {
  const statusColorMap = {
    draft: 'gray',
    pending: 'yellow',
    approved: 'blue',
    sent: 'indigo',
    received: 'green',
    invoiced: 'purple',
    paid: 'green', // Changed from emerald to green for consistency
    cancelled: 'red'
  }

  const color = statusColorMap[status?.toLowerCase()] || 'gray'
  const displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Draft'

  return <Badge color={color} withDot>{displayStatus}</Badge>
}
