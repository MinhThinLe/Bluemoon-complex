import { runtimeConfig } from '../config/runtime.js'

export class ApiError extends Error {
  constructor(message, { status = 0, payload = null, cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export class ApiCapabilityError extends Error {
  constructor(message, capability) {
    super(message)
    this.name = 'ApiCapabilityError'
    this.code = 'API_CAPABILITY_UNAVAILABLE'
    this.capability = capability
  }
}

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
  const hasBody = body !== undefined
  const requestBody = hasBody && typeof body !== 'string' ? JSON.stringify(body) : body
  let response

  try {
    response = await fetch(`${runtimeConfig.apiUrl}${path}`, {
      credentials: 'include',
      ...requestOptions,
      headers: {
        Accept: 'application/json, text/plain;q=0.9',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: requestBody,
    })
  } catch (cause) {
    throw new ApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend và thử lại.', { cause })
  }

  const payload = await readResponse(response)
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bluemoon:unauthorized'))
    }
    const fallbackMessages = {
      401: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
      403: 'Tài khoản không có quyền thực hiện thao tác này.',
      404: 'Không tìm thấy dữ liệu được yêu cầu.',
    }
    const message = typeof payload === 'string' && payload.trim()
      ? payload
      : payload?.error?.message ?? payload?.message ?? fallbackMessages[response.status] ?? `Yêu cầu thất bại (${response.status})`
    throw new ApiError(message, { status: response.status, payload })
  }
  return payload
}
