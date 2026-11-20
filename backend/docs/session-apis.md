> Các API liên quan đến quản lý phiên

Để sử dụng được các API sắp được định nghĩa, các máy khách phải có một cookie `Session-Token` hợp lệ. Về việc lấy cookie này, vui lòng liên hệ tài liệu [hướng dẫn đăng nhập](./authentication-guide.md).

Tất cả các ký pháp sắp được sử dụng đã được mô tả trong [định nghĩa API](./api-spec.md)

# Phân quyền

Máy chủ định nghĩa các vai trò sau:
- `Resident`
- `Accountant`
- `Admin`

Trong đó, `Admin` truy cập được các API liên quan đến quản lý và thống kê, `Accountant` có thể sử dụng API thống kê và `Resident` truy cập được các API thống kê nhưng chỉ với căn hộ của mình.

# API

## Lấy vai trò hiện tại

### Yêu cầu

| Trường       | Thông tin                 |
| ------------ | ------------------------- |
| Phương thức  | `GET`                     |
| Endpoint     | `/api/role`               |

### Thân phản hồi

| Tên trường   | Kiểu dữ liệu |
| ----------   | ------------ |
| `role`       | `string`     |

## Đăng xuất

### Yêu cầu

| Trường       | Thông tin     |
| ------------ | ------------- |
| Phương thức  | `POST`        |
| Endpoint     | `/api/logout` |

### Thân phản hồi

Không sử dụng
