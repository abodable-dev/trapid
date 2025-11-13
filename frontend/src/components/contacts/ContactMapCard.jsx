import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPinIcon } from '@heroicons/react/24/outline'

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function ContactMapCard({ address }) {
  const [mapPosition, setMapPosition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (address) {
      geocodeAddress(address)
    } else {
      setLoading(false)
      setError('No address available')
    }
  }, [address])

  const geocodeAddress = async (addr) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(addr)}, Australia&` +
        `format=json&` +
        `limit=1`
      )

      const data = await response.json()

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        setMapPosition([lat, lon])
      } else {
        setError('Location not found on map')
        // Default to Brisbane if geocoding fails
        setMapPosition([-27.4698, 153.0251])
      }
    } catch (err) {
      console.error('Error geocoding address:', err)
      setError('Unable to load map')
      setMapPosition([-27.4698, 153.0251])
    } finally {
      setLoading(false)
    }
  }

  if (!address) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPinIcon className={`h-6 w-6 ${error ? 'text-gray-400' : 'text-green-600 dark:text-green-400'}`} />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Address Location
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {address}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading map...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
          </div>
        )}

        {mapPosition && !loading && (
          <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <MapContainer
              center={mapPosition}
              zoom={15}
              style={{ height: '300px', width: '100%' }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapPosition} />
            </MapContainer>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Click and drag to explore • Scroll to zoom
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
