const env = import.meta.env ?? {}

export const runtimeConfig = Object.freeze({
  apiUrl: (env.VITE_API_URL || '/api').replace(/\/$/, ''),
})
