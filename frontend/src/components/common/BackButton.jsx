import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function BackButton({ className = '' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors ${className}`}
      aria-label="Go back"
    >
      <ArrowLeftIcon className="h-3 w-3" />
      Back
    </button>
  )
}
