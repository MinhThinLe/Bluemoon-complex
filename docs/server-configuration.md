> Tài liệu cấu hình máy chủ

Máy chủ được cấu hình với một file `toml` duy nhất.

# Bảng cấu hình `server`

Các cài đặt quan trọng như cổng nghe được cấu hình ở đây

```toml
[server]
listen_address = "127.0.0.1:3030"
```

# Bảng cấu hình `database`

Các cài đặt về cơ sở dữ liệu được cấu hình ở đây

```toml
[database]
path = "./bluemoon.db"
```

# Bảng cấu hình `users`

Các cấu hình liên quan đến người dùng mặc định được đặt ở đây.

```toml
[users]
admin = "<SHA-256 của mật khẩu, mã hóa Base64>"
# ^      ^
# |      |
# |      SHA-256 của mật khẩu được mã hóa Base64
# Tên người dùng
```

Chạy từ thư mục `backend` bằng `cargo run -- --config-file config.local.toml`. Đường dẫn `database.path` tương đối được tính từ thư mục đang chạy lệnh. Xem [cách tạo giá trị mật khẩu](../backend/docs/authentication-guide.md). Giữ file cấu hình local chứa tài khoản ở máy của bạn.
