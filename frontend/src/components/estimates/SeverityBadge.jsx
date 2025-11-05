import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const severityConfig = {
  high: {
    color: 'red',
    label: 'High',
    bgClass: 'bg-red-100 dark:bg-red-400/10',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800',
    icon: ExclamationCircleIcon,
    description: 'Critical issue - >20% difference'
  },
  medium: {
    color: 'yellow',
    label: 'Medium',
    bgClass: 'bg-yellow-100 dark:bg-yellow-400/10',
    textClass: 'text-yellow-800 dark:text-yellow-500',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    icon: ExclamationTriangleIcon,
    description: 'Should review - 10-20% difference'
  },
  low: {
    color: 'green',
    label: 'Low',
    bgClass: 'bg-green-100 dark:bg-green-400/10',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-200 dark:border-green-800',
    icon: CheckCircleIcon,
    description: 'Minor variance - <10% difference'
  },
  info: {
    color: 'blue',
    label: 'Info',
    bgClass: 'bg-blue-100 dark:bg-blue-400/10',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800',
    icon: InformationCircleIcon,
    description: 'Missing or extra items'
  }
}

export default function SeverityBadge({ severity, showIcon = true, size = 'md' }) {
  const config = severityConfig[severity?.toLowerCase()] || severityConfig.info
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-md font-medium
        ${config.bgClass}
        ${config.textClass}
        ${sizeClasses[size]}
      `}
      title={config.description}
    >
      {showIcon && <Icon className={`${iconSizeClasses[size]} mr-1.5`} />}
      {config.label}
    </span>
  )
}
