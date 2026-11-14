import { useEffect, useState } from 'react'
import { getApartmentsByFloor } from '../features/fees/payment-selection/services/paymentSelectionService.js'
import { getTransactionsByApartment } from '../features/transactions/services/transactionService.js'

// Keep transport/contracts in the existing services; share only screen state.
export default function useApartmentFees({ initialApartmentId = null, maxFloor = 30 } = {}) {
  const [floor, setFloor] = useState(() => String(Math.min(maxFloor, Math.max(1, Math.floor(Number(initialApartmentId) / 100) || 1))))
  const [apartmentId, setApartmentId] = useState(initialApartmentId ? String(initialApartmentId) : '')
  const [apartments, setApartments] = useState([])
  const [fees, setFees] = useState([])
  const [loadingApartments, setLoadingApartments] = useState(true)
  const [loadingFees, setLoadingFees] = useState(Boolean(initialApartmentId))
  const [error, setError] = useState(null)
  const [apartmentAttempt, setApartmentAttempt] = useState(0)
  const [feeAttempt, setFeeAttempt] = useState(0)

  useEffect(() => {
    let active = true
    getApartmentsByFloor(floor)
      .then((items) => {
        if (!active) return
        setApartments(items)
        setApartmentId((current) => items.some((item) => String(item.id) === current) ? current : '')
        if (!items.some((item) => String(item.id) === String(initialApartmentId))) setLoadingFees(false)
      })
      .catch((cause) => {
        if (active) { setError({ phase: 'apartments', message: cause.message, status: cause.status }); setLoadingFees(false) }
      })
      .finally(() => { if (active) setLoadingApartments(false) })
    return () => { active = false }
  }, [floor, initialApartmentId, apartmentAttempt])

  useEffect(() => {
    if (!apartmentId) return undefined
    let active = true
    getTransactionsByApartment(apartmentId)
      .then((items) => { if (active) setFees(items) })
      .catch((cause) => { if (active) { setFees([]); setError({ phase: 'fees', message: cause.message, status: cause.status }) } })
      .finally(() => { if (active) setLoadingFees(false) })
    return () => { active = false }
  }, [apartmentId, feeAttempt])

  const chooseFloor = (value) => {
    setFloor(value); setApartmentId(''); setApartments([]); setFees([]); setError(null)
    setLoadingApartments(true); setLoadingFees(false)
  }
  const chooseApartment = (value) => {
    setApartmentId(value); setFees([]); setError(null); setLoadingFees(Boolean(value))
  }
  const retry = () => {
    if (!error) return
    const phase = error.phase
    setError(null)
    if (phase === 'apartments') { setLoadingApartments(true); setApartmentAttempt((n) => n + 1) }
    else { setLoadingFees(true); setFeeAttempt((n) => n + 1) }
  }

  return { floor, apartmentId, apartments, fees, loadingApartments, loadingFees, error, chooseFloor, chooseApartment, retry }
}
