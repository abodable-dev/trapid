import { useState, useEffect } from 'react'
import { getNowInCompanyTimezone, getTodayAsString, getRelativeTime } from '../utils/timezoneUtils'
import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { api } from '../api'
import { formatCurrency } from '../utils/formatters'

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AccountsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPayables: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
  })
  const [recentPayments, setRecentPayments] = useState([])

  useEffect(() => {
    loadAccountsData()
  }, [])

  const loadAccountsData = async () => {
    try {
      setLoading(true)
      // Load purchase orders to calculate payables
      const poResponse = await api.get('/api/v1/purchase_orders')

      if (poResponse && Array.isArray(poResponse)) {
        const totalPayables = poResponse.reduce((sum, po) => sum + (parseFloat(po.total) || 0), 0)
        const paidAmount = poResponse
          .filter(po => po.status === 'paid')
          .reduce((sum, po) => sum + (parseFloat(po.total) || 0), 0)
        const unpaidAmount = totalPayables - paidAmount

        // Calculate overdue (rough estimation based on required_date)
        const today = new Date()
        const overdueAmount = poResponse
          .filter(po => {
            if (po.status === 'paid' || po.status === 'cancelled') return false
            if (!po.required_date) return false
            const requiredDate = new Date(po.required_date)
            return requiredDate < today
          })
          .reduce((sum, po) => sum + (parseFloat(po.total) || 0), 0)

        setStats({
          totalPayables,
          paidAmount,
          unpaidAmount,
          overdueAmount,
        })
      }

      // Load recent payments from all POs
      // For now, we'll just show a placeholder message
      setRecentPayments([])
    } catch (err) {
      console.error('Failed to load accounts data:', err)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      name: 'Total Payables',
      value: formatCurrency(stats.totalPayables),
      icon: BanknotesIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      description: 'Total amount in purchase orders',
    },
    {
      name: 'Paid',
      value: formatCurrency(stats.paidAmount),
      icon: CheckCircleIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      description: 'Successfully paid purchase orders',
    },
    {
      name: 'Unpaid',
      value: formatCurrency(stats.unpaidAmount),
      icon: ClockIcon,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
      description: 'Outstanding payments due',
    },
    {
      name: 'Overdue',
      value: formatCurrency(stats.overdueAmount),
      icon: ArrowTrendingDownIcon,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      description: 'Past due date payments',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading accounts data...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Accounts</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Overview of your accounts payable, payment status, and financial summary.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/xero"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Xero Integration
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 dark:bg-gray-800"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${stat.bgColor}`}>
                <stat.icon aria-hidden="true" className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
            </dd>
            <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6 dark:bg-gray-900/50">
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Links</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/purchase-orders"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Purchase Orders</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">View all purchase orders</p>
            </div>
          </Link>

          <Link
            to="/contacts"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div className="flex-shrink-0">
              <BanknotesIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Suppliers</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">Manage supplier accounts</p>
            </div>
          </Link>

          <Link
            to="/xero"
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Xero Sync</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">Sync with Xero accounting</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity / Payments */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Payments</h2>
        <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md dark:bg-gray-800">
          {recentPayments.length === 0 ? (
            <div className="px-4 py-12 text-center sm:px-6">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No recent payments</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Payment history will appear here as you record payments on purchase orders.
              </p>
              <div className="mt-6">
                <Link
                  to="/purchase-orders"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  View Purchase Orders
                </Link>
              </div>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPayments.map((payment) => (
                <li key={payment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(payment.amount)}
                      </p>
                      <div className="ml-2 flex flex-shrink-0">
                        <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800 dark:bg-green-500/10 dark:text-green-400">
                          Paid
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {payment.supplier_name || 'Unknown Supplier'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                        <p>{formatDate(payment.payment_date)}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
