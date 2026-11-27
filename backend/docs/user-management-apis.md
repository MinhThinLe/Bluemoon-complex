> Các API liên quan đến quản lý người dùng

Để sử dụng được các API sắp được định nghĩa, các máy khách phải có một cookie `Session-Token` hợp lệ. Về việc lấy cookie này, vui lòng liên hệ tài liệu [hướng dẫn đăng nhập](./authentication-guide.md).

Tất cả các ký pháp sắp được sử dụng đã được mô tả trong [định nghĩa API](./api-spec.md)

# Phân quyền

Toàn bộ các API sắp được mô tả sau đây chỉ có thể được sử dụng nếu người dùng đã xác thực với tư cách `Admin`

# Tạo người dùng mới

## Yêu cầu

| Trường      | Thông tin       |
| ----------- | --------------- |
| Phương thức | `POST`          |
| Endpoint    | `/api/new/user` |

## Thân yêu cầu

| Tên trường     | Kiểu dữ liệu | Ghi chú                        |
| -------------- | ------------ | ------------------------------ |
| `username`     | `string`     | Phải chưa tồn tại              |
| `password`     | `string`     | Chưa được băm                  |
| `display-name` | `string`     |                                |
| `role`         | `integer`    | Một id vai trò hợp lệ          |
| `belongs-to`   | `integer`    | Một id dân cư hợp lệ, tùy chọn |

## Thất bại

| Lý do thất bại            | Phản hồi |
| ------------------------- | -------- |
| `username` trùng          | HTTP 409 |
| `role` không hợp lệ       | HTTP 400 |
| `belongs-to` không hợp lệ | HTTP 400 |

## Thân phản hồi

Không sử dụng

# Xóa một người dùng

## Yêu cầu

| Trường      | Thông tin          |
| ----------- | ------------------ |
| Phương thức | `DELETE`           |
| Endpoint    | `/api/delete/user` |

## Thân yêu cầu

| Tên trường | Kiểu dữ liệu | Ghi chú                  |
| ---------- | ------------ | ------------------------ |
| `id`       | `integer`    | Một id người dùng hợp lệ |

## Thất bại

| Lý do thất bại     | Phản hồi |
| ------------------ | -------- |
| `id` không tồn tại | HTTP 404 |

## Thân phản hồi

Không sử dụng

# Lấy danh sách người dùng

## Yêu cầu

| Trường | Thông tin |
| --- | --- |
| Phương thức | `GET` |
| Endpoint | `/api/user/get` |

## Thân yêu cầu

| Tên trường     | Kiểu dữ liệu | Ghi chú                                                    |
| ---            | ---          | ---                                                        |
| `username`     | `string`     | Xâu con của tên đăng nhập của người dùng cần tìm, tùy chọn |
| `display-name` | `string`     | Xâu con của tên hiển thị của người dùng cần tìm, tùy chọn  |
| `role`         | `integer`    | vai trò của người dùng cần tìm, tùy chọn                   |

## Thất bại

| Lý do thất bại        | Phản hồi |
| --------------------- | -------- |
| Cả 3 trường đều trống | HTTP 400 |

## Thân phản hồi

| Tên trường     | Kiểu dữ liệu |
| -------------- | ------------ |
| `username`     | `string`     |
| `display-name` | `string`     |
| `role`         | `integer`    |
| `belongs-to`   | `integer`    |
