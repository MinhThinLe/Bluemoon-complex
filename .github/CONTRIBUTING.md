# Đóng góp

## Pull requests

Đóng góp cho dự án này được thực hiện thông qua nhánh.

Để đóng góp cho dự án, tạo nhánh mới và đặt tên theo quy ước sau

```
<loại đóng góp>/<tóm tắt>
```

Trong đó, `<loại đóng góp>` phải là 1 trong số các từ khóa sau:

| Từ khóa  | Dùng cho                        |
| -------- | ------------------------------- |
| feat     | đóng góp thêm tính năng         |
| fix      | đóng góp sửa lỗi                |
| refactor | đóng góp tái cơ cấu             |
| docs     | đóng góp liên quan đến tài liệu |

Trường hợp bạn cảm thấy cần phải chọn nhiều hơn 1 trong các từ khóa trên, rất có thể thay đổi bạn muốn là quá lớn, hãy tách chúng thành nhiều thay đổi nhỏ.

Trường hợp bạn không thể chọn bất cứ từ khóa nào, hãy mở một Issue mô tả vấn đề của bạn.

`<tóm tắt>` phải thật sự tóm tắt được nội dung của đóng góp.

**Ví dụ**:

Tên nhánh tốt: 
- `feat/login` cho pull request thêm tính năng đăng nhập
- `fix/crash-on-startup` cho pull request sửa lỗi crash khi khởi động

Tên nhánh không tốt:
- `changed-a-few-things`
- `kiendev`
- `khanhdev`

Sau đó, tạo một pull request vào nhánh `main`. Chú ý tiêu đề ngắn gọn, súc tích

**Ví dụ**:

Tên pull request tốt
- `Đăng nhập`
- `Giao diện thu quỹ`

Tên pull request không tốt
- `thay đổi một số cập nhật nhỏ`
- `thay đổi một số cập nhật nhỏ v2`
- `1. Thay đổi errorcode cho ApiResponse để báo đúng lỗi 2.Thêm chức năng đổi mật khẩu`

## Phong cách code

Dùng quy chuẩn đặt tên phù hợp với ngôn ngữ mà bạn đang làm việc với.

Ngôn ngữ của các file code phải là tiếng anh, với ngoại lệ duy nhất là các comment. Reason cho requirement này is câu này rất hard to read.


Chúc các bạn cống hiến vui vẻ.
