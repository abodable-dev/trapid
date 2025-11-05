import Badge from '../Badge'

export default function EstimateStatusBadge({ status }) {
  const statusColorMap = {
    pending: 'gray',
    matched: 'blue',
    imported: 'green',
    rejected: 'red'
  }

  const color = statusColorMap[status?.toLowerCase()] || 'gray'
  const displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'

  return <Badge color={color} withDot>{displayStatus}</Badge>
}
