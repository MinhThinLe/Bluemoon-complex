import { apiRequest } from '../../../../services/apiClient.js'

export function getFeeTypes() {
  return apiRequest('/fee-types').then((payload) => Array.isArray(payload) ? payload : payload?.['fee-types'] ?? [])
}

export function createFee({ amount, apartmentIds, feeTypeId, optional, dueOn }) {
  return apiRequest('/new/fee', {
    method: 'POST',
    body: {
      amount: Number(amount),
      for: apartmentIds === 'all' ? 'all' : apartmentIds.map(Number),
      type: Number(feeTypeId),
      optional: Boolean(optional),
      'due-on': Math.floor(new Date(`${dueOn}T23:59:59`).getTime() / 1000),
    },
  })
}

export function updateFee({ feeTypeId, apartmentId, amount, optional, paid }) {
  const payload = { id: Number(feeTypeId), apartment_id: Number(apartmentId) }
  if (amount !== '') payload.amount = Number(amount)
  if (optional !== '') payload.optional = optional === true || optional === 'true'
  if (paid !== '') payload.paid = paid === true || paid === 'true'
  return apiRequest('/edit/fee', { method: 'POST', body: payload })
}

export function deleteFeesByType(feeTypeId) {
  return apiRequest(`/delete/fee/${Number(feeTypeId)}`, { method: 'DELETE' })
}
