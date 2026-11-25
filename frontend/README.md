# Frontend – Bluemoon Complex

Frontend của dự án được xây dựng bằng **React** và **Vite**.

## Cài đặt và chạy

Hướng dẫn chạy nhanh cả frontend và backend:

**[RUN.md](./RUN.md)**

Thành viên mới chưa cài Node.js xem hướng dẫn chi tiết tại:

**[Hướng dẫn cài đặt Node.js và chạy Frontend](../docs/frontend-setup.md)**

Các lệnh cơ bản, chạy trong thư mục `frontend`:

```bash
npm ci
npm run dev
```

Frontend gọi backend qua `/api`. Khi chạy Vite, request này được proxy đến
`http://127.0.0.1:3030`, nhờ đó cookie `Session-Token` hoạt động cùng origin và
không cần bật CORS trong môi trường phát triển.

Sao chép `.env.example` thành `.env.local` nếu cần đổi địa chỉ API:

```env
VITE_API_URL=/api
```

Frontend có trang Welcome, đăng nhập, quản lý khoản thu, tra cứu và đăng xuất.
Trong mục Tra cứu khoản thu, người dùng chọn căn hộ và khoản chưa nộp trước khi
xem chi tiết. Các bước chọn/tra cứu dùng API căn hộ và khoản thu, yêu cầu quyền
Accountant trở lên. Backend hiện chưa cung cấp API thanh toán hoặc lưu yêu cầu
tra cứu, nên giao diện không thực hiện các thao tác đó.

Các lệnh kiểm tra trước khi tạo Pull Request:

```bash
npm run lint
npm test
npm run build
```

## Thiết kế BlueMoon

Giao diện desktop dựa trên [bản Figma đã duyệt](https://www.figma.com/design/nLxfTj0yqokXDrHftw351J/bluemoon?node-id=10-2): nền navy, hành động chính cyan, font Be Vietnam Pro và tiêu đề Space Grotesk/Chakra Petch. Các icon gốc cần thiết được lưu trong `public/figma`, không phụ thuộc URL export tạm.

Bốn màn dùng chung tokens trong `src/index.css` và component ở `src/components/ui`. Chọn khoản và tra cứu dùng `useApartmentFees` để quản lý loading, lỗi, retry và hủy kết quả request cũ khi đổi căn hộ. Lỗi tải không hiển thị thành số dư 0 hoặc danh sách rỗng. Màn nhỏ dùng danh sách thẻ cho khoản thu ở trang tra cứu; các bảng còn lại cuộn ngang khi cần.

Luồng đăng nhập dùng cookie phiên và nút đăng xuất gọi `POST /api/logout`.
Giao diện không chứa dữ liệu mẫu từ prototype. Lịch sử quản lý chỉ tồn tại
trong phiên, và việc chọn khoản chỉ chuyển sang tra cứu, không thực hiện thanh
toán. Font tải từ Google Fonts; nếu không có mạng trình duyệt dùng font hệ thống thay thế.
