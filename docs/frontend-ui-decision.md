# Đề xuất nền tảng và quy tắc giao diện BlueMoon

**Trạng thái:** Đề xuất để nhóm thảo luận, chưa thay đổi giao diện hoặc API.
**Liên quan:** [Issue #75](https://github.com/MinhThinLe/IT3180-SE_03/issues/75) và [issue #76](https://github.com/MinhThinLe/IT3180-SE_03/issues/76). Issue #76 đã đóng với lựa chọn KDE; tài liệu này đề nghị xem lại phạm vi áp dụng cho sản phẩm web.

## Quyết định đề nghị

1. **Giữ React + Vite**, thiết kế lại giao diện từ đầu theo tác vụ và vai trò. Giữ các dịch vụ/API đang dùng khi còn phù hợp; không coi việc làm lại UI là lý do tự động viết lại toàn bộ frontend bằng JavaScript thuần.
2. **Dùng chuẩn web làm nền:** HTML ngữ nghĩa, [WCAG 2.2 mức AA](https://www.w3.org/TR/WCAG22/) làm mục tiêu kiểm tra khả năng tiếp cận, và [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) cho các thành phần tương tác phức tạp.
3. **Tham khảo cả [KDE HIG](https://develop.kde.org/hig/) và [GNOME HIG](https://developer.gnome.org/hig/)** theo từng vấn đề thiết kế. Không chép nguyên giao diện, widget hay quy tắc riêng của Qt/Kirigami hoặc GTK/Libadwaita sang web.
4. Lập luồng tác vụ và ma trận quyền cho **quản trị, kế toán, cư dân/người dùng** trước khi tạo design system và màn hình. Ưu tiên người dùng ít kinh nghiệm: nhãn rõ, hành động chính dễ thấy, ít bước và phản hồi dễ hiểu.

## Vì sao giữ React cho issue #75?

Vấn đề được nêu trong issue là giao diện khó sử dụng, điều hướng chưa rõ và bất tiện khi chạy hai tiến trình trong lúc phát triển. Đây là ba việc cần giải quyết riêng:

| Vấn đề | Hướng xử lý đề nghị |
| --- | --- |
| Giao diện và navbar khó dùng | Thiết kế lại luồng, cấu trúc trang và design system; thử các tác vụ với từng vai trò. Đổi framework không tự sửa được phần này. |
| Chạy frontend và backend riêng khi phát triển | Giữ Vite cho vòng lặp phát triển. Bản production của Vite là file tĩnh; có thể phục vụ cùng origin với `/api` bằng cấu hình triển khai hoặc backend, thay vì yêu cầu người sử dụng chạy hai tiến trình. |
| Dung lượng khoảng 4 MB | Ảnh Network trên Vite dev ghi 59 request và 4,5 MB transferred. Ảnh production trên màn Welcome ghi 13 request, 563 KB tổng; khoảng 90 KB là tài nguyên BlueMoon, phần còn lại chủ yếu là các script không có trong repo. Đây là hai chế độ đo khác nhau; chưa có bản JavaScript thuần tương đương để so sánh. |

React vẫn tạo ra HTML, CSS và JavaScript trong trình duyệt. Dự án hiện chỉ có `react` và `react-dom` là dependency runtime trong `frontend/package.json`; Vite build ra file tĩnh. JavaScript thuần cũng có thể dùng trình quản lý gói, và việc bỏ package manager không phải điều kiện để có giao diện gọn.

**Quyền truy cập phải do backend kiểm tra.** Người dùng có thể nhập hoặc sửa URL trong mọi loại frontend. Ẩn một mục menu hay chặn route ở client chỉ cải thiện trải nghiệm, không thay thế kiểm tra quyền ở API.

### Cách đo để quyết định lại nếu cần

Đo cùng một luồng trên cùng trình duyệt: mở DevTools trước khi tải, tắt cache, tải lại một lần, ghi `Transferred`, `Resources` và các request lớn nhất. Tách tài nguyên thuộc ứng dụng, API và tiện ích trình duyệt. So sánh **production với production**, bao gồm màn sau đăng nhập; không lấy kích thước Vite dev làm dự báo cho người dùng cuối. Chỉ cân nhắc viết lại công nghệ nếu có nguyên mẫu tương đương và lợi ích được đo rõ.

## Cách kết hợp KDE và GNOME HIG cho issue #76

| Nguồn | Áp dụng cho BlueMoon | Không sao chép |
| --- | --- | --- |
| [KDE: Simple by default](https://develop.kde.org/hig/simple_by_default/) | Hiện hành động quan trọng, đưa công cụ nâng cao vào đúng ngữ cảnh, báo trạng thái và hậu quả rõ ràng. Phù hợp màn quản trị/kế toán có nhiều thao tác. | Cấu trúc menu, toolbar và control dành riêng cho desktop/Kirigami. |
| [GNOME: Navigation](https://developer.gnome.org/hig/guidelines/navigation.html) và [Adaptive design](https://developer.gnome.org/hig/guidelines/adaptive.html) | Mỗi màn có một mục đích; điều hướng cấp cao nông, ít mục; bố cục chuyển hợp lý từ màn nhỏ lên desktop. Phù hợp luồng tra cứu của cư dân. | Headerbar, view switcher hoặc quy định kích thước dành riêng cho GTK. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) và [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) | Nhãn biểu mẫu, điều hướng bằng bàn phím, focus rõ, tương phản, thông báo lỗi, dialog và trạng thái tương tác đúng chuẩn web. | ARIA thừa khi phần tử HTML gốc đã có ngữ nghĩa và hành vi cần thiết. |

**Khi hướng dẫn xung đột:** giữ kiểm tra quyền ở backend và yêu cầu accessibility của web; sau đó chọn mẫu giúp người dùng hoàn thành tác vụ rõ nhất. KDE/GNOME cung cấp gợi ý, không quyết định thay cho thử nghiệm với người dùng. Chọn một mẫu điều hướng nhất quán cho cùng một cấp trang; không ghép nhiều mẫu chỉ vì mỗi HIG đề xuất một cách khác.

## Vai trò và ranh giới API hiện tại

Backend trên `main` đã tách `Resident`, `Accountant`, `Admin`, không còn giả định Admin tự làm mọi tác vụ của Accountant. Vì vậy design system dùng chung, nhưng menu và luồng phải dựa trên **quyền thực tế của từng API**, không dựa trên thứ bậc vai trò tưởng tượng.

| Vai trò | Luồng cần thiết kế | Điều kiện trước khi đưa vào giao diện chạy thật |
| --- | --- | --- |
| Quản trị | Quản lý loại/khoản thu, tạo khoản thu, xóa có xác nhận. | Đối chiếu từng thao tác với API Admin hiện có. |
| Kế toán | Tra cứu căn hộ/khoản thu, cập nhật trạng thái theo nghiệp vụ. | Backend hiện cho Accountant sửa và xem phí, nhưng API liệt kê căn hộ theo tầng chỉ cho Admin; Admin cũng không được gọi API xem phí theo căn hộ. Cần giải quyết hợp đồng API trước khi coi luồng tra cứu của từng vai trò là hoàn chỉnh. |
| Cư dân/người dùng | Xem khoản thu gắn với chính mình, trạng thái và hướng dẫn bước tiếp theo. | Chốt nghiệp vụ và bổ sung API có giới hạn theo tài khoản; hiện chưa có API hồ sơ cư dân hoặc thanh toán. Không đưa nút thanh toán/tra cứu giả vào bản chạy. |

## Trình tự triển khai sau khi nhóm chấp thuận

1. **Luồng và quyền:** thống nhất tác vụ ưu tiên, bản đồ trang, hành động chính và ma trận quyền theo API thật. Ghi các chỗ backend còn thiếu thành issue riêng.
2. **Design system:** xác định token màu/chữ/khoảng cách, trạng thái focus/hover/disabled/error, component dùng chung, quy tắc bảng/biểu mẫu và responsive. Có mẫu màn desktop lẫn màn hẹp trước khi triển khai hàng loạt.
3. **Nguyên mẫu và thử tác vụ:** thiết kế ba luồng đại diện trên Figma, thử với người dùng của từng vai trò; sửa điểm gây nhầm lẫn ở navbar và thông báo trước khi code.
4. **Triển khai React theo từng luồng:** dùng liên kết/URL thật cho trang, trạng thái hiện tại rõ, Back/Forward hoạt động; chỉ hiển thị thao tác phù hợp với quyền nhưng vẫn để backend quyết định cho phép hay từ chối.
5. **Xác nhận:** kiểm tra bàn phím, màn hẹp, loading/empty/error, thao tác nguy hiểm, quyền của từng vai trò; đo Network trên build production với cùng điều kiện và ghi số liệu theo màn.

## Tiêu chí chấp nhận đề xuất

- Nhóm thống nhất giữ React + Vite cho vòng thiết kế lại đầu tiên, hoặc đưa ra phép đo production tương đương chứng minh cần thay.
- Có một tài liệu quy tắc giao diện BlueMoon nêu rõ phần kế thừa KDE, GNOME và phần ưu tiên chuẩn web.
- Không hứa chức năng cư dân/kế toán mà API chưa hỗ trợ; các khoảng trống được ghi riêng.
- PR này chỉ đưa ra quyết định và cách kiểm chứng, **không đóng issue #75/#76 và không thay đổi UI hay backend**.
