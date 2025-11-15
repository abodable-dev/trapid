import { useState, useEffect } from 'react'
import { ClipboardDocumentIcon, CheckIcon, ExclamationTriangleIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import consoleCapture from '../utils/consoleCapture'

export default function CopyConsoleButton() {
  const [logCount, setLogCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [copiedButton, setCopiedButton] = useState(null) // Track which button was clicked
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = consoleCapture.subscribe((logs) => {
      setLogCount(logs.length)
      // Count errors and warnings
      const errors = logs.filter(log => log.type === 'error' || log.type === 'warn').length
      setErrorCount(errors)
    })

    // Initialize counts
    const logs = consoleCapture.getLogs()
    setLogCount(logs.length)
    const errors = logs.filter(log => log.type === 'error' || log.type === 'warn').length
    setErrorCount(errors)

    return unsubscribe
  }, [])

  const handleCopy = async () => {
    try {
      const result = await consoleCapture.copyToClipboard()
      console.log(result)
      setCopiedButton('console')
      setTimeout(() => setCopiedButton(null), 2000)
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
    // Set flag to clear console after reload
    sessionStorage.setItem('clearConsoleAfterReload', 'true')
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
          setCopiedButton('screenshot')
          setTimeout(() => setCopiedButton(null), 2000)
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

  /**
   * Ultra-light HTML simplification for token reduction
   *
   * This aggressive processing reduces HTML tokens by 80-90% while keeping critical structure.
   * Future Claude: This is essential for staying under token limits when debugging complex UIs.
   *
   * What gets removed:
   * 1. Dropdown options (biggest win - 500+ options → 1 line)
   * 2. Tooltip/help text (invisible divs with documentation)
   * 3. Title/placeholder attributes (redundant for debugging)
   * 4. Visual classes (padding, margins, colors - keep only layout)
   * 5. Positioning divs (resize handles, spacers)
   * 6. Draggable handles (not needed for understanding structure)
   *
   * What's preserved:
   * - Semantic HTML structure (main, nav, table, form elements)
   * - Form element types and values
   * - aria-label (for understanding element purpose)
   * - Critical layout classes (flex, grid, w-full, sticky, relative, absolute)
   */
  const simplifyHTMLUltraLight = (html) => {
    return html
      // PHASE 1: Remove bulk content (80% of token savings)
      // Replace massive dropdown option lists with summary
      .replace(/<option[^>]*>.*?<\/option>/gi, (match, offset, string) => {
        // Keep first option, replace rest
        const selectStart = string.lastIndexOf('<select', offset)
        const selectEnd = string.indexOf('</select>', offset)
        if (selectStart !== -1 && selectEnd !== -1) {
          // Only show selected value or first option
          if (match.includes('selected') || offset === string.indexOf('<option', selectStart)) {
            return match
          }
          return '' // Remove non-selected options
        }
        return match
      })
      .replace(/<\/option>\s*<option[^>]*>/gi, '</option>')  // Collapse consecutive options
      .replace(/(<select[^>]*>)(<option[^>]*>[^<]*<\/option>)(<option[^>]*>[\s\S]*?)?(<\/select>)/gi,
        '$1$2...[more options]...$4')

      // Remove invisible tooltip/help divs (they're huge and not needed for debugging)
      .replace(/<div class="[^"]*invisible[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')

      // Remove draggable handle divs (not needed for debugging)
      .replace(/<div[^>]*draggable="true"[^>]*>[\s\S]*?<\/div>/gi, '')

      // Remove resize handle divs (positioning-only, no semantic value)
      .replace(/<div class="[^"]*cursor-col-resize[^"]*"[^>]*><\/div>/gi, '')

      // PHASE 2: Remove redundant attributes (10% savings)
      .replace(/\s+data-[a-z-]+="[^"]*"/gi, '')
      .replace(/\s+aria-(?!label)[a-z-]+="[^"]*"/gi, '')
      .replace(/\s+id="[^"]*"/gi, '')
      .replace(/\s+tabindex="[^"]*"/gi, '')
      .replace(/\s+style="[^"]*"/gi, '')
      .replace(/\s+title="[^"]*"/gi, '')  // Remove tooltips
      .replace(/\s+placeholder="[^"]*"/gi, '')  // Remove placeholders

      // PHASE 3: Simplify SVGs (5% savings)
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '<svg>...</svg>')

      // PHASE 4: Ultra-aggressive class pruning (5% savings)
      // Only keep absolutely critical layout classes
      .replace(/class="[^"]*"/g, (match) => {
        const classes = match.match(/class="([^"]*)"/)[1]
        const simplified = classes.split(' ').filter(c =>
          // Keep only these essential layout classes
          c === 'flex' || c === 'grid' || c === 'relative' || c === 'absolute' ||
          c === 'sticky' || c === 'fixed' || c === 'hidden' ||
          c.startsWith('w-') || c.startsWith('h-') || c.startsWith('max-w-') || c.startsWith('max-h-') ||
          c.startsWith('overflow-') || c.startsWith('z-') ||
          c === 'sr-only' // Keep screen reader only for accessibility context
        ).join(' ')
        return simplified ? `class="${simplified}"` : ''
      })

      // PHASE 5: Cleanup empty attributes and whitespace
      .replace(/\s+[a-z-]+=""\s*/gi, ' ')
      .replace(/\s+>/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const handleGetScreenCode = async () => {
    try {
      // Get the main content area (exclude the console bar itself)
      const mainContent = document.querySelector('main') || document.body

      // Extract relevant HTML structure
      const clone = mainContent.cloneNode(true)

      // Remove script tags and style elements to reduce noise
      clone.querySelectorAll('script, style, link[rel="stylesheet"]').forEach(el => el.remove())

      // Get the outer HTML
      let html = clone.outerHTML

      // Apply ultra-light simplification for maximum token reduction
      html = simplifyHTMLUltraLight(html)

      // Copy to clipboard
      await navigator.clipboard.writeText(html)
      setCopiedButton('code')
      setTimeout(() => setCopiedButton(null), 2000)
      console.log('💻 Screen code copied to clipboard! (Ultra-light HTML structure)')
    } catch (err) {
      console.error('Failed to get screen code:', err)
      alert('Failed to extract screen code. Please try again.')
    }
  }

  const handleGetContext = async () => {
    try {
      const logs = consoleCapture.getLogs()

      // Get ALL errors and ALL warnings (no filtering, no limits)
      const errors = logs.filter(log => log.type === 'error')
      const warnings = logs.filter(log => log.type === 'warn')

      // Get last 5 info/log messages for context (skip debug noise)
      const recentLogs = logs
        .filter(log => log.type === 'log' || log.type === 'info')
        .slice(-5)

      // Check for failed network requests
      const networkErrors = []
      if (window.performance && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType('resource')
        resources.forEach(resource => {
          if (resource.transferSize === 0 && resource.decodedBodySize === 0) {
            networkErrors.push(`Failed to load: ${resource.name}`)
          }
        })
      }

      // Check for React errors in the page
      const reactErrors = []
      const errorBoundaries = document.querySelectorAll('[data-error-boundary]')
      errorBoundaries.forEach(el => {
        const errorMsg = el.getAttribute('data-error-message')
        if (errorMsg) {
          reactErrors.push(errorMsg)
        }
      })

      let formatted = `=== ALL RELEVANT CONSOLE DATA ===
Total Console Logs: ${logs.length}
🚨 ALL Errors Found: ${errors.length}
⚠️  ALL Warnings Found: ${warnings.length}
🌐 Network Errors: ${networkErrors.length}
📋 Recent Logs (last 5): ${recentLogs.length}
Captured at: ${new Date().toLocaleString()}

NOTE: This includes EVERY error and warning from console, not partial data.
`

      if (errors.length > 0) {
        formatted += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 ALL CONSOLE ERRORS (${errors.length} total):\n`
        errors.forEach((log, index) => {
          const time = new Date(log.timestamp).toLocaleTimeString()
          formatted += `\nError ${index + 1}/${errors.length}:\n[${time}] ${log.message}\n`
        })
        formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      }

      if (networkErrors.length > 0) {
        formatted += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 NETWORK ERRORS (${networkErrors.length} total):\n`
        networkErrors.forEach((error, index) => {
          formatted += `\nNetwork Error ${index + 1}/${networkErrors.length}:\n${error}\n`
        })
        formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      }

      if (warnings.length > 0) {
        formatted += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ALL CONSOLE WARNINGS (${warnings.length} total):\n`
        warnings.forEach((log, index) => {
          const time = new Date(log.timestamp).toLocaleTimeString()
          formatted += `\nWarning ${index + 1}/${warnings.length}:\n[${time}] ${log.message}\n`
        })
        formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      }

      if (recentLogs.length > 0) {
        formatted += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RECENT CONTEXT LOGS (last ${recentLogs.length}):\n`
        recentLogs.forEach(log => {
          const time = new Date(log.timestamp).toLocaleTimeString()
          formatted += `\n[${time}] ${log.message}\n`
        })
        formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      }

      if (errors.length === 0 && warnings.length === 0 && networkErrors.length === 0) {
        formatted += '\n✅ No errors or warnings found. Everything looks good!\n'
      }

      await navigator.clipboard.writeText(formatted)
      setCopiedButton('context')
      setTimeout(() => setCopiedButton(null), 2000)
      console.log(`🎯 ALL relevant data copied! ${errors.length} errors, ${warnings.length} warnings, ${networkErrors.length} network errors, ${recentLogs.length} recent logs (from ${logs.length} total logs)`)
    } catch (err) {
      console.error('Failed to get context:', err)
      alert('Failed to extract console context. Please try again.')
    }
  }

  const handleGetCompleteContext = async () => {
    try {
      const logs = consoleCapture.getLogs()

      // Get screen HTML code
      const mainContent = document.querySelector('main') || document.body
      const clone = mainContent.cloneNode(true)
      clone.querySelectorAll('script, style, link[rel="stylesheet"]').forEach(el => el.remove())
      let html = clone.outerHTML

      // Apply ultra-light simplification for maximum token reduction
      html = simplifyHTMLUltraLight(html)

      // Format all console logs
      const formattedLogs = logs.map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString()
        return `[${time}] [${log.type.toUpperCase()}] ${log.message}`
      }).join('\n\n')

      // Combine everything
      let formatted = `╔════════════════════════════════════════════════════════════════════════╗
║                   COMPLETE CONTEXT (EVERYTHING)                       ║
║  ALL Console Logs (${logs.length} total) + Page HTML Structure                ║
╚════════════════════════════════════════════════════════════════════════╝

📊 SUMMARY:
URL: ${window.location.href}
Page Title: ${document.title}
Total Console Logs: ${logs.length}
Captured at: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════════════════════════
                       ALL CONSOLE LOGS
═══════════════════════════════════════════════════════════════════════════

${formattedLogs}

═══════════════════════════════════════════════════════════════════════════
                        PAGE HTML STRUCTURE
═══════════════════════════════════════════════════════════════════════════

${html}

═══════════════════════════════════════════════════════════════════════════
                              END OF CONTEXT
═══════════════════════════════════════════════════════════════════════════
`

      await navigator.clipboard.writeText(formatted)
      setCopiedButton('complete')
      setTimeout(() => setCopiedButton(null), 2000)
      console.log(`📦 Complete context copied! ${logs.length} console logs + page HTML structure`)
    } catch (err) {
      console.error('Failed to get complete context:', err)
      alert('Failed to extract complete context. Please try again.')
    }
  }

  const handleGetFullContext = async () => {
    try {
      const logs = consoleCapture.getLogs()

      // Get ALL errors and ALL warnings
      const errors = logs.filter(log => log.type === 'error')
      const warnings = logs.filter(log => log.type === 'warn')
      const recentLogs = logs.filter(log => log.type === 'log' || log.type === 'info').slice(-5)

      // Check for failed network requests
      const networkErrors = []
      if (window.performance && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType('resource')
        resources.forEach(resource => {
          if (resource.transferSize === 0 && resource.decodedBodySize === 0) {
            networkErrors.push(`Failed to load: ${resource.name}`)
          }
        })
      }

      // Get screen HTML code
      const mainContent = document.querySelector('main') || document.body
      const clone = mainContent.cloneNode(true)
      clone.querySelectorAll('script, style, link[rel="stylesheet"]').forEach(el => el.remove())
      let html = clone.outerHTML

      // Apply ultra-light simplification for maximum token reduction
      html = simplifyHTMLUltraLight(html)

      // Combine everything
      let formatted = `╔════════════════════════════════════════════════════════════════════════╗
║                     FULL DEBUG CONTEXT                                ║
║  Console Errors + Warnings + Recent Logs + Page HTML Structure       ║
╚════════════════════════════════════════════════════════════════════════╝

📊 SUMMARY:
URL: ${window.location.href}
Page Title: ${document.title}
Total Console Logs: ${logs.length}
🚨 Errors: ${errors.length}
⚠️  Warnings: ${warnings.length}
🌐 Network Errors: ${networkErrors.length}
📋 Recent Logs: ${recentLogs.length}
Captured at: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════════════════════════
                           CONSOLE DATA
═══════════════════════════════════════════════════════════════════════════
`

      if (errors.length > 0) {
        formatted += `\n🚨 ALL CONSOLE ERRORS (${errors.length} total):\n`
        errors.forEach((log, index) => {
          const time = new Date(log.timestamp).toLocaleTimeString()
          formatted += `\nError ${index + 1}/${errors.length}:\n[${time}] ${log.message}\n`
        })
      }

      if (networkErrors.length > 0) {
        formatted += `\n🌐 NETWORK ERRORS (${networkErrors.length} total):\n`
        networkErrors.forEach((error, index) => {
          formatted += `\nNetwork Error ${index + 1}/${networkErrors.length}:\n${error}\n`
        })
      }

      if (warnings.length > 0) {
        formatted += `\n⚠️  ALL CONSOLE WARNINGS (${warnings.length} total):\n`
        warnings.forEach((log, index) => {
          const time = new Date(log.timestamp).toLocaleTimeString()
          formatted += `\nWarning ${index + 1}/${warnings.length}:\n[${time}] ${log.message}\n`
        })
      }

      if (recentLogs.length > 0) {
        formatted += `\n📋 RECENT CONTEXT LOGS (last ${recentLogs.length}):\n`
        recentLogs.forEach(log => {
          const time = new Date(log.timestamp).toLocaleTimeString()
          formatted += `\n[${time}] ${log.message}\n`
        })
      }

      if (errors.length === 0 && warnings.length === 0 && networkErrors.length === 0) {
        formatted += '\n✅ No errors or warnings found in console.\n'
      }

      formatted += `\n\n═══════════════════════════════════════════════════════════════════════════
                        PAGE HTML STRUCTURE
═══════════════════════════════════════════════════════════════════════════

${html}

═══════════════════════════════════════════════════════════════════════════
                              END OF CONTEXT
═══════════════════════════════════════════════════════════════════════════
`

      await navigator.clipboard.writeText(formatted)
      setCopiedButton('fullcontext')
      setTimeout(() => setCopiedButton(null), 2000)
      console.log(`🎯 Full debug context copied! ${errors.length} errors, ${warnings.length} warnings + page HTML structure`)
    } catch (err) {
      console.error('Failed to get full context:', err)
      alert('Failed to extract full context. Please try again.')
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
        className="fixed bottom-1 right-1 bg-gray-800 text-white p-1 rounded-full shadow-lg hover:bg-gray-700 transition-all z-[9999]"
        title="Show Console Tools"
      >
        <ClipboardDocumentIcon className="h-3 w-3" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-t border-gray-200 dark:border-gray-700 z-[9999] py-1">
      <div className="flex items-center justify-between gap-1.5 max-w-screen-2xl mx-auto px-2">
        {/* Left side - Info */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
            Console
          </span>
          <span className="text-[10px] px-1.5 py-0 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            {logCount}
          </span>
        </div>

        {/* Center - Actions (always visible) */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          <button
            onClick={handleCopy}
            disabled={logCount === 0}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
              copiedButton === 'console'
                ? 'bg-green-600 text-white'
                : logCount === 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copiedButton === 'console' ? (
              <>
                <CheckIcon className="h-2.5 w-2.5" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-2.5 w-2.5" />
                Console
                {logCount > 0 && (
                  <span className="ml-0.5 px-1 py-0 rounded-full bg-indigo-800 text-white text-[9px] font-bold">
                    {logCount}
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={handleGetContext}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
              copiedButton === 'context'
                ? 'bg-green-600 text-white'
                : 'bg-yellow-400 dark:bg-yellow-500 text-black dark:text-black hover:bg-yellow-500 dark:hover:bg-yellow-600'
            }`}
            title="Get ALL errors + warnings from console (no HTML)"
          >
            {copiedButton === 'context' ? (
              <>
                <CheckIcon className="h-2.5 w-2.5" />
                Copied!
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="h-2.5 w-2.5" />
                Console
                {errorCount > 0 && (
                  <span className="ml-0.5 px-1 py-0 rounded-full bg-red-600 text-white text-[9px] font-bold">
                    {errorCount}
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500 text-white hover:bg-red-600 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-2.5 w-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Clear
          </button>

          <button
            onClick={handleCopyScreen}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
              copiedButton === 'screenshot'
                ? 'bg-green-600 text-white'
                : 'bg-purple-100 dark:bg-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-600'
            }`}
          >
            {copiedButton === 'screenshot' ? (
              <>
                <CheckIcon className="h-2.5 w-2.5" />
                Copied!
              </>
            ) : (
              'Screenshot'
            )}
          </button>

          <button
            onClick={handleGetScreenCode}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
              copiedButton === 'code'
                ? 'bg-green-600 text-white'
                : 'bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-600'
            }`}
            title="Get page HTML structure (no console data)"
          >
            {copiedButton === 'code' ? (
              <>
                <CheckIcon className="h-2.5 w-2.5" />
                Copied!
              </>
            ) : (
              <>
                <CodeBracketIcon className="h-2.5 w-2.5" />
                Screenshot
              </>
            )}
          </button>

          <button
            onClick={handleHardRefresh}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-500 text-white hover:bg-green-600 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-2.5 w-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>

          <button
            onClick={handleGetCompleteContext}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
              copiedButton === 'complete'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Get ALL console logs + page HTML (everything)"
          >
            {copiedButton === 'complete' ? (
              <>
                <CheckIcon className="h-2.5 w-2.5" />
                Copied!
              </>
            ) : (
              <>
                Con/Screen
                {logCount > 0 && (
                  <span className="ml-0.5 px-1 py-0 rounded-full bg-gray-400 dark:bg-gray-600 text-white text-[9px] font-bold">
                    {logCount}
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={handleGetFullContext}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
              copiedButton === 'fullcontext'
                ? 'bg-green-600 text-white'
                : 'bg-orange-100 dark:bg-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-600'
            }`}
            title="Get ALL errors + warnings + page HTML in one copy (complete debug context)"
          >
            {copiedButton === 'fullcontext' ? (
              <>
                <CheckIcon className="h-2.5 w-2.5" />
                Copied!
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="h-2.5 w-2.5" />
                <CodeBracketIcon className="h-2.5 w-2.5" />
                Con/Screen
                {errorCount > 0 && (
                  <span className="ml-0.5 px-1 py-0 rounded-full bg-red-600 text-white text-[9px] font-bold">
                    {errorCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* Right side - Close */}
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 transition-colors"
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
