import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 200) // Match animation duration
  }

  if (!isVisible) return null

  // Icon and color mapping
  const config = {
    success: {
      Icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-500',
      iconColor: 'text-green-500'
    },
    error: {
      Icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-500',
      iconColor: 'text-red-500'
    },
    info: {
      Icon: Info,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-500',
      iconColor: 'text-blue-500'
    }
  }

  const { Icon, bgColor, borderColor, textColor, iconColor } = config[type] || config.success

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 border ${bgColor} ${borderColor} shadow-lg min-w-[300px] max-w-md ${
        isExiting ? 'animate-[slideDown_200ms_ease-in_forwards]' : 'animate-[slideUp_300ms_ease-out]'
      }`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
      <span className={`text-xs font-medium ${textColor} flex-1`}>{message}</span>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
