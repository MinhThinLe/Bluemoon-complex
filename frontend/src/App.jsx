import { useEffect, useState } from 'react'
import LoginPage from './features/auth/pages/LoginPage.jsx'
import FeeManagementPage from './features/fees/management/pages/FeeManagementPage.jsx'

function App() {
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

  return <FeeManagementPage key={sessionVersion} />
}

export default App
