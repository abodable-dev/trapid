import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  BanknotesIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  PencilIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import api from '../api'

export default function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BuildingOfficeIcon },
    { id: 'directors', name: 'Directors', icon: UserGroupIcon },
    { id: 'financial', name: 'Financial', icon: BanknotesIcon },
    { id: 'assets', name: 'Assets', icon: TruckIcon },
    { id: 'compliance', name: 'Compliance', icon: ClipboardDocumentCheckIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
    { id: 'activity', name: 'Activity', icon: ClockIcon }
  ]

  useEffect(() => {
    loadCompany()
  }, [id])

  const loadCompany = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/companies/${id}`)
      setCompany(response.company)
    } catch (error) {
      console.error('Failed to load company:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading company...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Company not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/corporate/companies')}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Companies
      </button>

      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-10 w-10 text-gray-400 mr-4" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  {company.formatted_acn && (
                    <span>ACN: {company.formatted_acn}</span>
                  )}
                  {company.formatted_abn && (
                    <span>ABN: {company.formatted_abn}</span>
                  )}
                  {company.company_group && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {company.company_group.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  )}
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {company.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/corporate/companies/${id}/edit`)}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                  ${isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'overview' && <OverviewTab company={company} />}
        {activeTab === 'directors' && <DirectorsTab company={company} onUpdate={loadCompany} />}
        {activeTab === 'financial' && <FinancialTab company={company} />}
        {activeTab === 'assets' && <AssetsTab company={company} />}
        {activeTab === 'compliance' && <ComplianceTab company={company} onUpdate={loadCompany} />}
        {activeTab === 'documents' && <DocumentsTab company={company} onUpdate={loadCompany} />}
        {activeTab === 'activity' && <ActivityTab company={company} />}
      </div>
    </div>
  )
}

// Placeholder tab components (we'll create full versions later)
function OverviewTab({ company }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Company Information</h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Legal Name</dt>
          <dd className="mt-1 text-sm text-gray-900">{company.name}</dd>
        </div>
        {company.date_incorporated && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Date Incorporated</dt>
            <dd className="mt-1 text-sm text-gray-900">{new Date(company.date_incorporated).toLocaleDateString()}</dd>
          </div>
        )}
        {company.registered_office_address && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Registered Office</dt>
            <dd className="mt-1 text-sm text-gray-900">{company.registered_office_address}</dd>
          </div>
        )}
        {company.principal_place_of_business && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Principal Place of Business</dt>
            <dd className="mt-1 text-sm text-gray-900">{company.principal_place_of_business}</dd>
          </div>
        )}
        {company.is_trustee && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Trust Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{company.trust_name || 'N/A'}</dd>
          </div>
        )}
        {company.gst_registration_status && (
          <div>
            <dt className="text-sm font-medium text-gray-500">GST Status</dt>
            <dd className="mt-1 text-sm text-gray-900">{company.gst_registration_status}</dd>
          </div>
        )}
      </dl>

      {company.current_directors && company.current_directors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Current Directors</h4>
          <ul className="space-y-2">
            {company.current_directors.map((director) => (
              <li key={director.id} className="text-sm text-gray-900">
                {director.full_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function DirectorsTab({ company, onUpdate }) {
  return <div>Directors tab - Component will be created separately</div>
}

function FinancialTab({ company }) {
  return <div>Financial tab - Component will be created separately</div>
}

function AssetsTab({ company }) {
  return <div>Assets tab - Component will be created separately</div>
}

function ComplianceTab({ company, onUpdate }) {
  return <div>Compliance tab - Component will be created separately</div>
}

function DocumentsTab({ company, onUpdate }) {
  return <div>Documents tab - Component will be created separately</div>
}

function ActivityTab({ company }) {
  return <div>Activity tab - Component will be created separately</div>
}
