import { useEffect, useState } from 'react'
import ResidentLayout from './layouts/ResidentLayout.jsx'
import LoginPage from './features/auth/pages/LoginPage.jsx'
import PaymentSelectionPage from './features/fees/payment-selection/pages/PaymentSelectionPage.jsx'
import QueryRequestPage from './features/transactions/query-request/pages/QueryRequestPage.jsx'
import FeeManagementPage from './features/fees/management/pages/FeeManagementPage.jsx'
import useAppRoute from './routing/useAppRoute.js'
import './App.css'

function App() {
  const { route, navigate } = useAppRoute()
  const [needsLogin, setNeedsLogin] = useState(false)
  const [sessionVersion, setSessionVersion] = useState(0)

  useEffect(() => {
    const requireLogin = () => setNeedsLogin(true)
    window.addEventListener('bluemoon:unauthorized', requireLogin)
    return () => window.removeEventListener('bluemoon:unauthorized', requireLogin)
  }, [])

  if (needsLogin) {
    return <LoginPage onAuthenticated={() => { setNeedsLogin(false); setSessionVersion((current) => current + 1) }} />
  }

  if (route.area === 'admin') return <FeeManagementPage key={sessionVersion} />

  return (
    <ResidentLayout key={sessionVersion} currentPage={route.page} onNavigate={navigate}>
      {route.page === 'payments' ? <PaymentSelectionPage onNavigate={navigate} /> : <QueryRequestPage />}
    </ResidentLayout>
  )
}

export default App
