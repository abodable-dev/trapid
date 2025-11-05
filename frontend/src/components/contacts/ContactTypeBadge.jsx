import { UserIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export default function ContactTypeBadge({ type }) {
  const config = {
    customer: {
      bgColor: 'bg-blue-100 dark:bg-blue-900/40',
      textColor: 'text-blue-800 dark:text-blue-200',
      borderColor: 'border-blue-200 dark:border-blue-800/50',
      label: 'Customer',
      Icon: UserIcon
    },
    supplier: {
      bgColor: 'bg-green-100 dark:bg-green-900/40',
      textColor: 'text-green-800 dark:text-green-200',
      borderColor: 'border-green-200 dark:border-green-800/50',
      label: 'Supplier',
      Icon: BuildingOfficeIcon
    },
    both: {
      bgColor: 'bg-purple-100 dark:bg-purple-900/40',
      textColor: 'text-purple-800 dark:text-purple-200',
      borderColor: 'border-purple-200 dark:border-purple-800/50',
      label: 'Both',
      Icon: UserGroupIcon
    }
  }

  const { bgColor, textColor, borderColor, label, Icon } = config[type] || config.customer

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${bgColor} ${textColor} ${borderColor}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
