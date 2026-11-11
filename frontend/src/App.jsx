import { useEffect, useState } from 'react'
import LoginPage from './features/auth/pages/LoginPage.jsx'
import FeeManagementPage from './features/fees/management/pages/FeeManagementPage.jsx'
import PaymentSelectionPage from './features/fees/payment-selection/pages/PaymentSelectionPage.jsx'
import QueryRequestPage from './features/transactions/query-request/pages/QueryRequestPage.jsx'
import Icon from './components/ui/Icon.jsx'
import './app/app.css'

const NAV_ITEMS = [
  { id: 'management', label: 'Quản lý khoản thu' },
  { id: 'selection', label: 'Chọn khoản nộp' },
  { id: 'query', label: 'Tra cứu khoản thu' },
]

function App() {
  const [needsLogin, setNeedsLogin] = useState(true)
  const [sessionVersion, setSessionVersion] = useState(0)
  const [activePage, setActivePage] = useState('management')
  const [queryContext, setQueryContext] = useState({ apartmentId: null, selectedFeeIds: [] })

  useEffect(() => {
    const requireLogin = () => setNeedsLogin(true)
    window.addEventListener('bluemoon:unauthorized', requireLogin)
    return () => window.removeEventListener('bluemoon:unauthorized', requireLogin)
  }, [])

  if (needsLogin) {
    return <LoginPage onAuthenticated={() => {
      setNeedsLogin(false)
      setActivePage('management')
      setQueryContext({ apartmentId: null, selectedFeeIds: [] })
      setSessionVersion((current) => current + 1)
    }} />
  }

  const openQuery = ({ apartmentId, selectedFeeIds = [] }) => {
    setQueryContext({ apartmentId, selectedFeeIds })
    setActivePage('query')
  }

  return <div key={sessionVersion} className="bm-app-shell">
    <nav className="bm-app-nav" aria-label="Điều hướng chính">
      <div className="bm-app-nav__inner">
        <div className="bm-app-nav__brand"><Icon name="moon" size={24} /><span>bluemoon</span></div>
        <div className="bm-app-nav__links">
          {NAV_ITEMS.map((item) => <button
            key={item.id}
            type="button"
            className={activePage === item.id ? 'is-active' : ''}
            aria-current={activePage === item.id ? 'page' : undefined}
            onClick={() => setActivePage(item.id)}
          >{item.label}</button>)}
        </div>
        <div className="bm-app-nav__session"><span>Phiên làm việc hiện tại</span><span className="bm-app-nav__avatar"><Icon name="user" size={16} /></span></div>
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
