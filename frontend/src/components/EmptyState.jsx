/**
 * EmptyState Component
 *
 * A reusable empty state component that follows the Midday design system
 * for showing helpful, engaging empty states across the app.
 */

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  size = 'large'
}) {
  const iconSize = size === 'large' ? 'h-16 w-16' : 'h-12 w-12'
  const iconInnerSize = size === 'large' ? 'h-8 w-8' : 'h-5 w-5'
  const padding = size === 'large' ? 'py-16' : 'py-12'
  const titleSize = size === 'large' ? 'text-sm' : 'text-xs'

  return (
    <div className={`flex flex-col items-center justify-center ${padding} px-4`}>
      {/* Icon */}
      <div className={`flex items-center justify-center ${iconSize} rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-4`}>
        <Icon className={`${iconInnerSize} text-gray-400`} />
      </div>

      {/* Title */}
      <h3 className={`${titleSize} font-medium text-gray-900 dark:text-white mb-2`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actions.map((action, index) => action)}
        </div>
      )}
    </div>
  )
}
