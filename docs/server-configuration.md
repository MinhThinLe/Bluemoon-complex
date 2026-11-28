> Tài liệu cấu hình máy chủ

Máy chủ được cấu hình với một file `toml` duy nhất với 3 bảng cấu hình chính.

```toml
[server]
listen_address = "127.0.0.1:3030"

[database]
path = "<đường dẫn đến cơ sở dữ liệu>"
#        ^
#        |
#        Phải có quyền ghi vì lý do hiển nhiên

[users]
admin = "<Mật khẩu mặc định>"
# ^      ^
# |      |
# |      Mật khẩu đã băm với sha256 và mã hóa bởi base64
# Tên người dùng
```

Trường hợp bạn cần hỗ trợ về việc tạo giá trị ban đầu cho mật khẩu liên hệ [hướng dẫn xác thực](../backend/docs/authentication-guide.md)

Sau đó, cung cấp file này cho máy chủ bằng cách viết nó vào `/etc/bluemoon/config.toml`. Trường hợp bạn không muốn viết vào thư mục hệ thống, hãy sử dụng cờ `--config-file`.
