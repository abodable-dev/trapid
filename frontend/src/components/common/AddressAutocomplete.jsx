import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to update map view when coordinates change
function MapUpdater({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView(position, 15)
    }
  }, [position, map])

  return null
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter address...',
  className = '',
  required = false,
  autoFocus = false
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mapPosition, setMapPosition] = useState([-27.4698, 153.0251]) // Brisbane, Australia default
  const [showMap, setShowMap] = useState(false)
  const debounceTimer = useRef(null)
  const wrapperRef = useRef(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch address suggestions from Nominatim
  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      // Using Nominatim for geocoding - free and no API key needed
      const url = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}, Australia&` + // Add Australia to query instead of countrycodes
        `format=json&` +
        `addressdetails=1&` +
        `limit=10`

      console.log('Fetching from URL:', url) // Debug the URL

      const response = await fetch(url)
      console.log('Response status:', response.status, response.statusText)
      const data = await response.json()
      console.log('Address search results:', data) // Debug logging
      setSuggestions(data || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  const handleSuggestionClick = (suggestion) => {
    const address = suggestion.display_name
    onChange(address)
    setSuggestions([])
    setShowSuggestions(false)

    // Update map position
    const lat = parseFloat(suggestion.lat)
    const lon = parseFloat(suggestion.lon)
    setMapPosition([lat, lon])
    setShowMap(true)
  }

  const formatAddress = (suggestion) => {
    // Format the address nicely
    const parts = []
    const addr = suggestion.address

    if (addr.house_number && addr.road) {
      parts.push(`${addr.house_number} ${addr.road}`)
    } else if (addr.road) {
      parts.push(addr.road)
    }

    if (addr.suburb || addr.neighbourhood) {
      parts.push(addr.suburb || addr.neighbourhood)
    }

    if (addr.state && addr.postcode) {
      parts.push(`${addr.state} ${addr.postcode}`)
    }

    return parts.length > 0 ? parts.join(', ') : suggestion.display_name
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className={className}
          required={required}
          autoFocus={autoFocus}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {formatAddress(suggestion)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {suggestion.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map preview */}
      {showMap && (
        <div className="mt-3 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <MapContainer
            center={mapPosition}
            zoom={15}
            style={{ height: '250px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapPosition} />
            <MapUpdater position={mapPosition} />
          </MapContainer>
          <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Location preview
            </p>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Hide map
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
