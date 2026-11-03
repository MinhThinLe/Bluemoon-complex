> Thiết kế cơ sở dữ liệu cho phiên bản 1.0

Theo yêu cầu của đề bài, phiên bản 1.0 cần quản lý các thông tin sau
- Quản lý thông tin thu phí các hộ gia đình
- Thống kê cơ bản


# Users

| Tên cột         | Kiểu dữ liệu | Ràng buộc                                   |
| --------------- | ------------ | ------------------------------------------- |
| id              | integer      | primary key                                 |
| username        | text         | not null                                    |
| hashed_password | text         | not null                                    |
| salt            | text         | not null                                    |
| display_name    | text         | not null                                    |
| role            | integer      | not null, foreign key -> [Roles.id](#Roles) |
| belongs_to      | integer      | foreign key -> [Residents.id](#Residents)   |

**Lưu ý**: `belongs_to` có thể null trong trường hợp chủ tài khoản thuộc về
nhân viên/ban quản lý và người này không cư trú tại chung cư này.

# Roles

| Tên cột | Kiểu dữ liệu | Ràng buộc   |
| ------- | ------------ | ----------- |
| id      | integer      | primary key |
| name    | text         | not null    |

# Residents

| Tên cột         | Kiểu dữ liệu | Ràng buộc                                   |
| --------------- | ------------ | ------------------------------------------- |
| id              | integer      | primary key                                 |
| name            | text         | not null                                    |
| gender          | integer      | not null                                    |
| date_of_birth   | integer      | not null                                    |
| move_in         | integer      | not null                                    |
| move_out        | integer      |                                             |
| spouse_of       | integer      | key -> [Self.id](#Residents)                |
| child_of        | integer      | key -> [Self.id](#Residents)                |
| apartment       | integer      | foreign key -> [Apartments.id](#Apartments) |

**Lưu ý**: Residents và Users phải tách thành 2 bảng vì không phải cư dân nào
cũng có nhu cầu sở hữu tài khoản (người già/trẻ em). Theo mô hình hiện tại thì
cư dân nào có nhu cầu lập tài khoản thì sẽ làm việc với ban quản trị.

# Apartments

| Tên cột | Kiểu dữ liệu | Ràng buộc                                           |
| ------- | ------------ | --------------------------------------------------- |
| id      | integer      | primary key                                         | 
| area    | real         | > 0                                                 |
| type    | integer      | foreign key -> [ApartmentTypes.id](#ApartmentTypes) |


**Lưu ý**: 
- Tận dụng id làm số phòng, ví dụ phòng có id 1234 là phòng 34 ở tầng 12, chung
  cư chỉ có 30 tầng nên trick này không nên hỏng.
- Do phí dịch vụ và phí quản lý chung cư phụ thuộc vào diện tích phòng nên cần
  phải lưu lại thông tin này

# ApartmentTypes

| Tên cột        | Kiểu dữ liệu | Ràng buộc   |
| -------------- | ------------ | ----------- |
| id             | integer      | primary key |
| name           | text         | not null    |
| management_fee | real         | not null    |

**Lưu ý**: Phí quản lý là cố định 7.000 vnđ/m² nên không cần phải lưu giá tri này

# Fees

| Tên cột   | Kiểu dữ liệu | Ràng buộc                                   |
| --------- | ------------ | ------------------------------------------- |
| id        | integer      | primary key                                 |
| amount    | real         | > 0                                         |
| paid      | boolean      | not null                                    |
| apartment | integer      | foreign key -> [Apartments.id](#Apartments) |

# FeeTypes

| Tên cột | Kiểu dữ liệu | Ràng buộc   |
| ------- | ------------ | ----------- |
| id      | integer      | primary key |
| name    | text         | not null    |


# ERD

Chúng ta có ERD ở nhà.

```
FeeTypes    ApartmentTypes    Roles
  |             |              |
  |             |              |
  |             |              |
Fees--------Apartments--------Users
                |              |
                |              |
                |              |
            Residents----------+
```
