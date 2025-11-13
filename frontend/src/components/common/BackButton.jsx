import { useNavigate } from 'react-router-dom'

export default function BackButton({ className = '' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <button
      onClick={handleBack}
      className={`text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors ${className}`}
      aria-label="Go back"
    >
      AI Builder
    </button>
  )
}
