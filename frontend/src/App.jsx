import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import HealthPage from './pages/HealthPage'
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage'
import PurchaseOrderEditPage from './pages/PurchaseOrderEditPage'
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
import ComponentsDemo from './pages/ComponentsDemo'
import GlowTestPage from './pages/GlowTestPage'
import SearchDemoPage from './pages/SearchDemoPage'

function App() {
 return (
 <BrowserRouter>
 <Routes>
 <Route path="/" element={<Navigate to="/dashboard" replace />} />
 <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
 <Route path="/active-jobs" element={<AppLayout><ActiveJobsPage /></AppLayout>} />
 <Route path="/jobs/:id" element={<AppLayout><JobDetailPage /></AppLayout>} />
 <Route path="/jobs/:id/setup" element={<AppLayout><JobSetupPage /></AppLayout>} />
 <Route path="/jobs/:id/schedule" element={<AppLayout><MasterSchedulePage /></AppLayout>} />
 <Route path="/price-books" element={<AppLayout><PriceBooksPage /></AppLayout>} />
 <Route path="/price-books/:id" element={<AppLayout><PriceBookItemDetailPage /></AppLayout>} />
 <Route path="/contacts" element={<AppLayout><ContactsPage /></AppLayout>} />
 <Route path="/contacts/:id" element={<AppLayout><ContactDetailPage /></AppLayout>} />
 <Route path="/suppliers" element={<Navigate to="/contacts" replace />} />
 <Route path="/suppliers/new" element={<AppLayout><SupplierNewPage /></AppLayout>} />
 <Route path="/suppliers/:id/edit" element={<AppLayout><SupplierEditPage /></AppLayout>} />
 <Route path="/suppliers/:id" element={<AppLayout><SupplierDetailPage /></AppLayout>} />
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
 <Route path="/settings/xero/callback" element={<XeroCallbackPage />} />
 <Route path="/components-demo" element={<AppLayout><ComponentsDemo /></AppLayout>} />
 <Route path="/glow-test" element={<AppLayout><GlowTestPage /></AppLayout>} />
 <Route path="/search-demo" element={<AppLayout><SearchDemoPage /></AppLayout>} />
 </Routes>
 </BrowserRouter>
 )
}

export default App
