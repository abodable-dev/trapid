import { ChevronRightIcon } from '@heroicons/react/24/outline'

export default function Breadcrumb({ items }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRightIcon className="w-4 h-4" />}
          <span className={index === items.length - 1 ? 'font-medium text-gray-900 dark:text-white' : ''}>
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
