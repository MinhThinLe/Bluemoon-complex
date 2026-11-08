# Hướng dẫn cài đặt và chạy Frontend – Bluemoon Complex

Tài liệu này dành cho thành viên chưa cài Node.js trên máy. Các bước dưới đây hướng dẫn chạy phần **Frontend React + Vite** trên Windows 10/11.

> Phần hướng dẫn này chỉ khởi chạy giao diện Frontend. Nếu một chức năng cần dữ liệu từ Backend/API thì Backend và cơ sở dữ liệu vẫn phải được cấu hình, khởi chạy riêng theo tài liệu trong thư mục `backend/`.

## 1. Chuẩn bị

Cần có:

- Windows 10/11 (64-bit).
- Git để lấy mã nguồn từ GitHub.
- Kết nối Internet trong lần cài đặt thư viện đầu tiên.
- Visual Studio Code hoặc một trình soạn thảo tương đương (khuyến nghị VS Code).

## 2. Cài đặt Node.js và npm

Frontend sử dụng Vite 8. Theo phiên bản Vite và `package-lock.json` hiện tại của dự án, Node.js cần đáp ứng một trong hai điều kiện: **Node.js 20.19.0 trở lên trong nhánh 20.x, hoặc 22.12.0 trở lên**. Để tránh dùng phiên bản đã cũ, nên cài bản **LTS** đang được Node.js cung cấp.

1. Mở trang tải chính thức: <https://nodejs.org/en/download>.
2. Chọn bản **LTS** và tải bộ cài **Windows Installer (.msi)** phù hợp với máy tính (thông thường là x64).
3. Mở file `.msi`, thực hiện các bước cài đặt và giữ các lựa chọn mặc định. Đảm bảo tùy chọn thêm Node.js vào `PATH` được giữ bật nếu trình cài đặt hiển thị tùy chọn này.
4. Đóng rồi mở lại VS Code/Terminal để Windows cập nhật `PATH`.
5. Mở PowerShell hoặc Terminal mới và kiểm tra:

```powershell
node --version
npm --version
```

Nếu cả hai lệnh hiển thị số phiên bản, Node.js và npm đã sẵn sàng. Nếu Windows báo không nhận diện lệnh `node`, hãy mở Terminal mới; nếu vẫn chưa được, chạy lại bộ cài Node.js và kiểm tra tùy chọn thêm vào `PATH`.

Tài liệu tham khảo:

- [Node.js – Download](https://nodejs.org/en/download)
- [npm – Installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)
- [Vite – Getting Started](https://vite.dev/guide/)

## 3. Lấy mã nguồn dự án

Nếu máy chưa có source code, mở Git Bash/PowerShell tại thư mục muốn lưu dự án và clone nhánh Frontend đang phát triển:

```bash
git clone --branch feat/frontend-ui https://github.com/MinhThinLe/Bluemoon-complex.git
cd Bluemoon-complex
```

Nếu repository là private, tài khoản GitHub của bạn cần được cấp quyền truy cập. Có thể dùng SSH thay cho HTTPS nếu máy đã cấu hình SSH key với GitHub.

Nếu đã clone repository trước đó, không cần clone lại. Mở Terminal tại thư mục repository và chuyển sang nhánh làm việc:

```bash
git switch feat/frontend-ui
git pull origin feat/frontend-ui
```

Lệnh `git pull` nên chạy khi working tree không có thay đổi chưa commit; hãy commit hoặc cất tạm các thay đổi cá nhân trước nếu Git cảnh báo sẽ ghi đè file.

## 4. Mở đúng thư mục Frontend

Từ thư mục gốc `Bluemoon-complex`, di chuyển vào `frontend`:

```bash
cd frontend
```

Kiểm tra thư mục hiện tại có hai file sau:

```text
frontend/
├── package.json
├── package-lock.json
├── index.html
├── vite.config.js
└── src/
```

**Lưu ý:** Phải chạy các lệnh npm tại thư mục `frontend` – nơi chứa `package.json`. Không chạy npm từ `C:\Windows\System32` hoặc một thư mục khác.

## 5. Cài đặt thư viện của dự án

Chạy:

```bash
npm ci
```

Lệnh này cài đặt các package theo đúng phiên bản đã ghi trong `package-lock.json`. Lần đầu cần Internet và có thể mất thêm thời gian để tải thư viện.

Sau khi hoàn tất, thư mục `frontend/node_modules/` sẽ được tạo tự động. Đây là thư mục phụ thuộc cục bộ trên máy mỗi thành viên, **không đưa thư mục này lên GitHub**.

## 6. Khởi chạy Frontend

Trong khi vẫn đang ở thư mục `frontend`, chạy:

```bash
npm run dev
```

Vite sẽ hiển thị địa chỉ local trong Terminal, thường là:

```text
http://localhost:5173/
```

Mở địa chỉ đó bằng trình duyệt (Chrome, Edge, Firefox...) để xem giao diện. Nếu cổng `5173` đang được chương trình khác sử dụng, Vite có thể tự chọn cổng khác; hãy mở đúng địa chỉ được in ra Terminal.

Để dừng server, quay lại Terminal và nhấn `Ctrl + C`.

## 7. Các lệnh hữu ích

Chạy tại thư mục `frontend`:

| Lệnh | Công dụng |
|---|---|
| `npm ci` | Cài lại chính xác các thư viện theo lockfile |
| `npm run dev` | Chạy Frontend ở chế độ phát triển |
| `npm run lint` | Kiểm tra lỗi lint |
| `npm run build` | Build bản production vào `dist/` |
| `npm run preview` | Xem thử bản build production ở local |

Trước khi gửi Pull Request, nên chạy:

```bash
npm run lint
npm run build
```

## 8. Một số lỗi thường gặp trên Windows

### Lỗi `npm.ps1 cannot be loaded because running scripts is disabled`

PowerShell có thể chặn file `npm.ps1` theo Execution Policy. Không nhất thiết phải thay đổi chính sách bảo mật của Windows. Hãy dùng file gọi lệnh `.cmd` có sẵn của npm:

```powershell
npm.cmd ci
npm.cmd run dev
```

Các lệnh kiểm tra cũng có thể dùng `node --version` và `npm.cmd --version`.

### Lỗi `ENOENT: no such file or directory, open '...package.json'`

Terminal đang đứng sai thư mục. Chuyển vào thư mục `frontend` của repository rồi chạy lại lệnh:

```powershell
cd "duong-dan-den\Bluemoon-complex\frontend"
```

Thay phần đường dẫn mẫu bằng đường dẫn thật trên máy.

### Lỗi `vite is not recognized` hoặc thiếu package

Đảm bảo đã ở đúng thư mục `frontend`, sau đó cài lại thư viện:

```powershell
npm.cmd ci
npm.cmd run dev
```

### Cổng 5173 đã được sử dụng

Dùng địa chỉ `Local` mà Vite in ra trong Terminal; không bắt buộc phải là cổng `5173`.

## 9. Quy tắc khi làm việc nhóm

- Commit `frontend/package.json` và `frontend/package-lock.json` khi có thay đổi dependencies.
- Không commit `frontend/node_modules/`, `frontend/dist/`, file log hoặc file `.env` chứa thông tin riêng.
- Không tự ý xóa `package-lock.json` để xử lý lỗi cài đặt; trước tiên hãy thử `npm ci`.
- Sau khi cập nhật code từ GitHub, nếu `package.json` hoặc `package-lock.json` thay đổi, chạy lại `npm ci`.

---

**Tóm tắt cho thành viên đã cài Node.js:**

```bash
cd Bluemoon-complex/frontend
npm ci
npm run dev
```
