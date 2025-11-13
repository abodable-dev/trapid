import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchDemoPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Search Interaction Demos</h1>
        <p className="text-gray-400">Test each search design to see which interaction feels best</p>
      </div>

      {/* Demo Grid */}
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Option 1: Spotlight Reveal */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Option 1: Spotlight Reveal</h2>
            <p className="text-sm text-gray-400">Icon stays centered, input slides out right with frosted glass backdrop</p>
          </div>
          <div className="flex items-center justify-center min-h-[300px] bg-gray-900/50 rounded-lg border border-gray-800">
            <SpotlightRevealSearch />
          </div>
        </div>

        {/* Option 2: Magnetic Slide */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Option 2: Magnetic Slide</h2>
            <p className="text-sm text-gray-400">Spring physics with overshoot, animated gradient border, background shift</p>
          </div>
          <div className="flex items-center justify-center min-h-[300px] bg-gray-900/50 rounded-lg border border-gray-800">
            <MagneticSlideSearch />
          </div>
        </div>

        {/* Option 3: Contextual Morph */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Option 3: Contextual Morph</h2>
            <p className="text-sm text-gray-400">Button morphs to input, text crossfade, underline animation</p>
          </div>
          <div className="flex items-center justify-center min-h-[300px] bg-gray-900/50 rounded-lg border border-gray-800">
            <ContextualMorphSearch />
          </div>
        </div>

      </div>
    </div>
  )
}

// Option 1: Spotlight Reveal
function SpotlightRevealSearch() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleCollapse = () => {
    setIsExpanded(false)
    setSearchValue('')
  }

  return (
    <div className="relative">
      {/* Frosted glass backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 animate-in fade-in duration-300"
          onClick={handleCollapse}
        />
      )}

      {/* Search container */}
      <div className="relative z-20">
        <div className="flex items-center gap-2">
          {/* Search icon - stays centered */}
          <button
            onClick={handleExpand}
            className={`
              flex items-center justify-center
              w-10 h-10 rounded-lg
              bg-gray-900 border border-gray-800
              text-gray-400 hover:text-white
              hover:border-gray-700 hover:shadow-lg hover:shadow-white/10
              transition-all duration-300
              ${isExpanded ? 'shadow-lg shadow-white/20' : ''}
            `}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Input slides out */}
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-out
              ${isExpanded ? 'w-80 opacity-100' : 'w-0 opacity-0'}
            `}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search price books..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-white transition-colors"
                autoFocus={isExpanded}
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Option 2: Magnetic Slide
function MagneticSlideSearch() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleToggle = () => {
    if (isExpanded && !searchValue) {
      setIsExpanded(false)
    } else if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleClear = () => {
    setSearchValue('')
    setIsExpanded(false)
  }

  return (
    <div className="relative">
      <div
        className={`
          flex items-center gap-2
          px-4 py-2 rounded-lg
          border-2 transition-all duration-500
          ${isExpanded
            ? 'w-96 bg-gradient-to-r from-gray-900 to-gray-800 border-white/20 shadow-lg shadow-white/10'
            : 'w-auto bg-gray-900 border-gray-800 hover:border-gray-700'
          }
          ${isExpanded && searchValue ? 'bg-gray-800' : ''}
        `}
        style={{
          animation: isExpanded ? 'spring-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
        }}
      >
        <button
          onClick={handleToggle}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder={isExpanded ? "Search price books..." : ""}
          className={`
            bg-transparent outline-none text-white placeholder:text-gray-500
            transition-all duration-300
            ${isExpanded ? 'w-full' : 'w-0'}
          `}
        />

        {searchValue && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors animate-in fade-in zoom-in duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes spring-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// Option 3: Contextual Morph
function ContextualMorphSearch() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleCollapse = () => {
    if (!searchValue) {
      setIsExpanded(false)
    }
  }

  const handleClear = () => {
    setSearchValue('')
    setIsExpanded(false)
  }

  return (
    <div
      className={`
        relative overflow-hidden
        transition-all duration-300 ease-out
        ${isExpanded ? 'w-96' : 'w-auto'}
      `}
    >
      {/* Button state */}
      {!isExpanded && (
        <button
          onClick={handleExpand}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-all duration-200 animate-in fade-in slide-in-from-left-2"
        >
          <Search className="w-5 h-5" />
          <span className="text-sm font-medium">Search</span>
        </button>
      )}

      {/* Input state */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus-within:border-white transition-colors">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onBlur={handleCollapse}
              placeholder="Search price books..."
              className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
              autoFocus
            />
            {searchValue && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault() // Prevent blur on input
                  handleClear()
                }}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Animated underline */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mt-1 animate-in slide-in-from-left duration-500" />
        </div>
      )}
    </div>
  )
}
