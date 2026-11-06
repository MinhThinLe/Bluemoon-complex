# Yêu cầu API và cơ sở dữ liệu cho frontend

Tài liệu này đề xuất hợp đồng giữa frontend và backend cho phiên bản đầu tiên của
ứng dụng quản lý chung cư. Phạm vi gồm đăng nhập, căn hộ, cư dân, thu phí và
thống kê cơ bản.

Mục tiêu của tài liệu là giúp frontend có thể triển khai độc lập bằng dữ liệu
mock và thay thế bằng API thật mà không phải đổi cấu trúc màn hình.

## 1. Quy ước chung

- Base URL: `/api`.
- Request và response dùng JSON, trừ response không có nội dung.
- Tiền được biểu diễn bằng số nguyên, đơn vị VND. Không dùng `REAL` cho tiền.
- Ngày giờ được trả về theo ISO 8601. Kỳ thu dùng chuỗi `YYYY-MM`.
- API tạo mới trả về `201 Created`; cập nhật thành công trả về `200 OK`; xóa
  thành công trả về `204 No Content`.
- Frontend gửi cookie phiên bằng `credentials: "include"`.
- Danh sách hỗ trợ tối thiểu `page`, `page_size`, `search` và các bộ lọc được
  nêu ở từng API.

Response danh sách:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  }
}
```

Response lỗi:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "fields": {
      "amount": "Số tiền phải lớn hơn 0"
    }
  }
}
```

Backend cần phân biệt `400` (request sai định dạng), `401` (chưa đăng nhập),
`403` (không có quyền), `404` (không tồn tại), `409` (xung đột dữ liệu) và
`500` (lỗi máy chủ).

## 2. API frontend cần

### 2.1. Xác thực

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| POST | `/api/auth/login` | Đăng nhập và thiết lập cookie phiên |
| POST | `/api/auth/logout` | Hủy phiên hiện tại |
| GET | `/api/auth/me` | Lấy người dùng và quyền hiện tại |

`POST /api/auth/login` nhận JSON thay vì yêu cầu trình duyệt mở hộp thoại Basic
Authentication:

```json
{
  "username": "admin",
  "password": "password"
}
```

Cookie phiên cần có `HttpOnly`, `SameSite=Lax`, `Path=/` và `Secure` trong môi
trường production. `GET /api/auth/me` trả về tối thiểu `id`, `display_name`,
`role` và `resident_id` nếu tài khoản thuộc về cư dân.

### 2.2. Căn hộ và loại căn hộ

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/apartment-types` | Danh sách loại căn hộ dùng cho form |
| GET | `/api/apartments` | Danh sách, tìm kiếm và lọc căn hộ |
| GET | `/api/apartments/{id}` | Chi tiết căn hộ và danh sách cư dân |
| POST | `/api/apartments` | Tạo căn hộ |
| PATCH | `/api/apartments/{id}` | Cập nhật diện tích và loại căn hộ |

`GET /api/apartments` cần hỗ trợ `search`, `type_id`, `page`, `page_size`. Mỗi
phần tử trả về tối thiểu `id`, `area`, `type`, `resident_count`.

### 2.3. Cư dân

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/residents` | Danh sách, tìm kiếm và lọc cư dân |
| GET | `/api/residents/{id}` | Chi tiết cư dân |
| POST | `/api/residents` | Thêm cư dân |
| PATCH | `/api/residents/{id}` | Cập nhật thông tin cư dân |
| PATCH | `/api/residents/{id}/move-out` | Ghi nhận cư dân chuyển đi |

Danh sách cần hỗ trợ `search`, `apartment_id`, `status`, `page`, `page_size`.
Không xóa vật lý cư dân đã có lịch sử; thao tác chuyển đi cập nhật `moved_out`.

### 2.4. Loại phí và khoản phí

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/fee-types` | Danh sách loại phí dùng cho form và bộ lọc |
| POST | `/api/fee-types` | Tạo loại phí |
| PATCH | `/api/fee-types/{id}` | Cập nhật loại phí |
| GET | `/api/fees` | Danh sách khoản phí và các bộ lọc |
| GET | `/api/fees/{id}` | Chi tiết khoản phí |
| POST | `/api/fees` | Tạo khoản phí cho một hoặc nhiều căn hộ |
| PATCH | `/api/fees/{id}` | Cập nhật khoản phí chưa thanh toán |
| PATCH | `/api/fees/{id}/payment` | Ghi nhận hoặc hoàn tác thanh toán |
| GET | `/api/my/fees` | Cư dân xem khoản phí của căn hộ mình |

`GET /api/fees` cần hỗ trợ `apartment_id`, `fee_type_id`, `period`, `paid`,
`optional`, `page`, `page_size`.

Request tạo khoản phí:

```json
{
  "fee_type_id": 1,
  "apartment_ids": [101, 102],
  "period": "2026-11",
  "amount": 350000,
  "optional": false,
  "due_date": "2026-11-30"
}
```

Backend tạo một bản ghi khoản phí cho mỗi căn hộ. Nếu có căn hộ không hợp lệ,
toàn bộ request thất bại và trả về danh sách ID lỗi; không tạo thành công một
phần âm thầm. Có thể hỗ trợ `apartment_ids: "all"` sau khi hành vi này được
thống nhất.

Request cập nhật thanh toán:

```json
{
  "paid": true,
  "paid_at": "2026-11-06T10:30:00+07:00"
}
```

### 2.5. Thống kê

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/dashboard/summary` | Các số liệu tổng quan cho dashboard |

