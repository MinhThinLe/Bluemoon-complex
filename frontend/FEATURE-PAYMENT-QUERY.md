# Bluemoon — Payment selection & query request UI

Phạm vi: phần frontend do Hoàng Minh Tuấn phụ trách theo phân công trong `src/features/README.md`.

## Màn hình đã triển khai

- **Khoản nộp (`fees/payment-selection`)**: tổng quan khoản chưa thanh toán/đã thanh toán, tìm kiếm, lọc trạng thái, chọn nhiều khoản, tổng tiền, chọn phương thức dự kiến và tạo phiếu thanh toán demo.
- **Yêu cầu tra cứu (`transactions/query-request`)**: thống kê yêu cầu, tìm kiếm/lọc theo trạng thái, tạo yêu cầu có kiểm tra dữ liệu, xem chi tiết và phản hồi mẫu.
- **UI dùng chung**: `Button`, `Input`, `Select`, `Table`, `Modal`, `Icon` trong `src/components/ui`.

## Chạy thử

Từ thư mục `frontend`:

```bash
npm install
npm run dev
```

Dữ liệu đang là dữ liệu demo. Mặc định `VITE_USE_MOCK_DATA` được xem là bật; có thể tạo file `.env` trong `frontend` với:

```env
VITE_USE_MOCK_DATA=true
```

Khi backend sẵn sàng, cần thống nhất endpoint và cấu trúc request/response trước khi đặt `VITE_USE_MOCK_DATA=false` và thay phần `TODO` trong các service.

## Các điểm cần thống nhất với backend

1. API lấy danh sách khoản thu của căn hộ/cư dân, gồm mã khoản thu, loại phí, kỳ thu, số tiền, hạn nộp và trạng thái đã thanh toán.
2. API tạo phiếu/ý định thanh toán; xác nhận phương thức thanh toán và trạng thái xử lý. Giao diện hiện tại **không thực hiện chuyển tiền**.
3. Bảng/API lưu yêu cầu tra cứu, bao gồm loại yêu cầu, khoản thu liên quan, nội dung, trạng thái và phản hồi từ ban quản lý.
4. Cơ chế xác thực/cookie, phân quyền cư dân và cách xác định căn hộ hiện tại.

Các dữ liệu hiển thị ở chế độ demo (căn hộ BM-1208, số tiền, lịch sử yêu cầu, trạng thái và phản hồi) không phải dữ liệu đọc từ SQLite/backend.
