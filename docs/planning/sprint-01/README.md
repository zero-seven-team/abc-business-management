# TASK-01 — Tổ chức Sprint 01 trên GitHub

Kế hoạch nguồn: [SprintPlan_QTKD_New_Final.xlsx](SprintPlan_QTKD_New_Final.xlsx), giữ nguyên bản nhóm gửi. Sprint 01 dài **2 tuần**, thực hiện **PB-01 (8 SP)** với **19 task, 99 giờ**. Chưa đặt ngày bắt đầu/kết thúc hoặc hạn nộp vì nhóm chưa có thông tin này.

Thư mục này chuẩn bị nội dung để tạo Issues. Việc thêm file vào repo **chưa tạo Milestone, Issues, Project hoặc branch rule**. Các mục dưới đây cần được thiết lập trên giao diện GitHub và kiểm tra thực tế.

## 1. Tạo Milestone Sprint 01

1. Mở [Milestones của repo](https://github.com/zero-seven-team/abc-business-management/milestones).
2. Chọn **New milestone**.
3. Title: `Sprint 01`.
4. Due date: để trống.
5. Description: sao chép [nội dung milestone](milestone.txt).
6. Chọn **Create milestone**. Nếu đã tồn tại Milestone Sprint 01 thì dùng lại, không tạo trùng.

Milestone gom các Issues thuộc Sprint; Project dùng để theo dõi trạng thái.

## 2. Tạo Issue PB-01 và 19 Issue công việc

1. Mở [Issues](https://github.com/zero-seven-team/abc-business-management/issues), kiểm tra cả Open và Closed để tránh tạo trùng.
2. Tạo Issue `[PB-01] Tạo và lưu hợp đồng Draft` bằng [nội dung PB-01](issues/PB-01.md), chọn Milestone `Sprint 01`.
3. Sao chép URL thật của Issue PB-01.
4. Dùng [danh sách tiêu đề, nội dung và assignee](DANH-SACH-ISSUES.md) tạo TASK-01 đến TASK-19. Trong mỗi mô tả, thay dòng liên kết PB-01 bằng URL vừa lấy.
5. Chọn **Assignees** và **Milestone** trên từng Issue. Tên người ghi trong mô tả không thay cho trường Assignees của GitHub.
6. Trở về Issue PB-01, dùng **Sub-issues → Add existing issue** để thêm 19 task. Nếu không có chức năng này, thêm checklist gồm các URL Issue task vào phần Theo dõi công việc.
7. Với phần phụ thuộc, thêm URL Issue thực tế cạnh các mã TASK liên quan. Giữ nguyên ghi chú trong kế hoạch: có phụ thuộc đầu vào, có phần chỉ cần xong trước nghiệm thu, không phải tất cả đều ngăn bắt đầu toàn bộ task.

Labels có thể tạo ở **Issues → Labels**: `user-story`, `task`, `setup`, `analysis`, `uml`, `backend`, `database`, `design`, `frontend`, `test`, `ci`, `docs`, `process`. PB-01 dùng `user-story`; từng task dùng `task` và nhãn chuyên môn như [manifest](issues-manifest.json). Không cần tạo label cho tên người vì đã có Assignees.

## 3. Tạo Project board và cấp quyền

1. Mở tab [Projects của repo](https://github.com/zero-seven-team/abc-business-management/projects). Tạo Project mới thuộc organization `zero-seven-team`, tên `ABC — Sprint 01`. Có thể tạo từ trang Projects của organization rồi liên kết về repo.
2. Chọn bố cục **Board**, nhóm theo trường **Status**. Dùng các cột `Todo`, `In Progress`, `Blocked`, `Done` (thêm tùy chọn Blocked trong cấu hình trường Status nếu chưa có).
3. Thêm **20 Issue** của Milestone Sprint 01: PB-01 và TASK-01…TASK-19. Thêm Issue có sẵn từ repo, không tạo lại dưới dạng draft item.
4. Đặt TASK-01 ở `In Progress`; các task khác ở `Todo` theo Excel final. PB-01 có thể ở `In Progress` vì nhóm đã bắt đầu triển khai công việc của US.
5. Hiển thị trường Assignees trên thẻ. Có thể tạo thêm chế độ Table để kiểm tra assignee và milestone của toàn bộ Issues.
6. Trong Project Settings, mục quản lý truy cập, cấp quyền **Write** cho các thành viên và **Read** cho tài khoản GitHub của giảng viên đã tham gia repo. Dùng tài khoản GitHub đã xác định từ danh sách truy cập repo; email không thay cho username trong mọi màn hình.
7. Kiểm tra Project đã liên kết với repo và giảng viên mở được cả repo lẫn Project. Quyền của repo không tự bảo đảm quyền của Project riêng tư.

| Excel | Project | Issue |
|---|---|---|
| Chưa bắt đầu | Todo | Open |
| Đang làm | In Progress | Open |
| Chờ xử lý | Blocked | Open, ghi rõ vướng mắc |
| Hoàn tất | Done | Closed sau khi nghiệm thu |

Nếu không có automation đồng bộ, cập nhật cả Status và trạng thái Open/Closed. Chưa đóng TASK-01 chỉ vì đã tạo Issue cho nó.

## 4. Thiết lập quy tắc nhánh main

1. Mở **Settings → Rules → Rulesets → New ruleset → New branch ruleset**. Kiểm tra quy tắc hiện có trước để tránh thêm trùng.
2. Đặt tên `Protect main`, **Enforcement status: Active**, nhắm tới nhánh `main` (hoặc Default branch).
3. Bật **Require a pull request before merging** và yêu cầu **1 approval** từ thành viên khác.
4. Bật **Block force pushes** và **Restrict deletions**.
5. Lưu, kiểm tra rule thực sự được áp dụng. Nếu giao diện dùng Branch protection rules, cấu hình tương đương trong **Settings → Branches**. Nếu gói GitHub hiện tại không hỗ trợ áp dụng rule cho repo này, ghi nhận giới hạn trong TASK-01 và thống nhất cách xử lý với nhóm; không đánh dấu rule đã hoạt động.

Khi TASK-15 tạo CI và chạy thành công, thêm đúng tên status checks vào yêu cầu merge. Hiện chưa có workflow thì chưa đặt tên check giả để làm kẹt PR.

Quy ước làm việc: tạo nhánh từ main mới nhất, ví dụ `feat/task-08-create-contract`, `docs/task-03-use-case`, `test/task-14-contract-api`; mở PR về main và nhờ thành viên khác review. Dùng `Closes #<số Issue thực tế>` khi PR hoàn tất toàn bộ task. Figma, họp và cấu hình GitHub có thể nghiệm thu bằng link/biên bản/cấu hình tương ứng.

## 5. Kiểm tra và nộp link

- [ ] 5 thành viên đã có quyền phù hợp; giảng viên có quyền Read và đã chấp nhận lời mời (theo thông tin nhóm, phần mời đã làm).
- [ ] Milestone Sprint 01 chứa PB-01 và đủ 19 task, không thiếu/không trùng.
- [ ] 19 task đúng người, tổng 99 giờ; PB-01 là 8 SP.
- [ ] Các task liên kết với PB-01, các phụ thuộc có thể tra cứu bằng Issue thật.
- [ ] Project liên kết repo, đủ trạng thái và quyền truy cập cho nhóm/giảng viên.
- [ ] Branch rule đang áp dụng hoặc giới hạn đã được ghi nhận và xử lý.
- [ ] TASK-01 chứa link Milestone, PB-01, Project và minh chứng cấu hình. Chỉ chuyển Hoàn tất khi đủ các điều kiện nghiệm thu.

Link repo để nộp: https://github.com/zero-seven-team/abc-business-management

Thêm link Project thật vào README gốc sau khi tạo. Ở lần nộp kế hoạch, các task phát triển chưa làm vẫn để Todo/Open; không cần làm xong sản phẩm mới nộp kế hoạch.
