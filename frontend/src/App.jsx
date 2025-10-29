import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ImportPage from './pages/ImportPage'
import TablePage from './pages/TablePage'
import DesignerHome from './pages/designer/DesignerHome'
import TableSettings from './pages/designer/TableSettings'
import TableBuilder from './pages/designer/TableBuilder'
import Features from './pages/designer/Features'
import Menus from './pages/designer/Menus'
import Pages from './pages/designer/Pages'
import Experiences from './pages/designer/Experiences'
import Maintenance from './pages/designer/Maintenance'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/import" element={<AppLayout><ImportPage /></AppLayout>} />
        <Route path="/tables/:id" element={<AppLayout><TablePage /></AppLayout>} />
        <Route path="/designer" element={<AppLayout><DesignerHome /></AppLayout>} />
        <Route path="/designer/tables/new" element={<AppLayout><TableBuilder /></AppLayout>} />
        <Route path="/designer/tables/:id" element={<AppLayout><TableSettings /></AppLayout>} />
        <Route path="/designer/features" element={<AppLayout><Features /></AppLayout>} />
        <Route path="/designer/menus" element={<AppLayout><Menus /></AppLayout>} />
        <Route path="/designer/pages" element={<AppLayout><Pages /></AppLayout>} />
        <Route path="/designer/experiences" element={<AppLayout><Experiences /></AppLayout>} />
        <Route path="/designer/maintenance" element={<AppLayout><Maintenance /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
