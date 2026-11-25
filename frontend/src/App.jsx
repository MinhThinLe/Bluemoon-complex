import { useCallback, useEffect, useState } from 'react'
import LogoutControl from './features/auth/components/LogoutControl.jsx'
import LoginPage from './features/auth/pages/LoginPage.jsx'
import WelcomePage from './features/welcome/pages/WelcomePage.jsx'
import FeeManagementPage from './features/fees/management/pages/FeeManagementPage.jsx'
import PaymentSelectionPage from './features/fees/payment-selection/pages/PaymentSelectionPage.jsx'
import QueryRequestPage from './features/transactions/query-request/pages/QueryRequestPage.jsx'
import Icon from './components/ui/Icon.jsx'
import './app/app.css'

const NAV_ITEMS = [
  { id: 'management', label: 'Quản lý khoản thu' },
  { id: 'lookup', label: 'Tra cứu khoản thu' },
]

function App() {
  const [needsLogin, setNeedsLogin] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [activePage, setActivePage] = useState('management')
  const [queryContext, setQueryContext] = useState({ apartmentId: null, selectedFeeIds: [] })

  const requireLogin = useCallback(() => {
    setNeedsLogin(true)
    setShowWelcome(false)
    setActivePage('management')
    setQueryContext({ apartmentId: null, selectedFeeIds: [] })
  }, [])

  useEffect(() => {
    window.addEventListener('bluemoon:unauthorized', requireLogin)
    return () => window.removeEventListener('bluemoon:unauthorized', requireLogin)
  }, [requireLogin])

  if (needsLogin) {
    if (showWelcome) return <WelcomePage onStart={() => setShowWelcome(false)} />
    return <LoginPage onAuthenticated={() => {
      setNeedsLogin(false)
      setShowWelcome(false)
      setActivePage('management')
      setQueryContext({ apartmentId: null, selectedFeeIds: [] })
    }} />
  }

  const openQuery = ({ apartmentId, selectedFeeIds = [] }) => {
    setQueryContext({ apartmentId, selectedFeeIds })
    setActivePage('query')
  }
  const lookupActive = ['selection', 'query'].includes(activePage)

  return <div className="bm-app-shell">
    <nav className="bm-app-nav" aria-label="Điều hướng chính">
      <div className="bm-app-nav__inner">
        <div className="bm-app-nav__brand"><Icon name="moon" size={24} /><span>bluemoon</span></div>
        <div className="bm-app-nav__links">
          {NAV_ITEMS.map((item) => <button
            key={item.id}
            type="button"
            className={item.id === 'lookup' ? lookupActive ? 'is-active' : '' : activePage === item.id ? 'is-active' : ''}
            aria-current={item.id === 'lookup' ? lookupActive ? 'page' : undefined : activePage === item.id ? 'page' : undefined}
            onClick={() => setActivePage(item.id === 'lookup' ? 'selection' : item.id)}
          >{item.label}</button>)}
        </div>
        <div className="bm-app-nav__session"><LogoutControl onLogout={requireLogin} /></div>
      </div>
    </nav>

    {activePage === 'management' && <FeeManagementPage />}
    {activePage === 'selection' && <PaymentSelectionPage initialApartmentId={queryContext.apartmentId} initialSelectedFeeIds={queryContext.selectedFeeIds} onViewQuery={openQuery} />}
    {activePage === 'query' && <QueryRequestPage
      initialApartmentId={queryContext.apartmentId}
      initialSelectedFeeIds={queryContext.selectedFeeIds}
      onBackToSelection={() => setActivePage('selection')}
    />}
    <footer className="bm-app-footer"><div>BlueMoon · Quản lý khoản thu chung cư</div></footer>
  </div>
}

export default App
