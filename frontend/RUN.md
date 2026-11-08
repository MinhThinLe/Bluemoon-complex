# Hướng dẫn chạy Bluemoon Frontend

## 1. Lấy code mới nhất

Tại thư mục gốc của repository:

```bash
git switch feat/frontend-ui
git pull origin feat/frontend-ui
```

## 2. Chạy backend

Frontend sử dụng API thật nên backend cần chạy tại `127.0.0.1:3030`.

```bash
cd backend
cargo run -- --config-file config.local.toml
```

File `backend/config.local.toml` cần chứa cấu hình server, database và tài khoản.
Xem cách tạo tài khoản trong
[`backend/docs/authentication-guide.md`](../backend/docs/authentication-guide.md).

Giữ terminal backend đang chạy.

## 3. Chạy frontend

Mở terminal khác tại thư mục gốc:

```bash
cd frontend
npm ci
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal, thường là:

```text
http://localhost:5173
```

Vite tự chuyển tiếp các request `/api` đến backend ở cổng `3030`.

## 4. Cấu hình API

Mặc định frontend gọi `/api` qua Vite proxy. Nếu cần đổi địa chỉ, tạo
`frontend/.env.local`:

```env
VITE_API_URL=/api
```

Khởi động lại `npm run dev` sau khi thay đổi file môi trường.

## 5. Các màn hình frontend hiện có

Sau khi đăng nhập, thanh điều hướng có ba màn hình:

- **Quản lý khoản thu:** tạo, sửa và xóa khoản thu (API tương ứng yêu cầu Admin).
- **Chọn khoản nộp:** chọn tầng/căn hộ, sau đó đánh dấu các khoản chưa nộp để chuyển sang màn hình tra cứu.
- **Tra cứu khoản thu:** xem các khoản cần nộp/đã nộp và tổng tiền theo căn hộ.

Hai màn hình chọn và tra cứu gọi API `/api/apartments/{floor}` và
`/api/fee/apartment/{apartment_id}`; backend hiện yêu cầu quyền Accountant trở lên.
Backend chưa có API thanh toán hoặc lưu yêu cầu tra cứu, nên frontend không tự
đổi trạng thái `paid` và không giả lập việc gửi yêu cầu.

## 6. Kiểm tra trước khi push

```bash
npm test
npm run lint
npm run build
```

## Lỗi thường gặp

- **Không kết nối được máy chủ:** kiểm tra backend đang chạy ở cổng `3030`.
- **401:** đăng nhập lại bằng tài khoản trong cấu hình backend.
- **403:** tài khoản không đủ quyền gọi endpoint.
- **Không có dữ liệu:** kiểm tra dữ liệu SQLite và cấu hình backend.
