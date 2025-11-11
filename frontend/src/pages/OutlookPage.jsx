import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OutlookPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Get screen dimensions
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height

    // Set window size (80% of screen)
    const windowWidth = Math.floor(screenWidth * 0.8)
    const windowHeight = Math.floor(screenHeight * 0.8)

    // Center the window
    const left = Math.floor((screenWidth - windowWidth) / 2)
    const top = Math.floor((screenHeight - windowHeight) / 2)

    // Window features for a more app-like experience
    const windowFeatures = `
      width=${windowWidth},
      height=${windowHeight},
      left=${left},
      top=${top},
      menubar=no,
      toolbar=no,
      location=no,
      status=yes,
      scrollbars=yes,
      resizable=yes
    `.replace(/\s+/g, '')

    // Open Outlook in a popup window
    const outlookWindow = window.open(
      'https://outlook.office365.com/mail/',
      'OutlookWebApp',
      windowFeatures
    )

    // Focus the new window if it opened successfully
    if (outlookWindow) {
      outlookWindow.focus()
    }

    // Navigate back to the previous page
    navigate(-1)
  }, [navigate])

  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Opening Outlook...</p>
      </div>
    </div>
  )
}