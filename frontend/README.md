# Frontend – Bluemoon Complex

Frontend của dự án được xây dựng bằng **React** và **Vite**.

## Cài đặt và chạy

Hướng dẫn chạy nhanh cả frontend và backend:

**[RUN.md](./RUN.md)**

Thành viên mới chưa cài Node.js xem hướng dẫn chi tiết tại:

**[Hướng dẫn cài đặt Node.js và chạy Frontend](../docs/frontend-setup.md)**

Các lệnh cơ bản, chạy trong thư mục `frontend`:

```bash
npm ci
npm run dev
```

Frontend gọi backend qua `/api`. Khi chạy Vite, request này được proxy đến
`http://127.0.0.1:3030`, nhờ đó cookie `Session-Token` hoạt động cùng origin và
không cần bật CORS trong môi trường phát triển.

Sao chép `.env.example` thành `.env.local` nếu cần đổi căn hộ đang xem:

```env
VITE_API_URL=/api
VITE_RESIDENT_APARTMENT_ID=1208
```

Các màn hình quản lý khoản thu và danh sách phí căn hộ dùng API thật. Backend
hiện chưa có endpoint tạo giao dịch thanh toán hoặc yêu cầu tra cứu; giao diện
sẽ vô hiệu hóa các thao tác này thay vì tạo dữ liệu giả.

Các lệnh kiểm tra trước khi tạo Pull Request:

```bash
npm run lint
npm test
npm run build
```
