function positiveInteger(value, fallback) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const env = import.meta.env ?? {}

export const runtimeConfig = Object.freeze({
  apiUrl: (env.VITE_API_URL || '/api').replace(/\/$/, ''),
  residentApartmentId: positiveInteger(env.VITE_RESIDENT_APARTMENT_ID, 1208),
})
