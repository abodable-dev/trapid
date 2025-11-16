import { useEffect, useState } from 'react'
import { getTodayInCompanyTimezone } from '../utils/timezoneUtils'
import { api } from '../api'
import {
  PlusIcon,
  TrashIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import Toast from '../components/Toast'

export default function PublicHolidaysPage() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedYear, setSelectedYear] = useState(getTodayInCompanyTimezone().getFullYear())
  const [selectedRegion, setSelectedRegion] = useState('QLD')
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Form state for new holiday
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    region: 'QLD'
  })

  const regions = ['QLD', 'NSW', 'VIC', 'SA', 'WA', 'TAS', 'NT', 'ACT']
  const years = Array.from({ length: 10 }, (_, i) => getTodayInCompanyTimezone().getFullYear() + i - 2)

  useEffect(() => {
    loadHolidays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedRegion])

  const loadHolidays = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/public_holidays', {
        params: {
          region: selectedRegion,
          year: selectedYear
        }
      })
      setHolidays(response.holidays || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load holidays:', err)
      setError('Failed to load public holidays')
    } finally {
      setLoading(false)
    }
  }

  const handleAddHoliday = async (e) => {
    e.preventDefault()

    if (!newHoliday.name || !newHoliday.date) {
      setToast({
        message: 'Please fill in all fields',
        type: 'error'
      })
      return
    }

    try {
      await api.post('/api/v1/public_holidays', {
        public_holiday: {
          name: newHoliday.name,
          date: newHoliday.date,
          region: newHoliday.region
        }
      })

      setToast({
        message: 'Public holiday added successfully',
        type: 'success'
      })

      setShowAddModal(false)
      setNewHoliday({ name: '', date: '', region: 'QLD' })
      loadHolidays()
    } catch (err) {
      console.error('Failed to add holiday:', err)
      setToast({
        message: err.response?.data?.errors?.join(', ') || 'Failed to add public holiday',
        type: 'error'
      })
    }
  }

  const handleDeleteHoliday = async (holiday) => {
    if (!confirm(`Delete ${holiday.name}?`)) {
      return
    }

    try {
      await api.delete(`/api/v1/public_holidays/${holiday.id}`)

      setToast({
        message: 'Public holiday deleted successfully',
        type: 'success'
      })

      loadHolidays()
    } catch (err) {
      console.error('Failed to delete holiday:', err)
      setToast({
        message: 'Failed to delete public holiday',
        type: 'error'
      })
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Public Holidays
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage public holidays for business day calculations
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Holiday
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Year
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="block w-40 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Region
          </label>
          <select
            id="region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="block w-40 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Holidays List */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #E5E7EB'
        }}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Holiday Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Region
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No public holidays found for {selectedYear} in {selectedRegion}
                    </p>
                  </td>
                </tr>
              ) : (
                holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {holiday.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(holiday.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {holiday.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteHoliday(holiday)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 2147483647 }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Add Public Holiday
              </h3>

              <form onSubmit={handleAddHoliday}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="holiday-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Holiday Name
                    </label>
                    <input
                      type="text"
                      id="holiday-name"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                      placeholder="e.g., Christmas Day"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="holiday-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="holiday-date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="holiday-region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Region
                    </label>
                    <select
                      id="holiday-region"
                      value={newHoliday.region}
                      onChange={(e) => setNewHoliday({ ...newHoliday, region: e.target.value })}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                      required
                    >
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setNewHoliday({ name: '', date: '', region: 'QLD' })
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Holiday
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
