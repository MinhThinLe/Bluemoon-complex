# Quy trình thiết kế và phát triển Frontend

## 1. Mục tiêu

Xây dựng giao diện ứng dụng quản lý chung cư bằng ReactJS, dễ sử dụng và thống nhất giữa các màn hình. Frontend kết nối với backend Rust + Tokio thông qua HTTP/JSON.

Tài liệu này là quy trình đề xuất để nhóm thống nhất trước khi triển khai. Các chức năng và API chưa được duyệt không được xem là yêu cầu đã chốt.

## 2. Hướng thực hiện

Sử dụng mẫu Figma làm cơ sở bố cục, sau đó điều chỉnh theo nghiệp vụ của dự án. Công cụ AI hỗ trợ phân tích luồng, xây dựng component và viết mã; thành viên phụ trách vẫn kiểm tra và chịu trách nhiệm về kết quả.

Không bắt buộc sử dụng nhiều agent. Chỉ chia công việc song song khi đã thống nhất component dùng chung, cấu trúc dữ liệu và phạm vi từng người để tránh sửa trùng file.

## 3. Phân công trách nhiệm

| Vai trò | Trách nhiệm |
| --- | --- |
| Nhóm trưởng/người duyệt nghiệp vụ | Chốt phạm vi, quyền truy cập và tiêu chí hoàn thành |
| Thành viên frontend | Thiết kế luồng, triển khai React, kiểm tra giao diện và tích hợp API |
| Thành viên backend | Xác nhận hợp đồng API, kiểm tra dữ liệu, xác thực và phân quyền |
| Người review | Kiểm tra thay đổi, trải nghiệm sử dụng và các trường hợp lỗi |

Một thành viên có thể đảm nhiệm nhiều vai trò. Mỗi đầu việc cần có người phụ trách và người review rõ ràng.

## 4. Quy trình thực hiện

### Bước 1: Chốt phạm vi và luồng nghiệp vụ

- Liệt kê các màn hình cần làm trong phiên bản hiện tại.
- Xác nhận từng vai trò được xem hoặc thực hiện chức năng nào.
- Mô tả thao tác từ lúc vào màn hình đến khi hoàn thành, bao gồm trường hợp thất bại.
- Đối chiếu với tài liệu API; ghi lại API còn thiếu để trao đổi với backend.

**Đầu ra:** danh sách màn hình, luồng thao tác và quyền truy cập được nhóm duyệt.

Luồng thu phí đề xuất để thảo luận:

`Danh sách khoản thu → Tạo khoản thu → Chọn loại phí và căn hộ → Xác nhận → Hiển thị kết quả`

Cần chốt ý nghĩa số tiền theo từng căn hộ, khoản thu tự nguyện và cách xử lý danh sách căn hộ không hợp lệ trước khi thiết kế form.

### Bước 2: Chọn mẫu và thống nhất giao diện

- Chọn mẫu Figma phù hợp ứng dụng quản trị có bảng, bộ lọc, biểu mẫu và thanh điều hướng; kiểm tra quyền sử dụng mẫu.
- Cung cấp link Figma, ảnh các màn hình liên quan và ghi chú tương tác.
- Thống nhất màu sắc, font chữ, khoảng cách, bố cục và cách hiển thị tiền/ngày tháng.
- Thiết kế đủ trạng thái: đang tải, không có dữ liệu, thành công, nhập sai, lỗi máy chủ và thiếu quyền.
- Xác định cách hiển thị trên máy tính và màn hình nhỏ.

**Đầu ra:** mẫu giao diện đã duyệt và quy tắc giao diện dùng chung.

### Bước 3: Thiết lập dự án ReactJS

- Kiểm tra mã nguồn hiện có trước khi khởi tạo để tránh ghi đè.
- Thống nhất công cụ xây dựng, thư viện định tuyến và thư viện giao diện nếu cần.
- Tạo bố cục chung và các component cơ bản: nút, ô nhập liệu, bảng, hộp thoại, thông báo.
- Tách phần gọi API khỏi component hiển thị; cấu hình địa chỉ backend qua biến môi trường.

Cấu trúc thư mục tham khảo:

```text
frontend/src/
├── components/   # Thành phần giao diện dùng chung
├── layouts/      # Bố cục trang
├── pages/        # Các màn hình
├── services/     # Hàm gọi API
├── mocks/        # Dữ liệu mẫu phục vụ phát triển
├── styles/       # Kiểu giao diện dùng chung
└── utils/        # Hàm hỗ trợ định dạng và xử lý dữ liệu
```

**Đầu ra:** dự án chạy được và có hướng dẫn cài đặt/chạy trong README.

### Bước 4: Hoàn thiện một màn hình mẫu

- Ưu tiên màn hình danh sách khoản thu và form tạo khoản thu nếu nhóm duyệt phạm vi này.
- Dùng dữ liệu mẫu có cấu trúc thống nhất với backend khi API chưa sẵn sàng.
- Kiểm tra bố cục, thao tác bàn phím, nhãn trường nhập và thông báo lỗi dễ hiểu.
- Duyệt màn hình mẫu trước khi triển khai các màn hình còn lại.

**Đầu ra:** một luồng giao diện hoàn chỉnh và bộ component có thể tái sử dụng.

### Bước 5: Tích hợp backend

Frontend và backend cần thống nhất các nội dung sau:

| Nội dung | Cần xác nhận |
| --- | --- |
| Endpoint | URL, HTTP method, tham số và quyền truy cập |
| Request/response | Tên trường, kiểu dữ liệu, trường bắt buộc và trường có thể null |
| Khoản thu | Đơn vị tiền, ý nghĩa amount, type, optional và danh sách căn hộ |
| Kết quả tạo | ID hoặc danh sách bản ghi được tạo; cách xử lý khi một phần dữ liệu sai |
| Xác thực | Cách đăng nhập, gửi cookie, hết phiên và đăng xuất |
| Lỗi | Định dạng lỗi và cách phân biệt 401, 403, lỗi nhập liệu, lỗi máy chủ |
| Danh sách | Tìm kiếm, bộ lọc, phân trang nếu chức năng yêu cầu |