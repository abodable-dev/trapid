import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import AppLayout from './components/layout/AppLayout'
import CopyConsoleButton from './components/CopyConsoleButton'

// Eager load: Critical pages that should load immediately
import Dashboard from './pages/Dashboard'
import AuthCallback from './pages/AuthCallback'
import AutoLoginPage from './pages/AutoLoginPage'
import Login from './pages/Login'

// Lazy load: Everything else (loads on-demand)
const ActiveJobsPage = lazy(() => import('./pages/ActiveJobsPage'))
const XestPage = lazy(() => import('./pages/XestPage'))
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'))
const JobSetupPage = lazy(() => import('./pages/JobSetupPage'))
const PriceBooksPage = lazy(() => import('./pages/PriceBooksPage'))
const PriceBooksPageWithTabs = lazy(() => import('./pages/PriceBooksPageWithTabs'))
const PriceBookItemDetailPage = lazy(() => import('./pages/PriceBookItemDetailPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage'))
const ContactDetailPage = lazy(() => import('./pages/ContactDetailPage'))
const AccountsPage = lazy(() => import('./pages/AccountsPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const SystemAdminPage = lazy(() => import('./pages/SystemAdminPage'))
const HealthPage = lazy(() => import('./pages/HealthPage'))
const PurchaseOrderDetailPage = lazy(() => import('./pages/PurchaseOrderDetailPage'))
const PurchaseOrderEditPage = lazy(() => import('./pages/PurchaseOrderEditPage'))
const PurchaseOrdersPage = lazy(() => import('./pages/PurchaseOrdersPage'))
const SupplierDetailPage = lazy(() => import('./pages/SupplierDetailPage'))
const SupplierEditPage = lazy(() => import('./pages/SupplierEditPage'))
const SupplierNewPage = lazy(() => import('./pages/SupplierNewPage'))
const ImportPage = lazy(() => import('./pages/ImportPage'))
const TablePage = lazy(() => import('./pages/TablePage'))
const SchemaPage = lazy(() => import('./pages/SchemaPage'))
const TableStandardTest = lazy(() => import('./pages/TableStandardTest'))
const XeroCallbackPage = lazy(() => import('./pages/XeroCallbackPage'))
const XeroSyncPage = lazy(() => import('./pages/XeroSyncPage'))
const OutlookPage = lazy(() => import('./pages/OutlookPage'))
const OneDrivePage = lazy(() => import('./pages/OneDrivePage'))
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage'))
const WorkflowAdminPage = lazy(() => import('./pages/WorkflowAdminPage'))
const PublicHolidaysPage = lazy(() => import('./pages/PublicHolidaysPage'))

// Heavy components: Lazy load with priority (biggest bundle impact)
const MasterSchedulePage = lazy(() => import('./pages/MasterSchedulePage')) // 3,952 lines Gantt!
const PDFMeasurementTestPage = lazy(() => import('./pages/PDFMeasurementTestPage')) // PDF library
const DocumentsPage = lazy(() => import('./pages/DocumentsPage')) // PDF library
const TrinityPage = lazy(() => import('./pages/TrinityPage')) // Trinity documentation viewer
const AgentTasksPage = lazy(() => import('./pages/AgentTasksPage')) // Agent task manager
const ChatPage = lazy(() => import('./pages/ChatPage')) // AI chat
const TrainingPage = lazy(() => import('./pages/TrainingPage')) // Jitsi video
const TrainingSessionPage = lazy(() => import('./pages/TrainingSessionPage')) // Jitsi video
const MeetingsPage = lazy(() => import('./pages/MeetingsPage')) // Meeting management
const MeetingTypesPage = lazy(() => import('./pages/MeetingTypesPage')) // Meeting types configuration
const SamPage = lazy(() => import('./pages/SamPage')) // Sam page

// Designer pages (admin tools)
const DesignerHome = lazy(() => import('./pages/designer/DesignerHome'))
const TableSettings = lazy(() => import('./pages/designer/TableSettings'))
const TableBuilder = lazy(() => import('./pages/designer/TableBuilder'))
const Features = lazy(() => import('./pages/designer/Features'))
const Menus = lazy(() => import('./pages/designer/Menus'))
const Pages = lazy(() => import('./pages/designer/Pages'))
const Experiences = lazy(() => import('./pages/designer/Experiences'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
)

// Component to add _God_LOVES_You_ to all URLs
const URLEnhancer = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if hash already has the message
    if (!location.hash.includes('_God_LOVES_You_')) {
      const searchPart = location.search || ''
      const newUrl = `${location.pathname}${searchPart}#_God_LOVES_You_`
      navigate(newUrl, { replace: true })
    }
  }, [location.pathname, location.search, location.hash, navigate])

  return null
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <URLEnhancer />
        <CopyConsoleButton />
        <Suspense fallback={<PageLoader />}>
          <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auto-login" element={<AutoLoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/chat" element={<AppLayout><ChatPage /></AppLayout>} />
        <Route path="/active-jobs" element={<AppLayout><ActiveJobsPage /></AppLayout>} />
        <Route path="/xest" element={<AppLayout><XestPage /></AppLayout>} />
        <Route path="/documents" element={<AppLayout><DocumentsPage /></AppLayout>} />
        <Route path="/trinity" element={<AppLayout><TrinityPage /></AppLayout>} />
        <Route path="/agents/tasks" element={<AppLayout><AgentTasksPage /></AppLayout>} />
        <Route path="/pdf-measure-test" element={<AppLayout><PDFMeasurementTestPage /></AppLayout>} />
        <Route path="/jobs/:id/setup" element={<AppLayout><JobSetupPage /></AppLayout>} />
        <Route path="/jobs/:id/schedule" element={<AppLayout><MasterSchedulePage /></AppLayout>} />
        <Route path="/jobs/:id/:tab" element={<AppLayout><JobDetailPage /></AppLayout>} />
        <Route path="/jobs/:id" element={<AppLayout><JobDetailPage /></AppLayout>} />
        <Route path="/meetings" element={<AppLayout><MeetingsPage /></AppLayout>} />
        <Route path="/meeting-types" element={<AppLayout><MeetingTypesPage /></AppLayout>} />
        <Route path="/sam" element={<AppLayout><SamPage /></AppLayout>} />
        <Route path="/price-books" element={<AppLayout><PriceBooksPageWithTabs /></AppLayout>} />
        <Route path="/price-books/:id" element={<AppLayout><PriceBookItemDetailPage /></AppLayout>} />
        <Route path="/contacts" element={<AppLayout><ContactsPage /></AppLayout>} />
        <Route path="/contacts/:id" element={<AppLayout><ContactDetailPage /></AppLayout>} />
        <Route path="/accounts" element={<AppLayout><AccountsPage /></AppLayout>} />
        <Route path="/users" element={<AppLayout><UsersPage /></AppLayout>} />
        <Route path="/health" element={<AppLayout><HealthPage /></AppLayout>} />
        <Route path="/permissions" element={<Navigate to="/admin/system?tab=permissions" replace />} />
        <Route path="/system/performance" element={<Navigate to="/admin/system?tab=performance" replace />} />
        <Route path="/suppliers" element={<Navigate to="/contacts" replace />} />
        <Route path="/suppliers/new" element={<AppLayout><SupplierNewPage /></AppLayout>} />
        <Route path="/suppliers/:id/edit" element={<AppLayout><SupplierEditPage /></AppLayout>} />
        <Route path="/suppliers/:id" element={<AppLayout><SupplierDetailPage /></AppLayout>} />
        <Route path="/purchase-orders" element={<AppLayout><PurchaseOrdersPage /></AppLayout>} />
        <Route path="/purchase-orders/:id/edit" element={<AppLayout><PurchaseOrderEditPage /></AppLayout>} />
        <Route path="/purchase-orders/:id" element={<AppLayout><PurchaseOrderDetailPage /></AppLayout>} />
        <Route path="/import" element={<AppLayout><ImportPage /></AppLayout>} />
        <Route path="/tables/:id" element={<AppLayout><TablePage /></AppLayout>} />
        <Route path="/designer" element={<AppLayout><DesignerHome /></AppLayout>} />
        <Route path="/designer/tables/new" element={<AppLayout><TableBuilder /></AppLayout>} />
        <Route path="/designer/tables/:id" element={<AppLayout><TableSettings /></AppLayout>} />
        <Route path="/designer/menus" element={<AppLayout><Menus /></AppLayout>} />
        <Route path="/designer/pages" element={<AppLayout><Pages /></AppLayout>} />
        <Route path="/designer/experiences" element={<AppLayout><Experiences /></AppLayout>} />
        <Route path="/designer/features" element={
          <AppLayout>
            {({ onOpenGrokChat }) => <Features onOpenGrokChat={onOpenGrokChat} />}
          </AppLayout>
        } />
        <Route path="/admin/system" element={<AppLayout><SystemAdminPage /></AppLayout>} />
        <Route path="/settings/schema" element={<AppLayout><SchemaPage /></AppLayout>} />
        <Route path="/settings/xero/callback" element={<XeroCallbackPage />} />
        <Route path="/table-test" element={<AppLayout><TableStandardTest /></AppLayout>} />
        <Route path="/xero" element={<AppLayout><XeroSyncPage /></AppLayout>} />
        <Route path="/outlook" element={<AppLayout><OutlookPage /></AppLayout>} />
        <Route path="/onedrive" element={<AppLayout><OneDrivePage /></AppLayout>} />
        <Route path="/workflows" element={<AppLayout><WorkflowsPage /></AppLayout>} />
        <Route path="/admin/workflows" element={<AppLayout><WorkflowAdminPage /></AppLayout>} />
        <Route path="/admin/public-holidays" element={<AppLayout><PublicHolidaysPage /></AppLayout>} />
        <Route path="/training" element={<AppLayout><TrainingPage /></AppLayout>} />
        <Route path="/training/:sessionId" element={<TrainingSessionPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
