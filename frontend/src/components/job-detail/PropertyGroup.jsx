/**
 * PropertyGroup component for organizing related properties
 * Features a colored header with icon following the vibrant design system
 */
export default function PropertyGroup({ title, icon: Icon, color = 'indigo', children }) {
 const colorClasses = {
 indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
 blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
 green: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900',
 yellow: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900',
 purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900',
 pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900',
 red: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900',
 gray: 'bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-900',
 }

 return (
 <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
 <div className={`px-4 py-3 border-b ${colorClasses[color]}`}>
 <div className="flex items-center gap-2">
 {Icon && <Icon className="h-5 w-5" />}
 <h3 className="text-sm font-semibold">{title}</h3>
 </div>
 </div>
 <dl className="px-4 py-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
 {children}
 </dl>
 </div>
 )
}
