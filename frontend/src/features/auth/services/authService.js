import { apiRequest } from '../../../services/apiClient.js'

function encodeBasicCredentials(username, password) {
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

export function authenticate(username, password) {
  return apiRequest('/session', {
    method: 'POST',
    headers: { Authorization: `Basic ${encodeBasicCredentials(username, password)}` },
  })
}
