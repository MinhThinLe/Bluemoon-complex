> Hướng dẫn xác thực với máy chủ.

# Tạo người dùng

Trước khi xác thực với máy chủ, đảm bảo rằng có ít nhất một người dùng tồn tại bằng cách thêm ít nhất một người dùng vào tệp cấu hình

```toml
[users]
admin = "mật khẩu ở đây"
# ^       ^
# |       |
# |      Mật khẩu băm bằng sha256 và mã hóa với base64
# Tên người dùng
```

Mật khẩu có thể được tạo bằng lệnh sau, giả sử openssl đã được cài đặt trên thiết bị của bạn

```
printf "password" | openssl sha256 -binary | base64 -
```

Thay `password` bằng mật khẩu bạn muốn đặt

# Xác thực

Máy chủ nhận yêu cầu xác thực thông qua HTTP, chi tiết liên hệ tài liệu [sau](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/WWW-Authenticate#realm)

Về cơ bản, các yêu cầu chưa được xác thực sẽ nhận lại phản hồi 401 với header `WWW-Authenticate` chứa các thông tin giúp người dùng đăng nhập. Hiện tại, máy chủ chỉ hỗ trợ `Basic`

Sau đó, gửi một yêu cầu bất kỳ đến máy chủ với header `Authorization` được đính kèm. Nội dung của header này chứa ở trong tài liệu đã nhắc đến trên.

Nếu người dùng cung cấp thông tin đăng nhập không hợp lệ, máy chủ sẽ trả về phản hồi 401, ngược lại, nếu thông tin đăng nhập hợp lệ, phản hồi 200 sẽ được gửi cùng với một cookie. Trong các yêu cầu tiếp theo, máy chủ sẽ dùng cookie này để xác thực.
