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

Trên Git Bash hoặc Linux/macOS, tạo giá trị từ mật khẩu bạn chọn bằng OpenSSL:

```
printf "password" | openssl sha256 -binary | base64 -
```

Trên Windows PowerShell:

```powershell
$demoPassword = "password"
$sha256 = [Security.Cryptography.SHA256]::Create()
[Convert]::ToBase64String($sha256.ComputeHash([Text.Encoding]::UTF8.GetBytes($demoPassword)))
```

Thay `password` bằng mật khẩu bạn muốn đặt rồi chép kết quả vào `[users]` của `backend/config.local.toml`. Giữ mật khẩu và file cấu hình local ở máy của bạn.

# Xác thực

Máy chủ nhận yêu cầu xác thực thông qua HTTP, chi tiết liên hệ tài liệu [sau](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/WWW-Authenticate#realm)

Về cơ bản, các yêu cầu chưa được xác thực sẽ nhận lại phản hồi 401 với header `WWW-Authenticate` chứa các thông tin giúp người dùng đăng nhập. Hiện tại, máy chủ chỉ hỗ trợ `Basic`

Sau đó, gửi một yêu cầu bất kỳ đến máy chủ với header `Authorization` được đính kèm. Nội dung của header này chứa ở trong tài liệu đã nhắc đến trên.

Thông tin đăng nhập sai nhận phản hồi 403. Đăng nhập hợp lệ nhận phản hồi 200 cùng cookie `Session-Token`; các yêu cầu tiếp theo dùng cookie này để xác thực. Phiên thiếu hoặc đã hết hạn nhận 401. Frontend gửi thông tin đăng nhập tới `POST /api/session` và gọi `POST /api/logout` khi đăng xuất.
