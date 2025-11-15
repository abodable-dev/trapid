import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon, LinkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function LinkXeroContactModal({ isOpen, onClose, contact, onSuccess }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedXeroContact, setSelectedXeroContact] = useState(null)
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setError(null)
    try {
      const response = await api.get(`/api/v1/xero/search_contacts?query=${encodeURIComponent(searchQuery)}`)
      if (response.success) {
        setSearchResults(response.contacts)
        if (response.contacts.length === 0) {
          setError('No Xero contacts found matching your search')
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to search Xero contacts')
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleLink = async () => {
    if (!selectedXeroContact) return

    setLinking(true)
    setError(null)
    try {
      const response = await api.post(`/api/v1/contacts/${contact.id}/link_xero_contact`, {
        xero_id: selectedXeroContact.xero_id
      })

      if (response.success) {
        onSuccess(response.contact)
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Failed to link contact to Xero')
      console.error('Link error:', err)
    } finally {
      setLinking(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedXeroContact(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <LinkIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-white">
                  Link {contact.full_name} to Xero Contact
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Search for the corresponding contact in Xero and link them to enable automatic syncing.
                  </p>
                </div>

                {/* Search Form */}
                <div className="mt-4">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or tax number..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        disabled={searching || linking}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={searching || !searchQuery.trim() || linking}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </form>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 max-h-96 overflow-y-auto">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Found {searchResults.length} contact{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2">
                      {searchResults.map((xeroContact) => (
                        <button
                          key={xeroContact.xero_id}
                          onClick={() => setSelectedXeroContact(xeroContact)}
                          disabled={linking}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                            selectedXeroContact?.xero_id === xeroContact.xero_id
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          } ${linking ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {xeroContact.name}
                                </p>
                                {selectedXeroContact?.xero_id === xeroContact.xero_id && (
                                  <CheckCircleIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                )}
                              </div>
                              {xeroContact.email && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {xeroContact.email}
                                </p>
                              )}
                              {xeroContact.tax_number && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  ABN: {xeroContact.tax_number}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                                ID: {xeroContact.xero_id}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
              <button
                type="button"
                onClick={handleLink}
                disabled={!selectedXeroContact || linking}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
              >
                {linking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Linking...
                  </>
                ) : (
                  'Link Contact'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={linking}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
