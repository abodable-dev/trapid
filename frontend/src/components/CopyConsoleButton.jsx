import { useState, useEffect } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import consoleCapture from '../utils/consoleCapture'

export default function CopyConsoleButton() {
  const [logCount, setLogCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = consoleCapture.subscribe((logs) => {
      setLogCount(logs.length)
    })

    // Initialize count
    setLogCount(consoleCapture.getLogs().length)

    return unsubscribe
  }, [])

  const handleCopy = async () => {
    try {
      const result = await consoleCapture.copyToClipboard()
      console.log(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleClear = () => {
    consoleCapture.clear()
    console.clear()
    console.log('✨ Console cleared - fresh start for debugging!')
  }

  const handleHardRefresh = () => {
    window.location.reload()
  }

  const handleCopyScreen = async () => {
    try {
      // Dynamically import html2canvas to avoid loading it upfront
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(document.body, {
        logging: false,
        useCORS: true
      })

      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          console.log('📸 Screenshot copied to clipboard!')
        } catch (err) {
          console.error('Failed to copy screenshot:', err)
          alert('Screenshot captured but clipboard copy failed. Please use browser screenshot tools.')
        }
      })
    } catch (err) {
      console.error('Screenshot failed:', err)
      alert('Screenshot failed. Please try again.')
    }
  }

  const handleCopyBoth = async () => {
    try {
      // First copy console logs
      const consoleText = consoleCapture.getFormattedLogs()
      const header = `=== Console Logs Captured ===\nTotal Entries: ${consoleCapture.getLogs().length}\nCaptured at: ${new Date().toLocaleString()}\n\n`
      const fullText = header + consoleText

      // Then take screenshot
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(document.body, {
        logging: false,
        useCORS: true
      })

      canvas.toBlob(async (blob) => {
        try {
          // Copy both to clipboard - clipboard API supports multiple items
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': new Blob([fullText], { type: 'text/plain' }),
              'image/png': blob
            })
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          console.log('📋📸 Console logs and screenshot copied to clipboard!')
        } catch (err) {
          // Fallback: just copy text if combined copy fails
          await navigator.clipboard.writeText(fullText)
          console.warn('Could not copy image to clipboard, copied console logs only')
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      })
    } catch (err) {
      console.error('Combined copy failed:', err)
      alert('Failed to copy. Please try again.')
    }
  }

  // Only show in development or staging
  const isDev = import.meta.env.DEV
  const isStaging = window.location.hostname.includes('vercel.app') ||
                    window.location.hostname.includes('staging') ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1'

  if (!isDev && !isStaging) {
    return null
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-2 right-2 bg-gray-800 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-700 transition-all z-[9999]"
        title="Show Console Tools"
      >
        <ClipboardDocumentIcon className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md shadow-lg border-t border-gray-200/30 dark:border-gray-700/30 z-[9999] transition-all duration-300 group hover:py-1.5 py-0.5">
      <div className="flex items-center justify-between gap-3 max-w-screen-2xl mx-auto px-4">
        {/* Left side - Info (always visible) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Console
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {logCount}
          </span>
        </div>

        {/* Center - Actions (visible on hover) */}
        <div className="flex items-center gap-2 flex-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-10 overflow-hidden">
          <button
            onClick={handleCopy}
            disabled={logCount === 0}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : logCount === 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copied ? (
              <>
                <CheckIcon className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-3 w-3" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Clear
          </button>

          <button
            onClick={handleHardRefresh}
            className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Refresh
          </button>

          <button
            onClick={handleCopyScreen}
            className="px-2.5 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-600 transition-all"
          >
            Screenshot
          </button>

          <button
            onClick={handleCopyBoth}
            className="px-2.5 py-1 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-600 transition-all"
          >
            Copy Both
          </button>
        </div>

        {/* Right side - Close (visible on hover) */}
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          title="Hide console tools"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
