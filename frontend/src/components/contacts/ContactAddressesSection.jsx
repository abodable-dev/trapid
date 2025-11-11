import { useState } from 'react'
import { MapPinIcon, PencilIcon, TrashIcon, PlusIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'

const ADDRESS_TYPES = ['STREET', 'POBOX', 'DELIVERY']

export default function ContactAddressesSection({ contactAddresses = [], onUpdate, isEditMode, contactId }) {
  const [editingAddress, setEditingAddress] = useState(null)
  const [newAddress, setNewAddress] = useState(null)

  const startEditing = (address) => {
    if (!isEditMode) return
    setEditingAddress({ ...address })
  }

  const startAdding = () => {
    setNewAddress({
      address_type: 'STREET',
      line1: '',
      line2: '',
      line3: '',
      line4: '',
      city: '',
      region: '',
      postal_code: '',
      country: 'Australia',
      attention_to: '',
      is_primary: contactAddresses.length === 0
    })
  }

  const cancelEditing = () => {
    setEditingAddress(null)
    setNewAddress(null)
  }

  const saveAddress = async (address, isNew = false) => {
    try {
      const updatedAddresses = isNew
        ? [...contactAddresses, address]
        : contactAddresses.map(a => a.id === address.id ? address : a)

      await onUpdate(updatedAddresses)
      cancelEditing()
    } catch (error) {
      console.error('Failed to save address:', error)
    }
  }

  const deleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const updatedAddresses = contactAddresses.filter(a => a.id !== addressId)
      await onUpdate(updatedAddresses)
    } catch (error) {
      console.error('Failed to delete address:', error)
    }
  }

  const formatAddress = (address) => {
    const parts = []
    if (address.line1) parts.push(address.line1)
    if (address.line2) parts.push(address.line2)
    if (address.line3) parts.push(address.line3)
    if (address.line4) parts.push(address.line4)

    const cityLine = [address.city, address.region, address.postal_code]
      .filter(Boolean)
      .join(' ')
    if (cityLine) parts.push(cityLine)

    if (address.country) parts.push(address.country)

    return parts.join(', ')
  }

  const renderAddressForm = (address, onChange) => (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Address Type</label>
          <select
            value={address.address_type}
            onChange={(e) => onChange({ ...address, address_type: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {ADDRESS_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {address.attention_to !== undefined && (
          <div className="flex-1">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Attention To</label>
            <input
              type="text"
              placeholder="Attention To"
              value={address.attention_to || ''}
              onChange={(e) => onChange({ ...address, attention_to: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
          Address Line 1
          <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
        </label>
        <input
          type="text"
          placeholder="Street address"
          value={address.line1 || ''}
          onChange={(e) => onChange({ ...address, line1: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
          Address Line 2
          <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
        </label>
        <input
          type="text"
          placeholder="Unit, building, etc."
          value={address.line2 || ''}
          onChange={(e) => onChange({ ...address, line2: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
            City
            <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
          </label>
          <input
            type="text"
            placeholder="City"
            value={address.city || ''}
            onChange={(e) => onChange({ ...address, city: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
            State/Region
            <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
          </label>
          <input
            type="text"
            placeholder="State"
            value={address.region || ''}
            onChange={(e) => onChange({ ...address, region: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
            Postal Code
            <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
          </label>
          <input
            type="text"
            placeholder="Postal code"
            value={address.postal_code || ''}
            onChange={(e) => onChange({ ...address, postal_code: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
            Country
            <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
          </label>
          <input
            type="text"
            placeholder="Country"
            value={address.country || ''}
            onChange={(e) => onChange({ ...address, country: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={address.is_primary}
          onChange={(e) => onChange({ ...address, is_primary: e.target.checked })}
          className="rounded"
        />
        Primary address
      </label>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <MapPinIcon className="h-5 w-5" />
          Addresses
          <ShieldCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
        </h3>
        {isEditMode && (
          <button
            onClick={startAdding}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <PlusIcon className="h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {contactAddresses.length === 0 && !newAddress && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No addresses</p>
      )}

      <div className="space-y-3">
        {contactAddresses.map((address) => (
          <div key={address.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {editingAddress?.id === address.id ? (
              // Edit mode
              <div>
                {renderAddressForm(editingAddress, setEditingAddress)}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => saveAddress(editingAddress)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {address.address_type}
                    </span>
                    {address.is_primary && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                        Primary
                      </span>
                    )}
                  </div>
                  {address.attention_to && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Attn: {address.attention_to}
                    </p>
                  )}
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                    {formatAddress(address) || 'No address details'}
                  </p>
                </div>
                {isEditMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(address)}
                      className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAddress(address.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add new address form */}
        {newAddress && (
          <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/10">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">New Address</p>
            {renderAddressForm(newAddress, setNewAddress)}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => saveAddress(newAddress, true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Add
              </button>
              <button
                onClick={cancelEditing}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <XCircleIcon className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