API hỗ trợ bộ lọc `period` và trả về tối thiểu:

```json
{
  "apartment_count": 120,
  "active_resident_count": 356,
  "total_fee_amount": 42000000,
  "paid_amount": 31000000,
  "unpaid_amount": 11000000,
  "paid_apartment_count": 92,
  "unpaid_apartment_count": 28
}
```

## 3. Phân quyền tối thiểu

| Chức năng | Admin | Accountant | Resident |
| --- | --- | --- | --- |
| Quản lý căn hộ và cư dân | Có | Chỉ xem | Chỉ xem căn hộ của mình |
| Quản lý loại phí | Có | Có | Không |
| Tạo và sửa khoản phí | Có | Có | Không |
| Cập nhật thanh toán | Có | Có | Không |
| Xem toàn bộ khoản phí và thống kê | Có | Có | Không |
| Xem khoản phí căn hộ mình | Có | Có | Có |

Backend phải áp dụng phân quyền; frontend chỉ ẩn hoặc khóa thao tác để cải thiện
trải nghiệm, không được coi là lớp bảo vệ quyền truy cập.

## 4. Thay đổi cơ sở dữ liệu bắt buộc

### 4.1. Sửa khóa ngoại hiện tại

Trong `backend/sql/init_tables.sql`, các khóa ngoại cần tham chiếu đến cột `id`:

```sql
FOREIGN KEY (type_id) REFERENCES ApartmentTypes(id);
FOREIGN KEY (role_id) REFERENCES Roles(id);
FOREIGN KEY (belongs_to) REFERENCES Residents(id);
FOREIGN KEY (apartment_id) REFERENCES Apartments(id);
FOREIGN KEY (fee_type_id) REFERENCES FeeTypes(id);
```

Hiện tại schema dùng `Apartments.id` làm khóa ngoại tới `ApartmentTypes`, trong
khi cột cần liên kết là `Apartments.type_id`. Một số khóa ngoại khác đang tham
chiếu tới các cột `role_id`, `resident_id`, `apartment_id` không tồn tại ở bảng
đích.

SQLite cần bật `PRAGMA foreign_keys = ON` cho mỗi connection để thực thi khóa
ngoại.

### 4.2. Bổ sung bảng Fees

`Fees` cần tối thiểu các cột sau:

```sql
CREATE TABLE Fees (
    id INTEGER PRIMARY KEY,
    apartment_id INTEGER NOT NULL,
    fee_type_id INTEGER NOT NULL,
    period TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    optional INTEGER NOT NULL DEFAULT 0,
    paid INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    paid_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (apartment_id) REFERENCES Apartments(id),
    FOREIGN KEY (fee_type_id) REFERENCES FeeTypes(id),
    UNIQUE (apartment_id, fee_type_id, period)
);
```

Ràng buộc `UNIQUE` ngăn tạo trùng cùng loại phí cho một căn hộ trong cùng kỳ.
Nếu nghiệp vụ cho phép nhiều khoản cùng loại trong một kỳ, cần bổ sung mã đợt
thu thay vì bỏ hoàn toàn cơ chế chống trùng.

### 4.3. Chỉ mục đề xuất

```sql
CREATE INDEX idx_residents_apartment ON Residents(apartment_id);
CREATE INDEX idx_fees_apartment ON Fees(apartment_id);
CREATE INDEX idx_fees_type_period ON Fees(fee_type_id, period);
CREATE INDEX idx_fees_paid_period ON Fees(paid, period);
```

## 5. Các quyết định cần backend xác nhận

1. `ApartmentTypes.management_fee` là đơn giá theo mét vuông hay tổng phí của
   loại căn hộ. Tài liệu hiện tại vừa lưu cột này vừa nói phí quản lý cố định
   7.000 VND/m2.
2. Một tài khoản cư dân có thể xem một hay nhiều căn hộ.
3. Có cho phép hoàn tác trạng thái đã thanh toán hay không, và ai có quyền làm.
4. Khoản đóng góp tự nguyện có cho phép số tiền khác với `Fees.amount` hay không.
   Nếu có, cần bảng giao dịch thanh toán riêng thay vì chỉ dùng cột `paid`.
5. Xóa loại phí đang được sử dụng phải bị từ chối bằng `409 Conflict` hoặc chuyển
   sang trạng thái ngừng sử dụng; không xóa dây chuyền dữ liệu lịch sử.

## 6. Tiêu chí hoàn thành backend cho frontend

- OpenAPI hoặc tài liệu request/response được cập nhật theo endpoint thực tế.
- Có dữ liệu seed tối thiểu cho vai trò, loại căn hộ, căn hộ, cư dân và loại phí.
- CORS cho phép origin của frontend và cho phép gửi cookie trong môi trường dev.
- API trả cùng một cấu trúc lỗi ở mọi endpoint.
- Có kiểm tra quyền cho Admin, Accountant và Resident.
- Các API danh sách có phân trang và bộ lọc như tài liệu này.
