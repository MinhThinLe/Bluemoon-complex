## 1.Overview
- API thiết kế theo cấu trúc REST.
- Tập trung vào việc tương tác với 3 bảng chính: fees, feetypes và apartment.
- Các chức năng chính :
    + tra cứu các loại phí (feetypes)
    + tra cứu các khoản phí (fees)
    + tạo, cập nhật, xóa các khoản phí đối với người dùng có quyền quản lí
    + cho phép người dùng là dân cư xem khoản phí áp dụng lên căn hộ của mình 
- Các chức năng chắc chắn có nhưng chưa đủ cơ sở đế làm :
    + tự động tính toán
    + quản lí thu theo kì (CSDL chưa có cung cấp)
    + xử lí thanh toán trực tuyến 

## 2.DB Mapping
- một loại phí(feetype) chứa nhiều khoản phí(fee)
- một căn hộ(apartment) có nhiều khoản phí(fee)

## 3.Phân quyền
| Chức năng | Management | Resident |
| Xem danh sách loại phí | x | x |
| Xem danh sách tất cả khoản phí | x |  |
| Xem chi tiết khoản phí | x | Chỉ căn hộ mình |
| Tạo khoản phí | x |  |
| Cập nhật khoản phí | x |  |
| Xóa khoản phí | x |  |

## 4.API endpoints
- Các quy ước chung:
    + Base Url: /api
    + {id} đại diện cho ID của tài nguyên cần truy cập
- API quản lí FeeTypes
| Method | Endpoint              | Chức năng                           |
| GET    | `/api/fee-types`      | Lấy danh sách loại phí              |
| GET    | `/api/fee-types/{id}` | Lấy thông tin chi tiết một loại phí |
| POST   | `/api/fee-types`      | Tạo loại phí mới                    |
| PUT    | `/api/fee-types/{id}` | Cập nhật thông tin loại phí         |
| DELETE | `/api/fee-types/{id}` | Xóa loại phí                        |

- API quản lí Fees
| Method | Endpoint              | Chức năng                           |
| GET    | `/api/fees`           | Lấy danh sách tất cả khoản phí      |
| GET    | `/api/fees/{id}`      | Lấy thông tin chi tiết khoản phí    |
| POST   | `/api/fees`           | Tạo khoản phí mới                   |
| PUT    | `/api/fees/{id}`      | Cập nhật thông tin khoản phí        |
| DELETE | `/api/fees/{id}`      | Xóa khoản phí                       |

- API tra cứu khoản phí
| Method | Endpoint                      | Chức năng                      | 
| GET    | `/api/fees?apartment_id={id}` | Lọc khoản phí theo căn hộ      | 
| GET    | `/api/fees?fee_type_id={id}`  | Lọc khoản phí theo loại phí    | 
| GET    | `/api/fees?paid={status}`     | Lọc theo trạng thái thanh toán | 
| GET    | `/api/my/fees`                | Lấy khoản phí của căn hộ mình  | 

- API cập nhật thanh toán
| Method | Endpoint                        | Chức năng                      |
| PATCH  | `/api/fees/{id}/payment-status` | Cập nhật trạng thái thanh toán |

## 5.Quy định mã trạng thái http trả về 
| HTTP Status Code | Tên | Ý nghĩa |
| 200 | OK | Request được xử lý thành công. |
| 201 | Created | Tạo tài nguyên mới thành công. |
| 204 | No Content | Request thành công, không có dữ liệu trả về. Thường dùng khi xóa tài nguyên. |
| 400 | Bad Request | Request không hợp lệ, chẳng hạn dữ liệu đầu vào sai định dạng. |
| 401 | Unauthorized | Người dùng chưa đăng nhập hoặc thông tin xác thực không hợp lệ. |
| 403 | Forbidden | Người dùng đã đăng nhập nhưng không có quyền thực hiện thao tác. |
| 404 | Not Found | Không tìm thấy tài nguyên được yêu cầu. |
| 409 | Conflict | Request gây xung đột với dữ liệu hiện tại, chẳng hạn xóa loại phí đang được sử dụng. |
| 500 | Internal Server Error | Lỗi xảy ra trong quá trình xử lý phía server. |