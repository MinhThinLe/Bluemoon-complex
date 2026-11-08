const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3030/api').replace(/\/$/, '')

async function readResponse(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  if (response.headers.get('content-type')?.includes('application/json')) {
    try { return JSON.parse(text) } catch { return text }
  }
  return text
}

export async function apiRequest(path, options = {}) {
  const { headers, body, ...requestOptions } = options
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...requestOptions,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    body,
  })
  const payload = await readResponse(response)
  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.error?.message ?? payload?.message ?? `Yêu cầu thất bại (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}
