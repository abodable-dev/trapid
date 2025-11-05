import { useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50'
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200'
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800'
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400'
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColor} ${borderColor} ${textColor} min-w-[300px] max-w-md animate-in slide-in-from-top-2 duration-300`}>
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  )
}
