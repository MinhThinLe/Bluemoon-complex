import { apiRequest } from '../../../services/apiClient.js'

function unixTimeToIso(value) {
  const seconds = Number(value)
  return Number.isFinite(seconds) ? new Date(seconds * 1000).toISOString() : null
}

function feeCategory(typeName = '') {
  const normalized = typeName.toLocaleLowerCase('vi-VN')
  if (normalized.includes('quản lý') || normalized.includes('vận hành')) return 'management'
  if (normalized.includes('xe') || normalized.includes('đỗ')) return 'parking'
  if (normalized.includes('nước')) return 'water'
  if (normalized.includes('môi trường') || normalized.includes('rác')) return 'environment'
  return 'service'
}

function feePeriod(unixTime) {
  const date = new Date(Number(unixTime) * 1000)
  if (Number.isNaN(date.getTime())) return 'Chưa xác định'
  // Month/year-only Intl formatting varies across browser ICU versions.
  return `Tháng ${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

export function normalizeApartmentFee(fee, apartmentId, index = 0) {
  const typeName = fee.type_name || fee['type-name'] || 'Khoản thu'
  const createdAt = fee.created_at ?? fee['created-at']
  const dueOn = fee.due_on ?? fee['due-on']
  return {
    id: fee.id ?? `fee-${apartmentId}-${createdAt ?? 'unknown'}-${dueOn ?? 'unknown'}-${index}`,
    typeId: fee.type_id ?? null,
    name: typeName,
    description: fee.optional ? 'Khoản đóng góp tự nguyện' : 'Khoản thu bắt buộc của căn hộ',
    category: feeCategory(typeName),
    period: feePeriod(dueOn),
    dueDate: unixTimeToIso(dueOn),
    createdAt: unixTimeToIso(createdAt),
    amount: Number(fee.amount) || 0,
    paid: Boolean(fee.paid),
    optional: Boolean(fee.optional),
    apartmentId,
    apartment: `BM-${apartmentId}`,
  }
}

export async function getTransactionsByApartment(apartmentId) {
  const normalizedId = Number(apartmentId)
  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw new TypeError('Mã căn hộ phải là một số nguyên dương.')
  }

  const payload = await apiRequest(`/fee/apartment/${normalizedId}`)
  const fees = Array.isArray(payload) ? payload : payload?.fees ?? []
  return fees.map((fee, index) => normalizeApartmentFee(fee, normalizedId, index))
}

export function getTransactions(filters = {}) {
  if (!filters.apartmentId) {
    throw new TypeError('Backend hiện yêu cầu apartmentId để truy xuất khoản thu.')
  }
  return getTransactionsByApartment(filters.apartmentId)
}
