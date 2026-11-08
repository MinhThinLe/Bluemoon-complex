import { mockResidentFees } from './mockPaymentData.js'

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export async function getResidentFees() {
  if (useMockData) return mockResidentFees.map((fee) => ({ ...fee }))

  // TODO: Thay bằng endpoint sau khi nhóm backend chốt API lấy khoản thu theo cư dân/căn hộ.
  throw new Error('API danh sách khoản nộp chưa được cấu hình. Hãy bật VITE_USE_MOCK_DATA=true để chạy giao diện demo.')
}

export async function preparePayment({ feeIds, paymentMethod }) {
  if (!feeIds?.length) throw new Error('Vui lòng chọn ít nhất một khoản nộp.')
  if (useMockData) {
    return {
      reference: `BM-${Date.now().toString().slice(-8)}`,
      feeIds,
      paymentMethod,
      status: 'draft',
      createdAt: new Date().toISOString(),
      demo: true,
    }
  }

  // TODO: Tích hợp endpoint tạo phiếu/ý định thanh toán sau khi backend thống nhất hợp đồng API.
  throw new Error('API tạo phiếu thanh toán chưa được cấu hình.')
}
