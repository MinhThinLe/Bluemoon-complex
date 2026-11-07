import { apiRequest } from '../../../services/apiClient'

export function getTransactions(filters = {}) {
  const params = new URLSearchParams()

  if (filters.apartmentId) {
    params.set('apartment_id', filters.apartmentId)
  }

  if (filters.feeTypeId) {
    params.set('fee_type_id', filters.feeTypeId)
  }

  if (filters.paid !== undefined && filters.paid !== '') {
    params.set('paid', filters.paid)
  }

  if (filters.period) {
    params.set('period', filters.period)
  }

  const query = params.toString()

  return apiRequest(`/fees${query ? `?${query}` : ''}`)
}