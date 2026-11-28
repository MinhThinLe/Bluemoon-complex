> Hướng dẫn xác thực với máy chủ.

# Tạo người dùng

Trước khi xác thực với máy chủ, đảm bảo rằng có ít nhất một người dùng tồn tại bằng cách thêm ít nhất một người dùng vào tệp cấu hình

```toml
[users]
admin = "<SHA-256 của mật khẩu, mã hóa Base64>"
# ^       ^
# |       |
# |      Mật khẩu băm bằng sha256 và mã hóa với base64
# Tên người dùng
```

Giả sử openssl đã được cài đặt trên thiết bị Linux/MacOS(?) của bạn.

```
printf "password" | openssl sha256 -binary | base64 -
```

Trường hợp bạn dùng Windows, hãy sử dụng lệnh sau.

```powershell
$demoPassword = "password"
$sha256 = [Security.Cryptography.SHA256]::Create()
[Convert]::ToBase64String($sha256.ComputeHash([Text.Encoding]::UTF8.GetBytes($demoPassword)))
```

Thay `password` bằng mật khẩu bạn muốn đặt rồi chép kết quả vào bảng `users` như được mô tả ở trên.

# Xác thực

Máy chủ nhận yêu cầu xác thực thông qua HTTP, chi tiết liên hệ tài liệu [sau](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/WWW-Authenticate#realm)

Về cơ bản, các yêu cầu chưa được xác thực sẽ nhận lại phản hồi 401 với header `WWW-Authenticate` chứa các thông tin giúp người dùng đăng nhập. Hiện tại, máy chủ chỉ hỗ trợ `Basic`

Sau đó, gửi một yêu cầu bất kỳ đến máy chủ với header `Authorization` được đính kèm. Nội dung của header này chứa ở trong tài liệu đã nhắc đến trên.

Trường hợp bạn đăng nhập thành công (mã phản hồi 200), máy chủ sẽ gửi một cookie `Session-Token`. Gửi kèm cookie này với mọi yêu cầu về sau để có thể sử dụng các API cần xác thực.
