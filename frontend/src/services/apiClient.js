const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3030/api'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Không thể kết nối đến máy chủ',
    }))

    throw new Error(error.message ?? 'Yêu cầu thất bại')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}