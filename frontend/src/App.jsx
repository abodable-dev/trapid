import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ImportPage from './pages/ImportPage'
import TablePage from './pages/TablePage'
import ActiveJobsPage from './pages/ActiveJobsPage'
import JobDetailPage from './pages/JobDetailPage'
import PriceBooksPage from './pages/PriceBooksPage'
import SuppliersPage from './pages/SuppliersPage'
import ContactDetailPage from './pages/ContactDetailPage'
import DesignerHome from './pages/designer/DesignerHome'
import TableSettings from './pages/designer/TableSettings'
import TableBuilder from './pages/designer/TableBuilder'
import Features from './pages/designer/Features'
import Menus from './pages/designer/Menus'
import Pages from './pages/designer/Pages'
import Experiences from './pages/designer/Experiences'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/active-jobs" element={<AppLayout><ActiveJobsPage /></AppLayout>} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/price-books" element={<AppLayout><PriceBooksPage /></AppLayout>} />
        <Route path="/suppliers" element={<AppLayout><SuppliersPage /></AppLayout>} />
        <Route path="/contacts/:id" element={<AppLayout><ContactDetailPage /></AppLayout>} />
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
