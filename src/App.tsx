import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './lib/blink'
import { Toaster } from './components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'

// Pages
import Dashboard from './pages/Dashboard'
import FinancialDashboard from './pages/FinancialDashboard'
import Invoices from './pages/Invoices'
import Clients from './pages/Clients'
import Expenses from './pages/Expenses'
import Settings from './pages/Settings'
import InvoiceBuilder from './pages/InvoiceBuilder'
import PaymentSetup from './pages/PaymentSetup'
import EmailTemplates from './pages/EmailTemplates'
import Login from './pages/Login'

// Layout
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/financial-dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/financial-dashboard" element={<FinancialDashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<InvoiceBuilder />} />
          <Route path="/invoices/:id/edit" element={<InvoiceBuilder />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/payment-setup" element={<PaymentSetup />} />
          <Route path="/email-templates" element={<EmailTemplates />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <Toaster />
      <SonnerToaster position="top-right" />
    </Router>
  )
}

export default App