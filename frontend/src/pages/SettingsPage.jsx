import AccountsLayout from '../components/layout/AccountsLayout'
import XeroConnection from '../components/settings/XeroConnection'

export default function SettingsPage() {
  return (
    <AccountsLayout>
      {/* Integrations Section */}
      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Integrations</h2>
          <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
            Connect third-party services to sync data and automate workflows.
          </p>
        </div>

        <div className="md:col-span-2">
          <XeroConnection />
        </div>
      </div>
    </AccountsLayout>
  )
}
