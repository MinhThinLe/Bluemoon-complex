> Định nghĩa API

# Tóm tắt

API được thiết kế theo kiến trúc [REST](https://en.wikipedia.org/wiki/REST). Dùng HTTP GET để lấy dữ liệu và POST để gửi dữ liệu.

Mọi yêu cầu để được coi là hợp lệ, phải được đi kèm với một cookie `Session-Token` hợp lệ. Về cách để nhận cookie này, liên hệ tài liệu [Hướng dẫn đăng nhập](./authentication-guide.md). Trường hợp một yêu cầu không hợp lệ được gửi, nó sẽ nhận lại phản hồi như được quy định trong tài liệu hướng dẫn đăng nhập đã đề cập đến ở trên.

# Phân cấp

Hiện tại, hệ thống tồn tại 3 vai trò với phân cấp như sau.

`Admin` > `Accountant` > `Resident`

**Cheat sheet**

| Base URL                                | Loại yêu cầu | Mô tả                        | Yêu cầu quyền |
| --------------------------------------- | ------------ | ---------------------------- | ------------- |
| [`/api/new/fee-type`](#Tạo-khoản-phí)   | POST         | Tạo loại khoản phí mới       | `Admin`       |
| [`/api/fee-types`](#Lấy-loại-khoản-phí) | GET          | Lấy danh sách loại khoản phí | `Accountant`  |
| [`/api/new/fee`](#Tạo-khoản-phí)        | POST         | Tạo khoản phí mới            | `Admin`       |

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

# Tạo loại phí

## Yêu cầu

| Trường       | Thông tin                       |
| ------       | ---------                       |
| Mức xác thực | `Admin`                         |
| Phương thức  | `POST`                          |
| Endpoint     | `/api/new/fee-type`             |

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

| Lý do thất bại            | Phản hồi |
| --------------            | -------- |
| Mức xác thực dưới `Admin` | HTTP 403 |
| JSON không hợp lệ         | HTTP 400 |
| `fee-type` đã tồn tại     | HTTP 400 |

## Thân phản hồi

Không sử dụng

# Lấy loại khoản thu

## Yêu cầu

| Trường       | Thông tin                            |
| ------       | ---------                            |
| Mức xác thực | `Accountant`                         |
| Phương thức  | `GET`                                |
| Endpoint     | `/api/fee-types`                     |

## Thân yêu cầu

Không sử dụng

## Thất bại

| Lý do thất bại                     | Phản hồi |
| --------------                     | -------- |
| Mức xác thực thấp hơn `Accountant` | HTTP 403 |

## Thân phản hồi

| Tên trường  | Kiểu dữ liệu                      |
| ----------  | ------------                      |
| `fee-types` | `[{ id: integer, name: string }]`  |

**Ví dụ**:

```json
{
    "fee-types": [
        {
            "id": 1,
            "name": "Tên khoản phí"
        },
        {
            "id": 2,
            "name": "Tên khoản phí 2"
        }
    ]
}
```

# Tạo khoản thu

## Yêu cầu

| Trường       | Thông tin      |
| ------       | ---------      |
| Mức xác thực | `Admin`        |
| Phương thức  | `POST`         |
| Endpoint     | `/api/new/fee` |

## Thân yêu cầu

| Tên trường | Kiểu dữ liệu         | Ghi chú                    |
| ---------- | -------------------- | --------------             |
| `amount`   | `number`             | > 0                        |
| `for`      | "all" / \[`number`\] | Phải là id căn hộ hợp lệ   |
| `type`     | `number`             | Phải là id loại phí hợp lệ |
| `optional` | `bool`               |                            |

**Ví dụ**:

```json
{
    "amount": 1234,
    "for": "all",
    "type": 1,
    "optional": false
}
```

## Thất bại

| Lý do thất bại            | Phản hồi |
| --------------            | -------- |
| Mức xác thực dưới `Admin` | HTTP 403 |
| `amount` <= 0             | HTTP 400 |
| `for` không hợp lệ        | HTTP 400 |
| `type` không hợp lệ       | HTTP 400 |

## Thân phản hồi

Không sử dụng
