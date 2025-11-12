import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPinIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to handle map clicks in edit mode
function MapClickHandler({ isEditMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isEditMode) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

// Component to update map center when position changes
function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

export default function LocationMapCard({ jobId, location, latitude, longitude, onLocationUpdate }) {
  const [mapPosition, setMapPosition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [tempPosition, setTempPosition] = useState(null)
  const [saving, setSaving] = useState(false)
  const [searchAddress, setSearchAddress] = useState('')
  const [searchSuburb, setSearchSuburb] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [suburbSuggestions, setSuburbSuggestions] = useState([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [showSuburbSuggestions, setShowSuburbSuggestions] = useState(false)
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [searchingSuburb, setSearchingSuburb] = useState(false)
  const [lotNumber, setLotNumber] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [showLotNumberPrompt, setShowLotNumberPrompt] = useState(false)
  const [pendingSaveData, setPendingSaveData] = useState(null)

  useEffect(() => {
    // If we have saved coordinates, use them
    if (latitude && longitude) {
      setMapPosition([parseFloat(latitude), parseFloat(longitude)])
      setLoading(false)
    } else if (location) {
      // Otherwise, geocode the address
      geocodeAddress(location)
    } else {
      // No location or coordinates - default to Brisbane
      setMapPosition([-27.4698, 153.0251])
      setLoading(false)
    }
  }, [location, latitude, longitude])

  // Debounced address search
  useEffect(() => {
    if (!searchAddress) return
    const timer = setTimeout(() => {
      searchForAddress(searchAddress)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchAddress])

  // Debounced suburb search
  useEffect(() => {
    if (!searchSuburb) return
    const timer = setTimeout(() => {
      searchForSuburb(searchSuburb)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchSuburb])

  const geocodeAddress = async (address) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(address)}, Australia&` +
        `format=json&` +
        `limit=1`
      )

      const data = await response.json()

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        setMapPosition([lat, lon])
      } else {
        setError('Location not found on map - Click Edit to place pin manually')
        // Default to Brisbane if geocoding fails
        setMapPosition([-27.4698, 153.0251])
      }
    } catch (err) {
      console.error('Error geocoding address:', err)
      setError('Unable to load map - Click Edit to place pin manually')
      setMapPosition([-27.4698, 153.0251])
    } finally {
      setLoading(false)
    }
  }

  const searchForAddress = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
      return
    }

    setSearchingAddress(true)
    try {
      // Try multiple search strategies in parallel for better results
      const searches = [
        // Main search - restrict to Australia only
        fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}&` +
          `format=json&` +
          `addressdetails=1&` +
          `countrycodes=au&` +
          `limit=10`
        ),
        // If query looks like a street number + name, also try with "Queensland" appended
        query.match(/^\d+\s+\w+/) ? fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query + ', Queensland')}&` +
          `format=json&` +
          `addressdetails=1&` +
          `countrycodes=au&` +
          `limit=10`
        ) : null,
      ].filter(Boolean)

      const responses = await Promise.all(searches)
      const allData = await Promise.all(responses.map(r => r.json()))

      // Combine and deduplicate results based on place_id
      const combined = allData.flat()
      const unique = Array.from(new Map(combined.map(item => [item.place_id, item])).values())

      // Filter to only Australian addresses with suburb and postcode
      // Street address is NOT required - we'll prompt user to enter it manually
      const validAddresses = unique.filter(item => {
        const isAustralian = item.address?.country === 'Australia' ||
                            item.address?.country_code === 'au' ||
                            item.display_name?.includes('Australia')
        const hasSuburb = !!(item.address?.suburb || item.address?.city || item.address?.town)
        const hasPostcode = !!item.address?.postcode

        return isAustralian && hasSuburb && hasPostcode
      })

      // Sort by relevance (prefer results with house numbers)
      const sorted = validAddresses.sort((a, b) => {
        const aHasNumber = a.address?.house_number ? 1 : 0
        const bHasNumber = b.address?.house_number ? 1 : 0
        return bHasNumber - aHasNumber
      })

      console.log('Address search found:', sorted.length, 'results')
      console.log('First result:', sorted[0])
      const suggestionsToShow = sorted.slice(0, 8)
      console.log('Setting suggestions:', suggestionsToShow)
      setAddressSuggestions(suggestionsToShow)
      setShowAddressSuggestions(suggestionsToShow.length > 0)
      console.log('Show suggestions set to:', suggestionsToShow.length > 0)
    } catch (err) {
      console.error('Error searching address:', err)
    } finally {
      setSearchingAddress(false)
    }
  }

  const searchForSuburb = async (query) => {
    if (query.length < 2) {
      setSuburbSuggestions([])
      setShowSuburbSuggestions(false)
      return
    }

    setSearchingSuburb(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}, Australia&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=5&` +
        `featuretype=city`
      )
      const data = await response.json()
      setSuburbSuggestions(data)
      setShowSuburbSuggestions(true)
    } catch (err) {
      console.error('Error searching suburb:', err)
    } finally {
      setSearchingSuburb(false)
    }
  }

  // Helper to parse address components from Nominatim result
  const parseAddressComponents = (suggestion) => {
    const addr = suggestion.address || {}
    return {
      lotNumber: addr.house_number || '',
      street: addr.road || '',
      suburb: addr.suburb || addr.city || addr.town || '',
      state: addr.state || '',
      postcode: addr.postcode || '',
      fullAddress: suggestion.display_name
    }
  }

  // Helper to validate required address components
  const validateAddress = (components) => {
    const errors = []
    // Street address is optional - we'll prompt user to enter it manually
    if (!components.suburb) errors.push('suburb')
    if (!components.postcode) errors.push('postcode')
    return {
      isValid: errors.length === 0,
      missingFields: errors,
      hasLotNumber: !!components.lotNumber
    }
  }

  // Helper to format address for job title (Lot XX Street Suburb State)
  const formatAddressForTitle = (lotNumber, street, suburb, state) => {
    const parts = []

    if (lotNumber) {
      parts.push(`Lot ${lotNumber}`)
    }

    // Only include street if provided (it's optional)
    if (street && street.trim()) {
      parts.push(street)
    }

    if (suburb) {
      parts.push(suburb)
    }

    if (state) {
      // Abbreviate state names
      const stateAbbr = {
        'Queensland': 'QLD',
        'New South Wales': 'NSW',
        'Victoria': 'VIC',
        'South Australia': 'SA',
        'Western Australia': 'WA',
        'Tasmania': 'TAS',
        'Northern Territory': 'NT',
        'Australian Capital Territory': 'ACT'
      }
      parts.push(stateAbbr[state] || state)
    }

    return parts.join(' ')
  }

  // Save location with validation and title update
  const saveLocationWithValidation = async (locationData) => {
    const { location, latitude, longitude, lotNumber: lot, street, suburb, state, updateTitle = true } = locationData

    setSaving(true)
    try {
      console.log('Saving location to backend:', { location, latitude, longitude })

      const updateData = {
        location,
        latitude,
        longitude
      }

      // If we have lot number, update the title with full address
      if (updateTitle && lot) {
        const newTitle = formatAddressForTitle(lot, street, suburb, state)
        updateData.title = newTitle
        console.log('Also updating job title to:', newTitle)
      }

      const response = await api.patch(`/api/v1/constructions/${jobId}`, {
        construction: updateData
      })
      console.log('Save successful, response:', response)

      // Notify parent component
      if (onLocationUpdate) {
        onLocationUpdate({
          location,
          latitude,
          longitude,
          ...(updateData.title && { title: updateData.title })
        })
      }

      setIsEditMode(false)
      setShowLotNumberPrompt(false)
      setPendingSaveData(null)
      setLotNumber('')
      setStreetAddress('')
      setError(null)
    } catch (err) {
      console.error('Error saving location:', err)
      console.error('Error details:', err.response?.data || err.message)
      setError('Failed to save location. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddressSelect = async (suggestion) => {
    console.log('handleAddressSelect called with:', suggestion.display_name)
    const lat = parseFloat(suggestion.lat)
    const lon = parseFloat(suggestion.lon)
    setTempPosition([lat, lon])
    setMapPosition([lat, lon])
    setSearchAddress(suggestion.display_name)
    setShowAddressSuggestions(false)

    // Parse and validate address
    const components = parseAddressComponents(suggestion)
    const validation = validateAddress(components)

    console.log('Address components:', components)
    console.log('Validation:', validation)

    // Check if address is missing required fields (suburb and postcode)
    if (!validation.isValid) {
      setError(`Cannot save: Missing ${validation.missingFields.join(' and ')}. Please select a complete address.`)
      return
    }

    // Pre-fill street address if available from search results
    if (components.street) {
      setStreetAddress(components.street)
    } else {
      setStreetAddress('')
    }

    // Store the address data for later save, but don't save yet
    // Allow user to enter lot number and street address, then adjust pin position
    setPendingSaveData({
      location: suggestion.display_name,
      latitude: lat,
      longitude: lon,
      street: components.street || '', // May be empty - user will enter it
      suburb: components.suburb,
      state: components.state,
      lotNumber: '', // User must enter lot number
      hasLotNumber: false // Always require lot number input
    })

    // Always prompt for lot number and street address
    setShowLotNumberPrompt(true)
    setError(null)
  }

  // Handle lot number and street address submission from prompt
  const handleLotNumberSubmit = () => {
    if (!lotNumber.trim()) {
      setError('Please enter a lot number')
      return
    }

    // Street address is REQUIRED when manually entering
    const street = streetAddress.trim() || pendingSaveData?.street
    if (!street) {
      setError('Please enter a street address')
      return
    }

    // Validate that street includes a street type (Street, Road, Court, etc.)
    const streetTypes = [
      'street', 'st', 'road', 'rd', 'avenue', 'ave', 'court', 'ct',
      'drive', 'dr', 'lane', 'ln', 'place', 'pl', 'crescent', 'cres',
      'terrace', 'tce', 'circuit', 'cct', 'boulevard', 'blvd', 'parade',
      'way', 'close', 'grove', 'parade', 'highway', 'hwy', 'esplanade'
    ]

    const streetLower = street.toLowerCase()
    const hasStreetType = streetTypes.some(type =>
      streetLower.endsWith(' ' + type) || streetLower.endsWith(type)
    )

    if (!hasStreetType) {
      setError('Please include the street type (e.g., "Main Street", "Main Road", "Main Court")')
      return
    }

    if (!pendingSaveData) {
      setError('No pending address data')
      return
    }

    // Update pending save data with the lot number and street address
    setPendingSaveData({
      ...pendingSaveData,
      lotNumber: lotNumber.trim(),
      street: street, // Use entered street or keep existing
      hasLotNumber: true
    })

    // Close the prompt and let user adjust pin before saving
    setShowLotNumberPrompt(false)
    setError(null)
  }

  const handleSuburbSelect = (suggestion) => {
    const lat = parseFloat(suggestion.lat)
    const lon = parseFloat(suggestion.lon)
    setMapPosition([lat, lon])
    setSearchSuburb(suggestion.display_name)
    setShowSuburbSuggestions(false)
    setError(null)
  }

  const handleEditClick = () => {
    setIsEditMode(true)
    setTempPosition(mapPosition)
    setSearchAddress('')
    setSearchSuburb('')
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setTempPosition(null)
    setError(null)
    setSearchAddress('')
    setSearchSuburb('')
    setAddressSuggestions([])
    setSuburbSuggestions([])
    setShowAddressSuggestions(false)
    setShowSuburbSuggestions(false)
    setShowLotNumberPrompt(false)
    setPendingSaveData(null)
    setLotNumber('')
    setStreetAddress('')
  }

  const handleMapClick = useCallback((latlng) => {
    setTempPosition([latlng.lat, latlng.lng])
    setError(null)
  }, [])

  const handleSave = async () => {
    if (!tempPosition) {
      setError('Please click on the map to place the pin')
      return
    }

    // If we have pending save data (from address selection), use it with validation
    if (pendingSaveData) {
      // Check if we have lot number
      if (!pendingSaveData.hasLotNumber) {
        setError('Please enter a lot number before saving')
        setShowLotNumberPrompt(true)
        return
      }

      // Save with full address data and title update
      await saveLocationWithValidation({
        location: pendingSaveData.location,
        latitude: tempPosition[0], // Use the adjusted position
        longitude: tempPosition[1],
        lotNumber: pendingSaveData.lotNumber,
        street: pendingSaveData.street,
        suburb: pendingSaveData.suburb,
        state: pendingSaveData.state
      })
    } else {
      // Manual pin placement without address selection - just save coordinates
      setSaving(true)
      try {
        await api.patch(`/api/v1/constructions/${jobId}`, {
          construction: {
            latitude: tempPosition[0],
            longitude: tempPosition[1]
          }
        })

        setMapPosition(tempPosition)
        setIsEditMode(false)
        setTempPosition(null)
        setError(null)

        // Notify parent component if callback provided
        if (onLocationUpdate) {
          onLocationUpdate({
            latitude: tempPosition[0],
            longitude: tempPosition[1]
          })
        }
      } catch (err) {
        console.error('Error saving location:', err)
        setError('Failed to save location. Please try again.')
      } finally {
        setSaving(false)
      }
    }
  }

  const displayPosition = isEditMode && tempPosition ? tempPosition : mapPosition

  // If no location and no saved coordinates, show default Brisbane location
  const hasNoLocation = !location && !latitude && !longitude

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <MapPinIcon className={`h-6 w-6 ${hasNoLocation ? 'text-gray-400' : 'text-green-600 dark:text-green-400'}`} />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Job Location
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {location || 'No location set - Click to add location pin'}
              </p>
            </div>
          </div>

          {!isEditMode ? (
            <button
              onClick={handleEditClick}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {hasNoLocation ? 'Add Pin' : 'Edit Pin'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !tempPosition}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {isEditMode && (
          <>
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Edit Mode:</strong> Search for an address or suburb below, then click on the map to fine-tune the pin location.
                This is useful for new estates where roads may not exist yet.
              </p>
            </div>

            {/* Lot Number and Street Address Prompt Modal */}
            {showLotNumberPrompt && (
              <div className="mb-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-500 dark:border-indigo-400 shadow-lg">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Enter Lot Number and Street Address
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Please enter the lot number and street address. Both are required. You can then adjust the pin location on the map if needed.
                  {pendingSaveData && lotNumber && streetAddress && (
                    <>
                      <br /><br />
                      The job title will be: <strong>"Lot {lotNumber} {streetAddress || pendingSaveData.street} {pendingSaveData.suburb} {pendingSaveData.state === 'Queensland' ? 'QLD' : pendingSaveData.state}"</strong>
                    </>
                  )}
                </p>
                <div className="space-y-3">
                  {/* Lot Number Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lot Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && lotNumber.trim()) {
                          // Move to street address field or submit if filled
                          const streetInput = document.getElementById('street-address-input')
                          if (streetInput && !streetAddress.trim()) {
                            streetInput.focus()
                          } else {
                            handleLotNumberSubmit()
                          }
                        }
                      }}
                      placeholder="e.g., 123"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>

                  {/* Street Address Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="street-address-input"
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && lotNumber.trim() && streetAddress.trim()) {
                          handleLotNumberSubmit()
                        }
                      }}
                      placeholder="e.g., Alperton Road, Main Street, Smith Court"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleLotNumberSubmit}
                      disabled={!lotNumber.trim() || (!streetAddress.trim() && !pendingSaveData?.street)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Continue
                    </button>
                    <button
                      onClick={() => {
                        setShowLotNumberPrompt(false)
                        setPendingSaveData(null)
                        setLotNumber('')
                        setStreetAddress('')
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Address Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Address
                </label>
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="e.g., 123 Main Street, Brisbane"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchingAddress && (
                  <div className="absolute right-3 top-10 text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                  </div>
                )}
                {showAddressSuggestions && (
                  <div
                    className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {(() => {
                      console.log('Rendering dropdown - showAddressSuggestions:', showAddressSuggestions, 'suggestions count:', addressSuggestions.length)
                      return null
                    })()}
                    {addressSuggestions.length > 0 ? (
                      addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAddressSelect(suggestion)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {suggestion.display_name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        No addresses found. Try a different search.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Suburb Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Suburb
                </label>
                <input
                  type="text"
                  value={searchSuburb}
                  onChange={(e) => setSearchSuburb(e.target.value)}
                  placeholder="e.g., Brisbane, Burbank"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchingSuburb && (
                  <div className="absolute right-3 top-10 text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                  </div>
                )}
                {showSuburbSuggestions && suburbSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suburbSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuburbSelect(suggestion)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading map...</p>
            </div>
          </div>
        )}

        {displayPosition && !loading && (
          <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <MapContainer
              center={displayPosition}
              zoom={15}
              style={{ height: '350px', width: '100%', cursor: isEditMode ? 'crosshair' : 'grab' }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={displayPosition} />
              <MapClickHandler isEditMode={isEditMode} onMapClick={handleMapClick} />
              <MapUpdater center={displayPosition} />
            </MapContainer>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center justify-between">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isEditMode
                  ? 'Click on the map to place the pin'
                  : 'Click and drag to explore • Scroll to zoom'}
              </p>
              {latitude && longitude && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
