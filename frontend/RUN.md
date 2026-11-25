# Chạy Bluemoon từ mã nguồn

Bạn cần Git, [Rust](https://rustup.rs/) và [Node.js](../docs/frontend-setup.md). Nếu chỉ sử dụng ứng dụng đã được triển khai, hãy mở địa chỉ và dùng tài khoản do nhóm cung cấp.

## 1. Lấy code mới nhất

Nếu chưa có mã nguồn, clone repository:

```bash
git clone https://github.com/MinhThinLe/IT3180-SE_03.git
cd IT3180-SE_03
```

Nếu đã có mã nguồn, tại thư mục gốc chạy `git switch main` rồi `git pull origin main`. Lưu các thay đổi cá nhân trước khi đổi nhánh.

## 2. Chuẩn bị và chạy backend

Tạo file `backend/config.local.toml` theo [hướng dẫn backend](../backend/README.md). File này chứa cổng chạy, đường dẫn database và tài khoản đăng nhập. Chuẩn bị database có dữ liệu căn hộ và khoản thu nếu muốn trình bày luồng tra cứu; database mới tạo sẽ trống.

```bash
cd backend
cargo run -- --config-file config.local.toml
```

Giữ terminal backend đang chạy.

## 3. Chạy frontend

Mở terminal khác tại thư mục gốc của dự án:

```bash
cd frontend
npm ci
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal, thường là:

```text
http://localhost:5173
```

Frontend sẽ tự kết nối backend đang chạy ở cổng `3030`.

## 4. Dùng thử

Mở trang Welcome, chọn **Vào hệ thống** rồi đăng nhập bằng tài khoản đã tạo trong `[users]`. Sau khi đăng nhập, thanh điều hướng có hai mục:

- **Quản lý khoản thu:** tạo, sửa và xóa khoản thu (API tương ứng yêu cầu Admin).
- **Tra cứu khoản thu:** chọn tầng và căn hộ, đánh dấu khoản chưa nộp, rồi xem chi tiết các khoản cần nộp/đã nộp. Có thể quay lại bước chọn khoản.

Nút **Đăng xuất** nằm ở góc phải thanh điều hướng. Hộp thoại cho phép ở lại hoặc xác nhận kết thúc phiên.

Tra cứu yêu cầu tài khoản có quyền Accountant trở lên. Ứng dụng hiện chưa thực hiện thanh toán.

## 5. Kiểm tra trước khi push

```bash
npm test
npm run lint
npm run build
```

## Lỗi thường gặp

- **Không kết nối được máy chủ:** kiểm tra backend đang chạy ở cổng `3030`.
- **Không đăng nhập được:** kiểm tra tên tài khoản và mật khẩu trong cấu hình backend.
- **Không đủ quyền:** dùng tài khoản được cấp quyền cho thao tác đó.
- **Không có dữ liệu:** database mới không tự có căn hộ hoặc khoản thu; kiểm tra file SQLite được khai báo trong cấu hình backend.
- **PowerShell báo chặn `npm.ps1`:** dùng `npm.cmd ci` và `npm.cmd run dev` trên Windows.
