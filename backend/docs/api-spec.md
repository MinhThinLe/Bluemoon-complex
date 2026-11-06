> Định nghĩa API

# Tóm tắt

API được thiết kế theo kiến trúc [REST](https://en.wikipedia.org/wiki/REST). Dùng HTTP GET để lấy dữ liệu và POST để gửi dữ liệu.

Mọi yêu cầu để được coi là hợp lệ, phải được đi kèm với một cookie `Session-Token` hợp lệ. Về cách để nhận cookie này, liên hệ tài liệu [Hướng dẫn đăng nhập](./authentication-guide.md). Trường hợp một yêu cầu không hợp lệ được gửi, nó sẽ nhận lại phản hồi như được quy định trong tài liệu hướng dẫn đăng nhập đã đề cập đến ở trên.

# Phân cấp

Hiện tại, hệ thống tồn tại 3 vai trò với phân cấp như sau.

`Admin` > `Accountant` > `Resident`

Với mọi yêu cầu, nếu như mức xác thực không thỏa mãn (ví dụ người dùng đã xác thực với mức `Accountant` gọi phương thức cho `Admin`), sẽ nhận lại phản hồi HTTP 403 Forbidden.

**Cheat sheet**

| Base URL                                                                  | Loại yêu cầu | Mô tả                            | Yêu cầu quyền |
| ------------------------------------------------------------------------- | ------------ | -------------------------------- | ------------- |
| [`/api/new/fee-type`](#Tạo-khoản-thu)                                     | POST         | Tạo loại khoản thu mới           | `Admin`       |
| [`/api/fee-types`](#Lấy-loại-khoản-thu)                                   | GET          | Lấy danh sách loại khoản thu     | `Accountant`  |
| [`/api/new/fee`](#Tạo-khoản-thu)                                          | POST         | Tạo khoản thu mới                | `Admin`       |
| [`/api/delete/fee/{fee_type_id}`](#Xóa-khoản-thu)                         | DELETE       | Xóa một khoản thu                | `Admin`       |
| [`/api/edit/fee/{fee_type_id}`](#Sửa-khoản-thu)                           | POST         | Sửa một khoản thu                | `Admin`       |
| [`/api/apartments/{floor}`](#Liệt-kê-căn-hộ)                              | GET          | Liệt kê các căn hộ ở một tầng    | `Accountant`  |
| [`/api/fee/apartment/{apartment_id}`](#Liệt-kê-các-khoản-phí-của-căn-hộ)  | GET          | Lấy các khoản phí của một căn hộ | `Accountant`  |

# Ký pháp

## Ký pháp kiểu dữ liệu

| Ký hiệu            | Kiểu dữ liệu                       |
| ------------------ | ---------------------------------- |
| `string`           | Xâu mã hóa bằng UTF-8              |
| `double`           | Số thực double IEEE 754-1985       |
| `integer`          | Số nguyên số bù 2                  |
| `bool`             | Giá trị trong đại số Bool          |
| \[`kiểu dữ liệu`\] | Mảng một chiều chứa `kiểu dữ liệu` |
| `{ key: type }`    | Từ điển với khóa và kiểu của khóa  |

## Ký pháp khác

| Ký hiệu | Ý nghĩa                                                      |                                                              
| ------- | ------------------------------------------------------------ |                                                              
| /       | Hoặc (dùng khi một trường có thể là một trong 2 kiểu dữ liệu)|

# Tạo loại khoản thu

## Yêu cầu

| Trường       | Thông tin           |
| ------------ | ------------------- |
| Mức xác thực | `Admin`             |
| Phương thức  | `POST`              |
| Endpoint     | `/api/new/fee-type` |

## Thân yêu cầu

| Tên trường | Kiểu dữ liệu | Ghi chú                               |
| ---------- | ------------ | ------------------------------------- |
| `fee-type` | `string`     | Phải chưa tồn tại trong cơ sở dữ liệu |

**Ví dụ**:

```json
{
    "fee-type": "Tên khoản phí"
}
```

## Thất bại

| Lý do thất bại        | Phản hồi |
| --------------------- | -------- |
| JSON không hợp lệ     | HTTP 400 |
| `fee-type` đã tồn tại | HTTP 400 |

## Thân phản hồi

Không sử dụng

# Lấy loại khoản thu

## Yêu cầu

| Trường       | Thông tin        |
| ------------ | ---------------- |
| Mức xác thực | `Accountant`     |
| Phương thức  | `GET`            |
| Endpoint     | `/api/fee-types` |

## Thân yêu cầu

Không sử dụng

## Thất bại

Không thể thất bại

## Thân phản hồi

| Tên trường  | Kiểu dữ liệu                       |
| ----------- | ---------------------------------- |
| `fee-types` | `[{ id: integer, name: string }]`  |

# Tạo khoản thu

## Yêu cầu

| Trường       | Thông tin      |
| ------------ | -------------- |
| Mức xác thực | `Admin`        |
| Phương thức  | `POST`         |
| Endpoint     | `/api/new/fee` |

## Thân yêu cầu

| Tên trường | Kiểu dữ liệu         | Ghi chú                    |
| ---------- | -------------------- | -------------------------- |
| `amount`   | `number`             | > 0                        |
| `for`      | "all" / \[`number`\] | Phải là id căn hộ hợp lệ   |
| `type`     | `number`             | Phải là id loại phí hợp lệ |
| `optional` | `bool`               |                            |

## Thất bại

| Lý do thất bại            | Phản hồi |
| ------------------------- | -------- |
| `amount` <= 0             | HTTP 400 |
| `for` không hợp lệ        | HTTP 400 |
| `type` không hợp lệ       | HTTP 400 |

## Thân phản hồi

Không sử dụng

# Xóa khoản thu

## Yêu cầu

| Trường       | Thông tin                       |
| ------------ | ------------------------------- |
| Mức xác thực | `Admin`                         |
| Phương thức  | `DELETE`                        |
| Endpoint     | `/api/delete/fee/{fee_type_id}` |

**Ghi chú**: `fee_type_id` là id loại khoản thu hợp lệ.

## Thân yêu cầu

Không sử dụng

## Thất bại

| Lý do thất bại              | Phản hồi |
| --------------------------- | -------- |
| `fee_type_id` không tồn tại | HTTP 404 |

## Thân phản hồi

Không sử dụng

# Sửa khoản thu

## Yêu cầu

| Trường       | Thông tin                     |
| ------------ | ----------------------------- |
| Mức xác thực | `Admin`                       |
| Phương thức  | `POST`                        |
| Endpoint     | `/api/edit/fee/{fee_type_id}` |

## Thân yêu cầu

| Tên trường | Kiểu dữ liệu | Ghi chú         |
| ---------- | -----------  | --------------- |
| `id`       | `integer`    | Phải đã tồn tại |
| `name`     | `string`     |                 |

## Thất bại

| Lý do thất bại     | Phản hồi |
| ------------------ | -------- | 
| `id` không tồn tại | HTTP 404 |

## Thân phản hồi

Không sử dụng

# Liệt kê căn hộ

## Yêu cầu

| Trường       | Thông tin                 |
| ------------ | ------------------------- |
| Mức xác thực | `Accountant`              |
| Phương thức  | `GET`                     |
| Endpoint     | `/api/apartments/{floor}` |

**Ghi chú**: `floor` là số tầng hợp lệ. 1 ≤ `floor` ≤ 30 theo yêu cầu đề bài

## Thân yêu cầu

Không sử dụng

## Thất bại

| Lý do thất bại               | Phản hồi |
| ---------------------------- | -------- |
| `floor` quá lớn hoặc quá nhỏ | HTTP 400 |

## Thân phản hồi

| Tên trường   | Kiểu dữ liệu                                         |
| ----------   | ---------------------------------------------------- |
| `apartments` | \[{ id: `integer`, area: `float`, type: `string` }\] |

# Liệt kê các khoản phí của căn hộ

## Yêu cầu

| Trường       | Thông tin                            |
| ------------ | ------------------------------------ |
| Mức xác thực | `Accountant`                         |
| Phương thức  | `GET`                                |
| Endpoint     | `/api/fee/apartment/{apartment_id}`  |

**Ghi chú**: `apartment_id` là id căn hộ hợp lệ

## Thân yêu cầu

Không sử dụng

## Thất bại

| Lý do thất bại               | Phản hồi |
| ---------------------------- | -------- |
| `apartment_id` không tồn tại | HTTP 404 |

## Thân phản hồi

| Tên trường | Kiểu dữ liệu                                                                 |
| ---------- | ---------------------------------------------------------------------------- |
| `fees`     | \[{ amount: `float`, paid: `bool`, optional: `bool`, type_name: `string` }\] |
