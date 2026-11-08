import { useState } from 'react'
import ResidentLayout from './layouts/ResidentLayout.jsx'
import PaymentSelectionPage from './features/fees/payment-selection/pages/PaymentSelectionPage.jsx'
import QueryRequestPage from './features/transactions/query-request/pages/QueryRequestPage.jsx'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('payments')

  return (
    <ResidentLayout currentPage={activePage} onNavigate={setActivePage}>
      {activePage === 'payments' ? <PaymentSelectionPage onNavigate={setActivePage} /> : <QueryRequestPage />}
    </ResidentLayout>
  )
}

export default App
