# Backend Bluemoon

Backend viết bằng Rust, dùng SQLite. Cài [Rust toolchain](https://rustup.rs/) trước khi chạy.

Từ thư mục gốc của dự án, tạo file `backend/config.local.toml` với nội dung sau. Thay giá trị trong dấu `<...>` bằng mã băm của mật khẩu bạn chọn theo [hướng dẫn tạo tài khoản](docs/authentication-guide.md):

```toml
[server]
listen_address = "127.0.0.1:3030"

[database]
path = "./bluemoon.db"

[users]
admin = "<SHA-256 của mật khẩu, mã hóa Base64>"
```

Sau đó chạy:

```bash
cd backend
cargo run -- --config-file config.local.toml
```

Đường dẫn database tương đối được tính từ thư mục đang chạy lệnh, trong ví dụ là `backend`. Backend sẽ tạo file SQLite nếu chưa có, nhưng database mới chưa có căn hộ hoặc khoản thu để demo. Hãy dùng database demo đã chuẩn bị hoặc nhập dữ liệu phù hợp trước buổi trình bày. Giữ file cấu hình local và file SQLite chứa dữ liệu riêng ở máy của bạn. Xem thêm [chi tiết cấu hình](../docs/server-configuration.md).

Giữ terminal backend đang chạy, rồi mở terminal khác để [chạy frontend](../frontend/RUN.md). Vite chuyển tiếp `/api` tới `127.0.0.1:3030`.

Kiểm tra backend trong thư mục `backend`:

```bash
cargo fmt --check
cargo test
cargo clippy --all
```
