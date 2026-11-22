import { useEffect, useState } from 'react'
import Button from './components/ui/Button.jsx'
import { Notice } from './components/ui/Feedback.jsx'
import Modal from './components/ui/Modal.jsx'
import LoginPage from './features/auth/pages/LoginPage.jsx'
import { logout } from './features/auth/services/authService.js'
import FeeManagementPage from './features/fees/management/pages/FeeManagementPage.jsx'
import PaymentSelectionPage from './features/fees/payment-selection/pages/PaymentSelectionPage.jsx'
import QueryRequestPage from './features/transactions/query-request/pages/QueryRequestPage.jsx'
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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    const requireLogin = () => setNeedsLogin(true)
    window.addEventListener('bluemoon:unauthorized', requireLogin)
    return () => window.removeEventListener('bluemoon:unauthorized', requireLogin)
  }, [])

  const handleAuthenticated = () => {
    setLogoutError('')
    setNeedsLogin(false)
    setSessionVersion((current) => current + 1)
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      setIsLogoutDialogOpen(false)
      setActivePage('management')
      setQueryContext({ apartmentId: null, selectedFeeIds: [] })
      setNeedsLogin(true)
    } catch (error) {
      // A 401 means the server has already rejected the session. The shared
      // API client also emits bluemoon:unauthorized for this case.
      if (error.status === 401) {
        setIsLogoutDialogOpen(false)
        return
      }
      setLogoutError(error.message || 'Không thể đăng xuất. Vui lòng thử lại.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (needsLogin) {
    return <LoginPage onAuthenticated={handleAuthenticated} />
  }

  const openQuery = ({ apartmentId, selectedFeeIds = [] }) => {
    setQueryContext({ apartmentId, selectedFeeIds })
    setActivePage('query')
  }

  return <>
    <div key={sessionVersion} className="bm-app-shell">
      <nav className="bm-app-nav" aria-label="Điều hướng chính">
        <div className="bm-app-nav__brand"><span className="bm-app-nav__brand-mark">☾</span><span>bluemoon</span></div>
        <div className="bm-app-nav__links">
          {NAV_ITEMS.map((item) => <button
            key={item.id}
            type="button"
            className={activePage === item.id ? 'is-active' : ''}
            aria-current={activePage === item.id ? 'page' : undefined}
            onClick={() => setActivePage(item.id)}
          >{item.label}</button>)}
        </div>
        <div className="bm-app-nav__actions">
          <Button
            variant="outline"
            size="small"
            icon="logOut"
            onClick={() => {
              setLogoutError('')
              setIsLogoutDialogOpen(true)
            }}
          >Đăng xuất</Button>
        </div>
      </nav>

      {activePage === 'management' && <FeeManagementPage />}
      {activePage === 'selection' && <PaymentSelectionPage onViewQuery={openQuery} />}
      {activePage === 'query' && <QueryRequestPage
        initialApartmentId={queryContext.apartmentId}
        initialSelectedFeeIds={queryContext.selectedFeeIds}
        onBackToSelection={() => setActivePage('selection')}
      />}
    </div>

    <Modal
      isOpen={isLogoutDialogOpen}
      onClose={() => { if (!isLoggingOut) setIsLogoutDialogOpen(false) }}
      title="Xác nhận đăng xuất"
      description="Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại?"
      footer={<>
        <Button variant="outline" disabled={isLoggingOut} onClick={() => setIsLogoutDialogOpen(false)}>Ở lại</Button>
        <Button variant="danger" icon="logOut" disabled={isLoggingOut} onClick={handleLogout}>
          {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </Button>
      </>}
    >
      {logoutError && <Notice variant="error">{logoutError}</Notice>}
      <p className="bm-logout-dialog__message">Sau khi đăng xuất, bạn sẽ cần đăng nhập lại để tiếp tục sử dụng Bluemoon.</p>
    </Modal>
  </>
}

export default App
