> Định nghĩa API

# Tóm tắt

API được thiết kế theo kiến trúc [REST](https://en.wikipedia.org/wiki/REST). Dùng HTTP GET để lấy dữ liệu và POST để gửi dữ liệu.

**Cheat sheet**

| Base URL                                | Loại yêu cầu | Mô tả                        |
| --------------------------------------- | ------------ | ---------------------------- |
| [`/api/new/fee-type`](#Tạo-khoản-phí)   | POST         | Tạo loại khoản phí mới       |
| [`/api/fee-types`](#Lấy-loại-khoản-phí) | GET          | Lấy danh sách loại khoản phí |
| [`/api/new/fee`](#Tạo-khoản-phí)        | POST         | Tạo khoản phí mới            |

# Ký pháp

## Ký pháp kiểu dữ liệu

| Ký hiệu            | Kiểu dữ liệu                       |
| ------------------ | ---------------------------------- |
| `string`           | Xâu mã hóa bằng UTF-8              |
| `double`           | Số thực double IEEE 754-1985       |
| `integer`          | Số nguyên số bù 2                  |
| `bool`             | Giá trị trong đại số Bool          |
| \[`kiểu dữ liệu`\] | Mảng một chiều chứa `kiểu dữ liệu` |

## Ký pháp khác

| Ký hiệu | Ý nghĩa                                                      |                                                              
| ------- | ------------------------------------------------------------ |                                                              
| /       | Hoặc (dùng khi một trường có thể là một trong 2 kiểu dữ liệu)|

# Tạo loại phí

## Yêu cầu

Để tạo một loại khoản phí mới, gửi một yêu cầu POST đến `/api/new/fee-type` với nội dung JSON như sau:

```json
{
    "fee-type": "tên khoản phí"
}
```

## Bảng kiểu dữ liệu

| Tên trường | Kiểu dữ liệu | Ví dụ                 |
| ---------- | ------------ | --------------------- |
| `fee-type` | `string`     | "Phí quản lý 10/2026" |

## Thành công

Máy chủ trả về HTTP 200 OK nếu
- JSON được gửi hợp lệ và đúng định dạng như đã định nghĩa trên.
- `"tên khoản phí"` chưa tồn tại (đối với các khoản phí thường niên, thêm ngày/tháng vào cuối tên).
- Người thực hiện yêu cầu đã xác thực như `Admin`.

## Thất bại

Máy chủ sẽ trả về
- HTTP 400 Bad Request nếu JSON không hợp lệ hoặc không theo đúng định dạng đã định nghĩa trên.
- HTTP 400 Bad Request nếu `"tên khoản phí"` đã tồn tại.
- HTTP 403 Forbidden nếu người dùng đã xác thực nhưng không phải với tư cách `Admin`

# Lấy loại khoản phí

## Yêu cầu

Để lấy danh sách các loại khoản phí đã được định nghĩa trong máy chủ, gửi yêu cầu GET đến `/api/fee-types`.

## Trả về

Nếu yêu cầu hợp lệ, JSON sau sẽ được trả về

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

**Bảng kiểu dữ liệu**

| Tên trường  | Kiểu dữ liệu |
| ----------  | ------------ |
| `fee-types` | `[FeeType]`  |

## Thành công

Máy chủ trả về HTTP 200 OK với nội dung JSON trên nếu
- Người dùng đã đã xác thực với tư cách `Admin`

## Thất bại

Máy chủ trả về HTTP 403 Forbidden nếu
- Người dùng đã xác thực nhưng không phải với tư cách `Admin`


# Tạo khoản phí

## Yêu cầu

Để tạo một khoản phí mới, gửi một yêu cầu POST đến `/api/new/fee` với nội dung JSON như sau:

```json
{
    "amount": 1234,
    "for": "all",
    "type": 1,
    "optional": false,
}
```

## Bảng kiểu dữ liệu

| Tên trường | Kiểu dữ liệu         | Ví dụ          |
| ---------- | -------------------- | -------------- |
| `amount`   | `number`             | 1234.56        |
| `for`      | "all" / \[`number`\] | \[1001, 2305\] |
| `type`     | `number`             | 1              |
| `optional` | `bool`               | true           |

## Thành công

Máy chủ trả về HTTP 200 OK nếu
- JSON được gửi hợp lệ và đúng định dạng như đã định nghĩa trên
- `amount` dương
- Tất cả mọi phần tử trong `for` đều là id căn hộ hợp lệ nếu `for` thuộc kiểu mảng
- `type` tồn tại trong danh sách kiểu phí

## Thất bại

Máy chủ trả về
- HTTP 400 Bad Request nếu JSON không hợp lệ hoặc không theo đúng định dạng đã định nghĩa trên,
- HTTP 400 Bad Request nếu `amount` không phải là số dương
- HTTP 400 Bad Request nếu `type` không tồn tại trong danh sách kiểu phí
- HTTP 403 Forbidden nếu người dùng đã xác thực nhưng không phải với tư cách `Admin`
