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

## 4. Cấu hình căn hộ

Mặc định frontend tải dữ liệu căn hộ `1208`. Muốn đổi căn hộ, tạo
`frontend/.env.local`:

```env
VITE_API_URL=/api
VITE_RESIDENT_APARTMENT_ID=1208
```

Khởi động lại `npm run dev` sau khi thay đổi file môi trường.

## 5. Các đường dẫn chính

- `/`: danh sách khoản thu của căn hộ.
- `/queries`: yêu cầu tra cứu.
- `/admin/fees`: quản lý khoản thu.

Tài khoản phải có quyền phù hợp với API. Backend hiện chưa có API thanh toán và
yêu cầu tra cứu nên các thao tác tương ứng được vô hiệu hóa trên giao diện.

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
- **Không có dữ liệu:** kiểm tra `VITE_RESIDENT_APARTMENT_ID` và dữ liệu SQLite.
