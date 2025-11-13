/**
 * Mapbox Geocoding API utilities
 *
 * Free tier: 100,000 requests/month
 * Docs: https://docs.mapbox.com/api/search/geocoding/
 */

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

/**
 * Search for address suggestions using Mapbox Geocoding API
 *
 * @param {string} query - The search query (e.g., "13 english place")
 * @param {Object} options - Search options
 * @param {string} options.country - Country code (default: 'au' for Australia)
 * @param {number} options.limit - Maximum number of results (default: 10)
 * @param {string} options.types - Comma-separated types (e.g., 'address,place')
 * @returns {Promise<Array>} Array of address suggestions
 */
export async function searchAddress(query, options = {}) {
  if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'your_mapbox_access_token_here') {
    console.error('Mapbox access token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file')
    throw new Error('Mapbox access token not configured')
  }

  if (!query || query.length < 3) {
    return []
  }

  const {
    country = 'au', // Australia
    limit = 10,
    types = 'address,place', // Address and place types
    proximity = '153.0251,-27.4698', // Brisbane, Australia (longitude,latitude)
  } = options

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      country,
      limit: limit.toString(),
      types,
      proximity, // Bias results towards Brisbane by default
      autocomplete: 'true',
    })

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform Mapbox results to a consistent format
    return data.features.map(feature => ({
      id: feature.id,
      text: feature.text,
      placeName: feature.place_name,
      center: feature.center, // [longitude, latitude]
      address: parseMapboxAddress(feature),
      bbox: feature.bbox, // Bounding box
      relevance: feature.relevance,
      raw: feature, // Keep raw data for debugging
    }))
  } catch (error) {
    console.error('Error searching address with Mapbox:', error)
    throw error
  }
}

/**
 * Reverse geocode coordinates to get address
 *
 * @param {number} longitude
 * @param {number} latitude
 * @returns {Promise<Object>} Address object
 */
export async function reverseGeocode(longitude, latitude) {
  if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'your_mapbox_access_token_here') {
    console.error('Mapbox access token not configured')
    throw new Error('Mapbox access token not configured')
  }

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      types: 'address',
    })

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?${params}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      return {
        placeName: feature.place_name,
        address: parseMapboxAddress(feature),
        center: feature.center,
        raw: feature,
      }
    }

    return null
  } catch (error) {
    console.error('Error reverse geocoding with Mapbox:', error)
    throw error
  }
}

/**
 * Parse Mapbox address context into structured components
 *
 * @param {Object} feature - Mapbox feature object
 * @returns {Object} Structured address components
 */
function parseMapboxAddress(feature) {
  const address = {
    houseNumber: '',
    street: '',
    suburb: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
  }

  // Extract from address property if available
  if (feature.address) {
    address.houseNumber = feature.address
  }

  // Parse context array for additional details
  if (feature.context) {
    feature.context.forEach(ctx => {
      const [type] = ctx.id.split('.')

      switch (type) {
        case 'postcode':
          address.postcode = ctx.text
          break
        case 'place':
          address.suburb = ctx.text
          break
        case 'region':
          address.state = ctx.text
          break
        case 'country':
          address.country = ctx.text
          break
        case 'locality':
          address.city = ctx.text
          break
      }
    })
  }

  // Street name is in the main text
  if (feature.text) {
    address.street = feature.text
  }

  // For addresses with house numbers, remove the number from street name
  if (address.houseNumber && address.street.startsWith(address.houseNumber)) {
    address.street = address.street.substring(address.houseNumber.length).trim()
  }

  return address
}

/**
 * Format address for display (similar to Google Maps style)
 *
 * @param {Object} addressComponents - Parsed address components
 * @returns {string} Formatted address string
 */
export function formatAddress(addressComponents) {
  const parts = []

  if (addressComponents.houseNumber) {
    parts.push(addressComponents.houseNumber)
  }

  if (addressComponents.street) {
    parts.push(addressComponents.street)
  }

  if (addressComponents.suburb) {
    parts.push(addressComponents.suburb)
  }

  if (addressComponents.state) {
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
    parts.push(stateAbbr[addressComponents.state] || addressComponents.state)
  }

  if (addressComponents.postcode) {
    parts.push(addressComponents.postcode)
  }

  return parts.join(', ')
}
