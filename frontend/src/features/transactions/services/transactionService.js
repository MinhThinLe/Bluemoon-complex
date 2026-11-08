import { apiRequest } from '../../../services/apiClient'

export async function getTransactionsByApartment(apartmentId) {
  const normalizedId = Number(apartmentId)
  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw new TypeError('Mã căn hộ phải là một số nguyên dương.')
  }

  const payload = await apiRequest(`/fee/apartment/${normalizedId}`)
  return Array.isArray(payload) ? payload : payload?.fees ?? []
}

export function getTransactions(filters = {}) {
  if (!filters.apartmentId) {
    throw new TypeError('Backend hiện yêu cầu apartmentId để truy xuất khoản thu.')
  }
  return getTransactionsByApartment(filters.apartmentId)
}
