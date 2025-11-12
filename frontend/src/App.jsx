import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ImportPage from './pages/ImportPage'
import TablePage from './pages/TablePage'
import ActiveJobsPage from './pages/ActiveJobsPage'
import JobDetailPage from './pages/JobDetailPage'
import JobSetupPage from './pages/JobSetupPage'
import PriceBooksPage from './pages/PriceBooksPage'
import PriceBookItemDetailPage from './pages/PriceBookItemDetailPage'
import SuppliersPage from './pages/SuppliersPage'
import SupplierDetailPage from './pages/SupplierDetailPage'
import SupplierEditPage from './pages/SupplierEditPage'
import SupplierNewPage from './pages/SupplierNewPage'
import ContactsPage from './pages/ContactsPage'
import ContactDetailPage from './pages/ContactDetailPage'
import AccountsPage from './pages/AccountsPage'
import UsersPage from './pages/UsersPage'
import HealthPage from './pages/HealthPage'
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage'
import PurchaseOrderEditPage from './pages/PurchaseOrderEditPage'
import PurchaseOrdersPage from './pages/PurchaseOrdersPage'
import MasterSchedulePage from './pages/MasterSchedulePage'
import DesignerHome from './pages/designer/DesignerHome'
import TableSettings from './pages/designer/TableSettings'
import TableBuilder from './pages/designer/TableBuilder'
import Features from './pages/designer/Features'
import Menus from './pages/designer/Menus'
import Pages from './pages/designer/Pages'
import Experiences from './pages/designer/Experiences'
import SettingsPage from './pages/SettingsPage'
import SchemaPage from './pages/SchemaPage'
import XeroCallbackPage from './pages/XeroCallbackPage'
import XeroSyncPage from './pages/XeroSyncPage'
import OutlookPage from './pages/OutlookPage'
import OneDrivePage from './pages/OneDrivePage'
import DocumentsPage from './pages/DocumentsPage'
import ChatPage from './pages/ChatPage'
import WorkflowsPage from './pages/WorkflowsPage'
import WorkflowAdminPage from './pages/WorkflowAdminPage'
import PublicHolidaysPage from './pages/PublicHolidaysPage'
import AuthCallback from './pages/AuthCallback'
import PDFMeasurementTestPage from './pages/PDFMeasurementTestPage'
import TrainingPage from './pages/TrainingPage'
import TrainingSessionPage from './pages/TrainingSessionPage'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/chat" element={<AppLayout><ChatPage /></AppLayout>} />
        <Route path="/active-jobs" element={<AppLayout><ActiveJobsPage /></AppLayout>} />
        <Route path="/documents" element={<AppLayout><DocumentsPage /></AppLayout>} />
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
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
