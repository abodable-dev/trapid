import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import AppLayout from './components/layout/AppLayout'
import CopyConsoleButton from './components/CopyConsoleButton'

// Eager load: Critical pages that should load immediately
import Dashboard from './pages/Dashboard'
import AuthCallback from './pages/AuthCallback'

// Lazy load: Everything else (loads on-demand)
const ActiveJobsPage = lazy(() => import('./pages/ActiveJobsPage'))
const XestPage = lazy(() => import('./pages/XestPage'))
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'))
const JobSetupPage = lazy(() => import('./pages/JobSetupPage'))
const PriceBooksPage = lazy(() => import('./pages/PriceBooksPage'))
const PriceBookItemDetailPage = lazy(() => import('./pages/PriceBookItemDetailPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage'))
const ContactDetailPage = lazy(() => import('./pages/ContactDetailPage'))
const AccountsPage = lazy(() => import('./pages/AccountsPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const HealthPage = lazy(() => import('./pages/HealthPage'))
const PurchaseOrderDetailPage = lazy(() => import('./pages/PurchaseOrderDetailPage'))
const PurchaseOrderEditPage = lazy(() => import('./pages/PurchaseOrderEditPage'))
const PurchaseOrdersPage = lazy(() => import('./pages/PurchaseOrdersPage'))
const SupplierDetailPage = lazy(() => import('./pages/SupplierDetailPage'))
const SupplierEditPage = lazy(() => import('./pages/SupplierEditPage'))
const SupplierNewPage = lazy(() => import('./pages/SupplierNewPage'))
const ImportPage = lazy(() => import('./pages/ImportPage'))
const TablePage = lazy(() => import('./pages/TablePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const SchemaPage = lazy(() => import('./pages/SchemaPage'))
const XeroCallbackPage = lazy(() => import('./pages/XeroCallbackPage'))
const XeroSyncPage = lazy(() => import('./pages/XeroSyncPage'))
const OutlookPage = lazy(() => import('./pages/OutlookPage'))
const OneDrivePage = lazy(() => import('./pages/OneDrivePage'))
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage'))
const WorkflowAdminPage = lazy(() => import('./pages/WorkflowAdminPage'))
const PublicHolidaysPage = lazy(() => import('./pages/PublicHolidaysPage'))
const SystemPerformancePage = lazy(() => import('./pages/SystemPerformancePage'))

// Heavy components: Lazy load with priority (biggest bundle impact)
const MasterSchedulePage = lazy(() => import('./pages/MasterSchedulePage')) // 3,952 lines Gantt!
const PDFMeasurementTestPage = lazy(() => import('./pages/PDFMeasurementTestPage')) // PDF library
const DocumentsPage = lazy(() => import('./pages/DocumentsPage')) // PDF library
const DocumentationPage = lazy(() => import('./pages/DocumentationPage')) // TRAPID_DOCS viewer
const ChatPage = lazy(() => import('./pages/ChatPage')) // AI chat
const TrainingPage = lazy(() => import('./pages/TrainingPage')) // Jitsi video
const TrainingSessionPage = lazy(() => import('./pages/TrainingSessionPage')) // Jitsi video

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

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CopyConsoleButton />
        <Suspense fallback={<PageLoader />}>
          <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/chat" element={<AppLayout><ChatPage /></AppLayout>} />
        <Route path="/active-jobs" element={<AppLayout><ActiveJobsPage /></AppLayout>} />
        <Route path="/xest" element={<AppLayout><XestPage /></AppLayout>} />
        <Route path="/documents" element={<AppLayout><DocumentsPage /></AppLayout>} />
        <Route path="/documentation" element={<AppLayout><DocumentationPage /></AppLayout>} />
        <Route path="/pdf-measure-test" element={<AppLayout><PDFMeasurementTestPage /></AppLayout>} />
        <Route path="/jobs/:id/setup" element={<AppLayout><JobSetupPage /></AppLayout>} />
        <Route path="/jobs/:id/schedule" element={<AppLayout><MasterSchedulePage /></AppLayout>} />
        <Route path="/jobs/:id/:tab" element={<AppLayout><JobDetailPage /></AppLayout>} />
        <Route path="/jobs/:id" element={<AppLayout><JobDetailPage /></AppLayout>} />
        <Route path="/price-books" element={<AppLayout><PriceBooksPage /></AppLayout>} />
        <Route path="/price-books/:id" element={<AppLayout><PriceBookItemDetailPage /></AppLayout>} />
        <Route path="/contacts" element={<AppLayout><ContactsPage /></AppLayout>} />
        <Route path="/contacts/:id" element={<AppLayout><ContactDetailPage /></AppLayout>} />
        <Route path="/accounts" element={<AppLayout><AccountsPage /></AppLayout>} />
        <Route path="/users" element={<AppLayout><UsersPage /></AppLayout>} />
        <Route path="/health" element={<AppLayout><HealthPage /></AppLayout>} />
        <Route path="/system/performance" element={<AppLayout><SystemPerformancePage /></AppLayout>} />
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
        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
        <Route path="/settings/integrations" element={<AppLayout><SettingsPage /></AppLayout>} />
        <Route path="/settings/schema" element={<AppLayout><SchemaPage /></AppLayout>} />
        <Route path="/settings/xero/callback" element={<XeroCallbackPage />} />
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
