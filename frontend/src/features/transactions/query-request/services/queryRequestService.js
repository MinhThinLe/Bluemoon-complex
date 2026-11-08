import { mockQueryRequests } from './mockQueryData.js'

const STORAGE_KEY = 'bluemoon.demo.queryRequests'
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

function readStoredRequests() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export async function getQueryRequests() {
  if (useMockData) {
    const stored = readStoredRequests()
    return [...stored, ...mockQueryRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // TODO: Thay bằng endpoint sau khi backend chốt API liệt kê yêu cầu theo người dùng/căn hộ.
  throw new Error('API lịch sử yêu cầu tra cứu chưa được cấu hình. Hãy bật VITE_USE_MOCK_DATA=true để chạy giao diện demo.')
}

export async function createQueryRequest(payload) {
  if (useMockData) {
    const newRequest = {
      ...payload,
      id: `YC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: 'waiting',
      response: '',
    }
    const stored = readStoredRequests()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newRequest, ...stored]))
    } catch {
      // Vẫn trả kết quả cho phiên hiện tại nếu trình duyệt chặn localStorage.
    }
    return newRequest
  }

  // TODO: Tích hợp endpoint tạo yêu cầu sau khi thống nhất request/response với backend.
  throw new Error('API tạo yêu cầu tra cứu chưa được cấu hình.')
}
