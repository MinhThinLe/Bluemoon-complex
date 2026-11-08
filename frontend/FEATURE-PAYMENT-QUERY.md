# Bluemoon — Payment selection & query request UI

Phạm vi: phần frontend do Hoàng Minh Tuấn phụ trách theo phân công trong `src/features/README.md`.

## Màn hình đã triển khai

- **Khoản nộp (`fees/payment-selection`)**: tải khoản thu của căn hộ từ API, tổng hợp trạng thái, tìm kiếm, lọc và chọn nhiều khoản.
- **Yêu cầu tra cứu (`transactions/query-request`)**: thống kê yêu cầu, tìm kiếm/lọc theo trạng thái, tạo yêu cầu có kiểm tra dữ liệu, xem chi tiết và phản hồi mẫu.
- **UI dùng chung**: `Button`, `Input`, `Select`, `Table`, `Modal`, `Icon` trong `src/components/ui`.

## Chạy thử

Từ thư mục `frontend`:

```bash
npm install
npm run dev
```

Frontend gọi API cùng origin qua `/api`. Trong môi trường Vite, proxy chuyển request đến backend tại `127.0.0.1:3030`. Có thể chọn căn hộ hiển thị trong `.env.local`:

```env
VITE_API_URL=/api
VITE_RESIDENT_APARTMENT_ID=1208
```

Backend hiện có endpoint đọc khoản thu nhưng chưa có endpoint tạo giao dịch thanh toán hoặc quản lý yêu cầu tra cứu. Các nút tương ứng bị vô hiệu hóa và không tạo dữ liệu giả.

## Các điểm cần thống nhất với backend

1. API lấy danh sách khoản thu của căn hộ/cư dân, gồm mã khoản thu, loại phí, kỳ thu, số tiền, hạn nộp và trạng thái đã thanh toán.
2. API tạo phiếu/ý định thanh toán; xác nhận phương thức thanh toán và trạng thái xử lý. Giao diện hiện tại **không thực hiện chuyển tiền**.
3. Bảng/API lưu yêu cầu tra cứu, bao gồm loại yêu cầu, khoản thu liên quan, nội dung, trạng thái và phản hồi từ ban quản lý.
4. Cơ chế xác thực/cookie, phân quyền cư dân và cách xác định căn hộ hiện tại.

Căn hộ mặc định là `1208` và có thể thay đổi bằng biến môi trường. Số tiền và trạng thái khoản thu được đọc từ SQLite qua backend.
