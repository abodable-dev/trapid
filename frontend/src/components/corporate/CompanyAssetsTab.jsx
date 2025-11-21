import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TruckIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import api from '../../api'

export default function CompanyAssetsTab({ company }) {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssets()
  }, [company.id])

  const loadAssets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/assets', {
        params: { company_id: company.id }
      })
      setAssets(response.assets || [])
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatAssetType = (type) => {
    if (!type) return ''
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading assets...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Company Assets</h3>
        <button
          onClick={() => navigate('/corporate/assets/new')}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Asset
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No assets</h3>
          <p className="mt-1 text-sm text-gray-500">This company has no assets registered.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => navigate(`/corporate/assets/${asset.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <h4 className="text-sm font-medium text-gray-900">
                      {asset.description}
                    </h4>
                    {asset.needs_attention && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                        Attention
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Type:</span> {formatAssetType(asset.asset_type)}
                    </div>
                    {asset.registration && (
                      <div>
                        <span className="font-medium">Rego:</span> {asset.registration}
                      </div>
                    )}
                    {asset.purchase_price && (
                      <div>
                        <span className="font-medium">Value:</span> {formatCurrency(asset.purchase_price)}
                      </div>
                    )}
                    <div>
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        asset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
