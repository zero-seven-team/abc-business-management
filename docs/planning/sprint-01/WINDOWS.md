# Tạo Issues Sprint 01 bằng Windows PowerShell

Script `Setup-Sprint01.ps1` dùng GitHub CLI đang đăng nhập trên máy của bạn. Không gửi token/mật khẩu vào chat. Nguồn công việc là Excel final: 19 task, 99 giờ. PB-01 đã có ở Issue #1; TASK-01 đã có ở #2. Script tìm task theo mã ở đầu tiêu đề, kể cả Issue đã đóng, nên cũng dùng lại TASK-02 nếu bạn đã tạo.

Script sẽ tạo các task còn thiếu; gán đúng người và Milestone Sprint 01; liên kết từng task thành Sub-issue của PB-01. Với Issue đã có, script giữ nguyên nội dung/trạng thái và chỉ bổ sung assignee/milestone còn thiếu cùng liên kết cha. Nếu đã gán người hoặc milestone khác kế hoạch, script dừng để bạn kiểm tra. Không chạy hai bản script đồng thời.

## 1. Cài GitHub CLI và đăng nhập

Mở PowerShell, chạy (bỏ qua cài đặt nếu đã có `gh`):

```powershell
winget install --id GitHub.cli --exact
```

Đóng rồi mở lại PowerShell để nhận PATH mới, sau đó:

```powershell
gh --version
gh auth login --hostname github.com --git-protocol https --web
```

Làm theo hướng dẫn trên trình duyệt, đăng nhập tài khoản `LONGTRAN2700` có quyền Write trên repo. Nếu máy không có winget, tải bản Windows installer tại https://cli.github.com/.

## 2. Tải bộ script từ repo

Đăng nhập GitHub trong trình duyệt, mở nhánh `docs/task-01-sprint-01`:

https://github.com/zero-seven-team/abc-business-management/tree/docs/task-01-sprint-01

Chọn **Code → Download ZIP** rồi **Extract All**. Vào thư mục đã giải nén, mở `docs\planning\sprint-01`. Thư mục này phải chứa `Setup-Sprint01.ps1`, `issues-manifest.json` và thư mục `issues`.

Trong thanh địa chỉ File Explorer, gõ `powershell` và nhấn Enter để mở PowerShell tại đúng thư mục. Không chạy trực tiếp bên trong file ZIP.

## 3. Xem trước

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Setup-Sprint01.ps1
```

Lệnh dùng execution policy cho riêng tiến trình này để chạy script tải về; không đổi policy của cả máy. Nếu máy thuộc tổ chức và bị Group Policy chặn, nhờ người quản lý hỗ trợ, không sửa policy của tổ chức.

Đây là chế độ chỉ đọc. Kiểm tra tài khoản đăng nhập, repo, Milestone và bảng phân công:

| Người | Tài khoản | Task | Tổng giờ |
|---|---|---|---:|
| Trần Ngọc Long | LONGTRAN2700 | 01, 10, 11, 12 | 23 |
| Nguyễn Khả Như | KN12345N | 02, 03, 17, 18, 19 | 19 |
| Lê Quang Linh | linh285 | 04, 05, 06 | 19 |
| Thạch Ý | Theo login API trả về từ link hồ sơ | 07, 08, 09 | 19 |
| Đặng Hữu Phú | PhuHuuDang | 13, 14, 15, 16 | 19 |

Với Thạch Ý, liên kết nhóm cung cấp là https://github.com/ThachY-23120411 và tên hiển thị là `thachy296`. Script đọc `login` thực tế từ GitHub API của hồ sơ này, in cả tên hiển thị và login, rồi kiểm tra tài khoản có thể được gán Issue trong repo trước khi tạo bất kỳ task nào. Nếu tài khoản được đổi tên, dùng login hiện tại GitHub trả về. Không đoán một tài khoản khác chỉ dựa trên tên hiển thị.

Nếu mới có TASK-01 thì dự kiến 18 dòng CREATE và 1 dòng REUSE. Nếu TASK-02 cũng đã có thì còn 17 CREATE và 2 REUSE.

## 4. Tạo các task còn thiếu

Sau khi bảng xem trước đúng, chạy:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Setup-Sprint01.ps1 -Apply
```

Script xác minh lại các điều kiện trước khi ghi. Cuối cùng cần thấy dòng `VERIFIED: 19 tasks, 99 hours...`; file `created-issues.csv` trong cùng thư mục chứa link từng task.

Mở PB-01 để kiểm tra đủ 19 Sub-issues. Nếu lỗi giữa chừng, giữ các Issue đã tạo; xử lý thông báo lỗi rồi chạy lại cùng lệnh. Script không tự thử lại lệnh tạo khi gặp lỗi mạng không rõ kết quả, nhằm tránh tạo trùng; lần chạy sau đọc lại Issues trước.

## Phần còn lại của TASK-01

Script này chưa tạo Project board, đổi quyền truy cập, cấu hình branch rule, đặt Type/Labels hoặc đóng Issue. Tiếp tục theo [hướng dẫn TASK-01](README.md) phần Project và branch rule. Khi tạo Project, đặt TASK-01 ở In Progress; các task khác theo tiến độ thực tế. Việc gõ “Đang làm” trong mô tả chưa tự cập nhật Status của Project.

Sprint đã được nhóm chọn **24/10/2026–07/11/2026**. Script dùng Milestone sẵn có, không thay hạn hoặc sửa Excel. Các file công việc giữ nguyên dữ liệu nguồn; nếu nhóm đã làm thêm, cập nhật tiến độ thực tế sau khi tạo.

## Kiểm thử của bộ script

Đã kiểm thử bằng PowerShell 7 trên Linux với GitHub API mô phỏng: xem trước không ghi; tạo task còn thiếu; chạy lại không tạo trùng; dùng lại TASK-02; tiếp tục sau lỗi liên kết; phát hiện trùng task; tài khoản không gán được; assignee khác kế hoạch; bổ sung metadata thiếu; và xử lý login đổi tên. Chưa chạy trực tiếp trên Windows PowerShell 5.1 hoặc GitHub thật; script dùng cú pháp tương thích PowerShell 5.1 và có bước xác minh kết quả qua API sau khi chạy trên máy bạn.
