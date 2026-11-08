import { useCallback, useEffect, useState } from 'react'

const paths = {
  payments: '/',
  queries: '/queries',
  adminFees: '/admin/fees',
}

function resolveRoute(pathname) {
  if (pathname === paths.adminFees) return { area: 'admin', page: 'fees' }
  if (pathname === paths.queries) return { area: 'resident', page: 'queries' }
  return { area: 'resident', page: 'payments' }
}

export default function useAppRoute() {
  const [route, setRoute] = useState(() => resolveRoute(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => setRoute(resolveRoute(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((destination) => {
    const path = paths[destination] || paths.payments
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
    setRoute(resolveRoute(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return { route, navigate }
}
