/**
 * Badge Component
 *
 * A reusable badge component following the standard Tailwind UI color pattern.
 * Ensures consistent color usage across the entire application.
 *
 * Usage:
 * <Badge color="green">Success</Badge>
 * <Badge color="red" withDot>Error</Badge>
 * <Badge color="yellow">Warning</Badge>
 *
 * Available colors:
 * - gray: Neutral/default states
 * - red: Errors, dangerous actions, cancelled states
 * - yellow: Warnings, pending states
 * - green: Success, completed, active states
 * - blue: Info, approved states
 * - indigo: Sent, processing states
 * - purple: Invoiced, special states
 * - pink: Custom/special states
 */

export default function Badge({ color = 'gray', children, withDot = false, className = '' }) {
  // Standard color patterns following Tailwind UI design system
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500',
    green: 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400',
  }

  const baseClasses = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium'
  const selectedColor = colorClasses[color] || colorClasses.gray

  return (
    <span className={`${baseClasses} ${selectedColor} ${className}`}>
      {withDot && (
        <svg className="h-1.5 w-1.5 fill-current mr-1.5" viewBox="0 0 6 6" aria-hidden="true">
          <circle cx={3} cy={3} r={3} />
        </svg>
      )}
      {children}
    </span>
  )
}
