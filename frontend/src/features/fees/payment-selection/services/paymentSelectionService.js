import { apiRequest } from '../../../../services/apiClient.js'

/**
 * Backend contract: GET /api/apartments/{floor}
 * Response: { apartments: [{ id, area, type_name }] }
 * Only Accountant/Admin sessions are authorized by the current backend.
 */
export async function getApartmentsByFloor(floor) {
  const normalizedFloor = Number(floor)
  if (!Number.isInteger(normalizedFloor) || normalizedFloor < 1 || normalizedFloor > 30) {
    throw new TypeError('Tầng phải là số nguyên từ 1 đến 30.')
  }

  const payload = await apiRequest(`/apartments/${normalizedFloor}`)
  const apartments = Array.isArray(payload) ? payload : payload?.apartments ?? []

  return apartments
    .map((apartment) => ({
      id: Number(apartment.id),
      area: Number(apartment.area) || 0,
      typeName: apartment.type_name ?? apartment['type-name'] ?? 'Chưa phân loại',
    }))
    .filter((apartment) => Number.isInteger(apartment.id) && apartment.id > 0 && Math.floor(apartment.id / 100) === normalizedFloor)
    .sort((left, right) => left.id - right.id)
}
