import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function PricebookMatchPreview({ isOpen, onClose, matches, onApplyMatches }) {
  const [selectedMatches, setSelectedMatches] = useState(() => {
    // By default, select all matches with 70% or higher similarity
    const initialSelected = {}
    matches.forEach((match, index) => {
      if (match.similarity >= 70 && match.item_id) {
        initialSelected[index] = true
      }
    })
    return initialSelected
  })
  const [applying, setApplying] = useState(false)

  const toggleMatch = (index) => {
    setSelectedMatches(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const toggleAll = () => {
    const allSelected = Object.keys(selectedMatches).length === matches.filter(m => m.item_id).length
    if (allSelected) {
      setSelectedMatches({})
    } else {
      const newSelected = {}
      matches.forEach((match, index) => {
        if (match.item_id) {
          newSelected[index] = true
        }
      })
      setSelectedMatches(newSelected)
    }
  }

  const selectHighConfidenceMatches = () => {
    const newSelected = {}
    matches.forEach((match, index) => {
      if (match.item_id && match.similarity >= 90) {
        newSelected[index] = true
      }
    })
    setSelectedMatches(newSelected)
  }

  const handleApply = async () => {
    const acceptedMatches = matches
      .filter((match, index) => selectedMatches[index])
      .map(match => ({
        file_id: match.file_id,
        item_id: match.item_id,
        filename: match.filename,
        item_code: match.item_code
      }))

    setApplying(true)
    try {
      await onApplyMatches(acceptedMatches)
      onClose()
    } catch (err) {
      // Error is handled by parent
    } finally {
      setApplying(false)
    }
  }

  const selectedCount = Object.keys(selectedMatches).filter(k => selectedMatches[k]).length
  const matchedCount = matches.filter(m => m.item_id).length
  const unmatchedCount = matches.filter(m => !m.item_id).length

  const getSimilarityColor = (similarity) => {
    if (similarity === 100) return 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
    if (similarity >= 80) return 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
    if (similarity >= 70) return 'text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
    return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
  }

  const getFileTypeLabel = (fileType) => {
    switch (fileType) {
      case 'photo': return 'Photo'
      case 'spec': return 'Spec'
      case 'qr_code': return 'QR Code'
      default: return 'File'
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Review Pricebook Matches
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Review and select which file-to-item matches you want to apply. Only selected matches will be synced.
                      </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Total Files:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{matches.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Matched:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{matchedCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Unmatched:</span>
                          <span className="font-medium text-red-600 dark:text-red-400">{unmatchedCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Selected:</span>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">{selectedCount}</span>
                        </div>
                      </div>

                      {/* Quick Select Buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={selectHighConfidenceMatches}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                        >
                          Select 90%+
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMatches({})}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Match List */}
                    <div className="mt-6 max-h-96 overflow-y-auto border dark:border-gray-700 rounded-lg">
                      {matches.length === 0 ? (
                        <div className="py-12 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files found</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            No files were found in the selected OneDrive folder.
                          </p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Make sure you have image files (jpg, png, etc.) in your "Photos for Price Book" folder.
                          </p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                            <tr>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <input
                                  type="checkbox"
                                  checked={selectedCount === matchedCount && matchedCount > 0}
                                  onChange={toggleAll}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Filename
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Type
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Matched Item
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Similarity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {matches.map((match, index) => (
                            <tr key={index} className={selectedMatches[index] ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                              <td className="px-3 py-4 whitespace-nowrap">
                                {match.item_id ? (
                                  <input
                                    type="checkbox"
                                    checked={selectedMatches[index] || false}
                                    onChange={() => toggleMatch(index)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                  />
                                ) : (
                                  <XCircleIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                )}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
                                <div className="max-w-xs truncate" title={match.filename}>
                                  {match.filename}
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {getFileTypeLabel(match.file_type)}
                              </td>
                              <td className="px-3 py-4 text-sm">
                                {match.item_id ? (
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{match.item_code}</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs max-w-md truncate" title={match.item_name}>
                                      {match.item_name}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500 italic">No match found</span>
                                )}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                {match.item_id ? (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSimilarityColor(match.similarity)}`}>
                                    {match.similarity}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={selectedCount === 0 || applying}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Applying...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        Apply {selectedCount} Match{selectedCount !== 1 ? 'es' : ''}
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
