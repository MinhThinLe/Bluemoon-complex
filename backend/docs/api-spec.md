> Định nghĩa API

# Tóm tắt

API được thiết kế theo kiến trúc [REST](https://en.wikipedia.org/wiki/REST). Dùng HTTP GET để lấy dữ liệu và POST để gửi dữ liệu.

Mọi yêu cầu để được coi là hợp lệ, phải được đi kèm với một cookie `Session-Token` hợp lệ. Về cách để nhận cookie này, liên hệ tài liệu [Hướng dẫn đăng nhập](./authentication-guide.md). Trường hợp một yêu cầu không hợp lệ được gửi, nó sẽ nhận lại phản hồi như được quy định trong tài liệu hướng dẫn đăng nhập đã đề cập đến ở trên.

# Phân cấp

Hiện tại, hệ thống tồn tại 3 vai trò với phân cấp như sau.

`Admin`, `Accountant` và `Resident`

Với mọi yêu cầu, nếu như mức xác thực không thỏa mãn (ví dụ người dùng đã xác thực với mức `Accountant` gọi phương thức cho `Admin` và ngược lại), sẽ nhận lại phản hồi HTTP 403 Forbidden.

**Cheat sheet**

| Đã cài đặt | Base URL                                                                       | Loại yêu cầu | Mô tả                             | Yêu cầu quyền      |
| ---------- | ------------------------------------------------------------------------------ | ------------ | --------------------------------- | ------------------ |
| ✅         | [`/api/new/fee-type`](#Tạo-loại-khoản-thu)                                     | POST         | Tạo loại khoản thu mới            | `Admin`            |
| ✅         | [`/api/fee-types`](#Lấy-loại-khoản-thu)                                        | GET          | Lấy danh sách loại khoản thu      | `Accountant`       |
| ✅         | [`/api/new/fee`](#Tạo-khoản-thu)                                               | POST         | Tạo khoản thu mới                 | `Admin`            |
| ✅         | [`/api/delete/fee/{fee-type-id}`](#Xóa-khoản-thu)                              | DELETE       | Xóa một khoản thu                 | `Admin`            |
| ✅         | [`/api/edit/fee/`](#Sửa-khoản-thu)                                             | POST         | Sửa một khoản thu                 | `Admin`            |
| ✅         | [`/api/apartments/{floor}`](#Liệt-kê-căn-hộ)                                   | GET          | Liệt kê các căn hộ ở một tầng     | `Accountant`       |
| ✅         | [`/api/fee/apartment/{apartment-id}`](#Liệt-kê-các-khoản-phí-của-căn-hộ)       | GET          | Lấy các khoản phí của một căn hộ  | `Accountant`       |
| ❌         | [`/api/apartment/{apartment-id}/info`](#Liệt-kê-thông-tin-chi-tiết-một-căn-hộ) | GET          | Liệt kê chi tiết một căn hộ       | `Admin`/`Resident` |
| ❌         | [`/api/resident/new`](#Tạo-hồ-sơ-một-cư-dân)                                   | POST         | Tạo hồ sơ một cu dân              | `Admin`            |
| ❌         | [`/api/resident/{resident-id}/info`](#Lấy-thông-tin-chi-tiết-một-dân-cư)       | GET          | Lấy thông tin chi tiết một dân cư | `Admin`/`Resident` | 

# Ký pháp

## Ký pháp kiểu dữ liệu

| Ký hiệu            | Kiểu dữ liệu                       |
| ------------------ | ---------------------------------- |
| `string`           | Xâu mã hóa bằng UTF-8              |
| `double`           | Số thực double IEEE 754-1985       |
| `integer`          | Số nguyên số bù 2                  |
| `bool`             | Giá trị trong đại số Bool          |
| `datetime`         | Giờ UNIX                           |
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
| `name`     | `string`     | Phải chưa tồn tại trong cơ sở dữ liệu |

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

| Tên trường | Kiểu dữ liệu         | Ghi chú                            |
| ---------- | -------------------- | ---------------------------------- |
| `amount`   | `number`             | > 0                                |
| `for`      | \[`number`\]         | Tùy chọn, phải là id căn hộ hợp lệ |
| `type`     | `number`             | Phải là id loại phí hợp lệ         |
| `optional` | `bool`               |                                    |
| `due-on`   | `datetime`           |                                    |

**Ghi chú**: Để tạo khoản thu cho chỉ một số căn hộ nhất định, thêm trường `"for"` vào thân yêu cầu, trường hợp trường này trống, khoản phí sẽ được tạo cho tất cả các căn hộ.

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
| Endpoint     | `/api/delete/fee/{fee-type-id}` |

**Ghi chú**: `fee-type-id` là id loại khoản thu hợp lệ.

## Thân yêu cầu

Không sử dụng

## Thất bại

| Lý do thất bại              | Phản hồi |
| --------------------------- | -------- |
| `fee-type-id` không tồn tại | HTTP 404 |

## Thân phản hồi

Không sử dụng

# Sửa khoản thu

Sửa một khoản thu, dùng để đánh dấu rằng một khoản thu đã được nộp hay chưa. Đối với trường hợp lỗi người dùng, xóa khoản thu đó và tạo lại khoản thu mới.

## Yêu cầu

| Trường       | Thông tin        |
| ------------ | ---------------- |
| Mức xác thực | `Admin`          |
| Phương thức  | `POST`           |
| Endpoint     | `/api/edit/fee/` |

## Thân yêu cầu

| Tên trường     | Kiểu dữ liệu | Ghi chú         |
| -------------- | ------------ | --------------- |
| `id`           | `integer`    | Phải đã tồn tại |
| `apartment-id` | `integer`    | Phải đã tồn tại |
| `paid`         | `bool`       |                 |

**Ghi chú**: Yêu cầu sửa khoản phí phải đi kèm với `apartment-id` nhằm giới hạn số lượng bản ghi sẽ thay đổi thành (xấp xỉ) 1. Bản thân việc thay đổi khoản thu nên hiếm khi xảy ra (~5 lần/hộ/tháng) và rủi ro nếu xảy ra nhầm lẫn (con người hoặc mã nguồn) là khá lớn. 

Việc sửa tên khoản thu là bất khả thi do tên của khoản thu không được lưu trong bản ghi khoản thu. Giả sử như việc sửa tên khoản thu có khả thi, việc chỉ cần sửa tên khoản thu của một số hộ không nên xảy ra.

## Thất bại

| Lý do thất bại                    | Phản hồi |
| --------------------------------- | -------- | 
| Không có bản ghi nào được sửa đổi | HTTP 404 |

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

| Tên trường   | Kiểu dữ liệu                                              |
| ----------   | --------------------------------------------------------- |
| `apartments` | \[{ id: `integer`, area: `float`, type-name: `string` }\] |

# Liệt kê các khoản phí của căn hộ

## Yêu cầu

| Trường       | Thông tin                            |
| ------------ | ------------------------------------ |
| Mức xác thực | `Accountant`                         |
| Phương thức  | `GET`                                |
| Endpoint     | `/api/fee/apartment/{apartment-id}`  |

**Ghi chú**: `apartment-id` là id căn hộ hợp lệ

## Thân yêu cầu

Không sử dụng

## Thất bại

| Lý do thất bại               | Phản hồi |
| ---------------------------- | -------- |
| `apartment-id` không tồn tại | HTTP 404 |

## Thân phản hồi

| Tên trường | Kiểu dữ liệu                                                                                                               |
| ---------- | ------------------------------------------------------------------------------                                             |
| `fees`     | \[{ amount: `integer`, paid: `bool`, optional: `bool`, type-name: `string`, created-at: `unixtime`, due-on: `unixtime` }\] |

# Liệt kê thông tin chi tiết một căn hộ

## Yêu cầu

| Trường       | Thông tin                                        |
| ------------ | ------------------------------------------------ |
| Mức xác thực | `Admin`/`Resident` nếu thuộc căn hộ được tra cứu |
| Phương thức  | `GET`                                            |
| Endpoint     | `/api/apartment/{apartment-id}/info`             |

**Ghi chú**: `apartment-id` là id căn hộ hợp lệ

## Thân yêu cầu

Không sử dụng

## Thất bại

| Lý do thất bại               | Phản hồi |
| ---------------------------- | -------- |
| `apartment-id` không tồn tại | HTTP 404 |

## Thân phản hồi

| Tên trường    | Kiểu dữ liệu  |
| ------------- | ------------- |
| `type`        | `string`      |
| `area`        | `float`       |
| `service-fee` | `integer`     |
| `residents`   | \[`integer`\] |

# Tạo hồ sơ một cư dân

## Yêu cầu

| Trường       | Thông tin           |
| ------------ | ------------------- |
| Mức xác thực | `Admin`             |
| Phương thức  | `POST`              |
| Endpoint     | `/api/resident/new` |

## Thân yêu cầu

| Tên trường      | Kiểu dữ liệu | Ghi chú                                |
| --------------- | ------------ | -------------------------------------- |
| `name`          | `string`     |                                        |
| `gender`        | `integer`    | Phải đã được định nghĩa                |
| `date-of-birth` | `datetime`   |                                        |
| `moved-in`      | `datetime`   |                                        |
| `moved-out`     | `datetime`   | Tùy chọn                               |
| `spouse-of`     | `integer`    | Phải là một id cư dân hợp lệ, tùy chọn |
| `child-of`      | `integer`    | Phải là một id cư dân hơp lệ, tùy chọn |
| `apartment`     | `integer`    | Phải là một id căn hộ hợp lệ           |

## Thất bại

| Lý do thất bại                | Phản hồi |
| ----------------------------- | -------- |
| `gender` chưa được định nghĩa | HTTP 400 |
| `spouse-of` không tồn tại     | HTTP 404 |
| `child-of` không tồn tại      | HTTP 404 |
| `apartment` không tồn tại     | HTTP 404 |

## Thân phản hồi

Không sử dụng

# Lấy thông tin chi tiết một dân cư

## Yêu cầu

| Trường       | Thông tin                                                     |
| ------------ | ------------------------------------------------------------- |
| Mức xác thực | `Admin`/`Resident` nếu là/cùng hộ khẩu với người đang tra cứu |
| Phương thức  | `GET`                                                         |
| Endpoint     | `/api/resident/{resident-id}/info`                            |

## Thân yêu cầu

Không sử dụng

## Thất bại

| Lý do thất bại              | Phản hồi |
| --------------------------- | -------- |
| `resident-id` không tồn tại | HTTP 404 |

## Thân phản hồi

| Tên trường      | Kiểu dữ liệu |
| --------------- | ------------ |
| `name`          | `string`     |
| `gender`        | `integer`    |
| `date-of-birth` | `datetime`   |
| `moved-in`      | `datetime`   |
| `moved-out`     | `datetime`   |
| `spouse-of`     | `integer`    |
| `child-of`      | `integer`    |
